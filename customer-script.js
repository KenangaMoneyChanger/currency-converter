// Configuration - Change this to your Google Sheet ID
const GOOGLE_SHEET_ID = '1hO8kaJKRr_sLOEVp5RDp5lu0nVKNdZDdhDO8WtBvRjA';

let exchangeRates = {};
let whatsappNumber = '6281286868170'; // Default WhatsApp number
let transactionType = 'buy';

const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const resultDisplay = document.getElementById('resultDisplay');
const rateInfo = document.getElementById('rateInfo');
const confirmBtn = document.getElementById('confirmBtn');
const loadingStatus = document.getElementById('loadingStatus');
const successStatus = document.getElementById('successStatus');

// Initialize
async function init() {
    setupEventListeners();
    await loadRatesFromGoogleSheets();
}

function setupEventListeners() {
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

async function loadRatesFromGoogleSheets() {
    try {
        loadingStatus.classList.remove('hidden');
        successStatus.classList.add('hidden');
        
        const ratesUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const settingsUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Settings`;
        
        // Load rates
        const ratesResponse = await fetch(ratesUrl);
        const ratesCSV = await ratesResponse.text();
        exchangeRates = parseRatesCSV(ratesCSV);
        
        // Load settings
        try {
            const settingsResponse = await fetch(settingsUrl);
            const settingsCSV = await settingsResponse.text();
            parseSettingsCSV(settingsCSV);
        } catch (e) {
            console.log('Settings sheet not found, using defaults');
        }
        
        populateCurrencyDropdown();
        checkMarketStatus();
        convert();
        
        loadingStatus.classList.add('hidden');
        successStatus.classList.remove('hidden');
        
        setTimeout(() => {
            successStatus.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('Error loading rates:', error);
        loadingStatus.classList.add('hidden');
        resultDisplay.textContent = 'Error loading rates';
        rateInfo.textContent = 'Please contact administrator';
    }
}

function parseRatesCSV(csv) {
    const rates = {};
    const lines = csv.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').slice(0, 4).map(s => s.replace(/"/g, '').trim());
        
        const currency = parts[0];
        // Remove ALL commas from rate strings before parsing
        const buyRateStr = (parts[1] || '').replace(/,/g, '');
        const sellRateStr = (parts[2] || '').replace(/,/g, '');
        const denomination = parts[3] || '';
        
        if (!currency) continue;
        
        const buyRate = parseFloat(buyRateStr);
        const sellRate = parseFloat(sellRateStr);
        
        if (isNaN(buyRate) || isNaN(sellRate)) continue;
        
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
    
    if (lines[0] && lines[0].includes('Currency')) {
        return;
    }
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').slice(0, 2).map(s => s.replace(/"/g, '').trim());
        const setting = parts[0];
        const value = parts[1];
        
        if (setting === 'Whatsapp' || setting === 'WhatsApp') {
            if (value) whatsappNumber = value;
        } else if (setting === 'MarketOpen') {
            localStorage.setItem('marketOpen', value.toLowerCase() === 'true');
        }
    }
}

function populateCurrencyDropdown() {
    const priorityCurrencies = ['USD', 'SGD', 'JPY', 'EUR', 'AUD'];
    const allCurrencies = Object.keys(exchangeRates);
    const otherCurrencies = allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort();
    
    const orderedCurrencies = [
        ...priorityCurrencies.filter(c => allCurrencies.includes(c)),
        ...otherCurrencies
    ];
    
    currencySelect.innerHTML = '';
    
    orderedCurrencies.forEach(currency => {
        if (currency === 'SAR' && exchangeRates[currency].denominations) {
            currencySelect.add(new Option('SAR (500)', 'SAR_500'));
            currencySelect.add(new Option('SAR (100)', 'SAR_100'));
            currencySelect.add(new Option('SAR (50)', 'SAR_50'));
            currencySelect.add(new Option('SAR (10/5)', 'SAR_10'));
        } else {
            currencySelect.add(new Option(currency, currency));
        }
    });
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
}

function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    let currency = currencySelect.value;
    let denominationType = null;
    
    if (currency.startsWith('SAR_')) {
        denominationType = currency.split('_')[1];
        currency = 'SAR';
    }
    
    if (!currency || !exchangeRates[currency]) {
        resultDisplay.textContent = 'Rp. 0';
        return;
    }
    
    let rate;
    
    if (exchangeRates[currency].denominations && denominationType) {
        const denom = exchangeRates[currency].denominations[denominationType];
        rate = transactionType === 'buy' ? denom.buy : denom.sell;
    } else {
        rate = transactionType === 'buy' ? exchangeRates[currency].buy : exchangeRates[currency].sell;
    }
    
    const result = amount * rate;
    
    // Format without decimals if it's a whole number, otherwise show decimals
    let formattedResult;
    if (result % 1 === 0) {
        formattedResult = result.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        formattedResult = result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
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

function checkMarketStatus() {
    const marketOpen = localStorage.getItem('marketOpen');
    const banner = document.getElementById('marketClosedBanner');
    const btnText = confirmBtn.querySelector('span:last-child');
    
    if (marketOpen === 'false') {
        banner.classList.remove('hidden');
        btnText.textContent = 'Contact Admin';
    } else {
        banner.classList.add('hidden');
        btnText.textContent = 'Lock Rate via WhatsApp';
    }
}

function confirmRate() {
    const amount = parseFloat(amountInput.value) || 0;
    let currency = currencySelect.value;
    let denominationType = null;
    
    if (currency.startsWith('SAR_')) {
        denominationType = currency.split('_')[1];
        currency = 'SAR';
    }
    
    if (!whatsappNumber) {
        alert('WhatsApp number not configured. Please contact administrator.');
        return;
    }
    
    if (!currency || !exchangeRates[currency]) {
        alert('Please select a currency first.');
        return;
    }
    
    let rate;
    
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
