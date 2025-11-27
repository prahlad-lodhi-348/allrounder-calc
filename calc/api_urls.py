from django.urls import path
from .api import (
    EvalApiView, PlotApiView, SimpleInterestApiView, CompoundInterestApiView,
    SaveOperationApiView, GetUserHistoryApiView, GetHistoryStatsApiView, ClearHistoryApiView
)

urlpatterns = [
    path('eval', EvalApiView.as_view(), name='api_eval'),
    path('plot', PlotApiView.as_view(), name='api_plot'),
    path('simple-interest/', SimpleInterestApiView.as_view(), name='api_simple_interest'),
    path('compound-interest/', CompoundInterestApiView.as_view(), name='api_compound_interest'),
    path('history/save/', SaveOperationApiView.as_view(), name='save_operation'),
    path('history/user/', GetUserHistoryApiView.as_view(), name='get_history'),
    path('history/stats/', GetHistoryStatsApiView.as_view(), name='get_stats'),
    path('history/clear/', ClearHistoryApiView.as_view(), name='clear_history'),
]
