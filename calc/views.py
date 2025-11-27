from django.shortcuts import render
from django.http import JsonResponse
import json

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
