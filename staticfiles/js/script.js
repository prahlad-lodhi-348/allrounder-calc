// Safe event listener function
const safeAddEventListener = (selector, event, callback, options) => {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element) {
        element.addEventListener(event, callback, options);
    } else {
        console.warn(`Element not found: ${typeof selector === 'string' ? selector : selector.outerHTML}`);
    }
};

// Verify required elements on page load
const verifyElements = () => {
    const requiredIds = [
        'execute-btn',
        'clear-btn',
        'adv-expression',
        'operation-select',
        'variable-select',
        'result-content',
        'si-calculate-btn',
        'ci-calculate-btn',
        'convert-btn',
        'keyboard-btn',
        'plot-graph-btn'
    ];

    requiredIds.forEach(id => {
        if (!document.getElementById(id)) {
            console.warn(`Required element not found: #${id}`);
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    verifyElements();
    // Force dark theme on load
    if (document.body) {
        document.body.classList.remove('light-mode');
    }

    // Operation selector change handler - show/hide plot settings and variable selector
    const operationSelect = document.getElementById('operation-select');
    const variableGroup = document.getElementById('variable-group');
    const plotSettings = document.getElementById('plot-settings-section');

    safeAddEventListener(operationSelect, 'change', function() {
        const operation = this.value;

        // Show/hide variable selector based on operation
        if (operation === 'evaluate' || operation === 'simplify') {
            variableGroup.style.display = 'none';
        } else {
            variableGroup.style.display = 'block';
        }

        // Show/hide plot settings based on operation
        if (operation === 'plot_2d' || operation === 'plot_3d') {
            plotSettings.style.display = 'block';
        } else {
            plotSettings.style.display = 'none';
        }
    });

    // Execute button handler
    safeAddEventListener('#execute-btn', 'click', async function() {
        const expression = document.getElementById('adv-expression').value.trim();
        const uiOperation = document.getElementById('operation-select').value;
        const variable = document.getElementById('variable-select').value;

        if (!expression) {
            alert('Please enter an expression');
            return;
        }

        const resultContent = document.querySelector('.result-content');
        resultContent.innerHTML = '<div style="color: #50FFFF;">Calculating...</div>';

        try {
            // Map UI operations to backend operation codes
            const opMap = {
                evaluate: 'simplify',
                simplify: 'simplify',
                differentiate: 'partial_diff',
                partial_derivative: 'partial_diff',
                integrate: 'indefinite_int',
                definite_integral: 'definite_int',
                solve: 'solve',
                expand: 'simplify',
                factor: 'simplify',
                series: 'simplify',
                limit: 'simplify'
            };

        const isPlot = uiOperation === 'plot_2d' || uiOperation === 'plot_3d';

            if (!isPlot) {
                const payload = {
                    expr: expression,
                    operation: opMap[uiOperation] || 'simplify',
                    variable: variable
                };

                const response = await fetch('/api/advanced-calculus/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.ok) {
                    resultContent.innerHTML = `<strong>Result:</strong><br>${data.result}`;
                } else {
                    resultContent.innerHTML = `<span style="color: #FF6B6B;">Error: ${data.error}</span>`;
                }
                return;
            }

            // Frontend variable-count validation for plotting
            const varMatches = expression.match(/\b[xyzt]\b/g) || [];
            const uniqueVars = Array.from(new Set(varMatches));
            if (uiOperation === 'plot_3d' && uniqueVars.length > 2) {
                resultContent.innerHTML = `
                    <span style="color:#FF6B6B;">
                        3D Surface plotting requires at most 2 variables, but found ${uniqueVars.length}:
                        ${uniqueVars.join(', ')}. Please reduce the expression to 1–2 variables
                        or choose a different plotting method (e.g., parametric).
                    </span>
                `;
                return;
            }

            // Plotting via /api/plot/ (2D or 3D)
            const payload = {
                expr: expression,
                xmin: parseFloat(document.getElementById('x-min').value),
                xmax: parseFloat(document.getElementById('x-max').value),
                ymin: parseFloat(document.getElementById('y-min').value),
                ymax: parseFloat(document.getElementById('y-max').value),
                points: parseInt(document.getElementById('x-points').value),
                ypoints: parseInt(document.getElementById('y-points').value),
                source: 'advanced'
            };

            const response = await fetch('/api/plot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ok) {
                if (data.plot_type === '2d') {
                    resultContent.innerHTML = '<div style="color: #50FFFF;">2D Plot generated below</div>';
                    renderChart2D(data.data, expression);
                } else if (data.plot_type === '3d') {
                    resultContent.innerHTML = '<div style="color: #50FFFF;">3D Plot generated below</div>';
                    renderPlotly3D(data.data, expression);
                }
            } else {
                resultContent.innerHTML = `<span style="color: #FF6B6B;">Error: ${data.error}</span>`;
            }
        } catch (error) {
            console.error('Calculation error:', error);
            resultContent.innerHTML = '<span style="color: #FF6B6B;">Failed to calculate. Please check your expression.</span>';
        }
    });

    // Clear button handler
    safeAddEventListener('#clear-btn', 'click', function() {
        document.getElementById('adv-expression').value = '';
        document.querySelector('.result-content').innerHTML = 'Results will appear here after calculation...';

        // Clear any existing plots
        const plotContainer = document.getElementById('plot-container');
        const canvas = document.getElementById('plot-canvas');
        const surfaceDiv = document.getElementById('plotly-surface');

        if (plotContainer) plotContainer.style.display = 'none';
        if (canvas) canvas.style.display = 'none';
        if (surfaceDiv) surfaceDiv.style.display = 'none';

        if (lineChartInstance) {
            lineChartInstance.destroy();
            lineChartInstance = null;
        }
    });

    // Plot Graph button handler (Matplotlib backend)
    safeAddEventListener('#plot-graph-btn', 'click', async function() {
        const expressionEl = document.getElementById('adv-expression');
        const variableEl = document.getElementById('variable-select');
        const resultContent = document.getElementById('result-content');

        if (!expressionEl || !variableEl || !resultContent) {
            console.warn('Required elements for plotting not found.');
            return;
        }

        const expression = expressionEl.value.trim();
        const variable = variableEl.value;

        if (!expression) {
            alert('Please enter an expression to plot.');
            return;
        }

        resultContent.innerHTML = '<div style="color:#38bdf8;">Generating graph...</div>';

        const xMin = parseFloat(document.getElementById('x-min')?.value ?? '-10') || -10;
        const xMax = parseFloat(document.getElementById('x-max')?.value ?? '10') || 10;
        const numPoints = parseInt(document.getElementById('x-points')?.value ?? '400', 10) || 400;

        try {
            const response = await fetch('/api/plot-mpl/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    expression: expression,
                    variable: variable,
                    x_min: xMin,
                    x_max: xMax,
                    num_points: numPoints
                })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                const msg = data.error || 'Unable to generate graph.';
                resultContent.innerHTML = `<span style="color:#FF6B6B;">${msg}</span>`;
                return;
            }

            resultContent.innerHTML = `
                <div style="margin-bottom:0.5rem;color:#e5e7eb;">
                    Plotted graph for <code>${expression}</code> w.r.t <strong>${variable}</strong>
                </div>
                <img
                    src="data:image/png;base64,${data.image}"
                    alt="Plot of ${expression}"
                    style="max-width:100%;border-radius:12px;box-shadow:0 18px 45px rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.35);"
                />
            `;
        } catch (error) {
            console.error('Plot graph error:', error);
            resultContent.innerHTML = '<span style="color:#FF6B6B;">Unexpected error while plotting.</span>';
        }
    });

    // Ctrl+Enter shortcut for execute
    safeAddEventListener(document, 'keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('execute-btn').click();
        }
    });

    // Financial calculator tab switching
    document.querySelectorAll('.calc-tab').forEach(tab => {
        safeAddEventListener(tab, 'click', function() {
            document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const calcType = this.dataset.calc;
            document.getElementById(calcType + '-content').classList.add('active');
        });
    });
});

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

