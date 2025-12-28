// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded and ready!');
    initializeApp();
});

function initializeApp() {
    // Advanced Calculus
    setupAdvancedCalculus();
    
    // Financial Calculators
    setupSimpleInterest();
    setupCompoundInterest();
    setupCurrencyConverter();
    setupEMI();
    setupUnitsConverter();
    setupHealthCalculators();
    setupBusinessTools();
    setupMathTools();
}

// ==================== UNITS CONVERTER ====================

// Conversion factors to base units
const conversionFactors = {
    length: { // Base: meter
        m: 1,
        km: 1000,
        cm: 0.01,
        mm: 0.001,
        ft: 0.3048,
        inch: 0.0254,
        yard: 0.9144,
        mile: 1609.34
    },
    weight: { // Base: kilogram
        kg: 1,
        g: 0.001,
        mg: 0.000001,
        lb: 0.453592,
        oz: 0.0283495,
        ton: 1000
    },
    volume: { // Base: liter
        L: 1,
        ml: 0.001,
        gallon: 3.78541,
        m3: 1000,
        cm3: 0.001,
        pint: 0.473176,
        cup: 0.236588,
        'fl-oz': 0.0295735
    },
    speed: { // Base: meter/second
        ms: 1,
        kmh: 0.277778,
        mph: 0.44704,
        knot: 0.51444,
        fps: 0.3048
    },
    energy: { // Base: Joule
        J: 1,
        kJ: 1000,
        cal: 4.184,
        kcal: 4184,
        Wh: 3600,
        kWh: 3600000,
        eV: 1.60218e-19
    },
    area: { // Base: square meter
        m2: 1,
        km2: 1000000,
        cm2: 0.0001,
        ft2: 0.092903,
        in2: 0.00064516,
        mi2: 2589988,
        yd2: 0.836127,
        ha: 10000,
        acre: 4046.86,
        bigha: 2500,
        decimal: 40.4686,
        are: 100
    },
    time: { // Base: second
        s: 1,
        min: 60,
        h: 3600,
        day: 86400,
        week: 604800,
        month: 2592000,
        year: 31536000,
        ms: 0.001,
        us: 0.000001,
        ns: 0.000000001
    },
    data: { // Base: byte
        b: 1,
        kb: 1024,
        mb: 1048576,
        gb: 1073741824,
        tb: 1099511627776,
        pb: 1125899906842624,
        bit: 0.125,
        kib: 1024,
        mib: 1048576,
        gib: 1073741824
    },
    angle: { // Base: degree
        deg: 1,
        rad: 57.2958,
        grad: 1.11111,
        arcmin: 0.0166667,
        arcsec: 0.000277778,
        rev: 360
    },
    pressure: { // Base: pascal
        pa: 1,
        kpa: 1000,
        bar: 100000,
        psi: 6894.76,
        atm: 101325,
        torr: 133.322,
        mmhg: 133.322,
        mbar: 100
    },
    density: { // Base: kg/m³
        kgm3: 1,
        gcm3: 1000,
        lbft3: 16.0185,
        lbin3: 27680,
        glgal: 0.264172,
        kgl: 1
    },
    frequency: { // Base: Hz
        hz: 1,
        khz: 1000,
        mhz: 1000000,
        ghz: 1000000000,
        rpm: 0.0166667
    }
};

function setupUnitsConverter() {
    // Add event listeners for real-time conversion
    const categories = ['len', 'wt', 'vol', 'spd', 'eng', 'area', 'time', 'data', 'angle', 'pressure', 'density', 'freq'];
    categories.forEach(cat => {
        const valueInput = document.getElementById(`${cat}-value`);
        if (valueInput) {
            valueInput.addEventListener('input', () => {
                if (cat === 'len') convertLength();
                else if (cat === 'wt') convertWeight();
                else if (cat === 'vol') convertVolume();
                else if (cat === 'spd') convertSpeed();
                else if (cat === 'eng') convertEnergy();
                else if (cat === 'area') convertArea();
                else if (cat === 'time') convertTime();
                else if (cat === 'data') convertData();
                else if (cat === 'angle') convertAngle();
                else if (cat === 'pressure') convertPressure();
                else if (cat === 'density') convertDensity();
                else if (cat === 'freq') convertFrequency();
            });
        }
    });
}

