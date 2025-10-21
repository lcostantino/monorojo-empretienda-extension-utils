# Order Page Reader Chrome Extension

Chrome extension that automatically extracts order information from empretienda y exporta a csv para correo argentino.

## Features

- **Auto-detection**: Extracts order data when visiting order pages
- **Manual extraction**: Click to extract from any order page
- **Multi-site support**: Amazon, eBay, Walmart, Shopify, and custom MUI platforms
- **Export**: Save to JSON or copy to clipboard
- **History**: Stores last 50 orders locally

## Extracted Data

- Order number
- Customer name  
- Order date
- Total amount & shipping cost
- Payment/shipping status
- Items (name, price, quantity, details)
- Contact info (email, phone)

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `order-reader-extension` folder
5. Extension icon appears in toolbar

## Configuration

Configure CSV export settings:
1. Click extension icon → **⚙️ Settings**
2. Customize address field templates:
   - calle_destino, altura_destino, piso, dpto
   - Use variables: $street, $number, $floor, $apt
3. Set default package dimensions (largo, ancho, altura in CM)
4. Click **💾 Save Configuration**

See [CONFIG.md](CONFIG.md) for detailed setup instructions.
See [CSV_EXPORT.md](CSV_EXPORT.md) for complete CSV format documentation.

**Español**: Ver [README.es.md](README.es.md) | [CSV_EXPORT.es.md](CSV_EXPORT.es.md) | [I18N.md](I18N.md) (Internacionalización)

## Testing with test.mhtml

1. Open Chrome
2. Drag and drop `test.mhtml` into a browser tab
3. Click the extension icon
4. Click "Extract Current Page"
5. View extracted order details

## Usage

**Manual Extract**: Click extension icon → "Extract Current Page"
**View History**: See last 50 orders in popup
**Export Options**:
- **Export to JSON** - Download all orders as JSON
- **📦 Export to Correo Argentino CSV** - Generate bulk upload CSV
- **Copy to Clipboard** - Copy order data as text
**Clear**: "Clear History" to remove all stored orders

### Correo Argentino CSV Export

Export all orders to CSV format for bulk upload to Correo Argentino:
1. Extract orders from multiple order pages
2. Click **📦 Export to Correo Argentino CSV**
3. Download `correo_argentino_YYYY-MM-DD.csv`
4. Upload to Correo Argentino system

See [CSV_EXPORT.md](CSV_EXPORT.md) for detailed CSV format documentation.

## Privacy

- All data stored locally in browser
- No external servers contacted
- 50 order limit
- Clear anytime

## Development

Edit source files and reload extension at `chrome://extensions/` to test changes.
