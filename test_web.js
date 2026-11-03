// Tests jsdom : navigation mobile (standard), parcours de réservation, parité moteur JS/Python.
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const { TextEncoder } = require("util");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const parity = JSON.parse(fs.readFileSync(path.join(__dirname, "parity.json"), "utf8"));
const dom = new JSDOM("<!doctype html><html><head></head><body>" + html + "</body></html>", {
  runScripts: "dangerously", url: "https://beautyme.test/", pretendToBeVisual: true,
  beforeParse(w) { w.TextEncoder = TextEncoder; w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {}; },
});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), ev = s => w.eval(s);
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("ÉCHEC :", msg); } };
const touch = (type, x) => { const e = new w.Event(type, { bubbles: true }); Object.defineProperty(e, type === "touchstart" ? "touches" : "changedTouches", { value: [{ clientX: x }] }); d.dispatchEvent(e); };
const isOpen = () => $("sidebar").classList.contains("open");

// 1. Structure
ok(d.querySelector(".mobilebar") && $("backdrop") && d.querySelector(".drawer-head"), "barre de contexte, voile, en-tête de tiroir");
ok(d.querySelectorAll("header button").length === 1 && d.querySelector("header .dh-x"), "aucun bouton de navigation résiduel dans l'en-tête");

// 2. Ouverture
ev("openNav()");
ok(isOpen() && $("backdrop").classList.contains("on") && d.body.classList.contains("nav-open"), "ouverture : tiroir, voile, verrou");
ok($("mb-btn").getAttribute("aria-expanded") === "true" && $("mb-btn").textContent === "Fermer", "aria-expanded et libellé");
ok(d.activeElement && d.activeElement.dataset.page === "accueil", "focus sur l'entrée active");

// 3. Cinq voies de fermeture
d.querySelector(".dh-x").click(); ok(!isOpen() && $("mb-btn").textContent === "Menu", "fermeture : bouton Fermer");
ev("openNav()"); $("backdrop").click(); ok(!isOpen(), "fermeture : voile");
ev("openNav()"); d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); ok(!isOpen(), "fermeture : Échap");
ev("openNav()"); touch("touchstart", 300); touch("touchend", 200); ok(!isOpen(), "fermeture : balayage gauche");
ev("openNav()"); touch("touchstart", 100); touch("touchend", 260); ok(isOpen(), "balayage droite ne ferme pas");
ev("showPage('rdv')"); ok(!isOpen() && !d.body.classList.contains("nav-open"), "fermeture : navigation");

// 4. Titre de contexte sur toutes les pages + clavier
for (const a of d.querySelectorAll("#sidebar a")) {
  ev(`showPage('${a.dataset.page}')`);
  ok($("mb-title").textContent === a.dataset.label && $("page-" + a.dataset.page).classList.contains("active"), "titre de contexte : " + a.dataset.page);
}
d.querySelector('#sidebar a[data-page="pro"]').dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
ok($("page-pro").classList.contains("active"), "navigation clavier (Entrée)");
d.querySelector('#sidebar a[data-page="rdv"]').dispatchEvent(new w.KeyboardEvent("keydown", { key: " ", bubbles: true }));
ok($("page-rdv").classList.contains("active"), "navigation clavier (Espace)");
ev("showPage('inexistante')"); ok($("page-accueil").classList.contains("active") && $("mb-title").textContent === "Accueil", "page inconnue → accueil");

// 5. Règles CSS
const css = d.querySelector("style").textContent;
for (const r of ["max-width:900px", "body.nav-open{overflow:hidden}", "translateX(-101%)", "font-size:16px", "min-height:44px", ".cats,.promise,.info-grid{grid-template-columns:1fr}"])
  ok(css.includes(r), "règle CSS présente : " + r);