function convertLength() {
    convertUnits('len', conversionFactors.length);
}

function convertWeight() {
    convertUnits('wt', conversionFactors.weight);
}

function convertVolume() {
    convertUnits('vol', conversionFactors.volume);
}

function convertSpeed() {
    convertUnits('spd', conversionFactors.speed);
}

function convertEnergy() {
    convertUnits('eng', conversionFactors.energy);
}

function convertArea() {
    convertUnits('area', conversionFactors.area);
}

function convertTime() {
    convertUnits('time', conversionFactors.time);
}

function convertData() {
    convertUnits('data', conversionFactors.data);
}

function convertAngle() {
    convertUnits('angle', conversionFactors.angle);
}

function convertPressure() {
    convertUnits('pressure', conversionFactors.pressure);
}

function convertDensity() {
    convertUnits('density', conversionFactors.density);
}

function convertFrequency() {
    convertUnits('freq', conversionFactors.frequency);
}

function convertTemperature() {
    const value = parseFloat(document.getElementById('temp-value').value);
    const fromUnit = document.getElementById('temp-from').value;
    const toUnit = document.getElementById('temp-to').value;
    const resultDiv = document.getElementById('temp-result');

    if (isNaN(value)) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a valid value</div>';
        return;
    }

    let celsius = value;

    // Convert to Celsius first
    if (fromUnit === 'F') {
        celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'K') {
        celsius = value - 273.15;
    }

    // Convert from Celsius to target unit
    let result = celsius;
    if (toUnit === 'F') {
        result = (celsius * 9/5) + 32;
    } else if (toUnit === 'K') {
        result = celsius + 273.15;
    }

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>${value}</strong> ${document.getElementById('temp-from').options[document.getElementById('temp-from').selectedIndex].text}
            = <strong>${result.toFixed(4)}</strong> ${document.getElementById('temp-to').options[document.getElementById('temp-to').selectedIndex].text}
        </div>
    `;
}

function convertUnits(prefix, factors) {
    const value = parseFloat(document.getElementById(`${prefix}-value`).value);
    const fromUnit = document.getElementById(`${prefix}-from`).value;
    const toUnit = document.getElementById(`${prefix}-to`).value;
    const resultDiv = document.getElementById(`${prefix}-result`);

    if (isNaN(value)) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a valid value</div>';
        return;
    }

    // Convert to base unit, then to target unit
    const baseValue = value * factors[fromUnit];
    const result = baseValue / factors[toUnit];

    const fromLabel = document.getElementById(`${prefix}-from`).options[document.getElementById(`${prefix}-from`).selectedIndex].text;
    const toLabel = document.getElementById(`${prefix}-to`).options[document.getElementById(`${prefix}-to`).selectedIndex].text;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>${value}</strong> ${fromLabel}
            = <strong>${result.toFixed(6)}</strong> ${toLabel}
        </div>
    `;
}

// ===================================
// ADVANCED CALCULUS CALCULATOR
// ===================================
function setupAdvancedCalculus() {
    const operationSelect = document.getElementById('operation');
    const calcBtn = document.getElementById('calc-btn');
    
    // Show/hide fields based on operation
    if (operationSelect) {
        operationSelect.addEventListener('change', function() {
            updateFieldVisibility(this.value);
        });
        
        // Initialize
        updateFieldVisibility(operationSelect.value);
    }
    
    // Calculate button
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateAdvanced);
    }
}

