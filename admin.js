const DEMO_KEY="lda_owner_demo";
const state={
 menu:[
  {name:"Velouté de saison",cat:"Entrée",price:"14,00",veg:true},
  {name:"Œuf parfait · champignons · truffe",cat:"Entrée",price:"18,00",veg:true},
  {name:"Volaille rôtie · jus au thym",cat:"Plat",price:"29,00",veg:false},
  {name:"Filet de poisson · beurre blanc",cat:"Plat",price:"31,00",veg:false},
  {name:"Risotto de saison · parmesan",cat:"Végétarien",price:"25,00",veg:true},
  {name:"Poire pochée · chocolat noir",cat:"Dessert",price:"12,00",veg:true}
 ],
 hours:[
  ["Lundi","Fermé","Fermé"],["Mardi","Fermé","Fermé"],["Mercredi","18:00","22:30"],["Jeudi","18:00","22:30"],["Vendredi","18:00","23:00"],["Samedi","18:00","23:00"],["Dimanche","12:00","15:00"]
 ],
 bookings:[
  ["19:00","Sophie Martin","4 personnes","Confirmée"],["19:30","Thomas Dupont","2 personnes","En attente"],["20:00","Camille Laurent","6 personnes","Confirmée"],["20:30","Louis Bernard","3 personnes","En attente"]
 ],
 photos:[
  ["Hero","https://images.pexels.com/photos/9143471/pexels-photo-9143471.jpeg?auto=compress&cs=tinysrgb&w=1200"],
  ["Le feu","https://images.pexels.com/photos/8753543/pexels-photo-8753543.jpeg?auto=compress&cs=tinysrgb&w=1200"],
  ["Cuisine","https://images.pexels.com/photos/38958593/pexels-photo-38958593.jpeg?auto=compress&cs=tinysrgb&w=1200"]
 ]
};
function $(id){return document.getElementById(id)}
function save(){localStorage.setItem("ldaCMS",JSON.stringify(state))}
function load(){try{Object.assign(state,JSON.parse(localStorage.getItem("ldaCMS")||"{}"))}catch(e){}}
load();

const loginView=$("loginView"),appView=$("appView");
function showApp(email){loginView.hidden=true;appView.hidden=false;$("ownerEmail").textContent=email||"owner@lueurdelatre.be";renderAll()}
function logged(){return sessionStorage.getItem("ldaLogged")==="1"}
if(logged())showApp(sessionStorage.getItem("ldaEmail"));

$("loginForm").addEventListener("submit",e=>{
 e.preventDefault();
 // Demo only. Production authentication should be Supabase Auth, not client-side credentials.
 const email=$("loginEmail").value;
 sessionStorage.setItem("ldaLogged","1");sessionStorage.setItem("ldaEmail",email);showApp(email);
});
$("logout").addEventListener("click",()=>{sessionStorage.clear();location.reload()});

