import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SUPA_URL = "https://pcgcmwnrxiqlsxnkmuti.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ2Ntd25yeGlxbHN4bmttdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTkyNTksImV4cCI6MjA5MTY5NTI1OX0.4DsdVrGsucdhv8_Jk2B7A1SJNVYaoN1KXH1Awbr0qM4";
const sb = createClient(SUPA_URL, SUPA_KEY);

// ── TRANSLATIONS ──
const TR = {
  en: {
    app:"CoinVault Pro", tagline:"AI-Powered Coin Collection",
    nav:{ collection:"Collection", scanner:"AI Scanner", pcgs:"PCGS Lookup", library:"Library", news:"Coin News", chat:"AI Expert", settings:"Settings" },
    auth:{ welcome:"Welcome Back", create:"Create Account", email:"Email", password:"Password", login:"Sign In", register:"Register", switchLogin:"Already have an account?", switchReg:"New here? ", loginBtn:"Sign In", regBtn:"Create Account" },
    collection:{ title:"My Collection", add:"Add Coin", empty:"No coins yet", hint:"Use AI Scanner to identify your first coin!", totalValue:"Total Value", totalCoins:"Total Coins", oldest:"Oldest Coin", valuable:"Most Valuable", sort:"Sort", filter:"Filter" },
    scanner:{ title:"AI Scanner", step1:"Photograph Obverse (Front)", step2:"Photograph Reverse (Back)", step3:"AI Identification", uploadHint:"Click or drag photo here", analyzing:"Analyzing with AI...", result:"Identification Result", save:"Add to Collection", retry:"Scan Another", noKey:"Set your Claude API key in Settings to use AI Scanner.", tapFront:"Tap to photograph obverse", tapBack:"Tap to photograph reverse", analyze:"Analyze Coin" },
    pcgs:{ title:"PCGS Lookup", enterCert:"Enter PCGS Cert Number", search:"Look Up", found:"Certification Found", pop:"Population Report", price:"Price Guide", notFound:"No record found for that number.", tryDemo:"Try: 12345678, 87654321, 55512345, 99987654, 41064149", orSearch:"Or search by description:", searchBy:"Country, year, denomination..." },
    library:{ title:"Collection Library", byCountry:"By Country", byMaterial:"By Material", byEra:"By Decade", byGrade:"By Grade", records:"Collection Records", oldest:"Oldest", mostValuable:"Most Valuable", highestGrade:"Best Grade", rarest:"Lowest Mintage" },
    news:{ title:"Coin News", all:"All", auction:"Auctions", market:"Market", grading:"Grading", readMore:"Read more" },
    chat:{ title:"AI Numismatist", placeholder:"Ask anything about coins...", send:"Send", welcome:"Hello! I'm your AI numismatic expert. Ask me about coin identification, valuation, history, grading, or investment.", suggestions:["How do I grade a coin?","What makes a coin valuable?","Tell me about Morgan Dollars","Best way to store coins","Is now a good time to buy silver?"] },
    settings:{ title:"Settings", language:"Language", currency:"Default Currency", apiKey:"Claude API Key", apiKeyHint:"Required for AI Scanner & Chat (stored locally)", theme:"Theme", save:"Save Settings", logout:"Sign Out", account:"Account", danger:"Danger Zone", deleteAll:"Delete All Coins", version:"CoinVault Pro v1.0 · Powered by Claude AI" },
    coin:{ name:"Coin Name", country:"Country", year:"Year", denomination:"Denomination", material:"Material", grade:"Grade (Sheldon)", mintMark:"Mint Mark", series:"Series / Type", desc:"Description", purchasePrice:"Purchase Price", estValue:"Estimated Value", currency:"Currency", diameter:"Diameter", weight:"Weight", mintage:"Mintage", notes:"Notes", obverse:"Obverse (Front)", reverse:"Reverse (Back)", save:"Save Coin", delete:"Delete Coin", edit:"Edit" },
  },
  es: {
    app:"CoinVault Pro", tagline:"Colección de Monedas con IA",
    nav:{ collection:"Colección", scanner:"Escáner IA", pcgs:"Búsqueda PCGS", library:"Biblioteca", news:"Noticias", chat:"Experto IA", settings:"Configuración" },
    auth:{ welcome:"Bienvenido", create:"Crear Cuenta", email:"Correo electrónico", password:"Contraseña", login:"Iniciar Sesión", register:"Registrarse", switchLogin:"¿Ya tienes cuenta?", switchReg:"¿Nuevo aquí? ", loginBtn:"Iniciar Sesión", regBtn:"Crear Cuenta" },
    collection:{ title:"Mi Colección", add:"Agregar Moneda", empty:"Sin monedas aún", hint:"¡Usa el Escáner IA para identificar tu primera moneda!", totalValue:"Valor Total", totalCoins:"Total Monedas", oldest:"Moneda más antigua", valuable:"Más valiosa", sort:"Ordenar", filter:"Filtrar" },
    scanner:{ title:"Escáner IA", step1:"Fotografiar Anverso (Cara)", step2:"Fotografiar Reverso (Cruz)", step3:"Identificación con IA", uploadHint:"Clic o arrastra foto aquí", analyzing:"Analizando con IA...", result:"Resultado de Identificación", save:"Agregar a Colección", retry:"Escanear Otra", noKey:"Configura tu clave API de Claude en Configuración para usar el Escáner IA.", tapFront:"Fotografiar anverso", tapBack:"Fotografiar reverso", analyze:"Analizar Moneda" },
    pcgs:{ title:"Búsqueda PCGS", enterCert:"Ingresa número de certificación PCGS", search:"Buscar", found:"Certificación Encontrada", pop:"Reporte de Población", price:"Guía de Precios", notFound:"No se encontró registro para ese número.", tryDemo:"Prueba: 12345678, 87654321, 55512345, 99987654, 41064149", orSearch:"O buscar por descripción:", searchBy:"País, año, denominación..." },
    library:{ title:"Biblioteca de Colección", byCountry:"Por País", byMaterial:"Por Material", byEra:"Por Década", byGrade:"Por Grado", records:"Récords de Colección", oldest:"Más Antigua", mostValuable:"Más Valiosa", highestGrade:"Mejor Grado", rarest:"Menor Tiraje" },
    news:{ title:"Noticias de Monedas", all:"Todo", auction:"Subastas", market:"Mercado", grading:"Calificación", readMore:"Leer más" },
    chat:{ title:"Numismático IA", placeholder:"Pregunta sobre monedas...", send:"Enviar", welcome:"¡Hola! Soy tu experto numismático con IA. Pregúntame sobre identificación, valuación, historia, clasificación o inversión en monedas.", suggestions:["¿Cómo se califica una moneda?","¿Qué hace valiosa a una moneda?","Háblame del Peso Mexicano","¿Cómo almacenar monedas?","¿Es buen momento para comprar plata?"] },
    settings:{ title:"Configuración", language:"Idioma", currency:"Moneda Predeterminada", apiKey:"Clave API Claude", apiKeyHint:"Requerida para Escáner IA y Chat (guardada localmente)", theme:"Tema", save:"Guardar Configuración", logout:"Cerrar Sesión", account:"Cuenta", danger:"Zona de Peligro", deleteAll:"Eliminar Todas las Monedas", version:"CoinVault Pro v1.0 · Con tecnología Claude AI" },
    coin:{ name:"Nombre de Moneda", country:"País", year:"Año", denomination:"Denominación", material:"Material", grade:"Grado (Sheldon)", mintMark:"Marca de Ceca", series:"Serie / Tipo", desc:"Descripción", purchasePrice:"Precio de Compra", estValue:"Valor Estimado", currency:"Moneda", diameter:"Diámetro", weight:"Peso", mintage:"Tiraje", notes:"Notas", obverse:"Anverso (Cara)", reverse:"Reverso (Cruz)", save:"Guardar Moneda", delete:"Eliminar Moneda", edit:"Editar" },
  }
};

const GRADES = ["P-1","FR-2","AG-3","G-4","G-6","VG-8","VG-10","F-12","F-15","VF-20","VF-25","VF-30","VF-35","EF-40","EF-45","AU-50","AU-53","AU-55","AU-58","MS-60","MS-61","MS-62","MS-63","MS-64","MS-65","MS-66","MS-67","MS-68","MS-69","MS-70","PR-60","PR-63","PR-65","PR-67","PR-68","PR-69","PR-70"];
const MATERIALS = ["Silver","Gold","Copper","Nickel","Clad","Bronze","Platinum","Palladium","Zinc","Steel","Bimetallic","Brass"];
const COUNTRIES_LIST = ["United States","Mexico","Canada","United Kingdom","Germany","France","Japan","China","Russia","Spain","Italy","Australia","South Africa","India","Brazil","Argentina","Peru","Colombia","Ancient Rome","Ancient Greece","Byzantine"];
const CURRENCIES = { USD:{s:"$",n:"US Dollar"}, EUR:{s:"€",n:"Euro"}, MXN:{s:"MX$",n:"Peso Mexicano"}, GBP:{s:"£",n:"British Pound"} };
const PIE_COLORS = ["#d4a843","#4a90d9","#00cc66","#e84545","#9060d0","#ff8c00","#20b2aa","#ff69b4"];

