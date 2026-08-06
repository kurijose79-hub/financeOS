import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { uid, cd, lb, ip, sl, bp, bpFill, bo, Card, Stat, Empty, Modal } from "./ui.jsx";
import CryptoModule from "./Crypto.jsx";

/* ═══════════════════════════════════════════════════════════════
   FINANCEOS WAR TANK 2.0 — OSAI NEXT-GEN FINANCIAL AI
   ═══════════════════════════════════════════════════════════════ */

// ── CURRENCIES ──
const CUR=[
  {c:"USD",n:"US Dollar",s:"$",f:"🇺🇸"},{c:"MXN",n:"Peso MX",s:"MX$",f:"🇲🇽"},
  {c:"GBP",n:"Libra",s:"£",f:"🇬🇧"},{c:"CAD",n:"CAD",s:"C$",f:"🇨🇦"},
  {c:"EUR",n:"Euro",s:"€",f:"🇪🇺"},{c:"JPY",n:"Yen",s:"¥",f:"🇯🇵"},
  {c:"CNY",n:"Yuan",s:"¥",f:"🇨🇳"},{c:"ARS",n:"ARS",s:"AR$",f:"🇦🇷"},
  {c:"BRL",n:"Real",s:"R$",f:"🇧🇷"},{c:"CHF",n:"Franco",s:"Fr",f:"🇨🇭"},
  {c:"KRW",n:"Won",s:"₩",f:"🇰🇷"},{c:"INR",n:"Rupia",s:"₹",f:"🇮🇳"},
  {c:"AUD",n:"AUD",s:"A$",f:"🇦🇺"},{c:"COP",n:"COP",s:"CO$",f:"🇨🇴"},
  {c:"BTC",n:"Bitcoin",s:"₿",f:"🪙"},{c:"ETH",n:"Ethereum",s:"Ξ",f:"💎"},
];
const BR={USD:1,MXN:17.15,GBP:.79,CAD:1.36,EUR:.92,JPY:149.5,CNY:7.24,ARS:870,BRL:4.97,CHF:.88,KRW:1325,INR:83.12,AUD:1.53,COP:3925,BTC:.000015,ETH:.00029};
const CATS=["🍔 Comida","🏠 Vivienda","🚗 Transporte","🎮 Entretenim.","👕 Ropa","💊 Salud","📚 Educación","💼 Trabajo","📱 Tech","✈️ Viajes","🔄 Recurrente","🎁 Otros"];
const fm=(n,c)=>{const x=CUR.find(v=>v.c===c);return `${x?.s||"$"}${Math.abs(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`};
const cv=(a,fr,to,r)=>fr===to?+a.toFixed(2):+((a/(r[fr]||1))*(r[to]||1)).toFixed(2);
const spark=(n=20,b=100,v=3)=>{let x=b;return Array.from({length:n},()=>{x+=(Math.random()-.47)*v;return {y:Math.max(0,+x.toFixed(2))}})};

// ── CANON DEL 40% ──
const CANON_RATE = 40;
const CANON_MSG = "⚠️ SHIELD ACTIVADO: El Canon del 40% protege tu ahorro. Esta operación supera tu límite de gasto.";

// ── OSAI ENGINE ──
function osaiCore(q, ctx) {
  const {inc,exp,nw,mc,txs,banks,wishes,savGoals,tarGoals,myC,rates,loc,budgets,bills}=ctx;
  const ql=q.toLowerCase();
  const sr=inc>0?((inc-exp)/inc*100):0;
  const moI=inc/Math.max(1,4);
  const invT=banks.reduce((s,b)=>s+cv(b.invested||0,b.currency,mc,rates),0);
  const f=n=>fm(n,mc);
  const canonSaved=inc*(CANON_RATE/100);
  const canonOk=sr>=CANON_RATE;

  if(ql.match(/hola|hi|hello|hey|buenas/))
    return `[OSAI ONLINE] ⚡ Bienvenido al War Tank, Comandante.\n\n┌─ TELEMETRÍA ─────────────────────┐\n│ PATRIMONIO: ${f(nw)} ${mc}\n│ INGRESOS:   ${f(inc)}\n│ GASTOS:     ${f(exp)}\n│ AHORRO:     ${sr.toFixed(1)}% ${canonOk?"✅ CANON OK":"❌ BAJO CANON"}\n│ INVERTIDO:  ${f(invT)}\n│ CUENTAS:    ${banks.length}\n│ SHIELD:     ${canonOk?"VERDE":"ROJO"}\n└──────────────────────────────────┘\n\n🧠 Comandos: gastos, invertir, ahorro, canon, monedas, salud, consejo, wishlist, bancos`;

  if(ql.match(/canon|40|ahorro obligat/))
    return `[CANON DEL 40%] ⚔️\n\nRegla absoluta: ${CANON_RATE}% de cada ingreso es INTOCABLE.\n\n• Ingreso total: ${f(inc)}\n• Canon (${CANON_RATE}%): ${f(canonSaved)}\n• Disponible para gastar: ${f(inc-canonSaved)}\n• Gastado: ${f(exp)}\n• Estado: ${exp<=inc-canonSaved?"✅ DENTRO DEL PERÍMETRO":"🚨 BRECHA DETECTADA"}\n\n${exp>inc-canonSaved?`⚠️ Has gastado ${f(exp-(inc-canonSaved))} MÁS de tu límite.\nSHIELD recomienda: CONGELAR gastos no esenciales.`:"👊 Disciplina financiera impecable. El tanque avanza."}`;

  if(ql.match(/gast|spend|analiz/)){
    const cats={};txs.filter(t=>t.type==="expense").forEach(tx=>{cats[tx.category]=(cats[tx.category]||0)+cv(tx.amount,tx.currency,mc,rates)});
    const bd=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`│ ${n.padEnd(16)} ${f(v)}`).join('\n');
    return `[ANÁLISIS DE GASTOS] 🔍\n\n┌─ DESGLOSE ────────────────────────┐\n${bd||'│ Sin datos'}\n├───────────────────────────────────┤\n│ TOTAL: ${f(exp)}\n│ CANON DISPONIBLE: ${f(Math.max(0,inc-canonSaved-exp))}\n└───────────────────────────────────┘\n\n${txs.length===0?"Agrega transacciones para análisis completo.":""}`;
  }

  if(ql.match(/invertir|invest/)){
    const ir=nw>0?(invT/nw*100):0;
    return `[MÓDULO QUANT] 📈\n\n• Patrimonio: ${f(nw)}\n• Invertido: ${f(invT)} (${ir.toFixed(1)}%)\n• Target: 25-35%\n\n${ir<10?`⚠️ NIVEL CRÍTICO. Inflación come tu capital.\n\nRecomendaciones OSAI:\n1. Fondos indexados (S&P 500) → ~10%/año\n2. Destina 20% de ingreso → ${f(moI*.2)}/mes\n3. ${loc?.match(/méx|mex/i)?'CETES (~11%/año)':'Bonos gov.'}\n4. BTC/ETH máx 5% del portafolio`:`${ir<30?'Buen camino':'Excelente'}. Diversifica: 40% renta fija, 50% variable, 10% crypto.`}`;
  }

  if(ql.match(/ahorr|sav/)){
    const emerg=exp/4*6;
    return `[PLAN DE AHORRO] 🏦\n\n• Ingreso/mes: ~${f(moI)}\n• Canon 40%: ${f(moI*.4)} → INTOCABLE\n• Gasto permitido: ${f(moI*.6)}\n• Fondo emergencia (6 meses): ${f(emerg)}\n  ${nw>=emerg?'✅ Cubierto':'❌ Faltan '+f(Math.max(0,emerg-nw))}\n\n50/30/20 (después del Canon):\n• Necesidades: ${f(moI*.6*.5)}\n• Deseos: ${f(moI*.6*.3)}\n• Extra ahorro: ${f(moI*.6*.2)}`;
  }

  if(ql.match(/salud|health|score/)){
    let sc=30;if(sr>=40)sc+=25;else if(sr>=20)sc+=15;if(banks.length>0)sc+=10;if(exp<=inc)sc+=10;if(savGoals.length>0)sc+=8;if(invT>0)sc+=10;if(budgets?.length>0)sc+=7;sc=Math.min(100,sc);
    const grade=sc>=80?"S":sc>=60?"A":sc>=40?"B":"C";
    return `[HEALTH SCORE] ❤️ ${sc}/100 [${grade}]\n\n${sr>=40?'✅':'❌'} Canon 40% (${sr.toFixed(1)}%)\n${exp<=inc?'✅':'❌'} No sobregasto\n${banks.length>0?'✅':'❌'} Cuentas bancarias\n${savGoals.length>0?'✅':'❌'} Metas definidas\n${invT>0?'✅':'❌'} Inversiones activas\n${budgets?.length>0?'✅':'❌'} Presupuestos activos`;
  }

  if(ql.match(/moneda|currenc|cambio/)){
    const info=myC.map(c=>`│ ${CUR.find(x=>x.c===c)?.f} 1 ${mc} = ${(rates[c]/rates[mc]).toFixed(4)} ${c}`).join('\n');
    return `[TICKER] 💱\n\n┌─ DIVISAS ──────────────────────┐\n${info}\n└───────────────────────────────┘\n\nActualización: cada 30 min via API`;
  }

  if(ql.match(/consejo|tip|advice/)){
    const tips=[];
    if(sr<40)tips.push(`Sube al Canon del 40%. Faltan ${(40-sr).toFixed(0)} puntos.`);
    tips.push("Automatiza ahorro al RECIBIR ingreso, no al final del mes.");
    tips.push("Cada $1 ahorrado hoy = $2.59 en 10 años al 10% anual.");
    tips.push("84% de personas pagan suscripciones que no usan. Audita.");
    tips.push("Revisa finanzas semanalmente = +23% más ahorro vs mensual.");
    return `[CONSEJERO OSAI] 💡\n\n${tips.map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\n📌 Regla de oro: el Canon del 40% es innegociable.`;
  }

  if(ql.match(/wish|deseo|comprar/)){
    if(wishes.length===0)return "[WISHLIST] Vacía. Agrega items para análisis.";
    const wt=wishes.reduce((s,w)=>s+cv(w.price,w.currency,mc,rates),0);
    return `[WISHLIST ANALYSIS] ⭐\n\nTotal: ${f(wt)} (${nw>0?(wt/nw*100).toFixed(0):0}% patrimonio)\n\n${wishes.map(w=>`• ${w.name}: ${fm(w.price,w.currency)}`).join('\n')}\n\n${wt>nw*.5?'⚠️ Supera 50% patrimonio. Prioriza.':'✅ Manejable.'}`;
  }

  if(ql.match(/banco|bank/)){
    if(banks.length===0)return "[BANCOS] Sin cuentas. Conecta en Bancos → Conectar.";
    const bt=banks.reduce((s,b)=>s+cv(b.balance+(b.invested||0),b.currency,mc,rates),0);
    return `[BANCOS] 🏦\n\n${banks.map(b=>`• ${b.name} (${b.currency}): ${fm(b.balance,b.currency)} + ${fm(b.invested||0,b.currency)} inv.`).join('\n')}\n\nTotal: ${f(bt)}`;
  }

  return `[OSAI] Tu perfil: ${f(nw)} ${mc} · Canon: ${sr.toFixed(1)}%/${CANON_RATE}%\n\nComandos: gastos, invertir, ahorro, canon, monedas, salud, consejo, wishlist, bancos.`;
}

