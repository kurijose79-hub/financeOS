import { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Card, Stat, Empty, lb, ip, sl, bp, bpFill, bo, uid } from "./ui.jsx";

/* ═══════════════════════════════════════════════════════════════
   CRYPTO MODULE — pronóstico técnico, minería, inversión, academia
   Todo el contenido es EDUCATIVO. Ninguna cifra aquí es una promesa
   ni una recomendación financiera personalizada.
   ═══════════════════════════════════════════════════════════════ */

const COINS=[
  {id:"bitcoin",sym:"BTC",name:"Bitcoin",mineable:false},
  {id:"ethereum",sym:"ETH",name:"Ethereum",mineable:false},
  {id:"litecoin",sym:"LTC",name:"Litecoin",mineable:true},
  {id:"monero",sym:"XMR",name:"Monero",mineable:true},
  {id:"kaspa",sym:"KAS",name:"Kaspa",mineable:true},
  {id:"ravencoin",sym:"RVN",name:"Ravencoin",mineable:true},
  {id:"ergo",sym:"ERG",name:"Ergo",mineable:true},
  {id:"dogecoin",sym:"DOGE",name:"Dogecoin",mineable:true},
  {id:"solana",sym:"SOL",name:"Solana",mineable:false},
  {id:"cardano",sym:"ADA",name:"Cardano",mineable:false},
  {id:"ripple",sym:"XRP",name:"XRP",mineable:false},
  {id:"binancecoin",sym:"BNB",name:"BNB",mineable:false},
];
const coinName=id=>COINS.find(c=>c.id===id)?.name||id;
const coinSym=id=>COINS.find(c=>c.id===id)?.sym||"?";

// ── HELPERS ──
async function fetchJSON(url){
  try{const r=await fetch(url);if(!r.ok)throw 0;return await r.json()}catch{return null}
}
const fmtUsd=n=>{
  if(n==null||Number.isNaN(n))return "—";
  const dec=Math.abs(n)<1?6:Math.abs(n)<100?4:2;
  return `$${n.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})}`;
};
function sma(arr,period){
  const out=[];
  for(let i=0;i<arr.length;i++){
    if(i<period-1){out.push(null);continue}
    let s=0;for(let j=i-period+1;j<=i;j++)s+=arr[j];
    out.push(+(s/period).toFixed(6));
  }
  return out;
}
function rsi(closes,period=14){
  if(closes.length<period+1)return null;
  let gains=0,losses=0;
  for(let i=closes.length-period;i<closes.length;i++){
    const diff=closes[i]-closes[i-1];
    if(diff>=0)gains+=diff;else losses-=diff;
  }
  const avgG=gains/period,avgL=losses/period;
  if(avgL===0)return 100;
  const rs=avgG/avgL;
  return +(100-(100/(1+rs))).toFixed(1);
}
function linreg(ys){
  const n=ys.length;const xs=ys.map((_,i)=>i);
  const xm=xs.reduce((a,b)=>a+b,0)/n,ym=ys.reduce((a,b)=>a+b,0)/n;
  let num=0,den=0;
  for(let i=0;i<n;i++){num+=(xs[i]-xm)*(ys[i]-ym);den+=(xs[i]-xm)**2}
  const slope=den===0?0:num/den;
  return {slope,intercept:ym-slope*xm};
}
const stddev=ys=>{const m=ys.reduce((a,b)=>a+b,0)/ys.length;return Math.sqrt(ys.reduce((a,b)=>a+(b-m)**2,0)/ys.length)};

