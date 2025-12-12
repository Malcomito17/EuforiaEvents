# YouTube API Setup para Karaokeya

## Problema

La búsqueda de videos de YouTube en el módulo Karaokeya requiere la API Key de YouTube Data API v3.

## Solución

### 1. Agregar la variable al .env de producción

En tu servidor de producción (Raspberry Pi), edita el archivo `.env` en la raíz del proyecto:

```bash
nano .env
```

Agrega la siguiente línea:

```env
YOUTUBE_API_KEY=AIzaSyCdL2n1nuhWHvEAbrOpuA6ll1HMUw0MuT4
```

### 2. Reiniciar los contenedores Docker

Para que los contenedores recojan la nueva variable de entorno:

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verificar que la variable está cargada

Verifica que el contenedor del API tiene la variable:

```bash
docker exec euforia-api-prod printenv | grep YOUTUBE
```

Deberías ver:
```
YOUTUBE_API_KEY=AIzaSyCdL2n1nuhWHvEAbrOpuA6ll1HMUw0MuT4
```

### 4. Probar la búsqueda de YouTube

Desde el panel de operador, ve a un evento > Karaokeya y prueba buscar una canción.
Deberías ver resultados tanto del catálogo como de YouTube.

## Notas Importantes

- La API Key de YouTube Data API v3 tiene cuotas diarias (10,000 unidades/día por defecto)
- Cada búsqueda consume aproximadamente 100 unidades
- Si la API Key no está configurada, la búsqueda solo mostrará resultados del catálogo local
- El sistema maneja gracefully la ausencia de la API Key (no rompe, solo no busca en YouTube)

## Obtener tu propia API Key (opcional)

Si necesitas tu propia API Key:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita "YouTube Data API v3"
4. Ve a "Credenciales" > "Crear credenciales" > "API Key"
5. (Opcional pero recomendado) Restringe la API Key:
   - Por HTTP referers (si solo usas desde web)
   - Por APIs (solo YouTube Data API v3)

## Configuración en docker-compose.prod.yml

El archivo `docker-compose.prod.yml` ya está configurado para leer esta variable (línea 72):

```yaml
environment:
  - YOUTUBE_API_KEY=${YOUTUBE_API_KEY:-}
```

El `:-` hace que sea opcional - si no existe, el valor será vacío y el sistema funcionará sin búsqueda de YouTube.
