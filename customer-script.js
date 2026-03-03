let exchangeRates = {};
let whatsappNumber = '';
let transactionType = 'buy'; // 'buy' or 'sell'

const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const resultDisplay = document.getElementById('resultDisplay');
const rateInfo = document.getElementById('rateInfo');
const confirmBtn = document.getElementById('confirmBtn');

function init() {
    checkMarketStatus();
    loadRates();
    loadWhatsAppNumber();
    
    amountInput.addEventListener('input', convert);
    currencySelect.addEventListener('change', convert);
    buyBtn.addEventListener('click', () => setTransactionType('buy'));
    sellBtn.addEventListener('click', () => setTransactionType('sell'));
    confirmBtn.addEventListener('click', confirmRate);
    
    const showRatesBtn = document.getElementById('showRatesBtn');
    if (showRatesBtn) {
        showRatesBtn.addEventListener('click', () => {
            window.location.href = 'all-rates.html';
        });
    }
}

function checkMarketStatus() {
    const marketOpen = localStorage.getItem('marketOpen');
    const banner = document.getElementById('marketClosedBanner');
    const confirmBtn = document.getElementById('confirmBtn');
    const btnText = confirmBtn.querySelector('span:last-child');
    
    if (marketOpen === 'false') {
        banner.classList.remove('hidden');
        btnText.textContent = 'Contact Admin';
    } else {
        banner.classList.add('hidden');
        btnText.textContent = 'Lock Rate via WhatsApp';
    }
}

function setTransactionType(type) {
    transactionType = type;
    
    if (type === 'buy') {
        buyBtn.classList.add('active');
        sellBtn.classList.remove('active');
    } else {
        buyBtn.classList.remove('active');
        sellBtn.classList.add('active');
    }
    
    convert();
    checkMarketStatus(); // Update button text when switching transaction type
}

function loadRates() {
    // ONLY load from Google Sheets
    const SHEET_ID = localStorage.getItem('googleSheetId') || '';
    
    const loadingStatus = document.getElementById('loadingStatus');
    const successStatus = document.getElementById('successStatus');
    
    if (!SHEET_ID) {
        // Show message to set up Google Sheets
        resultDisplay.textContent = 'Setup Required';
        rateInfo.innerHTML = 'Please ask administrator to set up Google Sheets. <a href="SIMPLE-SETUP.md" target="_blank">Setup Guide</a>';
        return;
    }
    
    // Show loading indicator
    loadingStatus.classList.remove('hidden');
    successStatus.classList.add('hidden');
    
    loadFromGoogleSheets(SHEET_ID);
}

