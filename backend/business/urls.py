from django.urls import path
from . import views

app_name = 'business'

urlpatterns = [
    # Businesses
    path('', views.BusinessListCreateView.as_view(), name='business-list-create'),
    path('<uuid:pk>/', views.BusinessRetrieveUpdateDestroyView.as_view(), name='business-detail'),
    path('<uuid:pk>/request-verification/', views.BusinessRetrieveUpdateDestroyView.as_view(), {'action': 'request_verification'}, name='business-request-verification'),

    # Contact Us
    path('contact/', views.ContactUsView.as_view(), name='contact-us'),
    path('contacts/', views.ContactUsListView.as_view(), name='contact-list'),
    path('contacts/<uuid:pk>/', views.ContactUsRetrieveUpdateDestroyView.as_view(), name='contact-detail'),
    path('contacts/<uuid:pk>/resolve/', views.ContactUsRetrieveUpdateDestroyView.as_view(), {'action': 'resolve'}, name='contact-resolve'),
]