function updateFieldVisibility(operation) {
    const varSection = document.getElementById('var-section');
    const limitsSection = document.getElementById('limits-section');
    const plotSection = document.getElementById('plot-section');
    const ySection = document.getElementById('y-section');
    const ySectionMax = document.getElementById('y-section-max');
    
    // Hide all first
    if (varSection) varSection.style.display = 'none';
    if (limitsSection) limitsSection.style.display = 'none';
    if (plotSection) plotSection.style.display = 'none';
    if (ySection) ySection.style.display = 'none';
    if (ySectionMax) ySectionMax.style.display = 'none';
    
    // Show based on operation
    if (['differentiate', 'partial_derivative', 'indefinite_int', 'solve', 'roots', 'limit', 'series', 'trig_expand'].includes(operation)) {
        if (varSection) varSection.style.display = 'flex';
    }
    if (operation === 'definite_int') {
        if (varSection) varSection.style.display = 'flex';
        if (limitsSection) limitsSection.style.display = 'flex';
    }
    if (operation === 'plot_2d') {
        if (plotSection) plotSection.style.display = 'flex';
    }
    if (operation === 'plot_3d') {
        if (plotSection) plotSection.style.display = 'flex';
        if (ySection) ySection.style.display = 'block';
        if (ySectionMax) ySectionMax.style.display = 'block';
    }
}

async function calculateAdvanced() {
    const expr = document.getElementById('expr')?.value?.trim();
    const operation = document.getElementById('operation')?.value;
    const variable = document.getElementById('var')?.value || 'x';
    const resultDiv = document.getElementById('result');
    
    if (!expr) {
        showResult(resultDiv, '<div class="alert alert-danger">Please enter an expression</div>');
        return;
    }
    
    showResult(resultDiv, '<div class="alert alert-info">Calculating...</div>');
    
    try {
        const payload = {
            expr: expr,
            operation: operation,
            variable: variable
        };
        
        // Add limits for definite integral
        if (operation === 'definite_int') {
            payload.lower_limit = document.getElementById('lower-limit')?.value || '0';
            payload.upper_limit = document.getElementById('upper-limit')?.value || '1';
        }
        
        // Add plot settings
        if (operation === 'plot_2d' || operation === 'plot_3d') {
            payload.x_min = parseFloat(document.getElementById('x-min')?.value || '-10');
            payload.x_max = parseFloat(document.getElementById('x-max')?.value || '10');
            payload.points = parseInt(document.getElementById('points')?.value || '200');
            
            if (operation === 'plot_3d') {
                payload.y_min = parseFloat(document.getElementById('y-min')?.value || '-10');
                payload.y_max = parseFloat(document.getElementById('y-max')?.value || '10');
            }
        }
        
        // Get CSRF token
        const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]')?.value || '';
        
        // Make request
        const response = await fetch('/api/advanced-calculus/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            showResult(resultDiv, `<div class="alert alert-danger">Error: ${data.error || 'Unknown error'}</div>`);
            return;
        }
        
        // Handle plots
        if (operation === 'plot_2d' || operation === 'plot_3d') {
            if (data.plot_image) {
                const html = `
                    <div class="alert alert-success">
                        <strong>Plot Generated Successfully!</strong>
                        <div class="mt-3 text-center">
                            <img src="${data.plot_image}" alt="Plot" style="max-height: 500px;">
                        </div>
                    </div>
                `;
                showResult(resultDiv, html);
            } else {
                showResult(resultDiv, '<div class="alert alert-danger">Could not generate plot</div>');
            }
        } else {
            // Handle regular results
            let html = '<div class="alert alert-success">';
            
            if (data.result) {
                html += `<strong>Result:</strong><br><code>${formatResult(data.result)}</code>`;
            } else if (data.simplified) {
                html += `<strong>Simplified:</strong><br><code>${formatResult(data.simplified)}</code>`;
            }
            
            if (data.steps && Array.isArray(data.steps)) {
                html += '<br><br><strong>Steps:</strong><br>';
                data.steps.forEach((step, idx) => {
                    if (typeof step === 'object') {
                        html += `${idx + 1}. ${step.description || step.latex || step}<br>`;
                    } else {
                        html += `${idx + 1}. ${step}<br>`;
                    }
                });
            }
            
            html += '</div>';
            showResult(resultDiv, html);
        }
    } catch (error) {
        console.error('Error:', error);
        showResult(resultDiv, `<div class="alert alert-danger">Error: ${error.message}</div>`);
    }
}

function formatResult(result) {
    if (Array.isArray(result)) {
        return result.join(', ');
    }
    return String(result);
}

