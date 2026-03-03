let exchangeRates = {
    IDR: { buy: 1, sell: 1 }
};

let currentMode = 'manual';

const manualModeBtn = document.getElementById('manualMode');
const sheetsModeBtn = document.getElementById('sheetsMode');
const sheetsConfig = document.getElementById('sheetsConfig');
const sheetsUrlInput = document.getElementById('sheetsUrl');
const loadSheetsBtn = document.getElementById('loadSheets');
const newCurrencyInput = document.getElementById('newCurrency');
const addBtn = document.getElementById('addBtn');
const ratesList = document.getElementById('ratesList');
const statusEl = document.getElementById('status');
const whatsappInput = document.getElementById('whatsappNumber');
const saveWhatsappBtn = document.getElementById('saveWhatsapp');
const marketOpenToggle = document.getElementById('marketOpen');
const statusText = document.getElementById('statusText');
const googleSheetIdInput = document.getElementById('googleSheetId');
const saveSheetIdBtn = document.getElementById('saveSheetId');
const loadFromSheetsBtn = document.getElementById('loadFromSheets');

function init() {
    loadAdminRates();
    loadWhatsAppConfig();
    loadMarketStatus();
    renderRates();
    
    manualModeBtn.addEventListener('click', () => switchMode('manual'));
    sheetsModeBtn.addEventListener('click', () => switchMode('sheets'));
    loadSheetsBtn.addEventListener('click', loadFromGoogleSheets);
    addBtn.addEventListener('click', addCurrency);
    saveWhatsappBtn.addEventListener('click', saveWhatsAppNumber);
    marketOpenToggle.addEventListener('change', toggleMarketStatus);
    saveSheetIdBtn.addEventListener('click', saveGoogleSheetId);
    loadFromSheetsBtn.addEventListener('click', loadRatesFromGoogleSheets);
}

function switchMode(mode) {
    currentMode = mode;
    
    if (mode === 'manual') {
        manualModeBtn.classList.add('active');
        sheetsModeBtn.classList.remove('active');
        sheetsConfig.classList.add('hidden');
    } else {
        manualModeBtn.classList.remove('active');
        sheetsModeBtn.classList.add('active');
        sheetsConfig.classList.remove('hidden');
    }
}

