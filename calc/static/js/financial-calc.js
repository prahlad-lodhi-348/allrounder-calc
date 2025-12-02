// Financial Calculator Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Simple Interest Calculator
    document.getElementById('si-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const principal = parseFloat(document.getElementById('si-principal').value);
        const rate = parseFloat(document.getElementById('si-rate').value);
        const time = parseFloat(document.getElementById('si-time').value);

        if (isNaN(principal) || isNaN(rate) || isNaN(time) || principal <= 0 || rate <= 0 || time <= 0) {
            document.getElementById('si-result').innerHTML = '<div class="alert alert-danger">Please enter valid positive numbers for all fields.</div>';
            document.getElementById('si-result').style.display = 'block';
            return;
        }

        const simpleInterest = (principal * rate * time) / 100;
        const totalAmount = principal + simpleInterest;

        document.getElementById('si-result').innerHTML = `
            <div class="alert alert-success">
                <strong>Simple Interest: ₹${simpleInterest.toFixed(2)}</strong><br>
                <strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong>
            </div>
        `;
        document.getElementById('si-result').style.display = 'block';
    });

    // Compound Interest Calculator
    document.getElementById('ci-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const principal = parseFloat(document.getElementById('ci-principal').value);
        const rate = parseFloat(document.getElementById('ci-rate').value);
        const time = parseFloat(document.getElementById('ci-time').value);
        const frequency = parseFloat(document.getElementById('ci-frequency').value);

        if (isNaN(principal) || isNaN(rate) || isNaN(time) || isNaN(frequency) || principal <= 0 || rate <= 0 || time <= 0 || frequency <= 0) {
            document.getElementById('ci-result').innerHTML = '<div class="alert alert-danger">Please enter valid positive numbers for all fields.</div>';
            document.getElementById('ci-result').style.display = 'block';
            return;
        }

        const compoundAmount = principal * Math.pow(1 + (rate / 100) / frequency, frequency * time);
        const compoundInterest = compoundAmount - principal;

        document.getElementById('ci-result').innerHTML = `
            <div class="alert alert-success">
                <strong>Compound Interest: ₹${compoundInterest.toFixed(2)}</strong><br>
                <strong>Total Amount: ₹${compoundAmount.toFixed(2)}</strong>
            </div>
        `;
        document.getElementById('ci-result').style.display = 'block';
    });

    // Simple Interest Plot Button
    document.getElementById('si-plot-btn').addEventListener('click', function() {
        const principal = parseFloat(document.getElementById('si-principal').value);
        const rate = parseFloat(document.getElementById('si-rate').value);
        const time = parseFloat(document.getElementById('si-time').value);

        if (isNaN(principal) || isNaN(rate) || isNaN(time) || principal <= 0 || rate <= 0 || time <= 0) {
            alert('Please enter valid positive numbers for all fields.');
            return;
        }

        // Generate simple interest growth data
        const timePoints = [];
        const amountPoints = [];
        for (let t = 0; t <= time; t += 0.1) {
            timePoints.push(t);
            const si = (principal * rate * t) / 100;
            amountPoints.push(principal + si);
        }

        // Plot the data directly
        const data = {
            x_values: timePoints,
            y_values: amountPoints
        };
        renderChart2D(data, `Simple Interest Growth: P=${principal}, R=${rate}%, T=${time}`, true);
    });

    // Compound Interest Plot Button
    document.getElementById('ci-plot-btn').addEventListener('click', function() {
        const principal = parseFloat(document.getElementById('ci-principal').value);
        const rate = parseFloat(document.getElementById('ci-rate').value);
        const time = parseFloat(document.getElementById('ci-time').value);
        const frequency = parseFloat(document.getElementById('ci-frequency').value);

        if (isNaN(principal) || isNaN(rate) || isNaN(time) || isNaN(frequency) || principal <= 0 || rate <= 0 || time <= 0 || frequency <= 0) {
            alert('Please enter valid positive numbers for all fields.');
            return;
        }

        // Generate compound interest growth data
        const timePoints = [];
        const amountPoints = [];
        for (let t = 0; t <= time; t += 0.1) {
            timePoints.push(t);
            const amount = principal * Math.pow(1 + (rate / 100) / frequency, frequency * t);
            amountPoints.push(amount);
        }

        // Plot the data directly
        const data = {
            x_values: timePoints,
            y_values: amountPoints
        };
        renderChart2D(data, `Compound Interest Growth: P=${principal}, R=${rate}%, T=${time}, F=${frequency}`, true);
    });
});
