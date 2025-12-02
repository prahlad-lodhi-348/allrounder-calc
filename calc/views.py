import base64
import io
import json
from datetime import datetime
import traceback

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import requests
import sympy as sp
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .sympy_utils import safe_parse

# Use a non-interactive backend for server-side rendering
matplotlib.use("Agg")

def home(request):
    return render(request, 'calc/home.html')

def simple_interest(request):
    if request.method == "POST":
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
    else:
        return JsonResponse({'error': 'Invalid HTTP method; POST required.'}, status=405)

def compound_interest(request):
    if request.method == "POST":
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
    else:
        return JsonResponse({'error': 'Invalid HTTP method; POST required.'}, status=405)


@csrf_exempt
def plot_expression_mpl(request):
    """
    Plot expressions with 1 or 2 variables using NumPy + Matplotlib and return a base64 PNG.

    Behaviour:
        - 1 variable  → 2D line plot
        - 2 variables → 3D surface plot
        - 3+ variables → helpful error message

    Expected JSON payload (POST):
        {
          "expression": "sin(x) * cos(y)",
          "x_min": -5,
          "x_max": 5,
          "y_min": -5,        # optional, used for 2‑var plots
          "y_max": 5,         # optional, used for 2‑var plots
          "num_points": 400
        }
    """
    # Basic CORS preflight handling
    if request.method == "OPTIONS":
        response = JsonResponse({"ok": True})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method != "POST":
        response = JsonResponse({"ok": False, "error": "Invalid HTTP method; POST required."}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        response = JsonResponse({"ok": False, "error": "Invalid JSON payload."}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    expr_str = (payload.get("expression") or "").strip()
    if not expr_str:
        response = JsonResponse({"ok": False, "error": "No expression provided."}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    try:
        x_min = float(payload.get("x_min", -10))
        x_max = float(payload.get("x_max", 10))
        y_min = float(payload.get("y_min", -5))
        y_max = float(payload.get("y_max", 5))
        num_points = int(payload.get("num_points", 400))
    except (TypeError, ValueError):
        response = JsonResponse({"ok": False, "error": "Invalid range or num_points values."}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    if x_min >= x_max:
        response = JsonResponse({"ok": False, "error": "x_min must be less than x_max."}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    if num_points <= 1 or num_points > 5000:
        response = JsonResponse({"ok": False, "error": "num_points must be between 2 and 5000."}, status=400)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    try:
        # Safely parse expression using existing sympy helper
        expr = safe_parse(expr_str)

        # Detect variables present in the expression
        free_syms = sorted(list(expr.free_symbols), key=lambda s: s.name)
        supported_names = {"x", "y", "z", "t"}
        free_syms = [s for s in free_syms if s.name in supported_names]
        num_vars = len(free_syms)

        if num_vars == 0:
            # Constant expression – treat as function of a dummy x
            var_symbol = sp.symbols("x")
            f = sp.lambdify(var_symbol, expr, modules=["numpy"])
            xs = np.linspace(x_min, x_max, num_points)
            ys = f(xs)
            ys = np.array(ys, dtype=np.float64)

            plt.style.use("dark_background")
            fig, ax = plt.subplots(figsize=(6, 4), dpi=120)
            fig.patch.set_facecolor("#020617")
            ax.set_facecolor("#020617")
            ax.plot(xs, ys, color="#38bdf8", linewidth=2.0)
            ax.set_xlabel("x", color="#e5e7eb")
            ax.set_ylabel("f(x)", color="#e5e7eb")
            ax.set_title(expr_str, color="#e5e7eb")

        elif num_vars == 1:
            # Single-variable expression – 2D line plot
            var_symbol = free_syms[0]
            f = sp.lambdify(var_symbol, expr, modules=["numpy"])

            xs = np.linspace(x_min, x_max, num_points)
            ys = f(xs)
            ys = np.array(ys, dtype=np.float64)
            ys[~np.isfinite(ys)] = np.nan
            if np.all(np.isnan(ys)):
                raise ValueError("Expression could not be evaluated on the given range.")

            plt.style.use("dark_background")
            fig, ax = plt.subplots(figsize=(6, 4), dpi=120)
            fig.patch.set_facecolor("#020617")
            ax.set_facecolor("#020617")
            ax.plot(xs, ys, color="#38bdf8", linewidth=2.0)
            name = var_symbol.name
            ax.set_xlabel(name, color="#e5e7eb")
            ax.set_ylabel(f"f({name})", color="#e5e7eb")
            ax.set_title(expr_str, color="#e5e7eb")

        elif num_vars == 2:
            # Two-variable expression – 3D surface
            from mpl_toolkits.mplot3d import Axes3D  # noqa: F401

            v1, v2 = free_syms[:2]
            x_vals = np.linspace(x_min, x_max, max(10, min(num_points, 150)))
            y_vals = np.linspace(y_min, y_max, max(10, min(num_points, 150)))
            X, Y = np.meshgrid(x_vals, y_vals)

            f = sp.lambdify((v1, v2), expr, modules=["numpy"])
            Z = f(X, Y)
            Z = np.array(Z, dtype=np.float64)
            Z[~np.isfinite(Z)] = np.nan
            if np.all(np.isnan(Z)):
                raise ValueError("Expression could not be evaluated on the given 2D range.")

            plt.style.use("dark_background")
            fig = plt.figure(figsize=(6, 4), dpi=120)
            ax = fig.add_subplot(111, projection="3d")
            fig.patch.set_facecolor("#020617")
            ax.set_facecolor("#020617")

            surf = ax.plot_surface(
                X,
                Y,
                Z,
                cmap="viridis",
                linewidth=0,
                antialiased=True,
            )
            fig.colorbar(surf, shrink=0.6, aspect=10)
            ax.set_xlabel(v1.name, color="#e5e7eb")
            ax.set_ylabel(v2.name, color="#e5e7eb")
            ax.set_zlabel("f", color="#e5e7eb")
            ax.set_title(expr_str, color="#e5e7eb")

        else:
            # 3 or more variables – explain limitation
            var_list = ", ".join(s.name for s in free_syms)
            raise ValueError(
                f"Expression contains {num_vars} variables ({var_list}). "
                "Plotting currently supports at most 2 variables. "
                "Fix the extra variables to constants or reduce the expression."
            )

        ax.grid(True, color="#1f2937", alpha=0.7)
        for spine in getattr(ax, "spines", {}).values():
            spine.set_color("#334155")
        ax.tick_params(colors="#cbd5f5")
        fig.tight_layout()

        buffer = io.BytesIO()
        fig.savefig(buffer, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
        plt.close(fig)
        buffer.seek(0)
        img_b64 = base64.b64encode(buffer.read()).decode("ascii")

        response = JsonResponse(
            {
                "ok": True,
                "image": img_b64,
                "variables": [s.name for s in free_syms],
                "variable_count": num_vars,
            }
        )
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
    except Exception as exc:  # noqa: BLE001
        response = JsonResponse(
            {
                "ok": False,
                "error": f"Failed to plot expression: {exc}",
            },
            status=400,
        )
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response


@method_decorator(csrf_exempt, name='dispatch')
class AdvancedCalculusAPIView(View):
    SUPPORTED_VARIABLES = {name: sp.symbols(name) for name in ('x', 'y', 'z', 't')}
    LIMIT_LOCALS = {
        'pi': sp.pi,
        'e': sp.E,
        'E': sp.E,
        'oo': sp.oo,
        'OO': sp.oo,
        'inf': sp.oo,
        'INF': sp.oo,
        'infinity': sp.oo,
        'Infinity': sp.oo,
        '-oo': -sp.oo,
        '-inf': -sp.oo,
        '-Infinity': -sp.oo,
    }

    def post(self, request):
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'ok': False, 'error': 'Invalid JSON payload'}, status=400)

        expr_str = (payload.get('expr') or '').strip()
        operation = payload.get('operation', 'simplify')
        variable_key = payload.get('variable', 'x')
        lower_limit = payload.get('lower_limit')
        upper_limit = payload.get('upper_limit')
        double_limits = payload.get('double_limits')

        if not expr_str:
            return JsonResponse({'ok': False, 'error': 'No expression provided'}, status=400)

        var_symbol = self.SUPPORTED_VARIABLES.get(variable_key, sp.symbols(variable_key))

        try:
            expr = safe_parse(expr_str)
        except ValueError as exc:
            return JsonResponse({'ok': False, 'error': str(exc)}, status=400)

        try:
            if operation == 'partial_diff':
                return self.handle_partial_derivative(expr, var_symbol)
            if operation == 'indefinite_int':
                return self.handle_indefinite_integral(expr, var_symbol)
            if operation == 'definite_int':
                return self.handle_definite_integral(expr, var_symbol, lower_limit, upper_limit)
            if operation == 'double_int':
                return self.handle_double_integral(expr, double_limits)
            if operation == 'triple_int':
                return self.handle_triple_integral(expr)
            if operation == 'solve':
                return self.handle_solve(expr, var_symbol)
            return self.handle_simplify(expr)
        except Exception as exc:
            return JsonResponse({
                'ok': False,
                'error': str(exc),
                'traceback': traceback.format_exc()
            }, status=400)

    def handle_partial_derivative(self, expr, var):
        derivative = sp.diff(expr, var)
        return JsonResponse({
            'ok': True,
            'operation': f'Partial Derivative ∂/∂{var}',
            'result': str(derivative),
            'latex_result': sp.latex(derivative),
            'steps': [
                {'description': 'Original Expression', 'latex': sp.latex(expr)},
                {'description': f'Differentiate w.r.t. {var}', 'latex': sp.latex(derivative)}
            ]
        })

    def handle_indefinite_integral(self, expr, var):
        integral = sp.integrate(expr, var)
        latex_result = f"{sp.latex(integral)} + C"
        return JsonResponse({
            'ok': True,
            'operation': f'Indefinite Integral ∫ d{var}',
            'result': f'{integral} + C',
            'latex_result': latex_result,
            'steps': [
                {'description': 'Integrand', 'latex': sp.latex(expr)},
                {'description': f'Integrate w.r.t. {var}', 'latex': latex_result}
            ]
        })

    def handle_definite_integral(self, expr, var, lower_limit, upper_limit):
        if lower_limit is None or upper_limit is None:
            raise ValueError('Both lower and upper limits are required for definite integrals.')

        lower = self.parse_limit(lower_limit)
        upper = self.parse_limit(upper_limit)

        result = sp.integrate(expr, (var, lower, upper))
        latex_result = sp.latex(result)
        try:
            numerical_value = float(result.evalf())
            numerical_str = f"{numerical_value:.6f}"
        except Exception:
            numerical_value = None
            numerical_str = ''

        return JsonResponse({
            'ok': True,
            'operation': f'Definite Integral ∫[{lower}, {upper}] d{var}',
            'result': str(result),
            'numerical': numerical_str,
            'latex_result': latex_result,
            'steps': [
                {'description': 'Integrand', 'latex': sp.latex(expr)},
                {'description': 'Apply limits', 'latex': f'[{sp.latex(lower)}, {sp.latex(upper)}]'},
                {'description': 'Evaluate', 'latex': latex_result + (f' \\approx {numerical_str}' if numerical_str else '')}
            ]
        })

    def handle_double_integral(self, expr, limits):
        x, y = sp.symbols('x y')
        if limits and isinstance(limits, dict) and limits.get('use_limits'):
            x_lower = self.parse_limit(limits.get('x_lower', 0))
            x_upper = self.parse_limit(limits.get('x_upper', 1))
            y_lower = self.parse_limit(limits.get('y_lower', 0))
            y_upper = self.parse_limit(limits.get('y_upper', 1))
            intermediate = sp.integrate(expr, (x, x_lower, x_upper))
            result = sp.integrate(intermediate, (y, y_lower, y_upper))
            limits_desc = f"x:[{x_lower},{x_upper}], y:[{y_lower},{y_upper}]"
        else:
            intermediate = sp.integrate(expr, x)
            result = sp.integrate(intermediate, y)
            limits_desc = 'Indefinite integral'

        return JsonResponse({
            'ok': True,
            'operation': 'Double Integral ∫∫ f(x,y) dx dy',
            'result': str(result),
            'latex_result': sp.latex(result),
            'steps': [
                {'description': 'Integrand', 'latex': sp.latex(expr)},
                {'description': 'Integrate w.r.t. x', 'latex': sp.latex(intermediate)},
                {'description': 'Integrate w.r.t. y', 'latex': sp.latex(result)}
            ],
            'limits': limits_desc
        })

    def handle_triple_integral(self, expr):
        x, y, z = sp.symbols('x y z')
        first = sp.integrate(expr, x)
        second = sp.integrate(first, y)
        third = sp.integrate(second, z)
        return JsonResponse({
            'ok': True,
            'operation': 'Triple Integral ∫∫∫ f(x,y,z) dx dy dz',
            'result': str(third),
            'latex_result': sp.latex(third),
            'steps': [
                {'description': 'Integrand', 'latex': sp.latex(expr)},
                {'description': 'Integrate w.r.t. x', 'latex': sp.latex(first)},
                {'description': 'Integrate w.r.t. y', 'latex': sp.latex(second)},
                {'description': 'Integrate w.r.t. z', 'latex': sp.latex(third)},
            ]
        })

    def handle_simplify(self, expr):
        simplified = sp.simplify(expr)
        return JsonResponse({
            'ok': True,
            'operation': 'Simplify',
            'result': str(simplified),
            'latex_result': sp.latex(simplified),
            'steps': [
                {'description': 'Simplified Expression', 'latex': sp.latex(simplified)}
            ]
        })

    def handle_solve(self, expr, var):
        solutions = sp.solve(expr, var, dict=True)
        solutions_str = [str(sol.get(var, sol)) for sol in solutions] if solutions else []
        solutions_latex = [sp.latex(sol.get(var, sol)) for sol in solutions] if solutions else []
        return JsonResponse({
            'ok': True,
            'operation': f'Solve for {var}',
            'result': solutions_str,
            'latex_result': solutions_latex
        })

    def parse_limit(self, value):
        if value is None or value == '':
            raise ValueError('Limit value cannot be empty.')
        if isinstance(value, (int, float)):
            return sp.sympify(value)
        text = str(value).strip()
        if text in self.LIMIT_LOCALS:
            return self.LIMIT_LOCALS[text]
        try:
            return sp.sympify(text, locals=self.LIMIT_LOCALS)
        except Exception as exc:
            raise ValueError(f'Invalid limit value "{value}": {exc}')


@method_decorator(csrf_exempt, name='dispatch')
class CurrencyConverterAPIView(View):
    API_TEMPLATE = 'https://api.exchangerate-api.com/v4/latest/{base}'
    FALLBACK_RATES = {
        'USD': 1,
        'INR': 83.12,
        'EUR': 0.92,
        'GBP': 0.79,
        'JPY': 150.54,
        'AUD': 1.53,
        'CAD': 1.36,
        'CNY': 7.18,
        'CHF': 0.88,
        'AED': 3.67,
    }

    def post(self, request):
        try:
            payload = json.loads(request.body)
            amount = float(payload.get('amount'))
            from_currency = payload.get('from_currency')
            to_currency = payload.get('to_currency')

            if amount <= 0:
                raise ValueError('Amount must be positive.')
            if not from_currency or not to_currency:
                raise ValueError('Both currencies are required.')
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            return JsonResponse({'ok': False, 'error': str(exc)}, status=400)

        rates_data = self.fetch_rates(from_currency.upper())
        if not rates_data['rates']:
            return JsonResponse({'ok': False, 'error': 'Unable to fetch exchange rates.'}, status=503)

        rate = self.calculate_rate(
            rates_data['rates'],
            rates_data['base'],
            from_currency.upper(),
            to_currency.upper()
        )

        if rate is None:
            return JsonResponse({'ok': False, 'error': 'Conversion rate unavailable for selected currencies.'}, status=400)

        converted_amount = amount * rate
        result_text = f"{amount:.2f} {from_currency.upper()} = {converted_amount:.2f} {to_currency.upper()}"

        return JsonResponse({
            'ok': True,
            'result': result_text,
            'rate': round(rate, 4),
            'timestamp': rates_data['timestamp'].isoformat(),
            'fallback': rates_data['fallback']
        })

    def fetch_rates(self, base_currency):
        try:
            response = requests.get(self.API_TEMPLATE.format(base=base_currency), timeout=5)
            response.raise_for_status()
            data = response.json()
            rates = data.get('rates', {})
            timestamp = datetime.fromtimestamp(data.get('time_last_updated', datetime.utcnow().timestamp()))
            return {
                'rates': rates,
                'base': data.get('base', base_currency),
                'timestamp': timestamp,
                'fallback': False
            }
        except Exception:
            rates = self.FALLBACK_RATES
            timestamp = datetime.utcnow()
            return {
                'rates': rates,
                'base': 'USD',
                'timestamp': timestamp,
                'fallback': True
            }

    @staticmethod
    def calculate_rate(rates, base, from_currency, to_currency):
        if not rates:
            return None
        if from_currency == to_currency:
            return 1.0

        def rate_for(currency):
            if currency == base:
                return 1.0
            return rates.get(currency)

        from_rate = rate_for(from_currency)
        to_rate = rate_for(to_currency)
        if not from_rate or not to_rate:
            return None
        return to_rate / from_rate
