# Exportación CSV para Correo Argentino

## Descripción General

La extensión puede exportar todos los pedidos extraídos a un archivo CSV compatible con el sistema de carga masiva de Correo Argentino.

## Cómo Usar

1. **Extraer Pedidos**: Visita páginas de pedidos y haz clic en "Extraer Página Actual" para cada pedido
2. **Exportar CSV**: Haz clic en el botón **📦 Exportar a CSV de Correo Argentino** en el popup
3. **Importar**: Sube el archivo CSV generado al sistema de carga masiva de Correo Argentino

## Formato CSV

El CSV exportado sigue el formato de `Plantilla_Carga_Masiva.csv` de Correo Argentino con 21 campos:

### Campos Requeridos
- `tipo_producto` - Tipo de producto (CP=Clásico, EP=Expreso, UP=Hoy)
- `largo`, `ancho`, `altura` - Dimensiones del paquete en CM
- `peso` - Peso en KG
- `valor_del_contenido` - Valor del contenido en pesos argentinos
- `provincia_destino` - Código de provincia (letra única)
- `destino_nombre` - Nombre del destinatario
- `destino_email` - Email del destinatario

### Campos Condicionales (para envío a domicilio)
- `localidad_destino` - Ciudad/localidad
- `calle_destino` - Nombre de la calle
- `altura_destino` - Número de calle
- `codpostal_destino` - Código postal

### Campos Opcionales
- `piso` - Número de piso
- `dpto` - Departamento
- `cod_area_cel` / `cel` - Código de área y número de celular
- `numero_orden` - Número de pedido

## Mapeo de Datos

La extensión mapea automáticamente los datos extraídos a campos CSV:

| Datos Extraídos | Campo CSV |
|-----------------|-----------|
| shippingInfo.address.city | localidad_destino |
| shippingInfo.address.street | calle_destino |
| shippingInfo.address.number | altura_destino |
| shippingInfo.address.floor | piso |
| shippingInfo.address.apartment | dpto |
| shippingInfo.address.postalCode | codpostal_destino |
| shippingInfo.address.province | provincia_destino (convertido a código) |
| shippingInfo.recipient.name | destino_nombre |
| shippingInfo.recipient.email | destino_email |
| shippingInfo.recipient.phone | cod_area_cel / cel (parseado) |
| shippingInfo.weight | peso |
| orderNumber | numero_orden |

## Códigos de Provincias

La extensión convierte automáticamente nombres de provincias a códigos:

| Provincia | Código | Provincia | Código |
|-----------|--------|-----------|--------|
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

## Valores Predeterminados

Los campos no extraídos de pedidos usan estos valores predeterminados:

- `tipo_producto`: **CP** (Clásico)
- `peso`: **0.15** (kg) si no está disponible
- `largo`, `ancho`, `altura`: Desde Configuración o vacío

### Personalizar Campos de Dirección

Puedes personalizar qué va en cada campo de dirección CSV individualmente:

1. Haz clic en el ícono de la extensión → **⚙️ Configuración**
2. Desplázate a **📍 Plantillas de Campos de Dirección**
3. Configura cada campo usando variables:
   - `$street` - Nombre de la calle
   - `$number` - Número de la calle
   - `$floor` - Número de piso
   - `$apt` - Departamento
   - `$city` - Nombre de la ciudad
   - `$province` - Nombre de la provincia
   - `$postalCode` - Código postal

**Campos Disponibles:**
- **calle_destino** - Campo de dirección de calle (predeterminado: `$street  $number - $floor $apt`)
- **altura_destino** - Campo de número de calle (predeterminado: vacío)
- **piso** - Campo de piso (predeterminado: vacío)
- **dpto** - Campo de departamento (predeterminado: vacío)

**Ejemplos:**

*Dirección completa (predeterminado):*
- calle_destino: `$street  $number - $floor $apt` → "Av. Corrientes 1234 - 5 A"
- altura_destino: (vacío)
- piso: (vacío)
- dpto: (vacío)

*Campos separados:*
- calle_destino: `$street` → "Av. Corrientes"
- altura_destino: `$number` → "1234"
- piso: `$floor` → "5"
- dpto: `$apt` → "A"


Las plantillas vacías o valores faltantes resultan en campos vacíos. Los espacios extra y paréntesis vacíos se eliminan automáticamente.

### Establecer Dimensiones Predeterminadas

Puedes configurar dimensiones predeterminadas del paquete en Configuración:

1. Haz clic en el ícono de la extensión → **⚙️ Configuración**
2. Desplázate a **📦 Dimensiones Predeterminadas del Paquete**
3. Ingresa valores en CM:
   - **Largo** (Length) - ej., 30
   - **Ancho** (Width) - ej., 20
   - **Altura** (Height) - ej., 10
