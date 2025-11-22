import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views import View

from sympy import Eq, sympify, Symbol

from .sympy_utils import (
    safe_parse,
    simplify_expr,
    differentiate_expr,
    integrate_expr,
    solve_expr,
    prepare_plot_data,
)

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

        var = Symbol('x')
        has_var_x = var in expr.free_symbols
        if not has_var_x:
            return JsonResponse({'ok': False, 'error': 'ग्राफ़िंग के लिए अभिव्यक्ति में चर x आवश्यक है (Expression must contain variable x for plotting)'}, status=400)

        try:
            plot_data = prepare_plot_data(expr, xmin=xmin, xmax=xmax, points=points)
        except Exception as e:
            return JsonResponse({'ok': False, 'error': f'ग्राफ़ डेटा तैयार करने में त्रुटि: {str(e)} (Error preparing plot data)'}, status=400)

        return JsonResponse({
            'ok': True,
            'data': plot_data,
        })