// ── MINING STATIC REFERENCE DATA (aproximado — verifica en whattomine.com) ──
const MINE=  {
  litecoin:{networkHash:1.1e15,blockReward:6.25,blocksPerDay:576,algo:"Scrypt",hw:"ASIC (Antminer L7 ≈ 9.5 GH/s c/u)",defUnit:"GH",defHash:19,pools:["LitecoinPool.org","F2Pool","ViaBTC"]},
  dogecoin:{networkHash:1.1e15,blockReward:10000,blocksPerDay:1440,algo:"Scrypt (merge-mined con LTC)",hw:"ASIC (Antminer L7 ≈ 9.5 GH/s c/u)",defUnit:"GH",defHash:19,pools:["Aikapool","F2Pool","ViaBTC"]},
  monero:{networkHash:3.5e9,blockReward:0.6,blocksPerDay:720,algo:"RandomX",hw:"CPU (Ryzen, Epyc)",defUnit:"KH",defHash:15,pools:["SupportXMR","MoneroOcean","Nanopool"]},
  kaspa:{networkHash:1e18,blockReward:88,blocksPerDay:86400,algo:"kHeavyHash",hw:"ASIC/GPU (KS0, RTX 40xx)",defUnit:"GH",defHash:500,pools:["Herominers","WoolyPooly","2Miners"]},
  ravencoin:{networkHash:6e12,blockReward:2500,blocksPerDay:1440,algo:"KAWPOW",hw:"GPU (RTX/RX gama alta)",defUnit:"MH",defHash:60,pools:["2Miners","WoolyPooly","Ravenminer"]},
  ergo:{networkHash:20e12,blockReward:27,blocksPerDay:720,algo:"Autolykos2",hw:"GPU (RTX/RX gama alta)",defUnit:"MH",defHash:200,pools:["2Miners","Herominers","K1Pool"]},
};
const UNIT_MULT={H:1,KH:1e3,MH:1e6,GH:1e9,TH:1e12,PH:1e15};

// ── ACCORDION CARD ──
function Lesson({t,children,open,onToggle}){
  return <Card style={{marginBottom:8,padding:0,overflow:"hidden"}}>
    <div onClick={onToggle} style={{padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontWeight:700,fontSize:13}}>{t}</span>
      <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--ac)"}}>{open?"−":"+"}</span>
    </div>
    {open&&<div style={{padding:"0 16px 16px",fontSize:12,color:"var(--t2)",lineHeight:1.7,whiteSpace:"pre-line"}}>{children}</div>}
  </Card>;
}

const Disclaimer=({children})=> <Card style={{borderColor:"var(--rd)",background:"#ff335508",marginTop:12,marginBottom:12}}>
  <div style={{fontSize:11,color:"var(--rd)",fontWeight:700,fontFamily:"var(--mono)",marginBottom:4}}>⚠ NO ES ASESORÍA FINANCIERA</div>
  <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.6}}>{children}</div>
