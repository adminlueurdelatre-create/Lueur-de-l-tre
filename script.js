const header=document.querySelector('.site-header');
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
const glow=document.querySelector('.cursor-glow');
const intro=document.getElementById('cinematicIntro');
const introEnter=document.getElementById('introEnter');
const introSkip=document.getElementById('introSkip');
const cfg=window.LDA_CONFIG||{};
const db=window.supabase?.createClient?.(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY);

document.body.classList.add('intro-active');
function leaveIntro(){if(!intro||intro.classList.contains('opened'))return;intro.classList.add('opened');document.body.classList.remove('intro-active');try{sessionStorage.setItem('ldaIntroSeen','1')}catch(e){}}
if(intro){let seen=false;try{seen=sessionStorage.getItem('ldaIntroSeen')==='1'}catch(e){}if(seen){intro.classList.add('opened');document.body.classList.remove('intro-active')}else setTimeout(leaveIntro,6500);introEnter?.addEventListener('click',leaveIntro);introSkip?.addEventListener('click',leaveIntro)}
window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>30));
toggle?.addEventListener('click',()=>nav?.classList.toggle('open'));nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
window.addEventListener('mousemove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();

function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function euro(v){return Number(v||0).toLocaleString('fr-BE',{style:'currency',currency:'EUR'});}
const dayNames=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
function fallbackData(){return {
 settings:{restaurant_name:'Lueur de l’Âtre',tagline:'Le goût des instants précieux',address:'Votre adresse · Belgique',phone:'+32 (0)00 00 00 00',email:'bonjour@lueurdelatre.be',welcome_text:'Là où la chaleur devient souvenir.'},
 menu:[{name:'Velouté de saison',category:'Entrée',description:'Velouté maison selon les produits du moment.',price:14,vegetarian:true,allergens:['Lait']},{name:'Œuf parfait · champignons · truffe',category:'Entrée',description:'Œuf parfait, champignons et touche de truffe.',price:18,vegetarian:true,allergens:['Œuf','Lait']},{name:'Volaille rôtie · jus au thym',category:'Plat',description:'Volaille rôtie, jus au thym et garniture de saison.',price:29,vegetarian:false,allergens:['Lait']},{name:'Filet de poisson · beurre blanc',category:'Plat',description:'Poisson du moment, beurre blanc et légumes de saison.',price:31,vegetarian:false,allergens:['Poisson','Lait']},{name:'Risotto de saison · parmesan',category:'Végétarien',description:'Risotto crémeux, légumes de saison et parmesan.',price:25,vegetarian:true,allergens:['Lait']},{name:'Poire pochée · chocolat noir',category:'Dessert',description:'Poire pochée, chocolat noir et texture croustillante.',price:12,vegetarian:true,allergens:['Soja']}],
 hours:[{day_of_week:0,open_time:'12:00',close_time:'15:00',closed:false},{day_of_week:1,closed:true},{day_of_week:2,closed:true},{day_of_week:3,open_time:'18:00',close_time:'22:30',closed:false},{day_of_week:4,open_time:'18:00',close_time:'22:30',closed:false},{day_of_week:5,open_time:'18:00',close_time:'23:00',closed:false},{day_of_week:6,open_time:'18:00',close_time:'23:00',closed:false}],
 gallery:[{title:'La table',image_url:'https://images.pexels.com/photos/37307284/pexels-photo-37307284.jpeg?cs=srgb&dl=pexels-le-salama-2161202416-37307284.jpg&fm=jpg'},{title:'Le feu',image_url:'https://images.pexels.com/photos/8753543/pexels-photo-8753543.jpeg?cs=srgb&dl=pexels-picsfast-8753543.jpg&fm=jpg'},{title:'La cuisine',image_url:'https://images.pexels.com/photos/38958593/pexels-photo-38958593.jpeg?cs=srgb&dl=pexels-aabouden-yassir-2163228451-38958593.jpg&fm=jpg'},{title:'Le détail',image_url:'https://images.pexels.com/photos/33033789/pexels-photo-33033789.jpeg?cs=srgb&dl=pexels-szymon-shields-1503561-33033789.jpg&fm=jpg'}]
};}

function renderPublic(data){
 const s=data.settings||{};
 document.title=`${s.restaurant_name||'Lueur de l’Âtre'} — Là où la chaleur devient souvenir`;
 document.querySelectorAll('.brand-name').forEach(x=>x.textContent=s.restaurant_name||'Lueur de l’Âtre');
 document.querySelectorAll('.intro-name').forEach(x=>x.innerHTML=esc(s.restaurant_name||'Lueur de l’Âtre').replace(' de ',' de '));
 const slogan=s.welcome_text||'Là où la chaleur devient souvenir.';
 document.querySelectorAll('.hero-slogan,.intro-motto,footer p').forEach(x=>x.textContent=slogan);
 document.querySelectorAll('.hero-sub,footer small').forEach(x=>{if(x.classList.contains('hero-sub'))x.textContent=s.tagline||'Le goût des instants précieux.'});
 const pg=document.getElementById('publicMenuGrid');
 if(pg)pg.innerHTML=(data.menu||[]).map((d,i)=>`<article class="menu-card ${i===0?'featured ':''}reveal" style="--card-photo:url('https://images.pexels.com/photos/${[33033789,19606041,38958593][i%3]}/pexels-photo-${[33033789,19606041,38958593][i%3]}.jpeg?auto=compress&cs=tinysrgb&w=1200')"><div class="menu-kicker">${esc(d.category)}${d.vegetarian?' · Végétarien':''}</div><h3>${esc(d.name)}</h3><div class="price">${euro(d.price)}</div><p>${esc(d.description||'Préparé avec soin dans l’esprit de la maison.')}</p><ul><li>${d.allergens?.length?'Allergènes : '+esc(d.allergens.join(', ')):'Allergènes : à demander'}</li><li>${d.vegetarian?'Option végétarienne':'Préparation de saison'}</li></ul><a href="#reserveren" class="card-link">Réserver ce moment →</a></article>`).join('');
 const gg=document.getElementById('publicGalleryGrid');if(gg)gg.innerHTML=(data.gallery||[]).slice(0,4).map((p,i)=>`<div class="gallery-tile tile-${i+1}" style="--photo:linear-gradient(180deg,transparent 35%,rgba(12,8,6,.78)),url('${esc(p.image_url)}')"><span>${esc(p.title||'Lueur de l’Âtre')}</span></div>`).join('');
 const ph=document.getElementById('publicPhone');const pl=document.getElementById('publicPhoneLink');if(ph)ph.textContent=s.phone||'À définir';if(pl)pl.href='tel:'+(s.phone||'').replace(/[^+\d]/g,'');
 const em=document.getElementById('publicEmail');const el=document.getElementById('publicEmailLink');if(em)em.textContent=s.email||'bonjour@lueurdelatre.be';if(el)el.href='mailto:'+(s.email||'bonjour@lueurdelatre.be');
 const ad=document.getElementById('publicAddress');if(ad)ad.textContent=s.address||'Votre adresse · Belgique';
 const hours=document.getElementById('publicHours');if(hours)hours.innerHTML=(data.hours||[]).map(h=>`<div><span>${dayNames[h.day_of_week]}</span><strong>${h.closed?'Fermé':`${h.open_time?.slice(0,5)||''} — ${h.close_time?.slice(0,5)||''}`}</strong></div>`).join('');
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}

async function loadPublic(){
 let data=fallbackData();
 if(db){try{const [settings,menu,hours,gallery]=await Promise.all([
   db.from('site_settings').select('*').limit(1).maybeSingle(),
   db.from('menu_items').select('*').eq('published',true).order('sort_order'),
   db.from('opening_hours').select('*').order('day_of_week'),
   db.from('gallery').select('*').eq('published',true).order('sort_order')
 ]);if(!settings.error&&settings.data)data.settings=settings.data;if(!menu.error&&menu.data?.length)data.menu=menu.data;if(!hours.error&&hours.data?.length)data.hours=hours.data;if(!gallery.error&&gallery.data?.length)data.gallery=gallery.data;}catch(e){console.warn('Supabase unavailable; fallback content used.',e)}}
 renderPublic(data);
}
loadPublic();

const dateField=document.querySelector('#reservationForm input[name="date"]');
if(dateField){const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());dateField.min=today.toISOString().slice(0,10);}
const timeButtons=document.querySelectorAll('#timeGrid button');const selectedTime=document.getElementById('selectedTime');
timeButtons.forEach(btn=>btn.addEventListener('click',()=>{timeButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(selectedTime)selectedTime.value=btn.dataset.time;}));