function showResult(div, html) {
    if (div) {
        div.innerHTML = html;
    }
}

// ===================================
// FINANCIAL CALCULATORS
// ===================================
function setupSimpleInterest() {
    const btn = document.getElementById('si-btn');
    if (btn) {
        btn.addEventListener('click', calculateSI);
    }
}

function calculateSI() {
    const principal = parseFloat(document.getElementById('si-principal')?.value || 0);
    const rate = parseFloat(document.getElementById('si-rate')?.value || 0);
    const time = parseFloat(document.getElementById('si-time')?.value || 0);
    const resultDiv = document.getElementById('si-result');
    
    if (principal <= 0 || rate < 0 || time <= 0) {
        showResult(resultDiv, '<div class="alert alert-danger">Please enter valid values</div>');
        return;
    }
    
    const si = (principal * rate * time) / 100;
    const amount = principal + si;
    
    const html = `
        <div class="alert alert-success">
            <strong>Results:</strong><br>
            Principal: ₹${principal.toFixed(2)}<br>
            Interest: ₹${si.toFixed(2)}<br>
            Total Amount: ₹${amount.toFixed(2)}
        </div>
    `;
    showResult(resultDiv, html);
    
    // Show pie chart
    showSIPieChart(principal, si);
}

function showSIPieChart(principal, interest) {
    const ctx = document.getElementById('si-chart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (window.siChart) window.siChart.destroy();
    
    window.siChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#3b82f6', '#10b981'],
                borderColor: ['#1e40af', '#059669'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Simple Interest Breakdown',
                    color: '#ffffff'
                }
            }
        }
    });
}

function setupCompoundInterest() {
    const btn = document.getElementById('ci-btn');
    if (btn) {
        btn.addEventListener('click', calculateCI);
    }
}

function calculateCI() {
    const principal = parseFloat(document.getElementById('ci-principal')?.value || 0);
    const rate = parseFloat(document.getElementById('ci-rate')?.value || 0);
    const time = parseFloat(document.getElementById('ci-time')?.value || 0);
    const resultDiv = document.getElementById('ci-result');
    
    if (principal <= 0 || rate < 0 || time <= 0) {
        showResult(resultDiv, '<div class="alert alert-danger">Please enter valid values</div>');
        return;
    }
    
    const amount = principal * Math.pow(1 + rate / 100, time);
    const ci = amount - principal;
    
    const html = `
        <div class="alert alert-success">
            <strong>Results:</strong><br>
            Principal: ₹${principal.toFixed(2)}<br>
            Interest: ₹${ci.toFixed(2)}<br>
            Total Amount: ₹${amount.toFixed(2)}
        </div>
    `;
    showResult(resultDiv, html);
    
    // Show pie chart
    showCIPieChart(principal, ci);
}

function showCIPieChart(principal, interest) {
    const ctx = document.getElementById('ci-chart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (window.ciChart) window.ciChart.destroy();
    
    window.ciChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Compound Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#3b82f6', '#f59e0b'],
                borderColor: ['#1e40af', '#d97706'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Compound Interest Breakdown',
                    color: '#ffffff'
                }
            }
        }
    });
}

function setupCurrencyConverter() {
    const btn = document.getElementById('cc-btn');
    if (btn) {
        btn.addEventListener('click', convertCurrency);
    }
}

async function convertCurrency() {
    const amount = parseFloat(document.getElementById('cc-amount')?.value || 0);
    const from = document.getElementById('cc-from')?.value || 'USD';
    const to = document.getElementById('cc-to')?.value || 'INR';
    const resultDiv = document.getElementById('cc-result');
    
    if (amount <= 0) {
        showResult(resultDiv, '<div class="alert alert-danger">Please enter a valid amount</div>');
        return;
    }
    
    // Simple hardcoded rates for demo
    const rates = {
        'USD': 1,
        'INR': 83.12,
        'EUR': 0.92,
        'GBP': 0.79
    };
    
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const converted = amount * (toRate / fromRate);
    
    const html = `
        <div class="alert alert-success">
            <strong>${amount.toFixed(2)} ${from} = ${converted.toFixed(2)} ${to}</strong>
        </div>
    `;
    showResult(resultDiv, html);
}