function renderRates() {
    ratesList.innerHTML = '';
    
    const priorityCurrencies = ['IDR', 'USD', 'SGD', 'JPY', 'EUR', 'AUD'];
    const allCurrencies = Object.keys(exchangeRates);
    
    // Separate priority and other currencies
    const otherCurrencies = allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort();
    
    // Combine: priority currencies first, then others
    const orderedCurrencies = [
        ...priorityCurrencies.filter(c => allCurrencies.includes(c)),
        ...otherCurrencies
    ];
    
    orderedCurrencies.forEach(currency => {
        const rateItem = document.createElement('div');
        rateItem.className = 'rate-item' + (currency === 'IDR' ? ' base' : '');
        
        const isBase = currency === 'IDR';
        const rates = exchangeRates[currency];
        
        // Check if currency has denominations (SAR)
        if (currency === 'SAR' && rates.denominations) {
            // Render SAR with denominations
            rateItem.innerHTML = `
                <label>${currency}</label>
                <div class="sar-denominations">
                    <div class="denom-section">
                        <span class="denom-title">500</span>
                        <div class="rate-inputs">
                            <div class="rate-input-group">
                                <span class="rate-label">Buy</span>
                                <input type="number" value="${rates.denominations['500'].buy}" step="0.01" data-currency="${currency}" data-type="buy" data-denom="500">
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-label">Sell</span>
                                <input type="number" value="${rates.denominations['500'].sell}" step="0.01" data-currency="${currency}" data-type="sell" data-denom="500">
                            </div>
                        </div>
                    </div>
                    <div class="denom-section">
                        <span class="denom-title">100</span>
                        <div class="rate-inputs">
                            <div class="rate-input-group">
                                <span class="rate-label">Buy</span>
                                <input type="number" value="${rates.denominations['100'].buy}" step="0.01" data-currency="${currency}" data-type="buy" data-denom="100">
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-label">Sell</span>
                                <input type="number" value="${rates.denominations['100'].sell}" step="0.01" data-currency="${currency}" data-type="sell" data-denom="100">
                            </div>
                        </div>
                    </div>
                    <div class="denom-section">
                        <span class="denom-title">50</span>
                        <div class="rate-inputs">
                            <div class="rate-input-group">
                                <span class="rate-label">Buy</span>
                                <input type="number" value="${rates.denominations['50'].buy}" step="0.01" data-currency="${currency}" data-type="buy" data-denom="50">
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-label">Sell</span>
                                <input type="number" value="${rates.denominations['50'].sell}" step="0.01" data-currency="${currency}" data-type="sell" data-denom="50">
                            </div>
                        </div>
                    </div>
                    <div class="denom-section">
                        <span class="denom-title">10/5</span>
                        <div class="rate-inputs">
                            <div class="rate-input-group">
                                <span class="rate-label">Buy</span>
                                <input type="number" value="${rates.denominations['10'].buy}" step="0.01" data-currency="${currency}" data-type="buy" data-denom="10">
                            </div>
                            <div class="rate-input-group">
                                <span class="rate-label">Sell</span>
                                <input type="number" value="${rates.denominations['10'].sell}" step="0.01" data-currency="${currency}" data-type="sell" data-denom="10">
                            </div>
                        </div>
                    </div>
                </div>
                <button class="update-btn" onclick="updateSARRate('${currency}')">Update</button>
                <button class="delete-btn" onclick="deleteCurrency('${currency}')">Delete</button>
            `;
        } else {
            rateItem.innerHTML = `
                <label>${currency}</label>
                <div class="rate-inputs">
                    <div class="rate-input-group">
                        <span class="rate-label">Buy</span>
                        <input type="number" 
                               value="${rates.buy}" 
                               step="0.01" 
                               data-currency="${currency}"
                               data-type="buy"
                               ${isBase ? 'readonly' : ''}>
                    </div>
                    <div class="rate-input-group">
                        <span class="rate-label">Sell</span>
                        <input type="number" 
                               value="${rates.sell}" 
                               step="0.01" 
                               data-currency="${currency}"
                               data-type="sell"
                               ${isBase ? 'readonly' : ''}>
                    </div>
                </div>
                <button class="update-btn" onclick="updateRate('${currency}')" ${isBase ? 'disabled' : ''}>Update</button>
                <button class="delete-btn" onclick="deleteCurrency('${currency}')" ${isBase ? 'disabled' : ''}>Delete</button>
            `;
        }
        
        ratesList.appendChild(rateItem);
    });
}

function addCurrency() {
    const currency = newCurrencyInput.value.trim().toUpperCase();
    const buyRate = parseFloat(document.getElementById('newBuyRate').value);
    const sellRate = parseFloat(document.getElementById('newSellRate').value);
    
    if (!currency || currency.length !== 3) {
        showStatus('Please enter a valid 3-letter currency code', 'error');
        return;
    }
    
    if (!buyRate || buyRate <= 0 || !sellRate || sellRate <= 0) {
        showStatus('Please enter valid buy and sell rates', 'error');
        return;
    }
    
    // Special handling for SAR - create with denominations
    if (currency === 'SAR') {
        exchangeRates[currency] = {
            buy: buyRate,
            sell: sellRate,
            denominations: {
                '500': { buy: buyRate, sell: sellRate },
                '100': { buy: buyRate, sell: sellRate },
                '50': { buy: buyRate, sell: sellRate },
                '10': { buy: buyRate, sell: sellRate }
            }
        };
    } else {
        exchangeRates[currency] = { buy: buyRate, sell: sellRate };
    }
    
    saveAdminRates();
    renderRates();
    
    newCurrencyInput.value = '';
    document.getElementById('newBuyRate').value = '';
    document.getElementById('newSellRate').value = '';
    
    if (currency === 'SAR') {
        showStatus(`${currency} added with denominations. Please update individual denomination rates below.`, 'success');
    } else {
        showStatus(`${currency} added successfully`, 'success');
    }
}

function updateRate(currency) {
    const buyInput = document.querySelector(`input[data-currency="${currency}"][data-type="buy"]:not([data-denom])`);
    const sellInput = document.querySelector(`input[data-currency="${currency}"][data-type="sell"]:not([data-denom])`);
    const buyRate = parseFloat(buyInput.value);
    const sellRate = parseFloat(sellInput.value);
    
    if (buyRate > 0 && sellRate > 0) {
        exchangeRates[currency] = { buy: buyRate, sell: sellRate };
        saveAdminRates();
        showStatus(`${currency} rates updated`, 'success');
    }
}

