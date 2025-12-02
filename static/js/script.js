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
        'keyboard-btn'
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
        const operation = document.getElementById('operation-select').value;
        const variable = document.getElementById('variable-select').value;

        if (!expression) {
            alert('Please enter an expression');
            return;
        }

        // Show loading state
        const resultContent = document.querySelector('.result-content');
        resultContent.innerHTML = '<div style="color: #50FFFF;">Calculating...</div>';

        try {
            let endpoint = '/api/calculate/';
            let payload = {
                expression: expression,
                operation: operation,
                variable: variable
            };

            // Handle plotting operations
            if (operation === 'plot_2d' || operation === 'plot_3d') {
                endpoint = '/api/plot/';
                payload = {
                    expression: expression,
                    x_min: parseFloat(document.getElementById('x-min').value),
                    x_max: parseFloat(document.getElementById('x-max').value),
                    y_min: parseFloat(document.getElementById('y-min').value),
                    y_max: parseFloat(document.getElementById('y-max').value),
                    x_points: parseInt(document.getElementById('x-points').value),
                    y_points: parseInt(document.getElementById('y-points').value)
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.ok) {
                if (operation === 'plot_2d') {
                    resultContent.innerHTML = '<div style="color: #50FFFF;">2D Plot generated below</div>';
                    renderChart2D(data.data, expression);
                } else if (operation === 'plot_3d') {
                    resultContent.innerHTML = '<div style="color: #50FFFF;">3D Plot generated below</div>';
                    renderPlotly3D(data.data, expression);
                } else {
                    resultContent.innerHTML = `<strong>Result:</strong><br>${data.result}`;
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
