# AllRounder Calc - Setup & Deployment Guide

## ✅ Local Development Setup (Already Done)

### 1. Virtual Environment Created ✅
```bash
# Virtual environment is already created in .venv/
# To activate it:
.venv\Scripts\activate.ps1  # On Windows PowerShell
source .venv/bin/activate   # On macOS/Linux
```

### 2. Dependencies Installed ✅
All packages from `requirements.txt` are installed:
- Django>=4.1
- sympy>=1.10
- gunicorn>=20.1
- whitenoise>=6.4
- numpy>=1.23
- dj-database-url>=1.3
- psycopg2-binary>=2.9
- python-dotenv>=0.21

### 3. .gitignore Configured ✅
Virtual environment (.venv/) and other sensitive files are in .gitignore

---

## 🚀 Ready for Git & Render Deployment

### Git Setup
```bash
# Initialize git (if not already done)
git init

# Add all files (except .venv and others in .gitignore)
git add .

# Commit
git commit -m "Initial commit - AllRounder Calculator"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Environment Variables for Render
When deploying to Render.com, set these environment variables:

1. **DJANGO_SECRET_KEY**: Generate a secure key
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

2. **DJANGO_DEBUG**: Set to `False` for production
   ```
   False
   ```

3. **DATABASE_URL**: Render automatically provides this (PostgreSQL)
   - Automatically set by Render
   - Project will use PostgreSQL on Render
   - SQLite used locally for development

### Build & Run Commands
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command**: `gunicorn allrounder_calc.wsgi:application`

---

## 📋 Running Locally

### Start Server
```bash
# Activate virtual environment first
.venv\Scripts\activate.ps1

# Run migrations (if needed)
python manage.py migrate

# Start development server
python manage.py runserver
```

### Run Tests
```bash
python manage.py test calc
```

### Create Superuser
```bash
python manage.py createsuperuser
```

---

## 🗑️ Cleanup Done
- ✅ Removed unused JavaScript files (script.js, etc.)
- ✅ Removed unused CSS files (modern-ui.css, etc.)
- ✅ Removed unused static/ directory
- ✅ Removed matplotlib dependencies
- ✅ Fixed test URL references
- ✅ Added OperationHistory to admin
- ✅ Added PostgreSQL support for Render

---

## 📦 Project Structure
```
allrounder_calc/
├── .venv/                    # Virtual environment (ignored in git)
├── .gitignore               # Git ignore rules
├── requirements.txt         # Python dependencies
├── runtime.txt             # Python version for Render
├── render.yaml             # Render deployment config
├── Procfile                # Production process file
├── manage.py               # Django management
├── db.sqlite3              # Development database
├── allrounder_calc/        # Project settings
│   ├── settings.py        # (Updated for Render)
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── calc/                   # Main app
│   ├── templates/
│   ├── static/
│   ├── models.py
│   ├── views.py
│   ├── api.py
│   ├── urls.py
│   └── api_urls.py
└── README.md               # Project documentation
```

---

## ✨ All Set for Production! 🚀

Your project is now:
- ✅ Cleaned up (no unused code)
- ✅ Properly configured (settings.py supports both SQLite & PostgreSQL)
- ✅ Dependencies specified (requirements.txt)
- ✅ Virtual environment ready (.venv)
- ✅ Git ready (.gitignore configured)
- ✅ Render ready (render.yaml configured)

Next steps: Push to GitHub and deploy on Render.com
