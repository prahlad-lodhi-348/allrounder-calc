from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/plot-mpl/', views.plot_expression_mpl, name='plot_expression_mpl'),
]
