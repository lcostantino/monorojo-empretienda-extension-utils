# CSV Export for Correo Argentino

## Overview

The extension can export all extracted orders to a CSV file compatible with Correo Argentino's bulk upload system.

## How to Use

1. **Extract Orders**: Visit order pages and click "Extract Current Page" for each order
2. **Export CSV**: Click **📦 Export to Correo Argentino CSV** button in the popup
3. **Import**: Upload the generated CSV file to Correo Argentino's bulk upload system

## CSV Format

The exported CSV follows Correo Argentino's `Plantilla_Carga_Masiva.csv` format with 21 fields:

### Required Fields
- `tipo_producto` - Product type (CP=Clásico, EP=Expreso, UP=Hoy)
- `largo`, `ancho`, `altura` - Package dimensions in CM
- `peso` - Weight in KG
- `valor_del_contenido` - Content value in Argentine pesos
- `provincia_destino` - Province code (single letter)
- `destino_nombre` - Recipient name
- `destino_email` - Recipient email

### Conditional Fields (for home delivery)
- `localidad_destino` - City/locality
- `calle_destino` - Street name
- `altura_destino` - Street number
- `codpostal_destino` - Postal code

### Optional Fields
- `piso` - Floor number
- `dpto` - Apartment
- `cod_area_cel` / `cel` - Cell phone area code and number
- `numero_orden` - Order number

## Data Mapping

The extension automatically maps extracted order data to CSV fields:

| Extracted Data | CSV Field |
|----------------|-----------|
| shippingInfo.address.city | localidad_destino |
| shippingInfo.address.street | calle_destino |
| shippingInfo.address.number | altura_destino |
| shippingInfo.address.floor | piso |
| shippingInfo.address.apartment | dpto |
| shippingInfo.address.postalCode | codpostal_destino |
| shippingInfo.address.province | provincia_destino (converted to code) |
| shippingInfo.recipient.name | destino_nombre |
| shippingInfo.recipient.email | destino_email |
| shippingInfo.recipient.phone | cod_area_cel / cel (parsed) |
| shippingInfo.weight | peso |
| orderNumber | numero_orden |

## Province Codes

The extension automatically converts province names to codes:

| Province | Code | Province | Code |
|----------|------|----------|------|
| Buenos Aires | B | Mendoza | M |
| CABA | C | Misiones | N |
| Catamarca | K | Neuquén | Q |
| Chaco | H | Río Negro | R |
| Chubut | U | Salta | A |
| Córdoba | X | San Juan | J |
| Corrientes | W | San Luis | D |
| Entre Ríos | E | Santa Cruz | Z |
| Formosa | P | Santa Fe | S |
| Jujuy | Y | Santiago del Estero | G |
| La Pampa | L | Tierra del Fuego | V |
| La Rioja | F | Tucumán | T |

## Default Values

Fields not extracted from orders use these defaults:

- `tipo_producto`: **CP** (Clásico)
- `peso`: **0.15** (kg) if not available
- `largo`, `ancho`, `altura`: From Settings or empty

### Customizing Address Fields

You can customize what goes into each CSV address field individually:

1. Click extension icon → **⚙️ Settings**
2. Scroll to **📍 Address Field Templates**
3. Configure each field using variables:
   - `$street` - Street name
   - `$number` - Street number
   - `$floor` - Floor number
   - `$apt` - Apartment
   - `$city` - City name
   - `$province` - Province name
   - `$postalCode` - Postal code

**Available Fields:**
- **calle_destino** - Street address field (default: `$street`)
- **altura_destino** - Street number field (default: `$number`)
- **piso** - Floor field (default: `$floor`)
- **dpto** - Apartment field (default: `$apt`)

**Examples:**

*Separate fields (default):*
- calle_destino: `$street` → "Av. Corrientes"
- altura_destino: `$number` → "1234"
- piso: `$floor` → "5"
- dpto: `$apt` → "A"

*Combined address:*
- calle_destino: `$street $number` → "Av. Corrientes 1234"
- altura_destino: (empty)
- piso: `$floor` → "5"
- dpto: `$apt` → "A"

