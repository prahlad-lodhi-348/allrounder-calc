from django.urls import path

from .api import (
    EvalApiView,
    PlotApiView,
    SimpleInterestApiView,
    CompoundInterestApiView,
    SaveOperationApiView,
    GetUserHistoryApiView,
    GetHistoryStatsApiView,
    ClearHistoryApiView,
)
from .views import CurrencyConverterAPIView, AdvancedCalculusAPIView

urlpatterns = [
    path('eval/', EvalApiView.as_view(), name='eval-api'),
    path('plot/', PlotApiView.as_view(), name='plot-api'),
    path('simple-interest/', SimpleInterestApiView.as_view(), name='simple-interest-api'),
    path('compound-interest/', CompoundInterestApiView.as_view(), name='compound-interest-api'),
    path('advanced-calculus/', AdvancedCalculusAPIView.as_view(), name='advanced-calculus-api'),
    path('currency-convert/', CurrencyConverterAPIView.as_view(), name='currency-convert-api'),

    path('history/save/', SaveOperationApiView.as_view(), name='save_operation'),
    path('history/user/', GetUserHistoryApiView.as_view(), name='get_history'),
    path('history/stats/', GetHistoryStatsApiView.as_view(), name='get_stats'),
    path('history/clear/', ClearHistoryApiView.as_view(), name='clear_history'),
]
