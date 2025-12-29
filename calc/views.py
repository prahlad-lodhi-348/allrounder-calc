import json
import numpy as np
import sympy as sp
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .sympy_utils import safe_parse


def home(request):
    """Render the main calculator page"""
    return render(request, 'calc/home.html')


@method_decorator(csrf_exempt, name='dispatch')
class AdvancedCalculusAPIView(View):
    """Advanced Calculus API endpoint"""
    
    SUPPORTED_VARS = {name: sp.symbols(name) for name in ('x', 'y', 'z', 't')}
    
    def post(self, request):
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        expr_str = (payload.get('expr') or '').strip()
        operation = payload.get('operation', 'simplify')
        variable = payload.get('variable', 'x')
        
        if not expr_str:
            return JsonResponse({'error': 'No expression provided'}, status=400)
        
        try:
            expr = safe_parse(expr_str)
            var = self.SUPPORTED_VARS.get(variable, sp.symbols(variable))
            
            if operation == 'simplify':
                return self.handle_simplify(expr)
            elif operation == 'expand':
                return self.handle_expand(expr)
            elif operation == 'factor':
                return self.handle_factor(expr)
            elif operation == 'differentiate':
                return self.handle_differentiate(expr, var)
            elif operation == 'partial_derivative':
                return self.handle_partial_derivative(expr, var)
            elif operation == 'indefinite_int':
                return self.handle_indefinite_integral(expr, var)
            elif operation == 'definite_int':
                lower = payload.get('lower_limit', '0')
                upper = payload.get('upper_limit', '1')
                return self.handle_definite_integral(expr, var, lower, upper)
            elif operation == 'limit':
                point = payload.get('limit_point', '0')
                return self.handle_limit(expr, var, point)
            elif operation == 'solve':
                return self.handle_solve(expr, var)
            elif operation == 'roots':
                return self.handle_roots(expr, var)
            elif operation == 'series':
                point = payload.get('series_point', '0')
                n_terms = int(payload.get('n_terms', 5))
                return self.handle_series(expr, var, point, n_terms)
            elif operation == 'trig_simplify':
                return self.handle_trig_simplify(expr)
            elif operation == 'trig_expand':
                return self.handle_trig_expand(expr)
            elif operation == 'plot_2d':
                return self.handle_plot_2d(expr_str, payload)
            elif operation == 'plot_3d':
                return self.handle_plot_3d(expr_str, payload)
            else:
                return JsonResponse({'error': f'Unknown operation: {operation}'}, status=400)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    def handle_simplify(self, expr):
        simplified = sp.simplify(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Simplify',
            'result': str(simplified),
            'simplified': str(simplified)
        })
    
    def handle_expand(self, expr):
        expanded = sp.expand(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Expand',
            'result': str(expanded),
            'steps': [f'Expanded form: {expanded}']
        })
    
    def handle_factor(self, expr):
        factored = sp.factor(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Factorize',
            'result': str(factored),
            'steps': [f'Factored form: {factored}']
        })
    
    def handle_differentiate(self, expr, var):
        derivative = sp.diff(expr, var)
        return JsonResponse({
            'ok': True,
            'operation': f'Differentiate (d/d{var})',
            'result': str(derivative),
            'steps': [
                f'Original: {expr}',
                f'd/d{var}({expr}) = {derivative}'
            ]
        })
    
    def handle_partial_derivative(self, expr, var):
        derivative = sp.diff(expr, var)
        return JsonResponse({
            'ok': True,
            'operation': f'Partial Derivative',
            'result': str(derivative),
            'steps': [
                f'Original: {expr}',
                f'Derivative: {derivative}'
            ]
        })
    
    def handle_indefinite_integral(self, expr, var):
        integral = sp.integrate(expr, var)
        return JsonResponse({
            'ok': True,
            'operation': 'Indefinite Integral',
            'result': f'{integral} + C',
            'steps': [
                f'Integrand: {expr}',
                f'Integral: {integral} + C'
            ]
        })
    
    def handle_definite_integral(self, expr, var, lower_str, upper_str):
        try:
            lower = sp.sympify(lower_str)
            upper = sp.sympify(upper_str)
        except:
            return JsonResponse({'error': 'Invalid limits'}, status=400)
        
        result = sp.integrate(expr, (var, lower, upper))
        try:
            numerical = float(result.evalf())
        except:
            numerical = None
        
        return JsonResponse({
            'ok': True,
            'operation': 'Definite Integral',
            'result': str(result),
            'numerical': f'{numerical:.6f}' if numerical else str(result),
            'steps': [
                f'Integrand: {expr}',
                f'Limits: [{lower}, {upper}]',
                f'Result: {result}'
            ]
        })
    
    def handle_solve(self, expr, var):
        solutions = sp.solve(expr, var)
        solutions_str = [str(sol) for sol in solutions] if solutions else []
        return JsonResponse({
            'ok': True,
            'operation': 'Solve',
            'result': solutions_str,
            'steps': [f'Solutions: {", ".join(solutions_str)}'] if solutions_str else ['No real solutions found']
        })
    
    def handle_limit(self, expr, var, point_str):
        try:
            point = sp.sympify(point_str)
            limit_result = sp.limit(expr, var, point)
            return JsonResponse({
                'ok': True,
                'operation': f'Limit as {var} → {point}',
                'result': str(limit_result),
                'steps': [f'lim({var}→{point}) {expr} = {limit_result}']
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    def handle_roots(self, expr, var):
        roots = sp.solve(expr, var)
        roots_str = [str(r) for r in roots] if roots else []
        return JsonResponse({
            'ok': True,
            'operation': 'Find Roots',
            'result': roots_str,
            'steps': [f'Roots: {", ".join(roots_str)}'] if roots_str else ['No roots found']
        })
    
    def handle_series(self, expr, var, point_str, n_terms):
        try:
            point = sp.sympify(point_str)
            series_expansion = sp.series(expr, var, point, n=n_terms).removeO()
            return JsonResponse({
                'ok': True,
                'operation': f'Taylor Series (n={n_terms})',
                'result': str(series_expansion),
                'steps': [f'Series around {var}={point}: {series_expansion}']
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    def handle_trig_simplify(self, expr):
        simplified = sp.trigsimp(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Simplify Trigonometric',
            'result': str(simplified),
            'steps': [f'Simplified: {simplified}']
        })
    
    def handle_trig_expand(self, expr):
        expanded = sp.expand_trig(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Expand Trigonometric',
            'result': str(expanded),
            'steps': [f'Expanded: {expanded}']
        })
    


@method_decorator(csrf_exempt, name='dispatch')
class CurrencyConverterAPIView(View):
    """Currency Converter API endpoint"""
    
    RATES = {
        'USD': 1,
        'INR': 83.12,
        'EUR': 0.92,
        'GBP': 0.79,
        'JPY': 149.50
    }
    
    def post(self, request):
        try:
            payload = json.loads(request.body)
            amount = float(payload.get('amount', 0))
            from_curr = payload.get('from_currency', 'USD')
            to_curr = payload.get('to_currency', 'INR')
            
            if amount <= 0:
                return JsonResponse({'error': 'Amount must be positive'}, status=400)
            
            from_rate = self.RATES.get(from_curr, 1)
            to_rate = self.RATES.get(to_curr, 1)
            
            converted = amount * (to_rate / from_rate)
            
            return JsonResponse({
                'ok': True,
                'result': f'{amount:.2f} {from_curr} = {converted:.2f} {to_curr}',
                'converted_amount': round(converted, 2),
                'rate': round(to_rate / from_rate, 4)
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)