// ── MOCK NEWS ──
const NEWS = [
  { id:"n1", title:"1804 Silver Dollar Fetches $7.68M at Stack's Bowers", source:"CoinWeek", date:"2026-05-22", cat:"auction", emoji:"🏛️",
    body:`A pristine Class I 1804 Silver Dollar — the "King of American Coins" — realized $7.68 million including buyer's premium at Stack's Bowers Spring Signature Sale. The specimen, graded PCGS PR-68, is one of only eight known Class I examples. These coins were struck in 1834–35 as diplomatic gifts. Bidding from four phone registrants pushed the price well past pre-sale estimates of $6 million.` },
  { id:"n2", title:"PCGS Announces AI-Powered Grading Initiative for 2026", source:"PCGS", date:"2026-05-20", cat:"grading", emoji:"🔬",
    body:`PCGS unveiled plans to integrate advanced AI vision into their coin grading pipeline, targeting over 94% accuracy on a test set of 50,000 coins. Human graders retain final authority, with AI serving as first-pass screening and surface analysis. The rollout begins with Lincoln Cents and Morgan Dollars in Q3 2026.` },
  { id:"n3", title:"Silver Prices Hit 12-Year High — What Collectors Should Know", source:"Numismatic News", date:"2026-05-18", cat:"market", emoji:"📈",
    body:`Silver surged past $34/oz this week — a level not seen since 2014 — driven by industrial demand from solar manufacturing. Common-date silver coins in circulated condition are seeing strong spot-price demand. Dealers report brisk trade in 90% silver US coins and common Morgan and Peace Dollars. Focus on numismatic value rather than silver content for long-term collecting.` },
  { id:"n4", title:"2026-W American Gold Eagle Proof Set Sells Out in 48 Hours", source:"US Mint", date:"2026-05-15", cat:"market", emoji:"🦅",
    body:`The 2026-W American Gold Eagle Proof Set sold out within 48 hours of release. Priced at $4,895, it drew 180,000+ visitors to the Mint website on day one. Maximum mintage of 12,000 sets was reached in record time. Secondary market prices have already risen 20% above issue price.` },
  { id:"n5", title:"NGC Report: State Quarter Error Coins Surge in Popularity", source:"NGC", date:"2026-05-14", cat:"grading", emoji:"🔍",
    body:`Error coins within the State Quarters program (1999–2008) are enjoying renewed collector interest, partly driven by social media. NGC has processed a record number of error submissions in Q1 2026. Most sought-after: Wisconsin Extra Leaf quarters, Kansas Struck-Through errors, and Minnesota Doubled Die varieties. An NGC-certified Wisconsin "Extra High Leaf" in MS-66 recently sold for $2,400.` },
  { id:"n6", title:"Roman Denarius Hoard Found in England — 2,000 Coins Unearthed", source:"Coin World", date:"2026-05-12", cat:"auction", emoji:"🏺",
    body:`Metal detectorist Geoffrey Higgins uncovered ~2,000 Roman silver denarii in a Wiltshire field, dating to the 2nd–3rd centuries AD. The coins span reigns from Trajan through Severus Alexander, suggesting burial around 230-240 AD. The British Museum is evaluating the find under the Treasure Act, with the finder and landowner to share a fair-market reward.` },
  { id:"n7", title:"Mexico 2026 Libertad — Mintage to Drop 40%", source:"Banco de México", date:"2026-05-10", cat:"market", emoji:"🇲🇽",
    body:`Banco de México confirmed the 2026 Libertad Silver Ounce will have a reduced mintage of only 400,000 coins, down from 680,000 in 2025, citing silver procurement and refinery capacity issues. Pre-order premiums have risen to $8–10 over spot. The proof version remains limited to ~5,000 pieces unchanged.` },
  { id:"n8", title:"Key Date Spotlight: The 1916-D Mercury Dime", source:"CoinWeek", date:"2026-05-08", cat:"market", emoji:"⭐",
    body:`The 1916-D Mercury Dime — mintage of only 264,000 — is the undisputed key date of its series. PCGS shows only 13 examples grading MS-65 Full Bands or better. A gem specimen recently realized $195,000. For budget collectors, AG-3 through VG-10 examples in the $700–$3,500 range represent the most accessible entry. Always buy certified given altered mintmark prevalence.` },
  { id:"n9", title:"Understanding the Sheldon Grading Scale", source:"NGC", date:"2026-05-05", cat:"grading", emoji:"📚",
    body:`The Sheldon Scale (P-1 to MS-70) is the universal US coin grading standard. Key breakpoints: VF-20 (light wear on high points), EF-40 (traces of wear on highest points only), AU-55 (slight wear with 75%+ mint luster), MS-63 (moderate marks in prime focal areas with full luster). Third-party grading by PCGS or NGC is essential for any coin valued over $500.` },
  { id:"n10", title:"Heritage Auctions Reports Record $285M in 2025 Sales", source:"Heritage Auctions", date:"2026-05-03", cat:"auction", emoji:"💰",
    body:`Heritage Auctions released its 2025 annual report: a record $285 million in numismatic sales, up 18% from 2024. Top categories: US Type Coins ($68M), US Gold ($45M), World Coins ($38M), Ancient Coins ($22M). Average realized price per lot increased 12% YoY.` },
  { id:"n11", title:"Counterfeiting Alert: Fake Carson City Morgans Flooding Market", source:"PCGS", date:"2026-04-28", cat:"grading", emoji:"⚠️",
    body:`PCGS issued a formal alert about high-quality counterfeit Carson City Morgan Dollars (1879–1885-CC dates) appearing in online marketplaces and shows. Tell-tale signs: incorrect edge reeding count, underweight mass (26.20g vs correct 26.73g), and microscopic die polishing lines not present on genuine coins. Always submit significant purchases for third-party certification.` },
  { id:"n12", title:"Top 10 US Coins That Beat the S&P 500 Over 20 Years", source:"Numismatic News", date:"2026-04-25", cat:"market", emoji:"📊",
    body:`A study analyzing PCGS auction records (2005–2025) found the top coins outperforming the S&P's 10.2% annualized return: 1913 Liberty Nickel (+14.8%), 1804 Silver Dollar (+12.9%), 1943 Bronze Lincoln Cent (+12.4%), 1916-D Mercury Dime (+11.8%), 1885 Trade Dollar (+11.5%). Note: these rarities trade rarely — most examples appear at auction only once per decade.` },
  { id:"n13", title:"The Gold Krugerrand at 59 — Legacy of a Legend", source:"CoinWeek", date:"2026-04-22", cat:"market", emoji:"🌍",
    body:`The South African Gold Krugerrand, first struck in 1967, celebrates its legacy with limited 2026 commemorative issues. The 2026 Proof Krugerrand — limited to 8,000 pieces — features a new reverse honoring the Big Five wildlife. Priced at ~$2,400 from authorized dealers.` },
  { id:"n14", title:"Long Beach Expo Draws 15,000 Visitors, $40M in Deals", source:"Coin World", date:"2026-04-15", cat:"auction", emoji:"🎪",
    body:`The Long Beach Expo (April 10–12) reported record attendance of 15,000+ and an estimated $40M in transactions — the highest in the event's 42-year history. Over 450 dealers attended. Highlights included a complete set of Carson City Morgans and a Civil War token collection (1,200+ pieces) selling to a major East Coast institution.` },
  { id:"n15", title:"Investment Guide: Building a Numismatic Portfolio for the Long Term", source:"NGC", date:"2026-04-10", cat:"market", emoji:"🏆",
    body:`Expert advice for building a coin investment portfolio: focus on certified coins in top-3 grades for the issue, prioritize series with strong collector bases (Morgan Dollars, Walking Liberty Halves, Saint-Gaudens Double Eagles), and allocate no more than 10–15% of investment capital. Diversify across precious metals, key dates, and world coins. Hold long-term — 10+ years for best results.` },
];

// ── MOCK PCGS DB ──
const PCGS_DB = {
  "41064149":{ cert:"41064149", coin:"2009-S Lincoln Cent — Formative Years", grade:"PR-69 DCAM", year:2009, country:"USA", series:"Lincoln Cent", denom:"1¢", material:"95% Copper, 5% Zinc", diameter:"19.05mm", weight:"2.50g", mintage:2995615, pop:{total:48200,atGrade:28900,higher:4100}, prices:{"PR-65":4,"PR-67":5,"PR-68":8,"PR-69":12,"PR-70":55}, desc:"Part of the 2009 Bicentennial Lincoln series. Formative Years reverse by Charles Vickers shows young Lincoln reading while seated on a log in Indiana." },
  "12345678":{ cert:"12345678", coin:"1921 Morgan Silver Dollar", grade:"MS-63", year:1921, country:"USA", series:"Morgan Dollar", denom:"$1", material:"90% Silver, 10% Copper", diameter:"38.1mm", weight:"26.73g", mintage:44690000, pop:{total:125847,atGrade:32156,higher:8234}, prices:{"MS-60":35,"MS-62":45,"MS-63":65,"MS-64":95,"MS-65":195,"MS-66":895}, desc:"The final year of Morgan Dollar production. Struck at Philadelphia, Denver, and San Francisco. Common in lower grades but scarce in gem condition." },
  "87654321":{ cert:"87654321", coin:"1964 Kennedy Half Dollar", grade:"MS-65", year:1964, country:"USA", series:"Kennedy Half Dollar", denom:"50¢", material:"90% Silver, 10% Copper", diameter:"30.6mm", weight:"12.50g", mintage:273304004, pop:{total:23500,atGrade:8200,higher:1800}, prices:{"MS-63":12,"MS-64":18,"MS-65":45,"MS-66":85,"MS-67":325}, desc:"First year of the Kennedy Half Dollar, struck in 90% silver as a tribute to President Kennedy. High mintage but gems are genuinely scarce." },
  "55512345":{ cert:"55512345", coin:"1895-O Morgan Dollar", grade:"VF-20", year:1895, country:"USA", series:"Morgan Dollar", denom:"$1", material:"90% Silver, 10% Copper", diameter:"38.1mm", weight:"26.73g", mintage:450000, pop:{total:890,atGrade:145,higher:312}, prices:{"G-4":285,"VF-20":950,"EF-40":1800,"AU-50":3200,"MS-60":12500,"MS-63":55000}, desc:"A significant key date with a low mintage of 450,000. Choice circulated examples are challenging to locate. Gem specimens are extremely rare and command large premiums." },
  "99987654":{ cert:"99987654", coin:"1916-D Mercury Dime", grade:"AU-50", year:1916, country:"USA", series:"Mercury Dime", denom:"10¢", material:"90% Silver, 10% Copper", diameter:"17.9mm", weight:"2.50g", mintage:264000, pop:{total:1240,atGrade:87,higher:534}, prices:{"G-4":700,"VG-8":900,"F-12":1200,"VF-20":2100,"EF-40":4500,"AU-50":8500,"MS-62":28000,"MS-65":195000}, desc:"The key date of the Mercury Dime series. Only 264,000 struck at Denver in the series' first year. Authentication by PCGS or NGC is strongly recommended." },
};