// Plotting function (generic for both simple and advanced)
async function requestPlot(payload, useFinancialContainer = false) {
    const plotLoading = document.getElementById(useFinancialContainer ? 'financial-plot-loading' : 'plot-loading');
    plotLoading.style.display = 'block';

    try {
        const response = await fetch('/api/plot/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        plotLoading.style.display = 'none';

        if (data.ok) {
            if (data.plot_type === '2d') {
                renderChart2D(data.data, payload.expression, useFinancialContainer);
            } else if (data.plot_type === '3d') {
                renderPlotly3D(data.data, payload.expression, useFinancialContainer);
            }
        } else {
            alert('Plotting error: ' + data.error);
        }
    } catch (error) {
        plotLoading.style.display = 'none';
        console.error('Plot error:', error);
        alert('Failed to generate plot');
    }
}

let lineChartInstance = null;

function renderChart2D(data, expression, useFinancialContainer = false) {
    const plotContainer = document.getElementById(useFinancialContainer ? 'financial-plot-container' : 'plot-container');
    const canvas = document.getElementById(useFinancialContainer ? 'financial-plot-canvas' : 'plot-canvas');
    const surfaceDiv = document.getElementById(useFinancialContainer ? 'financial-plotly-surface' : 'plotly-surface');

    plotContainer.style.display = 'block';
    surfaceDiv.style.display = 'none';
    canvas.style.display = 'block';

    if (lineChartInstance) {
        lineChartInstance.destroy();
    }
    const ctx = canvas.getContext('2d');
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.x_values,
            datasets: [{
                label: expression || 'f(x)',
                data: data.y_values,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.25)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderPlotly3D(data, expression) {
    const plotContainer = document.getElementById('plot-container');
    const canvas = document.getElementById('plot-canvas');
    const surfaceDiv = document.getElementById('plotly-surface');

    plotContainer.style.display = 'block';
    canvas.style.display = 'none';
    surfaceDiv.style.display = 'block';

    const trace = {
        type: 'surface',
        x: data.x_grid,
        y: data.y_grid,
        z: data.z_grid,
        colorscale: 'Viridis'
    };
    const layout = {
        title: expression || '3D Surface',
        autosize: true,
        scene: {
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' },
            zaxis: { title: 'Z' }
        }
    };
    Plotly.react(surfaceDiv, [trace], layout, {responsive: true});
}
