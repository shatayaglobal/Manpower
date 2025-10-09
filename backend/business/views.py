from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.openapi import OpenApiResponse
from django.core.mail import send_mail
from django.conf import settings

from .models import Business, ContactUs
from .serializers import BusinessSerializer, BusinessListSerializer, ContactUsSerializer


class BusinessListCreateView(ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'size', 'city', 'country', 'is_verified']
    search_fields = ['name', 'business_id', 'description', 'city']
    ordering_fields = ['created_at', 'name', 'size']
    ordering = ['-created_at']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Business.objects.none()

        user = self.request.user
        if user.account_type == 'BUSINESS':
            # Business users only see their own business
            return Business.objects.filter(user=user)
        else:
            # Workers see all verified, active businesses
            return Business.objects.filter(is_verified=True, is_active=True)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BusinessListSerializer
        return BusinessSerializer

    def perform_create(self, serializer):
        if self.request.user.account_type != 'BUSINESS':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only business accounts can create businesses")

        # CHECK: Enforce one business per account
        existing_business = Business.objects.filter(user=self.request.user).first()
        if existing_business:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You can only create one business per account")

        serializer.save(user=self.request.user, is_verified=True)

    @extend_schema(
        summary="List businesses",
        description="Get businesses (own for business users, verified for workers)",
        parameters=[
            OpenApiParameter('category', str, description='Filter by business category'),
            OpenApiParameter('city', str, description='Filter by city'),
            OpenApiParameter('search', str, description='Search in name, description, city'),
        ],
        responses={200: BusinessListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create business",
        description="Register new business (business accounts only, one per account)",
        request=BusinessSerializer,
        responses={201: BusinessSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)




class BusinessRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.account_type == 'BUSINESS':
            return Business.objects.filter(user=user)
        else:
            return Business.objects.filter(is_verified=True, is_active=True)

    def get_permissions(self):
        if self.request.method in ['PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        # Only business owner can update
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own business")
        serializer.save()

    def perform_destroy(self, instance):
        # Only business owner can delete (soft delete)
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own business")
        instance.is_active = False
        instance.save()

    @extend_schema(
        summary="Get business details",
        description="Retrieve business information by ID",
        responses={200: BusinessSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update business",
        description="Update business information (owner only)",
        request=BusinessSerializer,
        responses={200: BusinessSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete business",
        description="Deactivate business (owner only)",
        responses={204: OpenApiResponse(description="Business deactivated")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    @extend_schema(
        summary="Request verification",
        description="Submit business for verification",
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}}
    )
    @action(detail=True, methods=['post'])
    def request_verification(self, request, pk=None):
        business = self.get_object()

        if business.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only request verification for your own business")

        if business.is_verified:
            return Response(
                {'message': 'Business is already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate verification token
        import uuid
        business.verification_token = str(uuid.uuid4())
        business.save()

        # Send verification email to admin (implement as needed)
        subject = f'Business Verification Request: {business.name}'
        message = f'Business {business.name} (ID: {business.business_id}) has requested verification.'

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except:
            pass  # Don't fail if email fails

        return Response({'message': 'Verification request submitted successfully'})


class ContactUsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Submit contact form",
        description="Send contact inquiry",
        request=ContactUsSerializer,
        responses={201: ContactUsSerializer}
    )
    def post(self, request):
        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()

            # Send notification email
            subject = f'New Contact Inquiry: {contact.title}'
            message = f'''
            New contact inquiry received:

            Name: {contact.name}
            Email: {contact.email_address}
            Type: {contact.get_inquiry_type_display()}
            Title: {contact.title}

            Message:
            {contact.subject}
            '''

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.ADMIN_EMAIL],
                    fail_silently=True,
                )
            except:
                pass  # Don't fail if email fails

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactUsListView(ListCreateAPIView):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admin can view all contacts
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['inquiry_type', 'is_resolved']
    search_fields = ['name', 'email_address', 'title', 'subject']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    @extend_schema(
        summary="List contact inquiries (Admin only)",
        description="Get all contact form submissions",
        parameters=[
            OpenApiParameter('inquiry_type', str, description='Filter by inquiry type'),
            OpenApiParameter('is_resolved', bool, description='Filter by resolution status'),
        ],
        responses={200: ContactUsSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ContactUsRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        summary="Get contact inquiry (Admin only)",
        description="Retrieve contact inquiry by ID",
        responses={200: ContactUsSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update contact inquiry (Admin only)",
        description="Update contact inquiry status",
        request=ContactUsSerializer,
        responses={200: ContactUsSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete contact inquiry (Admin only)",
        description="Delete contact inquiry",
        responses={204: OpenApiResponse(description="Contact inquiry deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    @extend_schema(
        summary="Mark as resolved (Admin only)",
        description="Mark contact inquiry as resolved",
        responses={200: ContactUsSerializer}
    )
    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        contact = self.get_object()
        contact.is_resolved = True
        contact.resolved_by = request.user
        contact.resolved_at = timezone.now()
        contact.save()

        serializer = self.get_serializer(contact)
        return Response(serializer.data)
