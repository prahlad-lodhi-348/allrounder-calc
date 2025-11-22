from django.urls import path
from .api import EvalApiView, PlotApiView

urlpatterns = [
    path('eval', EvalApiView.as_view(), name='api_eval'),
    path('plot', PlotApiView.as_view(), name='api_plot'),
]