async function submitReservation(e){
 e.preventDefault();const form=e.currentTarget;const success=document.getElementById('reservationSuccess');
 if(!selectedTime?.value){alert('Kies eerst een uur.');return;}
 const data=new FormData(form);const guestsText=String(data.get('guests')||'').replace(/\D/g,'');const guests=Number(guestsText||2);
 const payload={reservation_date:data.get('date'),reservation_time:data.get('time'),guests,first_name:data.get('firstName'),last_name:data.get('lastName'),email:data.get('email'),phone:data.get('phone'),occasion:data.get('occasion')||'',dietary_preference:data.get('diet')||'',notes:data.get('notes')||'',status:'pending'};
 try{
   if(!db)throw new Error('De reserveringsdatabase is tijdelijk niet bereikbaar.');
   const {error}=await db.from('reservations').insert(payload);if(error)throw error;
   if(success){success.hidden=false;success.textContent='Bedankt. Je aanvraag is ontvangen. We nemen zo snel mogelijk contact met je op om de beschikbaarheid definitief te bevestigen.';}
   form.reset();timeButtons.forEach(b=>b.classList.remove('active'));if(selectedTime)selectedTime.value='';
 }catch(err){console.error(err);if(success){success.hidden=false;success.textContent='Er ging iets mis met de aanvraag. Probeer opnieuw of neem rechtstreeks contact met ons op.';}}
}
document.getElementById('reservationForm')?.addEventListener('submit',submitReservation);
