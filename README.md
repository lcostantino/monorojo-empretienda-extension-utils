# Empretienda Utils by MonoRojo FunShirt!

Extensión de Chrome para extraer información de pedidos desde páginas de comercio electrónico y exportarla a formato CSV para carga masiva de Correo Argentino.

## Características

**Extracción de Datos**
- Número de pedido
- Información del cliente
- Detalles de envío
- Montos y precios
- Información de envío completa

**Información de Envío Extraída**
- Dirección completa (calle, número, piso, departamento)
- Ciudad, provincia, código postal
- Nombre del destinatario
- Email
- Teléfono
- Peso del paquete
- Costo de envío

## Instalación

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo de desarrollador" (interruptor arriba a la derecha)
3. Haz clic en "Cargar extensión sin empaquetar"
4. Selecciona la carpeta `order-reader-extension`
5. El ícono de la extensión aparece en la barra de herramientas

## Configuración

Configura las opciones de exportación CSV:
1. Haz clic en el ícono de la extensión → **⚙️ Configuración**
2. Personaliza las plantillas de campos de dirección (predeterminado: dirección completa en calle_destino):
   - calle_destino: `$street  $number - $floor $apt`
   - altura_destino, piso, dpto: vacíos
   - Personaliza usando variables: $street, $number, $floor, $apt
3. Configura la sanitización de texto (acentos, caracteres especiales)
4. Establece dimensiones predeterminadas del paquete (largo, ancho, altura en CM)
5. Haz clic en **💾 Guardar Configuración**

Ver [CONFIG.md](CONFIG.md) para instrucciones detalladas de configuración.
Ver [CSV_EXPORT.md](CSV_EXPORT.md) para documentación completa del formato CSV.
Ver [I18N.md](I18N.md) para información sobre idiomas soportados.

## Prueba con test.mhtml

1. Abre Chrome
2. Arrastra y suelta `test.mhtml` en una pestaña del navegador
3. Haz clic en el ícono de la extensión
4. Haz clic en "Extraer Página Actual"
5. Ver los detalles del pedido extraídos

## Uso

**Extracción Manual**: Haz clic en el ícono de la extensión → "Extraer Página Actual"
**Ver Historial**: Ver los últimos 50 pedidos en el popup
**Opciones de Exportación**:
- **Exportar a JSON** - Descarga todos los pedidos como JSON
- **📦 Exportar a CSV de Correo Argentino** - Genera CSV para carga masiva
- **Copiar al Portapapeles** - Copia datos del pedido como texto
**Limpiar**: "Limpiar Historial" para eliminar todos los pedidos almacenados

### Exportación CSV de Correo Argentino

Exporta todos los pedidos a formato CSV para carga masiva en Correo Argentino:
1. Extrae pedidos de múltiples páginas de pedidos
2. Haz clic en **📦 Exportar a CSV de Correo Argentino**
3. Descarga `correo_argentino_AAAA-MM-DD.csv`
4. Sube al sistema de Correo Argentino

Ver [CSV_EXPORT.es.md](CSV_EXPORT.es.md) para documentación detallada del formato CSV.

## Privacidad

- Todos los datos se almacenan localmente en el navegador
- No se contactan servidores externos
- Límite de 50 pedidos
- Limpiar en cualquier momento

## Desarrollo

Edita los archivos fuente y recarga la extensión en `chrome://extensions/` para probar cambios.

## Archivos

- `manifest.json` - Configuración de la extensión
- `popup.html/js/css` - Interfaz del popup
- `content.js/css` - Script de extracción de datos
- `background.js` - Service worker
- `options.html/js/css` - Página de configuración
- `csv-export.js` - Lógica de exportación CSV
- `config.js` - Funciones auxiliares de configuración

## Soporte

Para problemas o preguntas, consulta la documentación o contacta al equipo de soporte.

## Desarrollo y Atribuciones

Parte del código de esta extensión fue generado con asistencia de inteligencia artificial (IA). El código ha sido revisado y adaptado para cumplir con los requisitos específicos del proyecto.

Ver [AI_ATTRIBUTION.md](AI_ATTRIBUTION.md) para detalles completos sobre qué componentes utilizaron asistencia de IA.
