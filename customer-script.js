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
    loadRates();
    loadWhatsAppNumber();
    
    amountInput.addEventListener('input', convert);
    currencySelect.addEventListener('change', convert);
    buyBtn.addEventListener('click', () => setTransactionType('buy'));
    sellBtn.addEventListener('click', () => setTransactionType('sell'));
    confirmBtn.addEventListener('click', confirmRate);
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

function loadRates() {
    const savedRates = localStorage.getItem('adminExchangeRates');
    
    if (savedRates) {
        exchangeRates = JSON.parse(savedRates);
        populateCurrencySelects();
        convert();
    } else {
        resultDisplay.textContent = 'Rp. 0';
        rateInfo.textContent = 'Please contact administrator to set up exchange rates';
    }
}

function loadWhatsAppNumber() {
    const savedNumber = localStorage.getItem('whatsappNumber');
    if (savedNumber) {
        whatsappNumber = savedNumber;
    }
}

function populateCurrencySelects() {
    const currencies = Object.keys(exchangeRates).sort().filter(c => c !== 'IDR');
    
    currencySelect.innerHTML = '';
    
    currencies.forEach(currency => {
        currencySelect.add(new Option(currency, currency));
    });
}

function convert() {
    const amount = parseFloat(amountInput.value) || 0;
    const currency = currencySelect.value;
    
    if (!currency || !exchangeRates[currency]) {
        resultDisplay.textContent = 'Rp. 0';
        return;
    }
    
    const rate = transactionType === 'buy' ? exchangeRates[currency].buy : exchangeRates[currency].sell;
    const result = amount * rate;
    
    resultDisplay.textContent = 'Rp. ' + formatNumber(result);
    
    const typeText = transactionType === 'buy' ? 'We buy' : 'We sell';
    rateInfo.textContent = `${typeText} 1 ${currency} = Rp. ${formatNumber(rate)}`;
}

function formatNumber(num) {
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function confirmRate() {
    const amount = parseFloat(amountInput.value) || 0;
    const currency = currencySelect.value;
    
    if (!whatsappNumber) {
        alert('WhatsApp number not configured. Please contact administrator.');
        return;
    }
    
    if (!currency || !exchangeRates[currency]) {
        alert('Please complete the conversion first.');
        return;
    }
    
    const rate = transactionType === 'buy' ? exchangeRates[currency].buy : exchangeRates[currency].sell;
    const totalIDR = amount * rate;
    const action = transactionType === 'buy' ? 'BUY' : 'SELL';
    const message = `${action} ${amount} ${currency} @ Rp. ${formatNumber(rate)} = Rp. ${formatNumber(totalIDR)}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

init();
