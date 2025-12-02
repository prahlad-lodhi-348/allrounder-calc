const fallbackRates = {
    USD: 1,
    INR: 83.12,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.54,
    AUD: 1.53,
    CAD: 1.36,
    CNY: 7.18,
    CHF: 0.88,
    AED: 3.67
};

let cachedRates = null;
let cachedBase = 'USD';
let cachedTimestamp = null;

async function fetchRates(base = 'USD') {
    const endpoint = `https://api.exchangerate-api.com/v4/latest/${base}`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('API response error');
        }
        const data = await response.json();
        cachedRates = data.rates;
        cachedBase = data.base || base;
        cachedTimestamp = data.time_last_updated
            ? new Date(data.time_last_updated * 1000)
            : new Date();

        localStorage.setItem('currencyRates', JSON.stringify({
            rates: cachedRates,
            base: cachedBase,
            timestamp: cachedTimestamp.toISOString()
        }));

        return { rates: cachedRates, base: cachedBase, timestamp: cachedTimestamp, isFallback: false };
    } catch (error) {
        console.warn('Falling back to static rates', error);
        const stored = localStorage.getItem('currencyRates');
        if (stored) {
            const parsed = JSON.parse(stored);
            cachedRates = parsed.rates;
            cachedBase = parsed.base;
            cachedTimestamp = new Date(parsed.timestamp);
            return { rates: cachedRates, base: cachedBase, timestamp: cachedTimestamp, isFallback: false };
        }
        cachedRates = fallbackRates;
        cachedBase = 'USD';
        cachedTimestamp = new Date();
        return { rates: cachedRates, base: cachedBase, timestamp: cachedTimestamp, isFallback: true };
    }
}

function calculateRate(rates, base, from, to) {
    if (!rates) return null;
    const fromRate = from === base ? 1 : rates[from];
    const toRate = to === base ? 1 : rates[to];
    if (!fromRate || !toRate) return null;

    return toRate / fromRate;
}

function formatTimestamp(date) {
    return date ? new Date(date).toLocaleString() : 'N/A';
}

async function convertCurrency(event) {
    if (event) {
        event.preventDefault();
    }

    const amountInput = document.getElementById('currency-amount');
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const resultDiv = document.getElementById('currency-result');

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-danger">Enter a valid amount greater than 0.</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="alert alert-info">Converting...</div>';

    const { rates, base, timestamp, isFallback } = await fetchRates(fromCurrency);
    const finalRate = calculateRate(rates, base, fromCurrency, toCurrency);

    if (!finalRate) {
        resultDiv.innerHTML = '<div class="alert alert-danger">Unable to fetch exchange rate for selected currencies.</div>';
        return;
    }

    const converted = amount * finalRate;
    const conversionText = `${amount.toFixed(2)} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`;

    resultDiv.innerHTML = `
        <div class="alert alert-success">
            <h5 class="mb-1">${conversionText}</h5>
            <div class="small text-muted">
                Rate: 1 ${fromCurrency} = ${finalRate.toFixed(4)} ${toCurrency}<br>
                Updated: ${formatTimestamp(timestamp)} ${isFallback ? '(Fallback)' : ''}
            </div>
        </div>
    `;

    saveConversionHistory({
        amount: amount.toFixed(2),
        from: fromCurrency,
        to: toCurrency,
        converted: converted.toFixed(2),
        rate: finalRate.toFixed(4),
        timestamp: new Date().toISOString(),
        fallback: isFallback
    });

    renderHistory();
}

function saveConversionHistory(entry) {
    const key = 'currencyHistory';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.unshift(entry);
    const trimmed = existing.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(trimmed));
}

function renderHistory() {
    const historyDiv = document.getElementById('currency-history');
    const history = JSON.parse(localStorage.getItem('currencyHistory') || '[]');

    if (!history.length) {
        historyDiv.innerHTML = '';
        return;
    }

    const items = history.map(item => `
        <li class="list-group-item d-flex flex-column flex-md-row justify-content-between">
            <span>${item.amount} ${item.from} → ${item.converted} ${item.to}</span>
            <small class="text-muted">Rate ${item.rate} • ${formatTimestamp(item.timestamp)} ${item.fallback ? '(Fallback)' : ''}</small>
        </li>
    `).join('');

    historyDiv.innerHTML = `
        <div class="recent-calculations">
            <h4>Recent Conversions</h4>
            <ul>
                ${items}
            </ul>
        </div>
    `;
}

function swapCurrencies() {
    const from = document.getElementById('from-currency');
    const to = document.getElementById('to-currency');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
}

function loadFavoritePairs() {
    const select = document.getElementById('favorite-pairs');
    const favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    select.innerHTML = '<option value="">Favorites</option>';
    favorites.forEach(pair => {
        const option = document.createElement('option');
        option.value = `${pair.from}|${pair.to}`;
        option.textContent = `${pair.from} → ${pair.to}`;
        select.appendChild(option);
    });
}

function saveFavoritePair() {
    const from = document.getElementById('from-currency').value;
    const to = document.getElementById('to-currency').value;
    if (from === to) return;

    const favorites = JSON.parse(localStorage.getItem('currencyFavorites') || '[]');
    const exists = favorites.some(pair => pair.from === from && pair.to === to);
    if (!exists) {
        favorites.push({ from, to });
        localStorage.setItem('currencyFavorites', JSON.stringify(favorites.slice(-5)));
        loadFavoritePairs();
    }
}

function handleFavoriteSelection(event) {
    const value = event.target.value;
    if (!value) return;
    const [from, to] = value.split('|');
    document.getElementById('from-currency').value = from;
    document.getElementById('to-currency').value = to;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('currency-form');
    const swapBtn = document.getElementById('swap-currencies');
    const saveFavoriteBtn = document.getElementById('save-favorite');
    const favoriteSelect = document.getElementById('favorite-pairs');

    if (form) form.addEventListener('submit', convertCurrency);
    if (swapBtn) swapBtn.addEventListener('click', () => {
        swapCurrencies();
        convertCurrency();
    });
    if (saveFavoriteBtn) saveFavoriteBtn.addEventListener('click', saveFavoritePair);
    if (favoriteSelect) favoriteSelect.addEventListener('change', handleFavoriteSelection);

    loadFavoritePairs();
    renderHistory();
});

