Test structure and quick runs

- Purpose: make tests fast and easy to run during development.

1) Fast standalone SymPy tests

- `test_features.py` can be run standalone and will initialize Django automatically.
  It uses small expressions and reduced plot resolution to keep runs quick.

  Run:

  ```powershell
  python test_features.py
  ```

2) Use the Django test runner (fast in-memory DB)

- `run_tests.py` sets `DJANGO_TESTING=True` and will cause `settings.py` to
  use an in-memory SQLite DB which speeds up database creation for tests.

- You can run all `calc` tests:

  ```powershell
  python run_tests.py
  ```

- Or run a subset (examples):

  ```powershell
  python run_tests.py unit        # run fast unit tests
  python run_tests.py convert     # run convert api tests only
  ```

3) Tips to speed tests further

- Keep SymPy expressions simple in unit tests.
- Mark slow integration tests and run them separately.
- Use environment variable `DJANGO_TESTING=True` when running CI jobs to
  use in-memory DB.

4) Timing output

- `run_tests.py` prints elapsed time for the full run.
- `test_features.py` prints per-test timings.

