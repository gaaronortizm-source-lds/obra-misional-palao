(function(){
'use strict';
var ICON={
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.900 1.900 6.500 5.500"/><path d="M16 5a3.500 3.500 0 010 7M18 14.800c1.800.7 3 2.400 3.500 5.200"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 flow:'<path d="M4 6h6v5H4zM14 13h6v5h-6zM10 8.500h4a2 2 0 012 2V13"/>',
 check:'<path d="M4 12.500l5 5L20 6.500"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 pin:'<path d="M12 21s7-6.200 7-11.500a7 7 0 00-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
 bell:'<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/>',
 search:'<circle cx="11" cy="11" r="6.500"/><path d="M20 20l-4.500-4.500"/>',
 gift:'<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7C9 7 8 3.500 10.500 3.500S12 7 12 7zM12 7c3 0 4-3.500 1.500-3.500S12 7 12 7z"/>',
 cal:'<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',
 send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 more:'<circle cx="5" cy="12" r="1.500"/><circle cx="12" cy="12" r="1.500"/><circle cx="19" cy="12" r="1.500"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
 star:'<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
 box:'<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>'
};var C = window.APP_CONFIG;
var sb = window.supabase.createClient(C.URL, C.KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
var ROOT = document.getElementById('app');

var MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var DIAS = ['dom','lun','mar','mié','jue','vie','sáb'];
var ORGS = ['Primaria','Hombres Jóvenes','Mujeres Jóvenes','Sociedad de Socorro','Cuórum de Élderes'];
var CHK = [
  ['Entrevista','Entrevista con el obispo',function(p){return true;}],
  ['Sacerdocio','Sacerdocio',function(p){return p.organizacion === 'Cuórum de Élderes';}],
  ['Recomendación','Recomendación',function(p){return !!p.organizacion && p.organizacion !== 'Primaria';}],
  ['Historia','Historia familiar',function(p){return true;}],
  ['Ministrantes','Ya tiene ministrantes',function(p){return true;}]
];
var STAGES = {1:'Enseñándose',2:'Con fecha'};
var KIND = {converso:'Converso',amigo:'Amigo',referencia:'Referencia',regresando:'Regresando'};
var MOTIVOS = ['No contestó','Dejó de asistir','Decidió esperar','Otro motivo'];

var S = {
  screen:'boot', role:null, uid:null, barrio:null, barrioNombre:'', meta:30,
  people:[], asist:{}, apoyos:{}, eventos:{}, urls:{},
  tab:'hoy', sel:null, filter:'todos', q:'', stage:1, domIdx:0,
  sheet:null, toast:null, toastT:null, busy:false, pin:'', pinFase:'a', pinA:'', pinErr:'',
  rit:null, resumen:null, tmpFoto:null, loginBarrio:'habich', err:'', lastLoad:0, rk:'', undo:null
};

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function ic(n){ return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }
var COLORS = ['#1D5A8E','#4E9A7F','#2A8C9A','#D9972B','#7A5C9E','#B2603A'];
function col(s){ var h = 0; s = String(s||''); for (var i = 0; i < s.length; i++) h += s.charCodeAt(i); return COLORS[h % COLORS.length]; }
function ini(n){ var p = String(n||'?').trim().split(/\s+/); return ((p[0][0]||'?') + (p[1] ? p[1][0] : '')).toUpperCase(); }

/* ---------- Fechas (hora local del celular, Lima) ---------- */
function hoyD(){ var d = new Date(); d.setHours(0,0,0,0); return d; }
function iso(d){ return d.getFullYear() + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function pd(x){ var a = String(x).slice(0,10).split('-'); return new Date(+a[0], +a[1]-1, +a[2]); }
function addD(d, n){ var r = new Date(d); r.setDate(r.getDate() + n); return r; }
function sumaDias(n){ return iso(addD(hoyD(), n)); }
function fmtF(x){ var d = pd(x); return DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MES[d.getMonth()]; }
function fmtC(d){ return d.getDate() + ' ' + MES[d.getMonth()]; }
function enDias(x){ return Math.round((pd(x) - hoyD()) / 864e5); }
function cuando(n){ return n < 0 ? 'pasó hace ' + (-n) + ' d' : n === 0 ? 'hoy' : n === 1 ? 'mañana' : 'en ' + n + ' días'; }
function ultDom(){ var d = hoyD(); d.setDate(d.getDate() - d.getDay()); return d; }
function domingo(back){ return iso(addD(ultDom(), -7 * back)); }   // back=0 último domingo
function diasCumple(nac){
  var n = pd(nac), h = hoyD(), c = new Date(h.getFullYear(), n.getMonth(), n.getDate());
  if (c < h) c = new Date(h.getFullYear() + 1, n.getMonth(), n.getDate());
  return Math.round((c - h) / 864e5);
}
function edadDe(nac){
  var n = pd(nac), h = hoyD(), e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return e;
}
function orgSugerida(nac, sx){
  if (!nac) return null;
  var edad = edadDe(nac);
  if (edad < 12) return { o:'Primaria', edad:edad };
  if (!sx) return { o:'', edad:edad, falta:true };
  if (edad < 18) return { o: sx === 'H' ? 'Hombres Jóvenes' : 'Mujeres Jóvenes', edad:edad };
  return { o: sx === 'H' ? 'Cuórum de Élderes' : 'Sociedad de Socorro', edad:edad };
}

/* ---------- Almacenamiento local (con protección) ---------- */
var LS = {
  get:function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set:function(k,v){ try { localStorage.setItem(k,v); } catch(e){} },
  del:function(k){ try { localStorage.removeItem(k); } catch(e){} }
};
function pinKey(){ return 'om-pin-' + (S.uid || ''); }
async function sha(pin, salt){
  var b = new TextEncoder().encode(salt + ':' + pin);
  var d = await crypto.subtle.digest('SHA-256', b);
  return Array.from(new Uint8Array(d)).map(function(x){ return x.toString(16).padStart(2,'0'); }).join('');
}
function tocarActividad(){ LS.set('om-last', String(Date.now())); }

/* ---------- Mensajes ---------- */
function toast(msg, undoFn){
  S.toast = { msg:msg, undo:undoFn || null };
  clearTimeout(S.toastT); paintToast();
  S.toastT = setTimeout(function(){ S.toast = null; paintToast(); }, undoFn ? 6000 : 3200);
}
function paintToast(){
  var t = ROOT.querySelector('.toast'); if (t) t.remove();
  if (!S.toast) return;
  var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role','status');
  d.innerHTML = ic('check') + '<span>' + esc(S.toast.msg) + '</span>' + (S.toast.undo ? '<button data-a="undo">Deshacer</button>' : '');
  ROOT.appendChild(d);
}
function falloGuardar(e){
  console.error(e);
  toast('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.');
}

/* ---------- Datos del barrio ---------- */
async function paginar(mk){
  var out = [], from = 0;
  for (;;) {
    var r = await mk().range(from, from + 999);
    if (r.error) throw r.error;
    out = out.concat(r.data);
    if (r.data.length < 1000) break;
    from += 1000;
  }
  return out;
}
async function cargarBarrio(){
  var b = await sb.from('barrios').select('*').eq('id', S.barrio).single();
  if (b.error) throw b.error;
  S.barrioNombre = 'Barrio ' + b.data.nombre; S.meta = b.data.meta_anual;
  await recargar();
}
async function recargar(){
  var desde = domingo(11);
  var r = await Promise.all([
    paginar(function(){ return sb.from('personas').select('*').is('eliminado_en', null).order('creado_en', { ascending:false }); }),
    paginar(function(){ return sb.from('asistencia').select('persona_id,domingo,estado').gte('domingo', desde); }),
    paginar(function(){ return sb.from('apoyos').select('*'); }),
    paginar(function(){ return sb.from('eventos').select('id,persona_id,tipo,texto,creado_en').order('creado_en', { ascending:false }); })
  ]);
  S.people = r[0];
  S.asist = {}; r[1].forEach(function(a){ (S.asist[a.persona_id] = S.asist[a.persona_id] || {})[a.domingo] = a.estado; });
  S.apoyos = {}; r[2].forEach(function(a){ (S.apoyos[a.persona_id] = S.apoyos[a.persona_id] || []).push(a); });
  S.eventos = {}; r[3].forEach(function(e){ (S.eventos[e.persona_id] = S.eventos[e.persona_id] || []).push(e); });
  S.lastLoad = Date.now();
  await cargarFotos();
}
async function cargarFotos(){
  var paths = S.people.map(function(p){ return p.foto_path; }).filter(function(x){ return x && !S.urls[x]; });
  if (!paths.length) return;
  try {
    var r = await sb.storage.from('fotos').createSignedUrls(paths, 3600);
    if (r.data) r.data.forEach(function(o){ if (o.signedUrl) S.urls[o.path] = o.signedUrl; });
  } catch(e){ console.error(e); }
}
function byId(id){ return S.people.filter(function(p){ return p.id === id; })[0]; }
async function upd(id, patch){
  var r = await sb.from('personas').update(patch).eq('id', id).select().single();
  if (r.error) throw r.error;
  var i = S.people.findIndex(function(p){ return p.id === id; });
  if (i > -1) S.people[i] = r.data;
  var e = await sb.from('eventos').select('id,persona_id,tipo,texto,creado_en').eq('persona_id', id).order('creado_en', { ascending:false });
  if (!e.error) S.eventos[id] = e.data;
  return r.data;
}
async function subirFoto(persona, dataUrl){
  var blob = await (await fetch(dataUrl)).blob();
  var path = S.barrio + '/' + persona.id + '.jpg';
  var r = await sb.storage.from('fotos').upload(path, blob, { upsert:true, contentType:'image/jpeg' });
  if (r.error) throw r.error;
  delete S.urls[path];
  var p = await upd(persona.id, { foto_path:path });
  await cargarFotos();
  return p;
}
function leerFoto(file, cb){
  var r = new FileReader();
  r.onload = function(){
    var im = new Image();
    im.onload = function(){
      var m = 480, k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.8));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
function getAs(pid, dom){ return (S.asist[pid] || {})[dom] || null; }
var colaAs = Promise.resolve();
function guardarAs(pid, dom, est){
  colaAs = colaAs.then(async function(){
    if (est) {
      var r = await sb.from('asistencia').upsert({ persona_id:pid, domingo:dom, estado:est }, { onConflict:'persona_id,domingo' });
      if (r.error) throw r.error;
    } else {
      var r2 = await sb.from('asistencia').delete().eq('persona_id', pid).eq('domingo', dom);
      if (r2.error) throw r2.error;
    }
  }).catch(function(e){ falloGuardar(e); recargar().then(render); });
}
function cicloAs(pid, dom){
  var v = getAs(pid, dom), nx = v === null ? 'si' : (v === 'si' ? 'no' : null);
  S.asist[pid] = S.asist[pid] || {};
  if (nx) S.asist[pid][dom] = nx; else delete S.asist[pid][dom];
  guardarAs(pid, dom, nx);
  return nx;
}
async function cargarResumen(){
  var r = await sb.rpc('resumen_estaca');
  if (r.error) throw r.error;
  S.resumen = r.data; S.lastLoad = Date.now();
}

/* ---------- Acceso: clave larga la primera vez, luego PIN ---------- */
async function entrar(){
  S.screen = 'cargando'; render();
  try {
    var p = await sb.from('perfiles').select('rol,barrio_id').maybeSingle();
    if (p.error || !p.data) throw new Error('Sin perfil');
    S.role = p.data.rol; S.barrio = p.data.barrio_id;
    if (S.role === 'estaca') { await cargarResumen(); S.screen = 'estaca'; }
    else { await cargarBarrio(); S.screen = 'hoy'; S.tab = 'hoy'; }
    tocarActividad();
  } catch(e){ console.error(e); S.screen = 'error'; }
  render();
}
async function salir(){
  var uid = S.uid;
  try { await sb.auth.signOut(); } catch(e){}
  if (uid) LS.del('om-pin-' + uid);
  LS.del('om-last');
  S.uid = null; S.role = null; S.people = []; S.asist = {}; S.apoyos = {}; S.eventos = {}; S.resumen = null; S.urls = {};
  S.pin = ''; S.err = ''; S.sheet = null; S.screen = 'login'; render();
}
/* =====================  PANTALLAS  ===================== */
function avP(p, st){
  var u = p.foto_path && S.urls[p.foto_path];
  if (u) return '<span class="av" style="background:#ccc url(' + esc(u) + ') center/cover;' + (st||'') + '"></span>';
  return '<span class="av" style="background:' + col(p.nombre) + ';' + (st||'') + '">' + esc(ini(p.nombre)) + '</span>';
}
function waUrl(tel, texto){
  var d = String(tel||'').replace(/\D/g,'');
  if (d.length === 9) d = '51' + d;
  return 'https://wa.me/' + d + (texto ? '?text=' + encodeURIComponent(texto) : '');
}
/* Regla de los 12 meses: un converso cuenta como tal hasta cumplir un año desde su bautismo */
function finAnio(p){ var d = pd(p.fecha_bautismo), m = d.getMonth(); d.setFullYear(d.getFullYear() + 1); if (d.getMonth() !== m) d.setDate(0); return d; }
function esGraduado(p){ return p.tipo === 'converso' && !!p.fecha_bautismo && finAnio(p) <= hoyD(); }
function conversosAct(){ return S.people.filter(function(p){ return p.tipo === 'converso' && p.estado === 'activo' && !esGraduado(p); }); }
function amigosDe(estado){ return S.people.filter(function(p){ return p.tipo === 'amigo' && p.estado === estado; }); }

function render(){
  var key = S.screen + (S.screen === 'ficha' ? S.sel : '') + S.tab;
  var sc = $('scr'), keep = (key === S.rk && sc) ? sc.scrollTop : 0;
  S.rk = key;
  if (['boot','login','lock','newpin','cargando','error'].indexOf(S.screen) > -1) {
    ROOT.innerHTML = authHtml(); paintToast(); return;
  }
  var top = '', body = '', nav = '';
  if (S.screen === 'ficha') { top = ''; body = fichaHtml(); }
  else {
    var t = '', s = '';
    if (S.screen === 'hoy') { t = 'Hola'; s = S.barrioNombre + ' · Líder misional'; body = hoyHtml(); }
    else if (S.screen === 'personas') { t = 'Personas'; s = S.barrioNombre; body = personasHtml(); }
    else if (S.screen === 'amigos') { t = 'Amigos'; s = 'Personas que están aprendiendo'; body = amigosHtml(); }
    else if (S.screen === 'asistencia') { t = 'Asistencia'; s = 'Conversos · domingo'; body = asistHtml(); }
    else if (S.screen === 'estaca') { t = 'Estaca Palao'; s = 'Resumen de los 5 barrios'; body = estacaHtml(); }
    top = '<div class="topbar"><h1>' + esc(t) + '<small>' + esc(s) + '</small></h1><button class="avatar-btn" data-a="menu" aria-label="Cuenta">' + (S.role === 'estaca' ? 'PE' : 'OM') + '</button></div>';
  }
  if (S.role !== 'estaca') nav = navHtml();
  ROOT.innerHTML = top + (S.screen === 'ficha' ? body : '<div class="screen" id="scr">' + body + '</div>') + nav;
  if ($('scr')) $('scr').scrollTop = keep;
  paintToast();
  if (S.sheet) openSheet(S.sheet);
}

function navHtml(){
  function b(t, i, l){ return '<button data-a="tab" data-v="' + t + '" class="' + (S.tab === t ? 'on' : '') + '">' + ic(i) + l + '</button>'; }
  return '<nav class="nav">' + b('hoy','home','Hoy') + b('personas','users','Personas') +
    '<button class="fab" data-a="add" aria-label="Agregar persona">' + ic('plus') + '</button>' + b('amigos','flow','Amigos') + b('asistencia','check','Asistencia') + '</nav>';
}

/* ---------- Entrada ---------- */
function padHtml(extra){
  var dots = ''; for (var i = 0; i < 6; i++) dots += '<i class="' + (i < S.pin.length ? 'f' : '') + '"></i>';
  var keys = ''; [1,2,3,4,5,6,7,8,9].forEach(function(k){ keys += '<button data-a="k" data-v="' + k + '">' + k + '</button>'; });
  return '<div class="pins" aria-label="PIN">' + dots + '</div>' +
    (S.pinErr ? '<div style="text-align:center;color:#F4B4AC;font-size:13px;margin-bottom:8px">' + esc(S.pinErr) + '</div>' : '') +
    '<div class="pad">' + keys + '<button class="x" data-a="k" data-v="del">Borrar</button><button data-a="k" data-v="0">0</button>' + (extra || '<span></span>') + '</div>';
}
function authHtml(){
  if (S.screen === 'boot' || S.screen === 'cargando') return '<div class="login" style="justify-content:center;align-items:center;text-align:center"><div style="font-family:var(--font-display);font-size:22px;color:var(--gold)">Obra misional</div><div style="color:var(--soft);margin-top:8px;font-size:13px">Cargando…</div></div>';
  if (S.screen === 'error') return '<div class="login" style="justify-content:center"><h1>No se pudo <em>cargar</em></h1><p style="color:var(--soft);line-height:1.5">Revisa tu conexión a internet. Si el problema sigue, cierra sesión y entra de nuevo.</p><button class="btn gold" style="margin-top:16px" data-a="reintentar">Reintentar</button><button class="btn ghost" style="margin-top:10px" data-a="logout">Cerrar sesión</button></div>';
  if (S.screen === 'login') {
    var opts = C.BARRIOS.map(function(b){ return '<option value="' + b.id + '"' + (b.id === S.loginBarrio ? ' selected' : '') + '>' + esc(b.nombre) + '</option>'; }).join('');
    return '<form class="login" id="loginform" autocomplete="on"><div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)">Estaca Palao</div>' +
      '<h1 style="margin-top:10px">Obra misional,<br><em>en tu bolsillo</em></h1>' +
      '<label for="usr">Usuario</label><select class="input" id="usr" style="appearance:auto">' + opts + '</select>' +
      '<label for="pw">Clave</label><input class="input" id="pw" type="password" autocomplete="current-password" placeholder="Tu clave larga">' +
      (S.err ? '<div style="color:#F4B4AC;font-size:13px;margin-top:10px">' + esc(S.err) + '</div>' : '') +
      '<button class="btn gold" type="submit" style="margin-top:20px">Entrar</button>' +
      '<div style="text-align:center;margin-top:14px;font-size:11px;color:#9fb2c6;line-height:1.5">La clave larga se escribe una sola vez en cada celular. Después entras solo con tu PIN.</div></form>';
  }
  if (S.screen === 'lock') {
    var cfg = C.BARRIOS.filter(function(b){ return b.email === S.email; })[0];
    return '<div class="login"><div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)">Estaca Palao</div><h1 style="margin-top:10px;font-size:26px">' + esc(cfg ? cfg.nombre : 'Obra misional') + '</h1>' +
      '<div style="margin-top:22px;text-align:center;color:var(--soft);font-size:13px">Escribe tu PIN de 6 dígitos</div>' + padHtml('<button class="x" data-a="usarclave">Usar clave</button>') + '</div>';
  }
  if (S.screen === 'newpin') {
    return '<div class="login"><div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)">Estaca Palao</div><h1 style="margin-top:10px;font-size:26px">Crea tu <em>PIN</em></h1>' +
      '<div style="margin-top:12px;text-align:center;color:var(--soft);font-size:13px;line-height:1.5">' + (S.pinFase === 'a' ? 'Elige 6 dígitos. Lo usarás para abrir la app en este celular.' : 'Escríbelo otra vez para confirmar.') + '</div>' + padHtml(S.role ? '<button class="x" data-a="cancelpin">Cancelar</button>' : '') + '</div>';
  }
  return '';
}

/* ---------- Hoy ---------- */
function hoyHtml(){
  var anio = hoyD().getFullYear(), mesN = hoyD().getMonth();
  var Cv = conversosAct(), ult = domingo(0);
  var bautAnio = S.people.filter(function(p){ return p.tipo === 'converso' && p.fecha_bautismo && pd(p.fecha_bautismo).getFullYear() === anio; });
  var bautMes = bautAnio.filter(function(p){ return pd(p.fecha_bautismo).getMonth() === mesN; }).length;
  var pct = Math.min(1, bautAnio.length / (S.meta || 30));
  var falt = Cv.filter(function(p){ return getAs(p.id, ult) === 'no'; });
  var prox = amigosDe('activo').filter(function(p){ return p.etapa === 2 && p.fecha_bautismal && enDias(p.fecha_bautismal) >= 0 && enDias(p.fecha_bautismal) <= 14; })
    .sort(function(a,b){ return a.fecha_bautismal < b.fecha_bautismal ? -1 : 1; });
  var sinc = S.people.filter(function(p){ return p.tipo === 'referencia' && !p.contactado_en && (Date.now() - new Date(p.creado_en)) > 864e5; });
  var cumple = S.people.filter(function(p){ return p.fecha_nacimiento && p.estado === 'activo' && diasCumple(p.fecha_nacimiento) <= 7; })
    .sort(function(a,b){ return diasCumple(a.fecha_nacimiento) - diasCumple(b.fecha_nacimiento); });
  var reg = Cv.filter(function(p){ return getAs(p.id, ult); }), si = reg.filter(function(p){ return getAs(p.id, ult) === 'si'; }).length;
  var h = '';
  h += '<div class="card row"><div class="ring"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="38" fill="none" stroke="#E9EEF4" stroke-width="9"/><circle cx="46" cy="46" r="38" fill="none" stroke="#D9972B" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (238.8 * pct).toFixed(1) + ' 238.8"/></svg><div class="n">' + bautAnio.length + '<small>de ' + S.meta + '</small></div></div>' +
    '<div class="grow"><div class="h2" style="margin:0">Meta de bautismos</div><div class="sub">Este mes: ' + bautMes + ' · Faltan ' + Math.max(0, S.meta - bautAnio.length) + ' en el año</div></div></div>';
  h += '<div class="h2">Para hoy</div>';
  var any = false;
  if (falt.length) { any = true;
    h += '<div class="card todo"><div class="ic" style="background:var(--bad)">' + ic('bell') + '</div><div class="grow"><b>' + falt.length + (falt.length === 1 ? ' converso faltó' : ' conversos faltaron') + ' el domingo</b><span class="sub">' + esc(falt.slice(0,3).map(function(p){ return p.nombre; }).join(', ')) + (falt.length > 3 ? '…' : '') + '</span><div style="margin-top:10px"><button class="btn gold sm" data-a="open" data-id="' + falt[0].id + '">Avisar a su apoyo</button></div></div></div>'; }
  if (prox.length) { any = true;
    h += '<div class="card todo"><div class="ic" style="background:var(--blue)">' + ic('cal') + '</div><div class="grow"><b>' + prox.length + (prox.length === 1 ? ' bautismo' : ' bautismos') + ' en los próximos 14 días</b><span class="sub">' + esc(prox[0].nombre) + ' · ' + fmtF(prox[0].fecha_bautismal) + ' (' + cuando(enDias(prox[0].fecha_bautismal)) + ')</span><div style="margin-top:10px"><button class="btn ghost sm" data-a="open" data-id="' + prox[0].id + '">Ver ficha</button></div></div></div>'; }
  if (sinc.length) { any = true;
    h += '<div class="card todo"><div class="ic" style="background:var(--gold2)">' + ic('send') + '</div><div class="grow"><b>' + sinc.length + (sinc.length === 1 ? ' referencia sin contactar' : ' referencias sin contactar') + '</b><span class="sub">' + esc(sinc[0].nombre) + ' · hace más de 24 horas</span><div style="margin-top:10px"><button class="btn ghost sm" data-a="open" data-id="' + sinc[0].id + '">Ver referencia</button></div></div></div>'; }
  if (cumple.length) { any = true;
    h += '<div class="card todo"><div class="ic" style="background:var(--green)">' + ic('gift') + '</div><div class="grow"><b>Cumpleaños esta semana</b><span class="sub">' + esc(cumple.slice(0,3).map(function(p){ var d = diasCumple(p.fecha_nacimiento); return p.nombre + ' (' + (d === 0 ? 'hoy' : d === 1 ? 'mañana' : 'en ' + d + ' días') + ')'; }).join(', ')) + '</span></div></div>'; }
  if (!any) h += '<div class="card"><div class="sub">Por ahora no hay nada pendiente. Buen trabajo.</div></div>';
  h += '<div class="h2">Resumen rápido</div><div class="card" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">' +
    '<div><b style="font-family:var(--font-display);font-size:22px;color:var(--navy)">' + amigosDe('activo').length + '</b><div class="sub">Amigos<br>enseñándose</div></div>' +
    '<div><b style="font-family:var(--font-display);font-size:22px;color:var(--navy)">' + S.people.filter(function(p){ return p.tipo === 'referencia'; }).length + '</b><div class="sub">Referencias<br>abiertas</div></div>' +
    '<div><b style="font-family:var(--font-display);font-size:22px;color:var(--navy)">' + (reg.length ? Math.round(si / reg.length * 100) + '%' : '—') + '</b><div class="sub">Asistencia<br>último domingo</div></div></div>';
  return h;
}

/* ---------- Personas ---------- */
function personaFila(p){
  var st = '';
  if (p.estado === 'mudado') st = '<span class="chip">Mudado</span>';
  else if (esGraduado(p)) st = '<span class="chip">Cumplió su año</span>';
  else if (p.tipo === 'converso') { var v = getAs(p.id, domingo(0)); st = v === 'no' ? '<span class="chip bad">Faltó</span>' : v === 'si' ? '<span class="chip ok">Asistió</span>' : '<span class="chip">Sin registro</span>'; }
  else if (p.tipo === 'amigo') st = p.estado === 'dejo_de_ensenar' ? '<span class="chip warn">Se dejó de enseñar · ' + esc(p.motivo_baja || '') + '</span>' : '<span class="chip blue">' + STAGES[p.etapa || 1] + (p.etapa === 2 && p.fecha_bautismal ? ' · ' + fmtF(p.fecha_bautismal) : '') + '</span>';
  else if (p.tipo === 'referencia') { var urg = !p.contactado_en && (Date.now() - new Date(p.creado_en)) > 864e5; st = p.contactado_en ? '<span class="chip ok">Contactada</span>' : '<span class="chip ' + (urg ? 'warn' : '') + '">' + (urg ? 'Sin contactar +24 h' : 'Nueva') + '</span>'; }
  else st = '<span class="chip ok">Regresando</span>';
  return '<button class="item" data-a="open" data-id="' + p.id + '">' + avP(p) + '<span class="grow"><span class="t">' + esc(p.nombre) + '</span><br><span class="sub">' + KIND[p.tipo] + '</span> ' + st + '</span><span class="mini" data-a="wa" data-id="' + p.id + '" role="button" aria-label="WhatsApp">' + ic('chat') + '</span></button>';
}
function personasListHtml(){
  var f = S.filter, q = S.q.toLowerCase();
  var list = S.people.filter(function(p){
    if (q && p.nombre.toLowerCase().indexOf(q) < 0) return false;
    if (f === 'graduado') return esGraduado(p);
    if (esGraduado(p)) return !!q && f === 'todos';      // solo aparecen en "Todos" si los buscas por nombre
    return f === 'todos' || p.tipo === f;
  });
  var vacio = f === 'graduado' ? 'Todavía nadie ha cumplido su año.' : (S.people.length ? 'Nadie coincide con esa búsqueda.' : 'Todavía no hay personas. Toca el botón + para agregar la primera.');
  return list.map(personaFila).join('') || '<p class="sub" style="text-align:center;margin-top:24px">' + vacio + '</p>';
}
function personasHtml(){
  var f = S.filter;
  var nGrad = S.people.filter(esGraduado).length;
  var seg = [['todos','Todos'],['converso','Conversos'],['amigo','Amigos'],['referencia','Referencias'],['regresando','Regresando']].concat(nGrad ? [['graduado','Cumplieron su año (' + nGrad + ')']] : []).map(function(s){ return '<button data-a="filtro" data-v="' + s[0] + '" class="' + (f === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('');
  return '<div class="search">' + ic('search') + '<input id="q" placeholder="Buscar por nombre" value="' + esc(S.q) + '" aria-label="Buscar"></div><div class="seg">' + seg + '</div><div class="list" id="plist" style="margin-top:6px">' + personasListHtml() + '</div>';
}

/* ---------- Ficha ---------- */
function histTexto(e){
  var f = fmtC(new Date(e.creado_en)), t = e.texto || '';
  var m = { fecha_puesta:'Fecha bautismal puesta: ' + (t ? fmtF(t) : ''), perdio_fecha:'Perdió la fecha bautismal', dejo_de_ensenar:'Se dejó de enseñar' + (t ? ': ' + t : ''), retomado:'Retomado: volvió a Enseñándose', bautizado:'Se bautizó' };
  return f + ' · ' + (m[e.tipo] || e.tipo);
}
function fichaHtml(){
  var p = byId(S.sel); if (!p) return '<div class="screen"><p class="sub">No se encontró a esta persona.</p></div>';
  var h = '<div class="topbar"><button class="mini" data-a="back" aria-label="Volver" style="color:var(--navy)">' + ic('back') + '</button><div class="grow"></div><button class="mini" data-a="more" aria-label="Más opciones" style="color:var(--navy)">' + ic('more') + '</button></div>';
  h += '<div class="screen" id="scr" style="padding-top:0">';
  h += '<div style="text-align:center"><label style="display:block;width:72px;margin:0 auto;position:relative;cursor:pointer" title="Cambiar foto">' + avP(p, 'width:72px;height:72px;font-size:24px;margin:0 auto') + '<span style="position:absolute;right:-4px;bottom:-4px;width:26px;height:26px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center">' + ic('plus') + '</span><input type="file" id="ffo" accept="image/*" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer" aria-label="Agregar o cambiar foto"></label>' +
    '<div style="font-family:var(--font-display);font-weight:600;font-size:21px;color:var(--navy);margin-top:8px">' + esc(p.nombre) + '</div><div style="margin-top:4px"><span class="chip blue">' + KIND[p.tipo] + '</span> ' + (p.tipo === 'converso' && p.organizacion ? '<span class="chip">' + esc(p.organizacion) + '</span>' : '') + (p.estado === 'mudado' ? ' <span class="chip">Mudado</span>' : '') + '</div></div>';
  if (p.tipo === 'converso' && p.fecha_bautismo) {
    var fa = finAnio(p), dr = Math.round((fa - hoyD()) / 864e5), fas = fmtC(fa) + ' ' + fa.getFullYear();
    if (dr <= 0) h += '<div class="card" style="background:#EEF4FA;border-color:#CFDAE6"><div class="sub" style="color:var(--ink)"><b>Cumplió su año el ' + fas + '.</b> Ya no cuenta en los números de conversos de la estaca. Su ficha queda guardada.</div></div>';
    else if (dr <= 28) h += '<div class="card" style="background:#FFF8E5;border-color:#F2DDA6"><div class="sub" style="color:#6B4A0A"><b>Cumple su año el ' + fas + ' (' + (dr === 1 ? 'mañana' : 'en ' + dr + ' días') + ').</b> Es buen momento para el último seguimiento y para presentarlo a su organización.</div></div>';
  }
  var conAvisar = p.tipo === 'converso';
  h += '<div class="quick" style="grid-template-columns:repeat(' + (conAvisar ? 4 : 3) + ',1fr)"><button data-a="call">' + ic('phone') + 'Llamar</button><button data-a="wa" data-id="' + p.id + '" style="color:var(--green)">' + ic('chat') + 'WhatsApp</button><button data-a="map">' + ic('pin') + 'Mapa</button>' + (conAvisar ? '<button data-a="avisar">' + ic('bell') + 'Avisar</button>' : '') + '</div>';

  if (p.tipo === 'converso') {
    var fechas = [], sem = [];
    for (var i = 7; i >= 0; i--) { var dm = domingo(i); fechas.push(fmtC(pd(dm))); sem.push({ d:dm, v:getAs(p.id, dm) }); }
    var racha = 0; for (var z = 7; z >= 0 && sem[z].v === 'no'; z--) racha++;
    h += '<div class="h2">Asistencia reciente</div><div class="card"><div class="sub">' + (racha ? 'Faltó ' + racha + (racha > 1 ? ' domingos seguidos' : ' domingo') : 'Sin faltas seguidas') + ' · últimos 8 domingos</div><div class="dots8">' +
      sem.map(function(s, i){ return '<button class="d8 ' + (s.v === 'si' ? 'si' : s.v === 'no' ? 'no' : '') + '" data-a="sem" data-v="' + s.d + '" aria-label="Domingo ' + fechas[i] + ': ' + (s.v === 'si' ? 'asistió' : s.v === 'no' ? 'faltó' : 'sin registro') + '. Toca para cambiar"><span class="c">' + (s.v === 'si' ? ic('check') : s.v === 'no' ? ic('x') : '') + '</span><span class="dt">' + fechas[i] + '</span></button>'; }).join('') +
      '</div><div class="sub" style="margin-top:8px">Toca un domingo para corregirlo: asistió, faltó o sin registro.</div></div>';
    var pasos = p.pasos || {};
    h += '<div class="h2">Seguimiento</div><div class="card" style="padding:4px 14px">' + (p.organizacion ? '' : '<div class="sub" style="padding:8px 0">Elige su organización en Datos para ver los pasos que le aplican.</div>') +
      CHK.filter(function(c){ return c[2](p); }).map(function(c){ var k = c[0]; return '<button class="check" data-a="paso" data-v="' + k + '"><span class="box ' + (pasos[k] ? 'on' : '') + '">' + (pasos[k] ? ic('check') : '') + '</span><span>' + c[1] + '</span></button>'; }).join('') +
      '</div><p class="sub" style="margin:6px 0 0">Solo se muestran los pasos que aplican a su organización.</p>';
    var ap = S.apoyos[p.id] || [];
    h += '<div class="h2">Personas de apoyo</div><div class="card">' + ap.map(function(a){ return '<div class="row" style="padding:6px 0"><span class="av" style="background:' + col(a.nombre) + ';width:34px;height:34px;font-size:12px">' + esc(ini(a.nombre)) + '</span><span class="grow">' + esc(a.nombre) + '</span><button class="btn gold sm" data-a="avisarA" data-id="' + a.id + '">Avisar</button><button class="mini" data-a="delapoyo" data-id="' + a.id + '" aria-label="Quitar" style="color:var(--bad)">' + ic('x') + '</button></div>'; }).join('') +
      '<button class="btn ghost sm" style="margin-top:8px" data-a="addapoyo">+ Agregar persona de apoyo</button></div>';
  }
  if (p.tipo === 'amigo') {
    if (p.estado === 'dejo_de_ensenar') {
      h += '<div class="card" style="background:#FFF8E5;border-color:#F2DDA6"><b style="font-weight:600;color:#6B4A0A">Se dejó de enseñar</b><div class="sub" style="color:#6B4A0A;margin-top:4px">' + esc(p.motivo_baja || '') + (p.baja_en ? ' · desde ' + fmtC(pd(p.baja_en)) : '') + '. No cuenta en el pronóstico de la estaca.</div></div>';
      h += '<button class="btn gold" style="margin-top:12px" data-a="retomar" data-id="' + p.id + '">Retomar: volver a Enseñándose</button>';
    } else {
      h += '<div class="h2">Etapa</div><div class="stages">' + [1,2].map(function(i){ return '<button class="' + ((p.etapa || 1) === i ? 'on' : '') + '" data-a="etapa" data-v="' + i + '"><b>' + i + '</b>' + STAGES[i] + '</button>'; }).join('') + '</div>';
      if (p.etapa === 2 && p.fecha_bautismal) h += '<div class="card"><div class="field" style="border:0"><label>Fecha bautismal</label><button class="chip blue" data-a="editfecha" style="border:0;font-size:13px;padding:7px 12px;min-height:36px">' + fmtF(p.fecha_bautismal) + ' · ' + cuando(enDias(p.fecha_bautismal)) + '</button></div></div>';
      h += '<div class="card"><div class="field"><label for="fcita">Próxima cita</label><input id="fcita" data-f="cita" value="' + esc(p.cita || '') + '" placeholder="Ej.: sáb 4:00 p. m."></div><div class="field" style="border:0"><label for="fasig">Quién enseña</label><input id="fasig" data-f="asignado" value="' + esc(p.asignado || '') + '" placeholder="Opcional"></div></div>';
      h += '<button class="btn" style="margin-top:14px;background:var(--green)" data-a="bapt">Se bautizó</button>';
      h += '<div class="row" style="margin-top:10px">' + (p.etapa === 2 ? '<button class="btn ghost sm grow" data-a="perdio">Perdió la fecha</button>' : '') + '<button class="btn ghost sm grow" data-a="dejar">Dejar de enseñar</button></div>';
    }
  }
  if (p.tipo === 'referencia') {
    h += '<div class="card"><div class="sub">' + (p.contactado_en ? 'Contactada el ' + fmtC(new Date(p.contactado_en)) : 'Aún sin contactar · agregada el ' + fmtC(new Date(p.creado_en))) + '</div></div>';
    if (!p.contactado_en) h += '<button class="btn ghost" style="margin-top:12px" data-a="contactada">Ya la contacté</button>';
    h += '<button class="btn gold" style="margin-top:10px" data-a="toamigo">Pasó a Amigos</button>';
  }
  var ev = S.eventos[p.id] || [];
  if (ev.length && (p.tipo === 'amigo' || p.tipo === 'converso')) h += '<div class="h2">Historial</div><div class="card">' + ev.map(function(e){ return '<div class="sub" style="padding:5px 0;border-bottom:1px solid var(--line)">' + esc(histTexto(e)) + '</div>'; }).join('') + '</div>';

  h += '<div class="h2">Datos</div><div class="card" style="padding:4px 14px">' +
    '<div class="field"><label for="fn">Nombre</label><input id="fn" data-f="nombre" value="' + esc(p.nombre) + '"></div>' +
    '<div class="field"><label for="ft">Teléfono</label><input id="ft" data-f="telefono" inputmode="tel" value="' + esc(p.telefono || '') + '" placeholder="Opcional"></div>' +
    '<div class="field"' + (p.tipo === 'converso' ? '' : ' style="border:0"') + '><label for="fd">Dirección</label><input id="fd" data-f="direccion" value="' + esc(p.direccion || '') + '" placeholder="Opcional"></div>' +
    (p.tipo === 'converso' ? '<div class="field"><label for="fnac">Nacimiento</label><input id="fnac" type="date" data-f="fecha_nacimiento" value="' + esc(p.fecha_nacimiento || '') + '"></div>' +
      '<div class="field"><label for="fbap">Fecha de bautismo</label><input id="fbap" type="date" data-f="fecha_bautismo" value="' + esc(p.fecha_bautismo || '') + '"></div>' +
      '<div class="field" style="border:0"><label for="forg">Organización</label><select id="forg" data-f="organizacion" style="border:0;background:none;font:inherit;color:var(--ink);text-align:right;max-width:210px"><option value="">Elegir</option>' + ORGS.map(function(o){ return '<option' + (o === p.organizacion ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></div>' : '') +
    '</div><p class="sub" style="text-align:center;margin-top:10px">Toca un dato para editarlo. Se guarda solo.</p></div>';
  return h;
}

/* ---------- Amigos ---------- */
function amigosHtml(){
  var act = amigosDe('activo'), pau = amigosDe('dejo_de_ensenar');
  var labs = [0,'Enseñándose','Con fecha','Se dejó de enseñar'];
  var nums = [0, act.filter(function(p){ return (p.etapa || 1) === 1; }).length, act.filter(function(p){ return p.etapa === 2; }).length, pau.length];
  var st = [1,2,3].map(function(i){ return '<button data-a="stage" data-v="' + i + '" class="' + (S.stage === i ? 'on' : '') + '"><b>' + nums[i] + '</b>' + labs[i] + '</button>'; }).join('');
  var fut = act.filter(function(p){ return p.etapa === 2 && p.fecha_bautismal && enDias(p.fecha_bautismal) >= 0; }).sort(function(a,b){ return a.fecha_bautismal < b.fecha_bautismal ? -1 : 1; });
  var near = fut.filter(function(p){ return enDias(p.fecha_bautismal) <= 30; }).length;
  var pri = iso(new Date(hoyD().getFullYear(), hoyD().getMonth(), 1));
  var dejMes = pau.filter(function(p){ return p.baja_en && p.baja_en >= pri; }).length, tot = act.length + dejMes;
  var h = '<div class="stages">' + st + '</div>';
  h += '<div class="card row" style="margin-top:10px"><span class="mini" style="color:var(--gold2)">' + ic('cal') + '</span><div class="grow"><b style="font-weight:500">' + near + ' bautismo' + (near === 1 ? '' : 's') + ' en los próximos 30 días</b><div class="sub">' + (fut.length ? 'El próximo: ' + fmtF(fut[0].fecha_bautismal) + ' · ' + cuando(enDias(fut[0].fecha_bautismal)) : 'Aún no hay fechas puestas') + '</div></div></div>';
  h += '<div class="card row" style="margin-top:10px"><span class="mini" style="color:var(--bad)">' + ic('x') + '</span><div class="grow"><b style="font-weight:500">' + dejMes + ' de ' + tot + ' (' + (tot ? Math.round(dejMes / tot * 100) : 0) + '%) se dejó de enseñar este mes</b><div class="sub">Toca "Se dejó de enseñar" para ver quiénes y retomarlos.</div></div></div>';
  var list = S.stage === 3 ? pau : act.filter(function(p){ return (p.etapa || 1) === S.stage; });
  if (S.stage === 2) list = list.slice().sort(function(a,b){ return (a.fecha_bautismal || '') < (b.fecha_bautismal || '') ? -1 : 1; });
  h += list.map(function(p){
    var sub = S.stage === 3 ? (p.motivo_baja || '') + (p.baja_en ? ' · desde ' + fmtC(pd(p.baja_en)) : '') : (p.etapa === 2 && p.fecha_bautismal ? 'Bautismo ' + fmtF(p.fecha_bautismal) + ' · ' + cuando(enDias(p.fecha_bautismal)) : (p.cita || 'Sin cita'));
    var btn;
    if (S.stage === 3) btn = '<button class="btn gold sm grow" data-a="retomar" data-id="' + p.id + '">Retomar: volver a Enseñándose</button>';
    else if ((p.etapa || 1) === 1) btn = '<button class="btn ghost sm grow" data-a="fecha" data-id="' + p.id + '">Poner fecha bautismal</button>';
    else btn = '<button class="btn sm grow" style="background:var(--green)" data-a="bapt" data-id="' + p.id + '">Se bautizó</button>';
    return '<div class="card"><button class="row" data-a="open" data-id="' + p.id + '" style="background:none;border:0;width:100%;text-align:left;padding:0">' + avP(p) + '<span class="grow"><b style="font-weight:500">' + esc(p.nombre) + '</b><br><span class="sub">' + esc(sub) + '</span></span></button><div class="row" style="margin-top:10px">' + btn + '</div></div>';
  }).join('') || '<p class="sub" style="text-align:center;margin-top:28px">Nadie en esta etapa todavía.</p>';
  h += '<div class="card" style="background:#FFF8E5;border-color:#F2DDA6"><div class="sub" style="color:#6B4A0A">Un amigo empieza en Enseñándose. Con fecha bautismal pasa a "Con fecha". Si no contesta o deja de venir, pasa a "Se dejó de enseñar", y si pierde la fecha vuelve a Enseñándose. Todo queda en su historial.</div></div>';
  return h;
}

/* ---------- Asistencia dominical ---------- */
function asistHtml(){
  var dom = domingo(S.domIdx), Cv = conversosAct().slice().sort(function(a,b){ return a.nombre.localeCompare(b.nombre, 'es'); });
  var done = Cv.filter(function(p){ return getAs(p.id, dom); }).length;
  var h = '<div class="card row"><button class="mini" data-a="domPrev" aria-label="Domingo anterior"' + (S.domIdx >= 10 ? ' disabled style="opacity:.3"' : '') + '>' + ic('back') + '</button><div class="grow" style="text-align:center"><b style="font-weight:500">Domingo ' + fmtC(pd(dom)) + '</b><div class="sub">' + (S.domIdx === 0 ? 'Último domingo' : 'Hace ' + S.domIdx + (S.domIdx === 1 ? ' semana' : ' semanas')) + '</div></div><button class="mini" data-a="domNext" aria-label="Domingo siguiente"' + (S.domIdx === 0 ? ' disabled style="opacity:.3"' : '') + '><span style="display:flex;transform:rotate(180deg)">' + ic('back') + '</span></button></div>';
  h += '<div class="card row" style="margin-top:8px"><div class="grow"><b style="font-weight:500">' + done + ' de ' + Cv.length + ' registrados</b><div class="bar"><i style="width:' + (Cv.length ? done / Cv.length * 100 : 0) + '%"></i></div></div></div>';
  h += '<div style="margin-top:6px">' + (Cv.map(function(p){ var v = getAs(p.id, dom);
    return '<div class="att">' + avP(p) + '<span class="grow"><span style="font-weight:500">' + esc(p.nombre) + '</span></span><div class="tog"><button data-a="att" data-id="' + p.id + '" data-v="si" class="' + (v === 'si' ? 'si' : '') + '" aria-label="Asistió">' + ic('check') + '</button><button data-a="att" data-id="' + p.id + '" data-v="no" class="' + (v === 'no' ? 'no' : '') + '" aria-label="No asistió">' + ic('x') + '</button></div></div>'; }).join('') || '<p class="sub" style="text-align:center;margin-top:24px">Aún no hay conversos. Agrega el primero con el botón +.</p>') + '</div>';
  h += '<p class="sub" style="text-align:center;margin-top:12px">Se guarda al tocar. Toca otra vez para borrar el registro.</p>';
  return h;
}

/* ---------- Presidencia (solo cifras) ---------- */
function chartBars(M){
  var w = 320, h = 120, pl = 8, pb = 16, pt = 14, n = M.length, bw = (w - 2 * pl) / n, mx = Math.max(12, Math.max.apply(null, M));
  var o = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Bautismos por mes en la estaca">';
  M.forEach(function(v, i){
    var bh = v / mx * (h - pb - pt), x = pl + i * bw + 4, y = h - pb - bh, cx = (x + (bw - 8) / 2).toFixed(1);
    o += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 8).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="#1D5A8E" opacity="' + (i === n - 1 ? '.55' : '1') + '"/>';
    o += '<text class="gt" x="' + cx + '" y="' + (y - 3).toFixed(1) + '" text-anchor="middle">' + v + '</text>';
    o += '<text class="gt" x="' + cx + '" y="' + (h - 3) + '" text-anchor="middle">' + 'EFMAMJJASOND'.charAt(i) + '</text>';
  });
  return o + '</svg>';
}
function chartCum(M, meta){
  var w = 320, h = 130, pl = 26, pr = 10, pt = 10, pb = 18, cum = [], s = 0;
  M.forEach(function(v){ s += v; cum.push(s); });
  function X(i){ return pl + i * (w - pl - pr) / 12; }
  function Y(v){ return h - pb - Math.min(v, meta) / meta * (h - pt - pb); }
  var pts = X(0).toFixed(1) + ',' + Y(0).toFixed(1) + ' ' + cum.map(function(v, i){ return X(i + 1).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
  var o = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Bautismos acumulados contra el ritmo de la meta">';
  [0, meta / 2, meta].forEach(function(v){ o += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="#E3EBF2"/><text class="gt" x="' + (pl - 4) + '" y="' + (Y(v) + 3).toFixed(1) + '" text-anchor="end">' + v + '</text>'; });
  o += '<line x1="' + X(0).toFixed(1) + '" y1="' + Y(0).toFixed(1) + '" x2="' + X(12).toFixed(1) + '" y2="' + Y(meta).toFixed(1) + '" stroke="#5B6F82" stroke-width="1.5" stroke-dasharray="4 4"/>';
  o += '<polyline points="' + pts + '" fill="none" stroke="#D9972B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  o += '<circle cx="' + X(cum.length).toFixed(1) + '" cy="' + Y(s).toFixed(1) + '" r="4" fill="#D9972B"/><text class="gt" x="' + (X(cum.length) - 6).toFixed(1) + '" y="' + (Y(s) - 8).toFixed(1) + '" text-anchor="end" style="font-weight:600">' + s + '</text>';
  for (var i = 0; i < 12; i++) o += '<text class="gt" x="' + X(i + 1).toFixed(1) + '" y="' + (h - 4) + '" text-anchor="middle">' + 'EFMAMJJASOND'.charAt(i) + '</text>';
  return o + '</svg>';
}
function mk(n){ return n === -1 ? 'menos de 3' : (n == null ? '—' : String(n)); }       // cifra con regla de privacidad
function vv(n){ return n === -1 ? 1.5 : (n || 0); }                                      // valor aproximado para sumar
function estadoBarrio(w, ritmo){
  var gap = ritmo - w.bap, why = [], k = 'ok';
  if (gap > 10) { k = 'bad'; why.push('Va ' + gap + ' bautismos bajo el ritmo'); } else if (gap > 4) { k = 'warn'; why.push('Va ' + gap + ' bautismos bajo el ritmo'); }
  if (w.asist != null) { if (w.asist < 72) { k = 'bad'; why.push('Asistencia ' + w.asist + '%'); } else if (w.asist < 80) { if (k !== 'bad') k = 'warn'; why.push('Asistencia ' + w.asist + '%'); } }
  if (w.hace == null) { if (k !== 'bad') k = 'warn'; why.push('Aún sin datos'); }
  else if (w.hace > 14) { k = 'bad'; why.push('Sin actualizar hace ' + w.hace + ' días'); } else if (w.hace > 7) { if (k !== 'bad') k = 'warn'; why.push('Sin actualizar hace ' + w.hace + ' días'); }
  if (!why.length) why.push('Todo en orden');
  return { k:k, t:{ ok:'Verde', warn:'Ámbar', bad:'Rojo' }[k], why:why };
}
function rango(i){
  var a = addD(hoyD(), i * 7), b = addD(a, 6);
  return a.getMonth() === b.getMonth() ? a.getDate() + '–' + b.getDate() + ' ' + MES[b.getMonth()] : a.getDate() + ' ' + MES[a.getMonth()] + '–' + b.getDate() + ' ' + MES[b.getMonth()];
}
function estacaHtml(){
  var R = S.resumen || [];
  var W = R.map(function(r){
    return { n:r.barrio, meta:r.meta || 30, bap:r.bautizados_anio || 0, bz:r.bautizados_90d || 0, mes:r.bautizados_por_mes || [], ens:r.ensenandose || 0, fecha:r.con_fecha || 0, ref:r.referencias || 0,
      wk:r.pronostico || [0,0,0,0], dej:r.dejaron_mes || 0, dej90:r.dejaron_90d || 0, dej6:r.dejaron_6m || [], ret:r.retomados_mes || 0, faltas:r.faltas_2_seguidas || 0, sinc:r.sin_contactar_24h || 0,
      asist:r.asistencia_4s, a4:r.asistencia_serie || [], r6:r.activos_6m, cv:r.conversos_vigentes,
      hace: r.ultima_actualizacion ? Math.max(0, Math.floor((Date.now() - new Date(r.ultima_actualizacion)) / 864e5)) : null };
  });
  if (!W.length) return '<div class="card"><div class="sub">Aún no hay datos para mostrar.</div></div>';
  var hoy = hoyD(), dia = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 864e5);
  var metaT = W.reduce(function(a, w){ return a + w.meta; }, 0), ritmoDe = function(w){ return Math.round(w.meta * dia / 365); };
  var tot = W.reduce(function(a, w){ return a + w.bap; }, 0), ritmoT = W.reduce(function(a, w){ return a + ritmoDe(w); }, 0), h = '';
  h += '<div class="card"><div class="row"><div class="grow"><div class="sub">Bautizados en la estaca este año</div><div style="font-family:var(--font-display);font-size:30px;font-weight:600;color:var(--navy)">' + tot + ' <span style="font-size:14px;color:var(--muted);font-weight:400">de ' + metaT + '</span></div></div><span class="live"><i></i>En vivo</span></div><div class="sub" style="margin-top:6px">Con el ritmo de la meta, hoy deberían ser ' + ritmoT + '. Faltan ' + Math.max(0, metaT - tot) + ' para llegar a ' + metaT + '.</div></div>';
  h += '<div class="h2">Semáforo por barrio</div><div class="card" style="padding:4px 14px">' + W.map(function(w){ var e = estadoBarrio(w, ritmoDe(w)); return '<div class="sem"><span class="chip ' + e.k + '" style="min-width:56px;justify-content:center">' + e.t + '</span><div class="grow"><b style="font-weight:500">Barrio ' + esc(w.n) + '</b><div class="sub">' + esc(e.why.join(' · ')) + '</div></div><span class="sub" style="text-align:right;flex:none">' + (w.hace == null ? 'Sin datos' : w.hace === 0 ? 'Actualizó hoy' : 'Hace ' + w.hace + ' d') + '</span></div>'; }).join('') + '</div><p class="sub" style="margin:6px 0 0">Verde: todo en orden. Ámbar: conviene acompañar. Rojo: necesita ayuda. A la derecha, la última vez que el barrio actualizó datos.</p>';
  var al = [];
  W.forEach(function(w){
    if (w.faltas) al.push({ k:w.faltas >= 3 ? 'bad' : 'warn', n:w.n, t:mk(w.faltas) + ' conversos con 2 o más faltas seguidas', s:vv(w.faltas) });
    if (w.sinc) al.push({ k:w.sinc >= 3 ? 'bad' : 'warn', n:w.n, t:mk(w.sinc) + ' referencias sin contactar en más de 24 h', s:vv(w.sinc) });
  });
  al.sort(function(a, b){ return (a.k === 'bad' ? 0 : 1) - (b.k === 'bad' ? 0 : 1) || b.s - a.s; });
  h += '<div class="h2">Dónde ayudar hoy</div><div class="card" style="padding:4px 14px">' + (al.slice(0, 6).map(function(a){ return '<div class="sem"><span class="chip ' + a.k + '" style="flex:none">' + (a.k === 'bad' ? 'Atender' : 'Revisar') + '</span><div class="grow"><b style="font-weight:500">Barrio ' + esc(a.n) + '</b><div class="sub">' + esc(a.t) + '</div></div></div>'; }).join('') || '<div class="sub" style="padding:10px 0">Sin alertas por ahora.</div>') + '</div><p class="sub" style="margin:6px 0 0">Si son menos de 3 personas, solo se dice "menos de 3" para no identificar a nadie.</p>';
  h += '<div class="h2">¿Van al día con la meta?</div><div class="card"><div class="sub" style="margin-bottom:12px">Cada barrio tiene una meta de bautismos este año. La raya azul es cuántos deberían llevar hoy si avanzaran parejo todo el año. Toca una barra para ver el detalle.</div>' + W.map(function(w){
    var rit = ritmoDe(w), gap = rit - w.bap, open = S.rit === w.n;
    return '<div style="margin-bottom:14px"><div class="row"><b style="font-weight:500" class="grow">Barrio ' + esc(w.n) + '</b><span class="sub">Lleva ' + w.bap + ' · debería llevar ' + rit + '</span></div><button class="pace" data-a="rit" data-v="' + esc(w.n) + '" aria-label="Barrio ' + esc(w.n) + ': lleva ' + w.bap + ', debería llevar ' + rit + '" title="Debería llevar ' + rit + ' hoy"><i style="width:' + Math.min(100, w.bap / w.meta * 100).toFixed(1) + '%"></i><u style="left:calc(' + (rit / w.meta * 100).toFixed(1) + '% - 2px)"></u></button>' +
      (open ? '<div style="margin-top:8px;padding:10px 12px;border-radius:12px;background:#EEF4FA"><div class="sub" style="color:var(--ink)">Hoy deberían llevar <b>' + rit + '</b> bautismos (unos ' + (w.meta / 12).toFixed(1).replace('.', ',') + ' por mes). ' + (gap > 0 ? 'Llevan ' + w.bap + ', les faltan ' + gap + ' para ir al día.' : 'Llevan ' + w.bap + ', van al día.') + '</div></div>' : '') + '</div>';
  }).join('') + '</div>';
  var wt = [0,1,2,3].map(function(i){ return W.reduce(function(a, w){ return a + (w.wk[i] || 0); }, 0); });
  h += '<div class="h2">Pronóstico de bautismos</div><div class="card"><div class="sub">Fechas bautismales que ya pusieron los barrios, próximas 4 semanas.</div><div class="fc">' + wt.map(function(n, i){ return '<div><b>' + n + '</b><span>' + rango(i) + '</span></div>'; }).join('') + '</div><table class="tl"><tr><th>Barrio</th>' + [0,1,2,3].map(function(i){ return '<th>' + rango(i) + '</th>'; }).join('') + '</tr>' + W.map(function(w){ return '<tr><td>' + esc(w.n) + '</td>' + [0,1,2,3].map(function(i){ var n = w.wk[i] || 0; return '<td>' + (n ? '<b>' + n + '</b>' : '<span class="sub">·</span>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table><div class="sub" style="margin-top:8px">Total próximas 4 semanas: <b style="color:var(--navy)">' + wt.reduce(function(a, b){ return a + b; }, 0) + '</b>. Las personas a quienes se dejó de enseñar no se cuentan.</div></div>';
  var sum = function(k){ return W.reduce(function(a, w){ return a + w[k]; }, 0); };
  var d90 = W.reduce(function(a, w){ return a + vv(w.dej90); }, 0), aprox90 = W.some(function(w){ return w.dej90 === -1; });
  var ini0 = Math.round(sum('ens') + sum('fecha') + sum('bz') + d90), cf = sum('fecha') + sum('bz'), bz = sum('bz'), pc2 = function(a, b){ return b ? Math.round(a / b * 100) : 0; };
  var ap = aprox90 ? '≈' : '';
  var fn = [['Enseñándose', ini0, '#1D5A8E', 'Etapa inicial: todos los que empezaron' + (aprox90 ? ' (aprox.)' : '')],
    ['Con fecha', cf, '#D9972B', pc2(cf, ini0) + '% de la etapa anterior · ' + pc2(cf, ini0) + '% de la inicial'],
    ['Bautizados', bz, '#4E9A7F', pc2(bz, cf) + '% de la etapa anterior · ' + pc2(bz, ini0) + '% de la inicial'],
    ['Se dejó de enseñar', Math.round(d90), '#5B6F82', 'Salen del embudo · ' + ap + pc2(d90, ini0) + '% de la inicial']];
  h += '<div class="h2">Embudo de la estaca</div><div class="card"><div class="sub">Personas enseñadas en los últimos 3 meses</div>' + fn.map(function(f){ return '<div style="margin-top:12px"><div class="fn" style="margin:0"><span style="width:118px;color:var(--ink);font-weight:500">' + f[0] + '</span><i style="width:' + Math.max(5, ini0 ? f[1] / ini0 * 52 : 5).toFixed(1) + '%;background:' + f[2] + '"></i><b style="font-weight:600;color:var(--navy)">' + ap + f[1] + '</b></div><div class="sub" style="margin-top:2px">' + f[3] + '</div></div>'; }).join('') +
    '<table class="tl"><tr><th>Barrio</th><th>Enseñándose</th><th>Con fecha</th><th>Bautizados</th><th>% final</th></tr>' + W.map(function(w){ var st = Math.round(w.ens + w.fecha + w.bz + vv(w.dej90)), ap2 = w.dej90 === -1 ? '≈' : ''; return '<tr><td>' + esc(w.n) + '</td><td><b>' + ap2 + st + '</b></td><td><b>' + (w.fecha + w.bz) + '</b></td><td><b>' + w.bz + '</b></td><td><b>' + ap2 + pc2(w.bz, st) + '%</b></td></tr>'; }).join('') + '</table><div class="sub" style="margin-top:8px">% final: de las personas que empezaron a enseñarse, cuántas se bautizaron.</div></div>';
  var dj = W.reduce(function(a, w){ return a + vv(w.dej); }, 0), apx = W.some(function(w){ return w.dej === -1; }) ? '≈' : '';
  var tg = W.reduce(function(a, w){ return a + w.ens + w.fecha; }, 0) + dj, pc = tg ? Math.round(dj / tg * 100) : 0;
  var ser = [0,1,2,3,4,5].map(function(i){ return Math.round(W.reduce(function(a, w){ return a + vv(w.dej6[i]); }, 0)); });
  var lab6 = []; for (var q = 5; q >= 0; q--) lab6.push(MES[(hoy.getMonth() - q + 12) % 12]);
  var ret = W.reduce(function(a, w){ return a + vv(w.ret); }, 0), apr = W.some(function(w){ return w.ret === -1; }) ? '≈' : '';
  var mxs = Math.max.apply(null, ser.concat([1]));
  h += '<div class="h2">A quiénes se dejó de enseñar</div><div class="card"><div class="sub">Este mes, de cada 100 personas que se enseñaban</div><div style="font-family:var(--font-display);font-size:30px;font-weight:600;color:var(--navy)">' + apx + pc + '% <span style="font-size:14px;color:var(--muted);font-weight:400">(' + apx + Math.round(dj) + ' de ' + apx + Math.round(tg) + ')</span></div><div class="sub" style="margin-top:2px">Retomados este mes (bajas de meses anteriores): <b style="color:var(--navy)">' + apr + Math.round(ret) + '</b></div>' +
    '<div class="sub" style="margin-top:12px">Personas por mes</div><div class="fc" style="grid-template-columns:repeat(6,1fr);align-items:end">' + ser.map(function(v, i){ return '<div style="background:none;padding:0"><span style="display:block;font-size:10.5px;color:var(--navy);font-weight:500">' + v + '</span><i style="display:block;margin:2px auto;width:60%;height:' + Math.max(2, Math.round(v / mxs * 56)) + 'px;border-radius:5px 5px 0 0;background:' + (i === 5 ? '#D9972B' : '#1D5A8E') + '"></i><span>' + lab6[i] + '</span></div>'; }).join('') + '</div>' +
    '<table class="tl"><tr><th>Barrio</th><th>Dejaron este mes</th></tr>' + W.map(function(w){ return '<tr><td>' + esc(w.n) + '</td><td><b>' + mk(w.dej) + '</b></td></tr>'; }).join('') + '</table></div>';
  var Mm = []; for (var m = 0; m <= hoy.getMonth(); m++) Mm.push(W.reduce(function(a, w){ return a + (w.mes[m] || 0); }, 0));
  h += '<div class="h2">Tendencia</div><div class="card"><b style="font-weight:500">Bautismos por mes</b><div class="sub">Mes en curso con color más claro.</div>' + chartBars(Mm) + '<div style="height:14px"></div><b style="font-weight:500">Acumulado contra el ritmo</b><div class="sub">Línea dorada: lo que llevan. Punteada: ritmo para llegar a ' + metaT + '.</div>' + chartCum(Mm, metaT) + '</div>';
  h += '<div class="h2">Retención</div><div class="card"><div class="sub">Asistencia de conversos en su primer año (las últimas 4 semanas) y cuántos siguen activos. Al cumplir 12 meses dejan de contarse aquí.</div><table class="tl"><tr><th>Barrio</th><th>4 semanas</th><th>Activos 6 m</th><th>Conversos hoy</th></tr>' + W.map(function(w){ return '<tr><td>' + esc(w.n) + '</td><td><div class="mb">' + [0,1,2,3].map(function(i){ var v = w.a4[i]; return '<i style="height:' + (v == null ? 2 : Math.round(v / 100 * 26)) + 'px"></i>'; }).join('') + '</div><span class="sub">' + (w.asist == null ? '—' : w.asist + '%') + '</span></td><td><b>' + (w.r6 == null ? '—' : w.r6 + '%') + '</b></td><td><b>' + (w.cv == null ? '—' : mk(w.cv)) + '</b></td></tr>'; }).join('') + '</table></div>';
  h += '<div class="card" style="background:#FFF8E5;border-color:#F2DDA6"><div class="sub" style="color:#6B4A0A">Presidencia ve solo cifras. Los nombres, teléfonos y direcciones quedan en cada barrio. Se actualiza cada vez que un barrio guarda un cambio.</div></div>';
  return h;
}

/* ---------- Hojas (ventanas desde abajo) ---------- */
function fotoBloque(id){
  return '<div style="margin-top:12px"><div class="sub" style="color:var(--ink);font-weight:500">Foto (opcional)</div><label class="row" style="margin-top:6px;gap:12px;cursor:pointer"><span id="fprev" class="av" style="background:var(--stage);color:var(--muted);width:56px;height:56px">' + ic('plus') + '</span><span class="btn ghost sm" style="pointer-events:none">Tomar o elegir foto</span><input type="file" id="' + id + '" accept="image/*" style="position:absolute;opacity:0;width:1px;height:1px" aria-label="Tomar o elegir foto"></label><div class="sub" style="margin-top:4px">Se reduce en el celular y solo la ve tu barrio. En menores de edad, solo con permiso de sus padres.</div></div>';
}
function openSheet(kind){
  S.sheet = kind;
  var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheetbg';
  var p = byId(S.sel), html = '';
  if (kind === 'add') {
    html = '<h2>Agregar persona</h2><div class="sub">Solo lo básico. El resto se completa después.</div>' +
      '<div class="seg" id="addtype"><button class="on" data-a="ty" data-v="referencia">Referencia</button><button data-a="ty" data-v="amigo">Amigo</button><button data-a="ty" data-v="converso">Converso</button><button data-a="ty" data-v="regresando">Regresando</button></div>' +
      '<input class="input" id="an" placeholder="Nombre" aria-label="Nombre" autocomplete="off"><input class="input" id="at" inputmode="tel" placeholder="Teléfono" aria-label="Teléfono"><input class="input" id="ap" placeholder="Dirección de casa (opcional)" aria-label="Dirección de casa">' +
      '<div id="orgblock" style="display:none"><label class="sub" for="abp" style="display:block;margin-top:12px;color:var(--ink);font-weight:500">Fecha de bautismo</label><input class="input" id="abp" type="date" max="' + sumaDias(0) + '" style="margin-top:2px">' +
      '<div class="sub" style="margin-top:14px;color:var(--ink);font-weight:500">Organización (opcional)</div><label class="sub" for="ab" style="display:block;margin-top:6px">Fecha de nacimiento</label><input class="input" id="ab" type="date" style="margin-top:2px"><div class="seg" id="sexo" style="margin-top:8px"><button data-a="sx" data-v="H">Hombre</button><button data-a="sx" data-v="M">Mujer</button></div><label class="sub" for="ao" style="display:block;margin-top:10px">Organización</label><select class="input" id="ao" style="margin-top:2px;appearance:auto"><option value="">Elegir después</option>' + ORGS.map(function(o){ return '<option>' + o + '</option>'; }).join('') + '</select><div class="sub" id="sug" style="margin-top:6px"></div>' + fotoBloque('fo') + '</div>' +
      '<div class="sub" id="adderr" style="color:var(--bad);margin-top:8px"></div><button class="btn gold" style="margin-top:10px" data-a="saveadd">Guardar</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cancelar</button>';
  } else if (kind === 'bapt') {
    html = '<h2>¿Se bautizó ' + esc(p ? p.nombre : '') + '?</h2><div class="sub">Pasa a Conversos con la lista de seguimiento en blanco y sale de Amigos. No se crea un registro nuevo, así que no se duplica.</div>' +
      '<label class="sub" for="fbd" style="display:block;margin-top:12px;color:var(--ink);font-weight:500">Fecha de bautismo</label><input class="input" id="fbd" type="date" value="' + sumaDias(0) + '" max="' + sumaDias(0) + '" style="margin-top:2px">' +
      fotoBloque('fo2') + '<button class="btn" style="margin-top:14px;background:var(--green)" data-a="confbapt">Confirmar bautismo</button><button class="btn ghost" style="margin-top:8px" data-a="close">Todavía no</button>';
  } else if (kind === 'fecha') {
    html = '<h2>Fecha bautismal</h2><div class="sub">' + (p ? esc(p.nombre) + '. ' : '') + 'La estaca usa esta fecha para el pronóstico, sin ver el nombre.</div>' +
      [7,14,21].map(function(n){ return '<button class="btn ghost" style="margin-top:8px;text-align:left" data-a="dias" data-v="' + n + '">En ' + (n / 7) + (n === 7 ? ' semana' : ' semanas') + ' · ' + fmtF(sumaDias(n)) + '</button>'; }).join('') +
      '<div class="sub" style="margin-top:12px">O elige otra fecha</div><input class="input" id="fi" type="date" min="' + sumaDias(0) + '" value="' + esc((p && p.fecha_bautismal) || '') + '" aria-label="Fecha bautismal"><button class="btn gold" style="margin-top:12px" data-a="savefecha">Guardar fecha</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cancelar</button>';
  } else if (kind === 'dejar') {
    html = '<h2>¿Por qué se dejó de enseñar?</h2><div class="sub">No se borra nada. Sale del pronóstico y puedes retomarlo cuando quieras.</div>' +
      MOTIVOS.map(function(m){ return '<button class="btn ghost" style="margin-top:8px;text-align:left" data-a="mot" data-v="' + m + '">' + m + '</button>'; }).join('') + '<button class="btn ghost" style="margin-top:12px" data-a="close">Cancelar</button>';
  } else if (kind === 'avisar') {
    var ap = (p && S.apoyos[p.id]) || [];
    html = '<h2>Avisar a su apoyo</h2><div class="sub">Se abre WhatsApp con un mensaje breve, listo para enviar.</div>' +
      (ap.map(function(a){ return '<button class="btn ghost" style="margin-top:8px;text-align:left" data-a="avisarA" data-id="' + a.id + '">' + esc(a.nombre) + (a.telefono ? '' : ' (sin teléfono)') + '</button>'; }).join('') || '<div class="sub" style="margin-top:10px">Aún no tiene personas de apoyo. Agrégalas en su ficha.</div>') + '<button class="btn ghost" style="margin-top:12px" data-a="close">Cerrar</button>';
  } else if (kind === 'apoyo') {
    html = '<h2>Persona de apoyo</h2><div class="sub">Quien lo acompaña y puede visitarlo.</div><input class="input" id="apn" placeholder="Nombre" aria-label="Nombre"><input class="input" id="apt" inputmode="tel" placeholder="Teléfono (para avisarle por WhatsApp)" aria-label="Teléfono"><button class="btn gold" style="margin-top:14px" data-a="saveapoyo">Guardar</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cancelar</button>';
  } else if (kind === 'more') {
    html = '<h2>Más opciones</h2>' + (p && p.estado === 'mudado' ? '<button class="btn ghost" style="margin-top:12px" data-a="activar">Volver a marcar como activo</button>' : '<button class="btn ghost" style="margin-top:12px" data-a="mudado">Marcar como mudado</button>') + '<button class="btn danger" style="margin-top:8px" data-a="del">Eliminar registro (duplicado o error)</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cerrar</button>';
  } else if (kind === 'del') {
    html = '<h2>¿Eliminar a ' + esc(p ? p.nombre : '') + '?</h2><div class="sub">Se oculta su registro. Úsalo solo para duplicados o errores. Tendrás unos segundos para deshacerlo.</div><button class="btn danger" style="margin-top:14px" data-a="confdel">Sí, eliminar</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cancelar</button>';
  } else if (kind === 'menu') {
    html = '<h2>Cuenta</h2><div class="sub">' + (S.role === 'estaca' ? 'Presidencia de Estaca · solo cifras' : esc(S.barrioNombre) + ' · Líder misional') + '</div>' +
      (S.role === 'estaca' ? '<button class="btn ghost" style="margin-top:12px" data-a="refrescar">Actualizar ahora</button>' : '<button class="btn ghost" style="margin-top:12px" data-a="backup">Descargar respaldo</button>') +
      '<button class="btn ghost" style="margin-top:8px" data-a="cambiarpin">Cambiar PIN</button><button class="btn ghost" style="margin-top:8px" data-a="logout">Cerrar sesión</button><button class="btn ghost" style="margin-top:8px" data-a="close">Cerrar</button>';
  }
  bg.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
  var old = $('sheetbg'); if (old) old.remove();
  ROOT.appendChild(bg);
  var inp = bg.querySelector('input'); if (inp && (kind === 'add' || kind === 'apoyo')) setTimeout(function(){ inp.focus(); }, 60);
}
function closeSheet(){ S.sheet = null; var o = $('sheetbg'); if (o) o.remove(); }
function sugerirOrg(){
  var ab = $('ab'); if (!ab) return;
  var on = document.querySelector('#sexo .on'), r = orgSugerida(ab.value, on ? on.dataset.v : null), sg = $('sug');
  if (!r) { sg.textContent = ''; return; }
  if (r.falta) { sg.textContent = 'Elige Hombre o Mujer para sugerir su organización.'; return; }
  $('ao').value = r.o; sg.textContent = 'Sugerida por su edad (' + r.edad + ' años): ' + r.o + '. Puedes cambiarla.';
}
/* =====================  ACCIONES  ===================== */
async function run(fn){
  if (S.busy) return;
  S.busy = true;
  try { await fn(); } catch(e){ falloGuardar(e); } finally { S.busy = false; }
}
function repaintAuth(){ ROOT.innerHTML = authHtml(); paintToast(); }
function abrirWA(tel, texto){
  if (!String(tel || '').replace(/\D/g,'')) { toast('Esta persona no tiene teléfono guardado.'); return; }
  window.open(waUrl(tel, texto), '_blank', 'noopener');
}
function mantenerScroll(fn){ var sc = $('scr'), y = sc ? sc.scrollTop : 0; fn(); if ($('scr')) $('scr').scrollTop = y; }
async function restaurar(id){
  var r = await sb.from('personas').update({ eliminado_en:null }).eq('id', id).select().single();
  if (r.error) throw r.error;
  S.people.unshift(r.data); render(); toast('Registro recuperado');
}
function descargar(nombre, texto, tipo){
  var b = new Blob([texto], { type:tipo }), u = URL.createObjectURL(b), a = document.createElement('a');
  a.href = u; a.download = nombre; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1000);
}
function respaldoCSV(){
  var doms = []; for (var i = 7; i >= 0; i--) doms.push(domingo(i));
  var cab = ['Tipo','Nombre','Teléfono','Dirección','Nacimiento','Organización','Estado','Etapa','Fecha bautismal','Fecha de bautismo','Motivo','Pasos completados'].concat(doms.map(function(d){ return 'Asist ' + d; }));
  var filas = S.people.map(function(p){
    var pasos = Object.keys(p.pasos || {}).filter(function(k){ return p.pasos[k]; }).join(' / ');
    return [KIND[p.tipo], p.nombre, p.telefono, p.direccion, p.fecha_nacimiento, p.organizacion, p.estado, p.etapa, p.fecha_bautismal, p.fecha_bautismo, p.motivo_baja, pasos].concat(doms.map(function(d){ return getAs(p.id, d) || ''; }));
  });
  function cel(x){ x = x == null ? '' : String(x); return '"' + x.replace(/"/g, '""') + '"'; }
  return '﻿' + [cab].concat(filas).map(function(f){ return f.map(cel).join(','); }).join('\r\n');
}
async function guardarCampo(el){
  var p = byId(S.sel); if (!p) return;
  var f = el.dataset.f, v = (el.value || '').trim();
  if (f === 'nombre' && !v) { el.value = p.nombre; toast('El nombre no puede quedar vacío.'); return; }
  var nuevo = v === '' ? null : v;
  if ((p[f] || null) === nuevo) return;
  var patch = {}; patch[f] = nuevo;
  await run(async function(){
    await upd(p.id, patch);
    mantenerScroll(render); toast('Guardado');
  });
}
async function manejarPin(){
  if (S.screen === 'lock') {
    var raw = LS.get(pinKey()), d = null; try { d = JSON.parse(raw); } catch(e){}
    if (!d) { S.screen = 'newpin'; S.pinFase = 'a'; S.pin = ''; repaintAuth(); return; }
    var h = await sha(S.pin, d.salt);
    if (h === d.hash) { d.fails = 0; LS.set(pinKey(), JSON.stringify(d)); S.pin = ''; S.pinErr = ''; await entrar(); return; }
    d.fails = (d.fails || 0) + 1; LS.set(pinKey(), JSON.stringify(d)); S.pin = '';
    if (d.fails >= 5) { await salir(); S.err = 'Demasiados intentos. Entra con tu clave larga.'; render(); return; }
    S.pinErr = 'PIN incorrecto. Te quedan ' + (5 - d.fails) + ' intentos.'; repaintAuth(); return;
  }
  if (S.screen === 'newpin') {
    if (S.pinFase === 'a') { S.pinA = S.pin; S.pin = ''; S.pinFase = 'b'; repaintAuth(); return; }
    if (S.pin !== S.pinA) { S.pin = ''; S.pinA = ''; S.pinFase = 'a'; S.pinErr = 'No coinciden. Empieza de nuevo.'; repaintAuth(); return; }
    var salt = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(function(x){ return x.toString(16).padStart(2,'0'); }).join('');
    LS.set(pinKey(), JSON.stringify({ salt:salt, hash:await sha(S.pin, salt), fails:0 }));
    S.pin = ''; S.pinA = ''; S.pinErr = '';
    if (S.role) { S.screen = S.role === 'estaca' ? 'estaca' : 'hoy'; render(); toast('PIN cambiado.'); }
    else await entrar();
  }
}
async function hacerLogin(){
  var id = $('usr').value, pw = $('pw').value, cfg = C.BARRIOS.filter(function(b){ return b.id === id; })[0];
  S.loginBarrio = id;
  if (!pw) { S.err = 'Escribe tu clave.'; render(); $('usr').value = id; return; }
  var btn = document.querySelector('#loginform button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'Entrando…'; }
  var r = await sb.auth.signInWithPassword({ email:cfg.email, password:pw });
  if (r.error || !r.data || !r.data.user) { S.err = 'Usuario o clave incorrectos.'; render(); return; }
  S.err = ''; S.uid = r.data.user.id; S.email = cfg.email; tocarActividad();
  if (LS.get(pinKey())) { await entrar(); } else { S.screen = 'newpin'; S.pinFase = 'a'; S.pin = ''; render(); }
}

document.addEventListener('click', function(e){
  if (e.target.id === 'sheetbg') { closeSheet(); return; }
  var t = e.target.closest('[data-a]'); if (!t) return;
  tocarActividad();
  var a = t.dataset.a, v = t.dataset.v, id = t.dataset.id, p = byId(id || S.sel);
  switch (a) {
    case 'k':
      if (v === 'del') S.pin = S.pin.slice(0, -1); else if (S.pin.length < 6) S.pin += v;
      S.pinErr = '';
      if (S.pin.length === 6) manejarPin(); else repaintAuth();
      break;
    case 'usarclave': salir(); break;
    case 'cancelpin': S.pin = ''; S.pinErr = ''; S.screen = S.role === 'estaca' ? 'estaca' : 'hoy'; render(); break;
    case 'reintentar': entrar(); break;
    case 'logout': closeSheet(); salir(); break;
    case 'tab': closeSheet(); S.tab = v; S.screen = v; render(); break;
    case 'open': S.from = S.screen === 'ficha' ? S.from : S.screen; S.sel = id; S.screen = 'ficha'; render(); break;
    case 'back': S.screen = S.from || 'personas'; S.tab = S.screen; render(); break;
    case 'filtro': S.filter = v; render(); break;
    case 'stage': S.stage = +v; render(); break;
    case 'wa': e.stopPropagation(); if (p) abrirWA(p.telefono); break;
    case 'call': var d = String((p && p.telefono) || '').replace(/\D/g, ''); if (d) location.href = 'tel:' + d; else toast('Esta persona no tiene teléfono guardado.'); break;
    case 'map': if (p && p.direccion) window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.direccion + ', Lima, Perú'), '_blank', 'noopener'); else toast('Agrega su dirección en Datos para abrir el mapa.'); break;
    case 'avisar': openSheet('avisar'); break;
    case 'avisarA':
      var ap = ((S.apoyos[S.sel] || []).filter(function(x){ return x.id === id; }))[0], cv = byId(S.sel);
      if (!ap || !cv) break;
      closeSheet();
      abrirWA(ap.telefono, 'Hola ' + ap.nombre.split(' ')[0] + ', ' + cv.nombre + ' faltó el domingo. ¿Puedes contactarlo(a) esta semana? Gracias.');
      break;
    case 'paso':
      run(async function(){
        var pasos = Object.assign({}, p.pasos || {}); pasos[v] = !pasos[v];
        await upd(p.id, { pasos:pasos }); mantenerScroll(render);
      });
      break;
    case 'sem': cicloAs(S.sel, v); mantenerScroll(render); break;
    case 'att':
      var dom = domingo(S.domIdx), cur = getAs(id, dom), nx = cur === v ? null : v;
      S.asist[id] = S.asist[id] || {}; if (nx) S.asist[id][dom] = nx; else delete S.asist[id][dom];
      guardarAs(id, dom, nx); mantenerScroll(render); break;
    case 'domPrev': if (S.domIdx < 10) { S.domIdx++; render(); } break;
    case 'domNext': if (S.domIdx > 0) { S.domIdx--; render(); } break;
    case 'etapa':
      if (+v === 2 && !p.fecha_bautismal) { openSheet('fecha'); break; }
      if (+v === 1 && (p.etapa || 1) !== 1) run(async function(){ await upd(p.id, { etapa:1, fecha_bautismal:null }); mantenerScroll(render); toast('Etapa actualizada'); });
      break;
    case 'fecha': S.sel = id || S.sel; openSheet('fecha'); break;
    case 'editfecha': openSheet('fecha'); break;
    case 'dias': case 'savefecha':
      var f = a === 'dias' ? sumaDias(+v) : ($('fi') ? $('fi').value : '');
      if (!f) { if ($('fi')) $('fi').style.borderColor = 'var(--bad)'; break; }
      run(async function(){ await upd(S.sel, { etapa:2, fecha_bautismal:f }); closeSheet(); render(); toast('Fecha guardada. La estaca la ve en el pronóstico, sin nombre.'); });
      break;
    case 'perdio': run(async function(){ await upd(p.id, { etapa:1, fecha_bautismal:null }); mantenerScroll(render); toast('Volvió a Enseñándose. Se quitó del pronóstico.'); }); break;
    case 'dejar': openSheet('dejar'); break;
    case 'mot': run(async function(){ await upd(S.sel, { estado:'dejo_de_ensenar', motivo_baja:v, baja_en:iso(hoyD()) }); closeSheet(); render(); toast('Pasó a "Se dejó de enseñar". Se puede retomar.'); }); break;
    case 'retomar': run(async function(){ var pid = id || S.sel; await upd(pid, { estado:'activo', etapa:1, fecha_bautismal:null, motivo_baja:null, baja_en:null }); mantenerScroll(render); toast('Volvió a Enseñándose'); }); break;
    case 'bapt': S.sel = id || S.sel; S.tmpFoto = null; openSheet('bapt'); break;
    case 'confbapt':
      run(async function(){
        var q = byId(S.sel);
        if (!q || q.tipo !== 'amigo') { closeSheet(); toast('Esta persona ya fue marcada como bautizada. No se creó un registro duplicado.'); return; }
        var fb = $('fbd') && $('fbd').value ? $('fbd').value : iso(hoyD());
        await upd(q.id, { tipo:'converso', fecha_bautismo:fb, etapa:null, fecha_bautismal:null, estado:'activo', motivo_baja:null, baja_en:null });
        if (S.tmpFoto) { try { await subirFoto(q, S.tmpFoto); } catch(er){ console.error(er); toast('Se registró el bautismo, pero la foto no se pudo subir.'); } }
        S.tmpFoto = null; closeSheet(); S.screen = 'ficha'; render(); toast('Felicidades. Pasó a Conversos, una sola vez.');
      });
      break;
    case 'toamigo': run(async function(){ await upd(p.id, { tipo:'amigo', etapa:1, estado:'activo', contactado_en:p.contactado_en || new Date().toISOString() }); S.stage = 1; S.tab = 'amigos'; S.screen = 'amigos'; render(); toast(p.nombre.split(' ')[0] + ' pasó a Amigos'); }); break;
    case 'contactada': run(async function(){ await upd(p.id, { contactado_en:new Date().toISOString() }); mantenerScroll(render); toast('Marcada como contactada'); }); break;
    case 'add': S.tmpFoto = null; S.addType = 'referencia'; openSheet('add'); break;
    case 'ty':
      S.addType = v; document.querySelectorAll('#addtype button').forEach(function(b){ b.classList.toggle('on', b === t); });
      $('orgblock').style.display = v === 'converso' ? 'block' : 'none'; break;
    case 'sx': document.querySelectorAll('#sexo button').forEach(function(b){ b.classList.toggle('on', b === t); }); sugerirOrg(); break;
    case 'saveadd':
      run(async function(){
        var nm = $('an').value.trim(), tipo = S.addType || 'referencia', er = $('adderr');
        if (!nm) { er.textContent = 'Escribe un nombre.'; $('an').focus(); return; }
        if (tipo === 'converso' && !$('abp').value) { er.textContent = 'Pon la fecha de bautismo del converso.'; $('abp').focus(); return; }
        var row = { barrio_id:S.barrio, tipo:tipo, nombre:nm, telefono:$('at').value.trim() || null, direccion:$('ap').value.trim() || null };
        if (tipo === 'amigo') row.etapa = 1;
        if (tipo === 'converso') { row.fecha_bautismo = $('abp').value; row.fecha_nacimiento = $('ab').value || null; row.organizacion = $('ao').value || null; row.pasos = {}; }
        var r = await sb.from('personas').insert(row).select().single();
        if (r.error) throw r.error;
        S.people.unshift(r.data);
        if (tipo === 'converso' && S.tmpFoto) { try { await subirFoto(r.data, S.tmpFoto); } catch(e2){ console.error(e2); } }
        S.tmpFoto = null; closeSheet(); S.filter = 'todos'; S.q = ''; S.screen = 'personas'; S.tab = 'personas'; render(); toast(nm.split(' ')[0] + ' agregado a ' + KIND[tipo] + 's');
      });
      break;
    case 'addapoyo': openSheet('apoyo'); break;
    case 'saveapoyo':
      run(async function(){
        var n = $('apn').value.trim(); if (!n) { $('apn').style.borderColor = 'var(--bad)'; return; }
        var r = await sb.from('apoyos').insert({ persona_id:S.sel, nombre:n, telefono:$('apt').value.trim() || null }).select().single();
        if (r.error) throw r.error;
        (S.apoyos[S.sel] = S.apoyos[S.sel] || []).push(r.data); closeSheet(); mantenerScroll(render); toast('Persona de apoyo agregada');
      });
      break;
    case 'delapoyo':
      run(async function(){
        var r = await sb.from('apoyos').delete().eq('id', id); if (r.error) throw r.error;
        S.apoyos[S.sel] = (S.apoyos[S.sel] || []).filter(function(x){ return x.id !== id; }); mantenerScroll(render);
      });
      break;
    case 'more': openSheet('more'); break;
    case 'mudado': case 'activar': run(async function(){ await upd(S.sel, { estado:a === 'mudado' ? 'mudado' : 'activo' }); closeSheet(); render(); toast(a === 'mudado' ? 'Marcado como mudado' : 'Marcado como activo'); }); break;
    case 'del': openSheet('del'); break;
    case 'confdel':
      run(async function(){
        var pid = S.sel, r = await sb.from('personas').update({ eliminado_en:new Date().toISOString() }).eq('id', pid);
        if (r.error) throw r.error;
        S.people = S.people.filter(function(x){ return x.id !== pid; });
        closeSheet(); S.screen = S.from || 'personas'; S.tab = S.screen; render();
        toast('Registro eliminado', function(){ run(function(){ return restaurar(pid); }); });
      });
      break;
    case 'undo': var fn = S.toast && S.toast.undo; S.toast = null; paintToast(); if (fn) fn(); break;
    case 'rit': S.rit = S.rit === v ? null : v; mantenerScroll(render); break;
    case 'menu': openSheet('menu'); break;
    case 'refrescar': closeSheet(); run(async function(){ await cargarResumen(); render(); toast('Datos actualizados'); }); break;
    case 'backup':
      closeSheet();
      descargar('respaldo-' + S.barrio + '-' + iso(hoyD()) + '.csv', respaldoCSV(), 'text/csv;charset=utf-8');
      toast('Respaldo descargado. Guárdalo en un lugar seguro y no lo compartas.');
      break;
    case 'cambiarpin': closeSheet(); S.pin = ''; S.pinA = ''; S.pinErr = ''; S.pinFase = 'a'; S.screen = 'newpin'; render(); break;
    case 'close': closeSheet(); break;
  }
});

document.addEventListener('submit', function(e){
  if (e.target.id === 'loginform') { e.preventDefault(); run(hacerLogin); }
});
document.addEventListener('input', function(e){
  if (e.target.id === 'q') { S.q = e.target.value; var l = $('plist'); if (l) l.innerHTML = personasListHtml(); }
  if (e.target.id === 'ab') sugerirOrg();
});
document.addEventListener('change', function(e){
  var el = e.target, id = el.id;
  if (id === 'usr') S.loginBarrio = el.value;
  if ((id === 'fo' || id === 'fo2') && el.files[0]) {
    leerFoto(el.files[0], function(u){ S.tmpFoto = u; var pv = $('fprev'); if (pv) { pv.style.background = 'url(' + u + ') center/cover'; pv.innerHTML = ''; } });
  } else if (id === 'ffo' && el.files[0]) {
    leerFoto(el.files[0], function(u){ run(async function(){ await subirFoto(byId(S.sel), u); mantenerScroll(render); toast('Foto guardada'); }); });
  } else if (el.dataset && el.dataset.f) {
    guardarCampo(el);
  }
});
document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeSheet(); });

/* ---------- Actualización automática ---------- */
async function refrescarSilencioso(){
  if (S.busy || S.sheet || !S.uid) return;
  try {
    if (S.role === 'estaca' && S.screen === 'estaca') { await cargarResumen(); render(); }
    else if (S.role === 'barrio' && ['hoy','personas','amigos','asistencia'].indexOf(S.screen) > -1) { await recargar(); render(); }
  } catch(e){ console.error(e); }
}
document.addEventListener('visibilitychange', function(){
  if (document.visibilityState !== 'visible' || !S.uid) return;
  var last = +LS.get('om-last') || 0;
  if (last && Date.now() - last > C.DIAS_INACTIVIDAD * 864e5) { salir(); return; }
  if (Date.now() - S.lastLoad > 60000) refrescarSilencioso();
});
setInterval(function(){ if (document.visibilityState === 'visible' && S.role === 'estaca' && S.screen === 'estaca') refrescarSilencioso(); }, 60000);
window.addEventListener('offline', function(){ toast('Sin conexión. Los cambios no se guardarán hasta que vuelva internet.'); });

/* ---------- Inicio ---------- */
async function boot(){
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function(){});
  var r = await sb.auth.getSession(), ses = r.data && r.data.session;
  if (!ses) { S.screen = 'login'; render(); return; }
  var last = +LS.get('om-last') || 0;
  if (last && Date.now() - last > C.DIAS_INACTIVIDAD * 864e5) { await salir(); S.err = 'Pasaron varios días sin usar la app. Entra con tu clave larga.'; render(); return; }
  S.uid = ses.user.id; S.email = ses.user.email;
  S.screen = LS.get(pinKey()) ? 'lock' : 'newpin'; S.pinFase = 'a'; render();
}
boot();
})();