// ── HELPERS ──
const uid = () => Math.random().toString(36).slice(2,9);
const fm = (n, c="USD") => `${CURRENCIES[c]?.s||"$"}${(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const gradeColor = g => { if(!g) return "#888"; const n=parseInt((g||"").split("-")[1]||0); if(g.startsWith("MS")||g.startsWith("PR")) { if(n>=67) return "#FFD700"; if(n>=65) return "#00cc66"; if(n>=63) return "#4a90d9"; return "#aaa"; } if(g.startsWith("AU")) return "#4a90d9"; if(g.startsWith("EF")||g.startsWith("VF")) return "#888"; return "#666"; };

async function compressImage(file, maxW=500) {
  return new Promise(res => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const r = Math.min(maxW/img.width, maxW/img.height, 1);
      canvas.width = img.width*r; canvas.height = img.height*r;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      res(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = URL.createObjectURL(file);
  });
}

function genPriceHistory(coin) {
  const base = coin.estimated_value || 50;
  const startYear = Math.min(Math.max((coin.year||2000), 1970), 2010);
  const endYear = 2026;
  const data = [];
  let price = base * 0.28;
  for(let y = startYear; y <= endYear; y++) {
    const drift = coin.material==="Gold"?0.055:coin.material==="Silver"?0.045:0.032;
    price = Math.max(price * (1 + drift + (Math.random()-0.44)*0.14), 1);
    if(y===2008||y===2009) price*=0.82;
    if(y===2011&&(coin.material==="Silver"||coin.material==="Gold")) price*=1.28;
    if(y===2020) price*=0.88; if(y===2021) price*=1.18; if(y===2024) price*=1.1;
    data.push({ year:String(y), value:+price.toFixed(2) });
  }
  const scale = base / data[data.length-1].value;
  return data.map(d=>({...d, value:+(d.value*scale).toFixed(2)}));
}

// ── STYLES ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080808;--sf:#0e0e10;--sf2:#141416;--bd:#1e1e26;--tx:#ede4d0;--t2:#8a7a5e;--t3:#3a3020;
  --ac:#d4a843;--ac2:#a07828;--ac3:#f0c060;--rd:#e84545;--gn:#00cc66;--bl:#4a90d9;--pu:#9060d0;
  --r:10px;--ft:'Outfit',sans-serif;--mono:'JetBrains Mono',monospace;
}
html,body,#root{height:100%;overflow:hidden}
body{font-family:var(--ft);background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased}
@keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes glow{0%,100%{text-shadow:0 0 8px var(--ac),0 0 20px #d4a84344}50%{text-shadow:0 0 20px var(--ac),0 0 40px #d4a84366}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes scan{0%{top:-4px}100%{top:calc(100% + 4px)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.su{animation:su .22s ease}
.glow{animation:glow 3s ease-in-out infinite}
.pulse{animation:pulse 1.8s ease-in-out infinite}
.spin{animation:spin .7s linear infinite;display:inline-block}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--ac)!important}
::selection{background:var(--ac);color:var(--bg)}
.coin-card:hover{border-color:var(--ac)!important;transform:translateY(-2px)}
.news-card:hover{border-color:var(--ac)!important}
button:active{opacity:.85}
`;

// ── UI ATOMS ──
const sCD={background:"var(--sf)",borderRadius:"var(--r)",border:"1px solid var(--bd)",padding:"16px 20px"};
const LB={display:"block",fontSize:10,fontWeight:700,color:"var(--t2)",marginBottom:5,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"var(--mono)"};
const IP={width:"100%",padding:"10px 14px",borderRadius:6,border:"1px solid var(--bd)",fontSize:13,fontFamily:"var(--mono)",background:"var(--bg)",color:"var(--tx)",marginBottom:12};
const SL={...IP,cursor:"pointer"};
const BP={padding:"10px 22px",borderRadius:7,border:"1px solid var(--ac)",background:"transparent",color:"var(--ac)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",transition:"all .15s",letterSpacing:.5};
const BPF={...BP,background:"var(--ac)",color:"var(--bg)",border:"none"};
const BO={...BP,color:"var(--t2)",borderColor:"var(--bd)"};
const BRD={...BP,color:"var(--rd)",borderColor:"var(--rd)"};
const TA={...IP,resize:"vertical",minHeight:72,fontFamily:"var(--mono)"};

const Card=({children,style:s,onClick:oc,className:cn})=><div onClick={oc} className={cn} style={{...sCD,...s,cursor:oc?"pointer":"default",transition:"all .2s"}}>{children}</div>;
const Stat=({label:l,value:v,sub:s,color:c="var(--ac)",sm})=><div style={{...sCD,flex:1,minWidth:sm?90:120,padding:sm?"10px 14px":"14px 18px"}}><div style={{fontSize:9,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--mono)",marginBottom:5}}>{l}</div><div style={{fontSize:sm?14:20,fontWeight:900,color:c,letterSpacing:-.5,lineHeight:1,fontFamily:"var(--mono)"}}>{v}</div>{s&&<div style={{fontSize:10,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>{s}</div>}</div>;
const Empty=({emoji:e,title:t,sub:s})=><div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"52px 20px",opacity:.5}}><div style={{fontSize:44,marginBottom:12}}>{e}</div><div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{t}</div>{s&&<div style={{fontSize:12,color:"var(--t2)",textAlign:"center",maxWidth:280}}>{s}</div>}</div>;
const Loader=()=><div style={{display:"flex",gap:5,justifyContent:"center",padding:20}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--ac)",animation:`pulse 1.4s ${i*.18}s ease-in-out infinite`}}/>)}</div>;
const Badge=({text,color="var(--ac)"})=><span style={{fontSize:9,fontWeight:700,letterSpacing:1,padding:"2px 7px",borderRadius:3,background:color+"22",color,fontFamily:"var(--mono)",border:`1px solid ${color}44`,whiteSpace:"nowrap"}}>{text}</span>;
const Divider=()=><div style={{height:1,background:"var(--bd)",margin:"12px 0"}}/>;

const Modal=({open,onClose,title,children,wide})=>{
  if(!open) return null;
  return <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)"}}/>
    <div className="su" style={{position:"relative",background:"var(--sf)",borderRadius:14,padding:"24px 28px",width:"100%",maxWidth:wide?720:460,maxHeight:"92vh",overflowY:"auto",border:"1px solid var(--bd)",boxShadow:"0 0 60px #d4a84310"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:13,fontWeight:800,fontFamily:"var(--mono)",color:"var(--ac)",letterSpacing:1}}>[ {title.toUpperCase()} ]</h3>
        <button onClick={onClose} style={{background:"var(--bg)",border:"1px solid var(--bd)",borderRadius:5,width:28,height:28,cursor:"pointer",color:"var(--t2)",fontSize:12}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
};

// ── IMAGE UPLOAD ──
function ImgUpload({label, value, onChange, t}) {
  const ref = useRef();
  return <div style={{marginBottom:12}}>
    <label style={LB}>{label}</label>
    <div onClick={()=>ref.current.click()} style={{width:"100%",aspectRatio:"1.6",borderRadius:8,border:`2px dashed var(--bd)`,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",position:"relative",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--ac)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bd)"}>
      {value ? <img src={value} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="coin"/> : <div style={{textAlign:"center",color:"var(--t2)"}}><div style={{fontSize:28,marginBottom:6}}>📷</div><div style={{fontSize:11,fontFamily:"var(--mono)"}}>{t("scanner","uploadHint")}</div></div>}
    </div>
    <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{if(e.target.files[0]){const c=await compressImage(e.target.files[0]);onChange(c)}}}/>
    {value && <button onClick={()=>onChange("")} style={{...BO,fontSize:10,padding:"4px 10px",marginTop:4}}>✕ Remove</button>}
  </div>;
}