function setupEMI() {
    const btn = document.getElementById('emi-btn');
    if (btn) {
        btn.addEventListener('click', calculateEMI);
    }
}

function calculateEMI() {
    const principal = parseFloat(document.getElementById('emi-principal')?.value || 0);
    const rate = parseFloat(document.getElementById('emi-rate')?.value || 0);
    const months = parseInt(document.getElementById('emi-months')?.value || 0);
    const resultDiv = document.getElementById('emi-result');
    
    if (principal <= 0 || rate < 0 || months <= 0) {
        showResult(resultDiv, '<div class="alert alert-danger">Please enter valid values</div>');
        return;
    }
    
    // EMI Formula: P * R * (1+R)^N / ((1+R)^N - 1)
    // Where R = Monthly Rate
    const monthlyRate = rate / 100 / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    
    const html = `
        <div class="alert alert-success">
            <strong>EMI Details:</strong><br>
            Loan Amount: ₹${principal.toFixed(2)}<br>
            Annual Rate: ${rate.toFixed(2)}%<br>
            Tenure: ${months} months<br>
            <hr style="margin: 10px 0;">
            <strong>Monthly EMI: ₹${emi.toFixed(2)}</strong><br>
            Total Payment: ₹${totalPayment.toFixed(2)}<br>
            Total Interest: ₹${totalInterest.toFixed(2)}
        </div>
    `;
    showResult(resultDiv, html);
    
    // Show pie chart
    showEMIPieChart(principal, totalInterest);
}

function showEMIPieChart(principal, interest) {
    const ctx = document.getElementById('emi-chart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (window.emiChart) window.emiChart.destroy();
    
    window.emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderColor: ['#1e40af', '#991b1b'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'EMI Breakdown',
                    color: '#ffffff'
                }
            }
        }
    });
}
// ==================== HEALTH & FITNESS CALCULATORS ====================

function setupHealthCalculators() {
    const shapeSelect = document.getElementById('shape');
    if (shapeSelect) {
        shapeSelect.addEventListener('change', updateGeometryInputs);
    }
}

function calculateBMI() {
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const height = parseFloat(document.getElementById('bmi-height').value);
    const unit = document.getElementById('bmi-unit').value;
    const resultDiv = document.getElementById('bmi-result');

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid values</div>';
        return;
    }

    let heightInMeters = height / 100;
    if (unit === 'imperial') {
        heightInMeters = (height * 0.0254);
        weight = weight * 0.453592;
    }

    const bmi = weight / (heightInMeters * heightInMeters);
    let category = '';
    let color = '';

    if (bmi < 18.5) { category = 'Underweight'; color = 'info'; }
    else if (bmi < 25) { category = 'Normal weight'; color = 'success'; }
    else if (bmi < 30) { category = 'Overweight'; color = 'warning'; }
    else { category = 'Obese'; color = 'danger'; }

    resultDiv.innerHTML = `
        <div class="alert alert-${color}">
            <strong>BMI: ${bmi.toFixed(1)}</strong><br>
            Category: ${category}
        </div>
    `;
}

