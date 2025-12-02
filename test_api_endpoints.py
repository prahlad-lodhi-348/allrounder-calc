#!/usr/bin/env python3
"""
Comprehensive API Testing Script for AllRounder Calc
Tests all endpoints including the fixes for capital X plotting and symbolic operations.
"""

import requests
import json
import sys

# Base URLs for different endpoints (change this for production)
API_BASE_URL = 'http://127.0.0.1:8000/api'
MAIN_BASE_URL = 'http://127.0.0.1:8000'

def test_plot_api():
    """Test Plot API endpoint with capital X expressions"""
    print("=== Testing Plot API ===")

    test_cases = [
        {"expr": "X**2", "xmin": -5, "xmax": 5, "points": 100},
        {"expr": "sin(X)", "xmin": -10, "xmax": 10, "points": 200},
        {"expr": "cos(X) + sin(X)", "xmin": 0, "xmax": 6.28, "points": 150},
        {"expr": "X/2", "xmin": -10, "xmax": 10, "points": 50},
    ]

    for i, case in enumerate(test_cases, 1):
        print(f"Test {i}: Plotting {case['expr']}")
        response = requests.post(f"{API_BASE_URL}/plot/", json=case)

        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                x_len = len(data['data']['x_values'])
                y_len = len(data['data']['y_values'])
                print(f"  ✓ Success: {x_len} x-values, {y_len} y-values")
            else:
                print(f"  ✗ API Error: {data.get('error')}")
        else:
            print(f"  ✗ HTTP Error: {response.status_code}")

def test_eval_api():
    """Test Eval API endpoint for differentiation, integration, solve"""
    print("\n=== Testing Eval API ===")

    test_cases = [
        {"expr": "x**2", "op": "diff"},
        {"expr": "sin(x)", "op": "diff"},
        {"expr": "x**3 + 2*x", "op": "diff"},
        {"expr": "x**2", "op": "integrate"},
        {"expr": "sin(x)", "op": "integrate"},
        {"expr": "1/x", "op": "integrate"},
        {"expr": "x**2 - 4", "op": "solve"},
        {"expr": "x + 5 = 10", "op": "solve"},
    ]

    for i, case in enumerate(test_cases, 1):
        print(f"Test {i}: {case['op']} of {case['expr']}")
        response = requests.post(f"{API_BASE_URL}/eval/", json=case)

        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                if case['op'] == 'solve':
                    result = data.get('result', [])
                    print(f"  ✓ Success: Solutions = {result}")
                else:
                    result = data.get('result', '')
                    print(f"  ✓ Success: Result = {result}")
            else:
                print(f"  ✗ API Error: {data.get('error')}")
        else:
            print(f"  ✗ HTTP Error: {response.status_code}")

def test_financial_calculators():
    """Test Financial Calculator APIs"""
    print("\n=== Testing Financial Calculators ===")

    # Simple Interest
    si_data = {"principal": 1000, "rate": 5, "time": 2}
    print("Test: Simple Interest Calculator")
    response = requests.post(f"{MAIN_BASE_URL}/api/simple-interest/", json=si_data)

    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            result = data.get('result', '')
            print(f"  ✓ Success: {result}")
        else:
            print(f"  ✗ API Error: {data.get('error')}")
    else:
        print(f"  ✗ HTTP Error: {response.status_code}")

    # Compound Interest
    ci_data = {"principal": 1000, "rate": 5, "time": 2, "frequency": 1}
    print("Test: Compound Interest Calculator")
    response = requests.post(f"{MAIN_BASE_URL}/api/compound-interest/", json=ci_data)

    if response.status_code == 200:
        data = response.json()
        if data.get('ok'):
            result = data.get('result', '')
            print(f"  ✓ Success: {result}")
        else:
            print(f"  ✗ API Error: {data.get('error')}")
    else:
        print(f"  ✗ HTTP Error: {response.status_code}")

def test_error_handling():
    """Test error handling scenarios"""
    print("\n=== Testing Error Handling ===")

    error_cases = [
        {"expr": "abc(def)", "op": "plot", "xmin": -5, "xmax": 5, "points": 100},  # Invalid expression
        {"expr": "", "op": "plot", "xmin": -5, "xmax": 5, "points": 100},  # Empty expression
        {"expr": "x**1000", "op": "plot", "xmin": -5, "xmax": 5, "points": 100},  # Complex expression
    ]

    for i, case in enumerate(error_cases, 1):
        print(f"Error Test {i}: {case['expr']}")
        if case['op'] == 'plot':
            response = requests.post(f"{API_BASE_URL}/plot/", json=case)
        else:
            response = requests.post(f"{API_BASE_URL}/eval/", json=case)

        if response.status_code == 400:
            data = response.json()
            if not data.get('ok'):
                print(f"  ✓ Expected Error: {data.get('error')}")
            else:
                print(f"  ? Unexpected Success: {data}")
        else:
            print(f"  ✗ Unexpected HTTP Status: {response.status_code}")

def main():
    """Run all tests"""
    print("Starting Comprehensive API Testing for AllRounder Calc")
    print("=" * 60)

    try:
        test_plot_api()
        test_eval_api()
        test_financial_calculators()
        test_error_handling()

        print("\n" + "=" * 60)
        print("Testing completed!")

    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to API server. Make sure Django is running on localhost:8000")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
