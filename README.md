# Kenanga Money Changer - Currency Converter

A currency converter with separate admin and customer interfaces. You control the rates, customers can only convert amounts. Base currency: IDR (Indonesian Rupiah).

## Files

- `admin.html` - Admin panel (for you to manage rates)
- `customer.html` - Customer converter (for your customers)

## For You (Admin)

1. Open `admin.html` in your browser
2. Configure WhatsApp Business number (with country code, e.g., 6281234567890)
3. Add currencies and set their rates manually OR load from Google Sheets
4. Click "Publish Rates to Customer App" to make rates available to customers

## For Your Customers

1. Share `customer.html` with your customers
2. They can only change amounts and select currencies
3. They cannot edit rates - only you can through the admin panel
4. They can click "Confirm Rate via WhatsApp" to send the rate directly to your WhatsApp Business

## Google Sheets Setup (Optional)

1. Create a Google Sheet with this format:
   ```
   Currency | Buy Rate | Sell Rate
   IDR      | 1        | 1
   USD      | 15750    | 15850
   SGD      | 11800    | 11900
   MYR      | 3500     | 3550
   ```

2. Publish your sheet:
   - File → Share → Publish to web
   - Choose "Entire Document" and "Comma-separated values (.csv)"
   - Click "Publish"

3. In admin panel, switch to "Google Sheets" mode
4. Paste the published URL and click "Load from Sheets"
5. Click "Publish Rates to Customer App"

## How It Works

- Admin panel saves rates to browser localStorage
- Customer app reads rates from localStorage (read-only)
- Both files must be opened in the same browser for rates to sync
- Rates persist even after closing the browser