// ── COIN FORM ──
function CoinForm({initial, onSave, t, currency, lang}) {
  const def = { name:"",country:"",year:"",denomination:"",material:"",grade_numeric:"",condition_grade:"",mint_mark:"",series:"",description:"",purchase_price:"",purchase_currency:currency||"USD",estimated_value:"",pcgs_number:"",diameter:"",weight:"",mintage:"",notes:"",obverse_image:"",reverse_image:"" };
  const [f, setF] = useState({...def,...(initial||{})});
  const set = k => v => setF(p=>({...p,[k]:v}));
  const fi = k => e => setF(p=>({...p,[k]:e.target.value}));

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
      <div style={{gridColumn:"1/-1"}}><label style={LB}>{t("coin","name")} *</label><input value={f.name} onChange={fi("name")} style={IP}/></div>
      <div><label style={LB}>{t("coin","country")}</label><select value={f.country} onChange={fi("country")} style={SL}><option value="">— Select —</option>{COUNTRIES_LIST.map(c=><option key={c}>{c}</option>)}<option value="__custom__">Other...</option></select></div>
      <div><label style={LB}>{t("coin","year")}</label><input type="number" value={f.year} onChange={fi("year")} placeholder="e.g. 1921" style={IP}/></div>
      <div><label style={LB}>{t("coin","denomination")}</label><input value={f.denomination} onChange={fi("denomination")} placeholder="e.g. $1, 1¢" style={IP}/></div>
      <div><label style={LB}>{t("coin","material")}</label><select value={f.material} onChange={fi("material")} style={SL}><option value="">— Select —</option>{MATERIALS.map(m=><option key={m}>{m}</option>)}</select></div>
      <div><label style={LB}>{t("coin","grade")} (Sheldon)</label><select value={f.grade_numeric} onChange={fi("grade_numeric")} style={SL}><option value="">— Ungraded —</option>{GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
      <div><label style={LB}>{t("coin","mintMark")}</label><input value={f.mint_mark} onChange={fi("mint_mark")} placeholder="D, S, O, CC, W..." style={IP}/></div>
      <div><label style={LB}>{t("coin","series")}</label><input value={f.series} onChange={fi("series")} placeholder="Morgan Dollar, Liberty..." style={IP}/></div>
      <div><label style={LB}>{t("coin","estValue")} ({t("coin","currency")})</label><input type="number" value={f.estimated_value} onChange={fi("estimated_value")} style={IP}/></div>
      <div><label style={LB}>{t("coin","purchasePrice")}</label><input type="number" value={f.purchase_price} onChange={fi("purchase_price")} style={IP}/></div>
      <div><label style={LB}>{t("coin","diameter")}</label><input value={f.diameter} onChange={fi("diameter")} placeholder="38.1mm" style={IP}/></div>
      <div><label style={LB}>{t("coin","weight")}</label><input value={f.weight} onChange={fi("weight")} placeholder="26.73g" style={IP}/></div>
      <div><label style={LB}>{t("coin","mintage")}</label><input type="number" value={f.mintage} onChange={fi("mintage")} style={IP}/></div>
      <div><label style={LB}>PCGS #</label><input value={f.pcgs_number} onChange={fi("pcgs_number")} placeholder="Certification number" style={IP}/></div>
      <div style={{gridColumn:"1/-1"}}><label style={LB}>{t("coin","desc")}</label><textarea value={f.description} onChange={fi("description")} style={TA}/></div>
      <div style={{gridColumn:"1/-1"}}><label style={LB}>{t("coin","notes")}</label><textarea value={f.notes} onChange={fi("notes")} style={{...TA,minHeight:52}}/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <ImgUpload label={t("coin","obverse")} value={f.obverse_image} onChange={set("obverse_image")} t={t}/>
      <ImgUpload label={t("coin","reverse")} value={f.reverse_image} onChange={set("reverse_image")} t={t}/>
    </div>
    <button onClick={()=>{if(!f.name.trim())return;onSave({...f,year:f.year?parseInt(f.year):null,estimated_value:parseFloat(f.estimated_value)||0,purchase_price:parseFloat(f.purchase_price)||0,mintage:f.mintage?parseInt(f.mintage):null})}} style={{...BPF,width:"100%",padding:13,fontSize:13}}>💾 {t("coin","save")}</button>
  </div>;
}

// ── COIN DETAIL VIEW ──
function CoinDetailView({coin, currency, t, onEdit, onDelete, lang}) {
  const [tab, setTab] = useState("info");
  const priceData = useMemo(()=>genPriceHistory(coin),[coin.id]);
  const gradeC = gradeColor(coin.grade_numeric);

  return <div>
    {/* Images */}
    {(coin.obverse_image||coin.reverse_image) && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      {["obverse_image","reverse_image"].map((k,i)=>coin[k]?<div key={k} style={{borderRadius:8,overflow:"hidden",border:"1px solid var(--bd)",aspectRatio:"1"}}>
        <img src={coin[k]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={i===0?t("coin","obverse"):t("coin","reverse")}/>
      </div>:<div key={k} style={{borderRadius:8,border:"1px dashed var(--bd)",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t3)",fontSize:32}}>🪙</div>)}
    </div>}

    {/* Header */}
    <div style={{marginBottom:16}}>
      <h2 style={{fontSize:18,fontWeight:900,marginBottom:4}}>{coin.name}</h2>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        {coin.grade_numeric && <Badge text={coin.grade_numeric} color={gradeC}/>}
        {coin.material && <Badge text={coin.material} color="var(--bl)"/>}
        {coin.country && <Badge text={coin.country} color="var(--pu)"/>}
        {coin.year && <Badge text={coin.year} color="var(--t2)"/>}
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:"1px solid var(--bd)",paddingBottom:8}}>
      {["info","chart","features"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{...BO,padding:"5px 12px",fontSize:11,background:tab===tb?"var(--ac)18":"transparent",color:tab===tb?"var(--ac)":"var(--t2)",borderColor:tab===tb?"var(--ac)":"var(--bd)"}}>{tb.charAt(0).toUpperCase()+tb.slice(1)}</button>)}
    </div>

    {tab==="info" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[
        ["Denomination",coin.denomination],["Year",coin.year],
        ["Material",coin.material],["Mint Mark",coin.mint_mark||"—"],
        ["Series",coin.series||"—"],["Diameter",coin.diameter||"—"],
        ["Weight",coin.weight||"—"],["Mintage",coin.mintage?.toLocaleString()||"—"],
        ["PCGS #",coin.pcgs_number||"—"],["Purchased",coin.purchase_price>0?fm(coin.purchase_price,coin.purchase_currency):"—"],
      ].map(([l,v])=>v&&<div key={l} style={{padding:"8px 12px",background:"var(--bg)",borderRadius:6}}>
        <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{l}</div>
        <div style={{fontSize:13,fontWeight:600,fontFamily:"var(--mono)"}}>{v}</div>
      </div>)}
      <div style={{gridColumn:"1/-1",padding:"10px 12px",background:"var(--bg)",borderRadius:6,borderLeft:"2px solid var(--ac)"}}>
        <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Estimated Value</div>
        <div style={{fontSize:22,fontWeight:900,color:"var(--ac)",fontFamily:"var(--mono)"}}>{fm(coin.estimated_value,currency)}</div>
      </div>
      {coin.description&&<div style={{gridColumn:"1/-1",fontSize:12,color:"var(--t2)",lineHeight:1.65,padding:"10px 12px",background:"var(--bg)",borderRadius:6}}>{coin.description}</div>}
      {coin.notes&&<div style={{gridColumn:"1/-1",fontSize:12,color:"var(--t2)",lineHeight:1.65,padding:"10px 12px",background:"var(--bg)",borderRadius:6,borderLeft:"2px solid var(--t3)"}}><span style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--t3)",textTransform:"uppercase",display:"block",marginBottom:4}}>Notes</span>{coin.notes}</div>}
    </div>}

    {tab==="chart" && <div>
      <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:10}}>
        PRICE HISTORY · {coin.name} · {coin.grade_numeric||"Avg"} · USD (estimated)
      </div>
      <Card style={{padding:"16px 8px"}}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={priceData}>
            <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4a843" stopOpacity={.15}/><stop offset="100%" stopColor="#d4a843" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26"/>
            <XAxis dataKey="year" tick={{fontSize:9,fill:"#555"}} interval="preserveStartEnd"/>
            <YAxis tick={{fontSize:9,fill:"#555"}} tickFormatter={v=>`$${v>=1000?Math.round(v/100)/10+"k":v}`}/>
            <Tooltip contentStyle={{background:"#111",border:"1px solid #333",fontSize:11,fontFamily:"monospace"}} formatter={v=>["$"+v.toLocaleString(),"Value"]}/>
            <Area type="monotone" dataKey="value" stroke="#d4a843" strokeWidth={2} fill="url(#cg)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <Stat label="Current Est." value={fm(coin.estimated_value,currency)} sm/>
        <Stat label="Since Listed" value={`+${(((coin.estimated_value||50)/(priceData[0]?.value||50)-1)*100).toFixed(0)}%`} color="var(--gn)" sm/>
        <Stat label="All-Time Low" value={"$"+Math.min(...priceData.map(d=>d.value)).toFixed(0)} color="var(--rd)" sm/>
      </div>
    </div>}

    {tab==="features" && <div>
      <div style={{padding:"12px 16px",background:"var(--bg)",borderRadius:8,marginBottom:12,border:"1px solid var(--bd)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:10,letterSpacing:1}}>🔍 COIN ANATOMY GUIDE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {zone:"Obverse (Front)",features:["Portrait / Main design","Date · usually lower left","Motto ('IN GOD WE TRUST')","Mint mark · near date","Designer's initials"]},
            {zone:"Reverse (Back)",features:["Eagle / National symbol","Denomination · large letters","Country name","'E PLURIBUS UNUM'","Fine gold/silver statement"]},
            {zone:"What to Inspect",features:["High points for wear","Strike quality (full details)","Luster (cartwheel effect)","Surface marks / hairlines","Edge — reeding, lettering"]},
            {zone:"Grade Clues",features:["MS: full luster, no wear","AU: slight wear, 90%+ luster","EF: light wear on high pts","VF: moderate wear visible","G: outline visible, flat"]},
          ].map(({zone,features})=><div key={zone} style={{background:"var(--sf2)",borderRadius:6,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:6,letterSpacing:.5}}>{zone}</div>
            {features.map((f,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",padding:"3px 0",borderBottom:i<features.length-1?"1px solid var(--bd)":"none",display:"flex",gap:6}}><span style={{color:"var(--ac)",flexShrink:0}}>▸</span>{f}</div>)}
          </div>)}
        </div>
      </div>
      {(coin.ai_features||[]).length>0 && <div style={{padding:"12px 16px",background:"var(--bg)",borderRadius:8,border:"1px solid var(--ac)22"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:8,letterSpacing:1}}>✦ AI-IDENTIFIED FEATURES</div>
        {(coin.ai_features||[]).map((f,i)=><div key={i} style={{fontSize:12,color:"var(--t2)",padding:"5px 0",borderBottom:i<coin.ai_features.length-1?"1px solid var(--bd)":"none",display:"flex",gap:8}}><span style={{color:"var(--ac)"}}>•</span>{f}</div>)}
      </div>}
    </div>}

    <div style={{display:"flex",gap:8,marginTop:20}}>
      <button onClick={onEdit} style={{...BPF,flex:1}}>✏️ {t("coin","edit")}</button>
      <button onClick={()=>{if(confirm("Delete this coin from your collection?")) onDelete();}} style={{...BRD,flex:1}}>🗑 {t("coin","delete")}</button>
    </div>
  </div>;
}

// ── AUTH SCREEN ──
function AuthScreen({t, lang, setLang}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const doAuth = async () => {
    if(!email||!pass){setErr("Fill in all fields.");return;}
    setLoading(true); setErr("");
    try {
      if(mode==="login") {
        const {error} = await sb.auth.signInWithPassword({email,password:pass});
        if(error) setErr(error.message);
      } else {
        const {error} = await sb.auth.signUp({email,password:pass});
        if(error) setErr(error.message);
        else setErr("Check your email to confirm your account, then sign in.");
      }
    } catch(e){setErr("Connection error.");}
    setLoading(false);
  };

  return <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--ft)"}}>
    <style>{CSS}</style>
    <div className="su" style={{background:"var(--sf)",borderRadius:16,padding:"44px 40px",maxWidth:420,width:"93%",border:"1px solid var(--bd)",boxShadow:"0 0 80px #d4a84308"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:8}}>🪙</div>
        <div className="glow" style={{fontFamily:"var(--mono)",fontSize:24,fontWeight:900,color:"var(--ac)",letterSpacing:3}}>{t("app","app")}</div>
        <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:4,letterSpacing:2}}>{t("app","tagline").toUpperCase()}</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {["login","register"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,padding:"8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"var(--mono)",background:mode===m?"var(--ac)":"var(--bd)",color:mode===m?"var(--bg)":"var(--t2)",transition:"all .15s"}}>{m==="login"?t("auth","login"):t("auth","register")}</button>)}
      </div>
      <label style={LB}>{t("auth","email")}</label>
      <input value={email} onChange={e=>{setEmail(e.target.value);setErr("")}} placeholder="your@email.com" style={IP} onKeyDown={e=>e.key==="Enter"&&doAuth()}/>
      <label style={LB}>{t("auth","password")}</label>
      <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr("")}} placeholder="••••••••" style={IP} onKeyDown={e=>e.key==="Enter"&&doAuth()}/>
      {err&&<div style={{padding:"8px 12px",borderRadius:6,background:err.includes("Check")?"#00cc6615":"#e8454515",color:err.includes("Check")?"var(--gn)":"var(--rd)",fontSize:12,fontFamily:"var(--mono)",marginBottom:12,border:`1px solid ${err.includes("Check")?"#00cc6633":"#e8454533"}`}}>{err}</div>}
      <button onClick={doAuth} disabled={loading} style={{...BPF,width:"100%",padding:14,fontSize:13,marginBottom:14}}>
        {loading?<span className="spin">◌</span>:mode==="login"?"→ "+t("auth","loginBtn"):"⚡ "+t("auth","regBtn")}
      </button>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>setLang(lang==="en"?"es":"en")} style={{...BO,fontSize:10,padding:"5px 10px"}}>🌐 {lang==="en"?"Español":"English"}</button>
        <button onClick={()=>{setMode(mode==="login"?"register":"login");setErr("")}} style={{background:"none",border:"none",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>{mode==="login"?t("auth","switchReg")+"Register":t("auth","switchLogin")+" Sign In"}</button>
      </div>
    </div>
  </div>;
}

// ── COLLECTION SCREEN ──
function CollectionScreen({coins, stats, currency, t, onAdd, onSelect, onDelete}) {
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");

  const sorted = useMemo(()=>{
    let c = [...coins];
    if(filter!=="all") c=c.filter(x=>(x.material||"").toLowerCase()===filter);
    switch(sort) {
      case "newest": return c.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      case "oldest_year": return c.sort((a,b)=>(a.year||9999)-(b.year||9999));
      case "value_high": return c.sort((a,b)=>(b.estimated_value||0)-(a.estimated_value||0));
      case "value_low": return c.sort((a,b)=>(a.estimated_value||0)-(b.estimated_value||0));
      case "name": return c.sort((a,b)=>a.name.localeCompare(b.name));
      default: return c;
    }
  },[coins,sort,filter]);

  const materials = [...new Set(coins.map(c=>c.material).filter(Boolean))];

  return <div>
    {/* Stats row */}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      <Stat label={t("collection","totalValue")} value={fm(stats.value,currency)} sub={`${stats.total} coins`}/>
      {stats.oldest&&<Stat label={t("collection","oldest")} value={stats.oldest.year||"?"} sub={stats.oldest.name.slice(0,18)} color="var(--pu)"/>}
      {stats.valuable&&<Stat label={t("collection","valuable")} value={fm(stats.valuable.estimated_value,currency)} sub={stats.valuable.name.slice(0,18)} color="var(--gn)"/>}
    </div>

    {/* Controls */}
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
      <button onClick={onAdd} style={{...BPF,padding:"8px 16px",fontSize:12}}>＋ {t("collection","add")}</button>
      <select value={sort} onChange={e=>setSort(e.target.value)} style={{...SL,width:"auto",marginBottom:0,fontSize:11,padding:"7px 10px"}}>
        <option value="newest">Newest Added</option>
        <option value="oldest_year">Oldest Year</option>
        <option value="value_high">Highest Value</option>
        <option value="value_low">Lowest Value</option>
        <option value="name">A–Z Name</option>
      </select>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...SL,width:"auto",marginBottom:0,fontSize:11,padding:"7px 10px"}}>
        <option value="all">All Materials</option>
        {materials.map(m=><option key={m} value={m.toLowerCase()}>{m}</option>)}
      </select>
    </div>

    {/* Grid */}
    {sorted.length===0
      ? <Empty emoji="🪙" title={t("collection","empty")} sub={t("collection","hint")}/>
      : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10}}>
          {sorted.map(c=><div key={c.id} className="coin-card" onClick={()=>onSelect(c)} style={{...sCD,padding:0,cursor:"pointer",overflow:"hidden",transition:"all .2s"}}>
            {/* Image */}
            <div style={{height:130,background:"var(--bg)",overflow:"hidden",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {c.obverse_image
                ? <img src={c.obverse_image} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={c.name}/>
                : <div style={{fontSize:48,opacity:.3}}>🪙</div>}
              {c.grade_numeric&&<div style={{position:"absolute",top:6,right:6}}><Badge text={c.grade_numeric} color={gradeColor(c.grade_numeric)}/></div>}
            </div>
            {/* Info */}
            <div style={{padding:"10px 12px"}}>
              <div style={{fontSize:12,fontWeight:700,marginBottom:2,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
              <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:6}}>{c.year||"?"} {c.country?`· ${c.country}`:""}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14,fontWeight:900,color:"var(--ac)",fontFamily:"var(--mono)"}}>{fm(c.estimated_value,currency)}</span>
                {c.material&&<span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{c.material}</span>}
              </div>
            </div>
          </div>)}
        </div>}
  </div>;
}

