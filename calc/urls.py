from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/simple-interest/', views.simple_interest, name='simple_interest'),
    path('api/compound-interest/', views.compound_interest, name='compound_interest'),
]
