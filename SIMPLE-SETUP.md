# Simple Google Sheets Setup - 5 Minutes

## Step 1: Create Your Google Sheet

1. Go to: https://sheets.google.com
2. Click "Blank" to create new spreadsheet
3. Name it: "Kenanga Rates"

## Step 2: Add Your Rates

Copy and paste this into your sheet (starting at cell A1):

```
Currency	Buy Rate	Sell Rate	Denomination
USD	15750	15850	
SGD	11800	11900	
JPY	105	108	
EUR	17200	17300	
AUD	10300	10400	
SAR	4200	4250	500
SAR	4180	4230	100
SAR	4160	4210	50
SAR	4140	4190	10
```

## Step 3: Add Settings Sheet

1. Click the "+" at bottom to add new sheet
2. Rename it to: "Settings"
3. Copy and paste this:

```
Setting	Value
WhatsApp	6281234567890
MarketOpen	true
```

Replace 6281234567890 with your actual WhatsApp number.

## Step 4: Publish Your Sheet

1. Click "File" → "Share" → "Publish to web"
2. Click "Publish" button
3. Click "OK" on the warning

## Step 5: Make it Public

1. Click the blue "Share" button (top right)
2. Click "Change to anyone with the link"
3. Make sure it says "Anyone with the link" and "Viewer"
4. Click "Done"

## Step 6: Get Your Sheet ID

Look at your browser URL. It looks like:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
```

Copy the part between `/d/` and `/edit`:
```
1ABC123xyz456
```

This is your Sheet ID!

## Step 7: Use Your Sheet ID

1. Open: https://kenangamoneychanger.github.io/currency-converter/admin.html
2. Paste your Sheet ID in the "Google Sheets Integration" field
3. Click "Save & Enable"

## Done!

Now you can:
- Edit rates in Google Sheets anytime
- Customers see updates within 1 minute
- No need to upload anything to GitHub!

## To Update Rates Daily:

Just edit your Google Sheet - that's it! Changes appear automatically.