// ── AI SCANNER SCREEN ──
function ScannerScreen({apiKey, t, lang, currency, onSave, coins}) {
  const [step, setStep] = useState(1);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    const key = apiKey || localStorage.getItem("cv-api-key");
    if(!key){setError(t("scanner","noKey"));return;}
    if(!front&&!back){setError("Please upload at least one coin photo.");return;}
    setAnalyzing(true); setError("");

    const content = [];
    if(front) content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:front.split(",")[1]}});
    content.push({type:"text",text:"This is the obverse (front) of the coin."});
    if(back) { content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:back.split(",")[1]}}); content.push({type:"text",text:"This is the reverse (back) of the coin."}); }
    content.push({type:"text",text:`You are a world-class numismatic expert. Analyze the coin image(s) and respond ONLY with a JSON object (no markdown, no explanation) with these exact fields:
{"name":"Full coin name and date","country":"Country of origin","year":1921,"denomination":"denomination text","material":"composition","grade_numeric":"estimated Sheldon grade e.g. VF-30","condition_grade":"Condition description","mint_mark":"mint mark letter or null","series":"series/type name","diameter":"e.g. 38.1mm","weight":"e.g. 26.73g","mintage":44690000,"estimated_value":65,"description":"2-3 sentences of historical context and collector significance","ai_features":["notable feature 1","die variety or error if visible","condition notes","key identifying characteristics"],"preservation_tip":"One specific storage or handling recommendation"}
Be specific and accurate. For estimated_value use current USD fair market value for the estimated grade. Respond in ${lang==="es"?"Spanish":"English"}.`});

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-client-side-allow-browser":"true"},
        body:JSON.stringify({model:"claude-opus-4-5",max_tokens:1200,messages:[{role:"user",content}]})
      });
      const data = await res.json();
      if(data.error){setError(data.error.message);setAnalyzing(false);return;}
      const text = data.content?.[0]?.text||"{}";
      const json = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResult({...json, obverse_image:front, reverse_image:back});
      setStep(3);
    } catch(e){setError("AI analysis failed. Check your API key and try again.");}
    setAnalyzing(false);
  };

  const reset = () => { setStep(1); setFront(""); setBack(""); setResult(null); setError(""); };

  return <div style={{maxWidth:680,margin:"0 auto"}}>
    {/* Steps indicator */}
    <div style={{display:"flex",gap:0,marginBottom:24,background:"var(--sf)",borderRadius:8,overflow:"hidden",border:"1px solid var(--bd)"}}>
      {[1,2,3].map(s=><div key={s} style={{flex:1,padding:"10px",textAlign:"center",background:step===s?"var(--ac)":step>s?"var(--ac)22":"transparent",color:step===s?"var(--bg)":step>s?"var(--ac)":"var(--t3)",fontSize:11,fontWeight:700,fontFamily:"var(--mono)",transition:"all .2s",borderRight:s<3?"1px solid var(--bd)":"none"}}>
        {step>s?"✓ ":""}{t("scanner",`step${s}`)}
      </div>)}
    </div>

    {step===1&&<div className="su">
      <ImgUpload label={t("scanner","step1")} value={front} onChange={setFront} t={t}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {front&&<button onClick={()=>setStep(2)} style={{...BPF,flex:1}}>Next: Photograph Reverse →</button>}
        {front&&<button onClick={()=>{setBack("");setStep(3);analyze();}} style={{...BO,flex:1}}>Skip back side</button>}
      </div>
    </div>}

    {step===2&&<div className="su">
      <ImgUpload label={t("scanner","step2")} value={back} onChange={setBack} t={t}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>setStep(1)} style={{...BO,flex:1}}>← Back</button>
        <button onClick={analyze} disabled={analyzing} style={{...BPF,flex:2}}>
          {analyzing?<><span className="spin">◌</span> {t("scanner","analyzing")}</>:"🔬 "+t("scanner","analyze")}
        </button>
      </div>
    </div>}

    {step===3&&<div className="su">
      {analyzing&&<div style={{textAlign:"center",padding:40}}><Loader/><div style={{fontSize:13,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:12}}>{t("scanner","analyzing")}</div><div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:4}}>Claude AI is examining both sides of your coin...</div></div>}
      {!analyzing&&result&&<div>
        <div style={{padding:"12px 16px",background:"var(--ac)12",borderRadius:8,border:"1px solid var(--ac)33",marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:4,letterSpacing:1}}>✦ AI IDENTIFICATION COMPLETE</div>
          <div style={{fontSize:18,fontWeight:900,marginBottom:4}}>{result.name}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {result.grade_numeric&&<Badge text={result.grade_numeric} color={gradeColor(result.grade_numeric)}/>}
            {result.material&&<Badge text={result.material} color="var(--bl)"/>}
            {result.country&&<Badge text={result.country} color="var(--pu)"/>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
            {[["Year",result.year],["Denomination",result.denomination],["Mint Mark",result.mint_mark||"—"],["Diameter",result.diameter||"—"],["Weight",result.weight||"—"],["Mintage",result.mintage?.toLocaleString()||"—"],].map(([l,v])=><div key={l} style={{padding:"6px 10px",background:"var(--bg)",borderRadius:4}}><div style={{fontSize:8,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:1}}>{l}</div><div style={{fontSize:12,fontWeight:600,fontFamily:"var(--mono)"}}>{v}</div></div>)}
          </div>
        </div>

        {/* Estimated value */}
        <Card style={{marginBottom:12,borderColor:"var(--ac)33"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Estimated Market Value</div><div style={{fontSize:28,fontWeight:900,color:"var(--ac)",fontFamily:"var(--mono)"}}>{fm(result.estimated_value,currency)}</div></div>
            <div style={{fontSize:32}}>💰</div>
          </div>
          {result.condition_grade&&<div style={{fontSize:11,color:"var(--t2)",marginTop:6,fontFamily:"var(--mono)"}}>{result.condition_grade}</div>}
        </Card>

        {result.description&&<div style={{fontSize:12,color:"var(--t2)",lineHeight:1.65,padding:"10px 14px",background:"var(--bg)",borderRadius:8,marginBottom:12,borderLeft:"2px solid var(--ac)"}}>{result.description}</div>}

        {result.ai_features?.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:6,letterSpacing:1}}>✦ IDENTIFIED FEATURES</div>
          {result.ai_features.map((f,i)=><div key={i} style={{fontSize:11,color:"var(--t2)",padding:"5px 8px",background:"var(--bg)",borderRadius:4,marginBottom:3,display:"flex",gap:6}}><span style={{color:"var(--ac)"}}>▸</span>{f}</div>)}
        </div>}

        {result.preservation_tip&&<div style={{padding:"8px 12px",background:"#d4a84310",borderRadius:6,border:"1px solid var(--ac)22",fontSize:11,color:"var(--ac)",marginBottom:16}}>💡 {result.preservation_tip}</div>}

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onSave(result)} style={{...BPF,flex:2}}>💾 {t("scanner","save")}</button>
          <button onClick={reset} style={{...BO,flex:1}}>↺ {t("scanner","retry")}</button>
        </div>
      </div>}
    </div>}

    {error&&<div style={{padding:"10px 14px",borderRadius:6,background:"#e8454512",color:"var(--rd)",fontSize:12,fontFamily:"var(--mono)",border:"1px solid #e8454533",marginTop:10}}>{error}</div>}
  </div>;
}