function updateSARRate(currency) {
    const denom500Buy = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="buy"][data-denom="500"]`).value);
    const denom500Sell = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="sell"][data-denom="500"]`).value);
    const denom100Buy = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="buy"][data-denom="100"]`).value);
    const denom100Sell = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="sell"][data-denom="100"]`).value);
    const denom50Buy = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="buy"][data-denom="50"]`).value);
    const denom50Sell = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="sell"][data-denom="50"]`).value);
    const denom10Buy = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="buy"][data-denom="10"]`).value);
    const denom10Sell = parseFloat(document.querySelector(`input[data-currency="${currency}"][data-type="sell"][data-denom="10"]`).value);
    
    if (denom500Buy > 0 && denom500Sell > 0 && denom100Buy > 0 && denom100Sell > 0 && denom50Buy > 0 && denom50Sell > 0 && denom10Buy > 0 && denom10Sell > 0) {
        exchangeRates[currency] = {
            buy: denom500Buy, // Default for display
            sell: denom500Sell,
            denominations: {
                '500': { buy: denom500Buy, sell: denom500Sell },
                '100': { buy: denom100Buy, sell: denom100Sell },
                '50': { buy: denom50Buy, sell: denom50Sell },
                '10': { buy: denom10Buy, sell: denom10Sell }
            }
        };
        saveAdminRates();
        showStatus(`${currency} rates updated`, 'success');
    }
}

function deleteCurrency(currency) {
    if (currency === 'IDR') return;
    
    if (confirm(`Delete ${currency}?`)) {
        delete exchangeRates[currency];
        saveAdminRates();
        renderRates();
        showStatus(`${currency} deleted`, 'success');
    }
}

async function loadFromGoogleSheets() {
    const url = sheetsUrlInput.value.trim();
    
    if (!url) {
        showStatus('Please enter a Google Sheets URL', 'error');
        return;
    }
    
    let csvUrl = url;
    if (url.includes('/edit')) {
        csvUrl = url.replace('/edit#gid=', '/export?format=csv&gid=');
        csvUrl = csvUrl.replace('/edit?usp=sharing', '/export?format=csv');
        csvUrl = csvUrl.replace('/edit', '/export?format=csv');
    }
    
    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        
        const lines = text.split('\n');
        const newRates = { IDR: { buy: 1, sell: 1 } };
        
        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) return;
            
            const [currency, buyRate, sellRate] = line.split(',').map(s => s.trim());
            if (currency && buyRate && sellRate && !isNaN(buyRate) && !isNaN(sellRate)) {
                newRates[currency] = { buy: parseFloat(buyRate), sell: parseFloat(sellRate) };
            }
        });
        
        if (Object.keys(newRates).length > 1) {
            exchangeRates = newRates;
            saveAdminRates();
            renderRates();
            showStatus('Rates loaded from Google Sheets successfully', 'success');
        } else {
            showStatus('No valid rates found in the sheet', 'error');
        }
    } catch (error) {
        showStatus('Error loading from Google Sheets. Make sure it\'s published as CSV.', 'error');
        console.error(error);
    }
}

function publishRates() {
    const ratesData = {
        exchangeRates: exchangeRates,
        whatsappNumber: localStorage.getItem('whatsappNumber') || '',
        marketOpen: localStorage.getItem('marketOpen') !== 'false',
        lastUpdated: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(ratesData, null, 2);
    
    // Save to localStorage as backup
    localStorage.setItem('adminExchangeRates', JSON.stringify(exchangeRates));
    
    // Create downloadable JSON file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rates.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus('✓ Rates file downloaded! Upload this rates.json file to your GitHub repository.', 'success');
}

function saveAdminRates() {
    localStorage.setItem('adminRates', JSON.stringify(exchangeRates));
    localStorage.setItem('sheetsUrl', sheetsUrlInput.value);
}

function loadAdminRates() {
    const savedRates = localStorage.getItem('adminRates');
    const savedUrl = localStorage.getItem('sheetsUrl');
    
    if (savedRates) {
        exchangeRates = JSON.parse(savedRates);
    }
    
    if (savedUrl) {
        sheetsUrlInput.value = savedUrl;
    }
}

function loadWhatsAppConfig() {
    const savedNumber = localStorage.getItem('whatsappNumber');
    if (savedNumber) {
        whatsappInput.value = savedNumber;
    }
    
    const savedSheetId = localStorage.getItem('googleSheetId');
    if (savedSheetId) {
        googleSheetIdInput.value = savedSheetId;
    }
}

function saveGoogleSheetId() {
    const sheetId = googleSheetIdInput.value.trim();
    
    if (!sheetId) {
        showStatus('Please enter a Google Sheet ID', 'error');
        return;
    }
    
    localStorage.setItem('googleSheetId', sheetId);
    showStatus('✓ Google Sheet ID saved! Customers will now load rates from your Google Sheet.', 'success');
}

async function loadRatesFromGoogleSheets() {
    const sheetId = googleSheetIdInput.value.trim() || localStorage.getItem('googleSheetId');
    
    if (!sheetId) {
        showStatus('Please enter and save a Google Sheet ID first', 'error');
        return;
    }
    
    try {
        const ratesUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const settingsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Settings`;
        
        // Load rates
        const ratesResponse = await fetch(ratesUrl);
        const ratesCSV = await ratesResponse.text();
        exchangeRates = parseRatesCSV(ratesCSV);
        
        // Load settings
        const settingsResponse = await fetch(settingsUrl);
        const settingsCSV = await settingsResponse.text();
        parseSettingsCSV(settingsCSV);
        
        // Save to localStorage
        saveAdminRates();
        renderRates();
        
        showStatus('✓ Rates loaded from Google Sheets successfully!', 'success');
    } catch (error) {
        showStatus('Error loading from Google Sheets. Check your Sheet ID and make sure it\'s published.', 'error');
        console.error(error);
    }
}