</Card>;

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */
export default function CryptoModule({sub}){
  const[tick,setTick]=useState({});
  const[coin,setCoin]=useState("bitcoin");
  const[hist,setHist]=useState(null);
  const[loading,setLoading]=useState(false);
  const[offline,setOffline]=useState(false);

  const loadTicker=useCallback(async()=>{
    const ids=COINS.map(c=>c.id).join(",");
    const d=await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    if(d)setTick(d);
  },[]);

  const loadHist=useCallback(async(id)=>{
    setLoading(true);
    const d=await fetchJSON(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90&interval=daily`);
    if(d?.prices?.length){
      setHist(d.prices.map(([t,p])=>({d:new Date(t).toISOString().slice(5,10),p:+p})));
      setOffline(false);
    }else{
      let x=Math.random()*40000+100;const n=90;const arr=[];
      for(let i=0;i<n;i++){x*=(1+(Math.random()-.495)*0.06);arr.push({d:new Date(Date.now()-(n-i)*864e5).toISOString().slice(5,10),p:+x.toFixed(4)})}
      setHist(arr);setOffline(true);
    }
    setLoading(false);
  },[]);

  useEffect(()=>{loadTicker();const iv=setInterval(loadTicker,60000);return()=>clearInterval(iv)},[loadTicker]);
  useEffect(()=>{loadHist(coin)},[coin,loadHist]);

  const closes=useMemo(()=>hist?hist.map(h=>h.p):[],[hist]);
  const sma7=useMemo(()=>sma(closes,7),[closes]);
  const sma30=useMemo(()=>sma(closes,30),[closes]);
  const rsi14=useMemo(()=>rsi(closes,14),[closes]);
  const chartData=useMemo(()=>hist?hist.map((h,i)=>({d:h.d,price:h.p,sma7:sma7[i],sma30:sma30[i]})):[],[hist,sma7,sma30]);
  const price=tick[coin]?.usd??closes[closes.length-1];
  const chg24=tick[coin]?.usd_24h_change;

  const bias=useMemo(()=>{
    if(closes.length<30||sma30[sma30.length-1]==null)return null;
    const p=closes[closes.length-1],s30=sma30[sma30.length-1],s7=sma7[sma7.length-1];
    let score=0;
    score+=p>s30?1:-1;
    score+=s7>s30?1:-1;
    if(rsi14!=null){if(rsi14>55)score++;else if(rsi14<45)score--}
    if(score>=2)return{label:"SESGO ALCISTA",color:"var(--gn)",icon:"▲"};
    if(score<=-2)return{label:"SESGO BAJISTA",color:"var(--rd)",icon:"▼"};
    return{label:"NEUTRAL / LATERAL",color:"var(--am)",icon:"■"};
  },[closes,sma7,sma30,rsi14]);

  const projection=useMemo(()=>{
    if(closes.length<20)return null;
    const recent=closes.slice(-30);
    const {slope,intercept}=linreg(recent);
    const sd=stddev(recent);
    const lastIdx=recent.length-1;
    const target=lastIdx+14;
    const base=slope*target+intercept;
    const dailyPct=closes[closes.length-1]?(slope/closes[closes.length-1]*100):0;
    return{base,low:Math.max(0,base-sd*1.8),high:base+sd*1.8,dailyPct};
  },[closes]);

  if(sub==="forecast") return <Forecast {...{tick,coin,setCoin,hist,loading,offline,chartData,price,chg24,bias,projection,rsi14}}/>;
  if(sub==="mining") return <Mining tick={tick}/>;
  if(sub==="invest") return <Invest {...{coin,setCoin,tick,hist}}/>;
  if(sub==="academy") return <Academy/>;
  if(sub==="theory") return <Theory/>;
  return null;
}

/* ═══ FORECAST ═══ */
function Forecast({tick,coin,setCoin,hist,loading,offline,chartData,price,chg24,bias,projection,rsi14}){
  return <div className="su">
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
      {COINS.map(c=>{const t=tick[c.id];const up=t?.usd_24h_change>=0;return <button key={c.id} onClick={()=>setCoin(c.id)} style={{padding:"8px 12px",borderRadius:6,cursor:"pointer",border:coin===c.id?"1px solid var(--ac)":"1px solid var(--bd)",background:coin===c.id?"var(--ac)10":"var(--sf)",textAlign:"left",fontFamily:"var(--mono)",minWidth:100}}>
        <div style={{fontSize:11,fontWeight:700,color:coin===c.id?"var(--ac)":"var(--tx)"}}>{c.sym}</div>
        <div style={{fontSize:10,color:"var(--t2)"}}>{t?fmtUsd(t.usd):"…"}</div>
        {t?.usd_24h_change!=null&&<div style={{fontSize:9,color:up?"var(--gn)":"var(--rd)"}}>{up?"+":""}{t.usd_24h_change.toFixed(1)}%</div>}
      </button>})}
    </div>

    <Card style={{background:"linear-gradient(135deg,#0d0d0d,#111)",border:"1px solid var(--ac)33",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",letterSpacing:2}}>{coinName(coin).toUpperCase()} · {coinSym(coin)}/USD</div>
          <div style={{fontSize:30,fontWeight:900,color:"var(--ac)",fontFamily:"var(--mono)"}}>{fmtUsd(price)}</div>
          {chg24!=null&&<div style={{fontSize:11,fontFamily:"var(--mono)",color:chg24>=0?"var(--gn)":"var(--rd)"}}>{chg24>=0?"▲":"▼"} {chg24.toFixed(2)}% (24h)</div>}
        </div>
        {bias&&<div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>ANÁLISIS TÉCNICO</div>
          <div style={{fontSize:15,fontWeight:800,fontFamily:"var(--mono)",color:bias.color}}>{bias.icon} {bias.label}</div>
          {rsi14!=null&&<div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>RSI(14): {rsi14}</div>}
        </div>}
      </div>
    </Card>

    <Card style={{marginBottom:14}}>
      <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)",marginBottom:8}}>PRECIO 90D · SMA7 · SMA30 {offline&&"· (modo offline — datos simulados)"}</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
          <XAxis dataKey="d" tick={{fontSize:8,fill:"#555"}} minTickGap={30}/>
          <YAxis tick={{fontSize:9,fill:"#555"}} domain={["auto","auto"]}/>
          <Tooltip contentStyle={{background:"#111",border:"1px solid #222",fontSize:11}}/>
          <Legend wrapperStyle={{fontSize:10}}/>
          <Line type="monotone" dataKey="price" name="Precio" stroke="var(--ac)" strokeWidth={1.6} dot={false}/>
          <Line type="monotone" dataKey="sma7" name="SMA7" stroke="var(--cyan)" strokeWidth={1.2} dot={false}/>
          <Line type="monotone" dataKey="sma30" name="SMA30" stroke="var(--pu)" strokeWidth={1.2} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </Card>

    {bias&&<Card style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:8}}>[ CÓMO SE CALCULA EL SESGO ]</div>
      <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.8}}>
        • Precio vs. SMA30 (promedio de 30 días): mide si el precio actual está por encima o debajo de la tendencia media<br/>
        • SMA7 vs. SMA30 (cruce de medias): mide momentum de corto plazo<br/>
        • RSI(14): {rsi14==null?"insuficientes datos":rsi14>70?`${rsi14} — posible sobrecompra`:rsi14<30?`${rsi14} — posible sobreventa`:`${rsi14} — zona neutral`}<br/><br/>
        Esto es un indicador puramente técnico y estadístico basado en precios pasados. NO predice el futuro.
      </div>
    </Card>}

    {projection&&<Card style={{marginBottom:6}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--am)",fontFamily:"var(--mono)",marginBottom:8}}>[ PROYECCIÓN ESTADÍSTICA A 14 DÍAS ]</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        <Stat label="Escenario bajo" value={fmtUsd(projection.low)} color="var(--rd)" small/>
        <Stat label="Escenario base" value={fmtUsd(projection.base)} color="var(--am)" small/>
        <Stat label="Escenario alto" value={fmtUsd(projection.high)} color="var(--gn)" small/>
      </div>
      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>Pendiente estimada: {projection.dailyPct>=0?"+":""}{projection.dailyPct.toFixed(2)}%/día (regresión lineal sobre últimos 30 días)</div>
    </Card>}

    <Disclaimer>
      Esta "proyección" es una extrapolación matemática simple (regresión lineal + desviación estándar) sobre precios pasados de los últimos 30-90 días. El mercado cripto es extremadamente volátil e impredecible: noticias, regulación, liquidez y sentimiento pueden invalidar cualquier tendencia en minutos. Ningún modelo —incluido este— puede garantizar cuánto valdrá una criptomoneda en el futuro. No inviertas dinero que no puedas permitirte perder, y consulta a un asesor financiero certificado antes de tomar decisiones importantes.
    </Disclaimer>
  </div>;
}

/* ═══ MINING ═══ */
function Mining({tick}){
  const mineableCoins=COINS.filter(c=>c.mineable);
  const[mCoin,setMCoin]=useState("litecoin");
  const md=MINE[mCoin];
  const[myHash,setMyHash]=useState(md.defHash);
  const[myUnit,setMyUnit]=useState(md.defUnit);
  const[watts,setWatts]=useState(3200);
  const[kwh,setKwh]=useState(0.12);
  const[fee,setFee]=useState(1);

  useEffect(()=>{const d=MINE[mCoin];setMyHash(d.defHash);setMyUnit(d.defUnit)},[mCoin]);

  const price=tick[mCoin]?.usd;
  const myHashHs=myHash*(UNIT_MULT[myUnit]||1);
  const share=md.networkHash>0?myHashHs/md.networkHash:0;
  const coinsPerDay=share*md.blocksPerDay*md.blockReward*(1-fee/100);
  const revenueUsd=price?coinsPerDay*price:0;
  const powerCostUsd=(watts/1000)*24*kwh;
  const netDay=revenueUsd-powerCostUsd;

  return <div className="su">
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
      {mineableCoins.map(c=> <button key={c.id} onClick={()=>setMCoin(c.id)} style={mCoin===c.id?{...bpFill,fontSize:11,padding:"7px 14px"}:{...bo,fontSize:11,padding:"7px 14px"}}>{c.sym}</button>)}
    </div>

    <Card style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:10}}>[ {coinName(mCoin).toUpperCase()} · {md.algo} ]</div>
      <div style={{fontSize:11,color:"var(--t2)",marginBottom:10}}>Hardware sugerido: <b style={{color:"var(--tx)"}}>{md.hw}</b></div>
      <label style={lb}>TU HASH RATE</label>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        <input type="number" value={myHash} onChange={e=>setMyHash(parseFloat(e.target.value)||0)} style={{...ip,marginBottom:0,flex:1}}/>
        <select value={myUnit} onChange={e=>setMyUnit(e.target.value)} style={{...sl,marginBottom:0,width:90}}>{Object.keys(UNIT_MULT).map(u=> <option key={u} value={u}>{u}/s</option>)}</select>
      </div>
      <label style={lb}>CONSUMO (WATTS)</label><input type="number" value={watts} onChange={e=>setWatts(parseFloat(e.target.value)||0)} style={ip}/>
      <label style={lb}>COSTO ELECTRICIDAD ($/kWh)</label><input type="number" step="0.01" value={kwh} onChange={e=>setKwh(parseFloat(e.target.value)||0)} style={ip}/>
      <label style={lb}>FEE DEL POOL (%)</label><input type="number" step="0.1" value={fee} onChange={e=>setFee(parseFloat(e.target.value)||0)} style={ip}/>
      <div style={{fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>Hashrate de red asumido: ~{(md.networkHash).toExponential(2)} H/s (aproximado, cambia constantemente)</div>
    </Card>

    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
      <Stat label={`${coinSym(mCoin)}/día`} value={coinsPerDay.toFixed(6)} color="var(--cyan)" small/>
      <Stat label="Ingreso/día" value={price?fmtUsd(revenueUsd):"sin precio"} color="var(--gn)" small/>
      <Stat label="Electricidad/día" value={fmtUsd(powerCostUsd)} color="var(--rd)" small/>
      <Stat label="Neto/día" value={price?fmtUsd(netDay):"sin precio"} color={netDay>=0?"var(--gn)":"var(--rd)"} small/>
      <Stat label="Neto/mes" value={price?fmtUsd(netDay*30):"sin precio"} color={netDay>=0?"var(--gn)":"var(--rd)"} small/>
    </div>

    <Card style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:8}}>¿DÓNDE MINAR? (pools de ejemplo)</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{md.pools.map(p=> <span key={p} style={{fontSize:11,padding:"5px 10px",borderRadius:4,background:"var(--bg)",border:"1px solid var(--bd)",fontFamily:"var(--mono)"}}>{p}</span>)}</div>
      <div style={{fontSize:10,color:"var(--t3)",marginTop:8}}>No es una recomendación de ningún pool en particular — investiga comisiones, historial de pagos y reputación antes de conectar tu hardware.</div>
    </Card>

    <Card style={{marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:8}}>¿CÓMO EMPEZAR A MINAR?</div>
      <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.8}}>
        1. Consigue el hardware adecuado para el algoritmo ({md.algo}).{"\n"}
        2. Crea una wallet propia (no dejes fondos en el exchange) y guarda tu dirección de recepción.{"\n"}
        3. Descarga software de minería compatible (ej. XMRig para CPU/GPU, firmware del fabricante para ASICs).{"\n"}
        4. Únete a un pool (ingresos más constantes) o mina en solitario (mayor riesgo, mayor recompensa potencial).{"\n"}
        5. Configura tu wallet/dirección en el software y monitorea temperatura, consumo y "hashrate" real.{"\n"}
        6. Revisa periódicamente la rentabilidad — la dificultad de red y el precio cambian constantemente.
      </div>
    </Card>

    <Disclaimer>
      Estos cálculos usan valores aproximados de dificultad/hashrate de red (no en tiempo real) y no consideran depreciación de hardware, variación de dificultad futura, impuestos ni el valor del tiempo invertido. Verifica cifras actualizadas en calculadoras especializadas (whattomine.com, minerstat.com) antes de comprar equipo. La minería puede estar regulada o restringida según tu país/región — infórmate sobre legalidad y costos de electricidad locales antes de invertir en hardware.
    </Disclaimer>
  </div>;
}

/* ═══ INVEST ═══ */
function Invest({coin,setCoin,tick,hist}){
  const[amt,setAmt]=useState(100);
  const[freqDays,setFreqDays]=useState(30);

  const dca=useMemo(()=>{
    if(!hist||hist.length<freqDays)return null;
    let coins=0,invested=0;const buys=[];
    for(let i=0;i<hist.length;i+=freqDays){coins+=amt/hist[i].p;invested+=amt;buys.push(hist[i])}
    const lastPrice=hist[hist.length-1].p;
    const value=coins*lastPrice;
    const lumpCoins=invested/hist[0].p;
    const lumpValue=lumpCoins*lastPrice;
    return{buysN:buys.length,invested,coins,value,roi:invested>0?(value-invested)/invested*100:0,
      lumpValue,lumpRoi:invested>0?(lumpValue-invested)/invested*100:0};
  },[hist,amt,freqDays]);

  return <div className="su">
    <Card style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:10}}>[ CÓMO INVERTIR EN CRIPTO — PASO A PASO ]</div>
      {[
        ["1. Edúcate primero","Entiende qué compras: Bitcoin no es igual a una altcoin especulativa. Lee el whitepaper o al menos el resumen del proyecto."],
        ["2. Elige un exchange reputable","Busca uno regulado, con buen historial de seguridad, KYC y buena liquidez. Activa 2FA (autenticación de dos factores) desde el día uno."],
        ["3. Fondea con Fiat","Deposita dinero fiat (USD, MXN, etc.) vía transferencia bancaria (usualmente menor comisión que tarjeta)."],
        ["4. Compra en SPOT","Compra el activo real, no derivados. Evita futuros/apalancamiento hasta tener experiencia — el apalancamiento amplifica pérdidas igual que ganancias."],
        ["5. Autocustodia","Si el monto es significativo, mueve tus fondos a una wallet propia (hardware wallet idealmente). \"Not your keys, not your coins.\""],
        ["6. Usa DCA (Dollar Cost Averaging)","Invierte una cantidad fija en intervalos regulares en vez de una sola vez. Reduce el riesgo de comprar todo en un mal momento."],
        ["7. Define tu asignación","Regla general conservadora: cripto ≤ 5-10% de tu portafolio total de inversión. Nunca inviertas dinero que necesitas a corto plazo. Ver Canon del 40% en FinanceOS."],
        ["8. Seguridad","Nunca compartas tu seed phrase (frase semilla). Desconfía de mensajes/DMs no solicitados. Verifica siempre la URL del exchange."],
      ].map(([t,d])=> <div key={t} style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:700,color:"var(--tx)"}}>{t}</div><div style={{fontSize:11,color:"var(--t2)",lineHeight:1.6}}>{d}</div></div>)}
    </Card>

    <Card style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--ac)",fontFamily:"var(--mono)",marginBottom:10}}>[ SIMULADOR DCA HISTÓRICO — {coinName(coin)} ]</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
        {COINS.map(c=> <button key={c.id} onClick={()=>setCoin(c.id)} style={coin===c.id?{...bpFill,fontSize:10,padding:"5px 10px"}:{...bo,fontSize:10,padding:"5px 10px"}}>{c.sym}</button>)}
      </div>
      <label style={lb}>MONTO POR COMPRA (USD)</label><input type="number" value={amt} onChange={e=>setAmt(parseFloat(e.target.value)||0)} style={ip}/>
      <label style={lb}>FRECUENCIA</label>
      <select value={freqDays} onChange={e=>setFreqDays(+e.target.value)} style={sl}><option value={7}>Semanal</option><option value={14}>Quincenal</option><option value={30}>Mensual</option></select>
      {dca&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
        <Stat label="Compras (90d)" value={dca.buysN} small/>
        <Stat label="Invertido" value={fmtUsd(dca.invested)} small/>
        <Stat label="Valor hoy (DCA)" value={fmtUsd(dca.value)} color={dca.roi>=0?"var(--gn)":"var(--rd)"} small/>
        <Stat label="ROI DCA" value={`${dca.roi>=0?"+":""}${dca.roi.toFixed(1)}%`} color={dca.roi>=0?"var(--gn)":"var(--rd)"} small/>
        <Stat label="ROI lump-sum" value={`${dca.lumpRoi>=0?"+":""}${dca.lumpRoi.toFixed(1)}%`} color={dca.lumpRoi>=0?"var(--gn)":"var(--rd)"} small/>
      </div>}
      <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:8}}>Simulación con datos reales de los últimos 90 días. Compara comprar en partes (DCA) vs. invertir todo de golpe al inicio del periodo.</div>
    </Card>

    <Disclaimer>
      Esta simulación usa precios históricos y es solo ilustrativa de cómo funciona la estrategia DCA. Rendimientos pasados NO garantizan resultados futuros. No constituye asesoría de inversión personalizada — evalúa tu propia tolerancia al riesgo y, si tienes dudas, consulta a un asesor financiero certificado.
    </Disclaimer>
  </div>;
}

/* ═══ ACADEMY (cursos prácticos) ═══ */
const LESSONS=[
  ["¿Qué es blockchain y qué es una criptomoneda?","Una blockchain es un libro contable distribuido: miles de computadoras (nodos) guardan y verifican la misma copia de todas las transacciones. Una criptomoneda es un activo digital que vive en esa red, transferible sin un banco central como intermediario. Bitcoin fue la primera (2009); desde entonces existen miles de proyectos con distintos objetivos."],
  ["Bitcoin y minería: Proof-of-Work explicado","En Proof-of-Work (PoW), los \"mineros\" compiten resolviendo un problema matemático costoso computacionalmente. Quien lo resuelve primero añade el siguiente bloque de transacciones y recibe una recompensa en la moneda. Esto asegura la red: alterar el historial requeriría rehacer todo ese trabajo computacional, lo cual es económicamente inviable. Bitcoin y Litecoin usan PoW."],
  ["Proof-of-Stake, staking y validadores","En Proof-of-Stake (PoS), en vez de gastar electricidad, los \"validadores\" bloquean (stake) una cantidad de la moneda como garantía. Si validan honestamente ganan recompensas; si actúan mal, pierden parte de su stake (\"slashing\"). Ethereum, Solana y Cardano usan PoS. Es mucho más eficiente energéticamente que PoW, pero no es \"minable\" con hardware — se participa delegando o corriendo un validador."],
  ["Spot vs. Márgen vs. Futuros","SPOT: compras el activo real al precio actual, lo posees directamente. Es la forma más simple y de menor riesgo. MARGEN: pides prestado para comprar más de lo que tu capital permite (apalancamiento) — amplifica ganancias Y pérdidas, puedes perder más de lo invertido. FUTUROS/DERIVADOS: contratos que apuestan sobre el precio futuro sin poseer el activo; usan apalancamiento alto y liquidaciones automáticas. Para principiantes: empieza y quédate en SPOT."],
  ["Fiat vs. Cripto: on-ramps, off-ramps y stablecoins","\"Fiat\" es el dinero tradicional emitido por gobiernos (USD, MXN, EUR) sin respaldo físico, solo confianza institucional. Un \"on-ramp\" convierte fiat a cripto (ej. comprar BTC con tu tarjeta); un \"off-ramp\" hace lo inverso (vender cripto y retirar a tu banco). Las \"stablecoins\" (USDT, USDC) son criptomonedas ancladas 1:1 al valor de una moneda fiat, útiles para mover valor sin la volatilidad de BTC/ETH."],
  ["Wallets: custodial vs. no-custodial","CUSTODIAL: el exchange guarda tus llaves privadas por ti (fácil pero dependes de su seguridad y solvencia). NO-CUSTODIAL: tú controlas las llaves privadas (hot wallet en tu celular o cold wallet/hardware wallet offline). Regla: para uso diario/trading, exchange está bien; para ahorros grandes de largo plazo, usa autocustodia. NUNCA compartas tu seed phrase (frase de 12-24 palabras) con nadie — quien la tenga controla tus fondos."],
  ["Gestión de riesgo y Canon del 40%","Nunca inviertas dinero que no puedas perder o que necesites en el corto plazo. Define un porcentaje máximo de tu portafolio para cripto (ej. 5-10%) y respétalo. En FinanceOS, el Canon del 40% asegura que siempre apartas ahorro antes de gastar o invertir — la disciplina en las reglas de asignación importa más que \"acertar\" el próximo rally."],
  ["DCA vs. Lump Sum","Dollar Cost Averaging (DCA): inviertes una cantidad fija periódicamente, sin importar el precio. Reduce el riesgo de \"comprar en el pico\" y quita la presión emocional de intentar cronometrar el mercado. Lump Sum: inviertes todo de una vez — estadísticamente puede rendir más en mercados alcistas sostenidos, pero con mayor riesgo de mal timing. Para la mayoría de principiantes, DCA es más manejable psicológicamente."],
  ["Estafas comunes y señales de alerta","Rug pulls: creadores de un token abandonan el proyecto y desaparecen con los fondos. Esquemas Ponzi: prometen rendimientos fijos \"garantizados\" pagando a los primeros con dinero de los nuevos. Phishing: sitios/DMs falsos que imitan exchanges para robar credenciales o tu seed phrase. Señales de alerta: rendimientos \"garantizados\" muy altos, presión para invertir YA, gente que pide tu frase semilla, proyectos sin código público ni equipo identificable."],
  ["Impuestos y regulación","La regulación cripto varía enormemente por país y cambia con frecuencia. En muchas jurisdicciones, vender o intercambiar cripto es un evento fiscal. Lleva un registro de tus compras y ventas (fecha, precio, monto). Este contenido es educativo general — consulta siempre a un contador o asesor fiscal certificado en tu país para tu situación específica."],
];
function Academy(){
  const[open,setOpen]=useState({});
  return <div className="su">
    <div style={{fontSize:11,color:"var(--t2)",marginBottom:12,lineHeight:1.6}}>Academia práctica de cripto. Toca una lección para expandirla.</div>
    {LESSONS.map(([t,c],i)=> <Lesson key={i} t={`${i+1}. ${t}`} open={!!open[i]} onToggle={()=>setOpen(p=>({...p,[i]:!p[i]}))}>{c}</Lesson>)}
  </div>;
}

/* ═══ THEORY (spot / fiat / mercados) ═══ */
const THEORY=[
  ["Teoría del mercado spot: order book, market vs. limit","El \"order book\" es la lista en vivo de todas las órdenes de compra (bids) y venta (asks) para un par (ej. BTC/USD). Una orden \"market\" se ejecuta inmediatamente al mejor precio disponible — rápida pero con posible \"slippage\" (deslizamiento) si hay poca liquidez. Una orden \"limit\" solo se ejecuta al precio que tú fijas o mejor — más control, pero puede no ejecutarse nunca. La diferencia entre el mejor bid y ask se llama \"spread\"."],
  ["Teoría del dinero fiat","El dinero fiat no está respaldado por un bien físico (como antes el oro); su valor viene de la confianza y las leyes que obligan a aceptarlo (\"curso legal\"). Los bancos centrales controlan su oferta (política monetaria) para influir en inflación, empleo y crecimiento. La inflación erosiona el poder adquisitivo del fiat con el tiempo — parte del argumento a favor de activos de oferta limitada como Bitcoin (máximo 21 millones de unidades)."],
  ["Escasez programada y ciclos de halving","Bitcoin reduce a la mitad la recompensa por bloque cada ~4 años (\"halving\"), haciendo su emisión cada vez más escasa hasta llegar al límite de 21M de BTC (~año 2140). Históricamente, los halvings han precedido periodos de alta volatilidad y ciclos de mercado (alcista/bajista), aunque correlación no es garantía — cada ciclo ha tenido condiciones macro distintas."],
  ["Ciclos de mercado: bull, bear y consolidación","Un mercado \"bull\" (alcista) se caracteriza por tendencia sostenida al alza y optimismo generalizado. Un \"bear\" (bajista) por caídas prolongadas y pesimismo. La \"consolidación\" es un rango lateral sin tendencia clara. Reconocer en qué fase probable está el mercado ayuda a calibrar expectativas, pero NADIE puede predecir con certeza el inicio o fin de un ciclo."],
  ["Volatilidad y correlación macro","Las criptomonedas son activos de alta volatilidad: movimientos de doble dígito porcentual en días son comunes. Cada vez más muestran correlación con activos tradicionales de riesgo (ej. acciones tecnológicas) y son sensibles a tasas de interés, política monetaria (Fed/DXY) y liquidez global. No son un activo \"aislado\" del resto del sistema financiero."],
  ["Custodia y el principio de autosoberanía financiera","\"Not your keys, not your coins\": si no controlas las llaves privadas, en realidad confías en que un tercero te devuelva tus fondos. Este principio es la base filosófica de muchas criptomonedas — dar a las personas control directo sobre su dinero sin depender de intermediarios. Con ese poder viene responsabilidad: si pierdes tu seed phrase, nadie puede recuperar tus fondos por ti."],
];
function Theory(){
  const[open,setOpen]=useState({});
  return <div className="su">
    <div style={{fontSize:11,color:"var(--t2)",marginBottom:12,lineHeight:1.6}}>Fundamentos conceptuales: spot, fiat, escasez, ciclos y custodia.</div>
    {THEORY.map(([t,c],i)=> <Lesson key={i} t={t} open={!!open[i]} onToggle={()=>setOpen(p=>({...p,[i]:!p[i]}))}>{c}</Lesson>)}
  </div>;
}
