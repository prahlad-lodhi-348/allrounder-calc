x// API Integration for Financial Calculators and Plotting

document.addEventListener('DOMContentLoaded', function() {
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Simple Interest Calculator
    const siForm = document.getElementById('si-form');
    const siResult = document.getElementById('si-result');

    siForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const principal = parseFloat(document.getElementById('si-principal').value);
        const rate = parseFloat(document.getElementById('si-rate').value);
        const time = parseFloat(document.getElementById('si-time').value);

        // Validate inputs
        if (principal <= 0 || rate <= 0 || time <= 0) {
            showError(siResult, 'All values must be positive numbers.');
            return;
        }

        // Show loading
        showLoading(siResult, 'Calculating...');

        try {
            const response = await fetch('/api/simple-interest/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    principal: principal,
                    rate: rate,
                    time: time
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(siResult, `Simple Interest: ₹${data.result.toFixed(2)}`);
            }
                showError(siResult, data.error || 'Calculation failed.');
            }
        } catch (error) {
            showError(siResult, 'Network error. Please try again.');
        }
    });

    // Compound Interest Calculator
    const ciForm = document.getElementById('ci-form');
    const ciResult = document.getElementById('ci-result');

    ciForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const principal = parseFloat(document.getElementById('ci-principal').value);
        const rate = parseFloat(document.getElementById('ci-rate').value);
        const time = parseFloat(document.getElementById('ci-time').value);
        const frequency = parseInt(document.getElementById('ci-frequency').value);

        // Validate inputs
        if (principal <= 0 || rate <= 0 || time <= 0 || frequency <= 0) {
            showError(ciResult, 'All values must be positive numbers.');
            return;
        }

        // Show loading
        showLoading(ciResult, 'Calculating...');

        try {
            const response = await fetch('/api/compound-interest/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    principal: principal,
                    rate: rate,
                    time: time,
                    frequency: frequency
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(ciResult, `Total Amount: ₹${data.result.toFixed(2)}<br>Compound Interest: ₹${data.compound_interest.toFixed(2)}`);
            }
                showError(ciResult, data.error || 'Calculation failed.');
            }
        } catch (error) {
            showError(ciResult, 'Network error. Please try again.');
        }
    });

    // Plotting
    const plotBtn = document.getElementById('plot-btn');
    const exprInput = document.getElementById('expr-input');
    const xminInput = document.getElementById('xmin');
    const xmaxInput = document.getElementById('xmax');
    const pointsInput = document.getElementById('points');
    const plotlyContainer = document.getElementById('plotly-container');

    plotBtn.addEventListener('click', async function() {
        const expr = exprInput.value.trim();
        const xmin = parseFloat(xminInput.value);
        const xmax = parseFloat(xmaxInput.value);
        const points = parseInt(pointsInput.value);

        // Validate inputs
        if (!expr) {
            alert('Please enter an expression to plot.');
            return;
        }

        if (xmin >= xmax) {
            alert('X min must be less than X max.');
            return;
        }

        if (points < 10 || points > 2000) {
            alert('Points must be between 10 and 2000.');
            return;
        }

        // Show loading
        plotBtn.disabled = true;
        plotBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Plotting...';

        try {
            const response = await fetch('/api/plot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    expr: expr,
                    xmin: xmin,
                    xmax: xmax,
                    points: points
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Plot using Plotly
                const plotData = [{
                    x: data.data.x,
                    y: data.data.y,
                    type: 'scatter',
                    mode: 'lines',
                    name: expr
                }];

                const layout = {
                    title: `Plot of ${expr}`,
                    xaxis: { title: 'x' },
                    yaxis: { title: 'y' }
                };

                Plotly.newPlot(plotlyContainer, plotData, layout);

                // Log to history - extract variable from expression
                try {
                    if (window.LocalHistory && window.LocalHistory.save) {
                        // Simple variable detection (can be enhanced)
                        const variables = expr.match(/[a-zA-Z]/g) || [];
                        const uniqueVars = [...new Set(variables)];
                        const variableUsed = uniqueVars.length === 1 ? uniqueVars[0] : (uniqueVars.find(v => v.toLowerCase() === 'x') || uniqueVars[0] || 'x');

                        window.LocalHistory.save({
                            operation_type: 'plotting',
                            expression: expr,
                            result: `Plotted from x=${xmin} to x=${xmax} with ${points} points`,
                            variable_used: variableUsed,
                            status: 'success'
                        });
                        console.log('Plot operation saved to history');
                    } else {
                        console.warn('LocalHistory not available for plotting');
                    }
                } catch (error) {
                    console.error('Error saving plot to history:', error);
                }
            } else {
                alert('Plotting failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            // Reset button
            plotBtn.disabled = false;
            plotBtn.innerHTML = '<i class="fas fa-chart-line me-2"></i>Plot';
        }
    });

    // Helper functions
    function showLoading(element, message) {
        element.className = 'result-box alert alert-info mt-3';
        element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${message}`;
        element.style.display = 'block';
    }

    function showSuccess(element, message) {
        element.className = 'result-box alert alert-success mt-3';
        element.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
        element.style.display = 'block';
    }

    function showError(element, message) {
        element.className = 'result-box alert alert-danger mt-3';
        element.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
        element.style.display = 'block';
    }
});
