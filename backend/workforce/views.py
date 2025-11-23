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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import StaffInvitation
from .serializers import StaffInvitationSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .utils import calculate_distance

from business.models import Business
from .models import BusinessStaff, Shift, HoursCard
from .serializers import (
    BusinessStaffSerializer, BusinessStaffListSerializer,
    ShiftSerializer, HoursCardSerializer, HoursCardListSerializer
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import BusinessStaff, Shift, HoursCard, StaffInvitation

class BusinessStaffListCreateView(ListCreateAPIView):
    serializer_class = BusinessStaffSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['business', 'employment_type', 'status', 'job_title']
    search_fields = ['name', 'staff_id', 'email']
    ordering_fields = ['hire_date', 'name', 'job_title', 'department', 'employment_type', 'status']
    ordering = ['-hire_date']

    def get_queryset(self):
        # Handle Swagger documentation generation
        if getattr(self, 'swagger_fake_view', False):
            return BusinessStaff.objects.none()

        user_businesses = Business.objects.filter(user=self.request.user)
        return BusinessStaff.objects.filter(business__in=user_businesses)

    def perform_create(self, serializer):
        # Ensure business belongs to user
        business = serializer.validated_data['business']
        if business.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add staff to your own business")

        # Get the user object if provided
        user = serializer.validated_data.get('user')

        # Save the staff member
        staff = serializer.save(is_confirmed=False if user else True)

        # If linked to a user, create invitation and send notification
        if user:
            invitation = StaffInvitation.objects.create(
                staff=staff,
                business=business,
                worker=user,  # Use 'worker=user' instead of 'worker_id=user_id'
                message=f"You've been invited to join {business.name} as {staff.job_title}"
            )

            # Send WebSocket notification to worker
            channel_layer = get_channel_layer()
            room_name = f"user_{user.id}"  # Use user.id here

            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': 'invitation_update',
                    'action': 'new_invitation'
                }
            )

    @extend_schema(
        summary="List staff",
        description="Get staff members for user's businesses",
        parameters=[
            OpenApiParameter('business', str, description='Filter by business ID'),
            OpenApiParameter('status', str, description='Filter by employment status'),
            OpenApiParameter('search', str, description='Search in name, staff_id, email'),
        ],
        responses={200: BusinessStaffSerializer(many=True)}
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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_invitations(request):
    """Get all pending invitations for the current user"""
    invitations = StaffInvitation.objects.filter(
        worker=request.user,
        status='PENDING'
    ).select_related('business', 'staff')

    serializer = StaffInvitationSerializer(invitations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request, invitation_id):
    try:
        invitation = StaffInvitation.objects.get(
            id=invitation_id,
            worker=request.user,
            status='PENDING'
        )
    except StaffInvitation.DoesNotExist:
        return Response(
            {'error': 'Invitation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Update invitation status
    invitation.status = 'ACCEPTED'
    invitation.responded_at = timezone.now()
    invitation.save()

    # Mark staff as confirmed and active
    invitation.staff.is_confirmed = True
    invitation.staff.status = 'ACTIVE'
    invitation.staff.save()

    # Send WebSocket notification to update count
    channel_layer = get_channel_layer()
    room_name = f"user_{request.user.id}"
    async_to_sync(channel_layer.group_send)(
        room_name,
        {
            'type': 'invitation_update',
            'action': 'accepted'
        }
    )

    return Response({
        'message': 'Invitation accepted successfully',
        'staff_id': str(invitation.staff.id)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_invitation(request, invitation_id):
    """Reject a staff invitation"""
    try:
        invitation = StaffInvitation.objects.get(
            id=invitation_id,
            worker=request.user,
            status='PENDING'
        )
    except StaffInvitation.DoesNotExist:
        return Response(
            {'error': 'Invitation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Update invitation status
    invitation.status = 'REJECTED'
    invitation.responded_at = timezone.now()
    invitation.save()

    # Mark staff as inactive
    invitation.staff.status = 'INACTIVE'
    invitation.staff.save()

    # Send WebSocket notification to update count
    send_invitation_count_update(request.user.id)

    return Response({'message': 'Invitation rejected'})


def send_invitation_count_update(user_id):
    """Send WebSocket message to update invitation count"""
    channel_layer = get_channel_layer()
    room_name = f"user_{user_id}"

    async_to_sync(channel_layer.group_send)(
        room_name,
        {
            'type': 'invitation_update',
            'action': 'count_changed'
        }
    )


# Worker endpoints - for workers to manage their own time
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_shifts(request):
    """Get shifts for the logged-in worker"""
    try:
        # Find staff record linked to this user
        staff = BusinessStaff.objects.filter(user=request.user, status='ACTIVE').first()
        if not staff:
            return Response(
                {'error': 'No active staff record found'},
                status=status.HTTP_404_NOT_FOUND
            )

        shifts = Shift.objects.filter(staff=staff, is_active=True)
        serializer = ShiftSerializer(shifts, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_hours_cards(request):
    """Get hour cards for the logged-in worker"""
    try:
        # Find staff record linked to this user
        staff = BusinessStaff.objects.filter(user=request.user, status='ACTIVE').first()
        if not staff:
            return Response(
                {'error': 'No active staff record found'},
                status=status.HTTP_404_NOT_FOUND
            )

        hours_cards = HoursCard.objects.filter(staff=staff).order_by('-date')
        serializer = HoursCardListSerializer(hours_cards, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    """Clock in - can be done by worker or business owner for a worker"""
    from datetime import datetime, timedelta

    staff_id = request.data.get('staff_id')
    notes = request.data.get('notes', '')
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    timezone_offset = request.data.get('timezone_offset')  # Minutes from UTC




    # Convert to float explicitly
    if latitude:
        latitude = float(latitude)
    if longitude:
        longitude = float(longitude)

    # Accept custom date and times from business owner
    custom_date = request.data.get('date')
    custom_clock_in_time = request.data.get('clock_in_time')
    custom_clock_out_time = request.data.get('clock_out_time')

    try:
        # If staff_id provided, business owner is adding hours for a worker
        if staff_id:
            staff = BusinessStaff.objects.get(id=staff_id)

            # Verify business owner
            if staff.business.user != request.user:
                return Response(
                    {'error': 'You can only clock in your own staff'},
                    status=status.HTTP_403_FORBIDDEN
                )

            distance = None

            # Parse custom date/time
            if custom_date:
                clock_date = datetime.strptime(custom_date, '%Y-%m-%d').date()
            else:
                clock_date = timezone.now().date()

            if custom_clock_in_time:
                # Parse time
                time_obj = datetime.strptime(custom_clock_in_time, '%H:%M').time()
                # Create naive datetime in user's local timezone
                naive_dt = datetime.combine(clock_date, time_obj)

                # Convert to UTC
                if timezone_offset is not None:
                    offset_minutes = int(timezone_offset)
                    # Subtract offset to convert local time to UTC
                    utc_dt = naive_dt - timedelta(minutes=offset_minutes)
                    clock_in_datetime = timezone.make_aware(utc_dt, timezone.utc)
                else:
                    # No offset, assume input is already UTC
                    clock_in_datetime = timezone.make_aware(naive_dt, timezone.utc)
            else:
                clock_in_datetime = timezone.now()

            clock_out_datetime = None
            if custom_clock_out_time:
                time_obj = datetime.strptime(custom_clock_out_time, '%H:%M').time()
                naive_dt = datetime.combine(clock_date, time_obj)

                if timezone_offset is not None:
                    offset_minutes = int(timezone_offset)
                    utc_dt = naive_dt - timedelta(minutes=offset_minutes)
                    clock_out_datetime = timezone.make_aware(utc_dt, timezone.utc)
                else:
                    clock_out_datetime = timezone.make_aware(naive_dt, timezone.utc)

            # Check if record already exists
            existing = HoursCard.objects.filter(staff=staff, date=clock_date).first()
            if existing:
                return Response(
                    {
                        'error': f'Hours already recorded for {staff.name} on {clock_date.strftime("%B %d, %Y")}',
                        'detail': 'Please edit the existing record if you need to make changes.',
                        'existing_record_id': str(existing.id)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        else:
            # Worker clocking in themselves
            staff = BusinessStaff.objects.filter(user=request.user, status='ACTIVE').first()
            if not staff:
                return Response(
                    {'error': 'No active staff record found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            clock_date = timezone.now().date()
            clock_in_datetime = timezone.now()
            clock_out_datetime = None

            # Verify location if required
            if staff.business.require_location_for_clock_in:
                if not latitude or not longitude:
                    return Response(
                        {'error': 'Location is required to clock in'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                if not staff.business.workplace_latitude or not staff.business.workplace_longitude:
                    return Response(
                        {'error': 'Workplace location not configured. Please contact your manager.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                distance = calculate_distance(
                    float(latitude),
                    float(longitude),
                    float(staff.business.workplace_latitude),
                    float(staff.business.workplace_longitude)
                )

                if distance > staff.business.clock_in_radius_meters:
                    return Response(
                        {
                            'error': f'You must be within {staff.business.clock_in_radius_meters}m of the workplace to clock in. You are {int(distance)}m away.',
                            'distance': int(distance),
                            'required_distance': staff.business.clock_in_radius_meters
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                distance = None

            # Check if already clocked in today
            existing = HoursCard.objects.filter(
                staff=staff,
                date=clock_date,
                clock_out_datetime__isnull=True
            ).first()
            if existing:
                return Response(
                    {'error': 'Already clocked in for today'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create hour card
        hours_card = HoursCard.objects.create(
            staff=staff,
            date=clock_date,
            clock_in_datetime=clock_in_datetime,
            clock_out_datetime=clock_out_datetime,
            clock_in_latitude=latitude if latitude else None,
            clock_in_longitude=longitude if longitude else None,
            clock_in_distance_meters=distance,
            notes=notes,
            clocked_in_by=request.user,
            status='PENDING'
        )

        serializer = HoursCardSerializer(hours_card)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except BusinessStaff.DoesNotExist:
        return Response(
            {'error': 'Staff not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response(
            {'error': f'Invalid date/time format: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request, hours_card_id):
    """Clock out - can be done by worker or business owner"""
    from datetime import datetime

    try:
        hours_card = HoursCard.objects.get(id=hours_card_id)

        # Verify permission
        is_worker = hours_card.staff.user == request.user
        is_business_owner = hours_card.staff.business.user == request.user

        if not (is_worker or is_business_owner):
            return Response(
                {'error': 'You do not have permission to clock out this card'},
                status=status.HTTP_403_FORBIDDEN
            )

        if hours_card.clock_out_datetime:
            return Response(
                {'error': 'Already clocked out'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Always use the card's date with current time to ensure same-day recording
        now = timezone.now()
        current_time = now.time()

        # Combine the card's date with current time
        naive_dt = datetime.combine(hours_card.date, current_time)
        clock_out_datetime = timezone.make_aware(naive_dt, timezone.get_current_timezone())

        # Update clock out
        hours_card.clock_out_datetime = clock_out_datetime
        hours_card.clocked_out_by = request.user
        hours_card.notes = request.data.get('notes', hours_card.notes)
        hours_card.save()

        serializer = HoursCardSerializer(hours_card)
        return Response(serializer.data)

    except HoursCard.DoesNotExist:
        return Response(
            {'error': 'Hour card not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_hours_card(request, hours_card_id):
    """Worker signs their hour card"""
    signature = request.data.get('signature', '')

    if not signature:
        return Response(
            {'error': 'Signature is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        hours_card = HoursCard.objects.get(id=hours_card_id)

        # Verify this is the worker's card
        if hours_card.staff.user != request.user:
            return Response(
                {'error': 'You can only sign your own hour cards'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Must be clocked out before signing
        if not hours_card.clock_out:
            return Response(
                {'error': 'Cannot sign until clocked out'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Already signed
        if hours_card.worker_signed_at:
            return Response(
                {'error': 'Hour card already signed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Sign the card
        hours_card.worker_signature = signature
        hours_card.worker_signed_at = timezone.now()
        hours_card.status = 'SIGNED'
        hours_card.save()

        serializer = HoursCardSerializer(hours_card)
        return Response(serializer.data)

    except HoursCard.DoesNotExist:
        return Response(
            {'error': 'Hour card not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_hours_card(request, hours_card_id):
    """Business owner approves worker's signed hour card"""
    approval_status = request.data.get('status', 'APPROVED')
    rejection_reason = request.data.get('rejection_reason', '')

    try:
        hours_card = HoursCard.objects.get(id=hours_card_id)

        # Verify business owner
        if hours_card.staff.business.user != request.user:
            return Response(
                {'error': 'You can only approve your own staff hour cards'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Must be signed by worker first
        if not hours_card.worker_signed_at:
            return Response(
                {'error': 'Worker must sign the hour card first'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate status
        if approval_status not in ['APPROVED', 'REJECTED']:
            return Response(
                {'error': 'Invalid status. Must be APPROVED or REJECTED'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Approve or reject
        hours_card.status = approval_status
        hours_card.approved_by = request.user
        hours_card.approved_at = timezone.now()

        if approval_status == 'REJECTED':
            hours_card.rejection_reason = rejection_reason

        hours_card.save()

        serializer = HoursCardSerializer(hours_card)
        return Response(serializer.data)

    except HoursCard.DoesNotExist:
        return Response(
            {'error': 'Hour card not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
