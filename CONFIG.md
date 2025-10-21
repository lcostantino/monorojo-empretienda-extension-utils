# Configuration Guide

## CSV Export Settings

The extension includes configuration for CSV export formatting.

### Accessing Configuration

1. Click the extension icon in Chrome toolbar
2. Click **⚙️ Settings** at the bottom of the popup
3. Or right-click the extension icon → **Options**

### Configuration Steps

#### Step 1: Customize Address Field Templates (Optional)

Configure what goes into each CSV address field:

**Available Fields:**
- **calle_destino** - Street address (default: `$street`)
- **altura_destino** - Street number (default: `$number`)
- **piso** - Floor (default: `$floor`)
- **dpto** - Apartment (default: `$apt`)

**Available Variables:**
- `$street`, `$number`, `$floor`, `$apt`, `$city`, `$province`, `$postalCode`

**Examples:**
- Separate fields: calle_destino=`$street`, altura_destino=`$number`
- Combined: calle_destino=`$street $number`, altura_destino=(empty)
- All-in-one: calle_destino=`$street $number ($floor $apt)`, others empty

Leave a template empty to skip that field in the CSV.

#### Step 2: Configure Text Sanitization (Optional)

Control how special characters are handled:
- **Remove accents** (ON by default) - Converts á→a, é→e, etc.
- **Replace ñ with n** (OFF by default) - Keeps ñ unless enabled
- **Replace ü with u** (OFF by default) - Keeps ü unless enabled  
- **Remove parentheses** (ON by default) - Removes ()
- **Remove special characters** (ON by default) - Removes quotes, brackets, etc.

Configure these options based on Correo Argentino's requirements for your region.

#### Step 3: Set Default Package Dimensions (Optional)

Set default dimensions for CSV export:
- **Largo** (Length) - in centimeters
- **Ancho** (Width) - in centimeters  
- **Altura** (Height) - in centimeters

These defaults will be used when exporting orders to CSV. You can leave them empty if you prefer to fill dimensions manually later.

#### Step 4: Save Configuration

Click **💾 Save Configuration** to store all settings.

Configuration is saved to Chrome sync storage and syncs across your browsers.

### Settings Storage

Configuration is stored in Chrome's sync storage under the key `csvExportSettings`:
- `calleDestinoTemplate`, `alturaDestinoTemplate`, `pisoTemplate`, `dptoTemplate` - Field templates
- `removeAccents` - Remove accent marks (default: true)
- `replaceEnie` - Replace ñ→n (default: false)
- `replaceUmlaut` - Replace ü→u (default: false)
- `removeParentheses` - Remove () (default: true)
- `removeSpecialChars` - Remove special characters (default: true)
- `defaultLargo`, `defaultAncho`, `defaultAltura` - Default dimensions in CM
- `lastUpdated` - Timestamp of last save
