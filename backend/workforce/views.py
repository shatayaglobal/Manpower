from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.openapi import OpenApiResponse
from django.utils import timezone

from business.models import Business  # FIXED: Added 'apps.' prefix
from .models import BusinessStaff, Shift, HoursCard
from .serializers import (
    BusinessStaffSerializer, BusinessStaffListSerializer,
    ShiftSerializer, HoursCardSerializer, HoursCardListSerializer
)


class BusinessStaffListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['business', 'employment_type', 'status', 'job_title']
    search_fields = ['name', 'staff_id', 'email']
    ordering_fields = ['hire_date', 'name']
    ordering = ['-hire_date']

    def get_queryset(self):
        # Handle Swagger documentation generation
        if getattr(self, 'swagger_fake_view', False):
            return BusinessStaff.objects.none()

        user_businesses = Business.objects.filter(user=self.request.user)
        return BusinessStaff.objects.filter(business__in=user_businesses)


    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BusinessStaffListSerializer
        return BusinessStaffSerializer

    def perform_create(self, serializer):
        # Ensure business belongs to user
        business = serializer.validated_data['business']
        if business.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add staff to your own business")
        serializer.save()

    @extend_schema(
        summary="List staff",
        description="Get staff members for user's businesses",
        parameters=[
            OpenApiParameter('business', str, description='Filter by business ID'),
            OpenApiParameter('status', str, description='Filter by employment status'),
            OpenApiParameter('search', str, description='Search in name, staff_id, email'),
        ],
        responses={200: BusinessStaffListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create staff",
        description="Add new staff member to business",
        request=BusinessStaffSerializer,
        responses={201: BusinessStaffSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class BusinessStaffRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = BusinessStaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_businesses = Business.objects.filter(user=self.request.user)
        return BusinessStaff.objects.filter(business__in=user_businesses)

    @extend_schema(
        summary="Get staff details",
        description="Retrieve staff member by ID",
        responses={200: BusinessStaffSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update staff",
        description="Update staff member information",
        request=BusinessStaffSerializer,
        responses={200: BusinessStaffSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete staff",
        description="Remove staff member",
        responses={204: OpenApiResponse(description="Staff deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class ShiftListCreateView(ListCreateAPIView):
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['business', 'staff', 'shift_type', 'day_of_week', 'is_active']
    search_fields = ['name', 'staff__name']
    ordering_fields = ['day_of_week', 'start_time']
    ordering = ['day_of_week', 'start_time']

    def get_queryset(self):
        # Handle Swagger documentation generation
        if getattr(self, 'swagger_fake_view', False):
            return Shift.objects.none()

        user_businesses = Business.objects.filter(user=self.request.user)
        return Shift.objects.filter(business__in=user_businesses)

    def perform_create(self, serializer):
        business = serializer.validated_data['business']
        if business.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create shifts for your own business")
        serializer.save()

    @extend_schema(
        summary="List shifts",
        description="Get shifts for user's businesses",
        parameters=[
            OpenApiParameter('staff', str, description='Filter by staff ID'),
            OpenApiParameter('day_of_week', str, description='Filter by day of week'),
        ],
        responses={200: ShiftSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create shift",
        description="Create new work shift",
        request=ShiftSerializer,
        responses={201: ShiftSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ShiftRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = ShiftSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_businesses = Business.objects.filter(user=self.request.user)
        return Shift.objects.filter(business__in=user_businesses)

    @extend_schema(
        summary="Get shift details",
        description="Retrieve shift by ID",
        responses={200: ShiftSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update shift",
        description="Update shift information",
        request=ShiftSerializer,
        responses={200: ShiftSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete shift",
        description="Remove shift",
        responses={204: OpenApiResponse(description="Shift deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class HoursCardListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['staff', 'status', 'date']
    search_fields = ['staff__name', 'notes']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        # Handle Swagger documentation generation
        if getattr(self, 'swagger_fake_view', False):
            return HoursCard.objects.none()

        user_businesses = Business.objects.filter(user=self.request.user)
        return HoursCard.objects.filter(staff__business__in=user_businesses)


    def get_serializer_class(self):
        if self.request.method == 'GET':
            return HoursCardListSerializer
        return HoursCardSerializer

    def perform_create(self, serializer):
        staff = serializer.validated_data['staff']
        if staff.business.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create hours cards for your own staff")
        serializer.save()

    @extend_schema(
        summary="List hours cards",
        description="Get time tracking records",
        parameters=[
            OpenApiParameter('staff', str, description='Filter by staff ID'),
            OpenApiParameter('status', str, description='Filter by approval status'),
            OpenApiParameter('date', str, description='Filter by date'),
        ],
        responses={200: HoursCardListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create hours card",
        description="Record staff working hours",
        request=HoursCardSerializer,
        responses={201: HoursCardSerializer}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class HoursCardRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = HoursCardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_businesses = Business.objects.filter(user=self.request.user)
        return HoursCard.objects.filter(staff__business__in=user_businesses)

    @extend_schema(
        summary="Get hours card",
        description="Retrieve hours card by ID",
        responses={200: HoursCardSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update hours card",
        description="Update hours card information",
        request=HoursCardSerializer,
        responses={200: HoursCardSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete hours card",
        description="Remove hours card",
        responses={204: OpenApiResponse(description="Hours card deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    @extend_schema(
        summary="Approve hours card",
        description="Approve or reject hours card",
        request={"type": "object", "properties": {"status": {"type": "string"}, "rejection_reason": {"type": "string"}}},
        responses={200: HoursCardSerializer}
    )
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        hours_card = self.get_object()
        status_value = request.data.get('status', 'APPROVED')
        rejection_reason = request.data.get('rejection_reason', '')

        if status_value not in ['APPROVED', 'REJECTED', 'REVISED']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        hours_card.status = status_value
        hours_card.approved_by = request.user
        hours_card.approved_at = timezone.now()

        if status_value == 'REJECTED':
            hours_card.rejection_reason = rejection_reason

        hours_card.save()

        serializer = self.get_serializer(hours_card)
        return Response(serializer.data)
