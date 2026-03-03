// Configuration
const GOOGLE_SHEET_ID = '1hO8kaJKRr_sLOEVp5RDp5lu0nVKNdZDdhDO8WtBvRjA';

let exchangeRates = {};

async function init() {
    setupEventListeners();
    await loadRatesFromGoogleSheets();
}

function setupEventListeners() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'customer.html';
        });
    }
}

async function loadRatesFromGoogleSheets() {
    const loadingStatus = document.getElementById('loadingStatus');
    const successStatus = document.getElementById('successStatus');
    const tableBody = document.getElementById('ratesTableBody');
    
    try {
        loadingStatus.classList.remove('hidden');
        successStatus.classList.add('hidden');
        
        const ratesUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const settingsUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Settings`;
        
        const ratesResponse = await fetch(ratesUrl);
        const ratesCSV = await ratesResponse.text();
        exchangeRates = parseRatesCSV(ratesCSV);
        
        try {
            const settingsResponse = await fetch(settingsUrl);
            const settingsCSV = await settingsResponse.text();
            parseSettingsCSV(settingsCSV);
        } catch (e) {
            console.log('Settings sheet not found');
        }
        
        displayRates();
        checkMarketStatus();
        
        loadingStatus.classList.add('hidden');
        successStatus.classList.remove('hidden');
        
        setTimeout(() => {
            successStatus.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('Error loading rates:', error);
        loadingStatus.classList.add('hidden');
        tableBody.innerHTML = '<div class="no-rates">Error loading rates. Please contact administrator.</div>';
    }
}

function parseRatesCSV(csv) {
    const rates = {};
    const lines = csv.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const parts = lines[i].split(',').slice(0, 4).map(s => s.replace(/"/g, '').trim());
        
        const currency = parts[0];
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
        
        if (setting === 'MarketOpen') {
            localStorage.setItem('marketOpen', value.toLowerCase() === 'true');
        }
    }
}

function checkMarketStatus() {
    const marketOpen = localStorage.getItem('marketOpen');
    const banner = document.getElementById('marketClosedBanner');
    
    if (marketOpen === 'false') {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

function displayRates() {
    const tableBody = document.getElementById('ratesTableBody');
    tableBody.innerHTML = '';
    
    const priorityCurrencies = ['USD', 'SGD', 'JPY', 'EUR', 'AUD'];
    const allCurrencies = Object.keys(exchangeRates);
    const otherCurrencies = allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort();
    
    const orderedCurrencies = [
        ...priorityCurrencies.filter(c => allCurrencies.includes(c)),
        ...otherCurrencies
    ];
    
    if (orderedCurrencies.length === 0) {
        tableBody.innerHTML = '<div class="no-rates">No rates available.</div>';
        return;
    }
    
    orderedCurrencies.forEach(currency => {
        const rates = exchangeRates[currency];
        
        if (currency === 'SAR' && rates.denominations) {
            ['500', '100', '50', '10'].forEach(denom => {
                const row = document.createElement('div');
                row.className = 'rate-row';
                
                let denomLabel = `SAR (${denom})`;
                if (denom === '10') denomLabel = 'SAR (10/5)';
                
                const buyRate = rates.denominations[denom].buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                const sellRate = rates.denominations[denom].sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                
                row.innerHTML = `
                    <div class="currency">${denomLabel}</div>
                    <div class="buy-rate">Rp. ${buyRate}</div>
                    <div class="sell-rate">Rp. ${sellRate}</div>
                `;
                
                tableBody.appendChild(row);
            });
        } else {
            const row = document.createElement('div');
            row.className = 'rate-row';
            
            const buyRate = rates.buy.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            const sellRate = rates.sell.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            
            row.innerHTML = `
                <div class="currency">${currency}</div>
                <div class="buy-rate">Rp. ${buyRate}</div>
                <div class="sell-rate">Rp. ${sellRate}</div>
            `;
            
            tableBody.appendChild(row);
        }
    });
}

init();
