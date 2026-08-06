/* ═══════════════════════════════════════════════════════════════
   SHARED UI ATOMS — used by App.jsx and Crypto.jsx
   ═══════════════════════════════════════════════════════════════ */
export const uid=()=>Math.random().toString(36).slice(2,9);

export const cd={background:"var(--sf)",borderRadius:"var(--r)",border:"1px solid var(--bd)",padding:"16px 20px"};
export const lb={display:"block",fontSize:10,fontWeight:600,color:"var(--t2)",marginBottom:4,letterSpacing:1.2,textTransform:"uppercase",fontFamily:"var(--mono)"};
export const ip={width:"100%",padding:"10px 14px",borderRadius:6,border:"1px solid var(--bd)",fontSize:13,fontFamily:"var(--mono)",background:"var(--bg)",color:"var(--tx)",marginBottom:14};
export const sl={...ip,appearance:"auto"};
export const bp={padding:"10px 20px",borderRadius:6,border:"1px solid var(--ac)",background:"transparent",color:"var(--ac)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--mono)",transition:"all .15s"};
export const bpFill={...bp,background:"var(--ac)",color:"var(--bg)",border:"none"};
export const bo={...bp,color:"var(--t2)",borderColor:"var(--bd)"};

export const Card=({children,style:s,onClick:oc})=> <div onClick={oc} style={{...cd,...s,cursor:oc?"pointer":"default",transition:"border-color .15s"}} onMouseEnter={e=>{if(oc)e.currentTarget.style.borderColor="var(--ac)"}} onMouseLeave={e=>{if(oc)e.currentTarget.style.borderColor="var(--bd)"}}>{children}</div>;
export const Stat=({label:l,value:v,sub:s,color:c="var(--ac)",small:sm})=> <Card style={{flex:1,minWidth:sm?120:145,padding:sm?"12px 14px":"16px 20px"}}><div style={{fontSize:9,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"var(--mono)",marginBottom:6}}>{l}</div><div style={{fontSize:sm?16:22,fontWeight:800,color:c,letterSpacing:-.5,lineHeight:1,fontFamily:"var(--mono)"}}>{v}</div>{s&&<div style={{fontSize:10,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>{s}</div>}</Card>;
export const Empty=({emoji:e,title:t,sub:s})=> <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"44px 20px",opacity:.5}}><div style={{fontSize:36,marginBottom:8}}>{e}</div><div style={{fontSize:14,fontWeight:700}}>{t}</div>{s&&<div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>{s}</div>}</div>;
export const Modal=({open:o,onClose:oc,title:t,children:ch})=>{if(!o)return null;return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}><div onClick={oc} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)"}}/><div className="su" style={{position:"relative",background:"var(--sf)",borderRadius:12,padding:"24px 28px",maxWidth:420,width:"92%",maxHeight:"85vh",overflowY:"auto",border:"1px solid var(--bd)",boxShadow:"0 0 40px rgba(0,255,136,.05)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{fontSize:15,fontWeight:800,fontFamily:"var(--mono)",color:"var(--ac)"}}>[{t.toUpperCase()}]</h3><button onClick={oc} style={{background:"var(--bg)",border:"1px solid var(--bd)",borderRadius:4,width:28,height:28,cursor:"pointer",color:"var(--t2)",fontSize:12}}>✕</button></div>{ch}</div></div>};
