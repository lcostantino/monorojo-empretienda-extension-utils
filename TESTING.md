# Testing the Extension with test.mhtml

## Enable File Access

For the extension to work with local .mhtml files, you need to enable file access:

1. Go to `chrome://extensions/`
2. Find "Order Page Reader"
3. Click **Details**
4. Scroll down and enable **"Allow access to file URLs"**

## Test Steps

1. **Drag test.mhtml** into a Chrome tab (or open it via File > Open)
2. **Click the extension icon** in the toolbar
3. **Click "Extract Current Page"**
4. The order details should be extracted and displayed

## Troubleshooting

**"Could not establish connection"**
- Make sure "Allow access to file URLs" is enabled
- Reload the extension at chrome://extensions/
- Refresh the test.mhtml page

**Console Logs**
- Open DevTools (F12) on the test.mhtml page
- Check Console for "is Mui?" logs
- Open DevTools on the popup (right-click extension icon > Inspect popup)

**No data extracted**
- Check if the URL contains `listado-de-ventas/orden`
- Verify the page has MUI elements (h1.MuiTypography-root)
