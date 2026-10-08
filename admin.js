const cfg=window.LDA_CONFIG||{};
const supabaseClient=window.supabase?.createClient?.(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);
const OWNER_EMAIL='admin.lueurdelatre@gmail.com';
const $=id=>document.getElementById(id);
const state={menu:[],hours:[],closures:[],photos:[],bookings:[],settings:null};

function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function fmtPrice(v){return Number(v||0).toLocaleString('fr-BE',{style:'currency',currency:'EUR'});}
function setStatus(msg,ok=true){const el=$('connectionState');if(el){el.textContent=msg;el.style.color=ok?'#d7ad68':'#e98b7a';}}
function assertClient(){if(!supabaseClient) throw new Error('Supabase n’est pas configuré.');}

const loginView=$('loginView'),appView=$('appView');
async function requireSession(){
  if(!supabaseClient){return false;}
  const {data}=await supabaseClient.auth.getSession();
  const session=data?.session;
  if(!session){loginView.hidden=false;appView.hidden=true;return false;}
  const email=session.user.email||'';
  if(email.toLowerCase()!==OWNER_EMAIL.toLowerCase()){
    await supabaseClient.auth.signOut();
    alert('Ce compte n’a pas accès à l’espace propriétaire.');
    return false;
  }
  showApp(email); return true;
}
function showApp(email){loginView.hidden=true;appView.hidden=false;$('ownerEmail').textContent=email||OWNER_EMAIL;renderAll();loadAll().catch(err=>{console.error(err);setStatus('Erreur de chargement',false);alert(err.message);});}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    assertClient();
    const email=$('loginEmail').value.trim();
    const password=$('loginPassword').value;
    if(email.toLowerCase()!==OWNER_EMAIL.toLowerCase()){throw new Error('Utilisez l’adresse propriétaire configurée dans Supabase.');}
    const {error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error) throw error;
    await requireSession();
  }catch(err){alert(err.message||'Connexion impossible.');}
});
$('logout').addEventListener('click',async()=>{await supabaseClient?.auth.signOut();location.reload();});
supabaseClient?.auth.onAuthStateChange(()=>{setTimeout(()=>requireSession(),0);});

const titles={overview:'Vue d’ensemble',menu:'Menu & prix',hours:'Horaires d’ouverture',photos:'Photos',bookings:'Réservations clients',contact:'Coordonnées & contact',settings:'Paramètres propriétaire'};
function go(page){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$('page-'+page).classList.add('active');document.querySelectorAll('.sidebar nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$('pageTitle').textContent=titles[page];}
document.querySelectorAll('.sidebar nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.querySelectorAll('[data-page-jump]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.pageJump)));

async function loadAll(){
  assertClient(); setStatus('Synchroniseren…',true);
  const [menu,hours,closures,gallery,reservations,settings]=await Promise.all([
    supabaseClient.from('menu_items').select('*').order('sort_order'),
    supabaseClient.from('opening_hours').select('*').order('day_of_week'),
    supabaseClient.from('special_closures').select('*').order('closure_date'),
    supabaseClient.from('gallery').select('*').order('sort_order'),
    supabaseClient.from('reservations').select('*').order('reservation_date',{ascending:true}).order('reservation_time',{ascending:true}),
    supabaseClient.from('site_settings').select('*').limit(1).maybeSingle()
  ]);
  for(const r of [menu,hours,closures,gallery,reservations,settings]) if(r.error) throw r.error;
  state.menu=menu.data||[]; state.hours=hours.data||[]; state.closures=closures.data||[]; state.photos=gallery.data||[]; state.bookings=reservations.data||[]; state.settings=settings.data||null;
  renderAll();
  setStatus('Verbonden',true);
  $('projectUrlLabel').textContent=cfg.SUPABASE_URL||'—';
}

async function updateRow(table,id,patch){const {error}=await supabaseClient.from(table).update(patch).eq('id',id);if(error)throw error;}
async function insertRow(table,row){const {data,error}=await supabaseClient.from(table).insert(row).select().single();if(error)throw error;return data;}
async function deleteRow(table,id){const {error}=await supabaseClient.from(table).delete().eq('id',id);if(error)throw error;}

