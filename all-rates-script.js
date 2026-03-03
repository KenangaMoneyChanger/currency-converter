let exchangeRates = {};

function init() {
    checkMarketStatus();
    loadRates();
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'customer.html';
        });
    }
}

async function loadRates() {
    const SHEET_ID = localStorage.getItem('googleSheetId') || '';
    
    if (!SHEET_ID) {
        document.getElementById('ratesTableBody').innerHTML = '<div class="no-rates">Please ask administrator to set up Google Sheets.</div>';
        return;
    }
    
    try {
        const ratesUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const settingsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Settings`;
        
        const ratesResponse = await fetch(ratesUrl);
        const ratesCSV = await ratesResponse.text();
        exchangeRates = parseRatesCSV(ratesCSV);
        
        const settingsResponse = await fetch(settingsUrl);
        const settingsCSV = await settingsResponse.text();
        parseSettingsCSV(settingsCSV);
        
        displayRates();
        checkMarketStatus();
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        document.getElementById('ratesTableBody').innerHTML = '<div class="no-rates">Error loading rates. Please contact administrator.</div>';
    }
}

function parseRatesCSV(csv) {
    const rates = {};
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
        
        if (setting === 'MarketOpen') {
            localStorage.setItem('marketOpen', value === 'true');
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
    const allCurrencies = Object.keys(exchangeRates).filter(c => c !== 'IDR');
    
    // Separate priority and other currencies
    const otherCurrencies = allCurrencies.filter(c => !priorityCurrencies.includes(c)).sort();
    
    // Combine: priority currencies first, then others
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
        
        // Check if currency has denominations (SAR)
        if (currency === 'SAR' && rates.denominations) {
            // Add rows for each SAR denomination
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
