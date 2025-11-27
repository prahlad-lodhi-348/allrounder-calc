from django.test import TestCase
from django.urls import reverse
import json

class CalculatorsApiTests(TestCase):

    def test_simple_interest_calculation(self):
        url = reverse('api_simple_interest')
        data = {
            'principal': 1000,
            'rate': 5,
            'time': 2
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('result', response_data)
        self.assertAlmostEqual(response_data['result'], 100.0, places=2)

    def test_compound_interest_calculation(self):
        url = reverse('api_compound_interest')
        data = {
            'principal': 1000,
            'rate': 5,
            'time': 2,
            'frequency': 1
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('result', response_data)
        self.assertAlmostEqual(response_data['result'], 1102.5, places=2)

    def test_plot_api_with_lowercase_x(self):
        url = reverse('api_plot')
        data = {
            'expr': 'x**2',
            'xmin': -5,
            'xmax': 5,
            'points': 100
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertTrue(response_data['ok'])
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']['x']), 100)
        self.assertEqual(len(response_data['data']['y']), 100)

    def test_plot_api_with_capital_X(self):
        url = reverse('api_plot')
        data = {
            'expr': 'X**2',
            'xmin': -5,
            'xmax': 5,
            'points': 100
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertTrue(response_data['ok'])
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']['x']), 100)
        self.assertEqual(len(response_data['data']['y']), 100)

    def test_plot_api_with_y_variable(self):
        url = reverse('api_plot')
        data = {
            'expr': 'y**2 + 2*y + 1',
            'xmin': -5,
            'xmax': 5,
            'points': 100
        }
        response = self.client.post(url, json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertTrue(response_data['ok'])
        self.assertIn('data', response_data)
        self.assertEqual(len(response_data['data']['x']), 100)
        self.assertEqual(len(response_data['data']['y']), 100)