*All in one field:*
- calle_destino: `$street $number, Piso $floor, Depto $apt` → "Av. Corrientes 1234, Piso 5, Depto A"
- altura_destino: (empty)
- piso: (empty)
- dpto: (empty)

Empty templates or missing values result in empty fields. Extra spaces and empty parentheses are automatically removed.

### Setting Default Dimensions

You can configure default package dimensions in Settings:

1. Click extension icon → **⚙️ Settings**
2. Scroll to **📦 Default Package Dimensions**
3. Enter values in CM:
   - **Largo** (Length) - e.g., 30
   - **Ancho** (Width) - e.g., 20
   - **Altura** (Height) - e.g., 10
4. Click **💾 Save Configuration**

These dimensions will be automatically applied to all exported orders. Leave empty to fill manually in Excel.

## Phone Number Parsing

Argentine phone numbers are automatically parsed:
- Format: `543513344884` → Area code: `351`, Number: `3344884`
- Country code (54) is removed
- Area code extracted (typically 2-4 digits)

## Currency Parsing

Currency values are converted from Argentine format:
- Input: `$6.201,00`
- Output: `6201.00` (decimal point format)

## Text Sanitization

Text fields can be sanitized based on your configuration in Settings (⚙️ Settings → **🔤 Text Sanitization**):

### Configurable Options

**✓ Remove accents** (default: ON)
- `á, é, í, ó, ú` → `a, e, i, o, u`
- Example: `Córdoba` → `Cordoba`

**☐ Replace ñ with n** (default: OFF - keeps ñ)
- `ñ, Ñ` → `n, N`
- Example: `España` → `Espana` (only if enabled)

**☐ Replace ü with u** (default: OFF)
- `ü, Ü` → `u, U`
- Example: `Güemes` → `Guemes` (only if enabled)

**✓ Remove parentheses** (default: ON)
- Removes `()`
- Example: `Piaggio (M25)` → `Piaggio M25`

**✓ Remove special characters** (default: ON)
- Removes quotes `"" ''`, brackets `[] {}`, angle brackets `<>`
- Example: `"Street"` → `Street`

### Default Settings

By default:
- ✅ Accents removed (á→a)
- ✅ Parentheses removed
- ✅ Special characters removed
- ❌ ñ is kept (not replaced)
- ❌ ü is kept (not replaced)

### Examples

With default settings:
- `Córdoba` → `Cordoba`
- `España` → `Espana` (accent removed, ñ kept)
- `Piaggio La Calandria (M25 Lt19a)` → `Piaggio La Calandria M25 Lt19a`
- `José María` → `Jose Maria`

With all options enabled:
- `España` → `Espana` (both accent and ñ replaced)
- `Güemes` → `Guemes` (ü replaced)

## File Output

- **Filename**: `correo_argentino_YYYY-MM-DD.csv`
- **Delimiter**: Semicolon (`;`)
- **Encoding**: UTF-8
- **Format**: Compatible with Excel and Correo Argentino system

## Validation

Only orders with complete shipping information are exported:
- Must have `shippingInfo` object
- Must have `recipient` data (name, email)
- Must have `address` data

Orders without shipping info are skipped with a count shown in the success message.

## Reference Files

- `carga/Plantilla_Carga_Masiva.csv` - CSV template
- `carga/carga_masiva_ejemplos_e_instrucciones.xlsx` - Instructions and examples
- `carga/codigos_sucursales_y_provincias_MiCorreo.xlsx` - Province and branch codes

## Troubleshooting

**No orders exported?**
- Ensure orders have shipping information extracted
- Visit order pages with "Información de envío" section
- Check that province names are recognized

**Invalid province code?**
- Province name must match standard Argentine province names
- Check spelling and accents (Córdoba, Tucumán, etc.)

**Missing dimensions?**
- Largo, ancho, altura are not auto-extracted
- Fill manually in Excel before uploading to Correo Argentino
- Or set defaults in `csv-export.js`

## Manual Editing

After export, you may need to manually edit:
1. Package dimensions (largo, ancho, altura)
2. Product type (CP → EP or UP for faster delivery)
3. Any missing or incorrect data

Open the CSV in Excel or text editor and fill before uploading.
