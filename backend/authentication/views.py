

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.openapi import OpenApiResponse
from rest_framework.decorators import api_view, permission_classes
from authentication.utils.email import send_verification_email
from .models import User, UserProfile
from .serializers import (
    LogoutSerializer, UserSerializer, UserListSerializer, UserRegistrationSerializer,
    GoogleAuthSerializer, UserProfileSerializer,
    ChangePasswordSerializer, PasswordResetSerializer
)
from . import serializers
from rest_framework.decorators import api_view
from authentication.models import EmailVerificationToken
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, inline_serializer
from rest_framework import serializers
import logging
logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer to include user data"""
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['account_type'] = user.account_type
        token['is_verified'] = user.is_verified
        token['full_name'] = user.full_name

        return token

    def validate(self, attrs):
        email = attrs.get('email')

        # Check if user exists and was created with Google
        try:
            user = User.objects.get(email=email)
            if not user.has_usable_password():
                raise serializers.ValidationError({
                    'detail': 'This account was created with Google. Please sign in with Google instead.',
                    'error_type': 'google_account_required',
                    'google_login_required': True
                }, code='google_required')
        except User.DoesNotExist:
            pass  # Let parent handle this

        # Call parent validation
        data = super().validate(attrs)

        # Add user data to response
        data['user'] = UserSerializer(self.user).data

        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login view"""
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(
        summary="JWT Login",
        description="Login with email/password and get JWT tokens",
        examples=[
            OpenApiExample(
                "Login example",
                value={
                    "email": "user@example.com",
                    "password": "securepassword123"
                }
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# class UserRegistrationView(APIView):
#     """User registration with JWT tokens"""
#     permission_classes = [AllowAny]

#     @extend_schema(
#         summary="Register new user",
#         description="Create account and get JWT tokens",
#         request=UserRegistrationSerializer,
#         responses={201: {"type": "object"}},
#         examples=[
#             OpenApiExample(
#                 "Registration example",
#                 value={
#                     "email": "user@example.com",
#                     "first_name": "John",
#                     "last_name": "Doe",
#                     "password": "securepassword123",
#                     "password_confirm": "securepassword123",
#                     "account_type": "WORKER"
#                 }
#             )
#         ]
#     )
#     def post(self, request):
#         serializer = UserRegistrationSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             # Create user profile
#             UserProfile.objects.create(user=user)

#             # Generate JWT tokens
#             refresh = RefreshToken.for_user(user)

#             return Response({
#                 'user': UserSerializer(user).data,
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'message': 'User registered successfully'
#             }, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


logger = logging.getLogger(__name__)

class UserRegistrationView(APIView):
    """User registration with email verification"""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register new user",
        description="Create account and send verification email",
        request=UserRegistrationSerializer,
        responses={201: {"type": "object"}},
    )
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create user profile
            UserProfile.objects.create(user=user)

            # Send verification email BEFORE returning response
            logger.info(f"Attempting to send verification email to {user.email}")
            email_sent = send_verification_email(user)
            logger.info(f"Email sent status: {email_sent}")

            if not email_sent:
                logger.error(f"Failed to send verification email to {user.email}")
                # You can choose to still return success but inform user
                # Or return an error - your choice

            return Response({
                'user': UserSerializer(user).data,
                'message': 'Registration successful. Please check your email to verify your account.',
                'email_sent': email_sent,
                'requires_verification': True
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    summary="Logout",
    description="Blacklist refresh token",
    request=LogoutSerializer,  # ← CHANGE THIS
    responses={200: OpenApiResponse(description="Logout successful")}
)
class LogoutView(APIView):
    """JWT logout (blacklist refresh token)"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Logout",
        description="Blacklist refresh token",
        request={"type": "object", "properties": {"refresh": {"type": "string"}}},
        responses={200: OpenApiResponse(description="Logout successful")}
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({'message': 'Logout successful'})
        except Exception:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleAuthView(APIView):
    """Google OAuth with JWT tokens"""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Google OAuth login",
        description="Authenticate with Google and get JWT tokens",
        request=GoogleAuthSerializer,
        responses={200: {"type": "object"}},
        examples=[
            OpenApiExample(
                "Google auth example",
                value={
                    "google_token": "google_oauth_token_here",
                    "account_type": "WORKER"
                }
            )
        ]
    )
    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data["google_token"]
            account_type = serializer.validated_data.get("account_type")

            try:
                from google.auth.transport import requests
                from google.oauth2 import id_token

                # Verify Google token
                idinfo = id_token.verify_oauth2_token(
                    token, requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID
                )

                google_id = idinfo["sub"]
                email = idinfo["email"]
                first_name = idinfo.get("given_name", "")
                last_name = idinfo.get("family_name", "")

                # --- Fix duplicate email issue ---
                user = User.objects.filter(email=email).first()

                if user:
                    # Link Google ID if not already linked
                    if not user.google_id:
                        user.google_id = google_id
                        user.is_google_user = True
                        user.is_verified = True
                        user.save()
                    created = False
                else:
                    # NEW USER - account_type is REQUIRED
                    if not account_type:
                        return Response(
                            {
                                "error": "Account not found. Please sign up first.",
                                "requires_signup": True
                            },
                            status=status.HTTP_404_NOT_FOUND,
                        )

                    # Create brand new user with selected account_type
                    user = User.objects.create(
                        google_id=google_id,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        account_type=account_type,
                        is_google_user=True,
                        is_verified=True,
                    )
                    UserProfile.objects.create(user=user)
                    created = True

                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)

                return Response(
                    {
                        "user": UserSerializer(user).data,
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "new_user": created,
                        "message": "Google authentication successful",
                    }
                )

            except ValueError:
                return Response(
                    {"error": "Invalid Google token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    """Password reset request endpoint"""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Request password reset",
        description="Send password reset email to user",
        request=PasswordResetSerializer,
        responses={
            200: OpenApiResponse(description="Password reset email sent"),
            400: OpenApiResponse(description="Invalid email"),
        }
    )
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Send reset email (implement your email template)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            context = {
                'user': user,
                'reset_url': reset_url,
            }

            subject = 'Password Reset Request'
            message = render_to_string('emails/password_reset.txt', context)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({'message': 'Password reset email sent'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password (invalidates all tokens)"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Change password",
        description="Change password and get new tokens",
        request=ChangePasswordSerializer,
        responses={200: {"type": "object"}}
    )
    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # Generate new tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Password changed successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListCreateView(ListCreateAPIView):
    """User list and create endpoint"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['account_type', 'is_google_user', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'first_name', 'last_name']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        """Only staff can create users via this endpoint"""
        if self.request.method == 'PUT':
            return [permissions.IsAdminUser()]
        return [IsAuthenticated()]

    @extend_schema(
        summary="List users",
        description="Get paginated list of users with filtering and search",
        parameters=[
            OpenApiParameter('account_type', str, description='Filter by account type'),
            OpenApiParameter('search', str, description='Search in email, first_name, last_name'),
            OpenApiParameter('ordering', str, description='Order by field'),
        ],
        responses={200: UserListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create user (Admin only)",
        description="Create new user account (admin only)",
        request=UserSerializer,
        responses={201: UserSerializer}
    )
    def put(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """User retrieve, update, and delete endpoint"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_permissions(self):
        """Users can only update their own profile, admins can do everything"""
        if self.request.method in ['PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [IsAuthenticated()]

    def get_object(self):
        """Users can only access their own profile unless they're admin"""
        obj = super().get_object()
        if not self.request.user.is_staff and obj != self.request.user:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("You can only access your own profile")
        return obj

    @extend_schema(
        summary="Get user details",
        description="Retrieve user information by ID",
        responses={200: UserSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update user",
        description="Update user information",
        request=UserSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete user",
        description="Delete user account",
        responses={204: OpenApiResponse(description="User deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class CurrentUserView(APIView):
    """Current user endpoint"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get current user",
        description="Get authenticated user's profile",
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        summary="Update current user",
        description="Update authenticated user's information",
        request=UserSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileListCreateView(ListCreateAPIView):
    """User profile list and create endpoint"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['profession']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'profession']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter profiles based on user permissions"""
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Associate profile with current user"""
        serializer.save(user=self.request.user)

    @extend_schema(
        summary="List user profiles",
        description="Get paginated list of user profiles",
        responses={200: UserProfileSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Create user profile",
        description="Create user profile for authenticated user",
        request=UserProfileSerializer,
        responses={201: UserProfileSerializer}
    )
    def put(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class UserProfileRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    """User profile retrieve, update, and delete endpoint"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        """Users can only access their own profile"""
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)

    @extend_schema(
        summary="Get user profile",
        description="Retrieve user profile by ID",
        responses={200: UserProfileSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update user profile",
        description="Update user profile information",
        request=UserProfileSerializer,
        responses={200: UserProfileSerializer}
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        summary="Delete user profile",
        description="Delete user profile",
        responses={204: OpenApiResponse(description="Profile deleted")}
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_profile_complete(request):
    user = request.user

    if user.account_type != 'WORKER':
        return Response({
            'is_complete': True,
            'completion_percentage': 100,
            'message': 'Business accounts do not require profile completion'
        })

    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)

    return Response({
        'is_complete': profile.is_application_ready,  # Use new property
        'completion_percentage': profile.completion_percentage,
        'missing_fields': profile.missing_application_fields,  # Use new property
        'message': 'Profile completion status retrieved successfully'
    }, status=status.HTTP_200_OK)



class VerifyEmailView(APIView):
    """Verify email with token"""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Verify email address",
        description="Verify user's email using verification token",
        parameters=[
            OpenApiParameter(
                name='token',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Email verification token',
                required=True
            )
        ],
        responses={
            200: {"type": "object", "properties": {"message": {"type": "string"}}},
            400: {"type": "object", "properties": {"error": {"type": "string"}}}
        }
    )
    def get(self, request):
        try:
            token_str = request.query_params.get('token')

            if not token_str:
                return Response(
                    {'error': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = EmailVerificationToken.objects.get(token=token_str)

            if not token.is_valid():
                if token.user.is_verified:
                    return Response({
                        'message': 'Email already verified! You can now login.',
                        'user': UserSerializer(token.user).data
                    }, status=status.HTTP_200_OK)

                return Response(
                    {'error': 'Token is invalid or has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = token.user
            user.is_verified = True
            user.save()
            token.mark_as_used()

            return Response({
                'message': 'Email verified successfully! You can now login.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        except EmailVerificationToken.DoesNotExist:
            return Response(
                {'error': 'Invalid verification token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Verification failed. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

class ResendVerificationEmailView(APIView):
    """Resend verification email"""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Resend verification email",
        description="Resend verification email to user",
        request=inline_serializer(
            name='ResendVerificationEmail',
            fields={'email': serializers.EmailField()}
        ),
        responses={200: {"type": "object"}}
    )
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            if user.is_verified:
                return Response(
                    {'message': 'Email is already verified'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Send new verification email
            email_sent = send_verification_email(user)

            if email_sent:
                return Response({
                    'message': 'Verification email sent successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Failed to send email'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'message': 'If this email is registered, a verification email will be sent'
            }, status=status.HTTP_200_OK)
