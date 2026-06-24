/**
 * Parsea una ubicación proveniente de Supabase PostGIS (GeoJSON, WKT, JSON string o EWKB hex)
 * y devuelve { lat, lng } o null.
 */
export function parseUbicacion(
  ubicacion: unknown
): { lat: number; lng: number } | null {
  if (!ubicacion) return null;

  // --- 1. Objeto GeoJSON directo ---
  // Ej: { type: "Point", coordinates: [-99.13, 19.43] }
  if (typeof ubicacion === 'object' && ubicacion !== null && !Array.isArray(ubicacion)) {
    const obj = ubicacion as Record<string, unknown>;
    if (obj.coordinates) {
      const coords = tryExtractCoords(obj.coordinates);
      if (coords) return coords;
    }
  }

  if (typeof ubicacion === 'string') {
    // --- 2. String WKT ---
    // Ej: "POINT(-99.13 19.43)" o "SRID=4326;POINT(-99.13 19.43)"
    const wktMatch = ubicacion.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/i);
    if (wktMatch) {
      const lng = parseFloat(wktMatch[1]);
      const lat = parseFloat(wktMatch[2]);
      if (isFinite(lat) && isFinite(lng)) return { lat, lng };
    }

    // --- 3. String JSON (doble-encodificado) ---
    // Ej: '{"type":"Point","coordinates":[-99.13,19.43]}'
    try {
      const parsed = JSON.parse(ubicacion);
      if (parsed && typeof parsed === 'object' && parsed.coordinates) {
        const coords = tryExtractCoords(parsed.coordinates);
        if (coords) return coords;
      }
    } catch {
      // No es JSON válido, continuar
    }

    // --- 4. EWKB hex (PostGIS binary hex string) ---
    // Ej: "0101000020E6100000..."
    if (/^[0-9a-fA-F]{40,}$/i.test(ubicacion)) {
      const coords = parseEWKBHex(ubicacion);
      if (coords) return coords;
    }
  }

  console.warn('[parseUbicacion] No se pudo parsear la ubicación:', ubicacion);
  return null;
}

/** Intenta extraer [lat, lng] de coordinates (array u object-like). */
function tryExtractCoords(
  coordinates: unknown
): { lat: number; lng: number } | null {
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const [lng, lat] = coordinates;
    if (isFinite(lat as number) && isFinite(lng as number)) {
      return { lat: lat as number, lng: lng as number };
    }
  }
  // Objeto con claves numéricas estilo {0: lng, 1: lat}
  if (typeof coordinates === 'object' && coordinates !== null) {
    const c = coordinates as Record<string, unknown>;
    const lng = c[0] ?? c.lng ?? c.longitude;
    const lat = c[1] ?? c.lat ?? c.latitude;
    if (isFinite(lat as number) && isFinite(lng as number)) {
      return { lat: lat as number, lng: lng as number };
    }
  }
  return null;
}

/**
 * Parsea un EWKB hex string (punto SRID 4326) y devuelve {lat, lng}.
 * Soporta tanto little-endian como big-endian.
 * Formato: byte0 (endian) + tipo(4 bytes) + SRID(4 bytes, si aplica) + X(8 bytes) + Y(8 bytes)
 */
function parseEWKBHex(hex: string): { lat: number; lng: number } | null {
  try {
    const bytes = hexToBytes(hex);
    if (bytes.length < 21) return null; // mínimo: endian(1) + type(4) + x(8) + y(8) = 21

    const littleEndian = bytes[0] === 0x01;

    // Leer tipo (bytes 1-4)
    const type = readUint32(bytes, 1, littleEndian);
    // wkbPoint = 1 (sin SRID) o 0x20000001 (con SRID)
    if ((type & 0x01) !== 1) return null; // No es un Point

    let offset = 5;
    // Si tiene flag SRID (bit 30), saltar los 4 bytes de SRID
    if (type & 0x20000000) {
      offset = 9;
    }

    // X = double (8 bytes), Y = double (8 bytes)
    if (bytes.length < offset + 16) return null;

    const x = readFloat64(bytes, offset, littleEndian);
    const y = readFloat64(bytes, offset + 8, littleEndian);

    if (!isFinite(x) || !isFinite(y)) return null;

    // En una proyección 4326: X = longitude, Y = latitude
    return { lat: y, lng: x };
  } catch {
    return null;
  }
}

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

function readUint32(bytes: number[], offset: number, littleEndian: boolean): number {
  if (littleEndian) {
    return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
  }
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

function readFloat64(bytes: number[], offset: number, littleEndian: boolean): number {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + (littleEndian ? i : 7 - i)]);
  }
  return view.getFloat64(0, true);
}

/**
 * Genera el HTML interno de un mapa Leaflet con radio difuso (privacidad).
 * radio: metros del círculo de zona aproximada (default 650m).
 */
export function buildMapSrcDoc(lat: number, lng: number, radio = 650): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false })
                 .setView([${lat}, ${lng}], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
    }).addTo(map);

    // Círculo difuso en lugar de pin exacto (protección de privacidad)
    L.circle([${lat}, ${lng}], {
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      radius: ${radio},
      weight: 2
    }).addTo(map);

    // Attribution pequeño
    L.control.attribution({ prefix: false, position: 'bottomleft' })
      .addAttribution('© CartoDB')
      .addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
  </script>
</body>
</html>`;
}
