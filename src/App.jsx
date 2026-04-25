import { useState, useMemo, useCallback, useEffect, useContext, createContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie, LineChart, Line } from "recharts";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://hmvlgesnxaqebfdzizmy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdmxnZXNueGFxZWJmZHppem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjAwNzcsImV4cCI6MjA5MjUzNjA3N30.FXvGha4gIz9S0U2PzyZiHVeRLPIbgEJ_3z0xWinJROs";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth(){ return useContext(AuthCtx); }

function AuthProvider({children}){
  const [session,setSession] = useState(undefined); // undefined = loading
  const [profile,setProfile] = useState(null);

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session) loadProfile(session.user.id);
    });
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(session) loadProfile(session.user.id);
      else setProfile(null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (uid) => {
    const {data} = await sb.from('profiles').select('*').eq('id',uid).single();
    if(data) setProfile(data);
  };

  const signIn = (email,password) => sb.auth.signInWithPassword({email,password});
  const signOut = () => sb.auth.signOut();

  return <AuthCtx.Provider value={{session,profile,signIn,signOut,sb,loadProfile}}>{children}</AuthCtx.Provider>;
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage(){
  const {signIn} = useAuth();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    const {error} = await signIn(email,password);
    if(error) setError(error.message);
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 20px"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:24}}>📊</div>
          <h1 style={{margin:0,fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-.5px"}}>Profit Pulse</h1>
          <p style={{margin:"6px 0 0",fontSize:13,color:"#94a3b8"}}>Team Allocation Platform</p>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:20,padding:32,boxShadow:"0 25px 50px rgba(0,0,0,.4)"}}>
          <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"#0f172a"}}>Sign in to your account</h2>
          <p style={{margin:"0 0 24px",fontSize:13,color:"#64748b"}}>Enter your credentials to continue</p>

          {error&&(
            <div style={{padding:"10px 14px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:10,marginBottom:16,fontSize:13,color:"#dc2626"}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com"
                style={{width:"100%",padding:"11px 14px",border:"1px solid #e5e7eb",borderRadius:10,fontSize:14,color:"#0f172a",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                style={{width:"100%",padding:"11px 14px",border:"1px solid #e5e7eb",borderRadius:10,fontSize:14,color:"#0f172a",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            <button type="submit" disabled={loading}
              style={{padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,marginTop:4,transition:"opacity .2s"}}>
              {loading?"Signing in…":"Sign In →"}
            </button>
          </form>

          <p style={{margin:"20px 0 0",fontSize:12,color:"#94a3b8",textAlign:"center"}}>
            Contact your administrator to get access
          </p>
        </div>
      </div>
    </div>
  );
}

class ErrBoundary extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return {err:e};}
  render(){
    if(this.state.err) return(
      <div style={{padding:40,color:"#dc2626",fontFamily:"monospace",fontSize:13}}>
        <strong>Runtime Error:</strong><br/>
        {this.state.err.message}<br/><br/>
        <pre style={{fontSize:11,whiteSpace:"pre-wrap"}}>{this.state.err.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const HPM = 176;
const SAR = (v) => `SAR ${(v||0).toLocaleString("en-US",{maximumFractionDigits:0})}`;
const currentMonth = "2026-04";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CLIENTS = [
  {id:"c1",name:"SABIC"},{id:"c2",name:"Saudi Aramco"},
  {id:"c3",name:"Almarai"},{id:"c4",name:"STC"},{id:"c5",name:"Mobily"},
];
const CONTRACTS = [
  {id:"ct1",cid:"c1",cn:"SABIC",        cv:480000,tm:12,sd:"2026-01-01",ed:"2026-12-31",st:"Active",bcs:80000, bp:140000,bc:160000,bpl:100000},
  {id:"ct2",cid:"c2",cn:"Saudi Aramco", cv:360000,tm:12,sd:"2026-01-01",ed:"2026-05-15",st:"Active",bcs:60000, bp:100000,bc:120000,bpl:80000},
  {id:"ct3",cid:"c3",cn:"Almarai",      cv:240000,tm:12,sd:"2026-01-01",ed:"2026-12-31",st:"Active",bcs:40000, bp:70000, bc:80000, bpl:50000},
  {id:"ct4",cid:"c4",cn:"STC",          cv:180000,tm:6, sd:"2026-02-01",ed:"2026-07-31",st:"Active",bcs:30000, bp:50000, bc:60000, bpl:40000},
  {id:"ct5",cid:"c5",cn:"Mobily",       cv:90000, tm:3, sd:"2026-03-01",ed:"2026-06-25",st:"Active",bcs:15000, bp:25000, bc:30000, bpl:20000},
];
const EMPLOYEES_INIT = [
  {id:"e1", name:"Sarah Al-Rashidi", designation:"Senior Account Manager", department:"Client Servicing Department",location:"Jeddah", mc:18000,email:"sarah@agency.sa",   status:"Active",  start:"2023-03-01"},
  {id:"e2", name:"Mohammed Khalid",  designation:"Creative Director",       department:"Creative Department",        location:"Riyadh", mc:22000,email:"mohammed@agency.sa",status:"Active",  start:"2022-09-15"},
  {id:"e3", name:"Lena Barakat",     designation:"Production Specialist",   department:"Production Department",      location:"Jeddah", mc:15000,email:"lena@agency.sa",    status:"Active",  start:"2023-06-01"},
  {id:"e4", name:"Omar Farouk",      designation:"Media Planner",           department:"Planning Department",        location:"Riyadh", mc:17000,email:"omar@agency.sa",    status:"Active",  start:"2023-01-10"},
  {id:"e5", name:"Nadia Hamdan",     designation:"Account Executive",       department:"Client Servicing Department",location:"Jeddah", mc:14000,email:"nadia@agency.sa",   status:"Active",  start:"2024-02-01"},
  {id:"e6", name:"Tariq Mansour",    designation:"Motion Designer",         department:"Creative Department",        location:"Jeddah", mc:16000,email:"tariq@agency.sa",   status:"Active",  start:"2023-08-20"},
  {id:"e7", name:"Rana Al-Amin",     designation:"Strategy Lead",           department:"Planning Department",        location:"Riyadh", mc:20000,email:"rana@agency.sa",    status:"Active",  start:"2022-05-01"},
  {id:"e8", name:"Faisal Qureshi",   designation:"Production Manager",      department:"Production Department",      location:"Jeddah", mc:19000,email:"faisal@agency.sa",  status:"Active",  start:"2021-11-01"},
  {id:"e9", name:"Yasmin Saleh",     designation:"Copywriter",              department:"Creative Department",        location:"Jeddah", mc:13000,email:"yasmin@agency.sa",  status:"Active",  start:"2024-01-15"},
  {id:"e10",name:"Khalid Nasser",    designation:"Digital Planner",         department:"Planning Department",        location:"Riyadh", mc:15500,email:"khalid@agency.sa",  status:"Active",  start:"2023-10-01"},
  {id:"e11",name:"Hala Al-Otaibi",   designation:"Account Manager",         department:"Client Servicing Department",location:"Riyadh", mc:16500,email:"hala@agency.sa",    status:"Active",  start:"2023-04-01"},
  {id:"e12",name:"Rami Shahin",      designation:"Art Director",            department:"Creative Department",        location:"Jeddah", mc:17500,email:"rami@agency.sa",    status:"Inactive",start:"2022-02-01",inactive_effective_month:"2026-02"},
];
const ALLOCS_BY_MONTH = {
  "2026-04":[
    {eid:"e1",cid:"c1",h:88}, {eid:"e1",cid:"c3",h:66},
    {eid:"e2",cid:"c2",h:176},{eid:"e3",cid:"c1",h:120},
    {eid:"e4",cid:"c3",h:44}, {eid:"e5",cid:"c4",h:160},
    {eid:"e6",cid:"c2",h:200},{eid:"e7",cid:"c3",h:132},
    {eid:"e7",cid:"c4",h:22}, {eid:"e8",cid:"c1",h:176},
    {eid:"e9",cid:"c2",h:88}, {eid:"e10",cid:"c4",h:30},
    {eid:"e3",cid:"c5",h:56}, {eid:"e9",cid:"c5",h:88},
  ],
  "2026-03":[
    {eid:"e1",cid:"c1",h:100},{eid:"e2",cid:"c2",h:160},
    {eid:"e3",cid:"c1",h:140},{eid:"e5",cid:"c4",h:130},
    {eid:"e6",cid:"c2",h:176},{eid:"e7",cid:"c3",h:110},
    {eid:"e8",cid:"c1",h:176},{eid:"e4",cid:"c3",h:60},
    {eid:"e9",cid:"c5",h:176},{eid:"e10",cid:"c4",h:88},
  ],
};
const SNAPSHOTS=[
  {m:"2026-01",cn:"SABIC",        r:40000,c:28000},
  {m:"2026-01",cn:"Saudi Aramco", r:30000,c:24000},
  {m:"2026-01",cn:"Almarai",      r:20000,c:12000},
  {m:"2026-02",cn:"SABIC",        r:40000,c:30000},
  {m:"2026-02",cn:"Saudi Aramco", r:30000,c:22000},
  {m:"2026-02",cn:"Almarai",      r:20000,c:14000},
  {m:"2026-02",cn:"STC",          r:30000,c:19000},
  {m:"2026-03",cn:"SABIC",        r:40000,c:31000},
  {m:"2026-03",cn:"Saudi Aramco", r:30000,c:25000},
  {m:"2026-03",cn:"Almarai",      r:20000,c:11000},
  {m:"2026-03",cn:"STC",          r:30000,c:18000},
  {m:"2026-03",cn:"Mobily",       r:30000,c:22000},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function isActive(c,month){
  const [y,mo]=month.split("-").map(Number);
  const ms=new Date(y,mo-1,1),me=new Date(y,mo,0);
  const [sy,sm,sd]=c.sd.split("-").map(Number);
  const [ey,em,ed]=c.ed.split("-").map(Number);
  return new Date(sy,sm-1,sd)<=me&&new Date(ey,em-1,ed)>ms;
}
function diffDays(d){return Math.round((new Date(d)-new Date())/86400000);}
function fmtLong(m){const[y,mo]=m.split("-").map(Number);return new Date(y,mo-1,1).toLocaleString("en-US",{month:"long",year:"numeric"});}
function fmtShort(m){const[y,mo]=m.split("-").map(Number);return new Date(y,mo-1,1).toLocaleString("en-US",{month:"short",year:"numeric"});}
function fmtDate(d){return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function fmtDateShort(d){if(!d)return"—";const[y,m,day]=d.split("-").map(Number);return new Date(y,m-1,day).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function daysBetween(end,todayStr){if(!end)return 0;const e=new Date(end),t=new Date(todayStr||new Date().toISOString().slice(0,10));return Math.round((e-t)/86400000);}
function addMonthsSimple(dateStr,months){if(!dateStr||!months)return"";const d=new Date(dateStr);const whole=Math.floor(months);const fracDays=Math.round((months-whole)*30);d.setMonth(d.getMonth()+whole);d.setDate(d.getDate()+fracDays);return d.toISOString().slice(0,10);}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Card({children,style={}}){
  return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)",...style}}>{children}</div>;
}
function Bdg({children,bg="#f1f5f9",color="#475569"}){
  return <span style={{background:bg,color,padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,display:"inline-block"}}>{children}</span>;
}
function PBar({val,color}){
  return(
    <div style={{height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden",margin:"5px 0 3px"}}>
      <div style={{width:`${Math.min(100,val)}%`,height:"100%",background:color,borderRadius:3}}/>
    </div>
  );
}
function Avatar({name,size=38}){
  const ini=(name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:10,background:"linear-gradient(135deg,#334155,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*.33,fontWeight:700,flexShrink:0}}>{ini}</div>;
}
function Btn({children,onClick,variant="primary",size="md",type="button",disabled,style={}}){
  const sz={sm:{padding:"5px 12px",fontSize:12},md:{padding:"8px 16px",fontSize:13}};
  const vs={
    primary:{background:"#0f172a",color:"#fff",border:"none"},
    outline:{background:"#fff",color:"#374151",border:"1px solid #e2e8f0"},
    ghost:{background:"transparent",color:"#64748b",border:"none"},
    danger:{background:"transparent",color:"#ef4444",border:"none"},
  };
  return <button onClick={onClick} type={type} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:5,borderRadius:8,fontWeight:600,cursor:disabled?"not-allowed":"pointer",transition:"opacity .15s",...sz[size],...vs[variant],...style}}>{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",required,style={}}){
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} required={required} style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",outline:"none",background:"#fff",boxSizing:"border-box",...style}}/>;
}
function Sel({value,onChange,options,style={}}){
  return(
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",outline:"none",background:"#fff",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.v??o} value={o.v??o}>{o.l??o}</option>)}
    </select>
  );
}
function Lbl({children}){return <p style={{margin:"0 0 5px",fontSize:12,fontWeight:600,color:"#374151"}}>{children}</p>;}
function Modal({open,onClose,title,children}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px",borderBottom:"1px solid #f1f5f9"}}>
          <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a"}}>{title}</p>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:"#94a3b8",cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}
function SortTh({k,sk,sd,onSort,children,align="left"}){
  const active=sk===k;
  return <th onClick={()=>onSort(k)} style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:active?"#0f172a":"#64748b",background:"#f8fafc",cursor:"pointer",whiteSpace:"nowrap",borderBottom:"1px solid #e2e8f0",userSelect:"none"}}>{children} {active?(sd==="asc"?"↑":"↓"):<span style={{color:"#cbd5e1"}}>↕</span>}</th>;
}

const MONTHS=["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV=[
  {id:"Dashboard",            label:"Dashboard",                   icon:"📊"},
  {id:"Employees",            label:"Employees",                   icon:"👥"},
  {id:"Clients",              label:"Clients",                     icon:"🏢"},
  {id:"Contracts",            label:"Contracts",                   icon:"📄"},
  {id:"Allocations",          label:"Allocations",                 icon:"🗂"},
  {id:"Reports",              label:"Reports",                     icon:"📈"},
  {id:"MonthlyClose",         label:"Monthly Close",               icon:"📅"},
  {id:"ContractExpenses",     label:"Contract/Project Expenses",   icon:"🧾"},
  {id:"Settings",             label:"System Users",                icon:"👤"},
];

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage(){
  const [month,setMonth]=useState("2026-04");
  const [finTab,setFinTab]=useState("finance");
  const [lc,setLc]=useState("all");
  const [rc,setRc]=useState("all");
  const [dc,setDc]=useState("all");
  const [capDept,setCapDept]=useState("all");

  const C=useMemo(()=>{
    const als=ALLOCS_BY_MONTH[month]||[];
    const em={};EMPLOYEES_INIT.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
    const ac=CONTRACTS.filter(c=>isActive(c,month));
    const cm={};ac.forEach(c=>{cm[c.cid]={...c,mr:c.cv/c.tm};});
    const cp=CLIENTS.filter(cl=>cm[cl.id]).map(cl=>{
      const ct=cm[cl.id];let rc2=0;
      als.filter(a=>a.cid===cl.id).forEach(a=>{const e=em[a.eid];if(e)rc2+=e.hr*a.h;});
      const mr=ct.mr,gp=mr-rc2,mp=mr>0?(gp/mr)*100:0;
      return{id:cl.id,name:cl.name,mr,rc:rc2,gp,mp};
    });
    const tr=cp.reduce((s,c)=>s+c.mr,0),tc=cp.reduce((s,c)=>s+c.rc,0);
    const tp=tr-tc,am=tr>0?(tp/tr)*100:0,lm=cp.filter(c=>c.mp<20&&c.mp>=0).length;
    const allAc=CONTRACTS.filter(c=>c.st==="Active");
    const tcv=allAc.reduce((s,c)=>s+c.cv,0);
    const cvd=ac.map(c=>{const x=cp.find(p=>p.id===c.cid);return{name:c.cn.length>10?c.cn.slice(0,10)+"…":c.cn,monthly:Math.round(c.cv/c.tm),cost:Math.round(x?.rc||0),cid:c.cid};});
    const bld=(cs,as2)=>{
      const d={"Client Servicing":{b:0,c:0},"Production":{b:0,c:0},"Creative":{b:0,c:0},"Planning":{b:0,c:0}};
      cs.forEach(c=>{const f=c.tm>0?1/c.tm:0;d["Client Servicing"].b+=(c.bcs||0)*f;d["Production"].b+=(c.bp||0)*f;d["Creative"].b+=(c.bc||0)*f;d["Planning"].b+=(c.bpl||0)*f;});
      as2.forEach(a=>{const e=em[a.eid];if(e){const cost=e.hr*a.h,dep=e.department||"";if(dep.includes("Client Servicing"))d["Client Servicing"].c+=cost;else if(dep.includes("Production"))d["Production"].c+=cost;else if(dep.includes("Creative"))d["Creative"].c+=cost;else if(dep.includes("Planning"))d["Planning"].c+=cost;}});
      return Object.entries(d).map(([n,v])=>({name:n,budget:Math.round(v.b),cost:Math.round(v.c)}));
    };
    const da=bld(ac,als);
    const dbc=id=>id==="all"?da:bld(ac.filter(c=>c.cid===id),als.filter(a=>a.cid===id));
    const eu=EMPLOYEES_INIT.map(e=>{const h=als.filter(a=>a.eid===e.id).reduce((s,a)=>s+a.h,0);return{...e,h,u:(h/HPM)*100,av:Math.max(0,HPM-h)};});
    const over=eu.filter(e=>e.u>100),under=eu.filter(e=>e.u<70);
    const chart=eu.map(e=>({name:e.name.split(" ")[0],hours:e.h,available:e.av,u:e.u})).sort((a,b)=>b.u-a.u);
    const ren=allAc.filter(c=>{const d=diffDays(c.ed);return d>=0&&d<=60;}).sort((a,b)=>new Date(a.ed)-new Date(b.ed));
    const bm={};SNAPSHOTS.forEach(s=>{if(!bm[s.m])bm[s.m]={m:s.m,cl:{}};if(!bm[s.m].cl[s.cn])bm[s.m].cl[s.cn]={r:0,c:0};bm[s.m].cl[s.cn].r+=s.r;bm[s.m].cl[s.cn].c+=s.c;});
    const lt=Object.values(bm).sort((a,b)=>a.m.localeCompare(b.m)).map(x=>({label:fmtShort(x.m),m:x.m,cl:x.cl}));
    const sc=[...new Set(SNAPSHOTS.map(s=>s.cn))];
    return{cp,tr,tc,tp,am,lm,acnt:allAc.length,tcv,cvd,dbc,eu,over,under,chart,ren,lt,sc};
  },[month]);

  const ltd=C.lt.map(m=>{
    if(lc==="all")return{label:m.label,retainer:Object.values(m.cl).reduce((s,c)=>s+c.r,0),cost:Object.values(m.cl).reduce((s,c)=>s+c.c,0)};
    const x=m.cl[lc];return{label:m.label,retainer:x?.r||0,cost:x?.c||0};
  });
  const rd=rc==="all"?C.cvd:C.cvd.filter(d=>d.cid===rc);
  const cf=C.eu.filter(e=>capDept==="all"||e.department===capDept).sort((a,b)=>b.u-a.u);

  const KPI=({label,value,sub,emoji,dark,iBg,iC,bg,bd})=>(
    <Card style={{background:dark?"#0f172a":bg||"#fff",borderColor:bd||"#e2e8f0",padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{fontSize:10,color:dark?"#94a3b8":"#64748b",margin:0,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
          <p style={{fontSize:18,fontWeight:800,color:dark?"#fff":iC||"#0f172a",margin:"5px 0 3px"}}>{value}</p>
          <p style={{fontSize:10,color:dark?"#64748b":"#94a3b8",margin:0}}>{sub}</p>
        </div>
        <div style={{background:dark?"#1e293b":iBg||"#f1f5f9",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{emoji}</div>
      </div>
    </Card>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h1><p style={{fontSize:13,color:"#64748b",marginTop:3}}>Overview of finance and team metrics</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:13,color:"#94a3b8"}}>📅</span>
          <Sel value={month} onChange={setMonth} options={MONTHS.map(m=>({v:m,l:fmtLong(m)}))} style={{width:160}}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:4,maxWidth:380}}>
        {[["finance","📈 Financial Analysis"],["team","👥 Team & Renewals"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFinTab(v)} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"none",background:finTab===v?"#fff":"transparent",fontWeight:finTab===v?700:500,fontSize:12,color:finTab===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:finTab===v?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{l}</button>
        ))}
      </div>

      {finTab==="finance"&&(
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            <KPI dark label="Total Revenue"        value={SAR(C.tr)}  sub="Monthly retainers"    emoji="💵"/>
            <KPI label="Resource Cost"       value={SAR(C.tc)}  sub="Employee costs"       emoji="💰" iBg="#fef3c7" iC="#d97706"/>
            <KPI label="Total Contract Value" value={SAR(C.tcv)} sub="All active contracts"  emoji="📋" iBg="#f3e8ff" iC="#7c3aed"/>
            <KPI label="Gross Profit"        value={SAR(C.tp)}  sub={`${C.am.toFixed(1)}% margin`} emoji="📊" iBg={C.tp>=0?"#d1fae5":"#fee2e2"} iC={C.tp>=0?"#059669":"#dc2626"} bg={C.tp>=0?"#f0fdf4":"#fff5f5"} bd={C.tp>=0?"#a7f3d0":"#fecaca"}/>
            <KPI label="Active Contracts"    value={C.acnt}     sub={`${C.lm} low margin`}  emoji="📄" iBg="#e0e7ff" iC="#4f46e5"/>
          </div>
          <Card style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12}}>
              <p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a"}}>LifeTime — Monthly Retainer vs Resource Cost (Closed Months)</p>
              <Sel value={lc} onChange={setLc} options={[{v:"all",l:"All Clients"},...C.sc.map(c=>({v:c,l:c}))]} style={{width:155}}/>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ltd} margin={{top:5,right:15,left:5,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:"#64748b"}}/>
                <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="retainer" name="Contract Value" fill="#10b981" radius={[4,4,0,0]}/>
                <Bar dataKey="cost"     name="Resource Cost"  fill="#f59e0b" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10}}>
                <p style={{margin:0,fontWeight:700,fontSize:12,color:"#0f172a"}}>Monthly Retainer vs Monthly Cost</p>
                <Sel value={rc} onChange={setRc} options={[{v:"all",l:"All Clients"},...CLIENTS.map(c=>({v:c.id,l:c.name}))]} style={{width:135}}/>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={rd} margin={{top:5,right:5,left:0,bottom:36}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                  <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                  <Bar dataKey="monthly" name="Monthly Retainer" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="cost"    name="Monthly Cost"     fill="#f59e0b" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10}}>
                <p style={{margin:0,fontWeight:700,fontSize:12,color:"#0f172a"}}>Department Budget vs Cost</p>
                <Sel value={dc} onChange={setDc} options={[{v:"all",l:"All Clients"},...CLIENTS.map(c=>({v:c.id,l:c.name}))]} style={{width:135}}/>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={C.dbc(dc)} margin={{top:5,right:5,left:0,bottom:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}}/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                  <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                  <Bar dataKey="budget" name="Budget"      fill="#6366f1" radius={[4,4,0,0]}/>
                  <Bar dataKey="cost"   name="Actual Cost" fill="#f59e0b" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"13px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a"}}>Client Profitability</p></div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#f8fafc"}}>{["Client","Retainer","Cost","Profit","Margin"].map((h,i)=><th key={h} style={{padding:"7px 14px",textAlign:i===0?"left":i===4?"center":"right",fontSize:11,fontWeight:600,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>{C.cp.slice(0,5).map(c=>{const neg=c.gp<0,low=c.mp<20;return(<tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:neg?"#fff5f5":low?"#fffbeb":"#fff"}}>
                <td style={{padding:"9px 14px",fontWeight:600,fontSize:13,color:"#0f172a"}}>{c.name}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13}}>{SAR(c.mr)}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13,color:"#64748b"}}>{SAR(c.rc)}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:700,color:neg?"#dc2626":"#059669"}}>{SAR(c.gp)}</td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><Bdg bg={neg?"#fee2e2":low?"#fef9c3":"#d1fae5"} color={neg?"#dc2626":low?"#d97706":"#059669"}>{c.mp.toFixed(0)}%</Bdg></td>
              </tr>);})}</tbody>
            </table>
          </Card>
        </div>
      )}

      {finTab==="team"&&(
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <KPI dark label="Active Employees" value={EMPLOYEES_INIT.filter(e=>e.status==="Active").length} sub="Team members" emoji="👥"/>
            <KPI label="Over-utilized"  value={C.over.length} sub=">160 hrs/month" emoji="⚠️" iBg={C.over.length>0?"#fee2e2":"#f1f5f9"} iC={C.over.length>0?"#dc2626":"#0f172a"} bg={C.over.length>0?"#fff5f5":"#fff"} bd={C.over.length>0?"#fecaca":"#e2e8f0"}/>
            <KPI label="Under-utilized" value={C.under.length} sub="<70% capacity"  emoji="📉" iBg={C.under.length>0?"#fef9c3":"#f1f5f9"} iC={C.under.length>0?"#d97706":"#0f172a"} bg={C.under.length>0?"#fffbeb":"#fff"} bd={C.under.length>0?"#fde68a":"#e2e8f0"}/>
            <KPI label="Renewals"        value={C.ren.length}   sub="Within 60 days" emoji="📅" iBg="#e0e7ff" iC="#4f46e5" bg={C.ren.length>0?"#eef2ff":"#fff"} bd={C.ren.length>0?"#c7d2fe":"#e2e8f0"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
            <Card style={{padding:18}}>
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Team Utilization</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={C.chart.slice(0,8)} layout="vertical" margin={{top:5,right:20,left:42,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis type="number" domain={[0,HPM]} tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v}h`}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize:10,fill:"#64748b"}} width={42}/>
                  <Tooltip formatter={(v,n)=>[`${v} hrs`,n==="hours"?"Allocated":"Available"]} contentStyle={{borderRadius:8,border:"none"}}/>
                  <Bar dataKey="hours" stackId="a" name="Allocated">{C.chart.slice(0,8).map((e,i)=><Cell key={i} fill={e.u>100?"#ef4444":e.u>=70?"#10b981":"#f59e0b"}/>)}</Bar>
                  <Bar dataKey="available" stackId="a" fill="#e2e8f0" name="Available"/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{padding:18}}>
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Contract Renewals</p>
              {C.ren.length===0?(<div style={{textAlign:"center",padding:"20px 0",color:"#94a3b8"}}><div style={{fontSize:28,marginBottom:6}}>📅</div><p style={{fontSize:12}}>No renewals in 60 days</p></div>):(
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {C.ren.slice(0,4).map(c=>{const d=diffDays(c.ed),urg=d<=7,warn=d<=30&&!urg;return(<div key={c.id} style={{padding:10,borderRadius:9,border:`1px solid ${urg?"#fecaca":warn?"#fde68a":"#e2e8f0"}`,background:urg?"#fff5f5":warn?"#fffbeb":"#f8fafc",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a"}}>{c.cn}</p><p style={{margin:"1px 0 0",fontSize:10,color:"#94a3b8"}}>{fmtDate(c.ed)}</p></div>
                    <Bdg bg={urg?"#ef4444":warn?"#f59e0b":"#64748b"} color="#fff">{d}d</Bdg>
                  </div>);})}
                </div>
              )}
            </Card>
          </div>
          <Card style={{padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:14}}>
              <div><p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a"}}>Team Capacity</p><p style={{margin:"1px 0 0",fontSize:10,color:"#94a3b8"}}>{fmtLong(month)} · {HPM}h/person</p></div>
              <Sel value={capDept} onChange={setCapDept} options={[{v:"all",l:"All Departments"},{v:"Production Department",l:"Production"},{v:"Client Servicing Department",l:"Client Servicing"},{v:"Creative Department",l:"Creative"},{v:"Planning Department",l:"Planning"}]} style={{width:170}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
              {cf.map(emp=>{const ov=emp.u>100,un=emp.u<70;return(
                <div key={emp.id} style={{padding:10,borderRadius:11,border:`1px solid ${ov?"#fecaca":un?"#fde68a":"#a7f3d0"}`,background:ov?"#fff5f5":un?"#fffbeb":"#f0fdf4"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                    <div style={{width:22,height:22,borderRadius:6,background:ov?"#fee2e2":un?"#fef9c3":"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:ov?"#dc2626":un?"#d97706":"#059669",flexShrink:0}}>{emp.name.slice(0,2).toUpperCase()}</div>
                    <p style={{margin:0,fontSize:10,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{emp.name.split(" ")[0]}</p>
                    {ov&&<span style={{fontSize:9}}>⚠️</span>}
                  </div>
                  <PBar val={emp.u} color={ov?"#ef4444":un?"#f59e0b":"#10b981"}/>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:10,fontWeight:700,color:ov?"#dc2626":un?"#d97706":"#059669"}}>{Math.min(emp.u,999).toFixed(0)}%</span>
                    <span style={{fontSize:9,color:"#94a3b8"}}>{emp.h}h</span>
                  </div>
                </div>
              );})}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const DEPTS=["Production Department","Client Servicing Department","Creative Department","Planning Department"];
const EMPTY_EMP={name:"",designation:"",department:"",location:"Jeddah",mc:15000,email:"",status:"Active",start:""};

function EmployeesPage(){
  const [emps,setEmps]=useState(EMPLOYEES_INIT);
  const [search,setSearch]=useState("");
  const [locF,setLocF]=useState("all");
  const [sk,setSk]=useState("name");
  const [sd,setSd]=useState("asc");
  const [modalOpen,setModalOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(EMPTY_EMP);
  const [inactiveModal,setInactiveModal]=useState(false);
  const [pendingInactive,setPendingInactive]=useState(null);
  const [inactiveMonth,setInactiveMonth]=useState(currentMonth);

  const upd=(k,v)=>setForm(p=>({...p,[k]:v,...(k==="location"?{mc:{Jeddah:15000,Riyadh:18000}[v]||p.mc}:{})}));
  const openAdd=()=>{setEditing(null);setForm(EMPTY_EMP);setModalOpen(true);};
  const openEdit=e=>{setEditing(e);setForm({name:e.name,designation:e.designation,department:e.department,location:e.location,mc:e.mc,email:e.email,status:e.status,start:e.start});setModalOpen(true);};
  const close=()=>{setModalOpen(false);setEditing(null);};

  const handleSubmit=e=>{
    e.preventDefault();
    const wasActive=editing?.status==="Active"||editing?.status==="On Leave";
    if(editing&&form.status==="Inactive"&&wasActive){setPendingInactive({id:editing.id,data:form});setInactiveModal(true);return;}
    if(editing){setEmps(p=>p.map(emp=>emp.id===editing.id?{...emp,...form}:emp));}
    else{setEmps(p=>[...p,{id:`e${Date.now()}`,...form}]);}
    close();
  };
  const confirmInactive=async()=>{
    if(!pendingInactive)return;
    await dbUpdate(pendingInactive.id,{...pendingInactive.data,inactive_effective_month:inactiveMonth,mc:pendingInactive.data.mc});
    setInactiveModal(false);setPendingInactive(null);close();
  };
  const del=id=>{if(window.confirm("Delete this employee?"))dbDelete(id);};
  const sort=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  const getUtil=id=>{const h=(ALLOCS_BY_MONTH[currentMonth]||[]).filter(a=>a.eid===id).reduce((s,a)=>s+a.h,0);return{h,pct:(h/HPM)*100};};

  const filtered=useMemo(()=>emps.filter(e=>{
    const ms=!search||e.name.toLowerCase().includes(search.toLowerCase())||e.designation.toLowerCase().includes(search.toLowerCase());
    return ms&&(locF==="all"||e.location===locF);
  }),[emps,search,locF]);
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{const av=a[sk]??0,bv=b[sk]??0;return typeof av==="number"?(sd==="asc"?av-bv:bv-av):(sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+""))}),[filtered,sk,sd]);
  const totalCost=filtered.reduce((s,e)=>s+e.mc,0);
  const mOpts=Array.from({length:12},(_,i)=>{const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);const v=d.toISOString().slice(0,7);return{v,l:d.toLocaleString("en-US",{month:"long",year:"numeric"})};});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Employees</h1><p style={{fontSize:13,color:"#64748b",marginTop:3}}>Manage your team members and their costs</p></div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline">⬆ Import</Btn>
          <Btn variant="primary" onClick={openAdd}>＋ Add Employee</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={locF} onChange={setLocF} options={[{v:"all",l:"All Locations"},{v:"Jeddah",l:"Jeddah"},{v:"Riyadh",l:"Riyadh"},{v:"Remote",l:"Remote"}]} style={{width:150}}/>
        <Btn variant="outline">⬇ Export</Btn>
      </div>
      <Card style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <SortTh k="name"  sk={sk} sd={sd} onSort={sort}>Employee</SortTh>
              <SortTh k="department" sk={sk} sd={sd} onSort={sort}>Department</SortTh>
              <SortTh k="location" sk={sk} sd={sd} onSort={sort}>Location</SortTh>
              <SortTh k="mc" sk={sk} sd={sd} onSort={sort} align="right">Monthly Cost</SortTh>
              <th style={{padding:"9px 13px",textAlign:"right",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>Hourly Rate</th>
              <SortTh k="status" sk={sk} sd={sd} onSort={sort} align="center">Status</SortTh>
              <th style={{padding:"9px 13px",textAlign:"right",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>Actions</th>
            </tr></thead>
            <tbody>
              {sorted.map((emp,idx)=>{
                const hr=emp.mc/HPM;
                const sb=emp.status==="Active"?"#d1fae5":emp.status==="Inactive"?"#f1f5f9":"#fef9c3";
                const sc2=emp.status==="Active"?"#059669":emp.status==="Inactive"?"#64748b":"#d97706";
                return(<tr key={emp.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafafa"}}>
                  <td style={{padding:"11px 13px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={emp.name}/><div><p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a"}}>{emp.name}</p><p style={{margin:"1px 0 0",fontSize:11,color:"#94a3b8"}}>{emp.designation}</p></div></div></td>
                  <td style={{padding:"11px 13px"}}><Bdg>{emp.department?.replace(" Department","")}</Bdg></td>
                  <td style={{padding:"11px 13px",fontSize:13,color:"#475569"}}>📍 {emp.location}</td>
                  <td style={{padding:"11px 13px",textAlign:"right",fontWeight:600,fontSize:13,color:"#0f172a"}}>{SAR(emp.mc)}</td>
                  <td style={{padding:"11px 13px",textAlign:"right",fontSize:13,color:"#64748b"}}>SAR {hr.toFixed(0)}/hr</td>
                  <td style={{padding:"11px 13px",textAlign:"center"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <Bdg bg={sb} color={sc2}>{emp.status}</Bdg>
                      {emp.status==="Inactive"&&emp.inactive_effective_month&&<span style={{fontSize:10,color:"#94a3b8"}}>from {emp.inactive_effective_month}</span>}
                    </div>
                  </td>
                  <td style={{padding:"11px 13px",textAlign:"right"}}><div style={{display:"flex",justifyContent:"flex-end",gap:4}}><Btn variant="ghost" size="sm" onClick={()=>openEdit(emp)}>✏️</Btn><Btn variant="danger" size="sm" onClick={()=>del(emp.id)}>🗑</Btn></div></td>
                </tr>);
              })}
              {sorted.length>0&&<tr style={{background:"#f1f5f9",borderTop:"2px solid #cbd5e1"}}>
                <td colSpan={3} style={{padding:"9px 13px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Total ({filtered.length} employees)</td>
                <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a"}}>{SAR(totalCost)}</td>
                <td colSpan={3}/>
              </tr>}
            </tbody>
          </table>
          {sorted.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:10}}>👤</div><p style={{fontSize:14}}>No employees found</p></div>}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={close} title={editing?"Edit Employee":"Add New Employee"}>
        <form onSubmit={handleSubmit}><div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><Avatar name={form.name||"?"} size={50}/><div style={{flex:1}}><Lbl>Profile Picture</Lbl><input type="file" accept="image/*" disabled style={{fontSize:11,color:"#94a3b8"}}/></div></div>
          <div><Lbl>Full Name *</Lbl><Inp value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Enter full name" required/></div>
          <div><Lbl>Designation *</Lbl><Inp value={form.designation} onChange={e=>upd("designation",e.target.value)} placeholder="Job title" required/></div>
          <div><Lbl>Department *</Lbl><Sel value={form.department} onChange={v=>upd("department",v)} options={[{v:"",l:"Select department"},...DEPTS.map(d=>({v:d,l:d}))]} style={{}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl>Location *</Lbl><Sel value={form.location} onChange={v=>upd("location",v)} options={["Jeddah","Riyadh","Remote"].map(l=>({v:l,l}))}/></div>
            <div><Lbl>Status</Lbl><Sel value={form.status} onChange={v=>upd("status",v)} options={["Active","Inactive","On Leave"].map(s=>({v:s,l:s}))}/></div>
          </div>
          <div><Lbl>Monthly Cost (SAR) *</Lbl><Inp type="number" value={form.mc} onChange={e=>upd("mc",parseFloat(e.target.value))} placeholder="15000" required/></div>
          <div><Lbl>Email *</Lbl><Inp type="email" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="employee@company.com" required/></div>
          <div><Lbl>Start Date *</Lbl><Inp type="date" value={form.start} onChange={e=>upd("start",e.target.value)} required/></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}><Btn variant="outline" onClick={close}>Cancel</Btn><Btn variant="primary" type="submit">{editing?"Update":"Create"}</Btn></div>
        </div></form>
      </Modal>
      <Modal open={inactiveModal} onClose={()=>{setInactiveModal(false);setPendingInactive(null);}} title="Set Inactive Effective Month">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <p style={{margin:0,fontSize:13,color:"#64748b"}}>From which month should this employee be considered inactive?</p>
          <Sel value={inactiveMonth} onChange={setInactiveMonth} options={mOpts}/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><Btn variant="outline" onClick={()=>{setInactiveModal(false);setPendingInactive(null);}}>Cancel</Btn><Btn variant="primary" onClick={confirmInactive}>Confirm</Btn></div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const MOCK_CLIENTS_INIT = [
  {id:"cl1",name:"SABIC",        industry:"Petrochemicals",  contact_person:"Fahad Al-Ghamdi",  contact_person_designation:"Marketing Director",   contact_email:"fahad@sabic.com",    contact_phone:"+966 50 111 2233", status:"Active",   notes:"Long-term retainer client. Key account."},
  {id:"cl2",name:"Saudi Aramco", industry:"Energy",          contact_person:"Reem Al-Dosari",   contact_person_designation:"Brand Manager",         contact_email:"reem@aramco.com",    contact_phone:"+966 50 222 3344", status:"Active",   notes:""},
  {id:"cl3",name:"Almarai",      industry:"Food & Beverage", contact_person:"Sami Khalil",      contact_person_designation:"Head of Communications",contact_email:"sami@almarai.com",   contact_phone:"+966 55 333 4455", status:"Active",   notes:"Monthly campaigns + seasonal activations."},
  {id:"cl4",name:"STC",          industry:"Telecom",         contact_person:"Noura Al-Harbi",   contact_person_designation:"Digital Marketing Lead", contact_email:"noura@stc.com.sa",  contact_phone:"+966 55 444 5566", status:"Active",   notes:""},
  {id:"cl5",name:"Mobily",       industry:"Telecom",         contact_person:"Tariq Badr",       contact_person_designation:"Marketing Manager",      contact_email:"tariq@mobily.sa",   contact_phone:"+966 50 555 6677", status:"Active",   notes:"Short-term project contract."},
  {id:"cl6",name:"Al Rajhi Bank",industry:"Banking",         contact_person:"Mona Al-Zahrani",  contact_person_designation:"CMO",                   contact_email:"mona@alrajhi.com",  contact_phone:"+966 56 666 7788", status:"Prospect", notes:"In negotiations for Q3 retainer."},
  {id:"cl7",name:"Noon",         industry:"E-Commerce",      contact_person:"Ali Hassan",       contact_person_designation:"Growth Lead",            contact_email:"ali@noon.com",      contact_phone:"+966 50 777 8899", status:"Prospect", notes:""},
  {id:"cl8",name:"Zain KSA",     industry:"Telecom",         contact_person:"Sara Al-Mutairi",  contact_person_designation:"Brand Executive",        contact_email:"sara@zain.sa",      contact_phone:"+966 55 888 9900", status:"Inactive", notes:"Contract ended. Possible renewal in Q4."},
];

const EMPTY_CLIENT = {name:"",industry:"",contact_person:"",contact_person_designation:"",contact_email:"",contact_phone:"",status:"Active",notes:""};

function ClientsPage(){
  const {sb}=useAuth();
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    sb.from('clients').select('*').order('name').then(({data})=>{if(data)setClients(data);setLoading(false);});
  },[]);
  const dbAdd=async p=>{const{data}=await sb.from('clients').insert([p]).select().single();if(data)setClients(x=>[...x,data]);};
  const dbUpdate=async(id,p)=>{const{data}=await sb.from('clients').update(p).eq('id',id).select().single();if(data)setClients(x=>x.map(c=>c.id===id?data:c));};
  const dbDelete=async id=>{await sb.from('clients').delete().eq('id',id);setClients(x=>x.filter(c=>c.id!==id));};
  const [search,setSearch]       = useState("");
  const [statusF,setStatusF]     = useState("all");
  const [sk,setSk]               = useState("name");
  const [sd,setSd]               = useState("asc");
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [form,setForm]           = useState(EMPTY_CLIENT);

  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const openAdd =()=>{setEditing(null);setForm(EMPTY_CLIENT);setModalOpen(true);};
  const openEdit=c=>{setEditing(c);setForm({name:c.name,industry:c.industry,contact_person:c.contact_person,contact_person_designation:c.contact_person_designation,contact_email:c.contact_email,contact_phone:c.contact_phone,status:c.status,notes:c.notes||""});setModalOpen(true);};
  const close   =()=>{setModalOpen(false);setEditing(null);};

  const handleSubmit=e=>{
    e.preventDefault();
    if(editing){setClients(p=>p.map(c=>c.id===editing.id?{...c,...form}:c));}
    else{setClients(p=>[...p,{id:`cl${Date.now()}`,...form}]);}
    close();
  };
  const del=id=>{if(window.confirm("Delete this client?"))dbDelete(id);};
  const sort=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  // Link to mock contracts by client id
  const getContract=cid=>CONTRACTS.find(c=>c.cid===cid&&c.st==="Active");

  const filtered=useMemo(()=>clients.filter(c=>{
    const ms=!search||c.name.toLowerCase().includes(search.toLowerCase())||c.industry.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||c.status===statusF);
  }),[clients,search,statusF]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[filtered,sk,sd]);

  const statusStyle=s=>({
    Active:  {bg:"#d1fae5",color:"#059669"},
    Prospect:{bg:"#dbeafe",color:"#2563eb"},
    Inactive:{bg:"#f1f5f9",color:"#64748b"},
    Churned: {bg:"#fee2e2",color:"#dc2626"},
  }[s]||{bg:"#f1f5f9",color:"#64748b"});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Clients</h1>
          <p style={{fontSize:13,color:"#64748b",marginTop:3}}>Manage your client portfolio</p>
        </div>
        <Btn variant="primary" onClick={openAdd}>＋ Add Client</Btn>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={statusF} onChange={setStatusF} options={[{v:"all",l:"All Status"},{v:"Active",l:"Active"},{v:"Prospect",l:"Prospect"},{v:"Inactive",l:"Inactive"},{v:"Churned",l:"Churned"}]} style={{width:150}}/>
        <Btn variant="outline">⬇ Export</Btn>
      </div>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <SortTh k="name"   sk={sk} sd={sd} onSort={sort}>Client</SortTh>
                <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"left"}}>Contact</th>
                <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"left"}}>Contract</th>
                <SortTh k="status" sk={sk} sd={sd} onSort={sort} align="center">Status</SortTh>
                <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"right"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((client,idx)=>{
                const contract=getContract(client.id);
                const ss=statusStyle(client.status);
                return(
                  <tr key={client.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafafa"}}>
                    {/* Client name + industry */}
                    <td style={{padding:"12px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:15,flexShrink:0}}>
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a"}}>{client.name}</p>
                          <p style={{margin:"1px 0 0",fontSize:11,color:"#94a3b8"}}>{client.industry||"—"}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact info */}
                    <td style={{padding:"12px 13px"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {client.contact_person&&<p style={{margin:0,fontSize:13,fontWeight:500,color:"#0f172a"}}>{client.contact_person}</p>}
                        {client.contact_person_designation&&<p style={{margin:0,fontSize:11,color:"#94a3b8"}}>{client.contact_person_designation}</p>}
                        {client.contact_email&&<p style={{margin:"2px 0 0",fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:3}}>✉ {client.contact_email}</p>}
                        {client.contact_phone&&<p style={{margin:0,fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:3}}>📞 {client.contact_phone}</p>}
                      </div>
                    </td>
                    {/* Active contract */}
                    <td style={{padding:"12px 13px"}}>
                      {contract?(
                        <div>
                          <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a"}}>SAR {Math.round(contract.cv/contract.tm).toLocaleString("en-US")}/mo</p>
                          <p style={{margin:"1px 0 0",fontSize:11,color:"#94a3b8"}}>{contract.tm} months</p>
                        </div>
                      ):(
                        <span style={{fontSize:12,color:"#cbd5e1"}}>No active contract</span>
                      )}
                    </td>
                    {/* Status badge */}
                    <td style={{padding:"12px 13px",textAlign:"center"}}>
                      <Bdg bg={ss.bg} color={ss.color}>{client.status}</Bdg>
                    </td>
                    {/* Actions */}
                    <td style={{padding:"12px 13px",textAlign:"right"}}>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(client)}>✏️</Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(client.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length===0&&(
            <div style={{textAlign:"center",padding:"48px 24px",color:"#94a3b8"}}>
              <div style={{fontSize:40,marginBottom:12}}>🏢</div>
              <p style={{fontSize:14}}>No clients found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editing?"Edit Client":"Add New Client"}>
        <form onSubmit={handleSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            <div><Lbl>Company Name *</Lbl><Inp value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Enter company name" required/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Industry *</Lbl><Inp value={form.industry} onChange={e=>upd("industry",e.target.value)} placeholder="e.g. Technology" required/></div>
              <div><Lbl>Status</Lbl>
                <Sel value={form.status} onChange={v=>upd("status",v)} options={["Active","Prospect","Inactive","Churned"].map(s=>({v:s,l:s}))}/>
              </div>
            </div>
            <div><Lbl>Contact Person *</Lbl><Inp value={form.contact_person} onChange={e=>upd("contact_person",e.target.value)} placeholder="Primary contact name" required/></div>
            <div><Lbl>Contact Person Designation *</Lbl><Inp value={form.contact_person_designation} onChange={e=>upd("contact_person_designation",e.target.value)} placeholder="e.g. Marketing Manager" required/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Email *</Lbl><Inp type="email" value={form.contact_email} onChange={e=>upd("contact_email",e.target.value)} placeholder="email@company.com" required/></div>
              <div><Lbl>Phone *</Lbl><Inp value={form.contact_phone} onChange={e=>upd("contact_phone",e.target.value)} placeholder="+966..." required/></div>
            </div>
            <div><Lbl>Notes</Lbl>
              <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Additional notes..." rows={3}
                style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
              <Btn variant="outline" onClick={close}>Cancel</Btn>
              <Btn variant="primary" type="submit">{editing?"Update":"Create"}</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const MOCK_CONTRACTS_FULL = [
  {id:"ct1", contract_number:"CTR-2026-001", client_id:"cl1", client_name:"SABIC",        contract_value:480000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-12-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:80000,  budget_production:140000, budget_creative:160000, budget_planning:100000, notes:"Annual brand retainer.", contract_pdf_url:""},
  {id:"ct2", contract_number:"CTR-2026-002", client_id:"cl2", client_name:"Saudi Aramco", contract_value:360000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-05-15", status:"Active",  contract_category:"Retainer", budget_client_servicing:60000,  budget_production:100000, budget_creative:120000, budget_planning:80000,  notes:"",                   contract_pdf_url:""},
  {id:"ct3", contract_number:"CTR-2026-003", client_id:"cl3", client_name:"Almarai",      contract_value:240000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-12-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:40000,  budget_production:70000,  budget_creative:80000,  budget_planning:50000,  notes:"Includes seasonal campaigns.", contract_pdf_url:""},
  {id:"ct4", contract_number:"CTR-2026-004", client_id:"cl4", client_name:"STC",          contract_value:180000, tenure_months:6,  start_date:"2026-02-01", end_date:"2026-07-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:30000,  budget_production:50000,  budget_creative:60000,  budget_planning:40000,  notes:"",                   contract_pdf_url:""},
  {id:"ct5", contract_number:"PRJ-2026-001", client_id:"cl5", client_name:"Mobily",       contract_value:90000,  tenure_months:3,  start_date:"2026-03-01", end_date:"2026-06-25", status:"Active",  contract_category:"Project",  budget_client_servicing:15000,  budget_production:25000,  budget_creative:30000,  budget_planning:20000,  notes:"Brand refresh project.", contract_pdf_url:""},
  {id:"ct6", contract_number:"ADH-2025-001", client_id:"cl8", client_name:"Zain KSA",     contract_value:45000,  tenure_months:2,  start_date:"2025-10-01", end_date:"2025-11-30", status:"Expired", contract_category:"Adhoc",    budget_client_servicing:10000,  budget_production:15000,  budget_creative:12000,  budget_planning:8000,   notes:"Campaign support.",  contract_pdf_url:""},
  {id:"ct7", contract_number:"PRJ-2025-002", client_id:"cl3", client_name:"Almarai",      contract_value:120000, tenure_months:4,  start_date:"2025-06-01", end_date:"2025-09-30", status:"Expired", contract_category:"Project",  budget_client_servicing:20000,  budget_production:35000,  budget_creative:40000,  budget_planning:25000,  notes:"Ramadan campaign.",  contract_pdf_url:""},
];
const EMPTY_CONTRACT = {client_id:"",client_name:"",contract_value:"",tenure_months:12,start_date:"",end_date:"",status:"Active",contract_category:"Retainer",budget_client_servicing:0,budget_production:0,budget_creative:0,budget_planning:0,contract_pdf_url:"",notes:""};
const CLIENT_MAP = {cl1:"SABIC",cl2:"Saudi Aramco",cl3:"Almarai",cl4:"STC",cl5:"Mobily",cl6:"Al Rajhi Bank",cl7:"Noon",cl8:"Zain KSA"};

// ─── ALLOCATIONS DATA & HELPERS (shared with ContractsPage) ─────────────────

const MOCK_ALLOCS_INIT = [
  {id:"a1", employee_id:"e1", employee_name:"Sarah Al-Rashidi", client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:88,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a2", employee_id:"e1", employee_name:"Sarah Al-Rashidi", client_id:"cl3", client_name:"Almarai",      contract_id:"ct3", allocated_hours:66,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a3", employee_id:"e2", employee_name:"Mohammed Khalid",  client_id:"cl2", client_name:"Saudi Aramco", contract_id:"ct2", allocated_hours:176, month:"2026-04", status:"Assigned", notes:""},
  {id:"a4", employee_id:"e3", employee_name:"Lena Barakat",     client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:120, month:"2026-04", status:"Assigned", notes:""},
  {id:"a5", employee_id:"e3", employee_name:"Lena Barakat",     client_id:"cl5", client_name:"Mobily",       contract_id:"ct5", allocated_hours:56,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a6", employee_id:"e4", employee_name:"Omar Farouk",      client_id:"cl3", client_name:"Almarai",      contract_id:"ct3", allocated_hours:44,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a7", employee_id:"e5", employee_name:"Nadia Hamdan",     client_id:"cl4", client_name:"STC",          contract_id:"ct4", allocated_hours:160, month:"2026-04", status:"Assigned", notes:""},
  {id:"a8", employee_id:"e6", employee_name:"Tariq Mansour",    client_id:"cl2", client_name:"Saudi Aramco", contract_id:"ct2", allocated_hours:200, month:"2026-04", status:"Assigned", notes:"Over-allocated"},
  {id:"a9", employee_id:"e7", employee_name:"Rana Al-Amin",     client_id:"cl3", client_name:"Almarai",      contract_id:"ct3", allocated_hours:132, month:"2026-04", status:"Assigned", notes:""},
  {id:"a10",employee_id:"e7", employee_name:"Rana Al-Amin",     client_id:"cl4", client_name:"STC",          contract_id:"ct4", allocated_hours:22,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a11",employee_id:"e8", employee_name:"Faisal Qureshi",   client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:176, month:"2026-04", status:"Assigned", notes:""},
  {id:"a12",employee_id:"e9", employee_name:"Yasmin Saleh",     client_id:"cl2", client_name:"Saudi Aramco", contract_id:"ct2", allocated_hours:88,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a13",employee_id:"e9", employee_name:"Yasmin Saleh",     client_id:"cl5", client_name:"Mobily",       contract_id:"ct5", allocated_hours:88,  month:"2026-04", status:"Assigned", notes:""},
  {id:"a14",employee_id:"e10",employee_name:"Khalid Nasser",    client_id:"cl4", client_name:"STC",          contract_id:"ct4", allocated_hours:30,  month:"2026-04", status:"Assigned", notes:""},
  {id:"b1", employee_id:"e1", employee_name:"Sarah Al-Rashidi", client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:100, month:"2026-03", status:"Assigned", notes:""},
  {id:"b2", employee_id:"e2", employee_name:"Mohammed Khalid",  client_id:"cl2", client_name:"Saudi Aramco", contract_id:"ct2", allocated_hours:160, month:"2026-03", status:"Assigned", notes:""},
  {id:"b3", employee_id:"e3", employee_name:"Lena Barakat",     client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:140, month:"2026-03", status:"Assigned", notes:""},
  {id:"b4", employee_id:"e5", employee_name:"Nadia Hamdan",     client_id:"cl4", client_name:"STC",          contract_id:"ct4", allocated_hours:130, month:"2026-03", status:"Assigned", notes:""},
  {id:"b5", employee_id:"e6", employee_name:"Tariq Mansour",    client_id:"cl2", client_name:"Saudi Aramco", contract_id:"ct2", allocated_hours:176, month:"2026-03", status:"Assigned", notes:""},
  {id:"b6", employee_id:"e7", employee_name:"Rana Al-Amin",     client_id:"cl3", client_name:"Almarai",      contract_id:"ct3", allocated_hours:110, month:"2026-03", status:"Assigned", notes:""},
  {id:"b7", employee_id:"e8", employee_name:"Faisal Qureshi",   client_id:"cl1", client_name:"SABIC",        contract_id:"ct1", allocated_hours:176, month:"2026-03", status:"Assigned", notes:""},
  {id:"b8", employee_id:"e4", employee_name:"Omar Farouk",      client_id:"cl3", client_name:"Almarai",      contract_id:"ct3", allocated_hours:60,  month:"2026-03", status:"Assigned", notes:""},
  {id:"b9", employee_id:"e9", employee_name:"Yasmin Saleh",     client_id:"cl5", client_name:"Mobily",       contract_id:"ct5", allocated_hours:176, month:"2026-03", status:"Assigned", notes:""},
  {id:"b10",employee_id:"e10",employee_name:"Khalid Nasser",    client_id:"cl4", client_name:"STC",          contract_id:"ct4", allocated_hours:88,  month:"2026-03", status:"Assigned", notes:""},
];

const ALLOC_MONTHS = [
  {v:"2026-01",l:"January 2026"},{v:"2026-02",l:"February 2026"},{v:"2026-03",l:"March 2026"},
  {v:"2026-04",l:"April 2026"}, {v:"2026-05",l:"May 2026"},     {v:"2026-06",l:"June 2026"},
  {v:"2026-07",l:"July 2026"},  {v:"2026-08",l:"August 2026"},  {v:"2026-09",l:"September 2026"},
  {v:"2026-10",l:"October 2026"},{v:"2026-11",l:"November 2026"},{v:"2026-12",l:"December 2026"},
];

const ALLOC_DEPTS = ["Production Department","Client Servicing Department","Creative Department","Planning Department"];

function ContractSearchSelect({contracts,value,onChange}){
  const [search,setSearch]=useState("");
  const [catF,setCatF]=useState("all");
  const filtered=contracts.filter(c=>{
    const ms=!search||c.cn?.toLowerCase().includes(search.toLowerCase())||c.contract_number?.toLowerCase().includes(search.toLowerCase());
    return ms&&(catF==="all"||(c.contract_category||"Retainer")===catF);
  });
  const selected=contracts.find(c=>c.id===value);
  const catColors={all:{a:"#0f172a",b:"#f1f5f9"},Retainer:{a:"#1d4ed8",b:"#dbeafe"},Project:{a:"#6d28d9",b:"#f3e8ff"},Adhoc:{a:"#d97706",b:"#fef9c3"}};
  return(
    <div style={{border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"flex",borderBottom:"1px solid #f1f5f9"}}>
        {["all","Retainer","Project","Adhoc"].map(cat=>{
          const act=catF===cat; const c=catColors[cat];
          return <button key={cat} type="button" onClick={()=>setCatF(cat)} style={{flex:1,padding:"4px 2px",fontSize:10,fontWeight:600,border:"none",background:act?c.b:"#fff",color:act?c.a:"#94a3b8",cursor:"pointer",borderBottom:act?`2px solid ${c.a}`:"2px solid transparent"}}>{cat==="all"?"All":cat}</button>;
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",borderBottom:"1px solid #f1f5f9"}}>
        <span style={{fontSize:11,color:"#94a3b8"}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:1,fontSize:11,outline:"none",border:"none",background:"transparent",color:"#0f172a"}}/>
        {selected&&<button type="button" onClick={()=>onChange("")} style={{fontSize:11,color:"#94a3b8",border:"none",background:"none",cursor:"pointer"}}>✕</button>}
      </div>
      {selected&&<div style={{padding:"3px 8px",background:"#eef2ff",fontSize:11,fontWeight:600,color:"#4f46e5",borderBottom:"1px solid #e0e7ff"}}>✓ {selected.contract_number} – {selected.cn}</div>}
      <div style={{maxHeight:110,overflowY:"auto"}}>
        {filtered.length===0
          ?<p style={{padding:"6px 8px",fontSize:11,color:"#94a3b8",textAlign:"center"}}>No contracts</p>
          :filtered.map(c=>(
            <button key={c.id} type="button" onClick={()=>{onChange(c.id);setSearch("");}}
              style={{width:"100%",textAlign:"left",padding:"5px 8px",fontSize:11,border:"none",background:c.id===value?"#eef2ff":"#fff",cursor:"pointer",borderBottom:"1px solid #f8fafc",display:"flex",gap:6,alignItems:"baseline"}}>
              <span style={{fontFamily:"monospace",color:"#94a3b8",flexShrink:0}}>{c.contract_number}</span>
              <span style={{color:"#0f172a",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.cn}</span>
              {c.st==="Expired"&&<span style={{color:"#ef4444",flexShrink:0}}>(Expired)</span>}
            </button>
          ))
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════


function ContractsPage(){
  const {sb}=useAuth();
  const [contracts,setContracts]=useState([]);
  const [loading,setLoading]=useState(true);
  const mapC=r=>({...r,cn:r.client_name,cid:r.client_id,cv:r.contract_value,tm:r.tenure_months,sd:r.start_date,ed:r.end_date,st:r.status,bcs:r.budget_client_servicing,bp:r.budget_production,bc:r.budget_creative,bpl:r.budget_planning});
  useEffect(()=>{
    sb.from('contracts').select('*').order('contract_number').then(({data})=>{if(data)setContracts(data.map(mapC));setLoading(false);});
  },[]);
  const dbAdd=async p=>{const{data}=await sb.from('contracts').insert([{contract_number:p.contract_number,client_id:p.client_id,client_name:p.client_name,contract_value:p.contract_value,tenure_months:p.tenure_months,start_date:p.start_date,end_date:p.end_date,status:p.status,contract_category:p.contract_category,budget_client_servicing:p.budget_client_servicing,budget_production:p.budget_production,budget_creative:p.budget_creative,budget_planning:p.budget_planning,notes:p.notes||""}]).select().single();if(data)setContracts(x=>[...x,mapC(data)]);};
  const dbUpdate=async(id,p)=>{const{data}=await sb.from('contracts').update({contract_number:p.contract_number,client_id:p.client_id,client_name:p.client_name,contract_value:p.contract_value,tenure_months:p.tenure_months,start_date:p.start_date,end_date:p.end_date,status:p.status,contract_category:p.contract_category,budget_client_servicing:p.budget_client_servicing,budget_production:p.budget_production,budget_creative:p.budget_creative,budget_planning:p.budget_planning,notes:p.notes||""}).eq('id',id).select().single();if(data)setContracts(x=>x.map(c=>c.id===id?mapC(data):c));};
  const dbDelete=async id=>{await sb.from('contracts').delete().eq('id',id);setContracts(x=>x.filter(c=>c.id!==id));};
  const [search,setSearch]       = useState("");
  const [statusF,setStatusF]     = useState("all");
  const [catF,setCatF]           = useState("all");
  const [sk,setSk]               = useState("client_name");
  const [sd,setSd]               = useState("asc");
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [form,setForm]           = useState(EMPTY_CONTRACT);

  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

  // Auto-set end_date from start_date + tenure
  const handleStartDate=v=>{
    const end=v&&form.tenure_months?addMonthsSimple(v,form.tenure_months):"";
    setForm(p=>({...p,start_date:v,end_date:end}));
  };
  const handleTenure=v=>{
    const t=parseFloat(v)||0;
    const end=form.start_date&&t>0?addMonthsSimple(form.start_date,t):"";
    setForm(p=>({...p,tenure_months:t,end_date:end}));
  };
  const handleClient=cid=>setForm(p=>({...p,client_id:cid,client_name:CLIENT_MAP[cid]||""}));

  const getCatFromTenure=t=>t<=4?"Adhoc":t<=8?"Project":"Retainer";
  const genContractNum=(t,cons)=>{
    const y=new Date().getFullYear();
    const pre=t<=4?`ADH-${y}-`:t<=8?`PRJ-${y}-`:`CTR-${y}-`;
    const nums=cons.filter(c=>c.contract_number?.startsWith(pre)).map(c=>parseInt(c.contract_number.split("-").pop())||0);
    return `${pre}${String((Math.max(0,...nums)+1)).padStart(3,"0")}`;
  };

  const openAdd =()=>{setEditing(null);setForm(EMPTY_CONTRACT);setModalOpen(true);};
  const openEdit=c=>{setEditing(c);setForm({client_id:c.client_id,client_name:c.client_name,contract_value:c.contract_value,tenure_months:c.tenure_months,start_date:c.start_date,end_date:c.end_date,status:c.status,contract_category:c.contract_category,budget_client_servicing:c.budget_client_servicing||0,budget_production:c.budget_production||0,budget_creative:c.budget_creative||0,budget_planning:c.budget_planning||0,contract_pdf_url:c.contract_pdf_url||"",notes:c.notes||"",contract_number:c.contract_number});setModalOpen(true);};
  const close=()=>{setModalOpen(false);setEditing(null);};

  const handleSubmit=e=>{
    e.preventDefault();
    const totalAlloc=(form.budget_client_servicing||0)+(form.budget_production||0)+(form.budget_creative||0)+(form.budget_planning||0);
    const cv=parseFloat(form.contract_value)||0;
    if(totalAlloc!==cv){alert(`Total dept allocation (SAR ${totalAlloc.toLocaleString()}) must equal contract value (SAR ${cv.toLocaleString()})`);return;}
    const expired=form.end_date&&new Date(form.end_date)<new Date();
    const autoStatus=expired?"Expired":"Active";
    const autoCat=getCatFromTenure(form.tenure_months);
    if(editing){
      setContracts(p=>p.map(c=>c.id===editing.id?{...c,...form,status:autoStatus,contract_category:autoCat}:c));
    } else {
      const num=genContractNum(form.tenure_months,contracts);
      setContracts(p=>[...p,{id:`ct${Date.now()}`,contract_number:num,...form,status:autoStatus,contract_category:autoCat}]);
    }
    close();
  };

  const del=id=>{if(window.confirm("Delete this contract?"))setContracts(p=>p.filter(c=>c.id!==id));};
  const sort=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  const filtered=useMemo(()=>contracts.filter(c=>{
    const ms=!search||c.client_name.toLowerCase().includes(search.toLowerCase())||c.contract_number?.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||c.status===statusF)&&(catF==="all"||(c.contract_category||"Retainer")===catF);
  }),[contracts,search,statusF,catF]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    if(typeof av==="number")return sd==="asc"?av-bv:bv-av;
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[filtered,sk,sd]);

  // Budget summary widgets
  const budgetSummary=[
    {label:"Client Servicing",key:"budget_client_servicing",bg:"#eff6ff",border:"#bfdbfe",color:"#1d4ed8"},
    {label:"Production",      key:"budget_production",       bg:"#f5f3ff",border:"#ddd6fe",color:"#6d28d9"},
    {label:"Creative",        key:"budget_creative",         bg:"#f0fdf4",border:"#bbf7d0",color:"#059669"},
    {label:"Planning",        key:"budget_planning",         bg:"#fffbeb",border:"#fde68a",color:"#d97706"},
  ].map(w=>({...w,total:contracts.reduce((s,c)=>s+((c[w.key]||0)),0)}));

  const totalAlloc=(form.budget_client_servicing||0)+(form.budget_production||0)+(form.budget_creative||0)+(form.budget_planning||0);
  const formCV=parseFloat(form.contract_value)||0;
  const allocMatch=formCV>0&&totalAlloc===formCV;
  const allocOver=totalAlloc>formCV;

  const catStyle=c=>({Retainer:{bg:"#dbeafe",col:"#2563eb"},Project:{bg:"#f3e8ff",col:"#7c3aed"},Adhoc:{bg:"#fef9c3",col:"#d97706"}}[c]||{bg:"#f1f5f9",col:"#475569"});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Contracts</h1><p style={{fontSize:13,color:"#64748b",marginTop:3}}>Manage client contracts and retainers</p></div>
        <Btn variant="primary" onClick={openAdd}>＋ Add Contract</Btn>
      </div>

      {/* Budget summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {budgetSummary.map(w=>(
          <Card key={w.label} style={{background:w.bg,borderColor:w.border,padding:16}}>
            <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:w.color,margin:"0 0 6px"}}>{w.label}</p>
            <p style={{fontSize:18,fontWeight:800,color:w.color,margin:"0 0 2px"}}>SAR {w.total.toLocaleString("en-US")}</p>
            <p style={{fontSize:10,color:"#94a3b8",margin:0}}>across all contracts</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={statusF} onChange={setStatusF} options={[{v:"all",l:"All Status"},{v:"Active",l:"Active"},{v:"Expired",l:"Expired"}]} style={{width:140}}/>
        <Sel value={catF} onChange={setCatF} options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{width:160}}/>
        <Btn variant="outline">⬇ Export</Btn>
      </div>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <SortTh k="contract_number" sk={sk} sd={sd} onSort={sort}>Contract ID</SortTh>
              <SortTh k="client_name"     sk={sk} sd={sd} onSort={sort}>Client</SortTh>
              <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>Category</th>
              <SortTh k="contract_value"  sk={sk} sd={sd} onSort={sort} align="right">Contract Value</SortTh>
              <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"right"}}>Monthly Retainer</th>
              <SortTh k="start_date"      sk={sk} sd={sd} onSort={sort}>Duration</SortTh>
              <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"center"}}>Renewal</th>
              <SortTh k="status"          sk={sk} sd={sd} onSort={sort} align="center">Status</SortTh>
              <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"right"}}>Actions</th>
            </tr></thead>
            <tbody>
              {sorted.map((c,idx)=>{
                const dl=daysBetween(c.end_date,new Date().toISOString().slice(0,10));
                const soon=dl>=0&&dl<=30,expired=dl<0;
                const monthly=Math.round(c.contract_value/c.tenure_months);
                const cs=catStyle(c.contract_category);
                const rowBg=expired?"#fff5f5":soon?"#fffbeb":idx%2===0?"#fff":"#fafafa";
                return(
                  <tr key={c.id} style={{borderBottom:"1px solid #f1f5f9",background:rowBg}}>
                    <td style={{padding:"11px 13px"}}><span style={{background:"#f1f5f9",color:"#475569",padding:"2px 8px",borderRadius:5,fontSize:11,fontWeight:600,fontFamily:"monospace"}}>{c.contract_number||"—"}</span></td>
                    <td style={{padding:"11px 13px",fontWeight:600,fontSize:13,color:"#0f172a"}}>{c.client_name}</td>
                    <td style={{padding:"11px 13px"}}><Bdg bg={cs.bg} color={cs.col}>{c.contract_category||"Retainer"}</Bdg></td>
                    <td style={{padding:"11px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a"}}>SAR {c.contract_value.toLocaleString("en-US")}</td>
                    <td style={{padding:"11px 13px",textAlign:"right",fontSize:13,color:"#475569"}}>SAR {monthly.toLocaleString("en-US")}</td>
                    <td style={{padding:"11px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12,color:"#94a3b8"}}>📅</span>
                        <div>
                          <p style={{margin:0,fontSize:12,color:"#0f172a"}}>{fmtDateShort(c.start_date)}</p>
                          <p style={{margin:"1px 0 0",fontSize:11,color:"#94a3b8"}}>to {fmtDateShort(c.end_date)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}>
                      {expired
                        ?<Bdg bg="#fee2e2" color="#dc2626">{dl} days</Bdg>
                        :soon
                          ?<Bdg bg="#fef9c3" color="#d97706">⚠ {dl}d left</Bdg>
                          :<Bdg bg="#f1f5f9" color="#64748b">{dl}d left</Bdg>
                      }
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}>
                      <Bdg bg={expired?"#fee2e2":"#d1fae5"} color={expired?"#dc2626":"#059669"}>{expired?"Expired":"Active"}</Bdg>
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"right"}}>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(c)}>✏️</Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(c.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              {sorted.length>0&&(
                <tr style={{background:"#f1f5f9",borderTop:"2px solid #cbd5e1"}}>
                  <td colSpan={3} style={{padding:"9px 13px",fontWeight:700,fontSize:13,color:"#0f172a"}}>TOTAL</td>
                  <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a"}}>SAR {sorted.reduce((s,c)=>s+c.contract_value,0).toLocaleString("en-US")}</td>
                  <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a"}}>SAR {sorted.reduce((s,c)=>s+Math.round(c.contract_value/c.tenure_months),0).toLocaleString("en-US")}</td>
                  <td colSpan={4}/>
                </tr>
              )}
            </tbody>
          </table>
          {sorted.length===0&&<div style={{textAlign:"center",padding:"48px 24px",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>📄</div><p style={{fontSize:14}}>No contracts found</p></div>}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editing?"Edit Contract":"Add New Contract"}>
        <form onSubmit={handleSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {editing&&form.contract_number&&(
              <div style={{padding:"8px 12px",background:"#f1f5f9",borderRadius:8}}><p style={{margin:0,fontSize:12,color:"#475569"}}>Contract ID: <strong style={{color:"#0f172a"}}>{form.contract_number}</strong></p></div>
            )}
            <div><Lbl>Client *</Lbl>
              <Sel value={form.client_id} onChange={handleClient} options={[{v:"",l:"Select client"},...Object.entries(CLIENT_MAP).map(([v,l])=>({v,l}))]}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Contract Value (SAR) *</Lbl><Inp type="number" value={form.contract_value} onChange={e=>upd("contract_value",parseFloat(e.target.value)||"")} placeholder="Total value" required/></div>
              <div><Lbl>Tenure (Months) *</Lbl><Inp type="number" step="0.01" min="0.01" value={form.tenure_months} onChange={e=>handleTenure(e.target.value)} placeholder="Duration" required/></div>
            </div>
            {form.contract_value&&form.tenure_months>0&&(
              <div style={{padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>
                <p style={{margin:0,fontSize:12,color:"#475569"}}>Monthly Retainer: <strong style={{color:"#0f172a"}}>SAR {Math.round(parseFloat(form.contract_value)/form.tenure_months).toLocaleString("en-US")}</strong></p>
              </div>
            )}
            {/* Dept Budget Allocation */}
            <div style={{border:"1px solid #e2e8f0",borderRadius:10,padding:14,background:"#f8fafc"}}>
              <p style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:"#374151"}}>Budget Allocation by Department</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["budget_client_servicing","Client Servicing Dept"],["budget_production","Production Dept"],["budget_creative","Creative Dept"],["budget_planning","Planning Dept"]].map(([k,l])=>(
                  <div key={k}><Lbl>{l}</Lbl><Inp type="number" min="0" value={form[k]} onChange={e=>upd(k,parseFloat(e.target.value)||0)} placeholder="0"/></div>
                ))}
              </div>
              <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:allocMatch?"#d1fae5":allocOver?"#fee2e2":"#fef9c3",border:`1px solid ${allocMatch?"#a7f3d0":allocOver?"#fecaca":"#fde68a"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:600,color:"#374151"}}>Total Allocated:</span>
                <span style={{fontSize:13,fontWeight:700,color:allocMatch?"#059669":allocOver?"#dc2626":"#d97706"}}>
                  SAR {totalAlloc.toLocaleString("en-US")}
                  {formCV>0&&<span style={{fontSize:11,fontWeight:400,color:"#64748b",marginLeft:6}}>/ SAR {formCV.toLocaleString("en-US")}</span>}
                </span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Start Date *</Lbl><Inp type="date" value={form.start_date} onChange={e=>handleStartDate(e.target.value)} required/></div>
              <div><Lbl>End Date *</Lbl><Inp type="date" value={form.end_date} onChange={e=>upd("end_date",e.target.value)} required/></div>
            </div>
            <div><Lbl>Contract PDF</Lbl><Inp type="file" accept="application/pdf" disabled style={{color:"#94a3b8"}}/></div>
            <div><Lbl>Notes</Lbl>
              <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Contract notes..." rows={2} style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
              <Btn variant="outline" onClick={close}>Cancel</Btn>
              <Btn variant="primary" type="submit">{editing?"Update":"Create"}</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AllocationsPage(){
  const {sb}=useAuth();
  const [allocs,setAllocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const mapA=a=>({...a,eid:a.employee_id,cid:a.client_id,h:a.allocated_hours});
  useEffect(()=>{
    sb.from('allocations').select('*').order('month',{ascending:false}).then(({data})=>{if(data)setAllocs(data.map(mapA));setLoading(false);});
  },[]);
  const dbBulkAdd=async items=>{const rows=items.map(a=>({employee_id:a.employee_id,employee_name:a.employee_name,employee_monthly_cost:a.employee_monthly_cost||0,client_id:a.client_id,client_name:a.client_name,contract_id:a.contract_id,allocated_hours:a.allocated_hours,month:a.month,status:a.status||'Assigned',notes:a.notes||''}));const{data}=await sb.from('allocations').insert(rows).select();if(data)setAllocs(p=>[...p,...data.map(mapA)]);};
  const dbUpdate=async(id,p)=>{const{data}=await sb.from('allocations').update({allocated_hours:p.allocated_hours,month:p.month,notes:p.notes}).eq('id',id).select().single();if(data)setAllocs(x=>x.map(a=>a.id===id?mapA(data):a));};
  const dbDelete=async id=>{await sb.from('allocations').delete().eq('id',id);setAllocs(x=>x.filter(a=>a.id!==id));};
  const [search,setSearch]       = useState("");
  const [filterEmp,setFilterEmp] = useState("all");
  const [filterCli,setFilterCli] = useState("all");
  const [filterDept,setFilterDept]=useState("all");
  const [filterCat,setFilterCat] = useState("all");
  const [chartMonth,setChartMonth]=useState("2026-04");
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [formStep,setFormStep]   = useState(1);
  const [selMonth,setSelMonth]   = useState("");
  const [selEmpIds,setSelEmpIds] = useState([]);
  const [empAllocs,setEmpAllocs] = useState({});
  const [empSearch,setEmpSearch] = useState("");
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [editForm,setEditForm]   = useState({allocated_hours:"",month:"2026-04",notes:""});
  const [sk,setSk]=useState("employee_name");
  const [sd,setSd]=useState("asc");
  const sortFn=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  const availMonths=useMemo(()=>[...new Set(allocs.map(a=>a.month).filter(Boolean))].sort().reverse(),[allocs]);

  const utilForMonth=useCallback((month)=>{
    const map={};
    EMPLOYEES_INIT.forEach(emp=>{
      const h=allocs.filter(a=>a.employee_id===emp.id&&a.month===month).reduce((s,a)=>s+(a.allocated_hours||0),0);
      map[emp.id]={totalHours:h,availableHours:Math.max(0,HPM-h),percentage:(h/HPM)*100};
    });
    return map;
  },[allocs]);

  const utilMap=useMemo(()=>utilForMonth(chartMonth),[utilForMonth,chartMonth]);

  const contractsForMonth=useMemo(()=>{
    if(!selMonth) return [];
    return MOCK_CONTRACTS_FULL.filter(c=>isActive(c,selMonth));
  },[selMonth]);

  const getRemainingHours=(empId,month,excludeId=null)=>{
    const used=allocs.filter(a=>a.employee_id===empId&&a.month===month&&a.id!==excludeId).reduce((s,a)=>s+(a.allocated_hours||0),0);
    return Math.max(0,HPM-used);
  };

  const filtered=useMemo(()=>allocs.filter(a=>{
    const emp=EMPLOYEES_INIT.find(e=>e.id===a.employee_id);
    const ct=MOCK_CONTRACTS_FULL.find(c=>c.id===a.contract_id);
    const ms=!search||a.employee_name?.toLowerCase().includes(search.toLowerCase())||a.client_name?.toLowerCase().includes(search.toLowerCase());
    return ms&&(filterEmp==="all"||a.employee_id===filterEmp)&&(filterCli==="all"||a.client_id===filterCli)&&(filterDept==="all"||emp?.department===filterDept)&&(filterCat==="all"||(ct?.contract_category||"Retainer")===filterCat);
  }),[allocs,search,filterEmp,filterCli,filterDept,filterCat]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    if(typeof av==="number") return sd==="asc"?av-bv:bv-av;
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[filtered,sk,sd]);

  const chartAllocs=useMemo(()=>allocs.filter(a=>a.month===chartMonth),[allocs,chartMonth]);
  // Mirror Base44: inactive employees whose inactive_effective_month >= chartMonth still count
  const isEmpActiveForMonth=(e,month)=>e.status==="Active"||(e.status==="Inactive"&&e.inactive_effective_month&&e.inactive_effective_month>=month);
  const activeEmps=EMPLOYEES_INIT.filter(e=>isEmpActiveForMonth(e,chartMonth));
  const totalCap=activeEmps.length*HPM;
  const utilizedHours=chartAllocs.reduce((s,a)=>s+(a.allocated_hours||0),0);
  const availHours=Math.max(0,totalCap-utilizedHours);
  const pieData=[{name:"Utilized",hours:utilizedHours},{name:"Available",hours:availHours}];
  const clientChartData=useMemo(()=>{
    const map={};
    chartAllocs.forEach(a=>{map[a.client_name]=(map[a.client_name]||0)+(a.allocated_hours||0);});
    return Object.entries(map).map(([name,hours])=>({name,hours})).sort((a,b)=>b.hours-a.hours).slice(0,6);
  },[chartAllocs]);

  const closeModal=()=>{setModalOpen(false);setEditing(null);setFormStep(1);setSelMonth("");setSelEmpIds([]);setEmpAllocs({});setEmpSearch("");setConfirmOpen(false);};
  const openAdd=()=>{setEditing(null);setFormStep(1);setSelMonth("");setSelEmpIds([]);setEmpAllocs({});setModalOpen(true);};
  const openEdit=a=>{setEditing(a);setEditForm({allocated_hours:a.allocated_hours,month:a.month,notes:a.notes||""});setModalOpen(true);};

  const handleEmpToggle=(id,checked)=>{
    if(checked){setSelEmpIds(p=>[...p,id]);setEmpAllocs(p=>({...p,[id]:{hours:"",notes:"",client_id:""}}));}
    else{setSelEmpIds(p=>p.filter(x=>x!==id));setEmpAllocs(p=>{const n={...p};delete n[id];return n;});}
  };
  const updEmpAlloc=(id,k,v)=>setEmpAllocs(p=>({...p,[id]:{...p[id],[k]:v}}));

  const handleBulkSubmit=async()=>{
    const now=Date.now();
    const toCreate=selEmpIds.flatMap((eid,i)=>{
      const ea=empAllocs[eid]||{};
      if(!ea.client_id||!parseFloat(ea.hours)) return [];
      const emp=EMPLOYEES_INIT.find(e=>e.id===eid);
      const ct=MOCK_CONTRACTS_FULL.find(c=>c.id===ea.client_id);
      return [{id:`a${now}_${i}`,employee_id:eid,employee_name:emp?.name||"",client_id:ct?.cid||"",client_name:ct?.cn||"",contract_id:ea.client_id,allocated_hours:parseFloat(ea.hours),month:selMonth,status:ea.status||"Assigned",notes:ea.notes||""}];
    });
    if(toCreate.length) await dbBulkAdd(toCreate);
    closeModal();
  };

  const handleEditSubmit=async e=>{
    e.preventDefault();
    const rem=getRemainingHours(editing.employee_id,editForm.month,editing.id);
    if(parseFloat(editForm.allocated_hours)>rem+editing.allocated_hours){alert(`Only ${rem+editing.allocated_hours}h available.`);return;}
    await dbUpdate(editing.id,{allocated_hours:parseFloat(editForm.allocated_hours),month:editForm.month,notes:editForm.notes});
    closeModal();
  };

  const del=id=>{if(window.confirm("Delete this allocation?"))dbDelete(id);};
  const statusBadge=s=>s==="Assigned"?{bg:"#d1fae5",col:"#059669"}:{bg:"#f1f5f9",col:"#64748b"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Team Allocations</h1><p style={{fontSize:13,color:"#64748b",marginTop:3}}>Assign employees to client projects</p></div>
        <Btn variant="primary" onClick={openAdd}>＋ Add Allocation</Btn>
      </div>

      {/* Chart month selector */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{margin:0,fontSize:13,fontWeight:600,color:"#64748b"}}>Allocation Overview</p>
        <Sel value={chartMonth} onChange={setChartMonth}
          options={availMonths.length>0?availMonths.map(m=>({v:m,l:fmtLong(m)})):[{v:"2026-04",l:"April 2026"}]}
          style={{width:165}}/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card style={{padding:18}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>🥧 Hours Utilization</p>
          {totalCap>0?(
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="hours" labelLine={false}>
                      <Cell fill="#6366f1"/><Cell fill="#e2e8f0"/>
                    </Pie>
                    <Tooltip formatter={v=>`${Math.round(v)} hrs`}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:120}}>
                <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:10,height:10,borderRadius:"50%",background:"#6366f1"}}/><span style={{fontSize:11,color:"#64748b"}}>Utilized</span></div><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{utilizedHours}h</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{totalCap>0?((utilizedHours/totalCap)*100).toFixed(0):0}% of capacity</p></div>
                <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:10,height:10,borderRadius:"50%",background:"#e2e8f0"}}/><span style={{fontSize:11,color:"#64748b"}}>Available</span></div><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{availHours}h</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>of {totalCap}h total</p></div>
                <div style={{paddingTop:7,borderTop:"1px solid #f1f5f9"}}><p style={{margin:"0 0 1px",fontSize:10,color:"#94a3b8"}}>Resources</p><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{activeEmps.length}</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>active employees</p></div>
              </div>
            </div>
          ):<div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13}}>No allocation data</div>}
        </Card>

        <Card style={{padding:18}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>👥 Top Clients by Hours</p>
          {clientChartData.length>0?(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={clientChartData} margin={{top:5,right:5,left:0,bottom:36}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                <YAxis tick={{fontSize:9,fill:"#64748b"}}/>
                <Tooltip formatter={v=>`${v} hrs`}/>
                <Bar dataKey="hours" fill="#6366f1" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13}}>No allocation data</div>}
        </Card>
      </div>

      {/* Capacity cards — all active employees for chartMonth (mirrors Base44) */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {EMPLOYEES_INIT.filter(e=>isEmpActiveForMonth(e,chartMonth)).map(emp=>{
          const u=utilMap[emp.id]||{totalHours:0,availableHours:HPM,percentage:0};
          const ov=u.percentage>100,ok=u.percentage>=70&&u.percentage<=100;
          const border=ov?"#fecaca":ok?"#a7f3d0":"#fde68a";
          const bg2=ov?"#fff5f5":ok?"#f0fdf4":"#fffbeb";
          const clr=ov?"#dc2626":ok?"#059669":"#d97706";
          return(
            <Card key={emp.id} style={{background:bg2,borderColor:border,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:8,background:ov?"#fee2e2":ok?"#d1fae5":"#fef9c3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:clr,flexShrink:0}}>{emp.name.slice(0,2).toUpperCase()}</div>
                  <div><p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a"}}>{emp.name}</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{emp.designation}</p></div>
                </div>
                {ov&&<span style={{fontSize:12}}>⚠️</span>}
              </div>
              <PBar val={u.percentage} color={clr}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginTop:3}}>
                <span>{u.totalHours}h allocated</span><span>{u.availableHours}h available</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:155}}>
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:12}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search allocations..." style={{width:"100%",padding:"7px 10px 7px 27px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={filterEmp}  onChange={setFilterEmp}  options={[{v:"all",l:"All Employees"},...EMPLOYEES_INIT.map(e=>({v:e.id,l:e.name}))]}  style={{width:160}}/>
        <Sel value={filterCli}  onChange={setFilterCli}  options={[{v:"all",l:"All Clients"},  ...CLIENTS.map(c=>({v:c.id,l:c.name}))]}          style={{width:145}}/>
        <Sel value={filterDept} onChange={setFilterDept} options={[{v:"all",l:"All Departments"},...ALLOC_DEPTS.map(d=>({v:d,l:d.replace(" Department","")}))]}  style={{width:160}}/>
        <Sel value={filterCat}  onChange={setFilterCat}  options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{width:145}}/>
        <Btn variant="outline">⬇ Export</Btn>
      </div>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <SortTh k="employee_name"   sk={sk} sd={sd} onSort={sortFn}>Employee</SortTh>
              <SortTh k="client_name"     sk={sk} sd={sd} onSort={sortFn}>Client</SortTh>
              <SortTh k="allocated_hours" sk={sk} sd={sd} onSort={sortFn} align="center">Hours/Month</SortTh>
              <SortTh k="month"           sk={sk} sd={sd} onSort={sortFn} align="center">Month</SortTh>
              <SortTh k="status"          sk={sk} sd={sd} onSort={sortFn} align="center">Status</SortTh>
              <th style={{padding:"9px 13px",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",textAlign:"right"}}>Actions</th>
            </tr></thead>
            <tbody>
              {sorted.map((a,idx)=>{
                const emp=EMPLOYEES_INIT.find(e=>e.id===a.employee_id);
                const sb=statusBadge(a.status);
                return(
                  <tr key={a.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafafa"}}>
                    <td style={{padding:"11px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{(a.employee_name||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                        <div><p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a"}}>{a.employee_name}</p><p style={{margin:"1px 0 0",fontSize:10,color:"#94a3b8"}}>{emp?.department?.replace(" Department","")}</p></div>
                      </div>
                    </td>
                    <td style={{padding:"11px 13px",fontSize:13,color:"#0f172a"}}>{a.client_name}</td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}><Bdg bg="#f1f5f9" color="#475569">🕐 {a.allocated_hours} hrs</Bdg></td>
                    <td style={{padding:"11px 13px",textAlign:"center",fontSize:12,color:"#64748b"}}>{a.month||"—"}</td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}><Bdg bg={sb.bg} color={sb.col}>{a.status}</Bdg></td>
                    <td style={{padding:"11px 13px",textAlign:"right"}}>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(a)}>✏️</Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(a.id)}>🗑</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length===0&&<div style={{textAlign:"center",padding:"48px",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>👥</div><p style={{fontSize:14}}>No allocations found</p></div>}
        </div>
      </Card>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing?"Edit Allocation":"Add New Allocation"}>

        {/* EDIT MODE */}
        {editing&&(
          <form onSubmit={handleEditSubmit}>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>
                <p style={{margin:0,fontSize:12,color:"#475569"}}>Employee: <strong style={{color:"#0f172a"}}>{editing.employee_name}</strong></p>
                <p style={{margin:"2px 0 0",fontSize:12,color:"#475569"}}>Client: <strong style={{color:"#0f172a"}}>{editing.client_name}</strong></p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <Lbl>Hours/Month *</Lbl>
                  <Inp type="number" min="0" value={editForm.allocated_hours} onChange={e=>setEditForm(p=>({...p,allocated_hours:e.target.value}))} required/>
                  <p style={{margin:"3px 0 0",fontSize:10,color:"#94a3b8"}}>{getRemainingHours(editing.employee_id,editForm.month,editing.id)+editing.allocated_hours}h available</p>
                </div>
                <div><Lbl>Month *</Lbl><Sel value={editForm.month} onChange={v=>setEditForm(p=>({...p,month:v}))} options={ALLOC_MONTHS}/></div>
              </div>
              <div><Lbl>Notes</Lbl><Inp value={editForm.notes} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} placeholder="Allocation notes..."/></div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn variant="primary" type="submit">Update</Btn></div>
            </div>
          </form>
        )}

        {/* ADD MODE — 2-step wizard */}
        {!editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Step pills */}
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
              {[["1","Select"],["2","Configure"]].map(([num,label],i)=>{
                const act=formStep===(i+1);
                return(
                  <div key={num} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:999,background:act?"#0f172a":"#f1f5f9",color:act?"#fff":"#64748b",fontSize:12,fontWeight:600}}>
                      <span style={{width:17,height:17,borderRadius:"50%",background:act?"rgba(255,255,255,.2)":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{num}</span>{label}
                    </div>
                    {i===0&&<span style={{color:"#cbd5e1",fontSize:13}}>›</span>}
                  </div>
                );
              })}
            </div>

            {/* Step 1 */}
            {formStep===1&&(
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                <div><Lbl>Month *</Lbl><Sel value={selMonth} onChange={setSelMonth} options={[{v:"",l:"Select month"},...ALLOC_MONTHS]}/></div>
                <div>
                  <Lbl>Employees *</Lbl>
                  <div style={{position:"relative",marginBottom:6}}>
                    <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:12}}>🔍</span>
                    <input value={empSearch} onChange={e=>setEmpSearch(e.target.value)} placeholder="Search employees..." style={{width:"100%",padding:"7px 10px 7px 27px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{border:"1px solid #e2e8f0",borderRadius:9,maxHeight:210,overflowY:"auto"}}>
                    {EMPLOYEES_INIT
                      .filter(e=>e.status==="Active"||(e.status==="Inactive"&&e.inactive_effective_month&&selMonth&&e.inactive_effective_month>=selMonth))
                      .filter(e=>!empSearch||e.name.toLowerCase().includes(empSearch.toLowerCase()))
                      .map(emp=>{
                      const util=selMonth?utilForMonth(selMonth)[emp.id]:{availableHours:HPM,percentage:0};
                      const isSel=selEmpIds.includes(emp.id);
                      const avail=util?.availableHours??HPM;
                      const pct=util?.percentage||0;
                      const bc=avail<=0?"#fee2e2":pct>=70?"#d1fae5":"#fef9c3";
                      const tc=avail<=0?"#dc2626":pct>=70?"#059669":"#d97706";
                      return(
                        <label key={emp.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",cursor:"pointer",background:isSel?"#f8fafc":"#fff",borderBottom:"1px solid #f1f5f9"}}>
                          <input type="checkbox" checked={isSel} onChange={e=>handleEmpToggle(emp.id,e.target.checked)} style={{accentColor:"#0f172a",width:14,height:14,flexShrink:0}}/>
                          <div style={{flex:1}}><p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a"}}>{emp.name}</p><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{emp.department?.replace(" Department","")}</p></div>
                          <Bdg bg={bc} color={tc}>{avail}h free</Bdg>
                        </label>
                      );
                    })}
                  </div>
                  {selEmpIds.length>0&&<p style={{margin:"4px 0 0",fontSize:12,color:"#64748b"}}>{selEmpIds.length} employee(s) selected</p>}
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                  <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
                  <Btn variant="primary" onClick={()=>setFormStep(2)} disabled={!selMonth||selEmpIds.length===0}>Next ›</Btn>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {formStep===2&&(
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                <div style={{padding:"7px 12px",background:"#f8fafc",borderRadius:8}}><p style={{margin:0,fontSize:12,color:"#475569"}}>Month: <strong style={{color:"#0f172a"}}>{ALLOC_MONTHS.find(m=>m.v===selMonth)?.l}</strong></p></div>
                <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:330,overflowY:"auto"}}>
                  {selEmpIds.map(eid=>{
                    const emp=EMPLOYEES_INIT.find(e=>e.id===eid);
                    const ea=empAllocs[eid]||{};
                    const rem=getRemainingHours(eid,selMonth);
                    return(
                      <div key={eid} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13}}>👤</span><span style={{fontWeight:600,fontSize:13,color:"#0f172a"}}>{emp?.name}</span></div>
                          <Btn variant="danger" size="sm" onClick={()=>{setSelEmpIds(p=>p.filter(x=>x!==eid));setEmpAllocs(p=>{const n={...p};delete n[eid];return n;});}}>✕</Btn>
                        </div>
                        <div style={{marginBottom:8}}><Lbl>Contract *</Lbl><ContractSearchSelect contracts={contractsForMonth} value={ea.client_id||""} onChange={v=>updEmpAlloc(eid,"client_id",v)}/></div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                          <div>
                            <Lbl>Hours/Month *</Lbl>
                            <Inp type="number" min="0" max={rem} value={ea.hours||""} onChange={e=>{const v=Math.min(parseFloat(e.target.value)||0,rem);updEmpAlloc(eid,"hours",v||"");}} style={{borderColor:!ea.hours||ea.hours<=0?"#fca5a5":"#e2e8f0"}}/>
                            <p style={{margin:"2px 0 0",fontSize:10,color:"#94a3b8"}}>{rem}h available</p>
                          </div>
                          <div><Lbl>Status</Lbl><Sel value={ea.status||"Assigned"} onChange={v=>updEmpAlloc(eid,"status",v)} options={[{v:"Assigned",l:"Assigned"}]}/></div>
                          <div><Lbl>Notes</Lbl><Inp value={ea.notes||""} onChange={e=>updEmpAlloc(eid,"notes",e.target.value)} placeholder="Notes..."/></div>
                        </div>
                      </div>
                    );
                  })}
                  {selEmpIds.length===0&&<p style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"12px 0"}}>No employees selected — go back to add some.</p>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                  <Btn variant="outline" onClick={()=>setFormStep(1)}>‹ Back</Btn>
                  <div style={{display:"flex",gap:8}}>
                    <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
                    <Btn variant="primary" onClick={()=>setConfirmOpen(true)} disabled={selEmpIds.length===0||selEmpIds.every(id=>!empAllocs[id]?.client_id||!parseFloat(empAllocs[id]?.hours))}>Create Allocations</Btn>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm dialog */}
      <Modal open={confirmOpen} onClose={()=>setConfirmOpen(false)} title="Confirm Allocations">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{margin:0,fontSize:13,color:"#475569"}}>Create <strong>{selEmpIds.filter(id=>empAllocs[id]?.client_id&&parseFloat(empAllocs[id]?.hours)>0).length}</strong> allocation(s) for <strong>{ALLOC_MONTHS.find(m=>m.v===selMonth)?.l}</strong>?</p>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><Btn variant="outline" onClick={()=>setConfirmOpen(false)}>Cancel</Btn><Btn variant="primary" onClick={handleBulkSubmit}>Confirm</Btn></div>
        </div>
      </Modal>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const REPORT_COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

// Shared mock snapshots for custom reports tab (extends the existing SNAPSHOTS)
const REPORT_SNAPSHOTS = [
  {month:"2026-01",client_name:"SABIC",        contract_number:"CTR-2026-001",contract_value:480000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:40000,allocated_hours:264,resource_cost:28000,profit:12000,status:"Active",contract_category:"Retainer"},
  {month:"2026-01",client_name:"Saudi Aramco", contract_number:"CTR-2026-002",contract_value:360000,start_date:"2026-01-01",end_date:"2026-05-15",monthly_retainer:30000,allocated_hours:238,resource_cost:24000,profit:6000, status:"Active",contract_category:"Retainer"},
  {month:"2026-01",client_name:"Almarai",      contract_number:"CTR-2026-003",contract_value:240000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:20000,allocated_hours:170,resource_cost:12000,profit:8000, status:"Active",contract_category:"Retainer"},
  {month:"2026-02",client_name:"SABIC",        contract_number:"CTR-2026-001",contract_value:480000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:40000,allocated_hours:270,resource_cost:30000,profit:10000,status:"Active",contract_category:"Retainer"},
  {month:"2026-02",client_name:"Saudi Aramco", contract_number:"CTR-2026-002",contract_value:360000,start_date:"2026-01-01",end_date:"2026-05-15",monthly_retainer:30000,allocated_hours:220,resource_cost:22000,profit:8000, status:"Active",contract_category:"Retainer"},
  {month:"2026-02",client_name:"Almarai",      contract_number:"CTR-2026-003",contract_value:240000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:20000,allocated_hours:175,resource_cost:14000,profit:6000, status:"Active",contract_category:"Retainer"},
  {month:"2026-02",client_name:"STC",          contract_number:"CTR-2026-004",contract_value:180000,start_date:"2026-02-01",end_date:"2026-07-31",monthly_retainer:30000,allocated_hours:218,resource_cost:19000,profit:11000,status:"Active",contract_category:"Retainer"},
  {month:"2026-03",client_name:"SABIC",        contract_number:"CTR-2026-001",contract_value:480000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:40000,allocated_hours:276,resource_cost:31000,profit:9000, status:"Active",contract_category:"Retainer"},
  {month:"2026-03",client_name:"Saudi Aramco", contract_number:"CTR-2026-002",contract_value:360000,start_date:"2026-01-01",end_date:"2026-05-15",monthly_retainer:30000,allocated_hours:248,resource_cost:25000,profit:5000, status:"Active",contract_category:"Retainer"},
  {month:"2026-03",client_name:"Almarai",      contract_number:"CTR-2026-003",contract_value:240000,start_date:"2026-01-01",end_date:"2026-12-31",monthly_retainer:20000,allocated_hours:160,resource_cost:11000,profit:9000, status:"Active",contract_category:"Retainer"},
  {month:"2026-03",client_name:"STC",          contract_number:"CTR-2026-004",contract_value:180000,start_date:"2026-02-01",end_date:"2026-07-31",monthly_retainer:30000,allocated_hours:210,resource_cost:18000,profit:12000,status:"Active",contract_category:"Retainer"},
  {month:"2026-03",client_name:"Mobily",       contract_number:"PRJ-2026-001",contract_value:90000, start_date:"2026-03-01",end_date:"2026-06-25",monthly_retainer:30000,allocated_hours:264,resource_cost:22000,profit:8000, status:"Active",contract_category:"Project"},
];

function ReportsPage(){
  const [section,setSection]   = useState("charts");
  const [chartTab,setChartTab] = useState("profit-by-client");
  const [customTab,setCustomTab]= useState("revenue-profit-contract");
  const [selMonth,setSelMonth] = useState("2026-04");
  const [selDept,setSelDept]   = useState("all");
  const [selClosedClient,setSelClosedClient] = useState("all");
  const [selRevMonth,setSelRevMonth]   = useState("all");
  const [selRevCat,setSelRevCat]       = useState("all");
  const [selUtilMonth,setSelUtilMonth] = useState("2026-04");
  const [selDeptMonth,setSelDeptMonth] = useState("2026-04");

  // ── Calculations ────────────────────────────────────────────────────────────
  const R = useMemo(()=>{
    const als = (ALLOCS_BY_MONTH[selMonth]||[]);
    const em  = {};
    EMPLOYEES_INIT.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
    const ac  = CONTRACTS.filter(c=>isActive(c,selMonth));
    const cm  = {};
    ac.forEach(c=>{cm[c.cid]={...c,mr:c.cv/c.tm};});

    // 1. Profit by Client
    const profitByClient = CLIENTS.filter(cl=>cm[cl.id]).map(cl=>{
      const ct=cm[cl.id];
      let rc=0,ah=0;
      als.filter(a=>a.cid===cl.id).forEach(a=>{const e=em[a.eid];if(e){rc+=e.hr*a.h;ah+=a.h;}});
      const mr=ct.mr,mp=mr-rc,pct=mr>0?(mp/mr)*100:0;
      return{id:cl.id,name:cl.name,contractValue:ct.cv,tenure:ct.tm,monthlyRetainer:mr,resourceCost:Math.round(rc),monthlyProfit:Math.round(mp),marginPercent:pct,allocatedHours:ah};
    }).sort((a,b)=>b.monthlyProfit-a.monthlyProfit);

    // 2. Profit by Department
    const profitByDepartment = ["Client Servicing","Production","Creative","Planning"].map(dn=>{
      const fullDept=dn+" Department";
      let budget=0,cost=0;
      ac.forEach(c=>{
        const f=c.tm>0?1/c.tm:0;
        if(dn==="Client Servicing") budget+=(c.bcs||0)*f;
        else if(dn==="Production")  budget+=(c.bp||0)*f;
        else if(dn==="Creative")    budget+=(c.bc||0)*f;
        else if(dn==="Planning")    budget+=(c.bpl||0)*f;
      });
      als.forEach(a=>{const e=em[a.eid];if(e&&e.department===fullDept)cost+=e.hr*a.h;});
      const profit=budget-cost;
      return{name:dn,budget:Math.round(budget),cost:Math.round(cost),profit:Math.round(profit),margin:budget>0?(profit/budget)*100:0};
    }).sort((a,b)=>b.profit-a.profit);

    // 3. Resource by Department
    const deptMap={};
    als.forEach(a=>{
      const e=em[a.eid]; if(!e) return;
      const dn=e.department||"Unassigned";
      if(!deptMap[dn]) deptMap[dn]={department:dn.replace(" Department",""),emps:new Set(),totalHours:0,totalCost:0,clients:{}};
      deptMap[dn].emps.add(a.eid);
      deptMap[dn].totalHours+=a.h;
      const cost=e.hr*a.h;
      deptMap[dn].totalCost+=cost;
      const cn=a.client_name||"Unknown";
      if(!deptMap[dn].clients[cn]) deptMap[dn].clients[cn]={hours:0,cost:0};
      deptMap[dn].clients[cn].hours+=a.h;
      deptMap[dn].clients[cn].cost+=cost;
    });
    const resourceByDepartment=Object.values(deptMap).map(d=>({
      ...d,employeeCount:d.emps.size,
      avgUtilization:(d.totalHours/(d.emps.size*HPM))*100,
      clientBreakdown:Object.entries(d.clients).map(([client,v])=>({client,hours:v.hours,cost:Math.round(v.cost)}))
    })).sort((a,b)=>b.totalCost-a.totalCost);

    // 4. Cash Flow Forecast (12 months 2026)
    let cumulative=0;
    const cashFlow=Array.from({length:12},(_,i)=>{
      const mk=`2026-${String(i+1).padStart(2,"0")}`;
      const ml=new Date(2026,i,1).toLocaleString("en-US",{month:"short",year:"numeric"});
      const rev=CONTRACTS.filter(c=>c.st==="Active"&&isActive(c,mk)).reduce((s,c)=>s+c.cv/c.tm,0);
      const cost=EMPLOYEES_INIT.filter(e=>e.status==="Active").reduce((s,e)=>s+e.mc,0);
      const net=rev-cost; cumulative+=net;
      return{month:ml,expectedRevenue:Math.round(rev),expectedCost:Math.round(cost),netCashFlow:Math.round(net),cumulativeCash:Math.round(cumulative)};
    });

    // 5. Client Risk Analysis
    const clientRisk=profitByClient.map(c=>{
      let score=0;
      if(c.marginPercent<10) score+=40; else if(c.marginPercent<20) score+=20;
      if(c.allocatedHours>300) score+=30;
      if(c.tenure<6) score+=30;
      return{...c,riskScore:score,riskLevel:score>60?"High":score>30?"Medium":"Low",recommendation:score>60?"Review pricing or reduce allocation":score>30?"Monitor closely":"Continue as planned"};
    }).sort((a,b)=>b.riskScore-a.riskScore);

    // 6. Closed months from snapshots
    const byMonth={};
    REPORT_SNAPSHOTS.forEach(s=>{
      if(!byMonth[s.month]) byMonth[s.month]={month:s.month,totalRetainer:0,totalCost:0,totalProfit:0,clients:[]};
      byMonth[s.month].totalRetainer+=s.monthly_retainer;
      byMonth[s.month].totalCost+=s.resource_cost;
      byMonth[s.month].totalProfit+=s.profit;
      byMonth[s.month].clients.push({name:s.client_name,retainer:s.monthly_retainer,cost:s.resource_cost,profit:s.profit});
    });
    const closedMonths=Object.values(byMonth).sort((a,b)=>b.month.localeCompare(a.month)).map(m=>({
      ...m,
      monthFormatted:fmtShort(m.month),
      margin:m.totalRetainer>0?(m.totalProfit/m.totalRetainer)*100:0
    }));
    const uniqueClosedClients=[...new Set(REPORT_SNAPSHOTS.map(s=>s.client_name))];

    return{profitByClient,profitByDepartment,resourceByDepartment,cashFlow,clientRisk,closedMonths,uniqueClosedClients};
  },[selMonth]);

  // ── Shared helpers ───────────────────────────────────────────────────────────
  const exportCSV=(rows,headers,filename)=>{
    const csv=headers.join(",")+"\n"+rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=filename; a.click();
  };

  const pct=(v)=>v==null?"—":`${v.toFixed(1)}%`;
  const marginBadge=(m)=>{
    const bg=m<0?"#fee2e2":m<20?"#fef9c3":"#d1fae5";
    const col=m<0?"#dc2626":m<20?"#d97706":"#059669";
    return <Bdg bg={bg} color={col}>{pct(m)}</Bdg>;
  };
  const riskBadge=(level)=>{
    const s={High:{bg:"#ef4444",col:"#fff"},Medium:{bg:"#f59e0b",col:"#fff"},Low:{bg:"#10b981",col:"#fff"}}[level]||{bg:"#e2e8f0",col:"#64748b"};
    return <Bdg bg={s.bg} color={s.col}>{level}</Bdg>;
  };

  // Chart tab inner tabs
  const CHART_TABS=[
    {id:"profit-by-client",    label:"Profit by Client"},
    {id:"profit-by-department",label:"Profit by Department"},
    {id:"resource-allocation", label:"Resource Allocation"},
    {id:"cash-flow",           label:"Cash Flow Forecast"},
    {id:"risk-analysis",       label:"Risk Analysis"},
    {id:"monthly-closed",      label:"Monthly Closed"},
  ];
  const CUSTOM_TABS=[
    {id:"revenue-profit-contract", label:"Revenue & Profit by Contract"},
    {id:"employee-utilization",    label:"Employee Utilization"},
    {id:"department-performance",  label:"Department Performance"},
  ];

  // ── Table header style ───────────────────────────────────────────────────────
  const TH=({children,align="left"})=><th style={{padding:"8px 12px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TDark=({children,align="left"})=><th style={{padding:"8px 12px",textAlign:align,fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{children}</th>;
  const TD=({children,align="left",style={}})=><td style={{padding:"8px 12px",textAlign:align,fontSize:13,borderBottom:"1px solid #f1f5f9",...style}}>{children}</td>;

  // ── Sub-tab bar ──────────────────────────────────────────────────────────────
  const SubTabs=({tabs,active,onChange})=>(
    <div style={{display:"flex",flexWrap:"wrap",gap:4,background:"#f1f5f9",borderRadius:10,padding:4,marginBottom:18}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{padding:"7px 14px",borderRadius:8,border:"none",background:active===t.id?"#fff":"transparent",fontWeight:active===t.id?600:500,fontSize:12,color:active===t.id?"#0f172a":"#64748b",cursor:"pointer",boxShadow:active===t.id?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
          {t.label}
        </button>
      ))}
    </div>
  );

  const ExportBtn=({label,onClick})=>(
    <Btn variant="outline" size="sm" onClick={onClick}>{label}</Btn>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Reports</h1>
        <p style={{fontSize:13,color:"#64748b",marginTop:3}}>Detailed analysis and insights</p>
      </div>

      {/* Top section tabs */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:12,padding:4,maxWidth:420}}>
        {[["charts","📈 Charts & Graphs"],["custom","📋 Custom Reports"]].map(([v,l])=>(
          <button key={v} onClick={()=>setSection(v)} style={{flex:1,padding:"9px 14px",borderRadius:9,border:"none",background:section===v?"#fff":"transparent",fontWeight:section===v?700:500,fontSize:13,color:section===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:section===v?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{l}</button>
        ))}
      </div>

      {/* ── CHARTS SECTION ── */}
      {section==="charts"&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          <SubTabs tabs={CHART_TABS} active={chartTab} onChange={setChartTab}/>

          {/* 1. Profit by Client */}
          {chartTab==="profit-by-client"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"#64748b"}}>Month:</span>
                  <Sel value={selMonth} onChange={setSelMonth} options={MONTHS.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <ExportBtn label="⬇ CSV" onClick={()=>exportCSV(R.profitByClient.map(c=>[c.name,c.contractValue,c.tenure,c.resourceCost,c.monthlyProfit,c.marginPercent.toFixed(2),c.allocatedHours]),["Client","Contract Value","Tenure","Resource Cost","Net Profit","Margin%","Hours"],"profit-by-client.csv")}/>
                </div>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Profit by Client</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={R.profitByClient.slice(0,8)} margin={{top:10,right:20,left:10,bottom:50}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="monthlyRetainer" name="Monthly Retainer" fill="#10b981" radius={[3,3,0,0]}/>
                    <Bar dataKey="resourceCost"    name="Resource Cost"    fill="#f59e0b" radius={[3,3,0,0]}/>
                    <Bar dataKey="monthlyProfit"   name="Monthly Profit"   fill="#6366f1" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{overflowX:"auto",marginTop:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Client","Contract Value","Tenure","Resource Cost","Net Profit","Margin"].map((h,i)=><TH key={h} align={i===0?"left":i===5?"center":"right"}>{h}</TH>)}</tr></thead>
                    <tbody>{R.profitByClient.map(c=>(
                      <tr key={c.id}>
                        <TD><strong>{c.name}</strong></TD>
                        <TD align="right">{SAR(c.contractValue)}</TD>
                        <TD align="right">{c.tenure}m</TD>
                        <TD align="right" style={{color:"#d97706"}}>{SAR(c.resourceCost)}</TD>
                        <TD align="right" style={{fontWeight:700,color:c.monthlyProfit>=0?"#059669":"#dc2626"}}>{SAR(c.monthlyProfit)}</TD>
                        <TD align="center">{marginBadge(c.marginPercent)}</TD>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 2. Profit by Department */}
          {chartTab==="profit-by-department"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <ExportBtn label="⬇ CSV" onClick={()=>exportCSV(R.profitByDepartment.map(d=>[d.name,d.budget,d.cost,d.profit,d.margin.toFixed(2)]),["Department","Budget","Cost","Profit","Margin%"],"profit-by-dept.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Profit by Department vs Contract Budget</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={R.profitByDepartment} margin={{top:10,right:20,left:10,bottom:50}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="budget" name="Budget"      fill="#10b981" radius={[3,3,0,0]}/>
                    <Bar dataKey="cost"   name="Actual Cost" fill="#f59e0b" radius={[3,3,0,0]}/>
                    <Bar dataKey="profit" name="Profit"      fill="#6366f1" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{overflowX:"auto",marginTop:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Department","Budget Allocated","Actual Cost","Profit","Margin"].map((h,i)=><TH key={h} align={i===0?"left":i===4?"center":"right"}>{h}</TH>)}</tr></thead>
                    <tbody>{R.profitByDepartment.map(d=>(
                      <tr key={d.name}>
                        <TD><strong>{d.name}</strong></TD>
                        <TD align="right">{SAR(d.budget)}</TD>
                        <TD align="right" style={{color:"#d97706"}}>{SAR(d.cost)}</TD>
                        <TD align="right" style={{fontWeight:700,color:d.profit>=0?"#059669":"#dc2626"}}>{SAR(d.profit)}</TD>
                        <TD align="center">{marginBadge(d.margin)}</TD>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 3. Resource Allocation */}
          {chartTab==="resource-allocation"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <Sel value={selDept} onChange={setSelDept} options={[{v:"all",l:"All Departments"},{v:"Client Servicing",l:"Client Servicing"},{v:"Production",l:"Production"},{v:"Creative",l:"Creative"},{v:"Planning",l:"Planning"}]} style={{width:200}}/>
                <ExportBtn label="⬇ CSV" onClick={()=>{
                  const rows=R.resourceByDepartment.filter(d=>selDept==="all"||d.department===selDept).flatMap(d=>d.clientBreakdown.map(c=>[d.department,c.client,c.hours,c.cost]));
                  exportCSV(rows,["Department","Client","Hours","Cost"],"resource-allocation.csv");
                }}/>
              </div>
              {R.resourceByDepartment.filter(d=>selDept==="all"||d.department===selDept).map(dept=>(
                <Card key={dept.department} style={{padding:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a"}}>{dept.department} Department</p>
                    <span style={{fontSize:12,color:"#64748b"}}>{dept.employeeCount} employees · {dept.totalHours}h · {dept.avgUtilization.toFixed(0)}% utilized</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dept.clientBreakdown} margin={{top:5,right:10,left:5,bottom:36}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                      <XAxis dataKey="client" tick={{fontSize:9,fill:"#64748b"}} angle={-35} textAnchor="end"/>
                      <YAxis tick={{fontSize:9,fill:"#64748b"}}/>
                      <Tooltip formatter={(v,n)=>n==="hours"?`${v}h`:SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                      <Legend wrapperStyle={{fontSize:10}}/>
                      <Bar dataKey="hours" name="Hours" fill="#6366f1" radius={[3,3,0,0]}/>
                      <Bar dataKey="cost"  name="Cost"  fill="#10b981" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                  <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}>
                    <thead><tr><TH>Client</TH><TH align="center">Hours</TH><TH align="right">Cost to Client</TH></tr></thead>
                    <tbody>
                      {dept.clientBreakdown.map((c,i)=>(
                        <tr key={i}><TD><strong>{c.client}</strong></TD><TD align="center">{c.hours}h</TD><TD align="right" style={{color:"#059669"}}>{SAR(c.cost)}</TD></tr>
                      ))}
                      <tr style={{background:"#f8fafc",fontWeight:700}}>
                        <TD>Total</TD><TD align="center">{dept.totalHours}h</TD><TD align="right">{SAR(Math.round(dept.totalCost))}</TD>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              ))}
            </div>
          )}

          {/* 4. Cash Flow */}
          {chartTab==="cash-flow"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <ExportBtn label="⬇ CSV" onClick={()=>exportCSV(R.cashFlow.map(r=>[r.month,r.expectedRevenue,r.expectedCost,r.netCashFlow,r.cumulativeCash]),["Month","Revenue","Cost","Net","Cumulative"],"cash-flow.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>12-Month Cash Flow Forecast</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={R.cashFlow} margin={{top:10,right:20,left:10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"#64748b"}}/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Line type="monotone" dataKey="expectedRevenue" name="Revenue"       stroke="#10b981" strokeWidth={3}/>
                    <Line type="monotone" dataKey="expectedCost"    name="Cost"          stroke="#f59e0b" strokeWidth={3}/>
                    <Line type="monotone" dataKey="netCashFlow"     name="Net Cash Flow" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5"/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{overflowX:"auto",marginTop:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Month","Expected Revenue","Expected Cost","Net Cash Flow","Cumulative Cash"].map((h,i)=><TH key={h} align={i===0?"left":"right"}>{h}</TH>)}</tr></thead>
                    <tbody>{R.cashFlow.map((r,i)=>(
                      <tr key={i}>
                        <TD><strong>{r.month}</strong></TD>
                        <TD align="right" style={{color:"#059669"}}>{SAR(r.expectedRevenue)}</TD>
                        <TD align="right" style={{color:"#d97706"}}>{SAR(r.expectedCost)}</TD>
                        <TD align="right" style={{fontWeight:700,color:r.netCashFlow>=0?"#4f46e5":"#dc2626"}}>{SAR(r.netCashFlow)}</TD>
                        <TD align="right">{SAR(r.cumulativeCash)}</TD>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 5. Risk Analysis */}
          {chartTab==="risk-analysis"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <ExportBtn label="⬇ CSV" onClick={()=>exportCSV(R.clientRisk.map(c=>[c.name,c.contractValue,c.monthlyProfit,c.marginPercent.toFixed(1),c.riskScore,c.riskLevel,c.recommendation]),["Client","Contract Value","Net Profit","Margin%","Risk Score","Risk Level","Recommendation"],"risk-analysis.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Client Risk Analysis & Recommendations</p>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <TH>Client</TH><TH align="right">Contract Value</TH><TH align="right">Net Profit</TH>
                      <TH align="center">Margin</TH><TH align="center">Risk Score</TH><TH align="center">Risk Level</TH><TH>Recommendation</TH>
                    </tr></thead>
                    <tbody>{R.clientRisk.map(c=>(
                      <tr key={c.id} style={{background:c.riskLevel==="High"?"#fff5f5":c.riskLevel==="Medium"?"#fffbeb":"#fff"}}>
                        <TD><strong>{c.name}</strong></TD>
                        <TD align="right">{SAR(c.contractValue)}</TD>
                        <TD align="right" style={{fontWeight:700,color:c.monthlyProfit>=0?"#059669":"#dc2626"}}>{SAR(c.monthlyProfit)}</TD>
                        <TD align="center">{marginBadge(c.marginPercent)}</TD>
                        <TD align="center" style={{fontWeight:700}}>{c.riskScore}</TD>
                        <TD align="center">{riskBadge(c.riskLevel)}</TD>
                        <TD style={{fontSize:12,color:"#475569"}}>{c.recommendation}</TD>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 6. Monthly Closed */}
          {chartTab==="monthly-closed"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <Sel value={selClosedClient} onChange={setSelClosedClient} options={[{v:"all",l:"All Clients"},...R.uniqueClosedClients.map(c=>({v:c,l:c}))]} style={{width:200}}/>
                <ExportBtn label="⬇ CSV" onClick={()=>{
                  const rows=R.closedMonths.flatMap(m=>m.clients.filter(c=>selClosedClient==="all"||c.name===selClosedClient).map(c=>[m.monthFormatted,c.name,c.retainer,c.cost,c.profit]));
                  exportCSV(rows,["Month","Client","Retainer","Cost","Profit"],"monthly-closed.csv");
                }}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Historical Closed Months Performance</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={R.closedMonths.map(m=>{
                    if(selClosedClient==="all") return{month:m.monthFormatted,retainer:m.totalRetainer,cost:m.totalCost,profit:m.totalProfit};
                    const cd=m.clients.find(c=>c.name===selClosedClient);
                    return{month:m.monthFormatted,retainer:cd?.retainer||0,cost:cd?.cost||0,profit:cd?.profit||0};
                  })} margin={{top:5,right:20,left:10,bottom:50}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"#64748b"}} angle={-35} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="retainer" name="Monthly Retainer" fill="#10b981" radius={[3,3,0,0]}/>
                    <Bar dataKey="cost"     name="Resource Cost"    fill="#f59e0b" radius={[3,3,0,0]}/>
                    <Bar dataKey="profit"   name="Profit"           fill="#6366f1" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{overflowX:"auto",marginTop:14}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr><TH>Month</TH><TH>Client</TH><TH align="right">Monthly Retainer</TH><TH align="right">Resource Cost</TH><TH align="right">Profit</TH><TH align="center">Margin</TH></tr></thead>
                    <tbody>{R.closedMonths.flatMap(m=>
                      m.clients.filter(c=>selClosedClient==="all"||c.name===selClosedClient).map((c,i)=>(
                        <tr key={`${m.month}-${i}`}>
                          <TD><strong>{m.monthFormatted}</strong></TD>
                          <TD>{c.name}</TD>
                          <TD align="right">{SAR(c.retainer)}</TD>
                          <TD align="right" style={{color:"#d97706"}}>{SAR(c.cost)}</TD>
                          <TD align="right" style={{fontWeight:700,color:c.profit>=0?"#059669":"#dc2626"}}>{SAR(c.profit)}</TD>
                          <TD align="center">{marginBadge(c.retainer>0?(c.profit/c.retainer)*100:0)}</TD>
                        </tr>
                      ))
                    )}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── CUSTOM REPORTS SECTION ── */}
      {section==="custom"&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          <SubTabs tabs={CUSTOM_TABS} active={customTab} onChange={setCustomTab}/>

          {/* Revenue & Profit by Contract */}
          {customTab==="revenue-profit-contract"&&(()=>{
            const rows=REPORT_SNAPSHOTS
              .filter(s=>selRevMonth==="all"||s.month===selRevMonth)
              .filter(s=>selRevCat==="all"||s.contract_category===selRevCat)
              .map(s=>({...s,margin:s.monthly_retainer>0?Math.round((s.profit/s.monthly_retainer)*100):0}))
              .sort((a,b)=>b.month.localeCompare(a.month));
            const totRev=rows.reduce((s,r)=>s+r.monthly_retainer,0);
            const totCost=rows.reduce((s,r)=>s+r.resource_cost,0);
            const totProfit=rows.reduce((s,r)=>s+r.profit,0);
            const totHours=rows.reduce((s,r)=>s+r.allocated_hours,0);
            const avgMargin=totRev>0?Math.round((totProfit/totRev)*100):0;
            const uniqueMonths=[...new Set(REPORT_SNAPSHOTS.map(s=>s.month))].sort().reverse();
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:"#64748b"}}>Month:</span>
                      <Sel value={selRevMonth} onChange={setSelRevMonth} options={[{v:"all",l:"All Months"},...uniqueMonths.map(m=>({v:m,l:fmtLong(m)}))]} style={{width:155}}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:"#64748b"}}>Category:</span>
                      <Sel value={selRevCat} onChange={setSelRevCat} options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{width:150}}/>
                    </div>
                  </div>
                  <ExportBtn label="⬇ Export Excel" onClick={()=>exportCSV(rows.map(r=>[r.month,r.client_name,r.contract_number,r.contract_value,r.start_date,r.end_date,r.monthly_retainer,r.allocated_hours,r.resource_cost,r.profit,r.margin,r.status]),["Month","Client","Contract#","Value","Start","End","Revenue","Hours","Cost","Profit","Margin%","Status"],"revenue-profit.csv")}/>
                </div>
                <Card style={{overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a"}}>Revenue & Profit by Contract</p></div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr>
                        {["Month","Client Name","Contract #","Contract Value","Start Date","End Date","Monthly Revenue","Hours","Resource Cost","Profit","Margin %","Status"].map((h,i)=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:i>=3&&i<=9?"right":i>=10?"center":"left",fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.length===0
                          ?<tr><td colSpan={12} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No closed month data available yet</td></tr>
                          :rows.map((r,i)=>(
                            <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                              <td style={{padding:"7px 10px",fontWeight:600,fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.month}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.client_name}</td>
                              <td style={{padding:"7px 10px",fontSize:11,fontFamily:"monospace",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.contract_number}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.contract_value.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.start_date}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.end_date}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,fontWeight:600,color:"#059669",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.monthly_retainer.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",fontSize:12,borderBottom:"1px solid #f1f5f9"}}>{r.allocated_hours}h</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,color:"#d97706",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.resource_cost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:r.profit>=0?"#059669":"#dc2626",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.profit.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.margin)}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={r.status==="Active"?"#d1fae5":"#f1f5f9"} color={r.status==="Active"?"#059669":"#64748b"}>{r.status}</Bdg></td>
                            </tr>
                          ))
                        }
                        <tr style={{background:"#e2e8f0",fontWeight:700}}>
                          <td colSpan={3} style={{padding:"8px 10px",fontSize:12}}>Totals</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12}}>{rows.reduce((s,r)=>s+r.contract_value,0).toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td colSpan={2} style={{padding:"8px 10px"}}/>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,color:"#059669"}}>{totRev.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{totHours}h</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,color:"#d97706"}}>{totCost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:totProfit>=0?"#059669":"#dc2626"}}>{totProfit.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td style={{padding:"8px 10px",textAlign:"center"}}><Bdg bg="#e2e8f0" color="#475569">{avgMargin}%</Bdg></td>
                          <td style={{padding:"8px 10px"}}/>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}

          {/* Employee Utilization */}
          {customTab==="employee-utilization"&&(()=>{
            const als=(ALLOCS_BY_MONTH[selUtilMonth]||[]);
            const availMonths=[...new Set(Object.keys(ALLOCS_BY_MONTH))].sort().reverse();
            const rows=EMPLOYEES_INIT.map(emp=>{
              const empAls=als.filter(a=>a.eid===emp.id);
              const ah=empAls.reduce((s,a)=>s+a.h,0);
              const avail=HPM-ah;
              const pct=Math.round((ah/HPM)*100);
              const hr=Math.round(emp.mc/HPM);
              const cost=Math.round(hr*ah);
              const contracts=[...new Set(empAls.map(a=>a.client_name).filter(Boolean))];
              return{...emp,ah,avail,pct,hr,cost,contracts,over:ah>HPM};
            }).sort((a,b)=>b.pct-a.pct);
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:"#64748b"}}>Month:</span>
                    <Sel value={selUtilMonth} onChange={setSelUtilMonth} options={availMonths.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                  </div>
                  <ExportBtn label="⬇ Export Excel" onClick={()=>exportCSV(rows.map(r=>[selUtilMonth,r.name,r.department?.replace(" Department",""),r.ah,r.avail,r.pct,r.hr,r.cost,r.contracts.join(", "),r.over?"Yes":"No"]),["Month","Employee","Dept","Alloc Hrs","Avail Hrs","Util%","Hourly Cost","Resource Cost","Contracts","Overalloc"],"employee-util.csv")}/>
                </div>
                <Card style={{overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a"}}>Employee Utilization — {fmtLong(selUtilMonth)}</p></div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr>
                        {["Employee Name","Department","Allocated Hrs","Available Hrs","Utilization %","Hourly Cost","Resource Cost","Contracts Worked On","Overallocated"].map((h,i)=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:i>=2&&i<=6?"center":i===7?"left":"center",fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map((r,i)=>{
                          const utilBg=r.pct>100?"#fee2e2":r.pct>=80?"#d1fae5":r.pct>=50?"#fef9c3":"#f1f5f9";
                          const utilCol=r.pct>100?"#dc2626":r.pct>=80?"#059669":r.pct>=50?"#d97706":"#64748b";
                          return(
                            <tr key={r.id} style={{background:r.over?"#fff5f5":i%2===0?"#fff":"#f8fafc"}}>
                              <td style={{padding:"7px 10px",fontWeight:600,fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.name}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.department?.replace(" Department","")}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{r.ah}h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{r.avail}h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={utilBg} color={utilCol}>{r.pct}%</Bdg></td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.hr)}/h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",color:"#d97706",borderBottom:"1px solid #f1f5f9"}}>{r.cost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",fontSize:11,color:"#475569",borderBottom:"1px solid #f1f5f9"}}>{r.contracts.length>0?r.contracts.join(", "):<span style={{color:"#94a3b8"}}>None</span>}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={r.over?"#ef4444":"#f1f5f9"} color={r.over?"#fff":"#64748b"}>{r.over?"Yes":"No"}</Bdg></td>
                            </tr>
                          );
                        })}
                        <tr style={{background:"#e2e8f0",fontWeight:700}}>
                          <td style={{padding:"8px 10px",fontSize:12}}>Totals</td>
                          <td style={{padding:"8px 10px"}}/>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{rows.reduce((s,r)=>s+r.ah,0)}h</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{rows.reduce((s,r)=>s+r.avail,0)}h</td>
                          <td style={{padding:"8px 10px",textAlign:"center"}}><Bdg bg="#e2e8f0" color="#475569">{rows.length>0?Math.round(rows.reduce((s,r)=>s+r.pct,0)/rows.length):0}% avg</Bdg></td>
                          <td style={{padding:"8px 10px"}}/>
                          <td style={{padding:"8px 10px",textAlign:"center",color:"#d97706",fontSize:12}}>{rows.reduce((s,r)=>s+r.cost,0).toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td colSpan={2} style={{padding:"8px 10px"}}/>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}

          {/* Department Performance */}
          {customTab==="department-performance"&&(()=>{
            const als=(ALLOCS_BY_MONTH[selDeptMonth]||[]);
            const availMonths=[...new Set(Object.keys(ALLOCS_BY_MONTH))].sort().reverse();
            const em={};
            EMPLOYEES_INIT.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
            const ac=CONTRACTS.filter(c=>isActive(c,selDeptMonth));
            const rows=["Client Servicing Department","Production Department","Creative Department","Planning Department"].map(dept=>{
              const shortName=dept.replace(" Department","");
              const deptEmps=EMPLOYEES_INIT.filter(e=>e.department===dept);
              const deptAls=als.filter(a=>em[a.eid]?.department===dept);
              const totalHours=deptAls.reduce((s,a)=>s+a.h,0);
              const totalCost=Math.round(deptAls.reduce((s,a)=>{const e=em[a.eid];return s+(e?e.hr*a.h:0);},0));
              const key=dept.includes("Client")?"bcs":dept.includes("Prod")?"bp":dept.includes("Creat")?"bc":"bpl";
              const totalBudget=Math.round(ac.reduce((s,c)=>s+(c[key]||0)/c.tm,0));
              const util=deptEmps.length>0?Math.round((totalHours/(deptEmps.length*HPM))*100):0;
              const profit=totalBudget-totalCost;
              return{dept:shortName,empCount:deptEmps.length,totalHours,totalCost,totalBudget,util,profit,margin:totalBudget>0?Math.round((profit/totalBudget)*100):0};
            });
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:"#64748b"}}>Month:</span>
                    <Sel value={selDeptMonth} onChange={setSelDeptMonth} options={availMonths.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                  </div>
                  <ExportBtn label="⬇ Export Excel" onClick={()=>exportCSV(rows.map(r=>[r.dept,r.empCount,r.totalHours,r.util,r.totalBudget,r.totalCost,r.profit,r.margin]),["Dept","Employees","Hours","Util%","Budget","Cost","Profit","Margin%"],"dept-performance.csv")}/>
                </div>
                <Card style={{padding:18}}>
                  <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Department Performance — {fmtLong(selDeptMonth)}</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={rows} margin={{top:5,right:20,left:10,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                      <XAxis dataKey="dept" tick={{fontSize:10,fill:"#64748b"}}/>
                      <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                      <Tooltip formatter={v=>typeof v==="number"&&v>100?SAR(v):`${v}`} contentStyle={{borderRadius:8,border:"none"}}/>
                      <Legend wrapperStyle={{fontSize:11}}/>
                      <Bar dataKey="totalBudget" name="Budget" fill="#10b981" radius={[3,3,0,0]}/>
                      <Bar dataKey="totalCost"   name="Cost"   fill="#f59e0b" radius={[3,3,0,0]}/>
                      <Bar dataKey="profit"      name="Profit" fill="#6366f1" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{overflowX:"auto",marginTop:16}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>
                        <th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155"}}>Department</th>
                        {["Employees","Total Hours","Utilization %","Budget (SAR)","Actual Cost","Profit","Margin %"].map(h=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:"center",fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{rows.map((r,i)=>(
                        <tr key={r.dept} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                          <td style={{padding:"8px 10px",fontWeight:600,fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{r.dept}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{r.empCount}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{r.totalHours}h</td>
                          <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.util)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{SAR(r.totalBudget)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,color:"#d97706",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.totalCost)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,fontWeight:700,color:r.profit>=0?"#059669":"#dc2626",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.profit)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.margin)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY CLOSE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

// Pre-seeded closed snapshots (Jan–Mar 2026 already closed)
const MC_SNAPSHOTS_INIT = [
  {id:"s1", month:"2026-01",contract_id:"ct1",contract_number:"CTR-2026-001",client_name:"SABIC",        monthly_retainer:40000,resource_cost:28000,profit:12000,allocated_hours:264,is_closed:true,closed_date:"2026-02-01"},
  {id:"s2", month:"2026-01",contract_id:"ct2",contract_number:"CTR-2026-002",client_name:"Saudi Aramco", monthly_retainer:30000,resource_cost:24000,profit:6000, allocated_hours:238,is_closed:true,closed_date:"2026-02-01"},
  {id:"s3", month:"2026-01",contract_id:"ct3",contract_number:"CTR-2026-003",client_name:"Almarai",      monthly_retainer:20000,resource_cost:12000,profit:8000, allocated_hours:170,is_closed:true,closed_date:"2026-02-01"},
  {id:"s4", month:"2026-02",contract_id:"ct1",contract_number:"CTR-2026-001",client_name:"SABIC",        monthly_retainer:40000,resource_cost:30000,profit:10000,allocated_hours:270,is_closed:true,closed_date:"2026-03-01"},
  {id:"s5", month:"2026-02",contract_id:"ct2",contract_number:"CTR-2026-002",client_name:"Saudi Aramco", monthly_retainer:30000,resource_cost:22000,profit:8000, allocated_hours:220,is_closed:true,closed_date:"2026-03-01"},
  {id:"s6", month:"2026-02",contract_id:"ct3",contract_number:"CTR-2026-003",client_name:"Almarai",      monthly_retainer:20000,resource_cost:14000,profit:6000, allocated_hours:175,is_closed:true,closed_date:"2026-03-01"},
  {id:"s7", month:"2026-02",contract_id:"ct4",contract_number:"CTR-2026-004",client_name:"STC",          monthly_retainer:30000,resource_cost:19000,profit:11000,allocated_hours:218,is_closed:true,closed_date:"2026-03-01"},
  {id:"s8", month:"2026-03",contract_id:"ct1",contract_number:"CTR-2026-001",client_name:"SABIC",        monthly_retainer:40000,resource_cost:31000,profit:9000, allocated_hours:276,is_closed:true,closed_date:"2026-04-01"},
  {id:"s9", month:"2026-03",contract_id:"ct2",contract_number:"CTR-2026-002",client_name:"Saudi Aramco", monthly_retainer:30000,resource_cost:25000,profit:5000, allocated_hours:248,is_closed:true,closed_date:"2026-04-01"},
  {id:"s10",month:"2026-03",contract_id:"ct3",contract_number:"CTR-2026-003",client_name:"Almarai",      monthly_retainer:20000,resource_cost:11000,profit:9000, allocated_hours:160,is_closed:true,closed_date:"2026-04-01"},
  {id:"s11",month:"2026-03",contract_id:"ct4",contract_number:"CTR-2026-004",client_name:"STC",          monthly_retainer:30000,resource_cost:18000,profit:12000,allocated_hours:210,is_closed:true,closed_date:"2026-04-01"},
  {id:"s12",month:"2026-03",contract_id:"ct5",contract_number:"PRJ-2026-001",client_name:"Mobily",       monthly_retainer:30000,resource_cost:22000,profit:8000, allocated_hours:264,is_closed:true,closed_date:"2026-04-01"},
];

const MC_MONTHS = Array.from({length:12},(_,i)=>{
  const v=`2026-${String(i+1).padStart(2,"0")}`;
  const l=new Date(2026,i,1).toLocaleString("en-US",{month:"long",year:"numeric"});
  return {v,l};
});

function MonthlyClosePage(){
  const {sb}=useAuth();
  const [snapshots,setSnapshots]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    sb.from('monthly_snapshots').select('*').order('month',{ascending:false}).then(({data})=>{if(data)setSnapshots(data);setLoading(false);});
  },[]);
  const dbBulkAdd=async items=>{const{data}=await sb.from('monthly_snapshots').insert(items.map(s=>({month:s.month,contract_id:s.contract_id,contract_number:s.contract_number,client_name:s.client_name,monthly_retainer:s.monthly_retainer,resource_cost:s.resource_cost,profit:s.profit,allocated_hours:s.allocated_hours,is_closed:true}))).select();if(data)setSnapshots(p=>[...p,...data]);};
  const dbDelete=async month=>{await sb.from('monthly_snapshots').delete().eq('month',month);setSnapshots(p=>p.filter(s=>s.month!==month));};
  const [previewModal,setPreviewModal]   = useState(false);
  const [detailModal,setDetailModal]     = useState(false);
  const [empModal,setEmpModal]           = useState(false);
  const [closingMonth,setClosingMonth]   = useState(null);
  const [previewData,setPreviewData]     = useState([]);
  const [detailMonth,setDetailMonth]     = useState(null);
  const [empMonth,setEmpMonth]           = useState(null);
  const [blockError,setBlockError]       = useState(null);

  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const isMonthClosed = m => snapshots.some(s=>s.month===m&&s.is_closed);
  const isPast = m => new Date(m+"-01") < currentMonthStart;

  const latestClosed = useMemo(()=>{
    const closed=[...new Set(snapshots.filter(s=>s.is_closed).map(s=>s.month))].sort().reverse();
    return closed[0]||null;
  },[snapshots]);

  // Build preview data from mock allocs + contracts
  const buildPreview = (month) => {
    const als = ALLOCS_BY_MONTH[month]||[];
    const em  = {};
    EMPLOYEES_INIT.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
    return MOCK_CONTRACTS_FULL.filter(c=>isActive(c,month)&&c.st==="Active").map(c=>{
      let rc=0,ah=0;
      als.filter(a=>a.cid===c.cid).forEach(a=>{
        const e=em[a.eid];
        rc+=(e?e.hr:0)*a.h;
        ah+=a.h;
      });
      const mr=c.cv/c.tm;
      return{contract_id:c.id,contract_number:c.contract_number,client_name:c.cn,month,
        resource_cost:Math.round(rc),allocated_hours:ah,monthly_retainer:Math.round(mr),
        profit:Math.round(mr-rc),is_closed:true,closed_date:new Date().toISOString()};
    });
  };

  const handlePreview = (month) => {
    setBlockError(null);
    setPreviewData(buildPreview(month));
    setClosingMonth(month);
    setPreviewModal(true);
  };

  const handleConfirmClose = async() => {
    setBlockError(null);
    // Revenue recognition check
    for(const item of previewData){
      const c=MOCK_CONTRACTS_FULL.find(x=>x.id===item.contract_id);
      if(!c) continue;
      const prev=snapshots.filter(s=>s.contract_id===item.contract_id).reduce((s,x)=>s+(x.monthly_retainer||0),0);
      if(prev+item.monthly_retainer > c.cv+0.01){
        setBlockError({client_name:item.client_name,contract_number:item.contract_number,total:prev+item.monthly_retainer,cv:c.cv});
        return;
      }
    }
    await dbBulkAdd(previewData);
    setPreviewModal(false);
    setClosingMonth(null);
    alert(`✅ ${MC_MONTHS.find(m=>m.v===closingMonth)?.l} closed successfully.`);
  };

  const handleDeleteMonth = async (month) => {
    if(!window.confirm(`Delete close data for ${MC_MONTHS.find(m=>m.v===month)?.l}? This cannot be undone.`)) return;
    await dbDelete(month);
  };

  const handleViewEmployees = (month) => {
    setEmpMonth(month);
    setEmpModal(true);
  };

  // Summary of closed months
  const closedSummary = useMemo(()=>{
    const map={};
    snapshots.forEach(s=>{
      if(!map[s.month]) map[s.month]={month:s.month,totalRetainer:0,totalCost:0,totalProfit:0,contracts:0};
      map[s.month].totalRetainer+=s.monthly_retainer||0;
      map[s.month].totalCost+=s.resource_cost||0;
      map[s.month].totalProfit+=s.profit||0;
      map[s.month].contracts++;
    });
    return Object.values(map).sort((a,b)=>b.month.localeCompare(a.month));
  },[snapshots]);

  // Employee breakdown for a closed month
  const getEmpBreakdown = (month) => {
    const als = ALLOCS_BY_MONTH[month]||[];
    const em  = {};
    EMPLOYEES_INIT.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
    const map = {};
    als.forEach(a=>{
      if(!map[a.eid]) map[a.eid]={name:EMPLOYEES_INIT.find(e=>e.id===a.eid)?.name||"—",department:(EMPLOYEES_INIT.find(e=>e.id===a.eid)?.department||"—").replace(" Department",""),totalHours:0,totalCost:0,clients:[]};
      const e=em[a.eid];
      map[a.eid].totalHours+=a.h;
      map[a.eid].totalCost+=(e?e.hr:0)*a.h;
      map[a.eid].clients.push(a.client_name);
    });
    return Object.values(map).sort((a,b)=>b.totalCost-a.totalCost);
  };

  const marginBadge=(v)=>{const bg=v<0?"#fee2e2":v<20?"#fef9c3":"#d1fae5";const col=v<0?"#dc2626":v<20?"#d97706":"#059669";return <Bdg bg={bg} color={col}>{v.toFixed(1)}%</Bdg>;};
  const TH=({children,align="left"})=><th style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TD=({children,align="left",style={}})=><td style={{padding:"9px 13px",textAlign:align,fontSize:13,borderBottom:"1px solid #f1f5f9",...style}}>{children}</td>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Monthly Financial Close</h1>
        <p style={{fontSize:13,color:"#64748b",marginTop:3}}>Lock historical financial data for accurate reporting</p>
      </div>

      {/* 2026 Month Grid */}
      <Card style={{padding:20}}>
        <p style={{margin:"0 0 14px",fontWeight:700,fontSize:15,color:"#0f172a"}}>2026 Months</p>
        {/* Warning banner */}
        <div style={{padding:"12px 16px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,marginBottom:16,display:"flex",gap:10}}>
          <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
          <div>
            <p style={{margin:0,fontWeight:600,fontSize:13,color:"#92400e"}}>Important</p>
            <p style={{margin:"3px 0 0",fontSize:12,color:"#a16207"}}>You can only close past months. Closing a month will freeze all resource costs, allocations, and reset employee hours to {HPM} for the next period.</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {MC_MONTHS.map(m=>{
            const closed=isMonthClosed(m.v);
            const past=isPast(m.v);
            const canClose=past&&!closed;
            const canDelete=closed&&m.v===latestClosed;
            return(
              <div key={m.v} style={{padding:16,border:`1px solid ${closed?"#a7f3d0":"#e2e8f0"}`,borderRadius:12,background:closed?"#f0fdf4":"#fff",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:16}}>{closed?"🔒":"📅"}</span>
                  <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a"}}>{m.l}</p>
                </div>
                {closed&&<Bdg bg="#d1fae5" color="#059669">Closed</Bdg>}
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:"auto"}}>
                  {closed?(
                    <>
                      <Btn variant="outline" size="sm" onClick={()=>{setDetailMonth(m.v);setDetailModal(true);}} style={{width:"100%",justifyContent:"center"}}>👁 View</Btn>
                      {canDelete&&<Btn variant="danger" size="sm" onClick={()=>handleDeleteMonth(m.v)} style={{width:"100%",justifyContent:"center"}}>🗑 Delete</Btn>}
                    </>
                  ):(
                    <Btn variant={canClose?"primary":"outline"} size="sm" onClick={()=>canClose&&handlePreview(m.v)} disabled={!canClose} style={{width:"100%",justifyContent:"center",opacity:canClose?1:0.45}}>
                      🔒 Close
                    </Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Closed Months History */}
      <Card style={{overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9"}}>
          <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a"}}>Closed Months History</p>
        </div>
        {closedSummary.length===0?(
          <div style={{textAlign:"center",padding:"48px",color:"#94a3b8"}}>
            <div style={{fontSize:40,marginBottom:12}}>📅</div>
            <p style={{fontSize:14}}>No months closed yet</p>
          </div>
        ):(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                <TH>Month</TH><TH align="center">Contracts</TH>
                <TH align="right">Total Retainer</TH><TH align="right">Total Cost</TH>
                <TH align="right">Net Profit</TH><TH align="center">Margin</TH><TH align="center">Actions</TH>
              </tr></thead>
              <tbody>{closedSummary.map(m=>{
                const margin=m.totalRetainer>0?(m.totalProfit/m.totalRetainer)*100:0;
                return(
                  <tr key={m.month}>
                    <TD><div style={{display:"flex",alignItems:"center",gap:7}}><span>🔒</span><strong>{fmtLong(m.month)}</strong></div></TD>
                    <TD align="center">{m.contracts}</TD>
                    <TD align="right" style={{color:"#059669",fontWeight:600}}>{SAR(m.totalRetainer)}</TD>
                    <TD align="right" style={{color:"#d97706"}}>{SAR(m.totalCost)}</TD>
                    <TD align="right" style={{fontWeight:700,color:m.totalProfit>=0?"#059669":"#dc2626"}}>{SAR(m.totalProfit)}</TD>
                    <TD align="center">{marginBadge(margin)}</TD>
                    <TD align="center">
                      <div style={{display:"flex",justifyContent:"center",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>{setDetailMonth(m.month);setDetailModal(true);}}>👁</Btn>
                        <Btn variant="ghost" size="sm" onClick={()=>handleViewEmployees(m.month)}>👥</Btn>
                        {m.month===latestClosed&&<Btn variant="danger" size="sm" onClick={()=>handleDeleteMonth(m.month)}>🗑</Btn>}
                      </div>
                    </TD>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Preview / Confirm Close Modal */}
      <Modal open={previewModal} onClose={()=>{setPreviewModal(false);setBlockError(null);}} title={`Confirm Monthly Close — ${MC_MONTHS.find(m=>m.v===closingMonth)?.l||""}`}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{padding:"10px 14px",background:"#f8fafc",borderRadius:9}}>
            <p style={{margin:0,fontSize:13,color:"#475569"}}>The following data will be frozen. Employee hours reset to {HPM} for the next period.</p>
          </div>
          <div style={{maxHeight:320,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:9}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                <TH>Contract</TH><TH>Client</TH><TH align="right">Hours</TH>
                <TH align="right">Cost</TH><TH align="right">Retainer</TH><TH align="right">Profit</TH>
              </tr></thead>
              <tbody>{previewData.map((item,i)=>(
                <tr key={i}>
                  <td style={{padding:"7px 13px",fontFamily:"monospace",fontSize:11,borderBottom:"1px solid #f1f5f9"}}>{item.contract_number}</td>
                  <TD>{item.client_name}</TD>
                  <TD align="right">{item.allocated_hours}h</TD>
                  <TD align="right" style={{color:"#d97706"}}>{SAR(item.resource_cost)}</TD>
                  <TD align="right" style={{color:"#059669"}}>{SAR(item.monthly_retainer)}</TD>
                  <TD align="right" style={{fontWeight:700,color:item.profit>=0?"#059669":"#dc2626"}}>{SAR(item.profit)}</TD>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {previewData.length===0&&<p style={{textAlign:"center",color:"#94a3b8",fontSize:13}}>No active contracts with allocations found for this month.</p>}
          {blockError&&(
            <div style={{padding:"12px 16px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:9}}>
              <p style={{margin:"0 0 6px",fontWeight:700,fontSize:13,color:"#dc2626"}}>⛔ Monthly Close Blocked — Over-Recognition Detected</p>
              <p style={{margin:0,fontSize:12,color:"#dc2626"}}><strong>{blockError.client_name}</strong> ({blockError.contract_number}): Total recognized would be <strong>SAR {blockError.total.toLocaleString("en-US",{maximumFractionDigits:0})}</strong>, exceeding contract value of <strong>SAR {blockError.cv.toLocaleString("en-US",{maximumFractionDigits:0})}</strong>.</p>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={()=>{setPreviewModal(false);setBlockError(null);}}>Cancel</Btn>
            <Btn variant="primary" disabled={!!blockError} onClick={handleConfirmClose}>🔒 Confirm Close</Btn>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={()=>setDetailModal(false)} title={`${detailMonth?fmtLong(detailMonth):""} — Detailed Breakdown`}>
        <div style={{maxHeight:480,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <TH>Contract ID</TH><TH>Client</TH><TH align="right">Hours</TH>
              <TH align="right">Cost</TH><TH align="right">Retainer</TH>
              <TH align="right">Profit</TH><TH align="center">Margin</TH>
            </tr></thead>
            <tbody>{snapshots.filter(s=>s.month===detailMonth).map((s,i)=>{
              const margin=s.monthly_retainer>0?(s.profit/s.monthly_retainer)*100:0;
              return(
                <tr key={i}>
                  <td style={{padding:"8px 13px",fontFamily:"monospace",fontSize:11,borderBottom:"1px solid #f1f5f9"}}>{s.contract_number}</td>
                  <TD><strong>{s.client_name}</strong></TD>
                  <TD align="right">{s.allocated_hours}h</TD>
                  <TD align="right" style={{color:"#d97706"}}>{SAR(s.resource_cost)}</TD>
                  <TD align="right" style={{color:"#059669"}}>{SAR(s.monthly_retainer)}</TD>
                  <TD align="right" style={{fontWeight:700,color:s.profit>=0?"#059669":"#dc2626"}}>{SAR(s.profit)}</TD>
                  <TD align="center">{marginBadge(margin)}</TD>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </Modal>

      {/* Employee Breakdown Modal */}
      <Modal open={empModal} onClose={()=>setEmpModal(false)} title={`${empMonth?fmtLong(empMonth):""} — Employee Breakdown`}>
        <div style={{maxHeight:480,overflowY:"auto"}}>
          {getEmpBreakdown(empMonth||"").length===0
            ?<p style={{textAlign:"center",color:"#94a3b8",padding:"32px 0",fontSize:13}}>No allocations found for this month</p>
            :(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <TH>Employee</TH><TH>Department</TH><TH>Clients</TH>
                  <TH align="right">Hours</TH><TH align="right">Cost</TH><TH align="right">Utilization</TH>
                </tr></thead>
                <tbody>{getEmpBreakdown(empMonth||"").map((e,i)=>{
                  const util=(e.totalHours/HPM)*100;
                  const ub=util>=100?"#d1fae5":util>=50?"#fef9c3":"#fee2e2";
                  const uc=util>=100?"#059669":util>=50?"#d97706":"#dc2626";
                  return(
                    <tr key={i}>
                      <TD><strong>{e.name}</strong></TD>
                      <TD><Bdg bg="#f1f5f9" color="#475569">{e.department}</Bdg></TD>
                      <TD style={{fontSize:12,color:"#64748b"}}>{[...new Set(e.clients)].join(", ")||"—"}</TD>
                      <TD align="right">{e.totalHours}h</TD>
                      <TD align="right" style={{color:"#d97706"}}>{SAR(Math.round(e.totalCost))}</TD>
                      <TD align="right"><Bdg bg={ub} color={uc}>{util.toFixed(0)}%</Bdg></TD>
                    </tr>
                  );
                })}</tbody>
              </table>
            )
          }
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT/PROJECT EXPENSES PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const EXPENSE_TYPES = ["Freelancer","Production","Vendor","Other"];
const EXP_TYPE_COLORS = {Freelancer:"#6366f1",Production:"#f59e0b",Vendor:"#10b981",Other:"#94a3b8"};

const MOCK_EXPENSES_INIT = [
  {id:"ex1", expense_number:"EXP-2026-001", request_date:"2026-01-15", contract_id:"ct1", contract_number:"CTR-2026-001", client_name:"SABIC",        contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:480000, contract_notes:"Annual brand retainer.", expense_type:"Vendor",      vendor_name:"Al Madar Print",      department:"Production Department",       amount:18000, previous_requested_total_amount:0,      project_profit_pct:"96.25", bill_number:"INV-2026-001", bill_date:"2026-01-14", item_details:"Large format printing for SABIC campaign",     notes:"Approved by manager", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex2", expense_number:"EXP-2026-002", request_date:"2026-01-20", contract_id:"ct2", contract_number:"CTR-2026-002", client_name:"Saudi Aramco",  contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-05-15", total_contract_value:360000, contract_notes:"",                   expense_type:"Freelancer",  vendor_name:"Ahmad Al-Shammari",    department:"Creative Department",         amount:12000, previous_requested_total_amount:0,      project_profit_pct:"96.67", bill_number:"INV-2026-002", bill_date:"2026-01-19", item_details:"Freelance motion graphics for Aramco brand",   notes:"Motion designer contract", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex3", expense_number:"EXP-2026-003", request_date:"2026-02-05", contract_id:"ct1", contract_number:"CTR-2026-001", client_name:"SABIC",        contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:480000, contract_notes:"Annual brand retainer.", expense_type:"Production",  vendor_name:"Studio One Media",    department:"Production Department",       amount:25000, previous_requested_total_amount:18000,  project_profit_pct:"91.04", bill_number:"INV-2026-003", bill_date:"2026-02-04", item_details:"Video production — Q1 brand film",              notes:"Approved by CEO", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex4", expense_number:"EXP-2026-004", request_date:"2026-02-12", contract_id:"ct3", contract_number:"CTR-2026-003", client_name:"Almarai",      contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:240000, contract_notes:"Includes seasonal campaigns.", expense_type:"Vendor",  vendor_name:"NeonSigns Arabia",    department:"Creative Department",         amount:9500,  previous_requested_total_amount:0,      project_profit_pct:"96.04", bill_number:"INV-2026-004", bill_date:"2026-02-11", item_details:"LED display rental for Ramadan activation",     notes:"Seasonal activation", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex5", expense_number:"EXP-2026-005", request_date:"2026-03-01", contract_id:"ct4", contract_number:"CTR-2026-004", client_name:"STC",          contract_category:"Retainer", contract_start_date:"2026-02-01", contract_end_date:"2026-07-31", total_contract_value:180000, contract_notes:"",                   expense_type:"Freelancer",  vendor_name:"Layla Barakat Studio", department:"Creative Department",         amount:8000,  previous_requested_total_amount:0,      project_profit_pct:"95.56", bill_number:"INV-2026-005", bill_date:"2026-02-28", item_details:"Illustration pack — STC social media",          notes:"3 rounds of revision included", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex6", expense_number:"EXP-2026-006", request_date:"2026-03-10", contract_id:"ct5", contract_number:"PRJ-2026-001", client_name:"Mobily",       contract_category:"Project",  contract_start_date:"2026-03-01", contract_end_date:"2026-06-25", total_contract_value:90000,  contract_notes:"Brand refresh project.", expense_type:"Production", vendor_name:"Reel Productions",     department:"Production Department",       amount:15000, previous_requested_total_amount:0,      project_profit_pct:"83.33", bill_number:"INV-2026-006", bill_date:"2026-03-09", item_details:"Brand film shoot — 2 days",                      notes:"Includes equipment hire", status:"Draft",    attachment_url:"", attachment_name:""},
  {id:"ex7", expense_number:"EXP-2026-007", request_date:"2026-03-18", contract_id:"ct2", contract_number:"CTR-2026-002", client_name:"Saudi Aramco",  contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-05-15", total_contract_value:360000, contract_notes:"",                   expense_type:"Other",       vendor_name:"Riyadh Events Co",    department:"Client Servicing Department", amount:6500,  previous_requested_total_amount:12000,  project_profit_pct:"93.75", bill_number:"INV-2026-007", bill_date:"2026-03-17", item_details:"Client event logistics & catering",             notes:"Q1 client appreciation event", status:"Draft", attachment_url:"", attachment_name:""},
];

function calcProfitPct(total,prev,amount){
  const t=parseFloat(total)||0,p=parseFloat(prev)||0,a=parseFloat(amount)||0;
  if(t<=0) return "";
  return (((t-p-a)/t)*100).toFixed(2);
}

const EMPTY_EXP_FORM = {
  expense_number:"",request_date:new Date().toISOString().slice(0,10),
  contract_id:"",contract_number:"",client_name:"",contract_category:"",
  contract_start_date:"",contract_end_date:"",total_contract_value:"",contract_notes:"",
  expense_type:"",vendor_name:"",amount:"",previous_requested_total_amount:"",
  project_profit_pct:"",department:"",item_details:"",
  bill_number:"",bill_date:"",attachment_url:"",attachment_name:"",notes:"",status:"Draft"
};

// Inline ExpenseCharts
function ExpenseCharts({expenses}){
  if(!expenses.length) return null;
  const byContract=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{
      const k=e.contract_number||"Unknown";
      if(!m[k]) m[k]={contract:k,total:0,approved:0,draft:0};
      m[k].total+=e.amount||0;
      if(e.status==="Approved") m[k].approved+=e.amount||0;
      else m[k].draft+=e.amount||0;
    });
    return Object.values(m).sort((a,b)=>b.total-a.total).slice(0,8);
  },[expenses]);
  const byType=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{const t=e.expense_type||"Other";m[t]=(m[t]||0)+(e.amount||0);});
    return Object.entries(m).map(([name,value])=>({name,value}));
  },[expenses]);
  const byDept=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{const d=(e.department||"Unknown").replace(" Department","");m[d]=(m[d]||0)+(e.amount||0);});
    return Object.entries(m).map(([dept,total])=>({dept,total})).sort((a,b)=>b.total-a.total);
  },[expenses]);
  const profitData=useMemo(()=>{
    const m={};
    expenses.forEach(e=>{
      const k=e.contract_number||"Unknown";
      if(!m[k]) m[k]={contract:k,profits:[]};
      if(e.project_profit_pct!=null&&e.project_profit_pct!=="") m[k].profits.push(parseFloat(e.project_profit_pct));
    });
    return Object.values(m).map(({contract,profits})=>({contract,avg_profit:profits.length?parseFloat((profits.reduce((a,b)=>a+b,0)/profits.length).toFixed(1)):null})).filter(d=>d.avg_profit!==null);
  },[expenses]);
  const fmt=v=>`SAR ${Number(v||0).toLocaleString()}`;
  const EXP_COLORS=["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#8b5cf6"];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card style={{padding:16,gridColumn:"1/-1"}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Expenses by Contract (Approved vs Draft)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byContract} margin={{top:4,right:12,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="contract" tick={{fontSize:10,fill:"#64748b"}}/>
            <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:"none"}}/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[3,3,0,0]}/>
            <Bar dataKey="draft"    name="Draft"    fill="#f59e0b" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{padding:16}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Expense Distribution by Type</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
              {byType.map((e,i)=><Cell key={i} fill={EXP_TYPE_COLORS[e.name]||EXP_COLORS[i%EXP_COLORS.length]}/>)}
            </Pie>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:"none"}}/>
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{padding:16}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Expenses by Department</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDept} layout="vertical" margin={{top:4,right:12,left:8,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <YAxis type="category" dataKey="dept" tick={{fontSize:10,fill:"#64748b"}} width={88}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:"none"}}/>
            <Bar dataKey="total" name="Total" fill="#6366f1" radius={[0,3,3,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {profitData.length>0&&(
        <Card style={{padding:16,gridColumn:"1/-1"}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a"}}>Average Profit % by Contract</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={profitData} margin={{top:4,right:12,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="contract" tick={{fontSize:10,fill:"#64748b"}}/>
              <YAxis tick={{fontSize:10,fill:"#64748b"}} unit="%" domain={[0,100]}/>
              <Tooltip formatter={v=>`${v}%`} contentStyle={{borderRadius:8,border:"none"}}/>
              <Bar dataKey="avg_profit" name="Avg Profit %">
                {profitData.map((e,i)=><Cell key={i} fill={e.avg_profit>=30?"#10b981":e.avg_profit>=10?"#f59e0b":"#ef4444"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

function ContractExpensesPage(){
  const {sb}=useAuth();
  const [expenses,setExpenses]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    sb.from('contract_expenses').select('*').order('created_at',{ascending:false}).then(({data})=>{if(data)setExpenses(data);setLoading(false);});
  },[]);
  const dbAdd=async p=>{const{data}=await sb.from('contract_expenses').insert([p]).select().single();if(data)setExpenses(x=>[data,...x]);};
  const dbUpdate=async(id,p)=>{const{data}=await sb.from('contract_expenses').update(p).eq('id',id).select().single();if(data)setExpenses(x=>x.map(e=>e.id===id?data:e));};
  const dbDelete=async id=>{await sb.from('contract_expenses').delete().eq('id',id);setExpenses(x=>x.filter(e=>e.id!==id));};
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [form,setForm]           = useState(EMPTY_EXP_FORM);
  const [search,setSearch]       = useState("");
  const [contractFilter,setContractFilter] = useState("all");

  const genExpNum=()=>{
    const y=new Date().getFullYear();
    const nums=expenses.map(e=>e.expense_number).filter(n=>n&&n.startsWith(`EXP-${y}-`)).map(n=>parseInt(n.split("-")[2])||0);
    return `EXP-${y}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,"0")}`;
  };

  const handleContractSelect=cid=>{
    const c=MOCK_CONTRACTS_FULL.find(x=>x.id===cid);
    if(!c) return;
    const prev=expenses.filter(e=>e.contract_id===cid&&e.id!==editing?.id).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    setForm(p=>{
      const n={...p,contract_id:c.id,contract_number:c.contract_number,client_name:c.cn,
        contract_category:c.contract_category||"Retainer",contract_start_date:c.sd,contract_end_date:c.ed,
        total_contract_value:c.cv,contract_notes:c.notes||"",previous_requested_total_amount:prev};
      n.project_profit_pct=calcProfitPct(n.total_contract_value,n.previous_requested_total_amount,n.amount);
      return n;
    });
  };

  const updF=(k,v)=>setForm(p=>{
    const n={...p,[k]:v};
    n.project_profit_pct=calcProfitPct(n.total_contract_value,n.previous_requested_total_amount,n.amount);
    return n;
  });

  const openAdd=()=>{setEditing(null);setForm(EMPTY_EXP_FORM);setModalOpen(true);};
  const openEdit=e=>{setEditing(e);setForm({...EMPTY_EXP_FORM,...e});setModalOpen(true);};
  const close=()=>{setModalOpen(false);setEditing(null);};

  const handleSubmit=async e=>{
    e.preventDefault();
    const payload={...form,amount:parseFloat(form.amount)||0,previous_requested_total_amount:parseFloat(form.previous_requested_total_amount)||0,total_contract_value:parseFloat(form.total_contract_value)||0,project_profit_pct:parseFloat(form.project_profit_pct)||0};
    if(editing){
      await dbUpdate(editing.id,payload);
    } else {
      await dbAdd({...payload,expense_number:genExpNum()});
    }
    close();
  };

  const del=id=>{if(window.confirm("Delete this expense?"))dbDelete(id);};

  const filteredForCards=useMemo(()=>contractFilter==="all"?expenses:expenses.filter(e=>e.contract_id===contractFilter),[expenses,contractFilter]);
  const totalExp=filteredForCards.reduce((s,e)=>s+(e.amount||0),0);
  const approvedExp=filteredForCards.filter(e=>e.status==="Approved").reduce((s,e)=>s+(e.amount||0),0);
  const draftExp=filteredForCards.filter(e=>e.status==="Draft").reduce((s,e)=>s+(e.amount||0),0);
  const byTypeCards=EXPENSE_TYPES.map(type=>({type,total:filteredForCards.filter(e=>e.expense_type===type).reduce((s,e)=>s+(e.amount||0),0)}));

  const filtered=expenses.filter(e=>!search||
    e.client_name?.toLowerCase().includes(search.toLowerCase())||
    e.vendor_name?.toLowerCase().includes(search.toLowerCase())||
    e.expense_type?.toLowerCase().includes(search.toLowerCase())||
    e.contract_number?.toLowerCase().includes(search.toLowerCase()));

  const profitColor=pct=>{const n=parseFloat(pct);if(isNaN(n))return"#64748b";if(n>=30)return"#059669";if(n>=10)return"#d97706";return"#dc2626";};
  const statusBg=s=>s==="Approved"?{bg:"#d1fae5",col:"#059669"}:{bg:"#fef9c3",col:"#d97706"};

  const isFormValid=form.contract_id&&form.expense_type&&form.vendor_name&&form.amount&&form.department&&form.item_details&&form.bill_number&&form.bill_date&&form.notes;

  // unique contracts with expenses for filter dropdown
  const contractsWithExpenses=[...new Map(expenses.map(e=>[e.contract_id,{id:e.contract_id,label:`${e.contract_number} — ${e.client_name}`}])).values()];

  const TH=({children,align="left"})=><th style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TD=({children,align="left",style={}})=><td style={{padding:"9px 13px",textAlign:align,fontSize:12,borderBottom:"1px solid #f1f5f9",...style}}>{children}</td>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Contract/Project Expenses</h1>
          <p style={{fontSize:13,color:"#64748b",marginTop:3}}>Track and manage expenses per contract/project</p>
        </div>
        <Btn variant="primary" onClick={openAdd}>＋ Add Expense</Btn>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {/* Total */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💰</div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b"}}>Total Expenses</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#0f172a"}}>{SAR(totalExp)}</p></div>
          </div>
        </Card>
        {/* Approved */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✅</div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b"}}>Approved</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#059669"}}>{SAR(approvedExp)}</p></div>
          </div>
        </Card>
        {/* Draft */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#fef9c3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📝</div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b"}}>Draft</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#d97706"}}>{SAR(draftExp)}</p></div>
          </div>
        </Card>
        {/* By Type */}
        <Card style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{margin:0,fontSize:11,color:"#64748b"}}>By Type</p>
            <Sel value={contractFilter} onChange={setContractFilter}
              options={[{v:"all",l:"All Contracts"},...contractsWithExpenses.map(c=>({v:c.id,l:c.label}))]}
              style={{width:160,fontSize:11,padding:"3px 8px"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {byTypeCards.map(({type,total})=>(
              <div key={type} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#64748b"}}>{type}</span>
                <span style={{fontWeight:600,color:"#0f172a"}}>{SAR(total)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <ExpenseCharts expenses={expenses}/>

      {/* Search */}
      <div style={{position:"relative",maxWidth:320}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..."
          style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
      </div>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <TH>Expense #</TH><TH>Request Date</TH><TH>Contract</TH><TH>Client</TH>
              <TH>Type</TH><TH>Vendor</TH><TH>Department</TH><TH>Bill Date</TH>
              <TH align="right">Amount (SAR)</TH><TH align="right">Profit %</TH>
              <TH align="center">Status</TH><TH align="right">Actions</TH>
            </tr></thead>
            <tbody>
              {filtered.map((e,idx)=>{
                const sb=statusBg(e.status);
                return(
                  <tr key={e.id} style={{background:idx%2===0?"#fff":"#fafafa"}}>
                    <td style={{padding:"9px 13px",fontFamily:"monospace",fontSize:11,fontWeight:600,color:"#475569",borderBottom:"1px solid #f1f5f9"}}>{e.expense_number||"—"}</td>
                    <TD style={{fontSize:11,color:"#64748b"}}>{e.request_date||"—"}</TD>
                    <td style={{padding:"9px 13px",fontFamily:"monospace",fontSize:11,color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{e.contract_number||"—"}</td>
                    <TD><strong>{e.client_name}</strong></TD>
                    <TD><Bdg bg={EXP_TYPE_COLORS[e.expense_type]+"22"} color={EXP_TYPE_COLORS[e.expense_type]||"#64748b"}>{e.expense_type}</Bdg></TD>
                    <TD>{e.vendor_name||"—"}</TD>
                    <TD style={{fontSize:11,color:"#64748b"}}>{e.department?.replace(" Department","")||"—"}</TD>
                    <TD style={{fontSize:11}}>{e.bill_date||"—"}</TD>
                    <TD align="right" style={{fontWeight:700}}>{Number(e.amount||0).toLocaleString()}</TD>
                    <TD align="right" style={{fontWeight:700,color:profitColor(e.project_profit_pct)}}>{e.project_profit_pct!=null&&e.project_profit_pct!==""?`${e.project_profit_pct}%`:"—"}</TD>
                    <TD align="center"><Bdg bg={sb.bg} color={sb.col}>{e.status}</Bdg></TD>
                    <TD align="right">
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(e)}>✏️</Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(e.id)}>🗑</Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{textAlign:"center",padding:"48px",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>🧾</div><p style={{fontSize:14}}>No expenses found</p></div>}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editing?"Edit Expense":"Add New Expense"}>
        <form onSubmit={handleSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {/* Expense # + Date */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Expense Number</Lbl><input value={editing?form.expense_number||"—":"Auto-generated on save"} readOnly style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"monospace",color:"#94a3b8",background:"#f8fafc",boxSizing:"border-box"}}/></div>
              <div><Lbl>Request Date *</Lbl><Inp type="date" value={form.request_date} onChange={e=>updF("request_date",e.target.value)} required/></div>
            </div>
            {/* Contract selector */}
            <div><Lbl>Contract *</Lbl>
              <Sel value={form.contract_id} onChange={handleContractSelect}
                options={[{v:"",l:"Select a contract..."},...MOCK_CONTRACTS_FULL.map(c=>({v:c.id,l:`${c.contract_number} — ${c.cn}`}))]}
                style={{opacity:editing?.contract_id?0.6:1}}/>
            </div>
            {/* Read-only contract info */}
            {form.contract_id&&(
              <div style={{padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em"}}>Contract Details (Read Only)</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Contract Number",form.contract_number],["Customer Name",form.client_name],["Category",form.contract_category],["Total Value (SAR)",Number(form.total_contract_value||0).toLocaleString()],["Start Date",form.contract_start_date],["End Date",form.contract_end_date]].map(([l,v])=>(
                    <div key={l}><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{l}</p><p style={{margin:"1px 0 0",fontSize:13,fontWeight:600,color:"#0f172a"}}>{v||"—"}</p></div>
                  ))}
                  {form.contract_notes&&<div style={{gridColumn:"1/-1"}}><p style={{margin:0,fontSize:10,color:"#94a3b8"}}>Contract Notes</p><p style={{margin:"1px 0 0",fontSize:13,color:"#475569"}}>{form.contract_notes}</p></div>}
                </div>
              </div>
            )}
            {/* Editable fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Expense Type *</Lbl><Sel value={form.expense_type} onChange={v=>updF("expense_type",v)} options={[{v:"",l:"Select type..."},...EXPENSE_TYPES.map(t=>({v:t,l:t}))]}/></div>
              <div><Lbl>Department *</Lbl><Sel value={form.department} onChange={v=>updF("department",v)} options={[{v:"",l:"Select department..."},...ALLOC_DEPTS.map(d=>({v:d,l:d}))]}/></div>
              <div><Lbl>Vendor Name *</Lbl><Inp value={form.vendor_name} onChange={e=>updF("vendor_name",e.target.value)} placeholder="Vendor name..." required/></div>
              <div><Lbl>Amount (SAR) *</Lbl><Inp type="number" min="0" value={form.amount} onChange={e=>updF("amount",e.target.value)} placeholder="0" required/></div>
              <div><Lbl>Previous Requested Total</Lbl><input value={form.previous_requested_total_amount} readOnly style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#64748b",background:"#f8fafc",boxSizing:"border-box"}}/><p style={{margin:"3px 0 0",fontSize:10,color:"#94a3b8"}}>Auto-calculated from existing expenses</p></div>
              <div><Lbl>Bill Number *</Lbl><Inp value={form.bill_number} onChange={e=>updF("bill_number",e.target.value)} placeholder="INV-001..." required/></div>
              <div><Lbl>Bill Date *</Lbl><Inp type="date" value={form.bill_date} onChange={e=>updF("bill_date",e.target.value)} required/></div>
              <div><Lbl>Status</Lbl><Sel value={form.status} onChange={v=>updF("status",v)} options={[{v:"Draft",l:"Draft"},{v:"Approved",l:"Approved"}]}/></div>
            </div>
            <div><Lbl>Item Details *</Lbl><Inp value={form.item_details} onChange={e=>updF("item_details",e.target.value)} placeholder="Describe the expense item..." required/></div>
            <div><Lbl>Notes *</Lbl><textarea value={form.notes} onChange={e=>updF("notes",e.target.value)} placeholder="Additional notes..." rows={2} required style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
            {/* Profit calc */}
            {form.contract_id&&(
              <div style={{padding:"12px 16px",background:"#f8fafc",borderRadius:10,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📈</div>
                <div>
                  <p style={{margin:0,fontSize:11,color:"#64748b",fontWeight:600}}>Project Profit % (Auto-calculated)</p>
                  <p style={{margin:"2px 0 0",fontSize:20,fontWeight:800,color:profitColor(form.project_profit_pct)}}>{form.project_profit_pct!==""&&form.project_profit_pct!=null?`${form.project_profit_pct}%`:"—"}</p>
                  <p style={{margin:0,fontSize:10,color:"#94a3b8"}}>= (Contract Value − Previous − Amount) ÷ Contract Value × 100</p>
                </div>
              </div>
            )}
            {/* Attachment placeholder */}
            <div><Lbl>Attachment</Lbl>
              <div style={{border:"2px dashed #e2e8f0",borderRadius:10,padding:"16px 20px",textAlign:"center",color:"#94a3b8",cursor:"not-allowed"}}>
                <p style={{margin:0,fontSize:13}}>📎 Click to upload PDF attachment</p>
                <p style={{margin:"4px 0 0",fontSize:11}}>(File upload available in deployed version)</p>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
              <Btn variant="outline" onClick={close}>Cancel</Btn>
              <Btn variant="primary" type="submit" disabled={!isFormValid}>{editing?"Update":"Save Expense"}</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM USERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const SU_ENTITIES = [
  {name:"Dashboard",        key:"dashboard",       desc:"Financial & team overview"},
  {name:"Employees",        key:"employees",       desc:"Team member data & costs"},
  {name:"Clients",          key:"clients",         desc:"Client information"},
  {name:"Contracts",        key:"contracts",       desc:"Contract values & terms"},
  {name:"Allocations",      key:"allocations",     desc:"Time allocations"},
  {name:"Reports",          key:"reports",         desc:"Analytics & exports"},
  {name:"Monthly Close",    key:"monthlyClose",    desc:"Financial month-end close"},
  {name:"Contract Expenses",key:"contractExpenses",desc:"Project expense tracking"},
  {name:"System Users",     key:"systemUsers",     desc:"Users & permissions"},
];

const SU_DEPTS = ["Client Servicing Department","Creative Department","Production Department","Planning Department"];

const DEFAULT_PERMS = Object.fromEntries(
  SU_ENTITIES.map(e=>[e.key,{view:false,create:false,edit:false,delete:false}])
);

const MOCK_ROLES_INIT = [
  {id:"r1", role_name:"Finance Manager",
    permissions:{
      dashboard:{view:true,create:false,edit:false,delete:false},
      employees:{view:true,create:false,edit:false,delete:false},
      clients:{view:true,create:false,edit:false,delete:false},
      contracts:{view:true,create:true,edit:true,delete:false},
      allocations:{view:true,create:false,edit:false,delete:false},
      reports:{view:true,create:true,edit:true,delete:false},
      monthlyClose:{view:true,create:true,edit:true,delete:false},
      contractExpenses:{view:true,create:true,edit:true,delete:false},
      systemUsers:{view:false,create:false,edit:false,delete:false},
    },
    allowed_departments:[],
    assigned_users:["sarah@company.com","faisal@company.com"],
  },
  {id:"r2", role_name:"Production Lead",
    permissions:{
      dashboard:{view:true,create:false,edit:false,delete:false},
      employees:{view:true,create:false,edit:true,delete:false},
      clients:{view:true,create:false,edit:false,delete:false},
      contracts:{view:true,create:false,edit:false,delete:false},
      allocations:{view:true,create:true,edit:true,delete:true},
      reports:{view:true,create:false,edit:false,delete:false},
      monthlyClose:{view:false,create:false,edit:false,delete:false},
      contractExpenses:{view:true,create:true,edit:true,delete:false},
      systemUsers:{view:false,create:false,edit:false,delete:false},
    },
    allowed_departments:["Production Department"],
    assigned_users:["lena@company.com"],
  },
  {id:"r3", role_name:"Viewer",
    permissions:{
      dashboard:{view:true,create:false,edit:false,delete:false},
      employees:{view:true,create:false,edit:false,delete:false},
      clients:{view:true,create:false,edit:false,delete:false},
      contracts:{view:true,create:false,edit:false,delete:false},
      allocations:{view:true,create:false,edit:false,delete:false},
      reports:{view:true,create:false,edit:false,delete:false},
      monthlyClose:{view:false,create:false,edit:false,delete:false},
      contractExpenses:{view:true,create:false,edit:false,delete:false},
      systemUsers:{view:false,create:false,edit:false,delete:false},
    },
    allowed_departments:[],
    assigned_users:["khalid@company.com","omar@company.com"],
  },
];

const MOCK_USERS_INIT = [
  {id:"u1", full_name:"Abdul Wahab Shaikh", email:"abdulwahab@company.com", role:"admin",   status:"active",  isPending:false, departments:[]},
  {id:"u2", full_name:"Sarah Al-Rashidi",   email:"sarah@company.com",      role:"manager", status:"active",  isPending:false, departments:["Production Department","Creative Department"]},
  {id:"u3", full_name:"Faisal Qureshi",     email:"faisal@company.com",     role:"manager", status:"active",  isPending:false, departments:[]},
  {id:"u4", full_name:"Lena Barakat",       email:"lena@company.com",       role:"manager", status:"active",  isPending:false, departments:["Production Department"]},
  {id:"u5", full_name:"Khalid Nasser",      email:"khalid@company.com",     role:"manager", status:"active",  isPending:false, departments:[]},
  {id:"u6", full_name:"",                   email:"omar@company.com",       role:"manager", status:"invited", isPending:true,  departments:[]},
  {id:"u7", full_name:"",                   email:"nadia@company.com",      role:"manager", status:"invited", isPending:true,  departments:[]},
];

function SystemUsersPage(){
  const {sb,profile:currentProfile}=useAuth();
  const [tab,setTab]=useState("users");
  const [users,setUsers]=useState([]);
  const [roles,setRoles]=useState([]);
  const [suLoading,setSuLoading]=useState(true);
  useEffect(()=>{
    Promise.all([
      sb.from('profiles').select('*').order('full_name'),
      sb.from('role_permissions').select('*').order('role_name')
    ]).then(([{data:u},{data:r}])=>{
      if(u) setUsers(u.map(p=>({...p,id:p.id,full_name:p.full_name||"",email:p.email||"",role:p.role||"manager",status:"active",isPending:false,departments:p.departments||[]})));
      if(r) setRoles(r);
      setSuLoading(false);
    });
  },[]);
  const dbSaveRole=async(payload,id)=>{
    if(id){const{data}=await sb.from('role_permissions').update(payload).eq('id',id).select().single();if(data)setRoles(p=>p.map(r=>r.id===id?data:r));}
    else{const{data}=await sb.from('role_permissions').insert([payload]).select().single();if(data)setRoles(p=>[...p,data]);}
  };
  const dbDeleteRole=async id=>{await sb.from('role_permissions').delete().eq('id',id);setRoles(p=>p.filter(r=>r.id!==id));};
  const dbInviteUser=async(email,roleId)=>{
    const{error}=await sb.auth.admin.inviteUserByEmail(email);
    if(!error&&roleId){
      const role=roles.find(r=>r.id===roleId);
      if(role)await sb.from('role_permissions').update({assigned_users:[...(role.assigned_users||[]),email]}).eq('id',roleId);
    }
    return{error};
  };
  const dbUpdateUser=async(id,payload)=>{const{data}=await sb.from('profiles').update(payload).eq('id',id).select().single();if(data)setUsers(p=>p.map(u=>u.id===id?{...u,...data}:u));};
  const dbDeleteUser=async id=>{setUsers(p=>p.filter(u=>u.id!==id));};
  const [inviteEmail,setInviteEmail]   = useState("");
  const [inviteRoleId,setInviteRoleId] = useState("");
  const [roleModal,setRoleModal]       = useState(false);
  const [editingRole,setEditingRole]   = useState(null);
  const [roleForm,setRoleForm]         = useState({role_name:"",permissions:{...DEFAULT_PERMS},allowed_departments:[],assigned_users:[]});
  const [editUserModal,setEditUserModal] = useState(false);
  const [editingUser,setEditingUser]   = useState(null);
  const [editUserForm,setEditUserForm] = useState({full_name:"",email:"",departments:[]});
  const [sk,setSk] = useState("full_name");
  const [sd,setSd] = useState("asc");

  const sortedUsers = useMemo(()=>[...users].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[users,sk,sd]);
  const sortFn=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  // Role dialog helpers
  const openCreateRole=()=>{setEditingRole(null);setRoleForm({role_name:"",permissions:{...DEFAULT_PERMS},allowed_departments:[],assigned_users:[]});setRoleModal(true);};
  const openEditRole=r=>{setEditingRole(r);setRoleForm({role_name:r.role_name,permissions:{...DEFAULT_PERMS,...r.permissions},allowed_departments:r.allowed_departments||[],assigned_users:r.assigned_users||[]});setRoleModal(true);};
  const closeRoleModal=()=>{setRoleModal(false);setEditingRole(null);};

  const togglePerm=(entityKey,perm,val)=>{
    setRoleForm(p=>{
      const cur=p.permissions[entityKey]||{};
      const upd={...cur,[perm]:val};
      if(perm==="view"&&!val) upd.create=false,upd.edit=false,upd.delete=false;
      return{...p,permissions:{...p.permissions,[entityKey]:upd}};
    });
  };
  const toggleFullAccess=(entityKey,val)=>{
    setRoleForm(p=>({...p,permissions:{...p.permissions,[entityKey]:{view:val,create:val,edit:val,delete:val}}}));
  };
  const toggleDept=(dept,val)=>{
    setRoleForm(p=>({...p,allowed_departments:val?[...p.allowed_departments,dept]:p.allowed_departments.filter(d=>d!==dept)}));
  };

  const handleSaveRole=async()=>{
    if(!roleForm.role_name.trim()){alert("Please enter a role name.");return;}
    await dbSaveRole(roleForm, editingRole?.id||null);
    closeRoleModal();
  };
  const deleteRole=async id=>{if(window.confirm("Delete this role?"))await dbDeleteRole(id);};

  // Invite user
  const handleInvite=async e=>{
    e.preventDefault();
    if(!inviteEmail){alert("Enter an email address.");return;}
    if(!inviteRoleId){alert("Select a role before inviting.");return;}
    if(users.find(u=>u.email===inviteEmail)){alert("User already exists.");return;}
    const{error}=await dbInviteUser(inviteEmail,inviteRoleId);
    if(error){alert(`Failed: ${error.message}`);return;}
    alert(`✅ Invitation sent to ${inviteEmail}`);
    setInviteEmail(""); setInviteRoleId("");
    const{data}=await sb.from('role_permissions').select('*');
    if(data)setRoles(data);
  };

  // Edit user
  const openEditUser=u=>{setEditingUser(u);setEditUserForm({full_name:u.full_name||"",email:u.email||"",departments:u.departments||[]});setEditUserModal(true);};
  const handleSaveUser=async()=>{
    if(!editUserForm.email){alert("Email is required.");return;}
    await dbUpdateUser(editingUser.id,{full_name:editUserForm.full_name,email:editUserForm.email,departments:editUserForm.departments});
    setEditUserModal(false);
  };
  const deleteUser=async u=>{
    if(u.role==="admin"){alert("Cannot delete admin users.");return;}
    if(window.confirm("Delete this user?"))await dbDeleteUser(u.id);
  };
  const resendInvite=email=>alert(`✉️ Activation email resent to ${email}`);
  const assignRole=(userEmail,newRoleId,curRoleId)=>{
    setRoles(p=>p.map(r=>{
      if(r.id===curRoleId) return{...r,assigned_users:(r.assigned_users||[]).filter(e=>e!==userEmail)};
      if(r.id===newRoleId&&newRoleId!=="none") return{...r,assigned_users:[...(r.assigned_users||[]),userEmail]};
      return r;
    }));
  };

  const TH=({children,align="left"})=><th style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TD=({children,align="left",style={}})=><td style={{padding:"9px 13px",textAlign:align,fontSize:13,borderBottom:"1px solid #f1f5f9",...style}}>{children}</td>;

  const CURRENT_USER = users.find(u=>u.role==="admin");

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>System Users</h1>
        <p style={{fontSize:13,color:"#64748b",marginTop:3}}>Manage users and role permissions</p>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:4,maxWidth:340}}>
        {[["users","👥 Users"],["roles","🛡 Role Permissions"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:tab===v?"#fff":"transparent",fontWeight:tab===v?700:500,fontSize:13,color:tab===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:tab===v?"0 1px 3px rgba(0,0,0,.1)":"none"}}>{l}</button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab==="users"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Invite card */}
          <Card style={{padding:20}}>
            <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",display:"flex",alignItems:"center",gap:8}}>➕ Invite New User</p>
            <form onSubmit={handleInvite} style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
                placeholder="Enter email address" required
                style={{flex:1,minWidth:200,padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none"}}/>
              <Sel value={inviteRoleId} onChange={setInviteRoleId}
                options={[{v:"",l:roles.length===0?"No roles — create one first":"Select role (required)"},...roles.map(r=>({v:r.id,l:r.role_name}))]}
                style={{width:200,borderColor:!inviteRoleId?"#fca5a5":"#e2e8f0"}}/>
              <Btn variant="primary" type="submit">✉️ Send Invite</Btn>
            </form>
          </Card>

          {/* User list */}
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9"}}>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a"}}>User Management</p>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <SortTh k="full_name" sk={sk} sd={sd} onSort={sortFn}>User</SortTh>
                  <SortTh k="email"     sk={sk} sd={sd} onSort={sortFn}>Email</SortTh>
                  <SortTh k="status"    sk={sk} sd={sd} onSort={sortFn}>Status</SortTh>
                  <SortTh k="role"      sk={sk} sd={sd} onSort={sortFn}>System Role</SortTh>
                  <TH>Assigned Role</TH>
                  <TH>Departments</TH>
                  <TH align="center">Actions</TH>
                </tr></thead>
                <tbody>{sortedUsers.map((u,idx)=>{
                  const assignedRole=roles.find(r=>r.assigned_users?.includes(u.email));
                  const statusBg=u.status==="active"?"#d1fae5":"#fef9c3";
                  const statusCol=u.status==="active"?"#059669":"#d97706";
                  const statusLabel=u.status==="active"?"Active":"Pending Invitation";
                  return(
                    <tr key={u.id} style={{background:idx%2===0?"#fff":"#fafafa"}}>
                      <TD>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:9,background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#475569",flexShrink:0}}>
                            {(u.full_name||u.email||"U").charAt(0).toUpperCase()}
                          </div>
                          <span style={{fontWeight:600}}>{u.full_name||"—"}</span>
                        </div>
                      </TD>
                      <TD style={{color:"#64748b"}}>{u.email}</TD>
                      <TD><Bdg bg={statusBg} color={statusCol}>{statusLabel}</Bdg></TD>
                      <TD><Bdg bg={u.role==="admin"?"#e0e7ff":"#f1f5f9"} color={u.role==="admin"?"#4f46e5":"#475569"}>{u.role==="admin"?"Admin":"Manager"}</Bdg></TD>
                      <TD>
                        {u.role!=="admin"?(
                          <select value={assignedRole?.id||"none"} onChange={e=>assignRole(u.email,e.target.value,assignedRole?.id)}
                            style={{padding:"5px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,color:"#0f172a",background:"#fff",cursor:"pointer",width:150}}>
                            <option value="none">No role</option>
                            {roles.map(r=><option key={r.id} value={r.id}>{r.role_name}</option>)}
                          </select>
                        ):<span style={{fontSize:12,color:"#94a3b8"}}>Full access</span>}
                      </TD>
                      <TD>
                        {u.departments?.length>0
                          ?<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{u.departments.map(d=><Bdg key={d} bg="#f1f5f9" color="#475569">{d.replace(" Department","")}</Bdg>)}</div>
                          :<span style={{fontSize:12,color:"#94a3b8"}}>None</span>}
                      </TD>
                      <TD align="center">
                        <div style={{display:"flex",justifyContent:"center",gap:4}}>
                          {!u.isPending&&u.email!==CURRENT_USER?.email&&<Btn variant="ghost" size="sm" title="Impersonate" style={{color:"#7c3aed"}} onClick={()=>alert(`Now viewing as ${u.full_name||u.email}`)}>👁</Btn>}
                          <Btn variant="ghost" size="sm" onClick={()=>openEditUser(u)} title="Edit">✏️</Btn>
                          {u.status==="invited"&&<Btn variant="ghost" size="sm" style={{color:"#2563eb"}} onClick={()=>resendInvite(u.email)} title="Resend invite">✉️</Btn>}
                          {u.role!=="admin"&&<Btn variant="danger" size="sm" onClick={()=>deleteUser(u)} title="Delete">🗑</Btn>}
                        </div>
                      </TD>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </Card>

          {/* Your Account card */}
          <Card style={{padding:20}}>
            <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a"}}>Your Account</p>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:56,height:56,borderRadius:14,background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#475569",flexShrink:0}}>
                {(CURRENT_USER?.full_name||CURRENT_USER?.email||"A").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:16,color:"#0f172a"}}>{CURRENT_USER?.full_name||"Admin"}</p>
                <p style={{margin:"2px 0 6px",fontSize:13,color:"#64748b"}}>{CURRENT_USER?.email||"admin@company.com"}</p>
                <Bdg bg="#e0e7ff" color="#4f46e5">Admin</Bdg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {tab==="roles"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a"}}>Role Permissions</p><p style={{margin:"2px 0 0",fontSize:12,color:"#64748b"}}>Define what each role can access</p></div>
            <Btn variant="primary" onClick={openCreateRole}>＋ Create Role</Btn>
          </div>

          {roles.length===0?(
            <Card style={{padding:48,textAlign:"center",color:"#94a3b8"}}>
              <div style={{fontSize:40,marginBottom:12}}>🛡</div>
              <p style={{fontSize:14,fontWeight:600,color:"#64748b"}}>No roles created yet</p>
              <p style={{fontSize:12,marginTop:4}}>Create a role to define permissions for your team</p>
            </Card>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {roles.map(role=>(
                <Card key={role.id} style={{padding:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:"#e0e7ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🛡</div>
                      <div>
                        <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a"}}>{role.role_name}</p>
                        <p style={{margin:"1px 0 0",fontSize:12,color:"#64748b"}}>{role.assigned_users?.length||0} users assigned</p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <Btn variant="ghost" size="sm" onClick={()=>openEditRole(role)}>✏️</Btn>
                      <Btn variant="danger" size="sm" onClick={()=>deleteRole(role.id)}>🗑</Btn>
                    </div>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>
                        <th style={{padding:"7px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",width:160}}>Module</th>
                        {["View","Create","Edit","Delete"].map(h=><th key={h} style={{padding:"7px 12px",textAlign:"center",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",width:80}}>{h}</th>)}
                      </tr></thead>
                      <tbody>{SU_ENTITIES.map((ent,i)=>{
                        const p=role.permissions?.[ent.key]||{};
                        return(
                          <tr key={ent.key} style={{background:i%2===0?"#fff":"#fafafa"}}>
                            <td style={{padding:"7px 12px",fontWeight:600,fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{ent.name}</td>
                            {["view","create","edit","delete"].map(perm=>(
                              <td key={perm} style={{padding:"7px 12px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                                {p[perm]?<span style={{color:"#059669",fontSize:16}}>✓</span>:<span style={{color:"#e2e8f0"}}>—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                  {role.allowed_departments?.length>0&&(
                    <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:12,color:"#64748b"}}>Dept Access:</span>
                      {role.allowed_departments.map(d=><Bdg key={d} bg="#dbeafe" color="#1d4ed8">{d.replace(" Department","")}</Bdg>)}
                    </div>
                  )}
                  {role.assigned_users?.length>0&&(
                    <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:12,color:"#64748b"}}>Assigned:</span>
                      {role.assigned_users.map(e=><Bdg key={e} bg="#f1f5f9" color="#475569">{e}</Bdg>)}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT ROLE MODAL ── */}
      <Modal open={roleModal} onClose={closeRoleModal} title={editingRole?"Edit Role":"Create New Role"}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><Lbl>Role Name *</Lbl><Inp value={roleForm.role_name} onChange={e=>setRoleForm(p=>({...p,role_name:e.target.value}))} placeholder="e.g. Sales Manager, Viewer"/></div>

          {/* Permissions matrix */}
          <div>
            <Lbl>Permissions</Lbl>
            <div style={{border:"1px solid #e2e8f0",borderRadius:9,overflow:"hidden",marginTop:6}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <th style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",width:150}}>Module</th>
                  <th style={{padding:"8px 12px",textAlign:"center",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",width:90}}>Full Access</th>
                  {["View","Create","Edit","Delete"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"center",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",width:72}}>{h}</th>)}
                </tr></thead>
                <tbody>{SU_ENTITIES.map((ent,i)=>{
                  const p=roleForm.permissions[ent.key]||{};
                  const full=p.view&&p.create&&p.edit&&p.delete;
                  return(
                    <tr key={ent.key} style={{background:i%2===0?"#fff":"#fafafa"}}>
                      <td style={{padding:"8px 12px",borderBottom:"1px solid #f1f5f9"}}>
                        <p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a"}}>{ent.name}</p>
                        <p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{ent.desc}</p>
                      </td>
                      <td style={{padding:"8px 12px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                        <input type="checkbox" checked={full} onChange={e=>toggleFullAccess(ent.key,e.target.checked)} style={{accentColor:"#0f172a",width:14,height:14,cursor:"pointer"}}/>
                      </td>
                      {["view","create","edit","delete"].map(perm=>(
                        <td key={perm} style={{padding:"8px 12px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                          <input type="checkbox" checked={!!p[perm]}
                            disabled={perm!=="view"&&!p.view}
                            onChange={e=>togglePerm(ent.key,perm,e.target.checked)}
                            style={{accentColor:"#0f172a",width:14,height:14,cursor:perm!=="view"&&!p.view?"not-allowed":"pointer",opacity:perm!=="view"&&!p.view?0.35:1}}/>
                        </td>
                      ))}
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>

          {/* Department access */}
          <div>
            <Lbl>Employee Department Access</Lbl>
            <p style={{margin:"2px 0 8px",fontSize:11,color:"#94a3b8"}}>Leave all unchecked to allow all departments.</p>
            <div style={{border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
              {SU_DEPTS.map(dept=>(
                <label key={dept} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:7,cursor:"pointer",background:"#fff"}}>
                  <input type="checkbox" checked={roleForm.allowed_departments.includes(dept)} onChange={e=>toggleDept(dept,e.target.checked)} style={{accentColor:"#0f172a",width:14,height:14,cursor:"pointer"}}/>
                  <span style={{fontSize:13,color:"#0f172a"}}>{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={closeRoleModal}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSaveRole}>💾 {editingRole?"Update Role":"Create Role"}</Btn>
          </div>
        </div>
      </Modal>

      {/* ── EDIT USER MODAL ── */}
      <Modal open={editUserModal} onClose={()=>setEditUserModal(false)} title="Edit User">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Lbl>Full Name</Lbl><Inp value={editUserForm.full_name} onChange={e=>setEditUserForm(p=>({...p,full_name:e.target.value}))} placeholder="Enter full name"/></div>
          <div><Lbl>Email *</Lbl><Inp type="email" value={editUserForm.email} onChange={e=>setEditUserForm(p=>({...p,email:e.target.value}))} placeholder="Enter email"/></div>
          <div>
            <Lbl>Departments</Lbl>
            <p style={{margin:"2px 0 8px",fontSize:11,color:"#94a3b8"}}>Select departments this user has access to</p>
            <div style={{border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
              {SU_DEPTS.map(dept=>(
                <label key={dept} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:7,cursor:"pointer"}}>
                  <input type="checkbox" checked={editUserForm.departments.includes(dept)} onChange={e=>setEditUserForm(p=>({...p,departments:e.target.checked?[...p.departments,dept]:p.departments.filter(d=>d!==dept)}))} style={{accentColor:"#0f172a",width:14,height:14,cursor:"pointer"}}/>
                  <span style={{fontSize:13,color:"#0f172a"}}>{dept}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={()=>setEditUserModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSaveUser}>💾 Save Changes</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMING SOON PLACEHOLDER
// ═══════════════════════════════════════════════════════════════════════════════
function ComingSoon({page}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,color:"#94a3b8"}}>
      <div style={{fontSize:56,marginBottom:16}}>🚧</div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#475569",margin:"0 0 8px"}}>{page}</h2>
      <p style={{fontSize:14,margin:0}}>This page will be built next</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PLATFORM SHELL
// ═══════════════════════════════════════════════════════════════════════════════
function PlatformApp(){
  const {session,profile,signOut,sb} = useAuth();
  const [activePage,setActivePage]=useState("Dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const renderPage=()=>{
    if(activePage==="Dashboard")    return <DashboardPage/>;
    if(activePage==="Employees")    return <EmployeesPage/>;
    if(activePage==="Clients")      return <ClientsPage/>;
    if(activePage==="Contracts")    return <ContractsPage/>;
    if(activePage==="Allocations")  return <AllocationsPage/>;
    if(activePage==="Reports")      return <ReportsPage/>;
    if(activePage==="MonthlyClose")  return <MonthlyClosePage/>;
    if(activePage==="ContractExpenses") return <ContractExpensesPage/>;
    if(activePage==="Settings")         return <SystemUsersPage/>;
    return <ComingSoon page={NAV.find(n=>n.id===activePage)?.label||activePage}/>;
  };

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Inter',system-ui,sans-serif",background:"#f8fafc",overflow:"hidden"}}>

      {/* Sidebar */}
      <aside style={{width:240,background:"#fff",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
        {/* Logo */}
        <div style={{padding:"18px 20px",borderBottom:"1px solid #f1f5f9"}}>
          <p style={{margin:0,fontWeight:800,fontSize:15,color:"#0f172a"}}>Team Utilization</p>
          <p style={{margin:"2px 0 0",fontSize:11,color:"#94a3b8"}}>Allocation Dashboard</p>
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:2}}>
          {NAV.map(item=>{
            const active=activePage===item.id;
            return(
              <button key={item.id} onClick={()=>setActivePage(item.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:"none",background:active?"#0f172a":"transparent",color:active?"#fff":"#64748b",cursor:"pointer",fontSize:13,fontWeight:active?600:500,textAlign:"left",transition:"background .15s",width:"100%"}}>
                <span style={{fontSize:15,opacity:active?1:.7}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {active&&<span style={{fontSize:12,opacity:.7}}>›</span>}
              </button>
            );
          })}
        </nav>
        {/* User */}
        <div style={{padding:"12px 14px",borderTop:"1px solid #f1f5f9"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>
              {(profile?.full_name||profile?.email||"U").charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1,overflow:"hidden"}}>
              <p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.full_name||"User"}</p>
              <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>{profile?.role==="admin"?"Admin":"Manager"}</p>
            </div>
          </div>
          <button onClick={signOut} style={{width:"100%",padding:"7px",borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontSize:12,cursor:"pointer",fontWeight:500}}>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{flex:1,overflowY:"auto",padding:24}}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function Platform(){
  return(
    <AuthProvider>
      <PlatformRoot/>
    </AuthProvider>
  );
}

function PlatformRoot(){
  const {session} = useAuth();
  if(session===undefined) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a"}}>
      <div style={{color:"#fff",fontSize:14,opacity:.7}}>Loading…</div>
    </div>
  );
  if(!session) return <LoginPage/>;
  return <PlatformApp/>;
}