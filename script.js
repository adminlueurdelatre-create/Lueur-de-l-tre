const header=document.querySelector('.site-header');
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
const glow=document.querySelector('.cursor-glow');
const intro=document.getElementById('cinematicIntro');
const introEnter=document.getElementById('introEnter');
const introSkip=document.getElementById('introSkip');

document.body.classList.add('intro-active');

function leaveIntro(){
  if(!intro || intro.classList.contains('opened')) return;
  intro.classList.add('opened');
  document.body.classList.remove('intro-active');
  try{sessionStorage.setItem('ldaIntroSeen','1')}catch(e){}
}

if(intro){
  // Show the cinematic intro once per browser session; visitors can replay it by refreshing after a new session.
  let seen=false;
  try{seen=sessionStorage.getItem('ldaIntroSeen')==='1'}catch(e){}
  if(seen){
    intro.classList.add('opened');
    document.body.classList.remove('intro-active');
  }else{
    setTimeout(leaveIntro,6500);
  }
  introEnter?.addEventListener('click',leaveIntro);
  introSkip?.addEventListener('click',leaveIntro);
}

window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>30));
toggle?.addEventListener('click',()=>nav?.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));
window.addEventListener('mousemove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();

const dateField=document.querySelector('#reservationForm input[name="date"]');
if(dateField){
  const today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  dateField.min=today.toISOString().slice(0,10);
}
document.getElementById('reservationForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.currentTarget, data=new FormData(form);
  const success=document.getElementById('reservationSuccess');
  const subject=encodeURIComponent(`Demande de réservation — ${data.get('firstName')} ${data.get('lastName')}`);
  const body=encodeURIComponent(
`Bonjour Lueur de l’Âtre,

Je souhaite demander une réservation.

Nom : ${data.get('firstName')} ${data.get('lastName')}
E-mail : ${data.get('email')}
Téléphone : ${data.get('phone')}
Date : ${data.get('date')}
Heure : ${data.get('time')}
Nombre de personnes : ${data.get('guests')}
Occasion : ${data.get('occasion')}
Préférence alimentaire : ${data.get('diet')}
Allergies / demandes : ${data.get('notes') || 'Aucune'}

Merci de me confirmer la disponibilité.

Bien à vous,
${data.get('firstName')} ${data.get('lastName')}`
  );
  window.location.href=`mailto:bonjour@lueurdelatre.be?subject=${subject}&body=${body}`;
  if(success) success.hidden=false;
});

const timeButtons=document.querySelectorAll('#timeGrid button');
const selectedTime=document.getElementById('selectedTime');
timeButtons.forEach(btn=>btn.addEventListener('click',()=>{
  timeButtons.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(selectedTime) selectedTime.value=btn.dataset.time;
}));
document.getElementById('reservationForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.currentTarget;
  if(!selectedTime?.value){ selectedTime?.reportValidity(); return; }
  const data=new FormData(form);
  const subject=encodeURIComponent(`Réservation — Lueur de l’Âtre — ${data.get('date')} ${data.get('time')}`);
  const body=encodeURIComponent(
`Bonjour Lueur de l’Âtre,

Je souhaite confirmer une demande de réservation.

Date : ${data.get('date')}
Heure : ${data.get('time')}
Personnes : ${data.get('guests')}
Nom : ${data.get('firstName')} ${data.get('lastName')}
E-mail : ${data.get('email')}
Téléphone : ${data.get('phone')}
Occasion : ${data.get('occasion')}
Préférence alimentaire : ${data.get('diet')}
Allergies / demandes : ${data.get('notes') || 'Aucune'}

Merci de me confirmer la disponibilité.

Bien à vous`
  );
  const success=document.getElementById('reservationSuccess');
  if(success){success.hidden=false;success.textContent="Votre demande est prête. Pour l’instant, elle ouvre votre e-mail ; après connexion d’un vrai moteur de réservation, cette étape deviendra une confirmation instantanée."}
  setTimeout(()=>{window.location.href=`mailto:bonjour@lueurdelatre.be?subject=${subject}&body=${body}`},250);
});