function renderMenu(){
 $('menuEditor').innerHTML=state.menu.map(d=>`<div class="dish" data-id="${d.id}">
 <div class="dish-main"><strong>${esc(d.name)}</strong><small>${esc(d.description||'Geen beschrijving')} · ${d.vegetarian?'Végétarien · ':''}${d.allergens?.length?'Allergènes: '+esc(d.allergens.join(', ')):'Geen allergenen ingevuld'}</small></div>
 <span class="cat">${esc(d.category)}</span><input value="${Number(d.price).toFixed(2).replace('.',',')}" data-price="${d.id}" aria-label="Prix">
 <button data-edit-dish="${d.id}">Bewerken</button><button data-delete-dish="${d.id}">Supprimer</button></div>`).join('') || '<div class="panel"><p>Je menu is nog leeg. Voeg je eerste gerecht toe.</p></div>';
 document.querySelectorAll('[data-price]').forEach(x=>x.addEventListener('change',async()=>{try{await updateRow('menu_items',x.dataset.price,{price:Number(String(x.value).replace(',','.'))});await loadAll();}catch(e){alert(e.message)}}));
 document.querySelectorAll('[data-delete-dish]').forEach(x=>x.addEventListener('click',async()=>{if(!confirm('Dit gerecht verwijderen?'))return;try{await deleteRow('menu_items',x.dataset.deleteDish);await loadAll();}catch(e){alert(e.message)}}));
 document.querySelectorAll('[data-edit-dish]').forEach(x=>x.addEventListener('click',()=>editDish(x.dataset.editDish)));
}
async function editDish(id){
 const d=state.menu.find(x=>String(x.id)===String(id));if(!d)return;
 const name=prompt('Naam van het gerecht:',d.name);if(name===null)return;
 const desc=prompt('Beschrijving:',d.description||'');if(desc===null)return;
 const cat=prompt('Categorie (Entrée / Plat / Dessert / Végétarien):',d.category);if(cat===null)return;
 const price=prompt('Prijs in euro:',String(d.price).replace('.',','));if(price===null)return;
 const veg=confirm('Is dit gerecht vegetarisch?');
 const allergens=prompt('Allergenen, gescheiden door komma’s (bv. Lait, Œuf):',(d.allergens||[]).join(', '));if(allergens===null)return;
 try{await updateRow('menu_items',id,{name,description:desc,category:cat,price:Number(price.replace(',','.')),vegetarian:veg,allergens:allergens.split(',').map(s=>s.trim()).filter(Boolean)});await loadAll();}catch(e){alert(e.message)}
}
$('addDish').addEventListener('click',async()=>{try{await insertRow('menu_items',{name:'Nieuw gerecht',category:'Plat',description:'',price:0,vegetarian:false,allergens:[],published:true,sort_order:state.menu.length*10+10});await loadAll();editDish(state.menu[state.menu.length-1].id);}catch(e){alert(e.message)}});

const dayNames=['Zondag','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function renderHours(){
 $('hoursEditor').innerHTML=state.hours.map(h=>`<div class="hour-row"><strong>${dayNames[h.day_of_week]}</strong><input type="time" value="${h.open_time?.slice(0,5)||''}" data-hour="${h.id}" data-part="open_time" ${h.closed?'disabled':''}><input type="time" value="${h.close_time?.slice(0,5)||''}" data-hour="${h.id}" data-part="close_time" ${h.closed?'disabled':''}><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-closed="${h.id}" ${h.closed?'checked':''}> Fermé</label></div>`).join('');
 document.querySelectorAll('[data-hour]').forEach(x=>x.addEventListener('change',async()=>{const row=state.hours.find(h=>String(h.id)===String(x.dataset.hour));const patch={};patch[x.dataset.part]=x.value||null;try{await updateRow('opening_hours',row.id,patch);await loadAll()}catch(e){alert(e.message)}}));
 document.querySelectorAll('[data-closed]').forEach(x=>x.addEventListener('change',async()=>{const row=state.hours.find(h=>String(h.id)===String(x.dataset.closed));try{await updateRow('opening_hours',row.id,{closed:x.checked,open_time:x.checked?null:row.open_time,close_time:x.checked?null:row.close_time});await loadAll()}catch(e){alert(e.message)}}));
}
$('saveHours').addEventListener('click',()=>alert('De uren worden direct opgeslagen zodra je een veld wijzigt.'));
$('addClosure').addEventListener('click',async()=>{const d=prompt('Datum (YYYY-MM-DD):');if(!d)return;const label=prompt('Omschrijving:','Fermeture exceptionnelle')||'Fermeture exceptionnelle';try{await insertRow('special_closures',{closure_date:d,label});await loadAll()}catch(e){alert(e.message)}});
function renderClosures(){$('closures').innerHTML=state.closures.map(c=>`<div class="closure"><span>${esc(c.closure_date)}</span><strong>${esc(c.label||'Fermeture exceptionnelle')}</strong><button class="outline" data-del-closure="${c.id}">×</button></div>`).join('')||'<small>Geen uitzonderlijke sluitingen.</small>';document.querySelectorAll('[data-del-closure]').forEach(b=>b.addEventListener('click',async()=>{try{await deleteRow('special_closures',b.dataset.delClosure);await loadAll()}catch(e){alert(e.message)}}));}