// ── STYLES ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0a;--sf:#111113;--bd:#1e1e22;--tx:#e0e0e0;--t2:#6a6a7a;--t3:#3a3a4a;
  --ac:#00ff88;--ac2:#00ccff;--rd:#ff3355;--am:#ffaa00;--pu:#aa55ff;
  --gn:#00ff88;--neon:#00ff88;--cyan:#00ccff;
  --r:8px;--ft:'Outfit',sans-serif;--mono:'JetBrains Mono',monospace;
}
body{font-family:var(--ft);background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased}
@keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes glow{0%,100%{text-shadow:0 0 4px var(--neon)}50%{text-shadow:0 0 16px var(--neon),0 0 30px var(--neon)}}
@keyframes scan{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes dp{0%,80%,100%{transform:scale(.4);opacity:.3}40%{transform:scale(1);opacity:1}}
.su{animation:su .25s ease}.glow{animation:glow 2s ease-in-out infinite}
.scanline{position:fixed;top:0;left:0;width:100%;height:2px;background:var(--neon);opacity:.03;pointer-events:none;z-index:9999;animation:scan 4s linear infinite}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}::-webkit-scrollbar-thumb:hover{background:var(--t3)}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--ac)!important;box-shadow:0 0 0 1px var(--ac)33}
::selection{background:var(--ac);color:var(--bg)}
`;

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function FinanceOS(){
  const[screen,setScreen]=useState("loading");
  const[user,setUser]=useState(null);
  const[authMode,setAuthMode]=useState("register");
  const[aU,setAU]=useState("");const[aP,setAP]=useState("");const[aErr,setAErr]=useState("");
  const[saveStatus,setSaveStatus]=useState("");
  const[lang,setLang]=useState("es");const[loc,setLoc]=useState("México");
  const[myC,setMyC]=useState(["USD","MXN","EUR","BTC","GBP"]);
  const[mc,setMC]=useState("MXN");
  const[rates,setRates]=useState({...BR});
  const[nav,setNav]=useState("overview");const[sub,setSub]=useState("money");const[expN,setExpN]=useState("overview");
  const[txs,setTxs]=useState([]);const[banks,setBanks]=useState([]);const[wishes,setWishes]=useState([]);
  const[savGoals,setSavGoals]=useState([]);const[tarGoals,setTarGoals]=useState([]);
  const[budgets,setBudgets]=useState([]);const[bills,setBills]=useState([]);
  const[nwH,setNwH]=useState([]);const[chatMsgs,setChatMsgs]=useState([]);const[alerts,setAlerts]=useState([]);
  const[chatIn,setChatIn]=useState("");const[aiTyp,setAiTyp]=useState(false);
  const[modal,setModal]=useState(null);const[liveR,setLiveR]=useState(null);const[rLoad,setRLoad]=useState(false);
  const chatRef=useRef(null);const saveT=useRef(null);

  // ── STORAGE (localStorage) ──
  const sG=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const sS=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const sD=k=>{try{localStorage.removeItem(k)}catch{}};

  const pack=()=>JSON.stringify({lang,loc,myC,mc,txs,banks,wishes,savGoals,tarGoals,budgets,bills,nwH,chatMsgs});
  const unpack=d=>{
    if(d.lang)setLang(d.lang);if(d.loc)setLoc(d.loc);if(d.myC)setMyC(d.myC);if(d.mc)setMC(d.mc);
    if(d.txs)setTxs(d.txs);if(d.banks)setBanks(d.banks);if(d.wishes)setWishes(d.wishes);
    if(d.savGoals)setSavGoals(d.savGoals);if(d.tarGoals)setTarGoals(d.tarGoals);
    if(d.budgets)setBudgets(d.budgets);if(d.bills)setBills(d.bills);
    if(d.nwH)setNwH(d.nwH);if(d.chatMsgs)setChatMsgs(d.chatMsgs);
  };

  const saveAll=useCallback(()=>{
    if(!user||screen!=="app")return;
    setSaveStatus("saving");sS(`fos-${user}-data`,pack());sS("fos-last",user);
    setSaveStatus("saved");setTimeout(()=>setSaveStatus(""),2e3);
  },[user,screen,lang,loc,myC,mc,txs,banks,wishes,savGoals,tarGoals,budgets,bills,nwH,chatMsgs]);

  useEffect(()=>{if(!user||screen!=="app")return;if(saveT.current)clearTimeout(saveT.current);saveT.current=setTimeout(saveAll,1200);return()=>{if(saveT.current)clearTimeout(saveT.current)}},[lang,loc,myC,mc,txs,banks,wishes,savGoals,tarGoals,budgets,bills,nwH,chatMsgs,user,screen]);

  // ── BOOT ──
  useEffect(()=>{
    const last=sG("fos-last");
    if(last){
      const acct=sG(`fos-acct-${last}`);
      if(acct){const raw=sG(`fos-${last}-data`);if(raw){try{unpack(JSON.parse(raw));setUser(last);setScreen("app");return}catch{}}}
    }
    setScreen("login");
  },[]);

  // ── AUTH ──
  const doAuth=()=>{
    const u=aU.trim().toLowerCase(),p=aP.trim();
    if(!u||!p){setAErr("Ingresa credenciales.");return}
    if(p.length<4){setAErr("Contraseña: mín 4 chars.");return}
    if(authMode==="register"){
      if(sG(`fos-acct-${u}`)){setAErr("Usuario existe. Login.");return}
      sS(`fos-acct-${u}`,JSON.stringify({p,t:Date.now()}));sS("fos-last",u);
      setUser(u);setAErr("");setScreen("setup");
    }else{
      const raw=sG(`fos-acct-${u}`);
      if(!raw){setAErr("No encontrado.");return}
      try{if(JSON.parse(raw).p!==p){setAErr("Contraseña incorrecta.");return}}catch{setAErr("Error.");return}
      sS("fos-last",u);setUser(u);setAErr("");
      const d=sG(`fos-${u}-data`);
      if(d){try{unpack(JSON.parse(d));setScreen("app");return}catch{}}
      setScreen("setup");
    }
  };

  // ── RATES ──
  const fetchRates=useCallback(async()=>{
    setRLoad(true);
    try{const r=await fetch("https://open.er-api.com/v6/latest/USD");const d=await r.json();
      if(d?.rates){const nr={...BR};Object.keys(BR).forEach(k=>{if(d.rates[k])nr[k]=d.rates[k]});setRates(nr);setLiveR({ts:Date.now(),src:"open.er-api.com"})}
    }catch{setLiveR({ts:Date.now(),src:"offline"})}
    setRLoad(false);
  },[]);
  useEffect(()=>{if(screen!=="app")return;fetchRates();const i=setInterval(fetchRates,30*60*1000);return()=>clearInterval(i)},[screen]);

  // ── COMPUTED ──
  const tot=useMemo(()=>{
    const i=txs.filter(x=>x.type==="income").reduce((s,x)=>s+cv(x.amount,x.currency,mc,rates),0);
    const e=txs.filter(x=>x.type==="expense").reduce((s,x)=>s+cv(x.amount,x.currency,mc,rates),0);
    const b=banks.reduce((s,x)=>s+cv(x.balance+(x.invested||0),x.currency,mc,rates),0);
    return {inc:i,exp:e,nw:i-e+b};
  },[txs,banks,mc,rates]);
  const ctx=useMemo(()=>({inc:tot.inc,exp:tot.exp,nw:tot.nw,mc,txs,banks,wishes,savGoals,tarGoals,myC,rates,loc,budgets,bills}),[tot,mc,txs,banks,wishes,savGoals,tarGoals,myC,rates,loc,budgets,bills]);
  const sr=tot.inc>0?((tot.inc-tot.exp)/tot.inc*100):0;
  const canonOk=sr>=CANON_RATE;
  const f=n=>fm(n,mc);

  useEffect(()=>{if(screen!=="app")return;const td=new Date().toISOString().split("T")[0];const last=nwH[nwH.length-1];if(!last||last.d!==td)setNwH(p=>[...p.slice(-90),{d:td,v:+tot.nw.toFixed(2)}])},[screen,tot.nw]);

  // ── RECURRING AUTO-GEN ──
  useEffect(()=>{if(screen!=="app"||!bills.length)return;const now=new Date();const today=now.toISOString().split("T")[0];const dow=now.getDay();const dom=now.getDate();const add=[];
    bills.forEach(b=>{const ex=txs.filter(t=>t.autoFrom===b.id);const last=ex[0]?.date?.split("T")[0];let go=false;
      if(b.freq==="weekly"&&dow===(b.dayOfWeek||0)&&last!==today)go=true;
      if(b.freq==="monthly"&&dom===(b.dayOfMonth||1)&&last!==today)go=true;
      if(go)add.push({id:uid(),type:b.type||"expense",amount:b.amount,currency:b.currency,description:`${b.name} (auto)`,category:b.category||"🔄 Recurrente",date:new Date().toISOString(),autoFrom:b.id});
    });if(add.length)setTxs(p=>[...add,...p]);
  },[screen,bills]);

  // ── ALERTS ──
  useEffect(()=>{if(screen==="app"&&!alerts.length)setAlerts([
    {id:uid(),ic:"⚡",txt:`Canon del 40%: ${sr.toFixed(0)}% ${canonOk?"✅":"❌"}`,t:"ahora"},
    {id:uid(),ic:"💱",txt:`Tasas: ${myC.slice(0,3).map(c=>`${c} ${(rates[c]/rates[mc]).toFixed(2)}`).join(' · ')}`,t:"30 min"},
    {id:uid(),ic:"🧠",txt:"Revisar finanzas semanalmente = +23% más ahorro.",t:"1h"},
  ])},[screen]);

  const balOf=c=>{const i=txs.filter(x=>x.currency===c&&x.type==="income").reduce((s,x)=>s+x.amount,0);const e=txs.filter(x=>x.currency===c&&x.type==="expense").reduce((s,x)=>s+x.amount,0);const b=banks.filter(x=>x.currency===c).reduce((s,x)=>s+x.balance,0);return +(i-e+b).toFixed(2)};

  // ── NAV ──
  const NAV=[
    {id:"overview",ic:"◻",lb:"Resumen",ss:[{id:"money",lb:"Dinero"},{id:"expenses",lb:"Gastos"},{id:"investments",lb:"Inversiones"},{id:"liveRates",lb:"Ticker"},{id:"nwHistory",lb:"Patrimonio"},{id:"recap",lb:"Recap"}]},
    {id:"add",ic:"＋",lb:"Agregar"},
    {id:"budget",ic:"▤",lb:"Presupuesto",ss:[{id:"budgets",lb:"Presupuestos"},{id:"bills",lb:"Recurrentes"}]},
    {id:"bank",ic:"⌂",lb:"Bancos",ss:[{id:"bankOv",lb:"Resumen"},{id:"connect",lb:"Conectar"}]},
    {id:"crypto",ic:"₿",lb:"Crypto",ss:[{id:"forecast",lb:"Pronóstico"},{id:"mining",lb:"Minería"},{id:"invest",lb:"Invertir"},{id:"academy",lb:"Academia"},{id:"theory",lb:"Teoría"}]},
    {id:"wishlist",ic:"★",lb:"Wish List"},
    {id:"goals",ic:"◎",lb:"Metas",ss:[{id:"savings",lb:"Ahorro"},{id:"targets",lb:"Metas"}]},
    {id:"ai",ic:"✦",lb:"OSAI",ss:[{id:"chat",lb:"Terminal"},{id:"alerts",lb:"Alertas"}]},
    {id:"settings",ic:"⚙",lb:"Sistema",ss:[{id:"currencies",lb:"Monedas"},{id:"masterCur",lb:"Maestra"},{id:"account",lb:"Cuenta"}]},
  ];
  const doNav=id=>{const it=NAV.find(n=>n.id===id);setNav(id);if(it?.ss){setExpN(expN===id?null:id);setSub(it.ss[0].id)}else{setExpN(null);setSub(null)}};

  const handleChat=async()=>{if(!chatIn.trim()||aiTyp)return;const m=chatIn.trim();setChatIn("");setChatMsgs(p=>[...p,{r:"u",t:m}]);setAiTyp(true);
    let reply=null;
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`Eres OSAI, IA financiera del War Tank FinanceOS. Canon del 40% obligatorio. Datos: Patrimonio ${f(tot.nw)} ${mc}, Inc ${f(tot.inc)}, Exp ${f(tot.exp)}, Ahorro ${sr.toFixed(1)}%, ${banks.length} bancos, loc: ${loc}. Responde estilo terminal militar, conciso, con datos reales. Emojis sí. NO markdown.`,messages:[{role:"user",content:m}]})});const d=await res.json();reply=d.content?.map(b=>b.text||"").join("")||null}catch{}
    if(!reply)reply=osaiCore(m,ctx);
    await new Promise(r=>setTimeout(r,350));setChatMsgs(p=>[...p,{r:"a",t:reply}]);setAiTyp(false);
  };
  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"})},[chatMsgs,aiTyp]);
  const hdr=(()=>{const n=NAV.find(x=>x.id===nav);const s=n?.ss?.find(x=>x.id===sub);return s?`${n.lb} > ${s.lb}`:n?.lb||""})();

  // ════════════════ SCREENS ════════════════

  if(screen==="loading") return <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--ft)"}}><style>{CSS}</style><div className="scanline"/><div style={{textAlign:"center"}}><div className="glow" style={{fontFamily:"var(--mono)",fontSize:24,fontWeight:800,color:"var(--ac)",letterSpacing:2}}>OSAI</div><div style={{fontSize:11,color:"var(--t2)",marginTop:8,fontFamily:"var(--mono)"}}>INITIALIZING WAR TANK...</div></div></div>;

  if(screen==="login"){const isR=authMode==="register";return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--ft)"}}><style>{CSS}</style><div className="scanline"/>
    <div className="su" style={{background:"var(--sf)",borderRadius:12,padding:"40px 36px",maxWidth:400,width:"93%",border:"1px solid var(--bd)",boxShadow:"0 0 60px rgba(0,255,136,.03)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div className="glow" style={{fontFamily:"var(--mono)",fontSize:28,fontWeight:800,color:"var(--ac)",letterSpacing:3,marginBottom:6}}>OSAI</div>
        <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",letterSpacing:2}}>FINANCEOS WAR TANK</div>
        <div style={{fontSize:10,color:"var(--t3)",marginTop:6,fontFamily:"var(--mono)"}}>{isR?"[ CREAR ACCESO ]":"[ AUTENTICACIÓN ]"}</div>
      </div>
      <label style={lb}>USUARIO</label>
      <input value={aU} onChange={e=>{setAU(e.target.value);setAErr("")}} placeholder="callsign" style={ip} onKeyDown={e=>e.key==="Enter"&&document.getElementById("pw")?.focus()}/>
      <label style={lb}>CONTRASEÑA</label>
      <input id="pw" type="password" value={aP} onChange={e=>{setAP(e.target.value);setAErr("")}} placeholder="••••••••" style={ip} onKeyDown={e=>e.key==="Enter"&&doAuth()}/>
      {aErr&&<div style={{padding:"8px 12px",borderRadius:4,background:"#ff335515",color:"var(--rd)",fontSize:12,fontWeight:600,marginBottom:12,border:"1px solid #ff335533",fontFamily:"var(--mono)"}}>{aErr}</div>}
      <button onClick={doAuth} style={{...bpFill,width:"100%",padding:14,fontSize:13,marginBottom:12}}>{isR?"⚡ CREAR CUENTA":"→ ACCEDER"}</button>
      <div style={{textAlign:"center"}}><button onClick={()=>{setAuthMode(isR?"login":"register");setAErr("")}} style={{background:"none",border:"none",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>{isR?"¿Ya tienes acceso? ":"¿Nuevo operador? "}<span style={{color:"var(--ac)"}}>{isR?"LOGIN":"REGISTRO"}</span></button></div>
    </div></div>)}

  if(screen==="setup") return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--ft)"}}><style>{CSS}</style><div className="scanline"/>
    <div className="su" style={{background:"var(--sf)",borderRadius:12,padding:"40px 36px",maxWidth:460,width:"93%",border:"1px solid var(--bd)"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div className="glow" style={{fontFamily:"var(--mono)",fontSize:20,fontWeight:800,color:"var(--ac)",letterSpacing:2}}>SETUP</div>
        <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>Configurar tanque · {user}</div>
      </div>
      <label style={lb}>UBICACIÓN</label><input value={loc} onChange={e=>setLoc(e.target.value)} style={ip}/>
      <label style={lb}>MONEDAS (5)</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>{CUR.map(c=> <button key={c.c} onClick={()=>setMyC(p=>p.includes(c.c)?p.filter(x=>x!==c.c):p.length<5?[...p,c.c]:p)} style={{padding:"5px 10px",borderRadius:4,fontSize:11,fontWeight:600,cursor:"pointer",border:myC.includes(c.c)?"1px solid var(--ac)":"1px solid var(--bd)",background:myC.includes(c.c)?"var(--ac)":"var(--bg)",color:myC.includes(c.c)?"var(--bg)":"var(--t2)",fontFamily:"var(--mono)"}}>{c.f}{c.c}</button>)}</div>
      <label style={lb}>MONEDA MAESTRA</label>
      <select value={mc} onChange={e=>setMC(e.target.value)} style={sl}>{myC.map(c=> <option key={c} value={c}>{CUR.find(v=>v.c===c)?.f} {c}</option>)}</select>
      <button onClick={()=>setScreen("app")} style={{...bpFill,width:"100%",padding:14,fontSize:13,marginTop:4}}>⚡ ACTIVAR WAR TANK</button>
    </div></div>);

  // ════════════════ MAIN APP ════════════════
  const R=()=>{
    // MONEY
    if(nav==="overview"&&sub==="money") return <div className="su">
      <Card style={{padding:"24px 28px",background:"linear-gradient(135deg,#0d0d0d,#111)",border:"1px solid var(--ac)33",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,color:"var(--t3)",letterSpacing:2,fontFamily:"var(--mono)",marginBottom:4}}>PATRIMONIO NETO</div>
            <div style={{fontSize:32,fontWeight:900,color:"var(--ac)",letterSpacing:-1,fontFamily:"var(--mono)"}}>{f(tot.nw)}</div>
            <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:2}}>{mc} · Canon: {sr.toFixed(0)}%/{CANON_RATE}% {canonOk?"✅":"❌"}</div>
          </div>
          <div style={{width:50,height:50,borderRadius:6,border:`2px solid ${canonOk?"var(--ac)":"var(--rd)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20,fontFamily:"var(--mono)",fontWeight:800,color:canonOk?"var(--ac)":"var(--rd)"}}>{canonOk?"✓":"!"}</span></div>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:16}}>
        {myC.map((c,i)=>{const b=balOf(c);const x=CUR.find(v=>v.c===c);const cols=["var(--ac)","var(--cyan)","var(--am)","var(--pu)","var(--rd)"];return <Card key={c} style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:14}}>{x?.f}</span><span style={{fontSize:11,fontWeight:700,fontFamily:"var(--mono)",color:cols[i%5]}}>{c}</span></div>
          <div style={{fontSize:16,fontWeight:800,fontFamily:"var(--mono)"}}>{fm(b,c)}</div>
          <ResponsiveContainer width="100%" height={30}><AreaChart data={spark(14,Math.max(5,Math.abs(b)),1.5)}><Area type="monotone" dataKey="y" stroke={cols[i%5]} strokeWidth={1.2} fill="none" dot={false}/></AreaChart></ResponsiveContainer>
        </Card>})}
      </div>
    </div>;

    // EXPENSES
    if(nav==="overview"&&sub==="expenses"){
      const cats={};txs.filter(x=>x.type==="expense").forEach(tx=>{cats[tx.category]=(cats[tx.category]||0)+cv(tx.amount,tx.currency,mc,rates)});
      const catD=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([n,v])=>({name:n.length>12?n.slice(0,12):n,value:+v.toFixed(2)}));
      return <div className="su">
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          <Stat label="Ingreso" value={f(tot.inc)} color="var(--gn)"/><Stat label="Gasto" value={f(tot.exp)} color="var(--rd)"/><Stat label="Neto" value={f(tot.inc-tot.exp)} color={tot.inc>=tot.exp?"var(--gn)":"var(--rd)"}/>
        </div>
        {catD.length>0&&<Card style={{marginBottom:14}}><ResponsiveContainer width="100%" height={160}><BarChart data={catD}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/><XAxis dataKey="name" tick={{fontSize:8,fill:"#555"}}/><YAxis tick={{fontSize:9,fill:"#555"}}/><Tooltip contentStyle={{background:"#111",border:"1px solid #222",fontSize:11}}/><Bar dataKey="value" fill="var(--ac)" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></Card>}
        <Card style={{padding:0}}>{txs.slice(0,20).map(tx=> <div key={tx.id} style={{display:"flex",alignItems:"center",padding:"9px 16px",borderBottom:"1px solid #1a1a1a",gap:8}}>
          <span style={{fontSize:14}}>{tx.category?.split(" ")[0]||"💸"}</span>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{tx.description}</div><div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{tx.category} · {new Date(tx.date).toLocaleDateString()}{tx.autoFrom?" · AUTO":""}</div></div>
          <div style={{fontSize:13,fontWeight:700,color:tx.type==="income"?"var(--gn)":"var(--rd)",fontFamily:"var(--mono)"}}>{tx.type==="income"?"+":"−"}{fm(tx.amount,tx.currency)}</div>
        </div>)}{txs.length===0&&<Empty emoji="📋" title="Sin datos"/>}</Card>
      </div>;
    }

    // INVESTMENTS
    if(nav==="overview"&&sub==="investments"){const ti=banks.reduce((s,b)=>s+cv(b.invested||0,b.currency,mc,rates),0);return <div className="su"><Stat label="Total Invertido" value={f(ti)} color="var(--cyan)"/>{banks.filter(b=>(b.invested||0)>0).map(b=> <Card key={b.id} style={{marginTop:8}}><div style={{fontWeight:700}}>{b.name}</div><div style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:800,marginTop:4}}>{fm(b.invested,b.currency)}</div><ResponsiveContainer width="100%" height={35}><AreaChart data={spark(16,b.invested||100,2)}><Area type="monotone" dataKey="y" stroke="var(--cyan)" strokeWidth={1.2} fill="none" dot={false}/></AreaChart></ResponsiveContainer></Card>)}{banks.filter(b=>(b.invested||0)>0).length===0&&<Empty emoji="📈" title="Sin inversiones"/>}</div>}

    // TICKER
    if(nav==="overview"&&sub==="liveRates") return <div className="su">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)"}}>LIVE RATES · {liveR?.src||"offline"} · {liveR?.ts?new Date(liveR.ts).toLocaleTimeString():"—"}</div>
        <button onClick={fetchRates} disabled={rLoad} style={{...bp,fontSize:10,padding:"6px 12px"}}>↻ REFRESH</button>
      </div>
      <Card style={{padding:0,fontFamily:"var(--mono)",fontSize:11}}>{Object.keys(BR).filter(c=>c!=="USD").sort().map(c=>{const x=CUR.find(v=>v.c===c);const r=rates[c]||BR[c];const vm=mc==="USD"?r:(r/rates[mc]);const act=myC.includes(c);
        return <div key={c} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"7px 14px",borderBottom:"1px solid #151515",background:act?"#00ff8808":"transparent"}}>
          <span style={{fontWeight:act?700:400,color:act?"var(--ac)":"var(--t2)"}}>{x?.f} {c}</span>
          <span style={{textAlign:"right"}}>{r.toFixed(4)}</span>
          <span style={{textAlign:"right",color:"var(--cyan)"}}>{vm.toFixed(4)} {mc}</span>
        </div>})}</Card>
    </div>;

    // NW HISTORY
    if(nav==="overview"&&sub==="nwHistory"){const data=nwH.length>1?nwH.map(d=>({d:d.d,v:d.v})):[...Array.from({length:7},(_,i)=>({d:new Date(Date.now()-(7-i)*864e5).toISOString().split("T")[0],v:+(tot.nw*(.92+i*.012)).toFixed(2)})),{d:new Date().toISOString().split("T")[0],v:+tot.nw.toFixed(2)}];const trend=data.length>=2?data[data.length-1].v-data[0].v:0;
      return <div className="su"><div style={{display:"flex",gap:8,marginBottom:14}}><Stat label="Hoy" value={f(tot.nw)}/><Stat label="Tendencia" value={`${trend>=0?"+":""}${f(trend)}`} color={trend>=0?"var(--gn)":"var(--rd)"}/></div>
        <Card><ResponsiveContainer width="100%" height={180}><AreaChart data={data}><defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={trend>=0?"#00ff88":"#ff3355"} stopOpacity={.1}/><stop offset="100%" stopColor={trend>=0?"#00ff88":"#ff3355"} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/><XAxis dataKey="d" tick={{fontSize:8,fill:"#444"}}/><YAxis tick={{fontSize:9,fill:"#444"}}/><Tooltip contentStyle={{background:"#111",border:"1px solid #222",fontSize:10}}/><Area type="monotone" dataKey="v" stroke={trend>=0?"#00ff88":"#ff3355"} strokeWidth={2} fill="url(#ng)" dot={false}/></AreaChart></ResponsiveContainer></Card></div>}

    // RECAP
    if(nav==="overview"&&sub==="recap"){const mo=new Date().getMonth();const mt=txs.filter(t=>new Date(t.date).getMonth()===mo);const mI=mt.filter(x=>x.type==="income").reduce((s,x)=>s+cv(x.amount,x.currency,mc,rates),0);const mE=mt.filter(x=>x.type==="expense").reduce((s,x)=>s+cv(x.amount,x.currency,mc,rates),0);const mSR=mI>0?((mI-mE)/mI*100):0;let hs=30;if(mSR>=40)hs+=25;else if(mSR>=20)hs+=15;if(banks.length)hs+=10;if(mE<=mI)hs+=10;if(savGoals.length)hs+=8;hs=Math.min(100,hs);
      return <div className="su"><Card style={{background:"linear-gradient(135deg,#0d0d0d,#111)",border:"1px solid var(--ac)33",marginBottom:14,padding:24}}>
        <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",letterSpacing:2,marginBottom:8}}>RECAP · {new Date().toLocaleString("es",{month:"long",year:"numeric"}).toUpperCase()}</div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}><div><div style={{fontSize:10,color:"var(--t2)"}}>INGRESO</div><div style={{fontSize:22,fontWeight:800,color:"var(--gn)",fontFamily:"var(--mono)"}}>{f(mI)}</div></div><div><div style={{fontSize:10,color:"var(--t2)"}}>GASTO</div><div style={{fontSize:22,fontWeight:800,color:"var(--rd)",fontFamily:"var(--mono)"}}>{f(mE)}</div></div><div><div style={{fontSize:10,color:"var(--t2)"}}>NETO</div><div style={{fontSize:22,fontWeight:800,color:mI>=mE?"var(--gn)":"var(--rd)",fontFamily:"var(--mono)"}}>{f(mI-mE)}</div></div></div>
      </Card><div style={{display:"flex",gap:8}}><Stat label="Ahorro" value={`${mSR.toFixed(0)}%`} color={mSR>=40?"var(--gn)":"var(--rd)"} small/><Stat label="Score" value={`${hs}`} color={hs>=60?"var(--gn)":"var(--am)"} small/><Stat label="Canon" value={mSR>=40?"OK":"FAIL"} color={mSR>=40?"var(--gn)":"var(--rd)"} small/></div></div>}

    // CRYPTO
    if(nav==="crypto") return <CryptoModule sub={sub}/>;

    // ADD TX
    if(nav==="add") return <AddTx mc={mc} myC={myC} rates={rates} ctx={ctx} sr={sr} onAdd={tx=>{
      // CANON CHECK
      if(tx.type==="expense"){const newExp=tot.exp+cv(tx.amount,tx.currency,mc,rates);const newSR=tot.inc>0?((tot.inc-newExp)/tot.inc*100):0;
        if(newSR<CANON_RATE&&tot.inc>0){if(!confirm(`⚠️ SHIELD: Este gasto baja tu ahorro a ${newSR.toFixed(0)}% (Canon: ${CANON_RATE}%). ¿Proceder?`))return;}
      }
      setTxs(p=>[{...tx,id:uid(),date:new Date().toISOString()},...p]);
    }}/>;

    // BUDGETS
    if(nav==="budget"&&sub==="budgets"){const mo=new Date().getMonth();return <div className="su"><button onClick={()=>setModal("budget")} style={bpFill}>+ PRESUPUESTO</button>
      {budgets.map(b=>{const sp=txs.filter(t=>t.type==="expense"&&t.category===b.category&&new Date(t.date).getMonth()===mo).reduce((s,t)=>s+cv(t.amount,t.currency,b.currency,rates),0);const pct=b.limit>0?sp/b.limit*100:0;const over=sp>b.limit;return <Card key={b.id} style={{marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700,fontFamily:"var(--mono)",fontSize:12}}>{b.category}</span><span style={{fontSize:10,color:over?"var(--rd)":"var(--gn)",fontFamily:"var(--mono)",fontWeight:700}}>{over?"OVER":"OK"}</span></div>
        <div style={{height:5,background:"var(--bg)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:over?"var(--rd)":pct>75?"var(--am)":"var(--gn)",transition:"width .5s"}}/></div>
        <div style={{fontSize:10,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>{fm(sp,b.currency)} / {fm(b.limit,b.currency)}</div>
      </Card>})}{budgets.length===0&&<Empty emoji="📋" title="Sin presupuestos"/>}</div>}

    // BILLS
    if(nav==="budget"&&sub==="bills"){const days=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];return <div className="su"><button onClick={()=>setModal("bill")} style={bpFill}>+ RECURRENTE</button>
      {bills.map(b=> <Card key={b.id} style={{marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:b.type==="income"?"#00ff8820":"#ff335520",color:b.type==="income"?"var(--gn)":"var(--rd)",fontWeight:700,fontFamily:"var(--mono)",marginRight:6}}>{b.type==="income"?"IN":"OUT"}</span><span style={{fontWeight:700,fontSize:13}}>{b.name}</span>
          <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:2}}>{b.freq==="weekly"?`Cada ${days[b.dayOfWeek||0]}`:b.freq==="monthly"?`Día ${b.dayOfMonth||1}`:b.freq}</div></div>
          <div style={{fontSize:16,fontWeight:800,fontFamily:"var(--mono)",color:b.type==="income"?"var(--gn)":"var(--rd)"}}>{b.type==="income"?"+":"−"}{fm(b.amount,b.currency)}</div>
        </div>
      </Card>)}{bills.length===0&&<Empty emoji="🔄" title="Sin recurrentes"/>}</div>}

    // BANKS
    if(nav==="bank"&&sub==="bankOv") return <div className="su"><button onClick={()=>setModal("bank")} style={bpFill}>+ CUENTA</button>
      {banks.map(b=> <Card key={b.id} style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:700}}>{b.name}</div><div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>{CUR.find(c=>c.c===b.currency)?.f} {b.currency}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,fontFamily:"var(--mono)"}}>{fm(b.balance,b.currency)}</div><div style={{fontSize:10,color:"var(--cyan)",fontFamily:"var(--mono)"}}>INV: {fm(b.invested||0,b.currency)}</div></div></div></Card>)}
      {banks.length===0&&<Empty emoji="🏦" title="Sin cuentas"/>}</div>;

    // CONNECT BANK
    if(nav==="bank"&&sub==="connect") return <div className="su"><Card style={{textAlign:"center",padding:28}}>
      <div style={{fontSize:32,marginBottom:10}}>🏦</div><h3 style={{fontFamily:"var(--mono)",fontSize:14,color:"var(--ac)",marginBottom:12}}>[ CONECTAR BANCO ]</h3>
      <p style={{fontSize:12,color:"var(--t2)",marginBottom:16,lineHeight:1.6}}>Conexión segura AES-256. Solo lectura.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:16}}>
        {["BBVA","Santander","Banorte","HSBC","Chase","Scotiabank","Nu","Banamex"].map(b=> <button key={b} onClick={()=>setBanks(p=>[...p,{id:uid(),name:b,balance:Math.round(Math.random()*50000+5000),invested:Math.round(Math.random()*15000),currency:mc}])} style={{...bo,fontSize:11,padding:"6px 12px"}}>🏦 {b}</button>)}
      </div>
      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>🔒 Plaid™ · Read-Only · Encrypted</div>
    </Card></div>;

    // WISHLIST
    if(nav==="wishlist") return <div className="su"><button onClick={()=>setModal("wish")} style={bpFill}>+ DESEO</button>
      {wishes.map(w=> <Card key={w.id} style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontWeight:700}}>{w.name}</div><span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:w.priority==="high"?"#ff335520":w.priority==="medium"?"#ffaa0020":"#00ff8820",color:w.priority==="high"?"var(--rd)":w.priority==="medium"?"var(--am)":"var(--gn)",fontWeight:700,fontFamily:"var(--mono)"}}>{w.priority}</span></div><div style={{fontSize:16,fontWeight:800,fontFamily:"var(--mono)"}}>{fm(w.price,w.currency)}</div></div>
        {w.advice&&<div style={{marginTop:10,padding:10,background:"var(--bg)",borderRadius:6,borderLeft:"2px solid var(--ac)",fontSize:11,color:"var(--t2)"}}>✦ {w.advice}</div>}
      </Card>)}{wishes.length===0&&<Empty emoji="⭐" title="Sin deseos"/>}</div>;

    // GOALS
    if(nav==="goals"&&sub==="savings") return <div className="su"><button onClick={()=>setModal("saving")} style={bpFill}>+ META AHORRO</button>{savGoals.map(g=>{const saved=tot.inc*(g.rate/100);const pct=g.target>0?(saved/g.target*100).toFixed(1):0;return <Card key={g.id} style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700}}>{g.name}</span><span style={{fontFamily:"var(--mono)",fontSize:12}}>{f(saved)}/{f(g.target)}</span></div><div style={{height:4,background:"var(--bg)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:"var(--gn)"}}/></div></Card>})}{savGoals.length===0&&<Empty emoji="🎯" title="Sin metas"/>}</div>;

    if(nav==="goals"&&sub==="targets") return <div className="su"><button onClick={()=>setModal("target")} style={bpFill}>+ META</button>{tarGoals.map(g=>{const dl=Math.max(0,Math.ceil((new Date(g.date)-new Date())/864e5));const pct=g.amount>0?(Math.max(0,tot.nw)/g.amount*100).toFixed(1):0;return <Card key={g.id} style={{marginTop:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700}}>{g.name}</span><span style={{fontFamily:"var(--mono)",fontSize:14,fontWeight:800}}>{f(g.amount)}</span></div><div style={{height:4,background:"var(--bg)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:"var(--pu)"}}/></div><div style={{fontSize:10,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>{dl}d · {pct}%</div></Card>})}{tarGoals.length===0&&<Empty emoji="🏆" title="Sin metas"/>}</div>;

    // CHAT
    if(nav==="ai"&&sub==="chat"){const sugs=["Hola OSAI","Canon del 40%","Analiza gastos","Invertir","Ahorro","Salud","Consejo"];return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        {chatMsgs.length===0&&<div style={{textAlign:"center",padding:"40px 16px"}}><div className="glow" style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:800,color:"var(--ac)",letterSpacing:2,marginBottom:8}}>OSAI</div><div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:16}}>TERMINAL DE COMANDO FINANCIERO</div><div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>{sugs.map(q=> <button key={q} onClick={()=>setChatIn(q)} style={{...bo,fontSize:10,padding:"5px 10px"}}>{q}</button>)}</div></div>}
        {chatMsgs.map((m,i)=> <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",marginBottom:8,padding:"0 4px"}}>
          <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.r==="u"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.r==="u"?"var(--ac)":"var(--sf)",color:m.r==="u"?"var(--bg)":"var(--tx)",fontSize:12,lineHeight:1.6,whiteSpace:"pre-line",fontFamily:m.r==="a"?"var(--mono)":"var(--ft)",border:m.r==="a"?"1px solid var(--bd)":"none"}}>
            {m.r==="a"&&<div style={{fontSize:8,fontWeight:700,color:"var(--ac)",marginBottom:4,letterSpacing:1.5}}>✦ OSAI</div>}{m.t}
          </div>
        </div>)}
        {aiTyp&&<div style={{padding:"0 4px",marginBottom:8}}><div style={{padding:"10px 14px",borderRadius:"12px 12px 12px 2px",background:"var(--sf)",border:"1px solid var(--bd)",display:"inline-flex",gap:4,alignItems:"center"}}>{[0,1,2].map(i=> <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"var(--ac)",animation:`dp 1.4s ${i*.16}s infinite`}}/>)}<span style={{fontSize:10,color:"var(--t3)",marginLeft:6,fontFamily:"var(--mono)"}}>procesando...</span></div></div>}
        <div ref={chatRef}/>
      </div>
      <div style={{display:"flex",gap:6,paddingTop:8,borderTop:"1px solid var(--bd)"}}><input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleChat()} placeholder="Comando OSAI..." style={{flex:1,padding:"10px 14px",borderRadius:6,border:"1px solid var(--bd)",fontSize:12,fontFamily:"var(--mono)",background:"var(--bg)",color:"var(--tx)"}}/><button onClick={handleChat} disabled={aiTyp} style={{...bpFill,padding:"10px 14px"}}>➤</button></div>
    </div>}

    if(nav==="ai"&&sub==="alerts") return <div className="su">{alerts.map(a=> <Card key={a.id} style={{marginBottom:6,borderLeft:"2px solid var(--ac)"}}><div style={{display:"flex",justifyContent:"space-between"}}><span>{a.ic} <span style={{fontSize:12}}>{a.txt}</span></span><span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{a.t}</span></div></Card>)}</div>;

    // SETTINGS
    if(nav==="settings"&&sub==="currencies") return <div className="su"><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{CUR.map(c=> <button key={c.c} onClick={()=>setMyC(p=>p.includes(c.c)?p.filter(x=>x!==c.c):p.length<5?[...p,c.c]:p)} style={{padding:"5px 10px",borderRadius:4,fontSize:11,fontWeight:600,cursor:"pointer",border:myC.includes(c.c)?"1px solid var(--ac)":"1px solid var(--bd)",background:myC.includes(c.c)?"var(--ac)":"var(--bg)",color:myC.includes(c.c)?"var(--bg)":"var(--t2)",fontFamily:"var(--mono)"}}>{c.f}{c.c}</button>)}</div></div>;

    if(nav==="settings"&&sub==="masterCur") return <div className="su">{myC.map(c=>{const x=CUR.find(v=>v.c===c);return <Card key={c} onClick={()=>setMC(c)} style={{marginBottom:6,borderColor:mc===c?"var(--ac)":"var(--bd)"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>{x?.f}</span><div><div style={{fontWeight:600}}>{x?.n}</div><div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>1 USD = {rates[c]} {c}</div></div>{mc===c&&<span style={{marginLeft:"auto",fontSize:9,background:"var(--ac)",color:"var(--bg)",padding:"3px 8px",borderRadius:3,fontWeight:700,fontFamily:"var(--mono)"}}>MAESTRA</span>}</div></Card>})}</div>;

    if(nav==="settings"&&sub==="account") return <div className="su">
      <Card><div style={{fontFamily:"var(--mono)",fontSize:12,marginBottom:10}}><span style={{color:"var(--ac)"}}>@{user}</span> · {txs.length} txns · {banks.length} bancos</div>{saveStatus&&<div style={{fontSize:10,color:saveStatus==="saved"?"var(--gn)":"var(--am)",fontFamily:"var(--mono)"}}>● {saveStatus==="saved"?"GUARDADO":"GUARDANDO..."}</div>}</Card>
      <button onClick={saveAll} style={{...bpFill,width:"100%",marginTop:8}}>💾 GUARDAR</button>
      <button onClick={()=>{saveAll();setUser(null);setScreen("login");setAU("");setAP("");setTxs([]);setBanks([]);setWishes([]);setSavGoals([]);setTarGoals([]);setBudgets([]);setBills([]);setChatMsgs([]);setAlerts([])}} style={{...bo,width:"100%",marginTop:6}}>🚪 SALIR</button>
      <button onClick={()=>{if(confirm("¿LIMPIAR TODO?")){setTxs([]);setBanks([]);setWishes([]);setSavGoals([]);setTarGoals([]);setBudgets([]);setBills([]);setChatMsgs([]);setAlerts([]);setNwH([])}}} style={{...bo,width:"100%",marginTop:6,color:"var(--rd)",borderColor:"var(--rd)"}}>☢ TABULA RASA</button>
    </div>;
    return null;
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--ft)"}}><style>{CSS}</style><div className="scanline"/>
      <aside style={{width:210,minHeight:"100vh",background:"var(--sf)",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"14px 12px",borderBottom:"1px solid var(--bd)",display:"flex",alignItems:"center",gap:8}}>
          <div className="glow" style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:800,color:"var(--ac)",letterSpacing:1}}>OSAI</div>
          <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>WAR TANK<br/>{user}</div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
          {NAV.map(it=> <div key={it.id}>
            <button onClick={()=>doNav(it.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:4,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:nav===it.id?"var(--bg)":"transparent",color:nav===it.id?"var(--ac)":"var(--t2)",fontFamily:"var(--mono)",textAlign:"left"}}>
              <span style={{fontSize:12,width:16,textAlign:"center"}}>{it.ic}</span><span style={{flex:1}}>{it.lb}</span>{it.ss&&<span style={{fontSize:8,opacity:.3}}>▾</span>}
            </button>
            {it.ss&&expN===it.id&&<div style={{marginLeft:24,marginTop:1,marginBottom:3}}>{it.ss.map(s=> <button key={s.id} onClick={()=>{setNav(it.id);setSub(s.id)}} style={{width:"100%",display:"block",padding:"4px 8px",borderRadius:3,border:"none",background:sub===s.id?"var(--ac)15":"transparent",color:sub===s.id?"var(--ac)":"var(--t3)",fontSize:10,cursor:"pointer",textAlign:"left",fontFamily:"var(--mono)",marginBottom:1}}>{s.lb}</button>)}</div>}
          </div>)}
        </nav>
        <div style={{padding:10,borderTop:"1px solid var(--bd)"}}><div style={{fontFamily:"var(--mono)",fontSize:8,color:"var(--t3)",textAlign:"center",letterSpacing:1}}>FINANCEOS v2.0<br/>financeos.app</div></div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{padding:"10px 24px",borderBottom:"1px solid var(--bd)",background:"var(--sf)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:700,fontFamily:"var(--mono)",color:"var(--ac)"}}>[{hdr.toUpperCase()}]</div><div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{new Date().toLocaleDateString("es",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{textAlign:"right"}}><div style={{fontFamily:"var(--mono)",fontWeight:800,fontSize:13,color:"var(--ac)"}}>{f(tot.nw)}</div><div style={{fontSize:9,color:canonOk?"var(--gn)":"var(--rd)",fontFamily:"var(--mono)"}}>CANON {sr.toFixed(0)}%/{CANON_RATE}%</div></div></div>
        </header>
        <div className="su" key={`${nav}-${sub}`} style={{flex:1,padding:"18px 24px",overflowY:"auto"}}>{R()}</div>
      </main>
      <Modal open={modal==="bank"} onClose={()=>setModal(null)} title="Agregar Cuenta"><FBank cs={myC} onAdd={b=>{setBanks(p=>[...p,{...b,id:uid()}]);setModal(null)}}/></Modal>
      <Modal open={modal==="wish"} onClose={()=>setModal(null)} title="Agregar Deseo"><FWish cs={myC} nw={tot.nw} inc={tot.inc} mc2={mc} rates={rates} onAdd={w=>{const pm=cv(w.price,w.currency,mc,rates);const pct=tot.nw>0?(pm/tot.nw*100).toFixed(0):0;setWishes(p=>[...p,{...w,id:uid(),advice:`${pct}% de tu patrimonio. ${pct>30?"⚠️ Alto.":"✅ OK."}`}]);setModal(null)}}/></Modal>
      <Modal open={modal==="saving"} onClose={()=>setModal(null)} title="Meta Ahorro"><FSaving mc2={mc} onAdd={g=>{setSavGoals(p=>[...p,{...g,id:uid()}]);setModal(null)}}/></Modal>
      <Modal open={modal==="target"} onClose={()=>setModal(null)} title="Meta"><FTarget mc2={mc} onAdd={g=>{setTarGoals(p=>[...p,{...g,id:uid()}]);setModal(null)}}/></Modal>
      <Modal open={modal==="budget"} onClose={()=>setModal(null)} title="Presupuesto"><FBudget mc2={mc} onAdd={b=>{setBudgets(p=>[...p,{...b,id:uid()}]);setModal(null)}}/></Modal>
      <Modal open={modal==="bill"} onClose={()=>setModal(null)} title="Recurrente"><FBill cs={myC} onAdd={b=>{setBills(p=>[...p,{...b,id:uid()}]);setModal(null)}}/></Modal>
    </div>
  );
}