function parseRatesCSV(csv) {
    const rates = { IDR: { buy: 1, sell: 1 } };
    const lines = csv.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').map(s => s.replace(/"/g, '').trim());
        const currency = parts[0];
        const buyRate = parseFloat(parts[1]);
        const sellRate = parseFloat(parts[2]);
        const denomination = parts[3];
        
        if (!currency || isNaN(buyRate) || isNaN(sellRate)) continue;
        
        if (currency === 'SAR' && denomination) {
            if (!rates.SAR) {
                rates.SAR = {
                    buy: buyRate,
                    sell: sellRate,
                    denominations: {}
                };
            }
            rates.SAR.denominations[denomination] = { buy: buyRate, sell: sellRate };
        } else if (currency !== 'IDR') {
            rates[currency] = { buy: buyRate, sell: sellRate };
        }
    }
    
    return rates;
}

function parseSettingsCSV(csv) {
    const lines = csv.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').map(s => s.replace(/"/g, '').trim());
        const setting = parts[0];
        const value = parts[1];
        
        if (setting === 'WhatsApp') {
            whatsappInput.value = value;
            localStorage.setItem('whatsappNumber', value);
        } else if (setting === 'MarketOpen') {
            const isOpen = value === 'true';
            marketOpenToggle.checked = isOpen;
            localStorage.setItem('marketOpen', isOpen);
            
            if (isOpen) {
                statusText.textContent = 'Market is OPEN';
                statusText.className = 'status-text open';
            } else {
                statusText.textContent = 'Market is CLOSED';
                statusText.className = 'status-text closed';
            }
        }
    }
}

function loadMarketStatus() {
    const marketOpen = localStorage.getItem('marketOpen');
    if (marketOpen === 'false') {
        marketOpenToggle.checked = false;
        statusText.textContent = 'Market is CLOSED';
        statusText.className = 'status-text closed';
    } else {
        marketOpenToggle.checked = true;
        statusText.textContent = 'Market is OPEN';
        statusText.className = 'status-text open';
    }
}

function toggleMarketStatus() {
    const isOpen = marketOpenToggle.checked;
    localStorage.setItem('marketOpen', isOpen);
    
    if (isOpen) {
        statusText.textContent = 'Market is OPEN';
        statusText.className = 'status-text open';
        showStatus('Market status set to OPEN', 'success');
    } else {
        statusText.textContent = 'Market is CLOSED';
        statusText.className = 'status-text closed';
        showStatus('Market status set to CLOSED', 'success');
    }
}

function saveWhatsAppNumber() {
    const number = whatsappInput.value.trim();
    
    if (!number) {
        showStatus('Please enter a WhatsApp number', 'error');
        return;
    }
    
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length < 10) {
        showStatus('Please enter a valid WhatsApp number', 'error');
        return;
    }
    
    localStorage.setItem('whatsappNumber', cleanNumber);
    showStatus('WhatsApp number saved successfully', 'success');
}

function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status';
    }, 5000);
}

window.updateRate = updateRate;
window.updateSARRate = updateSARRate;
window.deleteCurrency = deleteCurrency;

init();
