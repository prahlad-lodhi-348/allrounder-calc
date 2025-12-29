# AllRounder Calc

A Mathway-style web app built with Django, SymPy, and NumPy. It evaluates mathematical expressions, shows symbolic steps, and renders interactive 2D/3D graphs.

**Created by: Prahlad Lodhi**

## Features

- Advanced expression input with symbolic math evaluation
- Step-by-step solutions in LaTeX and plain text
- Operations: simplify, expand, factor, differentiate, integrate, solve, limits, series, and more
- Interactive 2D and 3D plotting
- Financial calculators (Simple Interest, Compound Interest)
- Currency converter
- Units converter
- Health and business calculation tools
- Secure expression parsing using SymPy's safe transformations
- Deployment-ready with WhiteNoise and Render.com support

## Local Setup & Run

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd allrounder_calc
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows
   .venv\Scripts\activate
   # On Unix or MacOS
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply migrations and run the development server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

5. Open your browser at `http://127.0.0.1:8000`

## Deployment on Render

1. Push your code to GitHub.

2. Create a new Web Service on Render.com and connect your GitHub repository.

3. Use the following settings:

   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn allrounder_calc.wsgi`

4. Set environment variables:

   - `DJANGO_SECRET_KEY`: your secret key
   - `DJANGO_DEBUG`: `False`

5. Make sure `ALLOWED_HOSTS` in `settings.py` includes `.onrender.com`.

6. Deploy and access your app at `https://your-service.onrender.com`

## Security Notes

- This project avoids using Python's `eval` for expression parsing, which can lead to arbitrary code execution vulnerabilities.
- Expressions are parsed using SymPy's `sympify` with safe transformations including implicit multiplication and XOR conversion.
- This prevents code injection by restricting the syntax and functions allowed.
- Additionally, basic validation on expression length and plot points limits is implemented.
- LaTeX strings are sanitized by outputting from SymPy itself, mitigating injection risks in templates.

## Tests

Run tests with:

```bash
python manage.py test calc
```

## Key Operations Supported

- **Basic**: Simplify, Expand, Factorize
- **Calculus**: Differentiate, Partial Derivatives, Indefinite/Definite Integrals, Limits, Series Expansion
- **Algebra**: Solve Equations, Find Roots
- **Trigonometry**: Simplify & Expand Trig expressions
- **Plotting**: 2D and 3D graphing
- **Financial**: Simple/Compound Interest, EMI, Currency Conversion
- **Utilities**: Units Conversion, Health Calculators

For more details, refer to SymPy and Plotly documentation.
