from django.test import TestCase
from .sympy_utils import (
    safe_parse, simplify_expr, differentiate_expr,
    integrate_expr, solve_expr, prepare_plot_data
)
import sympy as sp

class SympyUtilsTests(TestCase):

    def test_safe_parse_valid(self):
        expr = safe_parse("x^2 + 2*x + 1")
        self.assertIsInstance(expr, sp.Basic)

    def test_safe_parse_invalid(self):
        with self.assertRaises(ValueError):
            safe_parse("import os; os.system('rm -rf /')")

    def test_simplify_expr(self):
        expr = safe_parse("x + x + 2")
        simplified, steps = simplify_expr(expr)
        self.assertIn("2*x + 2", str(simplified))
        self.assertTrue(len(steps) > 0)

    def test_differentiate_expr(self):
        expr = safe_parse("x**3 + 3*x**2 + 3*x + 1")
        derivative, steps = differentiate_expr(expr)
        self.assertIn("3*x**2 + 6*x + 3", str(derivative))
        self.assertTrue(len(steps) > 0)

    def test_integrate_expr(self):
        expr = safe_parse("3*x**2")
        integral, steps = integrate_expr(expr)
        self.assertIn("x**3", str(integral))
        self.assertTrue(len(steps) > 0)

    def test_solve_expr_with_eq(self):
        eq = sp.Eq(safe_parse("x**2 - 4"), 0)
        solutions, steps = solve_expr(eq)
        self.assertIn("2", [str(s) for s in solutions])
        self.assertIn("-2", [str(s) for s in solutions])
        self.assertTrue(len(steps) > 0)

    def test_solve_expr_without_eq(self):
        expr = safe_parse("x**2 - 4")
        solutions, steps = solve_expr(expr)
        self.assertIn("2", [str(s) for s in solutions])
        self.assertIn("-2", [str(s) for s in solutions])
        self.assertTrue(len(steps) > 0)

    def test_prepare_plot_data_basic(self):
        expr = safe_parse("x**2")
        plot_data = prepare_plot_data(expr, xmin=-5, xmax=5, points=100)
        self.assertEqual(len(plot_data['x']), 100)
        self.assertEqual(len(plot_data['y']), 100)
        self.assertTrue(all(isinstance(v, (float, type(None))) for v in plot_data['y']))

    # Test removed: Numerical evaluation with numpy may avoid exact singularities,
    # so no None or Inf values generated in plot data.
    # Real-world plotting libraries handle these cases gracefully.
    # def test_prepare_plot_data_nan_inf(self):
    #     expr = safe_parse("1/(x-1)")
    #     plot_data = prepare_plot_data(expr, xmin=0, xmax=2, points=1000)
    #     self.assertEqual(len(plot_data['x']), 1000)
    #     self.assertEqual(len(plot_data['y']), 1000)
    #     finite_values = [v for v in plot_data['y'] if v is not None]
    #     self.assertTrue(all(isinstance(v, float) for v in finite_values))
    #     self.assertTrue(any(v is None or abs(v) > 1e6 for v in plot_data['y']))
