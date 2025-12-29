from django.contrib import admin
from .models import OperationHistory

@admin.register(OperationHistory)
class OperationHistoryAdmin(admin.ModelAdmin):
    list_display = ('operation_type', 'user', 'status', 'timestamp')
    list_filter = ('operation_type', 'status', 'timestamp')
    search_fields = ('expression', 'user__username')
    readonly_fields = ('timestamp',)
