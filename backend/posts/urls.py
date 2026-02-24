from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # Posts
    path('', views.PostListCreateView.as_view(), name='post-list'),
    path('<uuid:pk>/', views.PostRetrieveUpdateDestroyView.as_view(), name='post-detail'),
    path('comments/', views.CommentListCreateView.as_view(), name='comment-list'),
    path('comments/<uuid:pk>/', views.CommentRetrieveUpdateDestroyView.as_view(), name='comment-detail'),
    path('jobs/<uuid:job_id>/apply/', views.JobApplicationCreateView.as_view(), name='job-apply'),

    # Likes and Pokes
    path('<uuid:pk>/toggle_like/', views.ToggleLikeView.as_view(), name='toggle-like'),
    path('<uuid:pk>/toggle_poke/', views.TogglePokeView.as_view(), name='toggle-poke'),


    path('jobs/<uuid:job_id>/applications/', views.JobApplicationListView.as_view(), name='job-applications'),
    path('applications/<uuid:pk>/', views.JobApplicationUpdateView.as_view(), name='application-detail'),



    path('applications/user/', views.UserApplicationsListView.as_view(), name='user-applications'),
    path('business/applications/', views.BusinessApplicationsListView.as_view(), name='business-applications'),

    path('applications/<uuid:pk>/status/', views.ApplicationStatusUpdateView.as_view(), name='application-status-update'),
    path('accepted-applicants/', views.AcceptedApplicantsView.as_view(), name='accepted-applicants'),
]