function calculateBMR() {
    const age = parseFloat(document.getElementById('bmr-age').value);
    const weight = parseFloat(document.getElementById('bmr-weight').value);
    const height = parseFloat(document.getElementById('bmr-height').value);
    const gender = document.getElementById('bmr-gender').value;
    const activity = parseFloat(document.getElementById('tdee-activity').value);
    const resultDiv = document.getElementById('bmr-result');

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter all values</div>';
        return;
    }

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const tdee = bmr * activity;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>BMR: ${bmr.toFixed(0)} calories/day</strong><br>
            <strong>TDEE: ${tdee.toFixed(0)} calories/day</strong><br>
            <small>Activity Level: ${activity}x</small>
        </div>
    `;
}

const foodCalories = {
    rice: 130, bread: 79, chicken: 165, fish: 82, egg: 155,
    apple: 95, banana: 105, milk: 61, yogurt: 59, carrot: 25,
    broccoli: 34, pizza: 285
};

let totalCalories = 0;
let calorieLog = [];

function addCalorie() {
    const foodSelect = document.getElementById('food-select').value;
    const quantity = parseFloat(document.getElementById('food-quantity').value) || 1;
    const listDiv = document.getElementById('calorie-list');

    if (foodSelect === '0') {
        alert('Please select a food item');
        return;
    }

    const calories = foodCalories[foodSelect] * quantity;
    const foodName = document.getElementById('food-select').options[document.getElementById('food-select').selectedIndex].text;

    totalCalories += calories;
    calorieLog.push({ name: foodName, calories: calories.toFixed(0) });

    document.getElementById('total-cal').textContent = totalCalories.toFixed(0);

    let html = '<div class="alert alert-info"><strong>Food Log:</strong><br>';
    calorieLog.forEach((item, idx) => {
        html += `<span>${idx + 1}. ${item.name} - ${item.calories} cal</span><br>`;
    });
    html += '</div>';
    listDiv.innerHTML = html;
}

// ==================== BUSINESS & FINANCIAL TOOLS ====================

function setupBusinessTools() {
    // Setup event listeners if needed
}

function calculatePercent() {
    const type = document.getElementById('percent-type').value;
    const val1 = parseFloat(document.getElementById('percent-val1').value);
    const val2 = parseFloat(document.getElementById('percent-val2').value);
    const resultDiv = document.getElementById('percent-result');

    if (isNaN(val1) || isNaN(val2)) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid values</div>';
        return;
    }

    let result = '';
    if (type === 'percent') {
        result = `<strong>${val1}% of ${val2} = ${(val1 * val2 / 100).toFixed(2)}</strong>`;
    } else if (type === 'increase') {
        const increase = (val1 * val2 / 100);
        result = `<strong>${val1} + ${val2}% = ${(val1 + increase).toFixed(2)}</strong>`;
    } else if (type === 'decrease') {
        const decrease = (val1 * val2 / 100);
        result = `<strong>${val1} - ${val2}% = ${(val1 - decrease).toFixed(2)}</strong>`;
    } else if (type === 'what') {
        const percent = (val1 / val2 * 100);
        result = `<strong>${val1} is ${percent.toFixed(2)}% of ${val2}</strong>`;
    }

    resultDiv.innerHTML = `<div class="alert alert-success">${result}</div>`;
}

function calculateGST() {
    const amount = parseFloat(document.getElementById('gst-amount').value);
    const rate = parseFloat(document.getElementById('gst-rate').value);
    const resultDiv = document.getElementById('gst-result');

    if (isNaN(amount) || amount <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid amount</div>';
        return;
    }

    const gstAmount = (amount * rate / 100);
    const totalAmount = amount + gstAmount;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>Amount: ₹${amount.toFixed(2)}</strong><br>
            <strong>GST (${rate}%): ₹${gstAmount.toFixed(2)}</strong><br>
            <strong>Total: ₹${totalAmount.toFixed(2)}</strong>
        </div>
    `;
}

function calculateProfit() {
    const costPrice = parseFloat(document.getElementById('cost-price').value);
    const sellPrice = parseFloat(document.getElementById('sell-price').value);
    const resultDiv = document.getElementById('profit-result');

    if (isNaN(costPrice) || isNaN(sellPrice) || costPrice <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid values</div>';
        return;
    }

    const profit = sellPrice - costPrice;
    const profitPercent = (profit / costPrice * 100);

    let status = profit >= 0 ? 'Profit' : 'Loss';
    let color = profit >= 0 ? 'success' : 'danger';

    resultDiv.innerHTML = `
        <div class="alert alert-${color}">
            <strong>${status}: ₹${Math.abs(profit).toFixed(2)}</strong><br>
            <strong>Margin: ${profitPercent.toFixed(2)}%</strong>
        </div>
    `;
}