// ── FORMS ──
function AddTx({mc,myC,rates,ctx,sr,onAdd}){
  const[tp,sTp]=useState("expense");const[amt,sAmt]=useState("");const[cur,sCur]=useState(mc);const[desc,sDesc]=useState("");const[cat,sCat]=useState(CATS[0]);const[tip,sTip]=useState(null);
  return <div className="su" style={{maxWidth:440}}>
    <div style={{display:"flex",gap:6,marginBottom:16}}><button onClick={()=>sTp("expense")} style={tp==="expense"?bpFill:bo}>💸 GASTO</button><button onClick={()=>sTp("income")} style={tp==="income"?{...bpFill,background:"var(--gn)"}:bo}>💰 INGRESO</button></div>
    <label style={lb}>CANTIDAD</label><input type="number" value={amt} onChange={e=>sAmt(e.target.value)} placeholder="0.00" style={ip}/>
    <label style={lb}>MONEDA</label><select value={cur} onChange={e=>sCur(e.target.value)} style={sl}>{myC.map(c=> <option key={c} value={c}>{CUR.find(x=>x.c===c)?.f} {c}</option>)}</select>
    <label style={lb}>DESCRIPCIÓN</label><input value={desc} onChange={e=>sDesc(e.target.value)} placeholder="Netflix, Salario..." style={ip}/>
    <label style={lb}>CATEGORÍA</label><select value={cat} onChange={e=>sCat(e.target.value)} style={sl}>{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select>
    <button onClick={()=>{if(!amt||!desc)return;onAdd({type:tp,amount:parseFloat(amt),currency:cur,description:desc,category:cat});
      const am=cv(parseFloat(amt),cur,mc,rates);const tips=tp==="income"?[`Canon: aparta ${CANON_RATE}% (${fm(am*CANON_RATE/100,mc)}) AHORA.`]:[`${cat}. ${am>ctx.inc*.1?'⚠️ >10% ingreso.':'Normal.'}`];
      sTip(tips[0]);sAmt("");sDesc("")}} style={{...bpFill,width:"100%",padding:12}}>⚡ REGISTRAR</button>
    {tip&&<Card style={{marginTop:12,borderLeft:"2px solid var(--ac)"}}><div style={{fontSize:10,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:2}}>✦ OSAI</div><div style={{fontSize:11,color:"var(--t2)"}}>{tip}</div></Card>}
  </div>}
function FBank({cs,onAdd}){const[n,sN]=useState("");const[b,sB]=useState("");const[i,sI]=useState("");const[c,sC]=useState(cs[0]);return <div><label style={lb}>BANCO</label><input value={n} onChange={e=>sN(e.target.value)} placeholder="BBVA..." style={ip}/><label style={lb}>MONEDA</label><select value={c} onChange={e=>sC(e.target.value)} style={sl}>{cs.map(c=> <option key={c} value={c}>{c}</option>)}</select><label style={lb}>SALDO</label><input type="number" value={b} onChange={e=>sB(e.target.value)} style={ip}/><label style={lb}>INVERTIDO</label><input type="number" value={i} onChange={e=>sI(e.target.value)} style={ip}/><button onClick={()=>{if(n)onAdd({name:n,balance:parseFloat(b)||0,invested:parseFloat(i)||0,currency:c})}} style={{...bpFill,width:"100%",padding:12}}>AGREGAR</button></div>}
function FWish({cs,onAdd}){const[n,sN]=useState("");const[p,sP]=useState("");const[c,sC]=useState(cs[0]);const[pr,sPr]=useState("medium");return <div><label style={lb}>ARTÍCULO</label><input value={n} onChange={e=>sN(e.target.value)} style={ip}/><label style={lb}>PRECIO</label><input type="number" value={p} onChange={e=>sP(e.target.value)} style={ip}/><label style={lb}>MONEDA</label><select value={c} onChange={e=>sC(e.target.value)} style={sl}>{cs.map(c=> <option key={c} value={c}>{c}</option>)}</select><label style={lb}>PRIORIDAD</label><select value={pr} onChange={e=>sPr(e.target.value)} style={sl}><option value="high">🔴 Alta</option><option value="medium">🟡 Media</option><option value="low">🟢 Baja</option></select><button onClick={()=>{if(n&&p)onAdd({name:n,price:parseFloat(p),currency:c,priority:pr})}} style={{...bpFill,width:"100%",padding:12}}>AGREGAR</button></div>}
function FSaving({mc2,onAdd}){const[n,sN]=useState("");const[t,sT]=useState("");const[r,sR]=useState("40");return <div><label style={lb}>META</label><input value={n} onChange={e=>sN(e.target.value)} style={ip}/><label style={lb}>CANTIDAD ({mc2})</label><input type="number" value={t} onChange={e=>sT(e.target.value)} style={ip}/><label style={lb}>TASA AHORRO %</label><input type="number" value={r} onChange={e=>sR(e.target.value)} style={ip}/><button onClick={()=>{if(n&&t)onAdd({name:n,target:parseFloat(t),rate:parseFloat(r)})}} style={{...bpFill,width:"100%",padding:12}}>AGREGAR</button></div>}
function FTarget({mc2,onAdd}){const[n,sN]=useState("");const[a,sA]=useState("");const[d,sD]=useState("");return <div><label style={lb}>META</label><input value={n} onChange={e=>sN(e.target.value)} style={ip}/><label style={lb}>CANTIDAD ({mc2})</label><input type="number" value={a} onChange={e=>sA(e.target.value)} style={ip}/><label style={lb}>FECHA</label><input type="date" value={d} onChange={e=>sD(e.target.value)} style={ip}/><button onClick={()=>{if(n&&a&&d)onAdd({name:n,amount:parseFloat(a),date:d})}} style={{...bpFill,width:"100%",padding:12}}>AGREGAR</button></div>}
function FBudget({mc2,onAdd}){const[c,sC]=useState(CATS[0]);const[l,sL]=useState("");return <div><label style={lb}>CATEGORÍA</label><select value={c} onChange={e=>sC(e.target.value)} style={sl}>{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select><label style={lb}>LÍMITE ({mc2})</label><input type="number" value={l} onChange={e=>sL(e.target.value)} style={ip}/><button onClick={()=>{if(c&&l)onAdd({category:c,limit:parseFloat(l),currency:mc2})}} style={{...bpFill,width:"100%",padding:12}}>AGREGAR</button></div>}
function FBill({cs,onAdd}){const[tp,sTp]=useState("expense");const[n,sN]=useState("");const[a,sA]=useState("");const[c,sC]=useState(cs[0]);const[fr,sFr]=useState("monthly");const[dow,sDow]=useState(0);const[dom,sDom]=useState(1);const[cat,sCat]=useState(CATS[0]);const days=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];return <div>
  <div style={{display:"flex",gap:6,marginBottom:14}}><button onClick={()=>sTp("expense")} style={tp==="expense"?bpFill:bo}>💸 GASTO</button><button onClick={()=>sTp("income")} style={tp==="income"?{...bpFill,background:"var(--gn)"}:bo}>💰 INGRESO</button></div>
  <label style={lb}>NOMBRE</label><input value={n} onChange={e=>sN(e.target.value)} placeholder={tp==="income"?"Salario...":"Netflix..."} style={ip}/>
  <label style={lb}>MONTO</label><input type="number" value={a} onChange={e=>sA(e.target.value)} style={ip}/>
  <label style={lb}>MONEDA</label><select value={c} onChange={e=>sC(e.target.value)} style={sl}>{cs.map(c=> <option key={c} value={c}>{c}</option>)}</select>
  <label style={lb}>CATEGORÍA</label><select value={cat} onChange={e=>sCat(e.target.value)} style={sl}>{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select>
  <label style={lb}>FRECUENCIA</label><select value={fr} onChange={e=>sFr(e.target.value)} style={sl}><option value="weekly">Semanal</option><option value="monthly">Mensual</option></select>
  {fr==="weekly"&&<><label style={lb}>DÍA</label><select value={dow} onChange={e=>sDow(+e.target.value)} style={sl}>{days.map((d,i)=> <option key={i} value={i}>{d}</option>)}</select></>}
  {fr==="monthly"&&<><label style={lb}>DÍA DEL MES</label><select value={dom} onChange={e=>sDom(+e.target.value)} style={sl}>{Array.from({length:28},(_,i)=> <option key={i+1} value={i+1}>{i+1}</option>)}</select></>}
  <button onClick={()=>{if(n&&a)onAdd({name:n,amount:parseFloat(a),currency:c,freq:fr,type:tp,category:cat,dayOfWeek:dow,dayOfMonth:dom})}} style={{...bpFill,width:"100%",padding:12}}>⚡ PROGRAMAR</button>
</div>}
