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

function checkMarketStatus() {
    const marketOpen = localStorage.getItem('marketOpen');
    const banner = document.getElementById('marketClosedBanner');
    
    if (marketOpen === 'false') {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

function loadRates() {
    const savedRates = localStorage.getItem('adminExchangeRates');
    
    if (savedRates) {
        exchangeRates = JSON.parse(savedRates);
        displayRates();
    } else {
        document.getElementById('ratesTableBody').innerHTML = '<div class="no-rates">No rates available. Please contact administrator.</div>';
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
