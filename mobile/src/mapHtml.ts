import { LatLng } from './mockData';

export type Parada = { pos: LatLng; nombre: string };

// Mapa estilo Uber dentro del WebView:
//  - dibuja la ruta pegada a las calles (línea tenue) + el tramo recorrido
//  - marca las paradas (origen/destino etiquetados)
//  - anima el bus suave a lo largo de la ruta real (requestAnimationFrame)
//  - la cámara sigue al bus; el pin rota hacia la dirección de avance
//  - reporta progreso/ETA y GPS a React Native vía postMessage
//  - se controla desde RN con window.__cmd('play'|'pause'|'restart')
export function buildMapHtml(
  apiBase: string,
  idBus: string,
  color: string,
  route: LatLng[],
  paradas: Parada[],
  minutos: number,
  velocidad: number, // factor de reproducción: 1 = tiempo real, 5 = 5x, etc.
  user: { lat: number; lng: number } | null,
  modo: 'conductor' | 'pasajero',
): string {
  const routeJson = JSON.stringify(route);
  const paradasJson = JSON.stringify(paradas);
  const userJson = JSON.stringify(user);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; background: #EAEEF2; }
    .leaflet-control-attribution { font-size: 9px; opacity: .5; }
    /* Bus estilo Uber/Moovit: círculo de color con ícono de bus blanco (SVG) */
    .bus-halo { position:relative; width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      background:${color}2E; }
    .bus-pin { display:flex; align-items:center; justify-content:center;
      width:38px; height:38px; border-radius:50%; background:${color};
      border:3px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,.4); }
    .bus-pin svg { width:21px; height:21px; fill:#fff; }
    /* Aguja de rumbo: gira alrededor del bus apuntando hacia dónde viaja */
    .bus-dir-wrap { position:absolute; inset:0; display:flex; align-items:flex-start; justify-content:center;
      transition:transform .35s linear; will-change:transform; }
    .bus-dir { width:0; height:0; margin-top:-5px; border-left:7px solid transparent; border-right:7px solid transparent;
      border-bottom:11px solid ${color}; filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 2px #fff); }
    /* Flechas de dirección sobre la ruta (hacia dónde va el bus) */
    .arrow { color:${color}; font-size:15px; line-height:15px; font-weight:900;
      text-shadow:0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff; }
    /* Contenedor que centra el punto exactamente sobre la coordenada */
    .stop-wrap { width:22px; height:22px; display:flex; align-items:center; justify-content:center; }
    .stop { width:12px; height:12px; border-radius:50%; background:#fff;
      border:3px solid ${color}; box-shadow:0 1px 4px rgba(0,0,0,.3); }
    /* Paradas terminales: punto de color sólido (verde origen / rojo destino) */
    .stop-term { width:17px; height:17px; border-radius:50%; border:3px solid #fff;
      box-shadow:0 2px 7px rgba(0,0,0,.4); }
    /* Tu ubicación (punto azul estilo Uber/Google) */
    .me { width:20px; height:20px; border-radius:50%; background:#2563EB; border:3px solid #fff;
      box-shadow:0 0 0 7px rgba(37,99,235,.20), 0 2px 6px rgba(0,0,0,.35); }
    /* Tu parada (dónde te recoge el bus) */
    .parada-me { width:16px; height:16px; border-radius:5px; background:#16A34A; border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.35); }
    /* Etiquetas de origen/destino: pastilla blanca con punto de color (legible sobre mapa claro) */
    /* Etiqueta de origen/destino: pastilla blanca centrada ENCIMA del punto, con flechita */
    .leaflet-tooltip.lbl-tt { background:#fff; color:#14233F; border:0; border-radius:999px;
      padding:4px 11px; font-family:system-ui,sans-serif; font-weight:800; font-size:11px;
      white-space:nowrap; box-shadow:0 3px 12px rgba(20,30,60,.32); }
    .leaflet-tooltip-top.lbl-tt::before { border-top-color:#fff; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var ROUTE = ${routeJson};
    var PARADAS = ${paradasJson};
    var USER = ${userJson};
    var MODO = '${modo}';
    var MIN = ${minutos};
    var COLOR = '${color}';
    // Duración = tiempo real del viaje (min→ms) dividido por el factor de velocidad.
    // x1 = el bus tarda los minutos reales; x5/x12 acelera la simulación.
    var BASE = MIN * 60000;
    var SPEED = ${velocidad};
    var DUR = BASE / SPEED;
    var lastFrac = 0;

    var map = L.map('map', {
      zoomControl: false, attributionControl: true,
      zoomSnap: 1, zoomDelta: 1, // niveles enteros -> tiles nítidos (sin distorsión)
      inertia: true, worldCopyJump: false, bounceAtZoomLimits: false,
    });
    // Tiles claros y minimalistas (estilo Uber)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20, subdomains: 'abcd', detectRetina: true,
      attribution: '© OpenStreetMap © CARTO'
    }).addTo(map);

    // Marcador "Tú" (ubicación real del teléfono), se mueve en vivo.
    var meIcon = L.divIcon({ className:'', html:'<div class="me"></div>', iconSize:[20,20], iconAnchor:[10,10] });
    var me = null;
    if (USER) { me = L.marker([USER.lat, USER.lng], { icon: meIcon, zIndexOffset: 500 }).addTo(map).bindPopup('Tú'); }
    window.__setUser = function(la, ln){
      if (!me) { me = L.marker([la, ln], { icon: meIcon, zIndexOffset: 500 }).addTo(map).bindPopup('Tú'); }
      else { me.setLatLng([la, ln]); }
    };
    // Marcador "Tu parada": el punto de la ruta donde te recoge el bus.
    var stopIcon = L.divIcon({ className:'', html:'<div class="parada-me"></div>', iconSize:[16,16], iconAnchor:[8,8] });
    var stopMe = null;
    window.__setStop = function(la, ln){
      if (!stopMe) { stopMe = L.marker([la, ln], { icon: stopIcon, zIndexOffset: 400 }).addTo(map).bindPopup('Tu parada'); }
      else { stopMe.setLatLng([la, ln]); }
    };

    var encuadre = USER ? ROUTE.concat([[USER.lat, USER.lng]]) : ROUTE;
    map.fitBounds(encuadre, { paddingTopLeft:[40, 100], paddingBottomRight:[40, 240] });

    // Cámara que sigue al bus, pero suelta el control cuando el usuario
    // arrastra o hace zoom (estilo Uber). Se recupera con el botón recentrar.
    var following = true;
    var ready = false; // ignora el ajuste inicial (fitBounds) como si fuera gesto
    map.once('moveend', function(){ setTimeout(function(){ ready = true; }, 400); });
    setTimeout(function(){ ready = true; }, 1500);
    function soltar(){ if (ready && following){ following = false; post({ type:'follow', following:false }); } }
    map.on('dragstart', soltar);
    map.on('zoomstart', soltar);
    // Tocar el mapa = elegir tu parada (RN decide si cae sobre la ruta).
    map.on('click', function(e){ post({ type:'pick', lat:e.latlng.lat, lng:e.latlng.lng }); });
    window.__recenter = function(){
      following = true;
      if (buses[0]) map.setView(buses[0].marker.getLatLng(), map.getZoom(), { animate: true });
      post({ type:'follow', following:true });
    };
    // Centra la cámara en TU ubicación (suelta el seguimiento del bus).
    window.__recenterMe = function(){
      if (!me) return;
      following = false;
      map.setView(me.getLatLng(), Math.max(map.getZoom(), 16), { animate: true });
      post({ type:'follow', following:false });
    };
    // Encuadre general: aleja hasta ver TU ubicación + toda la ruta (vista de entrada).
    // Deja hueco ARRIBA (píldora/selector) y ABAJO (tarjeta + botones) para que
    // la ruta quede centrada en la zona visible y no se corte bajo esos elementos.
    window.__fitAll = function(la, ln){
      following = false;
      var pts = (la != null && ln != null) ? ROUTE.concat([[la, ln]]) : ROUTE.slice();
      map.fitBounds(pts, { paddingTopLeft:[40, 100], paddingBottomRight:[40, 240] });
      post({ type:'follow', following:false });
    };
    // Vista de entrada útil: TÚ + el bus más cercano a ti (más acercado que
    // toda la ruta, que puede cruzar media ciudad).
    window.__fitMeBus = function(la, ln){
      following = false;
      var best = null, bestD = Infinity;
      for (var b = 0; b < buses.length; b++) {
        var f = fracDe(buses[b].phase), p = pointAt(f);
        var d = dist([p.la, p.ln], [la, ln]);
        if (d < bestD) { bestD = d; best = [p.la, p.ln]; }
      }
      // Sin ubicación: centra en el bus más cercano con zoom fijo.
      if (la == null || ln == null) {
        if (best) map.setView(best, 15, { animate:false }); else window.__fitAll();
        post({ type:'follow', following:false }); return;
      }
      if (best) {
        map.fitBounds([[la, ln], best], { paddingTopLeft:[55, 115], paddingBottomRight:[55, 255], maxZoom:16 });
        // Tope de alejamiento: si tú y el bus quedan muy lejos (p. ej. la vuelta
        // va por otro corredor), no te alejes media ciudad; prioriza ver el bus
        // más cercano con un zoom consistente (misma sensación que la ida).
        if (map.getZoom() < 13) map.setView(best, 14, { animate:false });
      } else {
        map.setView([la, ln], 15, { animate:false });
      }
      post({ type:'follow', following:false });
    };

    // Línea de la ruta (el "traveled" se usa solo en modo conductor).
    L.polyline(ROUTE, { color: COLOR, weight: 6, opacity: .55, lineCap: 'round' }).addTo(map);
    var traveled = L.polyline([], { color: COLOR, weight: 6, opacity: .95, lineCap: 'round' }).addTo(map);

    // Flechas repartidas a lo largo de la ruta que apuntan en el sentido de avance.
    var paso = Math.max(1, Math.floor(ROUTE.length / 9));
    for (var a = paso; a < ROUTE.length - 1; a += paso) {
      var dLat = ROUTE[a+1][0] - ROUTE[a][0], dLng = ROUTE[a+1][1] - ROUTE[a][1];
      var deg = Math.atan2(-dLat, dLng) * 180 / Math.PI; // 0 = apunta al este (▶)
      L.marker(ROUTE[a], { interactive:false, keyboard:false, icon: L.divIcon({
        className:'', html:'<div class="arrow" style="transform:rotate('+deg+'deg)">▶</div>',
        iconSize:[16,16], iconAnchor:[8,8] }) }).addTo(map);
    }

    // Paradas
    PARADAS.forEach(function (p, i) {
      var isStart = (i === 0), isEnd = (i === PARADAS.length - 1), terminal = isStart || isEnd;
      // La parada ES el punto: verde=origen, rojo=destino, blanco=intermedia. Centrado.
      var punto = terminal
        ? '<div class="stop-term" style="background:' + (isStart ? '#16A34A' : '#EF4444') + '"></div>'
        : '<div class="stop"></div>';
      var m = L.marker(p.pos, { icon: L.divIcon({ className:'', html:'<div class="stop-wrap">'+punto+'</div>', iconSize:[22,22], iconAnchor:[11,11] }) }).addTo(map);
      if (terminal) {
        // Etiqueta flotante centrada encima del punto (se posiciona sola).
        m.bindTooltip(p.nombre, { permanent:true, direction:'top', offset:[0,-7], className:'lbl-tt' });
      }
    });

    // Uno o varios buses en la ruta. Rutas largas => más buses, separados
    // uniformemente, para que SIEMPRE haya alguno en camino (más real).
    // El conductor usa 1 (su GPS real).
    var BUS_SVG = '<svg viewBox="0 0 24 24"><path d="M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-1 1.7V19a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1.3A2 2 0 0 1 4 16Zm2-9v5h12V7H6Zm1.5 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>';
    function nuevoBusIcon(){ return L.divIcon({ className:'', html:'<div class="bus-halo"><div class="bus-dir-wrap"><div class="bus-dir"></div></div><div class="bus-pin">'+BUS_SVG+'</div></div>', iconSize:[52,52], iconAnchor:[26,26] }); }
    // Rumbo (grados, 0 = norte/arriba, horario) del segmento por el que va el bus.
    function rumboSeg(seg){
      var a = ROUTE[Math.max(1, seg) - 1], b = ROUTE[Math.max(1, seg)];
      if (!a || !b) return 0;
      return Math.atan2(b[1]-a[1], b[0]-a[0]) * 180 / Math.PI;
    }
    // Aplica la rotación de la aguja al marcador de un bus.
    function orientar(marker, deg){
      var el = marker.getElement(); if (!el) return;
      var w = el.querySelector('.bus-dir-wrap'); if (w) w.style.transform = 'rotate('+deg+'deg)';
    }
    var NBUS = (MODO === 'pasajero') ? Math.max(1, Math.min(3, Math.round(MIN / 12))) : 1;
    var buses = [];
    for (var bi = 0; bi < NBUS; bi++) {
      buses.push({ marker: L.marker(ROUTE[0], { icon: nuevoBusIcon(), zIndexOffset: 1000 }).addTo(map),
                   phase: bi / NBUS, frac: 0, la: ROUTE[0][0], ln: ROUTE[0][1] });
    }

    // Distancias acumuladas (velocidad constante a lo largo de la ruta real)
    function dist(a,b){ var dx=a[0]-b[0], dy=a[1]-b[1]; return Math.sqrt(dx*dx+dy*dy); }
    var cum=[0]; for (var i=1;i<ROUTE.length;i++) cum[i]=cum[i-1]+dist(ROUTE[i-1],ROUTE[i]);
    var total=cum[cum.length-1] || 1;

    // ¿Qué parada sigue? (por cercanía al avance)
    var stopDist = PARADAS.map(function(p){
      var best=Infinity, acc=0;
      for (var i=1;i<ROUTE.length;i++){ acc=cum[i];
        var d=dist(ROUTE[i],p.pos); if (d<best){ best=d; p._d=acc; } }
      return p._d || 0;
    });

    function pointAt(frac){
      var target=frac*total;
      for (var i=1;i<ROUTE.length;i++){
        if (cum[i]>=target){
          var sf=(target-cum[i-1])/((cum[i]-cum[i-1])||1);
          return { la:ROUTE[i-1][0]+(ROUTE[i][0]-ROUTE[i-1][0])*sf,
                   ln:ROUTE[i-1][1]+(ROUTE[i][1]-ROUTE[i-1][1])*sf, seg:i };
        }
      }
      var last=ROUTE[ROUTE.length-1]; return { la:last[0], ln:last[1], seg:ROUTE.length-1 };
    }
    function proxParada(target){
      for (var i=0;i<stopDist.length;i++){ if (stopDist[i] >= target - 0.0001) return PARADAS[i].nombre; }
      return PARADAS[PARADAS.length-1].nombre;
    }

    function post(o){ if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o)); }

    // Backend real: emite GPS del bus (throttle ~1.5s)
    var lastGps=0;
    var socket = io('${apiBase}', { transports:['websocket','polling'] });
    socket.on('connect', function(){ post({ type:'ws', connected:true }); });
    socket.on('disconnect', function(){ post({ type:'ws', connected:false }); });

    // Posición (0..1) de un bus según su fase y la HORA real: los buses no
    // arrancan en el origen y avanzan solos, cíclicamente.
    function fracDe(phase){ return DUR > 0 ? (((Date.now() / DUR) + phase) % 1) : 0; }

    function frame(){
      var lista = [], nearIdx = 0, nearD = Infinity;
      for (var b = 0; b < buses.length; b++){
        var f = fracDe(buses[b].phase);
        var p = pointAt(f);
        buses[b].marker.setLatLng([p.la, p.ln]);
        orientar(buses[b].marker, rumboSeg(p.seg));
        buses[b].frac = f; buses[b].la = p.la; buses[b].ln = p.ln;
        lista.push({ frac:f, lat:p.la, lng:p.ln });
        if (USER){ var d = dist([p.la,p.ln],[USER.lat,USER.lng]); if (d < nearD){ nearD = d; nearIdx = b; } }
      }
      var pr = buses[nearIdx];
      if (following) map.panTo([pr.la, pr.ln], { animate:false });
      post({ type:'progress', buses:lista, prox: proxParada(pr.frac*total) });
      var now = Date.now();
      if (now-lastGps>1500){ lastGps=now; post({ type:'gps', lat:pr.la, lng:pr.ln }); }
      requestAnimationFrame(frame);
    }
    // Solo el pasajero corre la simulación; el conductor mueve su bus con GPS real.
    if (MODO === 'pasajero') {
      requestAnimationFrame(frame);
    } else if (USER) {
      buses[0].marker.setLatLng([USER.lat, USER.lng]);
    }

    // Modo conductor: el bus = ubicación real del conductor (enviada desde RN).
    var condTrail = [], condPrev = null;
    window.__setBus = function(la, ln){
      buses[0].marker.setLatLng([la, ln]);
      // Rumbo por GPS: dirección desde la última posición hacia la nueva.
      if (condPrev && (condPrev[0] !== la || condPrev[1] !== ln)) {
        orientar(buses[0].marker, Math.atan2(ln - condPrev[1], la - condPrev[0]) * 180 / Math.PI);
      }
      condPrev = [la, ln];
      condTrail.push([la, ln]);
      traveled.setLatLngs(condTrail);
      if (following) map.panTo([la, ln], { animate: false });
    };
  </script>
</body>
</html>`;
}
