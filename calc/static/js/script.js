// script.js - External JavaScript for AllRounder Calc

let selectedOp = '';

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar button event listeners
    const buttons = document.querySelectorAll('#sidebar .btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedOp = btn.getAttribute('data-op');
            clearResults();
        });
    });

    // Evaluate button event listener
    document.getElementById('evaluate-btn').addEventListener('click', () => {
        const expr = document.getElementById('expr-input').value.trim();
        if (!expr) {
            alert('Please enter a math expression.');
            return;
        }
        evaluateExpression(expr, selectedOp);
    });

    // Plot button event listener
    document.getElementById('plot-btn').addEventListener('click', () => {
        const expr = document.getElementById('expr-input').value.trim();
        if (!expr) {
            alert('Please enter a math expression.');
            return;
        }
        const xmin = document.getElementById('xmin').value;
        const xmax = document.getElementById('xmax').value;
        const points = document.getElementById('points').value;
        plotExpression(expr, xmin, xmax, points);
    });

    // Simple Interest form submission
    document.getElementById('si-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const principal = parseFloat(document.getElementById('si-principal').value);
        const rate = parseFloat(document.getElementById('si-rate').value);
        const time = parseFloat(document.getElementById('si-time').value);
        const resultDiv = document.getElementById('si-result');
        resultDiv.textContent = '';

        if (isNaN(principal) || principal <= 0 ||
            isNaN(rate) || rate <= 0 ||
            isNaN(time) || time <= 0) {
            resultDiv.textContent = 'Please enter valid positive numbers for all fields.';
            return;
        }

        // Calculate simple interest locally
        const simpleInterest = (principal * rate * time) / 100;
        resultDiv.textContent = `Simple Interest: ${simpleInterest.toFixed(2)}`;
    });

    // Compound Interest form submission
    document.getElementById('ci-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const principal = parseFloat(document.getElementById('ci-principal').value);
        const rate = parseFloat(document.getElementById('ci-rate').value);
        const time = parseFloat(document.getElementById('ci-time').value);
        const frequency = parseInt(document.getElementById('ci-frequency').value);
        const resultDiv = document.getElementById('ci-result');
        resultDiv.textContent = '';

        if (isNaN(principal) || principal <= 0 ||
            isNaN(rate) || rate <= 0 ||
            isNaN(time) || time <= 0 ||
            isNaN(frequency) || frequency <= 0) {
            resultDiv.textContent = 'Please enter valid positive numbers for all fields.';
            return;
        }

        // Calculate compound interest locally
        const r = rate / 100;
        const amount = principal * Math.pow(1 + r / frequency, frequency * time);
        const compoundInterest = amount - principal;
        resultDiv.textContent = `Amount: ${amount.toFixed(2)} (Compound Interest: ${compoundInterest.toFixed(2)})`;


    });

    // Optional: Dark mode toggle (if implemented)
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
        // Load dark mode preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
});

// Utility functions
function clearResults() {
    const results = document.getElementById('results');
    results.innerHTML = '';
    Plotly.purge('plotly-container');
}

function evaluateExpression(expr, op) {
    clearResults();
    try {
        let result = '';
        let steps = [];

        // Parse and validate expression
        const parsedExpr = parseExpression(expr);
        if (!parsedExpr) {
            alert('Error: Invalid expression. Please use basic math functions.');
            return;
        }

        if (!op || op === 'simplify') {
            // For basic evaluation, just compute the result
            const evaluate = new Function('x', `return ${parsedExpr};`);
            const computedResult = evaluate(0); // Evaluate at x=0 for constants, or could be more sophisticated
            result = computedResult.toString();
            steps = [{
                title: 'Evaluated Expression',
                latex: expr,
                text: result
            }];
        } else if (op === 'diff') {
            // Call API for symbolic differentiation
            callSymbolicApi(expr, 'diff');
            return;
        } else if (op === 'integrate') {
            // Basic integration - this is simplified
            alert('Integration requires symbolic math library. Please use basic evaluation for now.');
            return;
        } else if (op === 'solve') {
            // Basic solving - this is simplified
            alert('Equation solving requires symbolic math library. Please use basic evaluation for now.');
            return;
        }

        renderSteps(steps);
    } catch (err) {
        alert('Failed to evaluate expression: ' + err.message);
    }
}

function renderSteps(steps) {
    const results = document.getElementById('results');
    steps.forEach(step => {
        const div = document.createElement('div');
        div.classList.add('step');
        const title = document.createElement('div');
        title.classList.add('step-title');
        title.textContent = step.title;
        const latex = document.createElement('div');
        latex.innerHTML = '\\(' + step.latex + '\\)';
        div.appendChild(title);
        div.appendChild(latex);
        results.appendChild(div);
    });
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function plotExpression(expr, xmin, xmax, points) {
    try {
        // Parse and validate expression
        const parsedExpr = parseExpression(expr);
        if (!parsedExpr) {
            alert('Error: Invalid expression for plotting. Please use basic math functions.');
            return;
        }

        // Generate plot data locally
        const plotData = generatePlotData(parsedExpr, xmin, xmax, points);

        // Render the plot
        renderPlot(plotData);
    } catch (err) {
        alert('Failed to plot expression: ' + err.message);
    }
}

function renderPlot(plotData) {
    const trace = {
        x: plotData.x,
        y: plotData.y,
        mode: 'lines',
        type: 'scatter',
        line: {color: '#0d6efd'}
    };
    const layout = {
        autosize: true,
        margin: { t: 30, b: 40, l: 50, r: 30 },
        xaxis: { title: 'x', autorange: true },
        yaxis: { title: 'y', autorange: true },
    };
    Plotly.newPlot('plotly-container', [trace], layout, {responsive: true});
}

// Local plotting functions (no API calls)
function parseExpression(expr) {
    try {
        // Replace common math functions with JavaScript equivalents
        let jsExpr = expr
            .replace(/\^/g, '**')  // Python power to JS power
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/pi/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/abs\(/g, 'Math.abs(');

        // Test if expression is valid by creating a function
        const testFunc = new Function('x', `return ${jsExpr};`);

        // Test with a few values to ensure it works
        testFunc(0);
        testFunc(1);

        return jsExpr;
    } catch (error) {
        return null;
    }
}

function generatePlotData(jsExpr, xmin, xmax, points) {
    const xMin = parseFloat(xmin);
    const xMax = parseFloat(xmax);
    const numPoints = Math.min(parseInt(points), 2000); // Cap at 2000 points

    if (xMin >= xMax || numPoints <= 0) {
        throw new Error('Invalid plot parameters');
    }

    const xValues = [];
    const yValues = [];

    // Create evaluation function
    const evaluate = new Function('x', `return ${jsExpr};`);

    // Generate x values
    const step = (xMax - xMin) / (numPoints - 1);
    for (let i = 0; i < numPoints; i++) {
        xValues.push(xMin + i * step);
    }

    // Generate y values
    for (const x of xValues) {
        try {
            const y = evaluate(x);
            if (typeof y === 'number' && isFinite(y) && Math.abs(y) < 1e10) {
                yValues.push(y);
            } else {
                yValues.push(null); // Invalid value
            }
        } catch (error) {
            yValues.push(null); // Evaluation error
        }
    }

    return {
        x: xValues,
        y: yValues
    };
}

// CSRF token helper function
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to call symbolic math API
async function callSymbolicApi(expr, op) {
    try {
        const csrfToken = getCookie('csrftoken');
        const response = await fetch('/api/eval/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                expr: expr,
                op: op
            })
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            renderSteps(data.steps);
        } else {
            alert('Error: ' + (data.error || 'Unknown error occurred'));
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
}