4. Haz clic en **💾 Guardar Configuración**

Estas dimensiones se aplicarán automáticamente a todos los pedidos exportados. Deja vacío para llenar manualmente en Excel.

## Parseo de Número de Teléfono

Los números de teléfono argentinos se parsean automáticamente:
- Formato: `543513344884` → Código de área: `351`, Número: `3344884`
- Se elimina el código de país (54)
- Se extrae el código de área (típicamente 2-4 dígitos)

## Parseo de Moneda

Los valores de moneda se convierten desde formato argentino:
- Entrada: `$6.201,00`
- Salida: `6201.00` (formato de punto decimal)

## Sanitización de Texto

Los campos de texto pueden ser sanitizados según tu configuración en Configuración (⚙️ Configuración → **🔤 Sanitización de Texto**):

### Opciones Configurables

**✓ Eliminar acentos** (predeterminado: ACTIVADO)
- `á, é, í, ó, ú` → `a, e, i, o, u`
- Ejemplo: `Córdoba` → `Cordoba`

**☐ Reemplazar ñ con n** (predeterminado: DESACTIVADO - mantiene ñ)
- `ñ, Ñ` → `n, N`
- Ejemplo: `España` → `Espana` (solo si está habilitado)

**☐ Reemplazar ü con u** (predeterminado: DESACTIVADO)
- `ü, Ü` → `u, U`
- Ejemplo: `Güemes` → `Guemes` (solo si está habilitado)

**✓ Eliminar paréntesis** (predeterminado: ACTIVADO)
- Elimina `()`
- Ejemplo: `Piaggio (M25)` → `Piaggio M25`

**✓ Eliminar caracteres especiales** (predeterminado: ACTIVADO)
- Elimina comillas `"" ''`, corchetes `[] {}`, paréntesis angulares `<>`
- Ejemplo: `"Calle"` → `Calle`

### Configuración Predeterminada

Por defecto:
- ✅ Acentos eliminados (á→a)
- ✅ Paréntesis eliminados
- ✅ Caracteres especiales eliminados
- ❌ ñ se mantiene (no se reemplaza)
- ❌ ü se mantiene (no se reemplaza)

### Ejemplos

Con configuración predeterminada:
- `Córdoba` → `Cordoba`
- `España` → `Espana` (acento eliminado, ñ mantenida)
- `Piaggio La Calandria (M25 Lt19a)` → `Piaggio La Calandria M25 Lt19a`
- `José María` → `Jose Maria`

Con todas las opciones habilitadas:
- `España` → `Espana` (tanto acento como ñ reemplazados)
- `Güemes` → `Guemes` (ü reemplazada)

## Salida de Archivo

- **Nombre de archivo**: `correo_argentino_AAAA-MM-DD.csv`
- **Delimitador**: Punto y coma (`;`)
- **Codificación**: UTF-8
- **Formato**: Compatible con Excel y el sistema de Correo Argentino

## Validación

Solo se exportan pedidos con información de envío completa:
- Debe tener objeto `shippingInfo`
- Debe tener datos de `recipient` (nombre, email)
- Debe tener datos de `address`

Los pedidos sin información de envío se omiten con un conteo mostrado en el mensaje de éxito.

## Archivos de Referencia

- `carga/Plantilla_Carga_Masiva.csv` - Plantilla CSV
- `carga/carga_masiva_ejemplos_e_instrucciones.xlsx` - Instrucciones y ejemplos
- `carga/codigos_sucursales_y_provincias_MiCorreo.xlsx` - Códigos de provincias y sucursales

## Solución de Problemas

**¿No se exportan pedidos?**
- Asegúrate de que los pedidos tengan información de envío extraída
- Visita páginas de pedidos con sección "Información de envío"
- Verifica que los nombres de provincias sean reconocidos

**¿Código de provincia inválido?**
- El nombre de la provincia debe coincidir con nombres estándar de provincias argentinas
- Verifica ortografía y acentos (Córdoba, Tucumán, etc.)

**¿Dimensiones faltantes?**
- Largo, ancho, altura no se extraen automáticamente
- Llena manualmente en Excel antes de subir a Correo Argentino
- O establece valores predeterminados en Configuración

## Edición Manual

Después de exportar, es posible que necesites editar manualmente:
1. Dimensiones del paquete (largo, ancho, altura)
2. Tipo de producto (CP → EP o UP para entrega más rápida)
3. Cualquier dato faltante o incorrecto

Abre el CSV en Excel o editor de texto y completa antes de subir.