function renderPhotos(){$('photoGrid').innerHTML=state.photos.map(p=>`<div class="photo-card"><img src="${esc(p.image_url)}" alt="${esc(p.title)}"><div class="photo-meta">${esc(p.title||'Photo')} <button onclick="removePhoto(${p.id},'${esc(p.image_url)}')" style="float:right;background:none;border:0;color:#d7ad68;cursor:pointer">×</button></div></div>`).join('')||'<div class="panel"><p>Nog geen eigen foto’s toegevoegd.</p></div>';}
window.removePhoto=async(id,url)=>{if(!confirm('Deze foto verwijderen?'))return;try{await deleteRow('gallery',id);const path=url.split('/restaurant-photos/')[1];if(path)await supabaseClient.storage.from('restaurant-photos').remove([decodeURIComponent(path.split('?')[0])]);await loadAll()}catch(e){alert(e.message)}};
$('addPhoto').addEventListener('click',()=>$('photoInput').click());
$('uploadZone').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')$('photoInput').click()});
$('photoInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/'))return alert('Kies een afbeelding.');try{const ext=f.name.split('.').pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const up=await supabaseClient.storage.from('restaurant-photos').upload(path,f,{upsert:false,contentType:f.type});if(up.error)throw up.error;const {data}=supabaseClient.storage.from('restaurant-photos').getPublicUrl(path);await insertRow('gallery',{title:f.name.replace(/\.[^.]+$/,''),image_url:data.publicUrl,sort_order:state.photos.length*10+10,published:true});await loadAll();e.target.value='';}catch(err){alert(err.message)}});

function bookingHtml(b){const d=new Date(`${b.reservation_date}T${b.reservation_time}`);const dateLabel=d.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit'});return `<div class="booking-item"><span class="time">${esc(b.reservation_time?.slice(0,5))}</span><div><strong>${esc(b.first_name)} ${esc(b.last_name)}</strong><small>${dateLabel} · ${b.guests} personne(s) · ${esc(b.email)}</small></div><span class="pill">${esc(b.status)}</span><button class="outline" style="padding:7px" onclick="manageBooking(${b.id})">Gérer</button></div>`}
function renderBookings(){const sorted=[...state.bookings].sort((a,b)=>`${a.reservation_date} ${a.reservation_time}`.localeCompare(`${b.reservation_date} ${b.reservation_time}`));$('allBookings').innerHTML=sorted.map(bookingHtml).join('')||'<div class="panel"><p>Aucune réservation.</p></div>';$('recentBookings').innerHTML=sorted.slice(0,3).map(bookingHtml).join('')||'<p>Geen reservaties.</p>';const pending=state.bookings.filter(b=>b.status==='pending').length;$('pendingStat').textContent=pending;$('bookingBadge').textContent=pending;}
window.manageBooking=async id=>{const b=state.bookings.find(x=>x.id===id);if(!b)return;const next=prompt('Status: pending, confirmed, cancelled of completed',b.status);if(!next||!['pending','confirmed','cancelled','completed'].includes(next))return;try{await updateRow('reservations',id,{status:next});await loadAll()}catch(e){alert(e.message)}};
$('newBooking').addEventListener('click',()=>go('bookings'));

async function saveSettings(){const payload={restaurant_name:$('restaurantName').value,tagline:$('tagline').value,address:$('address').value,phone:$('phone').value,email:$('email').value,welcome_text:$('welcomeText').value,updated_at:new Date().toISOString()};try{if(state.settings?.id)await updateRow('site_settings',state.settings.id,payload);else state.settings=await insertRow('site_settings',payload);await loadAll();alert('Opgeslagen. De publieke website gebruikt nu deze gegevens.');}catch(e){alert(e.message)}}
$('saveContact').addEventListener('click',saveSettings);
function renderSettings(){const s=state.settings||{};$('restaurantName').value=s.restaurant_name||'Lueur de l’Âtre';$('tagline').value=s.tagline||'Le goût des instants précieux';$('address').value=s.address||'';$('phone').value=s.phone||'';$('email').value=s.email||'';$('welcomeText').value=s.welcome_text||'Là où la chaleur devient souvenir.';}
$('refreshData').addEventListener('click',()=>loadAll().catch(e=>alert(e.message)));

function renderAll(){renderMenu();renderHours();renderClosures();renderPhotos();renderBookings();renderSettings();}

if(cfg.SUPABASE_URL)$('projectUrlLabel').textContent=cfg.SUPABASE_URL;
requireSession();