function loadFromGoogleSheets(sheetId) {
    const ratesUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
    const settingsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Settings`;
    
    const loadingStatus = document.getElementById('loadingStatus');
    const successStatus = document.getElementById('successStatus');
    
    // Load rates
    fetch(ratesUrl)
        .then(response => response.text())
        .then(csv => {
            exchangeRates = parseRatesCSV(csv);
            populateCurrencySelects();
            convert();
            
            // Load settings
            return fetch(settingsUrl);
        })
        .then(response => response.text())
        .then(csv => {
            parseSettingsCSV(csv);
            checkMarketStatus();
            
            // Hide loading, show success
            loadingStatus.classList.add('hidden');
            successStatus.classList.remove('hidden');
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successStatus.classList.add('hidden');
            }, 3000);
        })
        .catch(error => {
            console.error('Error loading from Google Sheets:', error);
            loadingStatus.classList.add('hidden');
            resultDisplay.textContent = 'Rp. 0';
            rateInfo.textContent = 'Could not load rates. Please contact administrator.';
        });
}

function parseRatesCSV(csv) {
    const rates = {};
    const lines = csv.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').map(s => s.replace(/"/g, '').trim());
        const currency = parts[0];
        // Remove commas from numbers before parsing
        const buyRate = parseFloat(parts[1].replace(/,/g, ''));
        const sellRate = parseFloat(parts[2].replace(/,/g, ''));
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
        } else {
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
            whatsappNumber = value;
        } else if (setting === 'MarketOpen') {
            localStorage.setItem('marketOpen', value === 'true');
        }
    }
}

function loadWhatsAppNumber() {
    const savedNumber = localStorage.getItem('whatsappNumber');
    if (savedNumber) {
        whatsappNumber = savedNumber;
    }
}

function populateCurrencySelects() {
    const priorityCurrencies = ['USD', 'SGD', 'JPY', 'EUR', 'AUD'];
    const allCurrencies = Object.keys(exchangeRates).filter(c => c !== 'IDR');
    
    // Separate priority and other currencies
    const otherCurrencies = allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort();
    
    // Combine: priority currencies first, then others
    const orderedCurrencies = [
        ...priorityCurrencies.filter(c => allCurrencies.includes(c)),
        ...otherCurrencies
    ];
    
    currencySelect.innerHTML = '';
    
    orderedCurrencies.forEach(currency => {
        if (currency === 'SAR' && exchangeRates[currency].denominations) {
            // Add SAR with denominations
            currencySelect.add(new Option('SAR (500)', 'SAR_500'));
            currencySelect.add(new Option('SAR (100)', 'SAR_100'));
            currencySelect.add(new Option('SAR (50)', 'SAR_50'));
            currencySelect.add(new Option('SAR (10/5)', 'SAR_10'));
        } else {
            currencySelect.add(new Option(currency, currency));
        }
    });
}

function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    let currency = currencySelect.value;
    let denominationType = null;
    
    // Handle SAR denominations
    if (currency.startsWith('SAR_')) {
        denominationType = currency.split('_')[1];
        currency = 'SAR';
    }
    
    if (!currency || !exchangeRates[currency]) {
        resultDisplay.textContent = 'Rp. 0';
        return;
    }
    
    let rate;
    
    // Check if currency has denominations (SAR)
    if (exchangeRates[currency].denominations && denominationType) {
        const denom = exchangeRates[currency].denominations[denominationType];
        rate = transactionType === 'buy' ? denom.buy : denom.sell;
    } else {
        rate = transactionType === 'buy' ? exchangeRates[currency].buy : exchangeRates[currency].sell;
    }
    
    const result = amount * rate;
    
    // Format with thousand separators
    const formattedResult = result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    resultDisplay.textContent = 'Rp. ' + formattedResult;
    
    const typeText = transactionType === 'buy' ? 'We buy' : 'We sell';
    const formattedRate = rate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    let displayCurrency = currency;
    if (denominationType) {
        if (denominationType === '500') displayCurrency = 'SAR (500)';
        else if (denominationType === '100') displayCurrency = 'SAR (100)';
        else if (denominationType === '50') displayCurrency = 'SAR (50)';
        else if (denominationType === '10') displayCurrency = 'SAR (10/5)';
    }
    
    rateInfo.textContent = `${typeText} 1 ${displayCurrency} = Rp. ${formattedRate}`;
}

function confirmRate() {
    const amount = parseFloat(amountInput.value) || 0;
    let currency = currencySelect.value;
    let denominationType = null;
    
    // Handle SAR denominations
    if (currency.startsWith('SAR_')) {
        denominationType = currency.split('_')[1];
        currency = 'SAR';
    }
    
    if (!whatsappNumber) {
        alert('WhatsApp number not configured. Please contact administrator.');
        return;
    }
    
    if (!currency || !exchangeRates[currency]) {
        alert('Please complete the conversion first.');
        return;
    }
    
    let rate;
    
    // Check if currency has denominations (SAR)
    if (exchangeRates[currency].denominations && denominationType) {
        const denom = exchangeRates[currency].denominations[denominationType];
        rate = transactionType === 'buy' ? denom.buy : denom.sell;
    } else {
        rate = transactionType === 'buy' ? exchangeRates[currency].buy : exchangeRates[currency].sell;
    }
    
    const totalIDR = amount * rate;
    const action = transactionType === 'buy' ? 'BUY' : 'SELL';
    const formattedRate = rate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedTotal = totalIDR.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    let displayCurrency = currency;
    if (denominationType) {
        if (denominationType === '500') displayCurrency = 'SAR (500)';
        else if (denominationType === '100') displayCurrency = 'SAR (100)';
        else if (denominationType === '50') displayCurrency = 'SAR (50)';
        else if (denominationType === '10') displayCurrency = 'SAR (10/5)';
    }
    
    const message = `${action} ${amount} ${displayCurrency} @ Rp. ${formattedRate} = Rp. ${formattedTotal}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

init();