// ── PCGS SCREEN ──
function PCGSScreen({t, lang, currency}) {
  const [certNum, setCertNum] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lookup = () => {
    const c = certNum.trim().replace(/\D/g,"");
    if(!c){return;}
    setScanning(true); setResult(null); setNotFound(false);
    setTimeout(()=>{
      const found = PCGS_DB[c];
      if(found) setResult(found); else setNotFound(true);
      setScanning(false);
    }, 1200);
  };

  const gradeVal = g => { if(!g) return "—"; return result?.prices?.[g]; };
  const allGrades = result ? Object.entries(result.prices||{}) : [];

  return <div style={{maxWidth:680,margin:"0 auto"}}>
    {/* Scanner UI */}
    <Card style={{marginBottom:16,padding:0,overflow:"hidden"}}>
      {/* Viewfinder */}
      <div style={{background:"#000",position:"relative",height:180,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        <div style={{position:"relative",width:220,height:60,border:"2px solid var(--ac)",borderRadius:4}}>
          <div style={{position:"absolute",top:-1,left:0,width:"25%",height:3,background:"var(--ac)"}}/>
          <div style={{position:"absolute",top:-1,right:0,width:"25%",height:3,background:"var(--ac)"}}/>
          <div style={{position:"absolute",bottom:-1,left:0,width:"25%",height:3,background:"var(--ac)"}}/>
          <div style={{position:"absolute",bottom:-1,right:0,width:"25%",height:3,background:"var(--ac)"}}/>
          {scanning&&<div className="pulse" style={{position:"absolute",inset:0,background:"var(--ac)11",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"var(--ac)",fontSize:11,fontFamily:"var(--mono)",letterSpacing:1}}>SCANNING...</span></div>}
          {!scanning&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--t3)",fontSize:10,fontFamily:"var(--mono)",letterSpacing:1}}>PCGS BARCODE READER</div>}
        </div>
        <div style={{position:"absolute",top:0,left:0,width:"100%",height:2,background:"var(--ac)",opacity:.4,animation:scanning?"scan 1.5s linear infinite":"none"}}/>
        {/* Corner brackets */}
        {["top:8px;left:8px","top:8px;right:8px","bottom:8px;left:8px","bottom:8px;right:8px"].map((pos,i)=><div key={i} style={{position:"absolute",...Object.fromEntries(pos.split(";").map(p=>p.split(":")))}}><div style={{width:12,height:12,border:"2px solid var(--ac)44",borderRadius:2}}/></div>)}
        <div style={{position:"absolute",bottom:10,right:12,fontSize:10,color:"var(--ac)88",fontFamily:"var(--mono)"}}>PCGS · COINVAULT PRO</div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",gap:8}}>
          <input value={certNum} onChange={e=>setCertNum(e.target.value.replace(/\D/g,"").slice(0,8))} onKeyDown={e=>e.key==="Enter"&&lookup()} placeholder={t("pcgs","enterCert")} style={{...IP,marginBottom:0,flex:1,letterSpacing:2,fontFamily:"var(--mono)",fontSize:14}} maxLength={8}/>
          <button onClick={lookup} disabled={scanning||!certNum} style={{...BPF,padding:"0 20px",flexShrink:0}}>
            {scanning?<span className="spin">◌</span>:"🔍 "+t("pcgs","search")}
          </button>
        </div>
        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:6}}>{t("pcgs","tryDemo")}</div>
      </div>
    </Card>

    {notFound&&<div style={{padding:"12px 16px",borderRadius:8,background:"#e8454510",color:"var(--rd)",fontSize:12,fontFamily:"var(--mono)",border:"1px solid #e8454530",marginBottom:16}}>{t("pcgs","notFound")}<br/><span style={{opacity:.7}}>{t("pcgs","tryDemo")}</span></div>}

    {result&&<div className="su">
      {/* PCGS Label */}
      <div style={{background:"linear-gradient(135deg,#00174a,#001030)",borderRadius:12,padding:"20px 24px",marginBottom:16,border:"2px solid #003080",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg,#003080,#0050c0,#003080)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#6090ff",fontFamily:"var(--mono)",letterSpacing:2,marginBottom:6}}>PCGS CERTIFIED</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:4}}>{result.coin}</div>
            <div style={{fontSize:12,color:"#88aaff",fontFamily:"var(--mono)"}}>{result.series} · {result.country}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:28,fontWeight:900,color:"#FFD700",fontFamily:"var(--mono)"}}>{result.grade}</div>
            <div style={{fontSize:10,color:"#88aaff",fontFamily:"var(--mono)"}}>CERT #{result.cert}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          {[["Material",result.material],["Diameter",result.diameter],["Weight",result.weight],["Mintage",result.mintage?.toLocaleString()],["Year",result.year],["Denomination",result.denom]].map(([l,v])=>v&&<div key={l} style={{padding:"4px 8px",background:"#ffffff15",borderRadius:4,fontSize:10,color:"#aaccff",fontFamily:"var(--mono)"}}>{l}: <span style={{color:"#fff",fontWeight:600}}>{v}</span></div>)}
        </div>
      </div>

      {/* Description */}
      {result.desc&&<div style={{fontSize:12,color:"var(--t2)",lineHeight:1.65,padding:"10px 14px",background:"var(--bg)",borderRadius:8,marginBottom:12,borderLeft:"2px solid #003080"}}>{result.desc}</div>}

      {/* Population */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>📊 {t("pcgs","pop")}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Total Graded",result.pop.total?.toLocaleString()],["At This Grade",result.pop.atGrade?.toLocaleString()],["Higher Grade",result.pop.higher?.toLocaleString()]].map(([l,v])=><div key={l} style={{textAlign:"center",padding:"10px",background:"var(--bg)",borderRadius:6}}><div style={{fontSize:18,fontWeight:900,color:"var(--ac)",fontFamily:"var(--mono)"}}>{v}</div><div style={{fontSize:9,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginTop:3,fontFamily:"var(--mono)"}}>{l}</div></div>)}
        </div>
        <div style={{marginTop:10,padding:"8px 12px",background:"var(--bg)",borderRadius:6,fontSize:11,color:"var(--t2)"}}>
          Population Rarity: <span style={{color:result.pop.total<2000?"var(--rd)":result.pop.total<10000?"var(--am)":"var(--gn)",fontWeight:700}}>{result.pop.total<2000?"Very Rare":result.pop.total<10000?"Scarce":"Common"}</span>
        </div>
      </Card>

      {/* Price Guide */}
      <Card>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>💰 {t("pcgs","price")} (USD)</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {allGrades.map(([g,v])=><div key={g} style={{padding:"8px 12px",background:g===result.grade.split(" ")[0]?"var(--ac)22":"var(--bg)",borderRadius:6,border:g===result.grade.split(" ")[0]?"1px solid var(--ac)44":"1px solid var(--bd)",minWidth:75,textAlign:"center"}}>
            <div style={{fontSize:10,fontWeight:700,color:gradeColor(g),fontFamily:"var(--mono)"}}>{g}</div>
            <div style={{fontSize:14,fontWeight:900,color:"var(--tx)",fontFamily:"var(--mono)"}}>${v?.toLocaleString()}</div>
          </div>)}
        </div>
      </Card>
    </div>}
  </div>;
}

// ── LIBRARY SCREEN ──
function LibraryScreen({coins, stats, currency, t, lang}) {
  const [tab, setTab] = useState("charts");

  const byCountry = useMemo(()=>{
    const m={};coins.forEach(c=>{const k=c.country||"Unknown";m[k]=(m[k]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name:name.length>12?name.slice(0,12)+"…":name,value}));
  },[coins]);

  const byMaterial = useMemo(()=>{
    const m={};coins.forEach(c=>{const k=c.material||"Unknown";m[k]=(m[k]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  },[coins]);

  const byEra = useMemo(()=>{
    const m={};coins.forEach(c=>{if(!c.year)return;const d=Math.floor(c.year/10)*10;const k=`${d}s`;m[k]=(m[k]||0)+1;});
    return Object.entries(m).sort((a,b)=>parseInt(a[0])-parseInt(b[0])).map(([name,value])=>({name,value}));
  },[coins]);

  const records = useMemo(()=>{
    if(!coins.length) return {};
    const sorted_val = [...coins].sort((a,b)=>(b.estimated_value||0)-(a.estimated_value||0));
    const sorted_yr = [...coins].filter(c=>c.year).sort((a,b)=>a.year-b.year);
    const sorted_mint = [...coins].filter(c=>c.mintage).sort((a,b)=>a.mintage-b.mintage);
    const gradeOrder = [...GRADES];
    const sorted_grade = [...coins].filter(c=>c.grade_numeric).sort((a,b)=>gradeOrder.indexOf(b.grade_numeric)-gradeOrder.indexOf(a.grade_numeric));
    return { mostValuable:sorted_val[0], oldest:sorted_yr[0], rarest:sorted_mint[0], bestGrade:sorted_grade[0] };
  },[coins]);

  if(!coins.length) return <Empty emoji="📊" title={t("library","title")} sub="Add coins to your collection to see statistics."/>;

  return <div>
    <div style={{display:"flex",gap:4,marginBottom:16}}>
      {["charts","records"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{...BO,padding:"7px 16px",fontSize:11,background:tab===tb?"var(--ac)18":"transparent",color:tab===tb?"var(--ac)":"var(--t2)",borderColor:tab===tb?"var(--ac)":"var(--bd)"}}>{tb.charAt(0).toUpperCase()+tb.slice(1)}</button>)}
    </div>

    {tab==="charts"&&<div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <Stat label={t("collection","totalCoins")} value={coins.length} sm/>
        <Stat label={t("collection","totalValue")} value={fm(stats.value,currency)} sm/>
        <Stat label="Avg Value" value={fm(stats.value/Math.max(coins.length,1),currency)} sm/>
        <Stat label="Countries" value={[...new Set(coins.map(c=>c.country).filter(Boolean))].length} color="var(--pu)" sm/>
      </div>

      {byCountry.length>0&&<Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>{t("library","byCountry").toUpperCase()}</div>
        <ResponsiveContainer width="100%" height={170}><BarChart data={byCountry}><CartesianGrid strokeDasharray="3 3" stroke="#1e1e26"/><XAxis dataKey="name" tick={{fontSize:9,fill:"#555"}}/><YAxis tick={{fontSize:9,fill:"#555"}}/><Tooltip contentStyle={{background:"#111",border:"1px solid #333",fontSize:11}}/><Bar dataKey="value" fill="var(--ac)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
      </Card>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        {byMaterial.length>0&&<Card>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>{t("library","byMaterial").toUpperCase()}</div>
          <ResponsiveContainer width="100%" height={140}><PieChart><Pie data={byMaterial} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} style={{fontSize:8}}>{byMaterial.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip contentStyle={{background:"#111",border:"1px solid #333",fontSize:11}}/></PieChart></ResponsiveContainer>
        </Card>}
        {byEra.length>0&&<Card>
          <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>{t("library","byEra").toUpperCase()}</div>
          <ResponsiveContainer width="100%" height={140}><BarChart data={byEra}><XAxis dataKey="name" tick={{fontSize:8,fill:"#555"}}/><YAxis tick={{fontSize:8,fill:"#555"}}/><Tooltip contentStyle={{background:"#111",border:"1px solid #333",fontSize:11}}/><Bar dataKey="value" fill="var(--bl)" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
        </Card>}
      </div>
    </div>}

    {tab==="records"&&<div>
      <div style={{fontSize:10,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>🏆 {t("library","records").toUpperCase()}</div>
      {[
        {label:t("library","mostValuable"), coin:records.mostValuable, detail:c=>fm(c.estimated_value,currency), color:"var(--ac)", emoji:"💰"},
        {label:t("library","oldest"), coin:records.oldest, detail:c=>`Year ${c.year}`, color:"var(--pu)", emoji:"⏳"},
        {label:t("library","rarest"), coin:records.rarest, detail:c=>`${c.mintage?.toLocaleString()} minted`, color:"var(--rd)", emoji:"💎"},
        {label:t("library","highestGrade"), coin:records.bestGrade, detail:c=>c.grade_numeric, color:"var(--gn)", emoji:"🏅"},
      ].map(({label,coin,detail,color,emoji})=>coin&&<Card key={label} style={{marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
        <div style={{fontSize:32,flexShrink:0}}>{emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{label}</div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{coin.name}</div>
          <div style={{fontSize:13,fontWeight:900,color,fontFamily:"var(--mono)"}}>{detail(coin)}</div>
        </div>
        {coin.obverse_image&&<img src={coin.obverse_image} style={{width:52,height:52,borderRadius:6,objectFit:"cover",border:"1px solid var(--bd)"}}/>}
      </Card>)}
    </div>}
  </div>;
}

// ── NEWS SCREEN ──
function NewsScreen({t, lang}) {
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = cat==="all" ? NEWS : NEWS.filter(n=>n.cat===cat);
  const CATS = ["all","auction","market","grading"];

  return <div>
    {/* Category tabs */}
    <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
      {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{...BO,padding:"6px 14px",fontSize:11,background:cat===c?"var(--ac)18":"transparent",color:cat===c?"var(--ac)":"var(--t2)",borderColor:cat===c?"var(--ac)":"var(--bd)"}}>{(t("news",c)||c).toUpperCase()}</button>)}
    </div>

    {filtered.map(n=><div key={n.id} className="news-card" onClick={()=>setSelected(selected?.id===n.id?null:n)} style={{...sCD,marginBottom:8,cursor:"pointer",transition:"all .2s"}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{n.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:6,marginBottom:5,alignItems:"center",flexWrap:"wrap"}}>
            <Badge text={n.cat.toUpperCase()} color={n.cat==="auction"?"var(--ac)":n.cat==="market"?"var(--gn)":"var(--bl)"}/>
            <span style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{n.source} · {n.date}</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,lineHeight:1.4,marginBottom:4}}>{n.title}</div>
          {selected?.id===n.id
            ? <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,marginTop:8,paddingTop:8,borderTop:"1px solid var(--bd)"}}>{n.body}</div>
            : <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.body}</div>}
        </div>
      </div>
      <div style={{fontSize:10,color:"var(--ac)",fontFamily:"var(--mono)",marginTop:6,paddingLeft:40}}>{selected?.id===n.id?"▲ Collapse":"▼ "+t("news","readMore")}</div>
    </div>)}
  </div>;
}

// ── CHAT SCREEN ──
function ChatScreen({chatMsgs, chatIn, setChatIn, sendChat, aiTyping, chatRef, t, lang}) {
  const sugs = t("chat","suggestions");
  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
    <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
      {chatMsgs.length===0&&<div style={{textAlign:"center",padding:"36px 16px"}}>
        <div style={{fontSize:48,marginBottom:8}}>🏛️</div>
        <div className="glow" style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:900,color:"var(--ac)",letterSpacing:2,marginBottom:6}}>{t("chat","title").toUpperCase()}</div>
        <div style={{fontSize:12,color:"var(--t2)",marginBottom:20,maxWidth:360,margin:"0 auto 20px",lineHeight:1.6}}>{t("chat","welcome")}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
          {(Array.isArray(sugs)?sugs:[]).map(q=><button key={q} onClick={()=>setChatIn(q)} style={{...BO,fontSize:11,padding:"6px 12px"}}>{q}</button>)}
        </div>
      </div>}

      {chatMsgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:8,padding:"0 4px"}}>
        <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.role==="user"?"var(--ac)":"var(--sf)",color:m.role==="user"?"var(--bg)":"var(--tx)",fontSize:12,lineHeight:1.65,whiteSpace:"pre-line",fontFamily:m.role==="ai"?"var(--mono)":"var(--ft)",border:m.role==="ai"?"1px solid var(--bd)":"none"}}>
          {m.role==="ai"&&<div style={{fontSize:8,fontWeight:700,color:"var(--ac)",marginBottom:4,letterSpacing:1.5}}>✦ AI NUMISMATIST</div>}
          {m.text}
        </div>
      </div>)}

      {aiTyping&&<div style={{padding:"0 4px",marginBottom:8}}>
        <div style={{padding:"10px 14px",borderRadius:"12px 12px 12px 2px",background:"var(--sf)",border:"1px solid var(--bd)",display:"inline-flex",gap:5,alignItems:"center"}}>
          <Loader/><span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>thinking...</span>
        </div>
      </div>}
      <div ref={chatRef}/>
    </div>

    <div style={{display:"flex",gap:6,paddingTop:10,borderTop:"1px solid var(--bd)"}}>
      <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()} placeholder={t("chat","placeholder")} style={{flex:1,padding:"11px 14px",borderRadius:7,border:"1px solid var(--bd)",fontSize:12,fontFamily:"var(--mono)",background:"var(--bg)",color:"var(--tx)"}}/>
      <button onClick={sendChat} disabled={aiTyping} style={{...BPF,padding:"0 16px",fontSize:13}}>➤</button>
    </div>
  </div>;
}

