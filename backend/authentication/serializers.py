import uuid
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, UserProfile
from drf_spectacular.utils import extend_schema_field


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'account_type'
        ]
        extra_kwargs = {
            'email': {'help_text': 'User email address'},
            'first_name': {'help_text': 'User first name'},
            'last_name': {'help_text': 'User last name'},
            'account_type': {'help_text': 'Account type: WORKER or BUSINESS'},
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate_password(self, value):
        """Validate password using Django's password validators"""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Check if passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        # Create user with all fields
        user = User.objects.create_user(
            email=email,
            password=password,
            is_verified=True,
            is_google_user=False,
            **validated_data
        )


        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(help_text="User email address")
    password = serializers.CharField(
        style={'input_type': 'password'},
        help_text="User password"
    )

    def validate(self, attrs):
        """Validate user credentials"""
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Must include email and password.")

        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth authentication"""
    google_token = serializers.CharField(help_text="Google OAuth access token")
    account_type = serializers.ChoiceField(
        choices=User.ACCOUNT_TYPES,
        required=False,
        allow_null=True,  
        help_text="Account type: WORKER or BUSINESS (required for signup)"
    )

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(
        style={'input_type': 'password'},
        help_text="Current password"
    )
    new_password = serializers.CharField(
        min_length=8,
        style={'input_type': 'password'},
        help_text="New password"
    )
    new_password_confirm = serializers.CharField(
        style={'input_type': 'password'},
        help_text="Confirm new password"
    )

    def validate_old_password(self, value):
        """Check if old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_new_password(self, value):
        """Validate new password"""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Check if new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "New passwords don't match"})
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(help_text="Email address to send reset link")

    def validate_email(self, value):
        """Check if user with email exists"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    account_type = serializers.CharField(source='user.account_type', read_only=True)


    def validate_avatar(self, value):
        if value:
            # FORCE lowercase .jpg
            value.name = f"{uuid.uuid4()}.jpg"
        return value

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_email', 'user_name', 'account_type',
            # Personal Information
            'address', 'city', 'state', 'country', 'postal_code',
            'phone', 'alternate_phone', 'date_of_birth', 'gender',
            'marital_status', 'nationality',
            # Professional Information
            'profession', 'current_job_title', 'current_company',
            'employment_status', 'experience_level', 'years_of_experience',
            'bio', 'objective',
            # Skills and arrays
            'skills', 'languages', 'certifications', 'work_experience', 'education',
            # Additional
            'hobbies', 'achievements', 'references',
            # Salary and availability
            'expected_salary_min', 'expected_salary_max', 'salary_currency',
            'available_for_work', 'availability_date', 'willing_to_relocate', 'travel_willingness',
            # Files
            'avatar', 'resume', 'portfolio',
            # Social links
            'linkedin_url', 'github_url', 'portfolio_url', 'website_url', 'twitter_url',
            # Privacy
            'profile_visibility', 'email_notifications', 'sms_notifications',
            # Emergency contact
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            # Timestamps
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'account_type', 'is_google_user', 'is_verified', 'profile',
            'is_active', 'date_joined'
        ]
        read_only_fields = [
            'id', 'is_google_user', 'is_verified', 'is_active', 'date_joined'
        ]

    @extend_schema_field(serializers.CharField)
    def get_full_name(self, obj) -> str:
        return f"{obj.first_name} {obj.last_name}"


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'account_type', 'is_verified', 'date_joined'
        ]

    @extend_schema_field(serializers.CharField)
    def get_full_name(self, obj) -> str:
        return f"{obj.first_name} {obj.last_name}"

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="Refresh token to blacklist")