// 6. Parité moteur JS / Python
let same = 0;
for (const [k, v] of Object.entries(parity)) {
  const [slug, sid, day] = k.split("|");
  const js = ev(`(()=>{const s=salonBy('${slug}');return JSON.stringify(demoBusy(s,s.staff.find(p=>p.id==='${sid}'),'${day}'))})()`);
  if (js === JSON.stringify(v)) same++;
}
ok(same === Object.keys(parity).length, `parité occupation JS/Python (${same}/${Object.keys(parity).length})`);

// 7. Recherche : chaque territoire a des résultats
for (const t of ["MQ", "GP", "GF"]) { ev(`S.t='${t}';S.cat='';S.commune='';S.home=false;S.day=''`); ev("showPage('recherche')"); ok(d.querySelectorAll("#cards .card").length === 4, "résultats " + t); }
ev("S.t='GP';S.home=true;S.commune='Le Gosier'"); ev("renderResults()");
ok(d.querySelectorAll("#cards .card").length === 2, "filtre domicile Le Gosier : 2 établissements");

// 8. Parcours complet de réservation
ev("S.home=false;S.commune='';B=null"); ev("showPage('salon',{slug:'atelier-du-lamentin'})");
ok($("mb-title").textContent === "L'Atelier du Lamentin" && w.location.hash === "#salon-atelier-du-lamentin", "fiche salon : titre et ancre");
$("sv-cbh").click();
ok($("sv-cbh").getAttribute("aria-pressed") === "true", "prestation sélectionnée");
// premier jour avec des créneaux
let found = false;
for (const b of d.querySelectorAll(".day:not([disabled])")) { b.click(); if (d.querySelector(".slot")) { found = true; break; } }
ok(found, "créneaux affichés");
const t0 = d.querySelector(".slot").textContent;
d.querySelector(".slot").click();
const chosen = ev("JSON.stringify({day:B.day,start:B.slot.start,staff:B.slot.staff})");
d.querySelector("#book .btn.block").click();
ok(ev("B.step") === "details" && $("hold-t"), "créneau bloqué, compte à rebours");
ok(ev("BOOKINGS.some(b=>b.status==='held')"), "hold enregistré");
$("c-name").value = "Léa"; $("c-tel").value = "696 12 34 56"; $("c-cgu").checked = true;
d.querySelector("#book form").dispatchEvent(new w.Event("submit", { cancelable: true }));
ok($("c-otp"), "code demandé");
$("c-otp").value = "1111"; d.querySelector("#book form").dispatchEvent(new w.Event("submit", { cancelable: true }));
ok(d.querySelector("#book .err") && ev("B.step") === "details", "code erroné refusé");
$("c-otp").value = "2026"; d.querySelector("#book form").dispatchEvent(new w.Event("submit", { cancelable: true }));
ok(ev("B.step") === "done" && ev("BOOKINGS.filter(b=>b.status==='confirmed').length") === 1, "rendez-vous confirmé");
// le créneau n'est plus proposé pour ce collaborateur
const c = JSON.parse(chosen);
const still = ev(`findSlots(salonBy('atelier-du-lamentin'),['cbh'],'${c.day}',busyFor(salonBy('atelier-du-lamentin'),'${c.day}'),{staffId:'${c.staff}'}).some(x=>x.start===${c.start})`);
ok(!still, "double réservation impossible (" + t0 + ")");
ev("showPage('rdv')"); ok(d.querySelectorAll("#rdv-list .rdv").length === 1, "mes rendez-vous");
ev("showPage('pro')"); ok(d.querySelectorAll("#p-tl .tl-row").length >= 1 && $("p-kpis").textContent.includes("Via BeautyMe"), "agenda pro");

// 9. Domicile : trajet bloqué
ev("B=null"); ev("showPage('salon',{slug:'kaz-bien-etre-le-diamant'})"); $("sv-mr").click();
ev("setB('mode','domicile')");
ok($("book").textContent.includes("de trajet aller-retour") && $("b-com"), "mode domicile : trajet et commune");

console.log(`\n${pass} vérifications réussies, ${fail} échec(s)`);
process.exit(fail ? 1 : 0);