const titles={overview:"Vue d’ensemble",menu:"Menu & prix",hours:"Horaires d’ouverture",photos:"Photos",bookings:"Réservations clients",contact:"Coordonnées & contact",settings:"Paramètres propriétaire"};
function go(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 $("page-"+page).classList.add("active");
 document.querySelectorAll(".sidebar nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 $("pageTitle").textContent=titles[page];
}
document.querySelectorAll(".sidebar nav button").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
document.querySelectorAll("[data-page-jump]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.pageJump)));

function renderMenu(){
 $("menuEditor").innerHTML=state.menu.map((d,i)=>`<div class="dish">
 <div><strong>${d.name}</strong><small>${d.veg?"Végétarien · ":""}Allergènes à compléter dans la fiche</small></div>
 <span class="cat">${d.cat}</span>
 <input value="${d.price}" data-price="${i}" aria-label="Prix">
 <button data-delete-dish="${i}">Supprimer</button>
 </div>`).join("");
 document.querySelectorAll("[data-price]").forEach(x=>x.addEventListener("change",()=>{state.menu[x.dataset.price].price=x.value;save()}));
 document.querySelectorAll("[data-delete-dish]").forEach(x=>x.addEventListener("click",()=>{state.menu.splice(+x.dataset.deleteDish,1);save();renderMenu()}));
}
$("addDish").addEventListener("click",()=>{state.menu.push({name:"Nouveau plat",cat:"Plat",price:"0,00",veg:false});save();renderMenu()});

function renderHours(){
 $("hoursEditor").innerHTML=state.hours.map((h,i)=>`<div class="hour-row"><strong>${h[0]}</strong><input value="${h[1]}" data-hour="${i}" data-part="1"><input value="${h[2]}" data-hour="${i}" data-part="2"><span class="day-status">${h[1]==="Fermé"?"Fermé":"Ouvert"}</span></div>`).join("");
 document.querySelectorAll("[data-hour]").forEach(x=>x.addEventListener("change",()=>{state.hours[x.dataset.hour][x.dataset.part]=x.value;save();renderHours()}));
}
$("saveHours").addEventListener("click",()=>{save();alert("Horaires enregistrés dans le mode local.")});
$("addClosure").addEventListener("click",()=>{const d=prompt("Date de fermeture (ex. 24/12)");if(d){$("closures").insertAdjacentHTML("beforeend",`<div class="closure"><span>${d}</span><strong>Fermeture exceptionnelle</strong></div>`)}});

function renderPhotos(){
 $("photoGrid").innerHTML=state.photos.map((p,i)=>`<div class="photo-card"><img src="${p[1]}" alt="${p[0]}"><div class="photo-meta">${p[0]} <button onclick="removePhoto(${i})" style="float:right;background:none;border:0;color:#d7ad68;cursor:pointer">×</button></div></div>`).join("");
}
window.removePhoto=i=>{state.photos.splice(i,1);save();renderPhotos()};
$("addPhoto").addEventListener("click",()=>$("photoInput").click());
$("uploadZone").addEventListener("click",e=>{if(e.target.tagName!=="BUTTON")$("photoInput").click()});
$("photoInput").addEventListener("change",e=>{
 const f=e.target.files[0]; if(!f)return;
 const reader=new FileReader();reader.onload=()=>{state.photos.push(["Nouvelle photo",reader.result]);save();renderPhotos()};reader.readAsDataURL(f);
});

function bookingHtml(b){return `<div class="booking-item"><span class="time">${b[0]}</span><div><strong>${b[1]}</strong><small>${b[2]}</small></div><span class="pill">${b[3]}</span><button class="outline" style="padding:7px" onclick="confirmBooking(this)">Gérer</button></div>`}
function renderBookings(){$("allBookings").innerHTML=state.bookings.map(bookingHtml).join("");$("recentBookings").innerHTML=state.bookings.slice(0,3).map(bookingHtml).join("")}
window.confirmBooking=btn=>{btn.previousElementSibling.textContent="Confirmée";renderBookings()};
$("newBooking").addEventListener("click",()=>alert("Le formulaire de réservation propriétaire sera relié à votre moteur de réservation lors de la connexion Supabase/provider."));

$("saveContact").addEventListener("click",()=>{localStorage.setItem("ldaContact",JSON.stringify({name:$("restaurantName").value,tagline:$("tagline").value,address:$("address").value,phone:$("phone").value,email:$("email").value,welcome:$("welcomeText").value}));alert("Coordonnées enregistrées.")});
const contact=JSON.parse(localStorage.getItem("ldaContact")||"null");if(contact){Object.entries({restaurantName:"name",tagline:"tagline",address:"address",phone:"phone",email:"email",welcomeText:"welcome"}).forEach(([id,k])=>{if($(id)&&contact[k])$(id).value=contact[k]})}
$("saveConfig").addEventListener("click",()=>alert("Configuration locale enregistrée. Pour la production, ajoutez votre Supabase URL et publishable key puis appliquez supabase.sql."));

function renderAll(){renderMenu();renderHours();renderPhotos();renderBookings()}
