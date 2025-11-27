import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator as method_decorator_class
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from sympy import Eq, sympify, Symbol

from .sympy_utils import (
    safe_parse,
    simplify_expr,
    differentiate_expr,
    integrate_expr,
    solve_expr,
    prepare_plot_data,
)
from .models import OperationHistory

@method_decorator(csrf_exempt, name='dispatch')
class EvalApiView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            expr_str = data.get('expr')
            op = data.get('op')
            if not expr_str:
                return JsonResponse({'ok': False, 'error': 'कोई अभिव्यक्ति प्रदान नहीं की गई (No expression provided)'}, status=400)
            expr = safe_parse(expr_str)
        except ValueError as e:
            return JsonResponse({'ok': False, 'error': f'अमान्य अभिव्यक्ति (Invalid expression): {str(e)}'}, status=400)
        except Exception:
            return JsonResponse({'ok': False, 'error': 'अमान्य JSON या अनुरोध (Invalid JSON or request)'}, status=400)

        var = Symbol('x')
        results = None
        steps = []

        # Check if variable x present in expression
        has_var_x = var in expr.free_symbols

        try:
            if not op or op == 'simplify':
                results, steps = simplify_expr(expr)
            elif op == 'diff':
                if not has_var_x:
                    return JsonResponse({'ok': False, 'error': 'अभिव्यक्ति में चर x नहीं है (Expression does not contain variable x) क़ृपया मान्य अभिव्यक्ति प्रदान करें।'}, status=400)
                results, steps = differentiate_expr(expr, var)
            elif op == 'integrate':
                if not has_var_x:
                    return JsonResponse({'ok': False, 'error': 'अभिव्यक्ति में चर x नहीं है (Expression does not contain variable x) क़ृपया मान्य अभिव्यक्ति प्रदान करें।'}, status=400)
                results, steps = integrate_expr(expr, var)
            elif op == 'solve':
                if not has_var_x:
                    # Expression is constant, just evaluate numerically
                    evaluated_value = expr.evalf()
                    return JsonResponse({
                        'ok': True,
                        'result': f'अभिव्यक्ति का मान है: {evaluated_value}',
                        'type': 'constant',
                        'steps': [],
                    })
                else:
                    if isinstance(expr, Eq):
                        results, steps = solve_expr(expr, var)
                    else:
                        if '=' in expr_str:
                            left_str, right_str = expr_str.split('=', 1)
                            left_expr = safe_parse(left_str)
                            right_expr = safe_parse(right_str)
                            eq = Eq(left_expr, right_expr)
                            results, steps = solve_expr(eq, var)
                        else:
                            results, steps = solve_expr(expr, var)
            else:
                return JsonResponse({'ok': False, 'error': 'अप्रमाणित ऑपरेशन (Unsupported operation)'}, status=400)
        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'अभिव्यक्ति संसाधन में त्रुटि: {str(e)} (Error processing expression)'}, status=400)

        result_repr = None
        if op == 'solve':
            result_repr = [str(r) for r in results] if results else []
        else:
            result_repr = str(results)

        return JsonResponse({
            'ok': True,
            'result': result_repr,
            'steps': steps,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PlotApiView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            expr_str = data.get('expr')
            xmin = float(data.get('xmin', -10))
            xmax = float(data.get('xmax', 10))
            points = int(data.get('points', 500))
            if not expr_str:
                return JsonResponse({'ok': False, 'error': 'कोई अभिव्यक्ति प्रदान नहीं की गई (No expression provided)'}, status=400)
            expr = safe_parse(expr_str)
        except ValueError as e:
            return JsonResponse({'ok': False, 'error': f'अमान्य अभिव्यक्ति (Invalid expression): {str(e)}'}, status=400)
        except Exception:
            return JsonResponse({'ok': False, 'error': 'अमान्य JSON या अनुरोध (Invalid JSON or request)'}, status=400)

        # Find the variable in the expression
        free_symbols = expr.free_symbols
        if len(free_symbols) != 1:
            return JsonResponse({'ok': False, 'error': 'ग्राफ़िंग के लिए अभिव्यक्ति में एक चर होना चाहिए (Expression must contain exactly one variable for plotting)'}, status=400)

        var = list(free_symbols)[0]  # Get the single variable

        try:
            plot_data = prepare_plot_data(expr, var=var, xmin=xmin, xmax=xmax, points=points)
        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'ग्राफ़ डेटा तैयार करने में त्रुटि: {str(e)} (Error preparing plot data)'}, status=400)

        return JsonResponse({
            'ok': True,
            'data': plot_data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class SimpleInterestApiView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            principal = float(data.get('principal', 0))
            rate = float(data.get('rate', 0))
            time = float(data.get('time', 0))

            if principal <= 0 or rate <= 0 or time <= 0:
                return JsonResponse({'error': 'All inputs must be positive numbers.'}, status=400)

            si = (principal * rate * time) / 100
            return JsonResponse({'result': round(si, 2)})
        except (ValueError, TypeError, json.JSONDecodeError):
            return JsonResponse({'error': 'Invalid input. Please provide valid numbers.'}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class CompoundInterestApiView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            principal = float(data.get('principal', 0))
            rate = float(data.get('rate', 0))
            time = float(data.get('time', 0))
            frequency = float(data.get('frequency', 1))  # default to 1 if not provided

            if principal <= 0 or rate <= 0 or time <= 0 or frequency <= 0:
                return JsonResponse({'error': 'All inputs must be positive numbers.'}, status=400)

            r = rate / 100
            amount = principal * (1 + r / frequency) ** (frequency * time)
            ci = amount - principal
            return JsonResponse({'result': round(amount, 2), 'compound_interest': round(ci, 2)})
        except (ValueError, TypeError, json.JSONDecodeError):
            return JsonResponse({'error': 'Invalid input. Please provide valid numbers.'}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class SaveOperationApiView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        try:
            data = json.loads(request.body)
            operation_type = data.get('operation_type')
            expression = data.get('expression', '')
            result = data.get('result', '')
            variable_used = data.get('variable_used')
            status = data.get('status', 'success')
            error_message = data.get('error_message')

            # Validate operation_type
            valid_types = ['calculation', 'plotting', 'financial_simple_interest', 'financial_compound_interest']
            if operation_type not in valid_types:
                return JsonResponse({'error': 'Invalid operation_type'}, status=400)

            # Create history entry
            history_entry = OperationHistory.objects.create(
                user=request.user,
                operation_type=operation_type,
                expression=expression,
                result=result,
                variable_used=variable_used,
                status=status,
                error_message=error_message
            )

            return JsonResponse({
                'id': history_entry.id,
                'timestamp': history_entry.timestamp.isoformat(),
                'status': 'saved'
            })

        except Exception as e:
            return JsonResponse({'error': f'Failed to save operation: {str(e)}'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GetUserHistoryApiView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        try:
            # Get query parameters
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 50))
            operation_type = request.GET.get('operation_type')

            # Calculate offset
            offset = (page - 1) * limit

            # Base queryset
            queryset = OperationHistory.objects.filter(user=request.user)

            # Filter by operation type if specified
            if operation_type:
                queryset = queryset.filter(operation_type=operation_type)

            # Get total count
            total_count = queryset.count()

            # Get paginated history
            history = queryset.order_by('-timestamp')[offset:offset + limit]

            # Serialize data
            operations = []
            for entry in history:
                operations.append({
                    'id': entry.id,
                    'operation_type': entry.operation_type,
                    'expression': entry.expression,
                    'result': entry.result,
                    'timestamp': entry.timestamp.isoformat(),
                    'status': entry.status
                })

            return JsonResponse({
                'total_count': total_count,
                'operations': operations
            })

        except Exception as e:
            return JsonResponse({'error': f'Failed to retrieve history: {str(e)}'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GetHistoryStatsApiView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        try:
            # Base queryset
            queryset = OperationHistory.objects.filter(user=request.user)

            # Get stats
            total_operations = queryset.count()
            operations_by_type = queryset.values('operation_type').annotate(
                count=Count('operation_type')
            ).order_by('-count')

            # Get recent activity (last 7 days)
            seven_days_ago = timezone.now() - timedelta(days=7)
            recent_operations = queryset.filter(timestamp__gte=seven_days_ago).count()

            # Success rate
            total_with_status = queryset.exclude(status__isnull=True).count()
            success_count = queryset.filter(status='success').count()
            success_rate = (success_count / total_with_status * 100) if total_with_status > 0 else 0

            stats = {
                'total_operations': total_operations,
                'recent_operations': recent_operations,
                'success_rate': round(success_rate, 1),
                'operations_by_type': list(operations_by_type)
            }

            return JsonResponse(stats)

        except Exception as e:
            return JsonResponse({'error': f'Failed to retrieve stats: {str(e)}'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ClearHistoryApiView(View):
    def delete(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)

        try:
            data = json.loads(request.body)
            confirm = data.get('confirm', False)

            if not confirm:
                return JsonResponse({'error': 'Confirmation required'}, status=400)

            # Delete all history for the current user
            deleted_count = OperationHistory.objects.filter(user=request.user).delete()

            return JsonResponse({
                'message': 'History cleared',
                'deleted_count': deleted_count[0]
            })

        except Exception as e:
            return JsonResponse({'error': f'Failed to clear history: {str(e)}'}, status=500)