function calculateDiscount() {
    const originalPrice = parseFloat(document.getElementById('original-price').value);
    const discountPercent = parseFloat(document.getElementById('discount-percent').value);
    const resultDiv = document.getElementById('discount-result');

    if (isNaN(originalPrice) || isNaN(discountPercent) || originalPrice <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid values</div>';
        return;
    }

    const discountAmount = (originalPrice * discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>Original Price: ₹${originalPrice.toFixed(2)}</strong><br>
            <strong>Discount (${discountPercent}%): ₹${discountAmount.toFixed(2)}</strong><br>
            <strong>Final Price: ₹${finalPrice.toFixed(2)}</strong>
        </div>
    `;
}

function calculateHomeLoan() {
    const principal = parseFloat(document.getElementById('loan-amount').value);
    const rate = parseFloat(document.getElementById('loan-rate').value);
    const tenure = parseFloat(document.getElementById('loan-tenure').value);
    const resultDiv = document.getElementById('loan-result');

    if (isNaN(principal) || isNaN(rate) || isNaN(tenure) || principal <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter valid values</div>';
        return;
    }

    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>Monthly EMI: ₹${emi.toFixed(2)}</strong><br>
            <strong>Total Interest: ₹${totalInterest.toFixed(2)}</strong><br>
            <strong>Total Amount: ₹${totalAmount.toFixed(2)}</strong>
        </div>
    `;
}

// ==================== MATHEMATICS TOOLS ====================

function setupMathTools() {
    const shapeSelect = document.getElementById('shape');
    if (shapeSelect) {
        shapeSelect.addEventListener('change', updateGeometryInputs);
    }
}

function updateGeometryInputs() {
    const shape = document.getElementById('shape').value;
    const inputDiv = document.getElementById('geometry-inputs');
    let html = '';

    if (shape === 'circle') {
        html = '<div class="row mb-3"><div class="col-lg-4"><label class="form-label">Radius (r)</label><input type="number" id="circle-r" class="form-control form-control-custom" placeholder="Enter radius"></div></div>';
    } else if (shape === 'rectangle') {
        html = '<div class="row mb-3"><div class="col-lg-4"><label class="form-label">Length (l)</label><input type="number" id="rect-l" class="form-control form-control-custom" placeholder="Enter length"></div><div class="col-lg-4"><label class="form-label">Width (w)</label><input type="number" id="rect-w" class="form-control form-control-custom" placeholder="Enter width"></div></div>';
    } else if (shape === 'square') {
        html = '<div class="row mb-3"><div class="col-lg-4"><label class="form-label">Side (a)</label><input type="number" id="square-a" class="form-control form-control-custom" placeholder="Enter side"></div></div>';
    } else if (shape === 'triangle') {
        html = '<div class="row mb-3"><div class="col-lg-4"><label class="form-label">Base (b)</label><input type="number" id="triangle-b" class="form-control form-control-custom" placeholder="Enter base"></div><div class="col-lg-4"><label class="form-label">Height (h)</label><input type="number" id="triangle-h" class="form-control form-control-custom" placeholder="Enter height"></div></div>';
    } else if (shape === 'ellipse') {
        html = '<div class="row mb-3"><div class="col-lg-4"><label class="form-label">Semi-major axis (a)</label><input type="number" id="ellipse-a" class="form-control form-control-custom" placeholder="Enter a"></div><div class="col-lg-4"><label class="form-label">Semi-minor axis (b)</label><input type="number" id="ellipse-b" class="form-control form-control-custom" placeholder="Enter b"></div></div>';
    } else if (shape === 'trapezoid') {
        html = '<div class="row mb-3"><div class="col-lg-3"><label class="form-label">Base 1 (b1)</label><input type="number" id="trap-b1" class="form-control form-control-custom" placeholder="Enter b1"></div><div class="col-lg-3"><label class="form-label">Base 2 (b2)</label><input type="number" id="trap-b2" class="form-control form-control-custom" placeholder="Enter b2"></div><div class="col-lg-3"><label class="form-label">Height (h)</label><input type="number" id="trap-h" class="form-control form-control-custom" placeholder="Enter h"></div></div>';
    }

    inputDiv.innerHTML = html;
}

function calculateGeometry() {
    const shape = document.getElementById('shape').value;
    const resultDiv = document.getElementById('geometry-result');
    let area = 0, perimeter = 0;

    if (shape === 'circle') {
        const r = parseFloat(document.getElementById('circle-r').value);
        if (isNaN(r) || r <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid radius</div>';
            return;
        }
        area = Math.PI * r * r;
        perimeter = 2 * Math.PI * r;
    } else if (shape === 'rectangle') {
        const l = parseFloat(document.getElementById('rect-l').value);
        const w = parseFloat(document.getElementById('rect-w').value);
        if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid dimensions</div>';
            return;
        }
        area = l * w;
        perimeter = 2 * (l + w);
    } else if (shape === 'square') {
        const a = parseFloat(document.getElementById('square-a').value);
        if (isNaN(a) || a <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid side</div>';
            return;
        }
        area = a * a;
        perimeter = 4 * a;
    } else if (shape === 'triangle') {
        const b = parseFloat(document.getElementById('triangle-b').value);
        const h = parseFloat(document.getElementById('triangle-h').value);
        if (isNaN(b) || isNaN(h) || b <= 0 || h <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid dimensions</div>';
            return;
        }
        area = 0.5 * b * h;
        perimeter = 'N/A (need all sides)';
    } else if (shape === 'ellipse') {
        const a = parseFloat(document.getElementById('ellipse-a').value);
        const b = parseFloat(document.getElementById('ellipse-b').value);
        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid axes</div>';
            return;
        }
        area = Math.PI * a * b;
        perimeter = 'Approx: ' + (Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)))).toFixed(2);
    } else if (shape === 'trapezoid') {
        const b1 = parseFloat(document.getElementById('trap-b1').value);
        const b2 = parseFloat(document.getElementById('trap-b2').value);
        const h = parseFloat(document.getElementById('trap-h').value);
        if (isNaN(b1) || isNaN(b2) || isNaN(h) || b1 <= 0 || b2 <= 0 || h <= 0) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid dimensions</div>';
            return;
        }
        area = 0.5 * (b1 + b2) * h;
        perimeter = 'N/A (need all sides)';
    }

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>Area: ${area.toFixed(2)}</strong><br>
            <strong>Perimeter: ${typeof perimeter === 'number' ? perimeter.toFixed(2) : perimeter}</strong>
        </div>
    `;
}

function calculateStats() {
    const numbersText = document.getElementById('numbers').value;
    const resultDiv = document.getElementById('stats-result');

    if (!numbersText.trim()) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Enter numbers separated by commas</div>';
        return;
    }

    const numbers = numbersText.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    if (numbers.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid numbers</div>';
        return;
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const median = numbers.length % 2 === 0 ? (sorted[numbers.length / 2 - 1] + sorted[numbers.length / 2]) / 2 : sorted[Math.floor(numbers.length / 2)];
    
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>Count: ${numbers.length}</strong><br>
            <strong>Sum: ${sum.toFixed(2)}</strong><br>
            <strong>Mean: ${mean.toFixed(2)}</strong><br>
            <strong>Median: ${median.toFixed(2)}</strong><br>
            <strong>Std Dev: ${stdDev.toFixed(2)}</strong><br>
            <strong>Variance: ${variance.toFixed(2)}</strong>
        </div>
    `;
}

function calculateCombo() {
    const n = parseInt(document.getElementById('combo-n').value);
    const r = parseInt(document.getElementById('combo-r').value);
    const type = document.getElementById('combo-type').value;
    const resultDiv = document.getElementById('combo-result');

    if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Enter valid values (r ≤ n)</div>';
        return;
    }

    const factorial = (num) => {
        if (num <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= num; i++) result *= i;
        return result;
    };

    let result = 0, formula = '';

    if (type === 'fact') {
        result = factorial(n);
        formula = `${n}! = ${result}`;
    } else if (type === 'perm') {
        result = factorial(n) / factorial(n - r);
        formula = `P(${n},${r}) = ${n}!/(${n}-${r})! = ${result}`;
    } else if (type === 'comb') {
        result = factorial(n) / (factorial(r) * factorial(n - r));
        formula = `C(${n},${r}) = ${n}!/(${r}!×${n - r}!) = ${result}`;
    }

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <strong>${formula}</strong><br>
            <strong>Result: ${result}</strong>
        </div>
    `;
}