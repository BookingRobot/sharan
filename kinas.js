/* ===== Šarano filmukas: 2 diena, Berlynas – Miunchenas (2026-11-19) =====
   Interaktyvus filmukas puslapio viršuje (<section id="kino"> index.html faile).
   Žemėlapyje važiuoja mašiniukas, kiekviename taške rodomas stambus planas: visi išlipa,
   nueina į krūmus, atsiranda bala, visi sulipa atgal ir dumia toliau.
   Herojai imami iš index.html (CHAR, face). Abramovič keliauja tik kaip dvasia.
   Kita diena = nauji STOPS (miestai, tekstai), LAND (fono siluetai) ir TW (sustojimo pokštai). */
(function(){
"use strict";
const box=document.getElementById("kinoBox");
if(!box||typeof CHAR==="undefined"||typeof face!=="function") return;
const NS="http://www.w3.org/2000/svg", W=1080;
const SPEED=Math.min(8,Math.max(.25,+(new URLSearchParams(location.search).get("greitis"))||1)); // ?greitis=2 pagreitina (testams)
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const CREW=["Simonas","Deksnys","Thūlė","Modė","Kvedaravičius","Vacys"], GHOST="Abramovič";

/* ---------- sustojimai ----------
   km: apytiksliai pagal kelių žemėlapį, kad gale išeitų ~660 (kaip Mindaugo tekste).
   lb: miesto užrašo vieta žemėlapyje [dx, dy, lygiavimas]. via: lankstas iki sustojimo (dujų paieškos). */
const STOPS=[
 {id:"berlin",n:"Berlynas",lat:52.52,lon:13.405,land:"Brandenburgas",km:0,sky:0,lb:[42,10,"start"],
  cap:["Berlynas. Planas paprastas: ~590 km ir 6 valandos iki Miuncheno.",
       "Visi į Šaraną! Abramovič keliauja tik kaip dvasia: į kelionę jis taip ir neišvažiavo.",
       "Navigacija sako: važiuokit per Leipcigą."]},
 {id:"dresden",n:"Drezdenas",lat:51.05,lon:13.74,land:"Saksonija",km:190,sky:1,lb:[42,10,"start"],prop:"wc",road:"Ei, o kur Leipcigas?!",
  cap:["Drezdenas, Elbės Florencija. Gražu. Tik čia turėjo būti Leipcigas.",
       "Pirma pertraukėlė. Tualetas 1 €, krūmai nemokami.",
       "Atsirado bala. Visi atgal ir dumiam toliau!"]},
 {id:"chemnitz",n:"Chemnicas",lat:50.83,lon:12.92,land:"Saksonija",km:265,sky:1,lb:[26,44,"start"],prop:"lpgNo",lpg:1,via:[[652,553],[634,516]],road:"Kur čia LPG?",
  cap:["Chemnicas. Ieškom dujų. Bake jų dar nemažai, bet ieškom.",
       "LPG kolonėlės čia nėra. Užtat krūmai yra.",
       "Bala nr. 2. Varom!"]},
 {id:"zwickau",n:"Zwickau",lat:50.72,lon:12.49,land:"Saksonija",km:305,sky:2,lb:[-22,-28,"end"],prop:"trabi",road:"Stojam?",
  cap:["Zwickau, Trabanto gimtinė. Šaranas čia pasijuto jaunas.",
       "Išlipom tik apsižiūrėti. Na, ir į krūmus, žinoma.",
       "Poilsio aikštelė pažymėta. Toliau!"]},
 {id:"plauen",n:"Plauenas",lat:50.5,lon:12.14,land:"Saksonija",km:340,sky:2,lb:[-40,14,"end"],prop:"lpgYes",lpg:1,via:[[494,610],[508,650]],road:"LPG! Tik ne prie autobano",
  cap:["Plauenas. LPG yra! Tik teko išsukti iš autobano ir dar gerokai pavažiuoti.",
       "Kol Šaranas geria dujas, ekipažas daro priešingai.",
       "Bakas pilnas, ekipažas tuščias. Dumiam!"]},
 {id:"hof",n:"Hofas",lat:50.32,lon:11.92,land:"Bavarija",km:368,sky:2,lb:[38,26,"start"],prop:"bayern",road:"Bavarija!",
  cap:["Hofas. Sveiki atvykę į Bavariją, trečią šios dienos žemę!",
       "Pirmas bavariškas krūmas. Grüß Gott!",
       "Bala jau bavariška. Pirmyn!"]},
 {id:"bayreuth",n:"Bayreuthas",lat:49.95,lon:11.58,land:"Bavarija",km:420,sky:3,lb:[42,10,"start"],notes:1,road:"Man vėl reikia…",
  cap:["Bayreuthas, Vagnerio operų miestas.",
       "Krūmuose šįvakar irgi opera. Choras iš šešių.",
       "Plojimai. Uždanga. Į Šaraną!"]},
 {id:"nurnberg",n:"Niurnbergas",lat:49.45,lon:11.08,land:"Bavarija",km:500,sky:4,lb:[-42,10,"end"],prop:"lpgYes",lpg:1,via:[[292,808],[236,798]],road:"Vėl sukam iš autobano",
  cap:["Niurnbergas. Vėl ieškom dujų ir vėl sukam iš autobano.",
       "Tualeto pertraukėlė: seniai privaloma programos dalis.",
       "Saulė leidžiasi, balų daugėja. Varom!"]},
 {id:"ingolstadt",n:"Ingolštatas",lat:48.77,lon:11.42,land:"Bavarija",km:588,sky:5,lb:[42,10,"start"],road:"Tuoj, tuoj…",
  cap:["Ingolštatas. Paskutinis sustojimas. Garbės žodis.",
       "Tamsoje krūmų nesimato, bet ekipažas juos randa iš atminties.",
       "Liko visai nedaug. Paskutinis spurtas!"]},
 {id:"munchen",n:"Miunchenas",lat:48.14,lon:11.58,land:"Bavarija",km:660,sky:5,lb:[42,10,"start"],road:"Jau kvepia alum!",
  cap:["MES MIUNCHENE! 8 valandos vietoj 6 ir ~660 km vietoj 590.",
       "Pirma krūmai, paskui alus. Tradicija yra tradicija.",
       "O dabar: vakarienė!"]}
];
const N=STOPS.length;
const LINES={
 "Simonas":["Kas kiek spaudžiat?","Krūmas irgi treniruotė","Dar vieną priėjimą!","Pakelčiau tą Šaraną"],
 "Deksnys":["Pagal skaičiavimus: stojam","Slėgis kritinis","Čia reikia brėžinio","Tolerancija viršyta"],
 "Thūlė":["KIJA!","Jaunystėj krūmų nereikėjo","Senam visur krūmas","Kvėpuojam pilvu"],
 "Modė":["Balsuojam: kas už krūmus?","Priimta vienbalsiai","Valstybinės svarbos reikalas","Siūlau pertrauką"],
 "Kvedaravičius":["Navigacija sakė: Leipcigas!","Kas čia vairavo?!","Dar 6 valandos. Ne, 8.","Aš tik keleivis"],
 "Vacys":["Pristatymas per 8 val.","Čia Prime negalioja","Užsakau krūmą į namus","Optimizuojam maršrutą"],
 "Abramovič":["Uuuu… aš su jumis dvasia","Man nereikia. Aš dvasia.","Bū!","Namie šilčiau, uuuu…"]
};
// dangus: [viršus, apačia, siluetas, tolimas siluetas, sutemos, žolė, šviesulys [x, y, r, spalva]]
const SKY=[
 ["#7cc6f7","#e3f4ff","#6f8fb3","#a9c3dd",0,"#86c260",[930,250,52,"#ffe066"]],
 ["#58b4f5","#d2ecff","#6688b0","#a3bfdc",0,"#86c260",[900,200,52,"#ffe066"]],
 ["#6aaef0","#ffe9bd","#72799f","#b3aec4",0,"#84bd5f",[840,300,56,"#ffd43b"]],
 ["#5a66b0","#ffb27a","#4b3f6e","#8d6f96",.14,"#79ad58",[250,620,74,"#ff922b"]],
 ["#3a3478","#f08a5d","#2b2450","#57406f",.26,"#6c9a50",[250,700,80,"#ff6b4a"]],
 ["#0b1030","#1d2a5e","#080c22","#141c40",.42,"#5f8a48",[930,230,44,"#f4e7c2"]]
];

/* ---------- žemėlapis: tikros koordinatės, supaprastintos ribos ---------- */
const P=(lat,lon)=>[Math.round((lon-9.7)*190),Math.round(130+(53-lat)*200)];
const pp=a=>a.map(([la,lo])=>P(la,lo).join(",")).join(" ");
const DE=[[53.8,9.4],[53.8,14.3],[53,14.2],[52.85,14.13],[52.6,14.6],[52.35,14.55],[52.05,14.75],[51.75,14.65],[51.55,14.72],[51.15,15],[50.87,14.82],[51.05,14.3],[50.89,14.23],[50.78,13.9],[50.72,13.55],[50.6,13.3],[50.42,12.95],[50.4,12.5],[50.22,12.31],[50.32,12.1],[50.05,12.3],[49.9,12.5],[49.75,12.45],[49.55,12.6],[49.35,12.8],[49.2,13.1],[49.05,13.4],[48.95,13.6],[48.77,13.84],[48.57,13.5],[48.4,13.42],[48.25,13],[47.95,12.9],[47.8,13],[47.6,13.08],[47.47,13],[47.65,12.75],[47.6,12.2],[47.5,11.4],[47.4,11.1],[47.5,10.5],[47.3,10.2],[47.55,9.75],[47.55,9.4]];
const BB=[[53.8,11.4],[53.8,14.3],[53,14.2],[52.85,14.13],[52.6,14.6],[52.35,14.55],[52.05,14.75],[51.75,14.65],[51.55,14.72],[51.37,14],[51.43,13.2],[51.7,13.2],[51.85,13],[51.95,12.8],[52.05,12.3],[52.25,12.25],[52.5,12.2],[52.7,12.2],[52.85,12],[53,11.6]];
const SN=[[51.4,12.15],[51.6,12.3],[51.65,12.8],[51.6,13.05],[51.43,13.2],[51.37,14],[51.55,14.72],[51.15,15],[50.87,14.82],[51.05,14.3],[50.89,14.23],[50.78,13.9],[50.72,13.55],[50.6,13.3],[50.42,12.95],[50.4,12.5],[50.22,12.31],[50.32,12.1],[50.42,11.9],[50.6,11.95],[50.65,12.25],[50.82,12.3],[50.95,12.65],[51.1,12.5],[51.1,12.2],[51.3,12.15]];
const BY=[[50.42,11.9],[50.32,12.1],[50.05,12.3],[49.9,12.5],[49.75,12.45],[49.55,12.6],[49.35,12.8],[49.2,13.1],[49.05,13.4],[48.95,13.6],[48.77,13.84],[48.57,13.5],[48.4,13.42],[48.25,13],[47.95,12.9],[47.8,13],[47.6,13.08],[47.47,13],[47.65,12.75],[47.6,12.2],[47.5,11.4],[47.4,11.1],[47.5,10.5],[47.3,10.2],[47.55,9.75],[47.8,10.1],[48.1,10.1],[48.4,10],[48.7,10.45],[49,10.3],[49.4,10.1],[49.55,9.9],[49.75,9.6],[50,9.4],[50.25,9.9],[50.55,10.3],[50.35,10.75],[50.3,11.1],[50.5,11.4]];
const XY=STOPS.map(s=>P(s.lat,s.lon));
const pts=[XY[0]], stopAt=[0];
for(let i=1;i<N;i++){ (STOPS[i].via||[]).forEach(v=>pts.push(v)); pts.push(XY[i]); stopAt.push(pts.length-1) }
const seg=[0]; for(let i=1;i<pts.length;i++) seg.push(seg[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
const CUM=stopAt.map(k=>seg[k]), TOTAL=seg[seg.length-1];
function at(d){ d=Math.max(0,Math.min(TOTAL,d)); let i=1; while(i<seg.length-1&&seg[i]<d) i++;
  const t=(d-seg[i-1])/((seg[i]-seg[i-1])||1); return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t, pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t, pts[i][0]-pts[i-1][0]] }

/* ---------- Šaranas iš šono (tas pats kaip dienos suvestinėje) ---------- */
const SEAT={"Kvedaravičius":298,"Modė":234,"Vacys":196,"Deksnys":158,"Simonas":82,"Thūlė":46};
function vanCore(mini){
  return `<path d="M60 21 L262 16 M72 21 L72 27 M250 16 L250 23" fill="none" stroke="#7D86AC" stroke-width="5" stroke-linecap="round"/>
<path d="M6 134 L6 62 Q6 30 36 28 L282 22 Q298 22 308 32 L352 82 L408 96 Q428 101 430 118 L432 132 Q432 140 424 140 L354 140 A32 32 0 0 0 290 140 L124 140 A32 32 0 0 0 60 140 L14 140 Q6 140 6 134 Z" fill="#EEF1F7" stroke="#1f2328" stroke-width="${mini?8:2.5}" stroke-linejoin="round"/>
<path d="M22 46 Q22 39 30 39 L280 33 Q291 33 299 42 L337 86 L22 88 Z" fill="${mini?"#1E2850":"#9bd0f2"}"/>
${mini?"":`<g id="kHeads" clip-path="url(#kWin)">${CREW.map(p=>`<g class="kh" data-p="${p}">${face(p,SEAT[p],66,14.5)}</g>`).join("")}</g>
<path d="M40 82 L68 46 M150 82 L176 44 M214 82 L238 46" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`}
<path d="M104 33 h11 v57 h-11 z M258 30 h10 v60 h-10 z" fill="#EEF1F7"/>
<path d="M334 80 L351 77 L353 89 L338 91 Z" fill="#EEF1F7" stroke="rgba(0,0,0,.3)" stroke-width="2" stroke-linejoin="round"/>
<path d="M10 104 L428 112 M116 92 L116 116 M263 92 L263 138" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="2.5" stroke-linecap="round"/>
<path d="M130 100 h16 M276 100 h16" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="4" stroke-linecap="round"/>
<path d="M410 100 L428 104 Q431 110 429 113 L413 110 Z" fill="#FFF1C4"/>
<rect x="6" y="56" width="7" height="32" rx="2" fill="#FF5A4E"/>
${mini?"":`<rect id="kDoor" x="118" y="37" width="138" height="100" rx="5" fill="#232a47" opacity="0"/>`}
${[92,322].map(x=>`<g transform="translate(${x} 140)"><circle r="26" fill="#14161f"/><g class="kspin"><circle r="13" fill="#A9B0CC"/><path d="M-11 0H11M0 -11V11" fill="none" stroke="#5c6488" stroke-width="2.5" stroke-linecap="round"/></g><circle r="5" fill="#14161f"/></g>`).join("")}`;
}

/* ---------- herojai visu ūgiu: galva ir liemuo iš CHAR, apačioje trumpos kojytės ---------- */
const LEGS={"Simonas":["#f2c9a0","#f8f9fa","#212529"],"Deksnys":["#3b5bdb","#8d5a3b"],"Thūlė":["#f8f9fa","#f1cfae"],"Modė":["#2b3a55","#111"],"Kvedaravičius":["#212529","#000"],"Vacys":["#495057","#f8f9fa"]};
function legs(p){ const [leg,shoe,shorts]=LEGS[p];
  return `<rect x="-25" y="42" width="21" height="21" fill="${leg}"/><rect x="4" y="42" width="21" height="21" fill="${leg}"/>${shorts?`<rect x="-27" y="42" width="54" height="12" fill="${shorts}"/>`:""}
<ellipse cx="-15" cy="64" rx="15" ry="6.5" fill="${shoe}" stroke="rgba(0,0,0,.4)" stroke-width="1.2"/><ellipse cx="15" cy="64" rx="15" ry="6.5" fill="${shoe}" stroke="rgba(0,0,0,.4)" stroke-width="1.2"/>` }
const ghostBody=()=>`<ellipse cx="0" cy="10" rx="60" ry="76" fill="#d0ebff" opacity=".4"/><path d="M-36 44 V70 Q-27 84 -18 72 Q-9 60 0 72 Q9 84 18 72 Q27 60 36 70 V44 Z" fill="#f8f9fa" stroke="#ced4da" stroke-width="1.5"/>`;

/* ---------- miestų siluetai (pagrindas ties y=880) ---------- */
const LAND={
 berlin:`<g class="ks"><rect x="842" y="430" width="14" height="450"/><rect x="846" y="340" width="6" height="100"/><circle cx="849" cy="560" r="40"/><rect x="829" y="602" width="40" height="16"/>
<rect x="640" y="700" width="330" height="40"/><rect x="730" y="662" width="150" height="40"/><path d="M765 662 q40 -52 80 0 z"/><rect x="632" y="860" width="346" height="20"/>${[652,706,760,826,880,934].map(x=>`<rect x="${x}" y="740" width="24" height="120"/>`).join("")}</g>`,
 dresden:`<g class="ks"><path d="M690 880 V770 H730 V730 Q740 650 800 610 Q860 650 870 730 V770 H910 V880 Z"/><rect x="786" y="566" width="28" height="50"/><path d="M782 568 Q800 528 818 568 Z"/><rect x="797" y="512" width="6" height="30"/>
<rect x="960" y="660" width="28" height="220"/><path d="M954 660 L974 580 L994 660 Z"/><rect x="380" y="812" width="1100" height="68"/><path d="M420 812 L450 780 L480 812 Z M560 812 L600 770 L640 812 Z"/></g>`,
 chemnitz:`<g class="ks"><rect x="800" y="500" width="42" height="380"/><rect x="792" y="490" width="58" height="14"/><rect x="900" y="600" width="34" height="280"/><path d="M430 880 V790 L490 750 V790 L550 750 V790 L610 750 V790 L670 750 V880 Z"/><rect x="670" y="800" width="800" height="80"/></g>
${["#e8590c","#f2b705","#2f9e44","#1c7ed6","#ae3ec9"].map((c,i)=>`<rect x="800" y="${540+i*44}" width="42" height="24" fill="${c}" opacity=".85"/>`).join("")}
<g fill="#fff" opacity=".7"><circle cx="832" cy="462" r="24"/><circle cx="870" cy="430" r="32"/><circle cx="922" cy="408" r="26"/></g>`,
 zwickau:`<g class="ks"><rect x="400" y="790" width="1080" height="90"/><path d="M400 790 L450 740 L500 790 Z M510 790 L570 725 L630 790 Z M900 790 L960 735 L1020 790 Z M1010 790 L1050 750 L1090 790 Z"/><rect x="760" y="640" width="70" height="240"/><path d="M752 640 L795 510 L838 640 Z"/><rect x="792" y="480" width="6" height="40"/></g>`,
 plauen:`<g class="ks"><rect x="-500" y="592" width="2000" height="30"/><rect x="700" y="562" width="56" height="30" rx="6"/><rect x="762" y="566" width="80" height="26" rx="5"/><rect x="848" y="566" width="80" height="26" rx="5"/></g>
${[-510,-360,-210,-60,90,240,390,540,690,840,990,1140,1290].map(x=>`<path class="ksl" d="M${x+15} 880 V705 a60 60 0 0 1 120 0 V880" stroke-width="30"/>`).join("")}`,
 hof:`<path class="ks2" d="M-500 880 V800 Q-250 740 0 810 Q200 720 420 800 Q640 720 860 790 Q980 760 1080 800 Q1300 740 1500 800 V880 Z"/>
<g class="ks"><rect x="880" y="700" width="44" height="180"/><circle cx="902" cy="684" r="30"/><path d="M896 660 L902 610 L908 660 Z"/><rect x="800" y="800" width="200" height="80"/><path d="M800 800 L850 760 L900 800 Z"/></g>`,
 bayreuth:`<g class="ks"><rect x="600" y="720" width="400" height="160"/><path d="M580 720 L800 610 L1020 720 Z"/><rect x="740" y="640" width="120" height="90"/><rect x="570" y="712" width="460" height="14"/>${[630,700,770,840,910,970].map(x=>`<rect x="${x}" y="760" width="18" height="120" opacity=".5"/>`).join("")}</g>
<path d="M800 610 V560" stroke="#1f2328" stroke-width="4"/><path d="M800 560 h44 l-10 13 l10 13 h-44 z" fill="#e03131"/>`,
 nurnberg:`<path class="ks2" d="M300 880 Q520 720 760 750 Q960 770 1080 830 Q1300 860 1500 880 Z"/>
<g class="ks"><rect x="640" y="570" width="60" height="200"/><path d="M632 570 L670 505 L708 570 Z"/><rect x="700" y="690" width="260" height="90"/>${[700,740,780,820,860,900,940].map(x=>`<rect x="${x}" y="672" width="20" height="20"/>`).join("")}<rect x="940" y="620" width="50" height="160"/><path d="M932 620 L965 565 L998 620 Z"/></g>`,
 ingolstadt:`<g class="ks"><rect x="740" y="640" width="120" height="240"/><path d="M730 640 L800 515 L870 640 Z"/><rect x="710" y="610" width="26" height="100"/><path d="M704 610 L723 558 L742 610 Z"/><rect x="864" y="610" width="26" height="100"/><path d="M858 610 L877 558 L896 610 Z"/><rect x="420" y="810" width="1060" height="70"/>${[440,520,600,920,1000].map(x=>`<rect x="${x}" y="794" width="30" height="18"/>`).join("")}</g>
<path d="M782 880 V800 a18 18 0 0 1 36 0 V880 Z" fill="#ffd36b" opacity=".75"/>`,
 munchen:`<path class="ks2" d="M-500 880 V760 L-380 700 L-250 770 L-120 690 L0 770 L120 700 L210 760 L330 670 L450 770 L560 710 L690 790 L820 700 L950 780 L1080 730 L1200 790 L1330 700 L1500 780 V880 Z"/>
<g class="ks"><rect x="672" y="590" width="56" height="290"/><rect x="762" y="590" width="56" height="290"/><circle cx="700" cy="584" r="31"/><circle cx="790" cy="584" r="31"/><rect x="696" y="528" width="8" height="32"/><rect x="786" y="528" width="8" height="32"/><path d="M818 720 H1000 V880 H818 Z M818 720 L909 656 L1000 720 Z"/>
<rect x="500" y="700" width="40" height="180"/><path d="M494 700 L520 615 L546 700 Z"/><rect x="420" y="820" width="1060" height="60"/></g>
${[[690,650],[780,650],[690,720],[780,720],[860,780],[930,780],[510,760]].map(([x,y])=>`<rect x="${x}" y="${y}" width="16" height="22" fill="#ffd36b" opacity=".8"/>`).join("")}`
};
/* ---------- daiktai prie sustojimo (tarp Šarano ir krūmų) ---------- */
const tick=ok=>ok?`<path d="M-17 2 l11 12 l22 -26" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`:`<path d="M-14 -14 L14 14 M14 -14 L-14 14" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`;
const pump=ok=>`<g transform="translate(644 1004)"><ellipse cx="0" cy="2" rx="52" ry="9" fill="rgba(0,0,0,.2)"/><rect x="-44" y="-8" width="88" height="12" rx="3" fill="#495057"/>
<rect x="-34" y="-150" width="68" height="144" rx="8" fill="#2f9e44" stroke="#1d6b2d" stroke-width="4"/><rect x="-24" y="-138" width="48" height="34" rx="4" fill="#e7f5ff" stroke="#1d6b2d" stroke-width="2"/>
<text x="0" y="-60" text-anchor="middle" font-size="27" fill="#fff">LPG</text><rect x="-4" y="-176" width="8" height="28" fill="#495057"/>
<g transform="translate(0 -206)"><rect x="-46" y="-32" width="92" height="64" rx="12" fill="${ok?"#2f9e44":"#e03131"}" stroke="#fff" stroke-width="5"/>${tick(ok)}</g></g>`;
const PROP={
 lpgNo:pump(false), lpgYes:pump(true),
 wc:`<g transform="translate(646 1004)"><ellipse cx="0" cy="2" rx="30" ry="7" fill="rgba(0,0,0,.2)"/><rect x="-5" y="-170" width="10" height="170" fill="#868e96"/><rect x="-56" y="-262" width="112" height="100" rx="12" fill="#1c7ed6" stroke="#fff" stroke-width="5"/><text x="0" y="-212" text-anchor="middle" font-size="40" fill="#fff">WC</text><text x="0" y="-178" text-anchor="middle" font-size="27" fill="#ffe066">1 €</text></g>`,
 bayern:`<g transform="translate(646 1004)"><ellipse cx="0" cy="2" rx="30" ry="7" fill="rgba(0,0,0,.2)"/><rect x="-5" y="-160" width="10" height="160" fill="#868e96"/><g transform="translate(0 -214)"><rect x="-64" y="-56" width="128" height="112" rx="12" fill="#fff" stroke="#1971c2" stroke-width="5"/>
${[[-40,-24],[-13,-24],[14,-24],[41,-24],[-27,-4],[0,-4],[27,-4]].map(([x,y])=>`<path d="M${x} ${y-13} l11 13 l-11 13 l-11 -13 z" fill="#4dabf7"/>`).join("")}<rect x="-56" y="18" width="112" height="30" rx="5" fill="#1971c2"/><text x="0" y="41" text-anchor="middle" font-size="23" fill="#fff">BAYERN</text></g></g>`,
 trabi:`<g transform="translate(668 884)"><ellipse cx="0" cy="2" rx="98" ry="7" fill="rgba(0,0,0,.2)"/><path d="M-90 -6 V-34 Q-90 -40 -82 -40 L-52 -42 L-36 -72 Q-33 -78 -26 -78 H36 Q43 -78 46 -72 L60 -42 L82 -40 Q90 -38 90 -30 V-6 Z" fill="#9ad1d4" stroke="#1f2328" stroke-width="3" stroke-linejoin="round"/>
<path d="M-30 -70 H-2 V-44 H-44 Z M6 -70 H34 L48 -44 H6 Z" fill="#e7f5ff" stroke="#1f2328" stroke-width="2"/><circle cx="-52" cy="-6" r="15" fill="#14161f"/><circle cx="-52" cy="-6" r="6" fill="#ced4da"/><circle cx="52" cy="-6" r="15" fill="#14161f"/><circle cx="52" cy="-6" r="6" fill="#ced4da"/><circle cx="86" cy="-28" r="5" fill="#fff3bf" stroke="#1f2328" stroke-width="1.5"/></g>`
};
function hedge(){
  let s=`<ellipse cx="885" cy="1078" rx="215" ry="16" fill="rgba(0,0,0,.18)"/>`;
  [[712,1002,52],[770,988,58],[835,994,60],[900,984,62],[962,992,58],[1022,986,60],[1075,1002,52],[735,1040,46],[800,1046,48],[868,1046,50],[935,1048,48],[1000,1046,50],[1058,1044,46]]
    .forEach(([x,y,r],i)=>s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${["#2b8a3e","#37a04b","#2f9443"][i%3]}"/>`);
  [[740,985],[800,1010],[862,975],[905,1030],[960,1000],[1010,1020],[1050,985],[770,1050],[980,1055]]
    .forEach(([x,y])=>s+=`<path d="M${x} ${y} q8 -12 16 0 q-8 6 -16 0 z" fill="#69c97b" opacity=".8"/>`);
  return s;
}

/* ---------- SVG vidaus stiliai ---------- */
const CSS=`
.kino text{font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-weight:700}
.kino .bf{font-family:'Bricolage Grotesque','Arial Black',system-ui,sans-serif;font-weight:800}
.kino .ks{fill:var(--sil,#6f8fb3)}
.kino .ks2{fill:var(--sil2,#a9c3dd)}
.kino .ksl{fill:none;stroke:var(--sil,#6f8fb3)}
.kino .kland{font-size:29px;letter-spacing:.16em;fill:rgba(31,35,40,.42)}
.kino .kfor{font-size:25px;letter-spacing:.2em;fill:rgba(31,35,40,.3)}
.kino .klb{font-size:31px;fill:#1f2328;paint-order:stroke;stroke:#fffdf8;stroke-width:6px;stroke-linejoin:round}
.kino .kleg{font-size:27px;fill:#4b4f57;font-weight:600}
.kino .kstop{cursor:pointer}
.kino .kstop .kd{fill:#fffdf8;stroke:#1f2328;stroke-width:4px}
.kino .kstop .kn{font-size:20px;fill:#1f2328}
.kino .kstop.done .kd{fill:#F7C948}
.kino .kstop.cur .kd{fill:#d9480f}
.kino .kstop.cur .kn{fill:#fff}
.kino .kring{fill:none;stroke:#d9480f;stroke-width:4px;opacity:0}
.kino .kstop.cur .kring{animation:kRing 1.2s ease-out infinite}
.kino .kcity{font-size:104px;letter-spacing:-.03em;fill:#fff;paint-order:stroke;stroke:rgba(14,20,48,.6);stroke-width:10px;stroke-linejoin:round}
.kino .kcsub{font-size:36px;fill:#fff;paint-order:stroke;stroke:rgba(14,20,48,.6);stroke-width:7px;stroke-linejoin:round}
.kino .kbp{fill:#fffdf8;stroke:#1f2328;stroke-width:4px;stroke-linejoin:round}
.kino .kbt{font-size:36px;fill:#1f2328}
.kino .kbub.g .kbp{fill:#e7f5ff;stroke:#4dabf7}
.kino .kbub.g .kbt{fill:#1864ab;font-style:italic}
.kino .kbub.nav .kbp{fill:#1f2328;stroke:#F7C948}
.kino .kbub.nav .kbt{fill:#F7C948}
.kino .kpop{animation:kPop .28s cubic-bezier(.3,1.6,.5,1)}
.kino .kpss{font-size:34px;fill:#fff;font-style:italic;paint-order:stroke;stroke:#1f2328;stroke-width:6px;stroke-linejoin:round}
.kino .ka,.kino #kVan,.kino #kPudG,.kino #kMeat,.kino .kmug{cursor:pointer}
.kino .kroll .kspin{animation:kSpin .45s linear infinite}
.kino .kfl{animation:kFloat 2.4s ease-in-out infinite}
.kino .kpk{animation:kHop .5s ease-out}
.kino .kstar{animation:kTw 3s ease-in-out infinite}
@keyframes kSpin{to{transform:rotate(360deg)}}
@keyframes kFloat{50%{transform:translateY(-12px)}}
@keyframes kHop{0%{transform:none}35%{transform:translateY(-34px)}62%{transform:none}80%{transform:translateY(-10px)}100%{transform:none}}
@keyframes kPop{0%{transform:scale(.3)}100%{transform:none}}
@keyframes kRing{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(2.4)}}
@keyframes kTw{50%{opacity:.2}}
.kino.kp *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.kino .kstar,.kino .kfl,.kino .kring{animation:none!important}}
`;

/* ---------- trys vaizdai: žemėlapis, sustojimas, baras ---------- */
function mapSvg(){
  const [lx,ly]=P(51.34,12.37);
  let s=`<g id="kMap"><rect width="1080" height="1350" fill="#CFC8B6"/>
<polygon points="${pp(DE)}" fill="#EFE8D6" stroke="#fffdf8" stroke-width="6" stroke-linejoin="round"/>
<polygon points="${pp(BB)}" fill="#F2C6B2" stroke="#fffdf8" stroke-width="4" stroke-linejoin="round"/>
<polygon points="${pp(SN)}" fill="#CDE2B2" stroke="#fffdf8" stroke-width="4" stroke-linejoin="round"/>
<polygon points="${pp(BY)}" fill="#BBD7EE" stroke="#fffdf8" stroke-width="4" stroke-linejoin="round"/>
<circle cx="${XY[0][0]}" cy="${XY[0][1]}" r="34" fill="#E59A83" stroke="#fffdf8" stroke-width="3"/>
<text class="kland" x="560" y="330" text-anchor="middle">BRANDENBURGAS</text>
<text class="kland" x="886" y="470" text-anchor="middle" style="font-size:25px">SAKSONIJA</text>
<text class="kland" x="560" y="930" text-anchor="middle">BAVARIJA</text>
<text class="kfor" transform="translate(1040 300) rotate(90)" text-anchor="middle">LENKIJA</text>
<text class="kfor" x="830" y="760" text-anchor="middle">ČEKIJA</text>
<text class="kfor" x="900" y="1100" text-anchor="middle">AUSTRIJA</text>
<text class="bf" x="48" y="236" font-size="62" fill="#1f2328">Berlynas –</text><text class="bf" x="48" y="300" font-size="62" fill="#1f2328">Miunchenas</text>
<text class="kleg" x="48" y="346">planas: ~590 km ir 6 val.</text><text class="kleg" x="48" y="384">išėjo: ~660 km ir 8 val.</text>
<polyline points="${XY[0].join(",")} ${lx},${ly} ${XY[5].join(",")}" fill="none" stroke="#868e96" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16"/>
<polyline points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#1f2328" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#F7C948" stroke-width="3" stroke-dasharray="10 10"/>
<polyline id="kProg" points="${pts.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#d9480f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${TOTAL.toFixed(1)}" stroke-dashoffset="${TOTAL.toFixed(1)}"/>
<g transform="translate(${lx} ${ly})"><circle r="14" fill="#fffdf8" stroke="#868e96" stroke-width="4" stroke-dasharray="6 5"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#e03131" stroke-width="4" stroke-linecap="round"/><text class="klb" x="-24" y="9" text-anchor="end" style="fill:#868e96">Leipcigas</text></g>
<g transform="translate(48 1040)"><path d="M0 0 H56" stroke="#868e96" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16"/><text class="kleg" x="70" y="9">planas: per Leipcigą</text>
<path d="M0 38 H56" stroke="#1f2328" stroke-width="11" stroke-linecap="round"/><path d="M0 38 H56" stroke="#F7C948" stroke-width="3" stroke-dasharray="8 8"/><text class="kleg" x="70" y="48">kaip išėjo</text>
<text x="14" y="88" font-size="24">⛽</text><text class="kleg" x="70" y="87">dujų paieškos</text></g>`;
  STOPS.forEach((st,i)=>{ if(st.via){ const v=st.via[st.via.length-1]; s+=`<text x="${v[0]}" y="${v[1]+9}" font-size="24" text-anchor="middle">⛽</text>` } });
  STOPS.forEach((st,i)=>{ const [x,y]=XY[i];
    s+=`<g class="kstop" data-i="${i}" transform="translate(${x} ${y})" role="button" aria-label="${esc(st.n)}"><circle class="kring" r="18"/><circle class="kd" r="18"/><text class="kn" y="7" text-anchor="middle">${i+1}</text><text class="klb" x="${st.lb[0]}" y="${st.lb[1]}" text-anchor="${st.lb[2]}">${esc(st.n)}</text></g>` });
  s+=`<g id="kCar"><ellipse cx="0" cy="31" rx="30" ry="8" fill="rgba(0,0,0,.25)"/><circle r="34" fill="#fffdf8" stroke="#1f2328" stroke-width="4"/><g id="kCarF"><g transform="translate(-28 -12) scale(.128)">${vanCore(true)}</g></g>
<g class="kfl"><g transform="translate(32 -42) scale(.4)" opacity=".85">${ghostBody()}${CHAR[GHOST]()}</g></g></g></g>`;
  return s;
}
function sceneSvg(){
  let stars=""; for(let i=0;i<34;i++) stars+=`<circle class="kstar" cx="${(i*197+61)%1080}" cy="${110+(i*131+17)%520}" r="${(1.6+(i%3)*.8).toFixed(1)}" fill="#F4F1EA" opacity=".8" style="animation-delay:${((i%7)*.4).toFixed(1)}s"/>`;
  return `<g id="kScene" style="display:none">
<rect width="1080" height="1350" fill="url(#kSkyG)"/>
<g id="kStars">${stars}</g>
<circle id="kOrb" cx="930" cy="220" r="52" fill="#ffe066"/>
<g id="kCam">
<g id="kLand"></g>
<rect id="kGrass" x="-700" y="880" width="2500" height="1100" fill="#86c260"/>
<path d="M-700 962 H640 Q700 962 700 1012 V1090 Q700 1140 640 1140 H-700 Z" fill="#5d6470"/>
<path d="M-680 1128 H620" stroke="#fffdf8" stroke-width="5" stroke-dasharray="40 30" opacity=".5"/>
<g id="kProps"></g>
<g id="kVan"><g id="kVanB"><g id="kVanH"><ellipse cx="219" cy="168" rx="214" ry="7" fill="rgba(0,0,0,.25)"/><polygon id="kBeam" points="430,104 800,24 800,196 430,116" fill="#FFF1C4" opacity=".4" style="display:none"/>${vanCore(false)}</g></g></g>
<path id="kHose" d="M680 892 Q640 1010 566 938" fill="none" stroke="#212529" stroke-width="8" stroke-linecap="round" style="display:none"/>
<g id="kAct"></g>
<g id="kHedge">${hedge()}</g>
<path id="kTr" d="M868 1074 q-16 20 6 36" fill="none" stroke="#f3df63" stroke-width="10" stroke-linecap="round" opacity="0"/>
<g id="kPudG" transform="translate(880 1124) scale(0)"><ellipse rx="180" ry="30" fill="#f3df63" stroke="#c9b23a" stroke-width="3"/><ellipse cx="-50" cy="-8" rx="46" ry="6" fill="#fff" opacity=".55"/></g>
</g>
<rect id="kShade" width="1080" height="1350" fill="#0b1030" opacity="0" pointer-events="none"/>
<g id="kCam2"><g id="kGl"></g><g id="kPss"></g></g>
<text id="kCity" class="bf kcity" x="54" y="238"></text><text id="kCSub" class="kcsub" x="58" y="292"></text>
</g>`;
}
const BARX=[85,220,355,725,860,995], MUGX=[47,182,317,763,898,1033], BARY=858, BARS=1.7, TBL=938;
function mugSvg(){ return `<path d="M24 -62 q30 0 30 24 q0 24 -30 24" fill="none" stroke="#e9ecef" stroke-width="10"/><rect x="-26" y="-80" width="52" height="80" rx="8" fill="#f2b632" stroke="#e9ecef" stroke-width="5"/><path d="M-14 -58 v40 M0 -58 v40 M14 -58 v40" stroke="#f8d477" stroke-width="5" stroke-linecap="round"/><path d="M-31 -74 q0 -20 16 -16 q6 -14 20 -6 q18 -8 26 8 q6 14 -6 14 z" fill="#fff"/>` }
function barSvg(){
  let bunt=""; for(let i=0;i<19;i++){ const x=6+i*57, y=Math.round(540+Math.sin(i/18*Math.PI)*36); bunt+=`<path d="M${x} ${y} h28 l-14 42 z" fill="${i%2?"#fffdf8":"#1c7ed6"}"/>` }
  const lamp=x=>`<g transform="translate(${x} 0)"><path d="M0 0 V376" stroke="#2b1a0e" stroke-width="6"/><circle cy="420" r="110" fill="#ffd36b" opacity=".2"/><path d="M-54 424 Q0 356 54 424 Z" fill="#2b1a0e"/><ellipse cy="428" rx="36" ry="12" fill="#ffe59a"/></g>`;
  let planks=""; for(let x=90;x<1080;x+=124) planks+=`<path d="M${x} 746 V960" stroke="#3a2412" stroke-width="3" opacity=".5"/>`;
  return `<g id="kBar" style="display:none">
<rect width="1080" height="1350" fill="#6a4426"/>
<path d="M0 0 H1080 V560 Q810 300 540 560 Q270 300 0 560 Z" fill="#f1e2bf"/>
<path d="M0 560 Q270 300 540 560 Q810 300 1080 560" fill="none" stroke="#b9895c" stroke-width="10"/>
<g fill="none" stroke="#7fa36b" stroke-width="6" stroke-linecap="round"><path d="M270 150 q50 50 0 110 q-50 -60 0 -110 M210 250 q60 -10 60 40 M330 250 q-60 -10 -60 40"/><path d="M810 150 q50 50 0 110 q-50 -60 0 -110 M750 250 q60 -10 60 40 M870 250 q-60 -10 -60 40"/></g>
<circle cx="270" cy="205" r="12" fill="#c92a2a"/><circle cx="810" cy="205" r="12" fill="#c92a2a"/>
${lamp(270)}${lamp(810)}
<path d="M0 534 Q540 614 1080 534" fill="none" stroke="#3a2412" stroke-width="3"/>${bunt}
<rect y="740" width="1080" height="610" fill="#52331c"/><path d="M0 740 H1080" stroke="#3a2412" stroke-width="8"/>${planks}
<g id="kBarAct"></g>
<rect x="-20" y="${TBL}" width="1120" height="76" fill="#d39a58" stroke="#8a5a2b" stroke-width="4"/><path d="M0 ${TBL+26} H1080 M0 ${TBL+52} H1080" stroke="#b97f42" stroke-width="3" opacity=".6"/>
<rect x="-20" y="${TBL+74}" width="1120" height="90" fill="#a8703a" stroke="#8a5a2b" stroke-width="4"/>
<rect y="${TBL+164}" width="1080" height="400" fill="#3a2412"/>
<g id="kKarka" transform="translate(540 ${TBL+56}) scale(1.2)"><ellipse cx="0" cy="6" rx="122" ry="21" fill="#f8f9fa" stroke="#ced4da" stroke-width="3"/><ellipse cx="0" cy="3" rx="92" ry="12" fill="#e9ecef"/>
<g id="kBone" transform="rotate(-30)"><rect x="30" y="-96" width="116" height="24" rx="12" fill="#f3ead7" stroke="#cdbf9f" stroke-width="3"/><circle cx="148" cy="-94" r="15" fill="#f3ead7" stroke="#cdbf9f" stroke-width="3"/><circle cx="148" cy="-74" r="15" fill="#f3ead7" stroke="#cdbf9f" stroke-width="3"/><rect x="120" y="-93" width="26" height="18" fill="#f3ead7"/></g>
<g id="kMeat"><path d="M-104 -6 Q-124 -84 -58 -122 Q8 -156 74 -114 Q122 -80 104 -16 Q56 8 0 6 Q-66 8 -104 -6 Z" fill="#a8581f" stroke="#6f3610" stroke-width="4" stroke-linejoin="round"/>
<path d="M-76 -58 Q-40 -112 36 -106" fill="none" stroke="#d98a3d" stroke-width="10" stroke-linecap="round" opacity=".85"/><path d="M-58 -26 l28 -66 M-20 -16 l28 -76 M22 -14 l26 -68 M60 -22 l18 -50" fill="none" stroke="#6f3610" stroke-width="4" stroke-linecap="round"/>
<g transform="rotate(10)"><rect x="-9" y="-222" width="18" height="70" rx="7" fill="#3b2a1a"/><path d="M-6 -152 H6 V-86 L0 -66 L-6 -86 Z" fill="#dee2e6" stroke="#868e96" stroke-width="2"/></g></g></g>
<g id="kMugs">${MUGX.map((x,i)=>`<g class="kmug" data-i="${i}">${mugSvg()}</g>`).join("")}</g>
<g id="kBarGl"></g>
</g>`;
}
box.insertAdjacentHTML("afterbegin",`<svg xmlns="${NS}" id="kinoSvg" class="kino kp" viewBox="0 0 1080 1350" role="img" aria-label="Filmukas: Šaranas važiuoja iš Berlyno į Miuncheną"><style>${CSS}</style>
<defs><linearGradient id="kSkyG" x1="0" y1="0" x2="0" y2="1"><stop id="kSky0" offset="0" stop-color="#7cc6f7"/><stop id="kSky1" offset=".72" stop-color="#e3f4ff"/></linearGradient>
<clipPath id="kWin"><path d="M22 46 Q22 39 30 39 L280 33 Q291 33 299 42 L337 86 L22 88 Z"/></clipPath></defs>
${mapSvg()}${sceneSvg()}${barSvg()}<g id="kBub"></g><rect id="kFade" width="1080" height="1350" fill="#0E1430" opacity="0" pointer-events="none"/></svg>`);

const svg=$("kinoSvg"), mapG=$("kMap"), sceneG=$("kScene"), barG=$("kBar"), bubL=$("kBub"), pssL=$("kPss"), fade=$("kFade");
const van=$("kVan"), vanB=$("kVanB"), vanH=$("kVanH"), car=$("kCar");
const capEl=$("kinoCap"), cover=$("kinoCover"), askEl=$("kinoAsk"), fxEl=$("kinoFx");
function mk(p,ghost){ const g=document.createElementNS(NS,"g"); g.setAttribute("class","ka"); g.dataset.p=p;
  g.innerHTML=`<g class="kw${ghost?" kfl":""}"><g class="kin"${ghost?' opacity=".7"':""}>${ghost?ghostBody():legs(p)}${CHAR[p]()}</g></g>`;
  return {p,el:g,w:g.firstChild,inn:g.firstChild.firstChild,x:0,y:0,s:1,ghost:!!ghost} }
const AC={}; CREW.forEach(p=>{ AC[p]=mk(p); $("kAct").appendChild(AC[p].el) });
const G=mk(GHOST,true); $("kGl").appendChild(G.el);

/* ---------- laikas: visi judesiai eina per vieną laikrodį, todėl veikia pauzė ir peršokimas ---------- */
const E={lin:p=>p, io:p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2, out:p=>1-Math.pow(1-p,3), inn:p=>p*p*p};
const CANCEL={};
let playing=false, visible=true, started=false, vt=0, last=0, raf=0, stage=0, view="map", puddles=0, lpg=0, km=0, askNo=null;
const tweens=new Set();
function frame(t){ raf=0; if(!playing||!visible) return; const dt=Math.min(50,t-last); last=t; vt+=dt*SPEED;
  tweens.forEach(w=>{ const p=w.dur>0?Math.min(1,(vt-w.t0)/w.dur):1;
    try{ if(w.fn) w.fn(w.ease(p),p) }catch(e){ tweens.delete(w); w.no(e); return }
    if(p>=1){ tweens.delete(w); w.ok() } });
  raf=requestAnimationFrame(frame) }
function kick(){ svg.classList.toggle("kp",!(playing&&visible)); if(playing&&visible&&!raf){ last=performance.now(); raf=requestAnimationFrame(frame) } }
function tw(dur,fn,ease){ return new Promise((ok,no)=>tweens.add({t0:vt,dur,fn,ease:ease||E.io,ok,no})) }
const wait=ms=>tw(ms);
const bg=p=>{ p.catch(()=>{}) };
function cancel(){ const old=[...tweens]; tweens.clear(); old.forEach(w=>w.no(CANCEL)); if(askNo){ const f=askNo; askNo=null; f(CANCEL) } askEl.hidden=true }

/* ---------- pagalbininkai ---------- */
const CAMV=[352,905,1.42], CAMB=[862,935,1.42], CAMW=[540,800,1];
let cam={x:540,y:800,z:1};
function setCam(x,y,z){ cam={x,y,z}; const t=`translate(${(540-x*z).toFixed(1)} ${(800-y*z).toFixed(1)}) scale(${z.toFixed(3)})`; $("kCam").setAttribute("transform",t); $("kCam2").setAttribute("transform",t) }
const camTo=(c,dur)=>{ const o=cam; return tw(dur,e=>setCam(o.x+(c[0]-o.x)*e,o.y+(c[1]-o.y)*e,o.z+(c[2]-o.z)*e)) };
const scr=(x,y)=>view==="scene"?[540+(x-cam.x)*cam.z,800+(y-cam.y)*cam.z]:[x,y];
const CS=1.45, VX=0, VY=786, VS=1.35, DOORX=VX+187*VS, DOORY=VY+92*VS, GX=216, GY=VY-66;
const SPOT=[[548,948],[462,940],[376,950],[290,942],[204,950],[118,944]], BX=[722,786,850,914,978,1040], BYY=886;
function setPos(a,x,y,s){ a.x=x; a.y=y; if(s!=null) a.s=s; a.el.setAttribute("transform",`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${a.s})`) }
function rock(a,deg,dy){ a.inn.setAttribute("transform",`translate(0 ${dy.toFixed(1)}) rotate(${deg.toFixed(1)})`) }
const show=(a,on)=>{ a.el.style.display=on?"":"none" };
const headIn=(p,on)=>{ const h=svg.querySelector(`.kh[data-p="${p}"]`); if(h) h.style.display=on?"":"none" };
function setVan(x,tilt,dy){ van._x=x; van.setAttribute("transform",`translate(${x.toFixed(1)} ${VY}) scale(${VS})`); vanB.setAttribute("transform",`translate(0 ${(dy||0).toFixed(1)}) rotate(${(tilt||0).toFixed(2)} 322 166)`) }
const door=o=>$("kDoor").setAttribute("opacity",o);
function setPud(k){ $("kPudG").setAttribute("transform",`translate(880 1124) scale(${k.toFixed(3)})`); $("kTr").setAttribute("opacity",Math.min(1,k*3).toFixed(2)) }
function setView(v){ view=v; mapG.style.display=v==="map"?"":"none"; sceneG.style.display=v==="scene"?"":"none"; barG.style.display=v==="bar"?"":"none"; bubL.innerHTML="" }
async function cut(v){ if(view===v) return; await tw(170,e=>fade.setAttribute("opacity",e.toFixed(2)),E.lin); setView(v); await tw(210,e=>fade.setAttribute("opacity",(1-e).toFixed(2)),E.lin) }
function cap(t){ capEl.innerHTML=t?`<span>${esc(t)}</span>`:"" }
function hud(){ $("kHudP").textContent=puddles; $("kHudL").textContent=lpg; $("kHudK").textContent=Math.round(km) }
function fxBurst(ux,uy,em,n){ const k=box.clientWidth/W; if(!k) return; [ux,uy]=scr(ux,uy);
  for(let i=0;i<(n||6);i++){ const e=document.createElement("span"), a=-Math.PI/2+(Math.random()-.5)*2.4, d=(150+Math.random()*170)*k;
    e.className="suv-em"; e.textContent=em; e.style.left=ux*k+"px"; e.style.top=uy*k+"px"; e.style.fontSize=Math.max(16,52*k)+"px"; e.style.animationDelay=i*40+"ms";
    e.style.setProperty("--dx",Math.cos(a)*d+"px"); e.style.setProperty("--dy",Math.sin(a)*d+"px"); e.style.setProperty("--r",(Math.random()*90-45)+"deg");
    e.addEventListener("animationend",()=>e.remove()); fxEl.appendChild(e) } }
function bubble(x,y,txt,cls){ [x,y]=scr(x,y); const g=document.createElementNS(NS,"g"); g.setAttribute("class","kbub "+(cls||""));
  g.innerHTML=`<g class="kpop"><path class="kbp"/><text class="kbt" text-anchor="middle">${esc(txt)}</text></g>`; bubL.appendChild(g);
  const t=g.querySelector("text"); let w=0; try{ w=t.getComputedTextLength() }catch(e){} if(!w) w=txt.length*20; w+=52;
  const h=72, cx=Math.max(w/2+12,Math.min(W-w/2-12,x)), tx=Math.max(-w/2+30,Math.min(w/2-30,x-cx)), l=-w/2, r=w/2, tp=-h-20, b=-20, R=24;
  y=Math.max(h+34,y);
  g.querySelector("path").setAttribute("d",`M${l+R} ${tp}H${r-R}A${R} ${R} 0 0 1 ${r} ${tp+R}V${b-R}A${R} ${R} 0 0 1 ${r-R} ${b}H${tx+13}L${tx} 0L${tx-13} ${b}H${l+R}A${R} ${R} 0 0 1 ${l} ${b-R}V${tp+R}A${R} ${R} 0 0 1 ${l+R} ${tp}Z`);
  t.setAttribute("y",(tp+h/2+13).toFixed(0)); g.setAttribute("transform",`translate(${cx.toFixed(0)} ${y.toFixed(0)})`); return g }
async function sayAt(x,y,txt,ms,cls){ const b=bubble(x,y,txt,cls); try{ await wait(ms||1300) } finally{ b.remove() } }
const say=(a,txt,ms,cls)=>sayAt(a.x,a.y-56*a.s,txt,ms,(a.ghost?"g ":"")+(cls||""));
async function walk(a,x,y,dur){ const x0=a.x,y0=a.y,n=Math.max(2,Math.round(Math.hypot(x-x0,y-y0)/52));
  await tw(dur,(e,p)=>{ setPos(a,x0+(x-x0)*p,y0+(y-y0)*p); const ph=p*n*Math.PI; rock(a,Math.sin(ph)*9,-Math.abs(Math.sin(ph))*12) },E.lin); rock(a,0,0) }
async function hop(a,x,y,h,dur,s1){ const x0=a.x,y0=a.y,s0=a.s; if(s1==null) s1=s0;
  await tw(dur,(e,p)=>setPos(a,x0+(x-x0)*p,y0+(y-y0)*p-Math.sin(p*Math.PI)*h,s0+(s1-s0)*p),E.lin) }
const floatTo=(a,x,y,dur)=>{ const x0=a.x,y0=a.y; return tw(dur,e=>setPos(a,x0+(x-x0)*e,y0+(y-y0)*e)) };
function hopAll(){ CREW.forEach((p,k)=>setTimeout(()=>{ const w=AC[p].w; w.classList.remove("kpk"); w.getBoundingClientRect(); w.classList.add("kpk") },k*60)) }
function floaty(x,y,txt,dy,dur){ const t=document.createElementNS(NS,"text"); t.setAttribute("class","kpss"); t.setAttribute("text-anchor","middle"); t.textContent=txt; pssL.appendChild(t);
  return tw(dur,(e,p)=>{ t.setAttribute("x",x); t.setAttribute("y",(y+dy*e).toFixed(1)); t.setAttribute("opacity",(p<.15?p/.15:p>.7?(1-p)/.3:1).toFixed(2)) },E.out).then(()=>t.remove(),e=>{ t.remove(); throw e }) }

/* ---------- žemėlapio būsena ---------- */
function mapState(i,d){ const [x,y,dx]=at(d); car.setAttribute("transform",`translate(${x.toFixed(1)} ${y.toFixed(1)})`); car._x=x; car._y=y;
  if(dx) $("kCarF").setAttribute("transform",dx<0?"scale(-1 1)":"");
  $("kProg").setAttribute("stroke-dashoffset",(TOTAL-d).toFixed(1));
  svg.querySelectorAll(".kstop").forEach((g,k)=>{ g.classList.toggle("done",k<i); g.classList.toggle("cur",k===i) }) }

/* ---------- sustojimo paruošimas ---------- */
function prep(i){ const s=STOPS[i], k=SKY[s.sky];
  $("kSky0").setAttribute("stop-color",k[0]); $("kSky1").setAttribute("stop-color",k[1]);
  sceneG.style.setProperty("--sil",k[2]); sceneG.style.setProperty("--sil2",k[3]);
  $("kShade").setAttribute("opacity",k[4]); $("kGrass").setAttribute("fill",k[5]);
  $("kStars").style.display=s.sky>=5?"":"none"; $("kBeam").style.display=s.sky>=4?"":"none";
  const o=$("kOrb"); o.setAttribute("cx",k[6][0]); o.setAttribute("cy",k[6][1]); o.setAttribute("r",k[6][2]); o.setAttribute("fill",k[6][3]);
  $("kLand").innerHTML=LAND[s.id]||""; $("kProps").innerHTML=PROP[s.prop]||""; $("kHose").style.display="none";
  $("kCity").textContent=s.n.toUpperCase(); $("kCSub").textContent=`${s.land} · ${i?"~"+s.km+" km":"startas"} · sustojimas ${i+1} iš ${N}`;
  pssL.innerHTML=""; setPud(0); door(0); van.classList.remove("kroll"); setCam(...CAMW);
  CREW.forEach(p=>{ const a=AC[p]; $("kAct").appendChild(a.el); show(a,false); rock(a,0,0); headIn(p,true); setPos(a,0,0,CS) });
  $("kGl").appendChild(G.el); show(G,true); setVan(-680,0,0); setPos(G,-680+GX,GY,1.25);
  km=s.km; hud() }
const order=i=>CREW.map((_,k)=>CREW[(k+i)%CREW.length]);

/* ---------- bendra choreografija ---------- */
async function arrive(){ van.classList.add("kroll");
  await tw(1150,e=>{ const x=-680+(VX+680)*e; setVan(x,0,0); setPos(G,x+GX,GY) },E.out);
  van.classList.remove("kroll"); await tw(280,(e,p)=>setVan(VX,Math.sin(p*Math.PI)*1.5,0),E.lin) }
async function exitAll(ord){ door(1); bg(camTo(CAMV,650));
  await Promise.all(ord.map((p,k)=>wait(k*170).then(async()=>{ const a=AC[p]; headIn(p,false); setPos(a,DOORX,DOORY,.75); show(a,true);
    await hop(a,SPOT[k][0],SPOT[k][1],78,430,CS); await tw(160,(e,q)=>rock(a,0,Math.sin(q*Math.PI)*7),E.lin); rock(a,0,0) }))) }
async function toBush(ord){ bg(floatTo(G,884,700,1200)); bg(camTo(CAMB,1250));
  await Promise.all(ord.map((p,k)=>wait(k*90).then(()=>walk(AC[p],BX[5-k],BYY+(k%2)*8,1050+k*40)))) }
async function pee(i,s){ const size=.5+.05*i, words=s.notes?["♪","♫","la-laaa","♪"]:["pššš","čiurrr","pšššš","aaach"];
  const fl=[0,1,2,3].map(k=>wait(k*260).then(()=>floaty(740+k*88,s.notes?930:1010,words[k],s.notes?-170:-120,1300)));
  bg(wait(500).then(()=>say(G,s.sky>=5?"Aš jums pašviesiu, uuuu…":rnd(["Man nereikia. Aš dvasia.","Aš palauksiu čia, uuuu…","Dvasios krūmų nelanko"]),1500)));
  await Promise.all([tw(1900,e=>setPud(size*e),E.out),...fl]);
  puddles++; hud(); fxBurst(880,1090,"💧",5) }
async function fromBush(ord){ bg(floatTo(G,VX+GX,GY,1100)); bg(camTo(CAMV,1100));
  await Promise.all(ord.map((p,k)=>wait((5-k)*70).then(()=>walk(AC[p],SPOT[k][0],SPOT[k][1],900+k*30)))) }
async function enterAll(ord){ door(1);
  await Promise.all(ord.map((p,k)=>wait((5-k)*150).then(async()=>{ const a=AC[p]; await hop(a,DOORX,DOORY,70,330,.75); show(a,false); headIn(p,true) })));
  door(0) }
async function leave(){ $("kHose").style.display="none"; bg(camTo(CAMW,520)); await floatTo(G,VX+GX,GY,300);
  bg(sayAt(VX+520,VY+20,"PYP PYYYP!",700)); await tw(240,(e,p)=>setVan(VX,0,-Math.sin(p*Math.PI)*12),E.lin);
  van.classList.add("kroll"); fxBurst(60,1000,"💨",3);
  await tw(950,e=>{ const x=VX+1180*e; setVan(x,-1.2*e,0); setPos(G,x+GX,GY) },E.inn); van.classList.remove("kroll") }

/* ---------- kiekvieno sustojimo pokštas ---------- */
const refuel=async(who,txt)=>{ $("kHose").style.display=""; bg(Promise.all([0,1,2].map(k=>wait(k*300).then(()=>floaty(600+k*26,900,"glu",-90,900))))); await say(AC[who],txt,1400) };
const TW={
 dresden:async()=>{ await say(AC["Modė"],"WC kainuoja 1 €?!",1300); await say(AC["Vacys"],"Krūmai nemokami",1200) },
 chemnitz:async()=>{ const d=AC["Deksnys"],x0=d.x,y0=d.y; await walk(d,600,972,650); await say(d,"LPG kolonėlės nėra!",1400); bg(say(AC["Kvedaravičius"],"Ieškom toliau",1100)); await walk(d,x0,y0,600) },
 zwickau:async()=>{ await say(AC["Simonas"],"O, Trabantas!",1200); await say(AC["Thūlė"],"Mano jaunystė!",1200) },
 plauen:()=>refuel("Deksnys","LPG yra! Pilam!"),
 hof:async()=>{ hopAll(); await say(AC["Modė"],"Grüß Gott, Bavarija!",1400) },
 bayreuth:async()=>{ await say(AC["Thūlė"],"Vagneris? KIJA!",1300) },
 nurnberg:()=>refuel("Vacys","Vėl dujos. Optimizuojam."),
 ingolstadt:async()=>{ await say(G,"Tamsoje aš gražesnis, uuuu…",1500) },
 munchen:async()=>{ hopAll(); fxBurst(540,820,"🎉",10); await say(AC["Kvedaravičius"],"MES MIUNCHENE!",1400) }
};
async function stopScene(i){ const s=STOPS[i], ord=order(i); prep(i); await cut("scene"); cap(s.cap[0]);
  await arrive(); await wait(350); await exitAll(ord);
  if(s.lpg){ lpg++; hud() }
  if(TW[s.id]) await TW[s.id]();
  cap(s.cap[1]); await toBush(ord); await pee(i,s);
  cap(s.cap[2]); await wait(600); await fromBush(ord);
  if(i===N-1){ hopAll(); fxBurst(330,880,"🍻",8); await wait(1300); return }
  await enterAll(ord); await leave() }
async function startScene(){ const s=STOPS[0], ord=order(0); prep(0); setVan(VX,0,0);
  ord.forEach((p,k)=>{ const a=AC[p]; headIn(p,false); setPos(a,SPOT[k][0],SPOT[k][1],CS); show(a,true) }); setPos(G,700,-200,1.25);
  await cut("scene"); cap(s.cap[0]); await wait(1500); await camTo(CAMV,800); await wait(700);
  cap(s.cap[1]); await floatTo(G,600,660,1100); await say(G,"Aš irgi važiuoju! Kaip dvasia.",1900);
  bg(floatTo(G,VX+GX,GY,1000)); await enterAll(ord);
  cap(s.cap[2]); await sayAt(VX+470,VY+10,"🧭 Važiuokite per Leipcigą",1900,"nav");
  await leave() }
function ask(q,opts,ms){ return new Promise((ok,no)=>{ askNo=no;
  askEl.innerHTML=`<div>${esc(q)}</div>`+opts.map((o,k)=>`<button type="button" data-k="${k}"${k?' class="ghost"':""}>${esc(o)}</button>`).join(""); askEl.hidden=false;
  const done=k=>{ if(askNo!==no) return; askNo=null; askEl.hidden=true; ok(k) };
  askEl.onclick=e=>{ const b=e.target.closest("button"); if(b) done(+b.dataset.k) };
  wait(ms).then(()=>done(-1),()=>{}) }) }
async function choose(){ setView("map"); mapState(0,0); cap("Navigacija siūlo važiuoti per Leipcigą.");
  const k=await ask("Kur sukam?",["Per Leipcigą, kaip sako navigacija","Per Drezdeną"],9000);
  cap(k===0?"Sukam į Leipcigą… bet vairas kažkodėl pats pasuko į Drezdeną. 🤷":k===1?"Taip ir padarėm. Kodėl? Niekas nežino. 🤷":"Kol galvojom, maršrute kažkokiu būdu atsirado Drezdenas. 🤷");
  await wait(2000) }
async function drive(i){ const a=STOPS[i], b=STOPS[i+1], d0=CUM[i], d1=CUM[i+1];
  await cut("map"); mapState(i+1,d0); cap(`${a.n} → ${b.n}`);
  if(b.road) bg(wait(500).then(()=>sayAt(car._x,car._y-46,b.road,1500)));
  await tw(1500+(d1-d0)*4.5,e=>{ mapState(i+1,d0+(d1-d0)*e); km=a.km+(b.km-a.km)*e; hud() });
  if(b.land!==a.land){ cap(`Nauja žemė: ${b.land}!`); fxBurst(car._x,car._y,b.land==="Bavarija"?"🥨":"🏰",6); await wait(900) } else await wait(350) }

/* ---------- finalas: karka alaus bare ---------- */
function setMug(i,dy,rot){ const m=svg.querySelector(`.kmug[data-i="${i}"]`); m.setAttribute("transform",`translate(${MUGX[i]} ${(TBL+62+dy).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${i<3?-.82:.82} .82)`) }
const cheers=()=>tw(1000,(e,p)=>{ const u=Math.sin(p*Math.PI); MUGX.forEach((x,i)=>setMug(i,-170*u,(i<3?16:-16)*u)) },E.lin).then(()=>fxBurst(540,700,"🍻",7));
let bites=0;
function setMeat(){ $("kMeat").setAttribute("transform",`scale(${[1,.78,.52,0][bites]})`); $("kMeat").style.display=bites>=3?"none":""; $("kBone").setAttribute("transform",bites>=3?"translate(-88 66) rotate(-6)":"rotate(-30)") }
async function barScene(){ ord0().forEach((p,k)=>{ const a=AC[p]; $("kBarAct").appendChild(a.el); rock(a,0,0); setPos(a,BARX[k],BARY,BARS); show(a,true) });
  $("kBarGl").appendChild(G.el); show(G,true); setPos(G,540,610,1.3); MUGX.forEach((x,i)=>setMug(i,0,0)); bites=0; setMeat(); km=660; hud();
  await cut("bar"); cap("Dienos finalas: kiaulės koja, kitaip karka, Miuncheno alaus bare."); await wait(1500);
  bg(say(AC["Simonas"],"Čia tai baltymai!",1500)); await wait(2000);
  cap("Tame pačiame, kur kadaise iškilo Hitleris. Mes iškėlėm tik bokalus. 🍻"); await wait(700);
  bg(say(AC["Modė"],"Prost!",1300)); bg(say(AC["Vacys"],"Prost!",1300)); await cheers(); await wait(1900);
  cap("Jam viskas baigėsi blogai. Šįvakar blogai baigėsi tik karkai. 🍖");
  for(let k=0;k<3;k++){ await wait(800); bite(true) }
  await say(G,"Man tik kvapą, uuuu…",1900); await wait(700) }
const ord0=()=>["Simonas","Thūlė","Deksnys","Kvedaravičius","Modė","Vacys"];
function endCard(){ playing=false; stage=N+1; cap("");
  cover.innerHTML=`<div class="kc-k">2 DIENOS PABAIGA</div><div class="kc-t">Mes Miunchene! 🍻</div>
<div class="kc-list"><span>~660 km vietoj 590</span><span>8 val. vietoj 6</span><span>3 žemės</span><span>💧 ${N-1} balos</span><span>⛽ 3 dujų paieškos</span><span>🍖 1 karka</span><span>👻 1 dvasia</span></div>
<div class="kc-s">Išvada: Vokietija didelė, autobanai greiti, bet kelionės planą kartais sudarinėja ne navigacija, o dujų kolonėlės ir žmogaus fiziologija. 😂</div>
<button type="button" class="kc-play" id="kinoStart">🔁 Žiūrėti dar kartą</button>`;
  cover.hidden=false; ui(); kick() }

/* ---------- eiga ---------- */
async function main(from){ try{
    for(let i=from;i<N;i++){ stage=i; puddles=Math.max(0,i-1); lpg=STOPS.slice(1,i).filter(s=>s.lpg).length; km=STOPS[i].km; hud(); mapState(i,CUM[i]);
      await (i===0?startScene():stopScene(i)); if(i<N-1){ if(i===0) await choose(); await drive(i) } }
    if(from<=N){ stage=N; puddles=N-1; lpg=3; mapState(N,TOTAL); await barScene() }
    endCard();
  }catch(e){ if(e!==CANCEL) console.error(e) } }
function go(i){ cancel(); started=true; cover.hidden=true; fade.setAttribute("opacity",0); bubL.innerHTML=""; pssL.innerHTML=""; fxEl.innerHTML=""; playing=true; ui(); kick(); main(i) }
function ui(){ $("kinoPlay").textContent=!started||stage>N?"▶ Paleisti":playing?"⏸ Pauzė":"▶ Tęsti" }

/* ---------- bakstelėjimai ---------- */
function quip(a,txt){ const b=bubble(a.x,a.y-56*a.s,txt,a.ghost?"g":""); setTimeout(()=>b.remove(),1500) }
function poke(a){ if(a.ghost){ quip(a,rnd(LINES[GHOST])); hopAll(); return }
  a.w.classList.remove("kpk"); a.w.getBoundingClientRect(); a.w.classList.add("kpk"); quip(a,rnd(LINES[a.p])) }
function honk(){ vanH.classList.remove("kpk"); vanH.getBoundingClientRect(); vanH.classList.add("kpk"); const b=bubble((van._x||0)+520,VY+20,rnd(["PYP PYYYP!","PYYYP!","VAROM!"])); setTimeout(()=>b.remove(),900) }
function bite(auto){ if(bites>=3){ if(!auto) fxBurst(540,960,"🦴",3); return } bites++; setMeat(); fxBurst(540,920,"🍖",4);
  const b=bubble(540,800,bites>=3?"Liko tik kaulas":"Om nom nom"); setTimeout(()=>b.remove(),900) }
svg.addEventListener("click",e=>{ const t=e.target; let g;
  if(g=t.closest(".kstop")) return go(+g.dataset.i);
  if(g=t.closest(".ka")) return poke(g.dataset.p===GHOST?G:AC[g.dataset.p]);
  if(t.closest("#kMeat")) return bite();
  if(g=t.closest(".kmug")){ fxBurst(MUGX[+g.dataset.i],920,"🍺",3); return }
  if(t.closest("#kPudG")){ fxBurst(880,1110,"💦",6); return }
  if(t.closest("#kVan")) return honk() });
cover.addEventListener("click",e=>{ if(e.target.closest("#kinoStart")) go(0) });
$("kinoPlay").onclick=()=>{ if(!started||stage>N) return go(0); playing=!playing; ui(); kick() };
$("kinoNext").onclick=()=>go(!started?0:Math.min(stage+1,N+1));
$("kinoRestart").onclick=()=>go(0);

/* ---------- dydis ir matomumas ---------- */
function size(){ const w=box.clientWidth; if(w) box.style.setProperty("--u",(w/W)+"px") }
size(); if("ResizeObserver" in window) new ResizeObserver(size).observe(box); else addEventListener("resize",size);
if("IntersectionObserver" in window) new IntersectionObserver(es=>es.forEach(en=>{ visible=en.isIntersecting; kick() }),{threshold:.05}).observe(box);
setView("map"); mapState(0,0); hud(); ui();
})();
