import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/ThemeContext';
import { LEAFLET_CSS, LEAFLET_JS } from './leafletAssets';

export default function InteractiveMap({
  roadFeatures = [],
  activeRoute = null,
  alternateRoute = null,
  reports = [],
  isDriveMode = false,
  onSelectSegment = null,
}) {
  const webViewRef = useRef(null);
  const { colors, isDark } = useTheme();
  const [mapReady, setMapReady] = useState(false);

  // CartoDB tiles without {r} to prevent 404 on literal retina parameter
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  const mapBg = isDark ? '#111111' : '#E8E8E8';
  const popupBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const popupText = isDark ? '#F5F5F5' : '#1A1A1A';
  const mutedText = isDark ? '#9CA3AF' : '#6B7280';

  // Generate self-contained HTML with inlined Leaflet and dual tile provider (CartoDB + OSM fallback)
  const mapHtml = useMemo(() => {
    const roadJson = JSON.stringify(roadFeatures || []);
    const activeJson = JSON.stringify(activeRoute || null);
    const altJson = JSON.stringify(alternateRoute || null);
    const repJson = JSON.stringify(reports || []);

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<style>
${LEAFLET_CSS}
html,body{margin:0;padding:0;width:100%;height:100%;background-color:${mapBg};overflow:hidden}
#map{width:100vw;height:100vh;position:absolute;top:0;left:0;right:0;bottom:0;background-color:${mapBg}}
.leaflet-popup-content-wrapper{background:${popupBg};color:${popupText};border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;padding:4px}
.leaflet-popup-tip{background:${popupBg}}
.leaflet-popup-content{margin:10px 12px;line-height:1.4}
.sb{display:inline-block;padding:2px 8px;border-radius:100px;font-weight:600;font-size:11px}
.sb-o{background:rgba(34,197,94,0.15);color:#22C55E}
.sb-r{background:rgba(245,158,11,0.15);color:#F59E0B}
.sb-b{background:rgba(239,68,68,0.15);color:#EF4444}
.pin{display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-family:sans-serif;font-weight:bold;color:#fff}
</style>
</head>
<body>
<div id="map"></div>
<script>
${LEAFLET_JS}

// Initialize Leaflet map
var map = L.map('map', {
  zoomControl: false,
  attributionControl: false,
  preferCanvas: true
}).setView([25.85, 91.88], 10);

// Primary CartoDB tile layer with subdomains
var primaryLayer = L.tileLayer('${tileUrl}', {
  maxZoom: 19,
  subdomains: 'abcd',
  crossOrigin: true
});

// Automatic fallback to standard OpenStreetMap if CartoDB is blocked on mobile network
var osmFallback = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  crossOrigin: true
});

var tileFailed = false;
primaryLayer.on('tileerror', function() {
  if (!tileFailed) {
    tileFailed = true;
    try { map.removeLayer(primaryLayer); } catch(e) {}
    osmFallback.addTo(map);
  }
});

primaryLayer.addTo(map);

// Invalidate size immediately and periodically to ensure correct dimensions on mobile layout
map.invalidateSize(true);
setTimeout(function(){ map.invalidateSize(true); }, 100);
setTimeout(function(){ map.invalidateSize(true); }, 300);
setTimeout(function(){ map.invalidateSize(true); }, 700);
setTimeout(function(){ map.invalidateSize(true); }, 1500);
window.addEventListener('resize', function(){ map.invalidateSize(true); });

var roadLG = L.layerGroup().addTo(map);
var routeLG = L.layerGroup().addTo(map);
var markerLG = L.layerGroup().addTo(map);

function renderRoads(features) {
  roadLG.clearLayers();
  if (!features || !features.length) return;
  features.forEach(function(feat) {
    if (!feat.geometry || !feat.geometry.coordinates) return;
    var s = (feat.properties && feat.properties.status) || 'open';
    var n = (feat.properties && feat.properties.name) || 'Road Segment';
    var r = (feat.properties && feat.properties.risk_score) || 10;
    var c = '#22C55E', w = 4, d = null;
    if (s === 'risky') { c = '#F59E0B'; w = 5; }
    else if (s === 'blocked') { c = '#EF4444'; w = 5; d = '8,6'; }
    var ll = feat.geometry.coordinates.map(function(pt) { return [pt[1], pt[0]]; });
    var poly = L.polyline(ll, { color: c, weight: w, opacity: 0.85, dashArray: d });
    var bc = s === 'blocked' ? 'sb-b' : s === 'risky' ? 'sb-r' : 'sb-o';
    poly.bindPopup('<b>' + n + '</b><br><span class="sb ' + bc + '">' + s.toUpperCase() + '</span> <span style="color:${mutedText};font-size:11px;margin-left:6px">Risk ' + r + '/100</span>');
    poly.on('click', function() {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_SEGMENT', segment: feat }));
        }
      } catch(e) {}
    });
    roadLG.addLayer(poly);
  });
}

function renderRoutes(active, alt) {
  routeLG.clearLayers();
  var bounds = [];
  if (active && active.coordinates && active.coordinates.length) {
    var al = active.coordinates.map(function(c) { return [c[1], c[0]]; });
    var ap = L.polyline(al, { color: '#2563EB', weight: 5, opacity: 0.95 });
    routeLG.addLayer(ap);
    bounds = bounds.concat(al);

    // Start marker (A)
    var startIcon = L.divIcon({
      className: '',
      html: '<div class="pin" style="width:26px;height:26px;background:#22C55E;font-size:12px">A</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    var sm = L.marker(al[0], { icon: startIcon });
    sm.bindPopup('<b>Start</b><br>Khanapara, Guwahati');
    routeLG.addLayer(sm);

    // End marker (B)
    var endIcon = L.divIcon({
      className: '',
      html: '<div class="pin" style="width:26px;height:26px;background:#2563EB;font-size:12px">B</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    var em = L.marker(al[al.length - 1], { icon: endIcon });
    em.bindPopup('<b>Destination</b><br>Police Bazar, Shillong');
    routeLG.addLayer(em);
  }

  if (alt && alt.coordinates && alt.coordinates.length) {
    var bl = alt.coordinates.map(function(c) { return [c[1], c[0]]; });
    var bp = L.polyline(bl, { color: '#8B5CF6', weight: 6, opacity: 0.9, dashArray: '10,6' });
    routeLG.addLayer(bp);
    bounds = bounds.concat(bl);
  }

  if (bounds.length > 0) {
    try {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    } catch(e) {}
  }
}

function renderReports(repList) {
  markerLG.clearLayers();
  if (!repList || !repList.length) return;
  repList.forEach(function(rep) {
    if (!rep.lat || !rep.lng) return;
    var isVer = rep.status === 'verified';
    var bg = isVer ? '#EF4444' : '#F59E0B';
    var bc = isVer ? 'sb-b' : 'sb-r';

    var warnIcon = L.divIcon({
      className: '',
      html: '<div class="pin" style="width:24px;height:24px;background:' + bg + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    var m = L.marker([rep.lat, rep.lng], { icon: warnIcon });
    m.bindPopup('<b>' + (rep.type || 'Hazard').toUpperCase() + '</b><br><span style="font-size:12px">' + (rep.description || '') + '</span><br><span class="sb ' + bc + '" style="margin-top:4px">' + (rep.status || 'pending').toUpperCase() + '</span>');
    markerLG.addLayer(m);
  });
}

// Initial render
renderRoads(${roadJson});
renderRoutes(${activeJson}, ${altJson});
renderReports(${repJson});

// Handle live updates from React Native
function onMsg(e) {
  try {
    var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (d.type === 'UPDATE_ROADS') renderRoads(d.features);
    if (d.type === 'UPDATE_ROUTES') renderRoutes(d.activeRoute, d.alternateRoute);
    if (d.type === 'UPDATE_REPORTS') renderReports(d.reports);
    if (d.type === 'RECENTER') map.setView([25.85, 91.88], 10);
  } catch(err) {}
}
window.addEventListener('message', onMsg);
document.addEventListener('message', onMsg);

// Signal ready
try {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  }
} catch(e) {}
</script>
</body>
</html>`;
  }, [isDark, tileUrl, mapBg, popupBg, popupText, mutedText, roadFeatures, activeRoute, alternateRoute, reports]);

  // Send updates to WebView whenever props change without re-rendering the entire HTML
  useEffect(() => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'UPDATE_ROADS',
        features: roadFeatures
      }));
      webViewRef.current.postMessage(JSON.stringify({
        type: 'UPDATE_ROUTES',
        activeRoute,
        alternateRoute
      }));
      webViewRef.current.postMessage(JSON.stringify({
        type: 'UPDATE_REPORTS',
        reports
      }));
    }
  }, [roadFeatures, activeRoute, alternateRoute, reports, mapReady]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        console.log('[InteractiveMap] Mobile Map Ready');
        setMapReady(true);
      } else if (data.type === 'SELECT_SEGMENT' && onSelectSegment) {
        onSelectSegment(data.segment);
      }
    } catch (e) {}
  };

  // Web platform: render via iframe
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: mapBg }]}>
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="NIRVANA Interactive Map"
        />
      </View>
    );
  }

  // Native Mobile (Android & iOS): render via WebView with inlined Leaflet bundle
  return (
    <View style={[styles.container, { backgroundColor: mapBg }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml, baseUrl: 'https://tile.openstreetmap.org' }}
        style={styles.webView}
        containerStyle={styles.container}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        androidLayerType="software"
        scrollEnabled={false}
        nestedScrollEnabled={false}
        overScrollMode="never"
        cacheEnabled={false}
        onMessage={handleMessage}
        onError={(e) => console.warn('[InteractiveMap] WebView Error:', e.nativeEvent)}
        onHttpError={(e) => console.warn('[InteractiveMap] HTTP Error:', e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    opacity: 0.99,
  },
});
