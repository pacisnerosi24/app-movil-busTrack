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
    /* Bus estilo Uber: puck circular centrado, encima de la línea */
    .bus-halo { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      background:${color}22; }
    .bus-pin { display:flex; align-items:center; justify-content:center;
      width:44px; height:44px; border-radius:50%; background:${color};
      border:4px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,.4); }
    .bus-pin span { font-size:21px; line-height:21px; }
    .stop { width:13px; height:13px; border-radius:50%; background:#fff;
      border:3px solid ${color}; box-shadow:0 1px 4px rgba(0,0,0,.3); }
    .stop.end { background:${color}; width:16px; height:16px; }
    /* Tu ubicación (punto azul estilo Uber/Google) */
    .me { width:20px; height:20px; border-radius:50%; background:#2563EB; border:3px solid #fff;
      box-shadow:0 0 0 7px rgba(37,99,235,.20), 0 2px 6px rgba(0,0,0,.35); }
    .lbl { background:rgba(14,27,46,.92); color:#fff; font-family:system-ui,sans-serif;
      font-size:11px; font-weight:700; padding:3px 8px; border-radius:7px; white-space:nowrap; }
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

    var encuadre = USER ? ROUTE.concat([[USER.lat, USER.lng]]) : ROUTE;
    map.fitBounds(encuadre, { padding: [70, 70] });

    // Cámara que sigue al bus, pero suelta el control cuando el usuario
    // arrastra o hace zoom (estilo Uber). Se recupera con el botón recentrar.
    var following = true;
    var ready = false; // ignora el ajuste inicial (fitBounds) como si fuera gesto
    map.once('moveend', function(){ setTimeout(function(){ ready = true; }, 400); });
    setTimeout(function(){ ready = true; }, 1500);
    function soltar(){ if (ready && following){ following = false; post({ type:'follow', following:false }); } }
    map.on('dragstart', soltar);
    map.on('zoomstart', soltar);
    window.__recenter = function(){
      following = true;
      map.setView(bus.getLatLng(), map.getZoom(), { animate: true });
      post({ type:'follow', following:true });
    };

    // Ruta completa (tenue) + tramo recorrido (sólido)
    L.polyline(ROUTE, { color: COLOR, weight: 5, opacity: .3 }).addTo(map);
    var traveled = L.polyline([], { color: COLOR, weight: 6, opacity: .95, lineCap: 'round' }).addTo(map);

    // Paradas
    PARADAS.forEach(function (p, i) {
      var isEnd = (i === 0 || i === PARADAS.length - 1);
      L.marker(p.pos, { icon: L.divIcon({ className: '', html: '<div class="stop ' + (isEnd?'end':'') + '"></div>', iconSize:[16,16], iconAnchor:[8,8] }) }).addTo(map);
      if (isEnd) {
        L.marker(p.pos, { icon: L.divIcon({ className:'', html:'<div class="lbl">'+p.nombre+'</div>', iconSize:[0,0], iconAnchor:[-12,10] }) }).addTo(map);
      }
    });

    // Puck centrado sobre la posición (iconAnchor al centro) -> el bus va
    // ENCIMA de la línea, como el carro de Uber.
    var busIcon = L.divIcon({ className:'', html:'<div class="bus-halo"><div class="bus-pin"><span>🚌</span></div></div>', iconSize:[56,56], iconAnchor:[28,28] });
    var bus = L.marker(ROUTE[0], { icon: busIcon, zIndexOffset: 1000 }).addTo(map);

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

    var startTs=null, elapsedBase=0, playing=true, arrived=false, prevLL=ROUTE[0];
    function frame(ts){
      if (startTs===null) startTs=ts;
      if (playing){
        var elapsed=elapsedBase+(ts-startTs);
        var frac=Math.min(1, elapsed/DUR);
        lastFrac=frac;
        var p=pointAt(frac);
        bus.setLatLng([p.la,p.ln]);
        traveled.setLatLngs(ROUTE.slice(0,p.seg).concat([[p.la,p.ln]]));
        if (following) map.panTo([p.la,p.ln], { animate:false });

        var eta=Math.max(0, Math.ceil(MIN*(1-frac)));
        post({ type:'progress', frac:frac, eta:eta, prox:proxParada(frac*total), arrived:frac>=1 });

        var now=Date.now();
        if (now-lastGps>1500){ lastGps=now; post({ type:'gps', lat:p.la, lng:p.ln }); }

        if (frac>=1 && !arrived){ arrived=true;
          setTimeout(function(){ elapsedBase=0; startTs=null; arrived=false; traveled.setLatLngs([]); }, 2600);
        }
      } else { startTs=ts; }
      requestAnimationFrame(frame);
    }
    // Solo el pasajero corre la simulación; el conductor mueve el bus con su GPS real.
    if (MODO === 'pasajero') {
      requestAnimationFrame(frame);
    } else if (USER) {
      bus.setLatLng([USER.lat, USER.lng]);
    }

    // Modo conductor: el bus = ubicación real del conductor (enviada desde RN).
    var condTrail = [];
    window.__setBus = function(la, ln){
      bus.setLatLng([la, ln]);
      condTrail.push([la, ln]);
      traveled.setLatLngs(condTrail);
      if (following) map.panTo([la, ln], { animate: false });
    };

    window.__cmd=function(a){
      if (a==='pause') playing=false;
      else if (a==='play') playing=true;
      else if (a==='restart'){ elapsedBase=0; startTs=null; arrived=false; traveled.setLatLngs([]); playing=true; }
    };
    // Cambia la velocidad en vivo conservando la posición actual del bus.
    window.__setSpeed=function(s){ SPEED=s; DUR=BASE/SPEED; elapsedBase=lastFrac*DUR; startTs=null; };
  </script>
</body>
</html>`;
}
