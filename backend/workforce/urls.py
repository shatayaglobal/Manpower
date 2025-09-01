from django.urls import path
from . import views

app_name = 'workforce'

urlpatterns = [
    # Staff
    path('staff/', views.BusinessStaffListCreateView.as_view(), name='staff-list'),
    path('staff/<uuid:pk>/', views.BusinessStaffRetrieveUpdateDestroyView.as_view(), name='staff-detail'),
    path('shifts/', views.ShiftListCreateView.as_view(), name='shift-list'),
    path('shifts/<uuid:pk>/', views.ShiftRetrieveUpdateDestroyView.as_view(), name='shift-detail'),
    path('hours-cards/', views.HoursCardListCreateView.as_view(), name='hours-list'),
    path('hours-cards/<uuid:pk>/', views.HoursCardRetrieveUpdateDestroyView.as_view(), name='hours-detail'),
]
