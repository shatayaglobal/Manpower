
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # JWT Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
     path('verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', views.ResendVerificationEmailView.as_view(), name='resend-verification'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('google-auth/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # User endpoints (SAME AS BEFORE)
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<uuid:id>/', views.UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('profiles/', views.UserProfileListCreateView.as_view(), name='profile-list-create'),
    path('profiles/<uuid:id>/', views.UserProfileRetrieveUpdateDestroyView.as_view(), name='profile-detail'),

    # NEW: Profile completion check endpoint
    path('profile/check-complete/', views.check_profile_complete, name='check-profile-complete'),

    path('password-reset/request/', views.request_password_reset, name='password-reset-request'),
    path('password-reset/confirm/', views.confirm_password_reset, name='password-reset-confirm'),
]
