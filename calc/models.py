from django.db import models
from django.contrib.auth.models import User

class OperationHistory(models.Model):
    OPERATION_TYPES = [
        ('calculation', 'Calculation'),
        ('plotting', 'Plotting'),
        ('financial_simple_interest', 'Financial Simple Interest'),
        ('financial_compound_interest', 'Financial Compound Interest'),
    ]

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    operation_type = models.CharField(max_length=50, choices=OPERATION_TYPES)
    expression = models.TextField()
    result = models.TextField()
    variable_used = models.CharField(max_length=10, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success')
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['operation_type']),
        ]

    def __str__(self):
        return f"{self.operation_type} - {self.expression[:50]}"
