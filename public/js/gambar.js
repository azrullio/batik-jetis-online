/* Gambar & animasi Petualangan Batik Jetis (SVG). Dipakai halaman pemain, dasbor guru, dan pratinjau. */
(function(){
"use strict";
/* =================== POLA & GRADASI BERSAMA =================== */
function pasangDefs(){
  if(document.getElementById('bjDefs'))return;
  const kelopak=(cx,cy,ry,rx,n,fill)=>Array.from({length:n},(_,i)=>`<ellipse cx="${cx}" cy="${cy-ry}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${i*360/n} ${cx} ${cy})"/>`).join('');
  const d=document.createElement('div');
  d.innerHTML=`<svg id="bjDefs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED8F0"/><stop offset=".62" stop-color="#FBE7B5"/><stop offset="1" stop-color="#F7CF8A"/></linearGradient>
    <linearGradient id="gSkyAbu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9A39A"/><stop offset="1" stop-color="#D8C7AE"/></linearGradient>
    <linearGradient id="gWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6CC3DE"/><stop offset="1" stop-color="#2F86A8"/></linearGradient>
    <linearGradient id="gDirty" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5A7E"/><stop offset="1" stop-color="#4A3A2E"/></linearGradient>
    <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D6AB"/><stop offset="1" stop-color="#E0B47E"/></linearGradient>
    <linearGradient id="gWallDapur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9AE7E"/><stop offset="1" stop-color="#B98A5A"/></linearGradient>
    <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A6440"/><stop offset="1" stop-color="#74462A"/></linearGradient>
    <linearGradient id="gBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".6"/><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"/></linearGradient>
    <pattern id="pTitik" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#FFF3D0"/><circle cx="9" cy="9" r="1.4" fill="#FFF3D0"/></pattern>
    <pattern id="pMerah" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#B8321F"/><circle cx="7" cy="7" r="2.2" fill="#F2B632"/><circle cx="21" cy="21" r="2.2" fill="#F2B632"/><path d="M14 3q4 6 0 10q-4-4 0-10z" fill="#3E8E4F"/><circle cx="21" cy="7" r="1" fill="#FFF3D0"/><circle cx="7" cy="21" r="1" fill="#FFF3D0"/></pattern>
    <pattern id="pHijau" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#3E8E4F"/><circle cx="7" cy="7" r="2.2" fill="#B8321F"/><circle cx="21" cy="21" r="2.2" fill="#F2B632"/><circle cx="21" cy="7" r="1" fill="#FFF3D0"/><circle cx="7" cy="21" r="1" fill="#FFF3D0"/></pattern>
    <pattern id="pKuning" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#F2B632"/><circle cx="7" cy="7" r="2.2" fill="#B8321F"/><circle cx="21" cy="21" r="2.2" fill="#3E8E4F"/><circle cx="21" cy="7" r="1" fill="#fff"/><circle cx="7" cy="21" r="1" fill="#fff"/></pattern>
    <pattern id="pBiru" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#2F5DA8"/><circle cx="7" cy="7" r="2.2" fill="#F2B632"/><circle cx="21" cy="21" r="2.2" fill="#B8321F"/><circle cx="21" cy="7" r="1" fill="#FFF3D0"/><circle cx="7" cy="21" r="1" fill="#FFF3D0"/></pattern>
    <pattern id="pPensil" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="#B9AE9A"/></pattern>
    <pattern id="pBBiru" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#2C4A94"/>${kelopak(22,22,6,2.6,6,'#F3E4C8')}<circle cx="22" cy="22" r="3.2" fill="#E7B04A"/><g fill="#F3E4C8"><circle cx="2" cy="2" r="1.6"/><circle cx="42" cy="42" r="1.6"/><circle cx="2" cy="42" r="1.6"/><circle cx="42" cy="2" r="1.6"/></g><path d="M0 38Q11 30 22 40T44 38" stroke="#8FB0E6" stroke-width="1.4" fill="none"/></pattern>
    <pattern id="pBCoklat" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#6A3417"/><path d="M5 31Q7 16 22 12Q18 27 5 31Z" fill="#E09A50"/><path d="M7 29L20 14" stroke="#6A3417" stroke-width="1"/><path d="M20 35q8-10 16-4" stroke="#F3E4C8" stroke-width="1.5" fill="none"/><g fill="#F3E4C8"><circle cx="29" cy="8" r="1.6"/><circle cx="31" cy="22" r="1.2"/><circle cx="10" cy="6" r="1.2"/></g></pattern>
    <pattern id="pBHijau" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#2F7A57"/><path d="M0 15q7-10 15 0t15 0" stroke="#F3E4C8" stroke-width="1.7" fill="none"/><g fill="#F2C044"><circle cx="8" cy="25" r="1.8"/><circle cx="23" cy="6" r="1.8"/></g><g fill="#F3E4C8"><circle cx="23" cy="25" r="1"/><circle cx="8" cy="6" r="1"/></g></pattern>
    <pattern id="pBMerah" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#B33A22"/>${kelopak(18,18,5,2.8,5,'#F2A23A')}<circle cx="18" cy="18" r="2.6" fill="#F3E4C8"/><g fill="#F3E4C8"><circle cx="2" cy="2" r="1.4"/><circle cx="34" cy="34" r="1.4"/><circle cx="2" cy="34" r="1.4"/><circle cx="34" cy="2" r="1.4"/></g></pattern>
    <filter id="fBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="fGrey"><feColorMatrix type="saturate" values="0"/></filter>
  </defs></svg>`;
  document.body.prepend(d.firstChild);
}

/* =================== KEPALA KECIL (papan peringkat) =================== */
function kepala(g){
  return `<svg viewBox="0 0 40 40" class="kpl" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="${g==='p'?'#F8D8CF':'#D3E0F4'}"/><circle cx="20" cy="22" r="11" fill="#C98A5B"/><path d="M9 20Q8 8 20 8Q32 8 31 20Q28 13 20 13Q12 13 9 20Z" fill="#4A2C18"/>${g==='p'?'<ellipse cx="32" cy="22" rx="3.5" ry="7" fill="#4A2C18"/><circle cx="29" cy="11" r="2.4" fill="#F2B632"/>':'<path d="M9 15Q20 9 31 15V18Q20 12 9 18Z" fill="#F2B632"/>'}<circle cx="16" cy="23" r="1.5" fill="#2A1A10"/><circle cx="24" cy="23" r="1.5" fill="#2A1A10"/><path d="M17 27Q20 30 23 27" stroke="#8E2A1A" stroke-width="1.4" fill="none"/></svg>`;
}

/* =================== GAPURA KAMPOENG BATIK JETIS (animasi) =================== */
let _gid=0;
function kubah(x,y){
  return `<g transform="translate(${x} ${y})"><rect x="-15" y="-2" width="30" height="9" rx="2" fill="#8E99A3"/><path d="M-17 -2Q-19 -24 0 -38Q19 -24 17 -2Z" fill="url(#KUBAH)"/><path d="M0 -38V-50" stroke="#9AA4AD" stroke-width="3"/><circle cy="-51" r="3.2" fill="#D5DBE0"/><path d="M4 -70A10 10 0 1 0 4 -54A8 8 0 1 1 4 -70Z" fill="#D5DBE0" stroke="#7C8790" stroke-width="1.2"/><path class="kilap" d="M-7 -24l2 -5l2 5l5 2l-5 2l-2 5l-2 -5l-5 -2z" fill="#fff"/></g>`;
}
function merak(){
  return `<g transform="translate(656 166) scale(.8)">
   <path d="M0 22Q40 2 92 16" stroke="#7A3B1E" stroke-width="2.4" fill="none"/>
   <g fill="#7A3B1E"><ellipse cx="22" cy="14" rx="7" ry="3" transform="rotate(-25 22 14)"/><ellipse cx="44" cy="8" rx="7" ry="3" transform="rotate(15 44 8)"/><ellipse cx="66" cy="10" rx="7" ry="3" transform="rotate(-10 66 10)"/></g>
   <g fill="#C46A2B"><circle cx="10" cy="20" r="4"/><circle cx="86" cy="12" r="4"/></g>
   <path d="M116 58Q70 40 18 66Q62 72 116 62Z" fill="#9A4A22"/>
   <path d="M118 62Q70 74 28 102Q82 94 118 66Z" fill="#7A3B1E"/>
   <g fill="#C46A2B"><circle cx="40" cy="64" r="4.5"/><circle cx="64" cy="58" r="4.5"/><circle cx="88" cy="56" r="4.5"/><circle cx="50" cy="88" r="4.5"/><circle cx="78" cy="78" r="4.5"/></g>
   <g fill="#F3E4C8"><circle cx="40" cy="64" r="1.8"/><circle cx="64" cy="58" r="1.8"/><circle cx="88" cy="56" r="1.8"/><circle cx="50" cy="88" r="1.8"/><circle cx="78" cy="78" r="1.8"/></g>
   <path d="M156 54q-20 12-42 4q16-14 42-4z" fill="#7A3B1E"/>
   <path d="M136 52q-14 8-24 4q12-10 24-4z" fill="#C46A2B"/>
   <path d="M150 52q4-22 18-22q8 0 10 6q-8 0-10 6q-2 10-18 10z" fill="#7A3B1E"/>
   <circle cx="168" cy="35" r="1.6" fill="#F3E4C8"/><path d="M177 36l6 2l-6 2z" fill="#C46A2B"/>
   <path d="M164 30l-3-9M169 29l1-9M173 30l4-8" stroke="#7A3B1E" stroke-width="1.5"/><g fill="#C46A2B"><circle cx="160" cy="20" r="2"/><circle cx="170" cy="19" r="2"/><circle cx="177" cy="21" r="2"/></g>
  </g>`;
}
/* Gapura sebagai "dunia" berlapis. Koordinat dunia: x -320..1280, y 0..900.
 * Jendela tampilan biasa = (0,0)-(960,540). Titik hilang (horizon) di (485,754), kaki gapura di y=860.
 * Lapisan: langit (tak hingga), jauh (kampung di balik gapura), gerbang (bidang gapura), dekat (jalan di depan). */
const GAPURA={VP:[485,754],KAKI:860,DUNIA:[-320,0,1600,900]};
function pohonTinggi(x,y,s,c,dasar){return `<rect x="${x-7*s}" y="${y}" width="${14*s}" height="${dasar-y}" fill="#6B4228"/>${pohon(x,y,s,c)}`;}
function rumahJauh(Z,sisi,dinding,atap,jemur){
  const k=1/Z,base=754+106/Z,edge=sisi<0?485-255/Z:485+255/Z;
  const w=230*k,hw=140*k,hr=64*k,gap=26*k,x0=sisi<0?edge-gap-w:edge+gap;
  const f=(n)=>n.toFixed(1);
  let s=`<rect x="${f(x0)}" y="${f(base-hw)}" width="${f(w)}" height="${f(hw)}" fill="${dinding}"/>
  <path d="M${f(x0-12*k)} ${f(base-hw)}H${f(x0+w+12*k)}L${f(x0+w-30*k)} ${f(base-hw-hr)}H${f(x0+30*k)}Z" fill="${atap}"/>
  <rect x="${f(x0+w*0.42)}" y="${f(base-hw*0.62)}" width="${f(w*0.16)}" height="${f(hw*0.62)}" fill="#6B4228"/>
  <rect x="${f(x0+w*0.1)}" y="${f(base-hw*0.75)}" width="${f(w*0.2)}" height="${f(hw*0.3)}" fill="#BFE3F0" stroke="#6B4228" stroke-width="${f(3*k)}"/>
  <rect x="${f(x0+w*0.7)}" y="${f(base-hw*0.75)}" width="${f(w*0.2)}" height="${f(hw*0.3)}" fill="#BFE3F0" stroke="#6B4228" stroke-width="${f(3*k)}"/>`;
  if(jemur){const yj=base-hw+18*k,c=['#B8321F','#F2B632','#2F5DA8','#3E8E4F'];
    s+=`<path d="M${f(x0)} ${f(yj)}H${f(x0+w)}" stroke="#5A3E2B" stroke-width="${f(2*k)}"/>`;
    for(let i=0;i<4;i++){const cx=x0+w*0.06+i*w*0.24;s+=`<rect x="${f(cx)}" y="${f(yj)}" width="${f(w*0.18)}" height="${f(hw*0.42)}" fill="${c[(i+(sisi<0?0:2))%4]}"/><circle cx="${f(cx+w*0.09)}" cy="${f(yj+hw*0.2)}" r="${f(4*k)}" fill="#FFF3D0"/>`;}
  }
  return s;
}
function gapuraBagian(u,gerak){
  const OUT='M150 192C250 170 330 120 470 118C560 118 610 146 650 162L822 162L822 410L150 410Z';
  const PUTIH='M150 192C250 170 330 120 470 118C560 118 610 146 650 162C610 240 520 300 420 324C330 346 230 362 150 392Z';
  const LENGKUNG='M650 162C610 240 520 300 420 324C330 346 230 362 150 392';
  const yL=x=>{const t=(x-182)/606;return (1-t)*(1-t)*512+2*(1-t)*t*430+t*t*512;};
  let kisi='';for(let x=182;x<788;x+=50.5){const x2=Math.min(788,x+50.5);kisi+=`M${x.toFixed(1)} ${yL(x).toFixed(1)}L${x2.toFixed(1)} 518M${x.toFixed(1)} 518L${x2.toFixed(1)} ${yL(x2).toFixed(1)}`;}
  const kelopakBesar=Array.from({length:8},(_,i)=>`<ellipse cx="0" cy="-20" rx="9" ry="16" fill="#F0C6CE" stroke="#8A2F3A" stroke-width="1.2" transform="rotate(${i*45})"/>`).join('');
  let genteng='';for(let y=196;y<=290;y+=16){const x2=150+(y-180)*112/120;genteng+=`M-340 ${y}L${x2.toFixed(0)} ${y}`;}
  let seng='';for(let x=768;x<=1290;x+=11){const yt=352-(x-760)*124/530,yb=392-(x-790)*24/500;seng+=`M${x} ${yt.toFixed(0)}L${x} ${yb.toFixed(0)}`;}
  let paving='';for(let x=-320;x<1280;x+=40)paving+=`M${x} 858V900`;
  const defs=`<defs>
   <clipPath id="cpP${u}"><path d="${OUT}"/></clipPath>
   <clipPath id="cpW${u}"><path d="${PUTIH}"/></clipPath>
   <linearGradient id="gL${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B9FE4"/><stop offset=".45" stop-color="#9ED6F6"/><stop offset=".6" stop-color="#D6EFFB"/><stop offset="1" stop-color="#EAF6FC"/></linearGradient>
   <linearGradient id="gB${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6F7A84"/><stop offset=".45" stop-color="#E6EBEF"/><stop offset="1" stop-color="#7C8790"/></linearGradient>
   <radialGradient id="gK${u}" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#C9D0D6"/><stop offset="1" stop-color="#7C8790"/></radialGradient>
   <linearGradient id="gS${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <filter id="fK${u}" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.010 0.018" numOctaves="2" seed="4" result="n">${gerak?'<animate attributeName="baseFrequency" dur="8s" values="0.010 0.018;0.014 0.025;0.010 0.018" repeatCount="indefinite"/>':''}</feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
   <path id="tK${u}" d="M326 180Q470 116 622 172"/>
   <path id="tR${u}" d="M190 476Q485 386 780 476"/>
   <path id="tE${u}" d="M196 503Q485 418 774 503"/>
  </defs>`;
  const langit=`<rect x="-320" width="1600" height="900" fill="url(#gL${u})"/>
  <g fill="#fff" opacity=".95"><g class="awan"><ellipse cx="0" cy="70" rx="52" ry="17"/><ellipse cx="28" cy="58" rx="34" ry="20"/><ellipse cx="-26" cy="62" rx="26" ry="14"/></g>
  <g class="awan a2"><ellipse cx="0" cy="140" rx="40" ry="13"/><ellipse cx="20" cy="130" rx="26" ry="15"/></g>
  <g class="awan a3"><ellipse cx="0" cy="40" rx="34" ry="11"/><ellipse cx="18" cy="33" rx="20" ry="12"/></g></g>
  <g class="burung" fill="none" stroke="#24364A" stroke-width="2.4" stroke-linecap="round"><path d="M0 100q7-7 14 0q7-7 14 0"/><path d="M34 86q5-5 10 0q5-5 10 0"/></g>`;
  const jauh=`<path d="M-320 760Q-100 700 120 740T560 730T1000 735T1280 745V900H-320Z" fill="#7FB070"/>
  ${pohonTinggi(380,470,1,'#4E9A4A',768)}${pohonTinggi(500,450,1.15,'#5FAE55',766)}${pohonTinggi(620,470,1,'#4E9A4A',768)}${pohonTinggi(440,500,.8,'#3F8A40',770)}
  ${pohonTinggi(90,500,.9,'#5FAE55',770)}${pohonTinggi(860,490,.95,'#4E9A4A',770)}
  <rect x="-320" y="754" width="1600" height="146" fill="#CFC2A6"/>
  <path d="M482 754H488L836 900H134Z" fill="#A9A39A"/><path d="M485 756V900" stroke="#EEE6D6" stroke-width="2.5" stroke-dasharray="9 13"/>
  ${rumahJauh(4.5,-1,'#E9DCC4','#B5502C',0)}${rumahJauh(4.5,1,'#E6D08A','#9E4A2A',0)}
  ${rumahJauh(3,-1,'#DCE8D2','#C8562E',1)}${rumahJauh(3,1,'#F0E2C2','#B5502C',1)}
  ${rumahJauh(2,-1,'#F2E3C4','#A84426',1)}${rumahJauh(2,1,'#DDE6EE','#C8562E',1)}
  ${rumahJauh(1.4,-1,'#E9C779','#B5502C',1)}${rumahJauh(1.4,1,'#EADCC2','#9E3D1E',1)}
  <g class="sway" transform="translate(735 836)"><path d="M0 0V-226" stroke="#7A5A3A" stroke-width="8"/><g transform="translate(0 -226)"><path d="M0 0Q-40 -20 -70 6Q-36 -6 0 0ZM0 0Q34 -26 70 -4Q36 -10 0 0ZM0 0Q-10 -40 -34 -54Q-6 -36 0 0ZM0 0Q14 -40 40 -50Q12 -30 0 0Z" fill="#3F8A40"/></g></g>`;
  const gerbang=`<g>
   <rect x="-330" y="300" width="570" height="560" fill="#EADCC2"/><rect x="-330" y="300" width="570" height="22" fill="#000" opacity=".12"/>
   <rect x="28" y="346" width="96" height="124" fill="#5B5E6B"/><rect x="34" y="352" width="84" height="112" fill="#7C8798"/><path d="M76 352V464M34 408H118" stroke="#5B5E6B" stroke-width="4"/>
   <rect x="-210" y="346" width="96" height="124" fill="#5B5E6B"/><rect x="-204" y="352" width="84" height="112" fill="#7C8798"/><path d="M-162 352V464M-204 408H-120" stroke="#5B5E6B" stroke-width="4"/>
   <path d="M-340 180L150 180L262 300L-340 300Z" fill="#C8562E"/><path d="${genteng}" stroke="#9E3D1E" stroke-width="3"/>
   <path d="M150 180L262 300" stroke="#8E3518" stroke-width="8"/><rect x="-340" y="296" width="602" height="10" fill="#8E3518"/>
   <path d="M-340 480L190 480L236 526L-340 526Z" fill="#C8562E"/><path d="M-340 496H206M-340 512H222" stroke="#9E3D1E" stroke-width="3"/>
   <rect x="-250" y="566" width="300" height="40" rx="6" fill="#7E1F12"/><text x="-100" y="594" text-anchor="middle" font-family="Caprasimo,Georgia,serif" font-size="24" fill="#FFE7A8">Batik Tulis Jetis</text>
   <rect x="-250" y="620" width="230" height="160" fill="#CFE6EE" stroke="#6B4228" stroke-width="6"/>
   <rect x="-236" y="634" width="58" height="120" fill="url(#pMerah)"/><rect x="-166" y="634" width="58" height="120" fill="url(#pBiru)"/><rect x="-96" y="634" width="58" height="120" fill="url(#pHijau)"/>
   <rect x="20" y="640" width="160" height="220" fill="#8E949A"/><path d="M20 660H180M20 680H180M20 700H180M20 720H180M20 740H180M20 760H180M20 780H180M20 800H180M20 820H180M20 840H180" stroke="#6E747A" stroke-width="3"/>
   ${pohonTinggi(30,430,.75,'#5FAE55',860)}
  </g>
  <g>
   <rect x="790" y="372" width="500" height="488" fill="#E9C779"/><rect x="790" y="372" width="500" height="14" fill="#000" opacity=".1"/>
   <rect x="850" y="410" width="66" height="92" fill="#7A5A3A"/><rect x="990" y="410" width="66" height="92" fill="#7A5A3A"/><rect x="1130" y="410" width="66" height="92" fill="#7A5A3A"/>
   <path d="M760 352L1290 228L1290 368L790 392Z" fill="#B7BDC3"/><path d="${seng}" stroke="#8F969D" stroke-width="2"/>
   <path d="M770 478L1290 424L1290 458L770 508Z" fill="#C8562E"/>
   <rect x="860" y="600" width="200" height="150" fill="#CFE6EE" stroke="#7A5A3A" stroke-width="6"/><path d="M960 600V750" stroke="#7A5A3A" stroke-width="5"/>
   <rect x="1100" y="640" width="90" height="220" fill="#7A5A3A"/><circle cx="1176" cy="756" r="5" fill="#F2B632"/>
   <rect x="860" y="790" width="190" height="14" rx="4" fill="#8E5A36"/><rect x="872" y="804" width="10" height="56" fill="#6B4228"/><rect x="1028" y="804" width="10" height="56" fill="#6B4228"/>
  </g>
  <rect x="160" y="150" width="22" height="710" fill="url(#gB${u})"/><rect x="788" y="146" width="22" height="714" fill="url(#gB${u})"/>
  <rect x="150" y="834" width="42" height="28" rx="3" fill="#8E99A3"/><rect x="778" y="834" width="42" height="28" rx="3" fill="#8E99A3"/>
  ${kubah(171,150).replace('KUBAH','gK'+u)}${kubah(799,146).replace('KUBAH','gK'+u)}
  <path d="M182 518H788" stroke="#9AA4AD" stroke-width="8"/>
  <path d="${kisi}" stroke="#8E99A3" stroke-width="4" fill="none"/>
  <path d="M182 452Q485 360 788 452L788 512Q485 430 182 512Z" fill="#D3DADF" stroke="#6F7A84" stroke-width="4"/>
  <text font-family="'Baloo 2','Arial Black',sans-serif" font-weight="800" font-size="21" fill="#1E2F4A" letter-spacing="3"><textPath href="#tR${u}" startOffset="50%" text-anchor="middle">RW 03   JETIS</textPath></text>
  <text font-family="'Baloo 2','Arial Black',sans-serif" font-weight="800" font-size="16" fill="#1E2F4A" letter-spacing="2"><textPath href="#tE${u}" startOffset="50%" text-anchor="middle">KEL. LEMAH PUTRO</textPath></text>
  <g clip-path="url(#cpP${u})">
   <g filter="url(#fK${u})">
    <rect x="140" y="150" width="700" height="270" fill="url(#pBCoklat)"/>
    <path d="M840 248Q760 262 690 250Q630 300 596 340L560 420H840Z" fill="url(#pBBiru)"/>
    <path d="M580 150H840V250Q760 262 690 250Q640 246 600 236Z" fill="#F3E4C8"/>
    ${merak()}
    <g transform="translate(764 318)">${kelopakBesar}<circle r="11" fill="#B8321F"/><circle r="5" fill="#F3E4C8"/></g>
    <path d="M840 352Q790 340 740 356Q700 380 680 420H840Z" fill="url(#pBCoklat)"/>
    <path d="${LENGKUNG}" transform="translate(64 78)" stroke="url(#pBBiru)" stroke-width="44" fill="none"/>
    <path d="${LENGKUNG}" transform="translate(40 44)" stroke="url(#pBMerah)" stroke-width="34" fill="none"/>
    <path d="${LENGKUNG}" transform="translate(18 16)" stroke="url(#pBHijau)" stroke-width="30" fill="none"/>
   </g>
   <path d="${LENGKUNG}" transform="translate(6 8)" stroke="#000" stroke-opacity=".22" stroke-width="12" fill="none"/>
   <path d="${PUTIH}" fill="#FBF8F1"/>
   <path d="${LENGKUNG}" stroke="#DED6C8" stroke-width="5" fill="none"/>
   <g clip-path="url(#cpW${u})"><g class="kilau"><rect x="0" y="80" width="120" height="360" fill="url(#gS${u})" transform="skewX(-22)"/></g></g>
   <text font-family="Caprasimo,Georgia,serif" font-size="19" fill="#4B2B17"><textPath href="#tK${u}" startOffset="50%" text-anchor="middle">Kabupaten Sidoarjo</textPath></text>
   <g transform="translate(470 192)"><path d="M-16 -17H16V3Q16 17 0 23Q-16 17 -16 3Z" fill="#2E8B45" stroke="#E9B932" stroke-width="3"/><path d="M0 -9l2.6 5.4 5.9.8-4.3 4.1 1 5.8L0 4.3-5.2 7.1l1-5.8-4.3-4.1 5.9-.8z" fill="#F7E7A6"/></g>
   <g font-family="Caprasimo,Georgia,serif" fill="#4B2B17">
    <text x="176" y="236" font-size="42">Kampoeng</text>
    <text x="226" y="282" font-size="47">Batik</text>
    <text x="194" y="330" font-size="55">Jetis</text>
    <text x="236" y="352" font-size="14" font-family="Georgia,serif" font-weight="700">Sejak 1675</text>
   </g>
  </g>
  <path d="${OUT}" fill="none" stroke="#7C8790" stroke-width="6"/>`;
  const dekat=`<rect x="-320" y="856" width="1600" height="44" fill="#D9CBB0"/><path d="${paving}" stroke="#C4B494" stroke-width="2"/>
  <path d="M230 857H740L836 900H134Z" fill="#A9A39A"/><path d="M230 857L134 900M740 857L836 900" stroke="#EFE7D6" stroke-width="4"/>
  <path d="M485 858V900" stroke="#EEE6D6" stroke-width="3" stroke-dasharray="12 10"/>
  <g transform="translate(128 860)"><path d="M-18 0H18L13 -26H-13Z" fill="#B5502C"/><circle cx="-8" cy="-34" r="12" fill="#4E9A4A"/><circle cx="8" cy="-36" r="13" fill="#5FAE55"/><circle cx="0" cy="-46" r="11" fill="#3F8A40"/></g>
  <g transform="translate(842 860)"><path d="M-18 0H18L13 -26H-13Z" fill="#B5502C"/><circle cx="-8" cy="-34" r="12" fill="#4E9A4A"/><circle cx="8" cy="-36" r="13" fill="#5FAE55"/><circle cx="0" cy="-46" r="11" fill="#3F8A40"/></g>`;
  return {defs,langit,jauh,gerbang,dekat};
}
/** Tampilan diam (latar adegan & layar judul): jendela 960x540 dari dunia gapura. */
function gapuraSVG(){
  const b=gapuraBagian('gp'+(++_gid),true);
  return svgOpen+b.defs+b.langit+b.jauh+b.gerbang+b.dekat+'</svg>';
}
/** Lapisan terpisah untuk sinematik melewati gapura. z = kedalaman (1 = bidang gapura). */
function gapuraLapisan(){
  const b=gapuraBagian('gp'+(++_gid),false);
  ['gerbang','jauh'].forEach(k=>{b[k]=b[k].replace(/class="(kilau|kilap|sway)"/g,'');});
  const svg=(isi,defs)=>`<svg viewBox="${GAPURA.DUNIA.join(' ')}" width="1600" height="900" preserveAspectRatio="none" aria-hidden="true">${defs||''}${isi}</svg>`;
  return [
    {nama:'langit',z:Infinity,zi:1,svg:svg(b.langit)},
    {nama:'jauh',z:2.4,zi:2,svg:svg(b.jauh)},
    {nama:'gerbang',z:1,zi:4,svg:svg(b.gerbang,b.defs)},
    {nama:'dekat',z:0.75,zi:5,svg:svg(b.dekat)},
  ];
}

function gapuraMini(){
  return `<g transform="translate(120 470)"><rect x="-36" y="-84" width="6" height="84" fill="#9AA4AD"/><rect x="30" y="-84" width="6" height="84" fill="#9AA4AD"/>
  <circle cx="-33" cy="-88" r="5" fill="#C9D0D6"/><circle cx="33" cy="-88" r="5" fill="#C9D0D6"/>
  <path d="M-44 -68Q-24 -86 2 -86Q22 -86 44 -76V-40H-44Z" fill="#FBF8F1" stroke="#7C8790" stroke-width="2"/>
  <path d="M12 -78Q8 -58 -10 -48Q-28 -42 -44 -40H44V-76Q28 -76 12 -78Z" fill="url(#pBBiru)"/><path d="M12 -78Q8 -58 -10 -48Q-28 -42 -44 -40" stroke="#B33A22" stroke-width="5" fill="none"/>
  <text x="-38" y="-56" font-family="Caprasimo,Georgia,serif" font-size="12" fill="#4B2B17">Jetis</text>
  <path d="M-30 -24Q0 -44 30 -24" stroke="#9AA4AD" stroke-width="6" fill="none"/>
  <text y="10" dy="14" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="14" fill="#2A1A10">Gapura</text></g>`;
}

/* =================== GAMBAR: BENDA & MOTIF (64x64) =================== */
const IC={
 canting:'<path d="M8 58L36 26" stroke="#B9884F" stroke-width="6" stroke-linecap="round"/><path d="M10 56L35 27" stroke="#8E6234" stroke-width="1.6" stroke-dasharray="4 5"/><ellipse cx="42" cy="22" rx="12" ry="8" fill="#C8792E" stroke="#8A4D17" stroke-width="2"/><ellipse cx="42" cy="19" rx="8" ry="3.5" fill="#E9A45A"/><path d="M50 26Q56 32 58 41" stroke="#C8792E" stroke-width="4" fill="none" stroke-linecap="round"/>',
 malam:'<rect x="10" y="32" width="30" height="20" rx="4" fill="#C98F2E"/><rect x="10" y="32" width="30" height="6" rx="3" fill="#E6B45A"/><rect x="26" y="18" width="28" height="22" rx="4" fill="#D9A441"/><rect x="26" y="18" width="28" height="6" rx="3" fill="#F0C872"/>',
 mori:'<path d="M12 16H52V22H12Z" fill="#EFE5D2"/><rect x="10" y="20" width="44" height="30" rx="4" fill="#FFFDF6" stroke="#CDBB98" stroke-width="2"/><path d="M10 30H54M10 40H54" stroke="#E4D6B8" stroke-width="2"/>',
 wajan:'<path d="M10 30H54Q52 50 32 50Q12 50 10 30Z" fill="#3A3A3A"/><ellipse cx="32" cy="30" rx="22" ry="5" fill="#C98F2E"/><path d="M4 28H12M52 28H60" stroke="#3A3A3A" stroke-width="4" stroke-linecap="round"/>',
 kompor:'<rect x="16" y="30" width="32" height="24" rx="4" fill="#5A5A5A"/><rect x="20" y="37" width="10" height="6" rx="1" fill="#8A8A8A"/><path d="M26 30Q23 20 30 13Q30 22 34 20Q41 24 37 30Z" fill="#F29A2E"/><path d="M29 30Q28 24 31 20Q32 25 34 26Q35 28 33 30Z" fill="#FFE07A"/>',
 gawangan:'<path d="M14 58L20 14M50 58L44 14M15 16H49" stroke="#8E5A36" stroke-width="5" stroke-linecap="round"/><path d="M20 17H44V40Q32 46 20 40Z" fill="#FFFDF6" stroke="#CDBB98" stroke-width="1.5"/>',
 spidol:'<g transform="rotate(-35 32 32)"><rect x="12" y="26" width="34" height="12" rx="3" fill="#2A2A2A"/><rect x="46" y="27" width="8" height="10" rx="2" fill="#3A6FD8"/><path d="M12 28L6 32L12 36Z" fill="#3A6FD8"/><rect x="18" y="29" width="16" height="6" fill="#fff" opacity=".85"/></g>',
 krayon:'<g transform="rotate(-35 32 32)"><rect x="12" y="26" width="34" height="12" rx="2" fill="#E0463A"/><rect x="19" y="26" width="18" height="12" fill="#F7E3B5"/><path d="M46 26L57 32L46 38Z" fill="#E0463A"/></g>',
 kuas:'<g transform="rotate(-35 32 32)"><rect x="4" y="29" width="32" height="6" rx="3" fill="#B9884F"/><rect x="36" y="26" width="8" height="12" fill="#A8A8A8"/><path d="M44 25Q60 32 44 39Z" fill="#6B4A33"/></g><circle cx="49" cy="53" r="6" fill="#4A8FD8"/>',
 lem:'<rect x="18" y="14" width="22" height="36" rx="5" fill="#F5F5F0" stroke="#9A9A9A" stroke-width="2"/><rect x="24" y="6" width="10" height="10" rx="2" fill="#E0463A"/><rect x="18" y="26" width="22" height="10" fill="#4A8FD8"/><path d="M40 44Q48 50 44 58" stroke="#D8D8D8" stroke-width="4" fill="none" stroke-linecap="round"/>',
 api:'<path d="M32 58Q14 54 16 38Q18 28 26 22Q26 32 32 34Q30 18 40 8Q40 22 46 28Q52 36 48 46Q46 56 32 58Z" fill="#F2682E"/><path d="M32 56Q24 52 25 44Q27 38 31 36Q31 44 36 44Q40 48 38 52Q36 56 32 56Z" fill="#FFD35A"/>',
 benih:'<path d="M32 60V34" stroke="#3E8E4F" stroke-width="4"/><path d="M32 40Q16 38 12 22Q28 22 32 36Z" fill="#5FB06E"/><path d="M32 36Q46 30 50 16Q36 16 32 32Z" fill="#3E8E4F"/><ellipse cx="32" cy="60" rx="16" ry="4" fill="#8A5A34"/>',
 sungai:'<path d="M4 30Q18 22 32 30T60 30V52Q46 44 32 52T4 52Z" fill="#4AA3C9"/><path d="M14 38q6-4 12 0M36 44q6-4 12 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
 pabrik:'<rect x="8" y="30" width="48" height="24" fill="#8A7F74"/><rect x="40" y="12" width="8" height="20" fill="#6E655C"/><circle cx="46" cy="8" r="5" fill="#BDB6AE"/><rect x="14" y="38" width="8" height="8" fill="#BFE3F0"/><rect x="28" y="38" width="8" height="8" fill="#BFE3F0"/><path d="M8 54H56" stroke="#4E9FC6" stroke-width="4"/>',
 tanah:'<rect x="6" y="34" width="52" height="22" rx="4" fill="#8A5A34"/><path d="M14 34Q20 22 32 24Q44 22 50 34" fill="#6B4228"/><circle cx="22" cy="44" r="3" fill="#6B4228"/><circle cx="40" cy="48" r="2.5" fill="#6B4228"/>',
 udang:'<path d="M20 44Q12 24 30 17Q46 12 50 28" fill="none" stroke="#E8773A" stroke-width="11" stroke-linecap="round"/><path d="M21 31l8-3M30 20l3 6M40 15v7" stroke="#B4501F" stroke-width="2"/><path d="M20 44l-9 9 13-2z" fill="#E8773A"/><circle cx="50" cy="26" r="2" fill="#2A1A10"/><path d="M52 24Q60 14 58 5M50 22Q54 12 47 5" stroke="#B4501F" stroke-width="1.6" fill="none"/><path d="M36 27l-2 10M42 27v10M30 30l-4 8" stroke="#B4501F" stroke-width="1.6"/>',
 bandeng:'<path d="M6 32Q24 14 44 26L57 17L55 32L57 47L44 38Q24 50 6 32Z" fill="#8FB7C9" stroke="#3E6E85" stroke-width="2"/><circle cx="15" cy="30" r="2.3" fill="#2A1A10"/><path d="M24 25q5 7 0 14M31 25q5 7 0 14" stroke="#3E6E85" stroke-width="1.6" fill="none"/>',
 kembang:'<path d="M32 60V24" stroke="#3E8E4F" stroke-width="3"/><path d="M32 46Q16 44 13 32Q27 31 32 42Z" fill="#3E8E4F"/><path d="M32 38Q47 35 50 24Q37 24 32 34Z" fill="#5FB06E"/><g fill="#B8321F"><circle cx="32" cy="14" r="3.4"/><circle cx="26" cy="18" r="3"/><circle cx="38" cy="18" r="3"/><circle cx="29" cy="9" r="2.6"/><circle cx="35" cy="9" r="2.6"/><circle cx="32" cy="22" r="2.6"/></g>',
 beras:'<circle cx="32" cy="32" r="27" fill="#8A5A34"/><g fill="#FFF3D6"><ellipse cx="20" cy="22" rx="4" ry="2" transform="rotate(30 20 22)"/><ellipse cx="34" cy="16" rx="4" ry="2" transform="rotate(-20 34 16)"/><ellipse cx="44" cy="26" rx="4" ry="2" transform="rotate(60 44 26)"/><ellipse cx="26" cy="34" rx="4" ry="2" transform="rotate(-40 26 34)"/><ellipse cx="40" cy="40" rx="4" ry="2" transform="rotate(15 40 40)"/><ellipse cx="18" cy="42" rx="4" ry="2" transform="rotate(70 18 42)"/><ellipse cx="32" cy="48" rx="4" ry="2" transform="rotate(-10 32 48)"/><ellipse cx="48" cy="36" rx="3.5" ry="1.8" transform="rotate(-60 48 36)"/></g>',
 mega:'<path d="M6 44q0-12 12-12q2-12 14-12q14 0 16 13q10 0 10 11z" fill="#2F5DA8"/><path d="M14 44q0-7 8-7q2-8 10-8q9 0 10 9q7 0 7 6" fill="none" stroke="#8FB0E6" stroke-width="3"/><path d="M22 44q0-3 4-3q1-4 6-4q5 0 6 5" fill="none" stroke="#fff" stroke-width="2.5"/>',
 kawung:'<g fill="#6B4228"><ellipse cx="32" cy="17" rx="9" ry="13"/><ellipse cx="32" cy="47" rx="9" ry="13"/><ellipse cx="17" cy="32" rx="13" ry="9"/><ellipse cx="47" cy="32" rx="13" ry="9"/></g><circle cx="32" cy="32" r="3.5" fill="#F2B632"/>',
 tebu:'<g stroke="#2F6B3A" stroke-width="2"><rect x="18" y="10" width="7" height="50" rx="3" fill="#6FA25A"/><rect x="30" y="6" width="7" height="54" rx="3" fill="#7DB368"/><rect x="42" y="14" width="7" height="46" rx="3" fill="#6FA25A"/></g><path d="M18 24h7M18 40h7M30 20h7M30 36h7M30 50h7M42 28h7M42 44h7" stroke="#2F6B3A" stroke-width="2"/><path d="M33 8Q22 0 10 6M34 8Q46 0 56 8" stroke="#3E8E4F" stroke-width="3" fill="none"/>'
};
const ic=k=>`<svg viewBox="0 0 64 64" aria-hidden="true">${IC[k]||''}</svg>`;

/* =================== TOKOH =================== */
const KULIT='#C98A5B',RAMBUT='#4A2C18';
function anak(g,pose){
  const baju=g==='p'?'url(#pMerah)':'url(#pBiru)', solid=g==='p'?'#B8321F':'#2F5DA8';
  let s=`<svg viewBox="0 0 200 300" aria-hidden="true"><ellipse cx="100" cy="292" rx="62" ry="8" fill="rgba(0,0,0,.25)"/>
  <rect class="kaki-k" x="70" y="226" width="26" height="62" rx="10" fill="#3A2A1F"/><rect class="kaki-n" x="104" y="226" width="26" height="62" rx="10" fill="#3A2A1F"/>
  <g class="lengan-k"><path d="M58 158Q36 190 40 234" stroke="${solid}" stroke-width="25" stroke-linecap="round" fill="none"/><circle cx="40" cy="238" r="11" fill="${KULIT}"/></g>
  <g class="lengan-n"><path d="M142 158Q164 190 160 234" stroke="${solid}" stroke-width="25" stroke-linecap="round" fill="none"/><circle cx="160" cy="238" r="11" fill="${KULIT}"/></g>
  <path d="M52 150Q100 128 148 150L158 246Q100 262 42 246Z" fill="${baju}"/>
  <path d="M52 150Q100 128 148 150L158 246Q100 262 42 246Z" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/>
  <rect x="88" y="116" width="24" height="28" fill="${KULIT}"/>`;
  if(pose==='back'){
    s+=`<circle cx="46" cy="92" r="10" fill="${KULIT}"/><circle cx="154" cy="92" r="10" fill="${KULIT}"/>
    <circle cx="100" cy="82" r="56" fill="${RAMBUT}"/><path d="M62 52Q100 28 138 52" stroke="#6B4228" stroke-width="5" fill="none" opacity=".6"/>`;
    if(g==='p') s+=`<path d="M90 74Q66 130 94 176Q124 130 110 74Z" fill="${RAMBUT}"/><circle cx="100" cy="72" r="8" fill="#F2B632"/>`;
    else s+=`<path d="M44 70Q100 48 156 70L156 88Q100 68 44 88Z" fill="url(#pKuning)"/><path d="M92 78l-16 24 24-9 24 9-16-24z" fill="url(#pKuning)"/>`;
  }else{
    s+=`${g==='p'?`<ellipse cx="160" cy="112" rx="18" ry="40" fill="${RAMBUT}" transform="rotate(18 160 112)"/>`:''}
    <circle cx="48" cy="96" r="10" fill="${KULIT}"/><circle cx="152" cy="96" r="10" fill="${KULIT}"/>
    <circle cx="100" cy="88" r="52" fill="${KULIT}"/>
    <path d="M46 88Q44 28 100 28Q156 28 154 88Q142 58 118 56Q112 66 98 64Q84 70 68 64Q56 70 46 88Z" fill="${RAMBUT}"/>
    ${g==='l'?`<path d="M46 66Q100 42 154 66L154 80Q100 58 46 80Z" fill="url(#pKuning)"/>`:`<circle cx="142" cy="58" r="7" fill="#F2B632"/>`}
    <path d="M72 84q8-5 16 0M112 84q8-5 16 0" stroke="${RAMBUT}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="80" cy="98" rx="7" ry="9" fill="#2A1A10"/><ellipse cx="120" cy="98" rx="7" ry="9" fill="#2A1A10"/>
    <circle cx="82" cy="95" r="2.6" fill="#fff"/><circle cx="122" cy="95" r="2.6" fill="#fff"/>
    <circle cx="68" cy="114" r="7" fill="#F09A80" opacity=".6"/><circle cx="132" cy="114" r="7" fill="#F09A80" opacity=".6"/>
    <path d="M86 116Q100 132 114 116Z" fill="#8E2A1A"/>`;
  }
  return s+'</svg>';
}
function sekar(){
  let fan='';for(let a=-75;a<=75;a+=15){fan+=`<g transform="rotate(${a} 120 196)"><ellipse cx="120" cy="100" rx="16" ry="72" fill="#2E7D6B"/><ellipse cx="120" cy="52" rx="11" ry="14" fill="#F2B632"/><ellipse cx="120" cy="53" rx="7" ry="9" fill="#B8321F"/><circle cx="120" cy="54" r="3.6" fill="#2F5DA8"/></g>`;}
  return `<svg viewBox="0 0 240 280" aria-hidden="true"><ellipse class="bayang" cx="120" cy="270" rx="56" ry="8" fill="rgba(0,0,0,.22)"/>${fan}
  <path d="M120 122Q170 150 164 222Q160 262 120 264Q80 262 76 222Q70 150 120 122Z" fill="#2FA39A"/>
  <ellipse cx="120" cy="216" rx="27" ry="36" fill="#CDEFE6"/>
  <g fill="#2FA39A"><circle cx="110" cy="200" r="2"/><circle cx="130" cy="200" r="2"/><circle cx="120" cy="214" r="2"/><circle cx="110" cy="228" r="2"/><circle cx="130" cy="228" r="2"/><circle cx="120" cy="242" r="2"/></g>
  <path class="sayap-k" d="M80 172Q60 212 86 246Q92 210 96 182Z" fill="#23877F"/><path class="sayap-n" d="M160 172Q180 212 154 246Q148 210 144 182Z" fill="#23877F"/>
  <path d="M108 262v8M132 262v8" stroke="#E08A2E" stroke-width="5" stroke-linecap="round"/>
  <g stroke="#23877F" stroke-width="3"><path d="M120 76L106 46"/><path d="M120 74V42"/><path d="M120 76L134 46"/></g>
  <g fill="#F2B632"><circle cx="106" cy="44" r="6"/><circle cx="120" cy="40" r="6"/><circle cx="134" cy="44" r="6"/></g>
  <circle cx="120" cy="112" r="40" fill="#2FA39A"/>
  <ellipse cx="104" cy="112" rx="10" ry="12" fill="#fff"/><ellipse cx="136" cy="112" rx="10" ry="12" fill="#fff"/>
  <circle cx="106" cy="114" r="6" fill="#1E2A2A"/><circle cx="138" cy="114" r="6" fill="#1E2A2A"/>
  <circle cx="108" cy="111" r="2" fill="#fff"/><circle cx="140" cy="111" r="2" fill="#fff"/>
  <g class="lids"><ellipse cx="104" cy="112" rx="11" ry="13" fill="#2FA39A"/><ellipse cx="136" cy="112" rx="11" ry="13" fill="#2FA39A"/></g>
  <path d="M113 126H127L120 138Z" fill="#F2B632"/>
  <circle cx="94" cy="130" r="6" fill="#F7A7A0" opacity=".7"/><circle cx="146" cy="130" r="6" fill="#F7A7A0" opacity=".7"/></svg>`;
}
function kilat(){
  return `<svg viewBox="0 0 220 330" aria-hidden="true">
  <g fill="#9A96A8" opacity=".55"><circle class="smoke" cx="54" cy="304" r="30"/><circle class="smoke d2" cx="110" cy="312" r="36"/><circle class="smoke d3" cx="166" cy="302" r="30"/></g>
  <path d="M110 40Q170 50 176 140L196 292Q110 312 24 292L44 140Q50 50 110 40Z" fill="#5E5A6E"/>
  <path d="M110 120L122 300H98Z" fill="#4A4658" opacity=".6"/>
  <path d="M46 150Q20 200 40 232" stroke="#5E5A6E" stroke-width="26" stroke-linecap="round" fill="none"/><path d="M174 150Q200 200 180 232" stroke="#5E5A6E" stroke-width="26" stroke-linecap="round" fill="none"/>
  <circle cx="40" cy="236" r="11" fill="#8C8898"/><circle cx="180" cy="236" r="11" fill="#8C8898"/>
  <path d="M58 112Q54 28 110 24Q166 28 162 112Q142 92 110 92Q78 92 58 112Z" fill="#4A4658"/>
  <ellipse cx="110" cy="100" rx="38" ry="30" fill="#1C1A24"/>
  <path d="M88 94L104 100L88 105Z" fill="#FFD84A"/><path d="M132 94L116 100L132 105Z" fill="#FFD84A"/>
  <path d="M95 115Q110 124 125 115" stroke="#FFD84A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M114 150L98 190H112L102 226L128 180H114L124 150Z" fill="#FFD84A"/></svg>`;
}
const ACT={sekar,kilat,anakP:()=>anak('p','back'),anakL:()=>anak('l','back')};

/* =================== LATAR (960x540) =================== */
const svgOpen='<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
function pohon(x,y,s=1,c='#5E8C55'){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="-10" width="14" height="50" fill="#6B4228"/><circle cx="0" cy="-30" r="34" fill="${c}"/><circle cx="-26" cy="-12" r="24" fill="${c}"/><circle cx="26" cy="-12" r="24" fill="${c}"/></g>`;}
function rumahJoglo(){return `<g><rect x="30" y="262" width="230" height="170" fill="#D9A06B"/><path d="M10 274L145 190L280 274Z" fill="#9A3B24"/><path d="M10 274L145 190L280 274" fill="none" stroke="#6E2616" stroke-width="6"/><rect x="118" y="330" width="54" height="102" rx="4" fill="#6B4228"/><rect x="50" y="296" width="48" height="40" fill="#BFE3F0" stroke="#6B4228" stroke-width="5"/><rect x="192" y="296" width="48" height="40" fill="#BFE3F0" stroke="#6B4228" stroke-width="5"/></g>`;}
function jemuran(x,y,w,pats){const n=pats.length,cw=(w-20)/n-10;let s=`<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y+6}" stroke="#5A3E2B" stroke-width="3"/>`;pats.forEach((p,i)=>{const cx=x+14+i*(cw+10);s+=`<rect class="sway" x="${cx}" y="${y+2+i}" width="${cw}" height="${cw*1.35}" fill="url(#${p})"/>`;});return s;}
const BG={
 gapura(){return gapuraSVG();},
 joglo(){return svgOpen+`<rect width="960" height="540" fill="url(#gSky)"/>
  <path d="M0 330Q200 280 480 310T960 300V540H0Z" fill="#9CC48A"/>${pohon(90,310,1.1)}${pohon(870,300,1.2,'#6E9E5E')}
  <path d="M160 200L480 90L800 200Z" fill="#6E4326"/><path d="M110 250L260 190H700L850 250Z" fill="#8E5A36"/><path d="M110 250H850" stroke="#5A3E2B" stroke-width="8"/>
  <g fill="#6B4228"><rect x="220" y="250" width="18" height="200"/><rect x="400" y="250" width="18" height="200"/><rect x="542" y="250" width="18" height="200"/><rect x="722" y="250" width="18" height="200"/></g>
  <rect x="120" y="440" width="720" height="30" fill="#B98A5A"/><rect x="0" y="470" width="960" height="70" fill="#C9A06A"/>
  <g transform="translate(560 318)"><path d="M0 132L10 0M150 132L140 0M4 6H146" stroke="#8E5A36" stroke-width="8" stroke-linecap="round"/><path d="M12 8H138V92Q75 108 12 92Z" fill="#FFFDF6"/><g transform="translate(40 22) scale(1)"><path d="M0 40Q10 10 40 14Q64 18 70 40" fill="none" stroke="#6B4228" stroke-width="3"/><circle cx="20" cy="46" r="5" fill="none" stroke="#6B4228" stroke-width="2"/><circle cx="50" cy="48" r="5" fill="none" stroke="#6B4228" stroke-width="2"/></g></g>
  <g transform="translate(420 330)"><ellipse cx="40" cy="120" rx="54" ry="16" fill="#5A3E2B"/><path d="M4 120Q0 60 40 52Q80 60 76 120Z" fill="#4A2F1E"/><circle cx="40" cy="36" r="24" fill="#A87450"/><path d="M14 30Q40 4 66 30L66 22Q40 0 14 22Z" fill="#3E2A18"/><path d="M60 80Q100 70 120 64" stroke="#4A2F1E" stroke-width="12" stroke-linecap="round"/></g>
  <g transform="translate(270 400)"><circle cx="20" cy="0" r="16" fill="#A87450"/><path d="M0 60Q0 18 20 16Q40 18 40 60Z" fill="#7A3A22"/><circle cx="76" cy="6" r="14" fill="#A87450"/><path d="M58 62Q58 24 76 22Q94 24 94 62Z" fill="#4E6E3A"/></g></svg>`;},
 pasar(){let st='';[[60,'#B8321F','#F2B632','pMerah'],[360,'#3E8E4F','#FFF6E4','pKuning'],[660,'#2F5DA8','#F2B632','pHijau']].forEach(([x,a,b,p])=>{st+=`<g transform="translate(${x} 200)"><rect x="10" y="60" width="220" height="150" fill="#C98A5B"/><rect x="0" y="210" width="240" height="18" fill="#8E5A36"/><path d="M-10 60L20 0H220L250 60Z" fill="${a}"/><path d="M40 0L30 60M80 0L80 60M120 0L130 60M160 0L180 60M200 0L230 60" stroke="${b}" stroke-width="10"/><rect class="sway" x="30" y="70" width="50" height="80" fill="url(#${p})"/><rect class="sway" x="95" y="70" width="50" height="80" fill="url(#pBiru)"/><rect class="sway" x="160" y="70" width="50" height="80" fill="url(#pMerah)"/></g>`;});
  let org='';[[120,'#6E4A8E'],[260,'#3E8E4F'],[420,'#B8321F'],[560,'#2F5DA8'],[720,'#8E5A36'],[860,'#C26E1E']].forEach(([x,c],i)=>{org+=`<g transform="translate(${x} ${470+(i%2)*14})"><circle cx="0" cy="-58" r="18" fill="${i%2?'#A87450':'#8A5A3A'}"/><path d="M-24 10Q-24 -36 0 -38Q24 -36 24 10Z" fill="${c}"/></g>`;});
  return svgOpen+`<rect width="960" height="540" fill="url(#gSky)"/><path d="M0 250Q240 210 480 240T960 230V540H0Z" fill="#9CC48A"/>${pohon(40,250,.8)}${pohon(930,240,.9,'#6E9E5E')}<rect x="0" y="430" width="960" height="110" fill="#D8B07A"/>${st}${org}</svg>`;},
 rumah(){return svgOpen+`<rect width="960" height="540" fill="url(#gWall)"/><rect y="330" width="960" height="70" fill="#C99A6B"/>
  <rect x="70" y="80" width="170" height="170" fill="#BFE3F0" stroke="#6B4228" stroke-width="12"/><path d="M155 80V250M70 165H240" stroke="#6B4228" stroke-width="8"/>
  <path d="M76 250L240 250L420 540L0 540Z" fill="url(#gBeam)"/>
  <rect y="0" width="960" height="26" fill="#6B4228"/><rect x="0" y="0" width="22" height="400" fill="#6B4228"/><rect x="938" y="0" width="22" height="400" fill="#6B4228"/>
  <line x1="560" y1="70" x2="870" y2="70" stroke="#6B4228" stroke-width="8" stroke-linecap="round"/>
  <rect class="sway" x="580" y="74" width="270" height="210" fill="url(#pMerah)"/><rect x="592" y="86" width="246" height="186" fill="none" stroke="#F2B632" stroke-width="6" pointer-events="none"/>
  <g transform="translate(680 132) scale(1.1)"><path d="M0 60Q10 10 40 14Q70 18 70 60" fill="none" stroke="#FFE7A8" stroke-width="5"/><circle cx="40" cy="8" r="8" fill="#FFE7A8"/><circle cx="16" cy="70" r="7" fill="#FFE7A8"/><circle cx="40" cy="74" r="7" fill="#FFE7A8"/><circle cx="64" cy="70" r="7" fill="#FFE7A8"/></g>
  <rect y="400" width="960" height="140" fill="url(#gFloor)"/><path d="M0 440H960M0 486H960M0 526H960" stroke="#6B4228" stroke-width="3" opacity=".5"/>
  <g transform="translate(300 250)"><path d="M0 220L10 0M170 220L160 0M4 4H166" stroke="#8E5A36" stroke-width="10" stroke-linecap="round"/><path d="M12 8H158V130Q85 146 12 130Z" fill="#FFFDF6"/><path d="M12 8H158V130Q85 146 12 130Z" fill="url(#pPensil)"/><path d="M40 90Q50 40 85 44Q120 48 128 90" fill="none" stroke="#9A8E78" stroke-width="3" stroke-dasharray="6 5"/><path d="M40 90Q50 60 70 58" fill="none" stroke="#C98F2E" stroke-width="5"/></g>
  <g transform="translate(610 380)"><rect x="0" y="0" width="290" height="20" rx="4" fill="#7A4A2A"/><rect x="16" y="20" width="14" height="110" fill="#6B4228"/><rect x="260" y="20" width="14" height="110" fill="#6B4228"/>
  <g transform="translate(30 -46) scale(.75)">${IC.wajan}</g><g transform="translate(96 -46) scale(.75)">${IC.malam}</g><g transform="translate(160 -46) scale(.75)">${IC.canting}</g><g transform="translate(220 -46) scale(.75)">${IC.kuas}</g></g></svg>`;},
 dapur(){return svgOpen+`<rect width="960" height="540" fill="url(#gWallDapur)"/>
  <g opacity=".35">${Array.from({length:12},(_,i)=>`<rect x="${i*80}" y="300" width="78" height="38" fill="#E9CFA8"/><rect x="${i*80+40}" y="340" width="78" height="38" fill="#E9CFA8"/>`).join('')}</g>
  <rect x="700" y="70" width="170" height="130" fill="#BFE3F0" stroke="#6B4228" stroke-width="10"/><path d="M785 70V200" stroke="#6B4228" stroke-width="7"/>
  <rect x="60" y="120" width="260" height="14" fill="#6B4228"/><rect x="60" y="210" width="260" height="14" fill="#6B4228"/>
  <g><rect x="80" y="80" width="40" height="40" rx="6" fill="#D9A441"/><rect x="130" y="70" width="34" height="50" rx="6" fill="#B8321F"/><rect x="174" y="84" width="40" height="36" rx="6" fill="#2F5DA8"/><rect x="224" y="76" width="36" height="44" rx="6" fill="#3E8E4F"/><rect x="84" y="170" width="60" height="40" rx="4" fill="#C98F2E"/><rect x="154" y="160" width="60" height="50" rx="4" fill="#E6B45A"/><rect x="226" y="176" width="70" height="34" rx="4" fill="#D9A441"/></g>
  <rect y="400" width="960" height="140" fill="url(#gFloor)"/>
  <g transform="translate(480 0)"><rect x="-70" y="394" width="140" height="80" rx="8" fill="#4B4B4B"/><rect x="-54" y="414" width="30" height="14" rx="3" fill="#8A8A8A"/><circle cx="40" cy="430" r="9" fill="#B8321F"/>
  <path class="flame" d="M-30 394Q-34 374 -20 364Q-18 380 -10 378Q0 384 -6 394Z" fill="#F29A2E"/><path class="flame" d="M10 394Q6 370 20 360Q22 378 30 376Q38 384 32 394Z" fill="#F29A2E"/>
  <path d="M-100 360H100Q94 396 0 398Q-94 396 -100 360Z" fill="#2F2F2F"/><ellipse cx="0" cy="360" rx="100" ry="16" fill="#C98F2E"/><ellipse cx="-20" cy="356" rx="30" ry="5" fill="#E6B45A"/>
  <path d="M-128 356H-100M100 356H128" stroke="#2F2F2F" stroke-width="8" stroke-linecap="round"/>
  <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"><path class="steam" d="M-40 330q-10-16 0-30t0-30"/><path class="steam d2" d="M0 326q-10-16 0-30t0-30"/><path class="steam d3" d="M40 330q-10-16 0-30t0-30"/></g></g>
  <g transform="translate(700 404)"><rect x="0" y="0" width="120" height="20" rx="4" fill="#7A4A2A"/><rect x="10" y="20" width="12" height="70" fill="#6B4228"/><rect x="98" y="20" width="12" height="70" fill="#6B4228"/><g transform="translate(24 -40) scale(.8)">${IC.canting}</g></g></svg>`;},
 halaman(kotor){const air=kotor?'url(#gDirty)':'url(#gWater)';
  const ikan=kotor?`<g transform="translate(300 330) rotate(180)"><path d="M-20 0Q0 -12 20 0Q0 12 -20 0Z" fill="#9A9A9A"/><path d="M20 0l10 -8v16z" fill="#9A9A9A"/></g><text x="292" y="336" font-size="10" fill="#333">x</text><g transform="translate(620 346) rotate(170)"><path d="M-20 0Q0 -12 20 0Q0 12 -20 0Z" fill="#9A9A9A"/><path d="M20 0l10 -8v16z" fill="#9A9A9A"/></g><g fill="#EDE6DA" opacity=".85"><ellipse cx="200" cy="312" rx="30" ry="6"/><ellipse cx="460" cy="322" rx="40" ry="7"/><ellipse cx="760" cy="316" rx="34" ry="6"/></g>`
    :`<g fill="#F29A2E"><path d="M300 330q14-10 28 0q-14 10-28 0zm28 0l8-6v12z"/><path d="M640 342q14-10 28 0q-14 10-28 0zm28 0l8-6v12z"/></g><g stroke="#fff" stroke-width="3" opacity=".6" fill="none"><path d="M140 318q20-6 40 0M500 336q20-6 40 0M780 322q20-6 40 0"/></g><g fill="#3E8E4F"><path d="M90 300q6-30 2-50M104 300q10-26 16-44M118 300q2-24-6-40" stroke="#3E8E4F" stroke-width="4"/></g>`;
  return svgOpen+`<rect width="960" height="540" fill="${kotor?'url(#gSkyAbu)':'url(#gSky)'}"/>
  <path d="M0 240Q240 196 480 226T960 216V300H0Z" fill="${kotor?'#8E9A7A':'#8DBE78'}"/>${pohon(80,240,.8,kotor?'#6E7A5E':'#5E8C55')}${pohon(420,226,.7,kotor?'#6E7A5E':'#6E9E5E')}${pohon(880,230,.85,kotor?'#6E7A5E':'#5E8C55')}
  <path d="M0 286Q240 270 480 290T960 284V366Q720 354 480 370T0 360Z" fill="${air}"/>${ikan}
  <path d="M0 360Q240 346 480 368T960 360V540H0Z" fill="${kotor?'#B79A74':'#CDA36B'}"/>
  <line x1="60" y1="100" x2="60" y2="420" stroke="#6B4228" stroke-width="10"/><line x1="900" y1="100" x2="900" y2="420" stroke="#6B4228" stroke-width="10"/>
  <path d="M60 110Q480 170 900 110" stroke="#5A3E2B" stroke-width="3" fill="none"/>
  <g ${kotor?'filter="url(#fGrey)" opacity=".7"':''}><rect class="sway" x="140" y="120" width="110" height="150" fill="url(#pMerah)"/><rect class="sway" x="290" y="134" width="110" height="150" fill="url(#pKuning)"/><rect class="sway" x="560" y="134" width="110" height="150" fill="url(#pHijau)"/><rect class="sway" x="710" y="120" width="110" height="150" fill="url(#pBiru)"/></g>
  <g transform="translate(470 410)"><path d="M-80 0H80L68 80H-68Z" fill="#6B4228"/><ellipse cx="0" cy="0" rx="80" ry="16" fill="#8E5A36"/><ellipse cx="0" cy="2" rx="68" ry="11" fill="#B8321F"/></g>
  <g transform="translate(680 430) scale(.8)"><path d="M-80 0H80L68 80H-68Z" fill="#6B4228"/><ellipse cx="0" cy="0" rx="80" ry="16" fill="#8E5A36"/><ellipse cx="0" cy="2" rx="68" ry="11" fill="#F2B632"/></g>
  <g transform="translate(830 452) scale(.7)"><path d="M-80 0H80L68 80H-68Z" fill="#6B4228"/><ellipse cx="0" cy="0" rx="80" ry="16" fill="#8E5A36"/><ellipse cx="0" cy="2" rx="68" ry="11" fill="#2F5DA8"/></g></svg>`;},
 sungai(){return BG.halaman(true);},
 galeri(){const fr=[['pKuning','kembang','Kembang Bayem'],['pMerah','beras','Beras Utah'],['pBiru','bandeng','Bandeng'],['pHijau','udang','Udang']];
  let f='';fr.forEach(([p,m,l],i)=>{const x=110+i*200;f+=`<g transform="translate(${x} 96)"><path d="M-20 -40L20 -40L60 250L-60 250Z" fill="url(#gSpot)" opacity=".5"/><rect x="-8" y="-8" width="156" height="186" fill="#8E5A36"/><rect x="0" y="0" width="140" height="170" fill="url(#${p})"/><rect x="18" y="26" width="104" height="104" rx="52" fill="#FFF6E4" opacity=".92"/><g transform="translate(34 42) scale(1.12)">${IC[m]}</g><rect x="10" y="196" width="120" height="30" rx="6" fill="#FFF6E4"/><text x="70" y="217" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-weight="700" font-size="17" fill="#2A1A10">${l}</text></g>`;});
  return svgOpen+`<rect width="960" height="540" fill="#F3E3C3"/><rect width="960" height="40" fill="url(#pHijau)"/><rect y="40" width="960" height="8" fill="#6B4228"/>${f}
  <rect y="400" width="960" height="140" fill="url(#gFloor)"/><path d="M0 440H960M0 486H960" stroke="#6B4228" stroke-width="3" opacity=".5"/>
  <g transform="translate(400 440)"><rect x="0" y="0" width="160" height="18" rx="6" fill="#7A4A2A"/><rect x="12" y="18" width="12" height="40" fill="#6B4228"/><rect x="136" y="18" width="12" height="40" fill="#6B4228"/></g></svg>`;}
};
const FX={
 luntur(){return `<div class="ov"><svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMax slice"><rect width="960" height="540" fill="rgba(40,30,60,.25)"/><g transform="translate(300 90)"><rect x="0" y="0" width="360" height="270" fill="#FFFDF6" stroke="#CDBB98" stroke-width="4"/><g filter="url(#fBlur)" opacity=".85"><circle cx="90" cy="90" r="60" fill="#B8321F"/><circle cx="200" cy="130" r="70" fill="#2F5DA8"/><circle cx="270" cy="80" r="50" fill="#3E8E4F"/><circle cx="150" cy="200" r="60" fill="#8E5A36"/></g><path d="M60 270v30M140 270v44M230 270v24M300 270v36" stroke="#6B5A7A" stroke-width="8" stroke-linecap="round" opacity=".7"/></g></svg></div>`;},
 asap(){return `<div class="ov"><svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMax slice"><rect width="960" height="540" fill="rgba(160,40,20,.22)"/><g transform="translate(480 0)"><path class="flame" d="M-90 360Q-110 300 -70 260Q-66 300 -40 300Q-50 250 0 210Q0 260 30 280Q70 240 70 280Q100 320 90 360Z" fill="#F2682E" opacity=".9"/><path class="flame" d="M-50 360Q-60 320 -34 300Q-30 324 -10 322Q-10 290 14 270Q18 304 40 314Q54 334 48 360Z" fill="#FFD35A"/></g><g fill="#6E6A66" opacity=".6"><circle class="smoke" cx="420" cy="220" r="60"/><circle class="smoke d2" cx="520" cy="190" r="70"/><circle class="smoke d3" cx="470" cy="140" r="80"/><circle class="smoke d2" cx="360" cy="160" r="50"/><circle class="smoke" cx="600" cy="150" r="56"/></g></svg></div>`;},
 kosong(){return `<div class="ov"><svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMax slice"><g transform="translate(330 120)"><rect x="0" y="0" width="300" height="220" fill="#FFFDF6" stroke="#CDBB98" stroke-width="4"/><g transform="translate(250 -30) rotate(20)">${IC.canting}</g><g transform="translate(120 70) scale(1.2)">${IC.malam}</g><text x="150" y="200" text-anchor="middle" font-family="'Baloo 2',sans-serif" font-size="22" fill="#9A8E78">kain tetap kosong</text></g></svg></div>`;},
 sumur(){return `<div class="ov"><svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMax slice"><rect width="960" height="540" fill="rgba(60,40,60,.25)"/><g transform="translate(480 250)"><rect x="-70" y="0" width="140" height="120" fill="#9A9A9A" stroke="#6E6E6E" stroke-width="6"/><ellipse cx="0" cy="0" rx="70" ry="18" fill="#5A4A6E"/><path d="M-70 -120V0M70 -120V0M-80 -120H80" stroke="#6B4228" stroke-width="10"/><path d="M-160 120q40 -60 80 -40t80 0t80 -30" stroke="#7A5A7E" stroke-width="16" fill="none" opacity=".7" stroke-linecap="round"/></g></svg></div>`;}
};


window.GB={IC,ic,anak,sekar,kilat,ACT,BG,FX,pohon,kepala,KULIT,RAMBUT,pasangDefs,gapuraMini,gapuraLapisan,GAPURA};
})();