// ── SETTINGS SCREEN ──
function SettingsScreen({lang, setLang, currency, setCurrency, apiKey, setApiKey, user, onLogout, t}) {
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const save = () => { setApiKey(key); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return <div style={{maxWidth:500}}>
    <Card style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>🌐 {t("settings","language").toUpperCase()}</div>
      <div style={{display:"flex",gap:8}}>
        {[["en","🇺🇸 English"],["es","🇲🇽 Español"]].map(([l,lb])=><button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${lang===l?"var(--ac)":"var(--bd)"}`,background:lang===l?"var(--ac)18":"var(--bg)",color:lang===l?"var(--ac)":"var(--t2)",cursor:"pointer",fontWeight:700,fontSize:13}}>{lb}</button>)}
      </div>
    </Card>

    <Card style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>💱 {t("settings","currency").toUpperCase()}</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {Object.entries(CURRENCIES).map(([c,{s,n}])=><button key={c} onClick={()=>setCurrency(c)} style={{padding:"8px 14px",borderRadius:6,border:`1px solid ${currency===c?"var(--ac)":"var(--bd)"}`,background:currency===c?"var(--ac)18":"var(--bg)",color:currency===c?"var(--ac)":"var(--t2)",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"var(--mono)"}}>{s} {c}</button>)}
      </div>
    </Card>

    <Card style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:4,letterSpacing:1}}>🤖 {t("settings","apiKey").toUpperCase()}</div>
      <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:10}}>{t("settings","apiKeyHint")}</div>
      <label style={LB}>Claude API Key</label>
      <input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-ant-..." style={IP}/>
      <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:10}}>Get your key at console.anthropic.com · Stored only in your browser</div>
      <button onClick={save} style={{...BPF,width:"100%"}}>{saved?"✓ Saved!":"💾 "+t("settings","save")}</button>
    </Card>

    <Card style={{marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:12,letterSpacing:1}}>👤 {t("settings","account").toUpperCase()}</div>
      <div style={{fontSize:12,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:12}}>Signed in as: <span style={{color:"var(--ac)"}}>{user?.email}</span></div>
      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:10}}>Supabase: pcgcmwnrxiqlsxnkmuti.supabase.co</div>
      <button onClick={onLogout} style={{...BRD,width:"100%"}}>🚪 {t("settings","logout")}</button>
    </Card>

    <div style={{textAlign:"center",padding:"12px",fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{t("settings","version")}</div>
  </div>;
}

// ── MAIN APP ──
export default function CoinVault() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(()=>localStorage.getItem("cv-lang")||"es");
  const [currency, setCurrency] = useState(()=>localStorage.getItem("cv-cur")||"USD");
  const [nav, setNav] = useState("collection");
  const [coins, setCoins] = useState([]);
  const [apiKey, setApiKey] = useState(()=>localStorage.getItem("cv-api-key")||"");
  const [modal, setModal] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatRef = useRef(null);

  const t = (section, key) => TR[lang]?.[section]?.[key] || TR.en?.[section]?.[key] || key;

  // Auth init
  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);fetchCoins(session.user.id);setScreen("app");}
      else setScreen("auth");
    });
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);fetchCoins(session.user.id);setScreen("app");}
      else{setUser(null);setCoins([]);setScreen("auth");}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // Persist settings
  useEffect(()=>{localStorage.setItem("cv-lang",lang);},[lang]);
  useEffect(()=>{localStorage.setItem("cv-cur",currency);},[currency]);

  const fetchCoins = async uid => {
    const {data,error} = await sb.from("coins").select("*").eq("user_id",uid).order("created_at",{ascending:false});
    if(!error&&data) setCoins(data);
  };

  const saveCoin = async coinData => {
    if(!user) return;
    const row = {...coinData, user_id:user.id, updated_at:new Date().toISOString()};
    if(coinData.id){
      const {data,error} = await sb.from("coins").update(row).eq("id",coinData.id).select();
      if(!error&&data) setCoins(p=>p.map(c=>c.id===coinData.id?data[0]:c));
    } else {
      const {data,error} = await sb.from("coins").insert([row]).select();
      if(!error&&data) setCoins(p=>[data[0],...p]);
    }
  };

  const deleteCoin = async id => {
    await sb.from("coins").delete().eq("id",id);
    setCoins(p=>p.filter(c=>c.id!==id));
  };

  const sendChat = async () => {
    if(!chatIn.trim()||aiTyping) return;
    const msg = chatIn.trim(); setChatIn("");
    setChatMsgs(p=>[...p,{role:"user",text:msg}]);
    setAiTyping(true);
    const summary = coins.length>0?`User collection: ${coins.length} coins worth ${fm(coins.reduce((s,c)=>s+(c.estimated_value||0),0),currency)}. Top coins: ${coins.slice(0,3).map(c=>`${c.name} ${c.year||""} (${c.grade_numeric||"ungraded"}, ${fm(c.estimated_value,currency)})`).join("; ")}.`:"User has no coins in collection.";
    try {
      const k = apiKey||localStorage.getItem("cv-api-key");
      if(!k){setChatMsgs(p=>[...p,{role:"ai",text:t("scanner","noKey")}]);setAiTyping(false);return;}
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":k,"anthropic-version":"2023-06-01","anthropic-dangerous-client-side-allow-browser":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,
          system:`You are an expert numismatist AI for CoinVault Pro. Deep knowledge of US and world coins, grading (Sheldon scale), market values, history, storage, and investment. Be concise and specific. ${summary} Respond in ${lang==="es"?"Spanish":"English"}.`,
          messages:[...chatMsgs.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:msg}]})
      });
      const data = await res.json();
      setChatMsgs(p=>[...p,{role:"ai",text:data.content?.[0]?.text||"I couldn't process that."}]);
    } catch(e){setChatMsgs(p=>[...p,{role:"ai",text:"Connection error. Check your API key in Settings."}]);}
    setAiTyping(false);
  };

  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"});},[chatMsgs,aiTyping]);

  const stats = useMemo(()=>{
    if(!coins.length) return {total:0,value:0,oldest:null,valuable:null};
    return {
      total:coins.length,
      value:coins.reduce((s,c)=>s+(c.estimated_value||0),0),
      oldest:[...coins].filter(c=>c.year).sort((a,b)=>a.year-b.year)[0]||null,
      valuable:[...coins].sort((a,b)=>(b.estimated_value||0)-(a.estimated_value||0))[0]||null,
    };
  },[coins]);

  const NAV_ITEMS = [
    {id:"collection",ic:"🪙",lb:t("nav","collection")},
    {id:"scanner",ic:"🔬",lb:t("nav","scanner")},
    {id:"pcgs",ic:"🏅",lb:t("nav","pcgs")},
    {id:"library",ic:"📊",lb:t("nav","library")},
    {id:"news",ic:"📰",lb:t("nav","news")},
    {id:"chat",ic:"✦",lb:t("nav","chat")},
    {id:"settings",ic:"⚙️",lb:t("nav","settings")},
  ];

  if(screen==="loading") return <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:8}}>🪙</div><div className="glow" style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:900,color:"#d4a843",letterSpacing:3}}>COINVAULT PRO</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a3020",marginTop:6,letterSpacing:2}}>LOADING...</div></div></div>;
  if(screen==="auth") return <AuthScreen t={t} lang={lang} setLang={setLang}/>;

  const renderScreen = ()=>{
    switch(nav){
      case "collection": return <CollectionScreen coins={coins} stats={stats} currency={currency} t={t} onAdd={()=>setModal("addCoin")} onSelect={c=>{setSelectedCoin(c);setModal("coinDetail");}} onDelete={deleteCoin}/>;
      case "scanner": return <ScannerScreen apiKey={apiKey} t={t} lang={lang} currency={currency} onSave={data=>{setScanResult(data);setModal("addCoin");}}/>;
      case "pcgs": return <PCGSScreen t={t} lang={lang} currency={currency}/>;
      case "library": return <LibraryScreen coins={coins} stats={stats} currency={currency} t={t} lang={lang}/>;
      case "news": return <NewsScreen t={t} lang={lang}/>;
      case "chat": return <ChatScreen chatMsgs={chatMsgs} chatIn={chatIn} setChatIn={setChatIn} sendChat={sendChat} aiTyping={aiTyping} chatRef={chatRef} t={t} lang={lang}/>;
      case "settings": return <SettingsScreen lang={lang} setLang={setLang} currency={currency} setCurrency={c=>{setCurrency(c);localStorage.setItem("cv-cur",c);}} apiKey={apiKey} setApiKey={k=>{setApiKey(k);localStorage.setItem("cv-api-key",k);}} user={user} onLogout={()=>sb.auth.signOut()} t={t}/>;
      default: return null;
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"var(--bg)",fontFamily:"var(--ft)",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside style={{width:214,height:"100vh",background:"var(--sf)",borderRight:"1px solid var(--bd)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid var(--bd)"}}>
          <div className="glow" style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:900,color:"var(--ac)",letterSpacing:2}}>🪙 COINVAULT</div>
          <div style={{fontSize:8,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2,letterSpacing:1.5}}>PRO · AI-POWERED COLLECTION</div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
          {NAV_ITEMS.map(item=><button key={item.id} onClick={()=>setNav(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:nav===item.id?"var(--ac)14":"transparent",color:nav===item.id?"var(--ac)":"var(--t2)",fontFamily:"var(--ft)",textAlign:"left",marginBottom:1,borderLeft:nav===item.id?"2px solid var(--ac)":"2px solid transparent",transition:"all .15s"}}>
            <span style={{fontSize:15,width:20,textAlign:"center"}}>{item.ic}</span>
            <span>{item.lb}</span>
          </button>)}
        </nav>
        <div style={{padding:"10px 14px",borderTop:"1px solid var(--bd)"}}>
          <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{stats.total} coins · {fm(stats.value,currency)}</div>
          <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,height:"100vh"}}>
        <header style={{padding:"10px 22px",borderBottom:"1px solid var(--bd)",background:"var(--sf)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,fontFamily:"var(--mono)",color:"var(--ac)"}}>[ {(NAV_ITEMS.find(n=>n.id===nav)?.lb||"").toUpperCase()} ]</div>
            <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:1}}>{new Date().toLocaleDateString(lang==="es"?"es-MX":"en-US",{weekday:"short",year:"numeric",month:"short",day:"numeric"})}</div>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"var(--mono)",fontWeight:900,fontSize:13,color:"var(--ac)"}}>{fm(stats.value,currency)}</div>
              <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>{stats.total} coins</div>
            </div>
            <button onClick={()=>{setNav("collection");setModal("addCoin");}} style={{...BPF,padding:"7px 12px",fontSize:11}}>＋</button>
          </div>
        </header>
        <div className="su" key={nav} style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>{renderScreen()}</div>
      </main>

      {/* Modals */}
      <Modal open={modal==="addCoin"} onClose={()=>{setModal(null);setScanResult(null);}} title={t("collection","add")} wide>
        <CoinForm t={t} lang={lang} currency={currency} initial={scanResult||null} onSave={async data=>{await saveCoin(data);setModal(null);setScanResult(null);}}/>
      </Modal>
      <Modal open={modal==="coinDetail"} onClose={()=>{setModal(null);setSelectedCoin(null);}} title={selectedCoin?.name||"Coin"} wide>
        {selectedCoin&&<CoinDetailView coin={selectedCoin} currency={currency} t={t} lang={lang}
          onEdit={()=>setModal("editCoin")}
          onDelete={async()=>{await deleteCoin(selectedCoin.id);setModal(null);setSelectedCoin(null);}}/>}
      </Modal>
      <Modal open={modal==="editCoin"} onClose={()=>setModal("coinDetail")} title={t("coin","edit")} wide>
        {selectedCoin&&<CoinForm t={t} lang={lang} currency={currency} initial={selectedCoin} onSave={async data=>{await saveCoin({...data,id:selectedCoin.id});setCoins(p=>p.map(c=>c.id===selectedCoin.id?{...c,...data}:c));setSelectedCoin(prev=>({...prev,...data}));setModal("coinDetail");}}/>}
      </Modal>
    </div>
  );
}
