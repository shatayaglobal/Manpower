from django.urls import path
from . import views

app_name = 'workforce'

urlpatterns = [
    path('staff/', views.BusinessStaffListCreateView.as_view(), name='staff-list'),
    path('staff/<uuid:pk>/', views.BusinessStaffRetrieveUpdateDestroyView.as_view(), name='staff-detail'),

    path('shifts/', views.ShiftListCreateView.as_view(), name='shift-list'),
    path('shifts/<uuid:pk>/', views.ShiftRetrieveUpdateDestroyView.as_view(), name='shift-detail'),

    path('hours-cards/', views.HoursCardListCreateView.as_view(), name='hours-list'),
    path('hours-cards/<uuid:pk>/', views.HoursCardRetrieveUpdateDestroyView.as_view(), name='hours-detail'),

    path('my-shifts/', views.my_shifts, name='my-shifts'),
    path('my-hours/', views.my_hours_cards, name='my-hours'),

    path('clock-in/', views.clock_in, name='clock-in'),
    path('hours-cards/<uuid:hours_card_id>/clock-out/', views.clock_out, name='clock-out'),

    path('hours-cards/<uuid:hours_card_id>/sign/', views.sign_hours_card, name='sign-hours'),

    path('hours-cards/<uuid:hours_card_id>/approve/', views.approve_hours_card, name='approve-hours'),

    path('invitations/', views.my_invitations, name='my-invitations'),
    path('invitations/<uuid:invitation_id>/accept/', views.accept_invitation, name='accept-invitation'),
    path('invitations/<uuid:invitation_id>/reject/', views.reject_invitation, name='reject-invitation'),
]
