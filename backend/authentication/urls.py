
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # JWT Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('google-auth/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('password-reset/', views.PasswordResetView.as_view(), name='password-reset'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # User endpoints (SAME AS BEFORE)
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<uuid:id>/', views.UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('profiles/', views.UserProfileListCreateView.as_view(), name='profile-list-create'),
    path('profiles/<uuid:id>/', views.UserProfileRetrieveUpdateDestroyView.as_view(), name='profile-detail'),

    # NEW: Profile completion check endpoint
    path('profile/check-complete/', views.check_profile_complete, name='check-profile-complete'),
]
