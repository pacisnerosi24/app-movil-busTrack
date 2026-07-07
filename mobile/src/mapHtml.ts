// HTML del mapa en vivo dentro del WebView: Leaflet + socket.io desde CDN.
// Se suscribe al evento "bus_<idBus>" que emite el RastreoGateway del backend.
export function buildMapHtml(apiBase: string, idBus: string, color: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; background: #EAF0F7; }
    .leaflet-control-attribution { font-size: 9px; opacity: .6; }
    .bus-pin { display:flex; align-items:center; justify-content:center;
      width:44px; height:44px; border-radius:50%; background:${color};
      border:4px solid #fff; box-shadow:0 4px 12px rgba(0,0,0,.3); font-size:20px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var lat = -2.170998, lng = -79.922359;
    var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var icon = L.divIcon({ html: '<div class="bus-pin">🚌</div>', className: '', iconSize: [44,44], iconAnchor: [22,22] });
    var marker = L.marker([lat, lng], { icon: icon }).addTo(map);
    var trail = L.polyline([], { color: '${color}', weight: 6, opacity: .85 }).addTo(map);

    function post(o) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o)); }

    var socket = io('${apiBase}', { transports: ['websocket', 'polling'] });
    socket.on('connect', function () { post({ type: 'ws', connected: true }); });
    socket.on('disconnect', function () { post({ type: 'ws', connected: false }); });
    socket.on('bus_${idBus}', function (p) {
      marker.setLatLng([p.latitud, p.longitud]);
      trail.addLatLng([p.latitud, p.longitud]);
      map.panTo([p.latitud, p.longitud]);
      post({ type: 'pos', lat: p.latitud, lng: p.longitud });
    });
  </script>
</body>
</html>`;
}
