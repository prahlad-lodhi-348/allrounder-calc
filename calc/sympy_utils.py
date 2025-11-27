import sympy as sp
import numpy as np

from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations, implicit_multiplication_application,
    convert_xor
)

# Safe transformations for parsing user input expressions
TRANSFORMATIONS = (standard_transformations +
                   (implicit_multiplication_application, convert_xor))


def safe_parse(expr_str):
    """
    Safely parse the user input expression string into a sympy expression.
    Raises ValueError for invalid expressions.
    """
    try:
        expr_str = expr_str.replace('X', 'x')
        expr = parse_expr(expr_str, transformations=TRANSFORMATIONS, evaluate=True)
        return expr
    except Exception as e:
        raise ValueError(f"Invalid expression: {e}")


def simplify_expr(expr):
    steps = []
    simplified = sp.simplify(expr)
    steps.append({
        "title": "Simplified Expression",
        "latex": sp.latex(simplified),
        "text": str(simplified)
    })
    return simplified, steps


def differentiate_expr(expr, var=sp.symbols('x')):
    steps = []
    derivative = sp.diff(expr, var)
    steps.append({
        "title": f"Differentiation with respect to {var}",
        "latex": sp.latex(derivative),
        "text": str(derivative)
    })
    return derivative, steps


def integrate_expr(expr, var=sp.symbols('x')):
    steps = []
    integral = sp.integrate(expr, var)
    steps.append({
        "title": f"Indefinite Integration with respect to {var}",
        "latex": sp.latex(integral),
        "text": str(integral)
    })
    return integral, steps


def solve_expr(expr, var=sp.symbols('x')):
    steps = []
    # If expression contains '=', split and create equation
    eq = expr
    if isinstance(expr, sp.Eq):
        solutions = sp.solve(expr, var)
    else:
        # Check if expr is an equality string like 'x**2-1=0'
        # Here we rely on user sending '=' as separate input or parse it before
        solutions = sp.solve(expr, var)
    steps.append({
        "title": "Solutions",
        "latex": ', '.join([sp.latex(sol) for sol in solutions]),
        "text": ', '.join([str(sol) for sol in solutions])
    })
    return solutions, steps


def prepare_plot_data(expr, var=sp.symbols('x'), xmin=-10, xmax=10, points=1000):
    """
    Generate x and y arrays for plotting using lambdify with numpy.

    Handles filtering of NaNs or Infs by replacing with None for JSON serialization.
    Caps resolution for performance.

    Returns dict with 'x' and 'y' lists.
    """
    # Validation of inputs
    points = min(points, 2000)  # cap resolution to max 2000 points
    xmin = float(xmin)
    xmax = float(xmax)
    if xmin >= xmax:
        xmin, xmax = xmax, xmin  # swap if inverted

    x_vals = np.linspace(xmin, xmax, points)
    f = sp.lambdify(var, expr, 'numpy')

    try:
        y_vals = f(x_vals)
    except Exception:
        y_vals = np.full_like(x_vals, np.nan)

    # Replace nan and inf with None for JSON serialization
    y_clean = []
    for val in y_vals:
        # Use numpy.isfinite to check if val is finite number
        try:
            if val is None or not np.isfinite(val):
                y_clean.append(None)
            elif abs(val) > 1e10:
                y_clean.append(None)
            else:
                y_clean.append(float(val))
        except Exception:
            y_clean.append(None)

    return {
        'x': x_vals.tolist(),
        'y': y_clean,
    }
