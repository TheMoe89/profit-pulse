import React, { useState, useMemo, useCallback, useEffect, useContext, createContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie, LineChart, Line } from "recharts";
import {
  LayoutDashboard, Users, Building2, FileText, FolderKanban, TrendingUp, Calendar, Receipt, UserCog,
  Wallet, Coins, BarChart3, ClipboardList, FileCheck,
  AlertTriangle, TrendingDown, CalendarClock, UserPlus,
  Search, Pencil, Trash2, Eye, X, Check, ChevronRight,
  Mail, Phone, Lock, Unlock, PieChart as PieChartIcon, Filter,
  Clock, Building, Plus, Save, ShieldCheck, AlertCircle, Send,
  ShieldAlert, ShieldOff, Construction, FileWarning, User,
  Upload, Download, Paperclip, FileSpreadsheet,
  CheckCircle, Info, Loader
} from "lucide-react";

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
const ToastContext = React.createContext(null);
function ToastProvider({children}){
  const [toasts,setToasts]=useState([]);
  const addToast=React.useCallback((msg,type="success",undo=null)=>{
    const id=Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type,undo}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000);
    return id;
  },[]);
  const removeToast=React.useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  const icons={success:<CheckCircle size={15}/>,error:<AlertCircle size={15}/>,warning:<AlertTriangle size={15}/>,info:<Info size={15}/>};
  const bgs={success:"#f0fdf4",error:"#fef2f2",warning:"#fffbeb",info:"#f0f9ff"};
  const borders={success:"#a7f3d0",error:"#fecaca",warning:"#fde68a",info:"#bae6fd"};
  const iconColors={success:"#008A57",error:"#ef4444",warning:"#d97706",info:"#0ea5e9"};
  return(
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:320,pointerEvents:"none"}}>
        {toasts.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",borderRadius:10,background:bgs[t.type],border:`1px solid ${borders[t.type]}`,boxShadow:"0 4px 16px rgba(0,0,0,.1)",pointerEvents:"all",animation:"toastIn .2s ease-out"}}>
            <div style={{flexShrink:0,marginTop:1,color:iconColors[t.type]}}>{icons[t.type]}</div>
            <span style={{flex:1,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{t.msg}</span>
            {t.undo&&<button onClick={()=>{t.undo();removeToast(t.id);}} style={{fontSize:11,fontWeight:700,color:iconColors[t.type],background:"none",border:"none",cursor:"pointer",padding:"0 4px",flexShrink:0,whiteSpace:"nowrap"}}>Undo</button>}
            <button onClick={()=>removeToast(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0,opacity:.5,color:"#0f172a"}}><X size={13}/></button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes fadeSwapIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  );
}
const useToast=()=>React.useContext(ToastContext);

// ─── CONFIRM DIALOG ────────────────────────────────────────────────────────────
const ConfirmContext = React.createContext(null);
function ConfirmProvider({children}){
  const [state,setState]=useState(null);
  const confirm=React.useCallback((opts)=>new Promise(resolve=>{
    setState({...opts,resolve});
  }),[]);
  const handle=ok=>{state?.resolve(ok);setState(null);};
  return(
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>handle(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:28,width:380,boxShadow:"0 25px 50px rgba(0,0,0,.2)",animation:"toastIn .2s ease-out"}}>
            <div style={{width:44,height:44,borderRadius:11,background:state.danger?"#fef2f2":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,color:state.danger?"#ef4444":"#475569"}}>
              {state.danger?<Trash2 size={20}/>:<AlertCircle size={20}/>}
            </div>
            <p style={{margin:"0 0 6px",fontWeight:800,fontSize:16,color:"#0f172a",lineHeight:1.5}}>{state.title||"Are you sure?"}</p>
            <p style={{margin:"0 0 20px",fontSize:13,color:"#64748b",lineHeight:1.6}}>{state.message}</p>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <button onClick={()=>handle(false)} style={{padding:"9px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:500,color:"#475569"}}>Cancel</button>
              <button onClick={()=>handle(true)} style={{padding:"9px 18px",borderRadius:8,border:"none",background:state.danger?"#ef4444":"#0f172a",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>
                {state.confirmLabel||"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
const useConfirm=()=>React.useContext(ConfirmContext);

// ─── SKELETON COMPONENT ────────────────────────────────────────────────────────
const Skeleton=({w="100%",h=14,r=4,mb=0})=>(
  <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#f1f5f9 25%,#e8ecf0 50%,#f1f5f9 75%)",backgroundSize:"400% 100%",animation:"skeletonShimmer 1.4s ease infinite",marginBottom:mb,display:"inline-block"}}/>
);
const SkeletonRows=({cols=5,rows=5})=>(
  <>
    {Array.from({length:rows}).map((_,i)=>(
      <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
        {Array.from({length:cols}).map((_,j)=>(
          <td key={j} style={{padding:"12px 14px"}}>
            {j===0?<div style={{display:"flex",alignItems:"center",gap:10}}><Skeleton w={34} h={34} r={8}/><div><Skeleton w={100} h={12} mb={5}/><Skeleton w={70} h={10}/></div></div>:<Skeleton h={j===cols-1?28:12} r={j===cols-1?4:3}/>}
          </td>
        ))}
      </tr>
    ))}
    <style>{`@keyframes skeletonShimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
  </>
);

// ─── PERSISTENT STATE HOOK ────────────────────────────────────────────────────
function usePersistState(key, defaultVal){
  const [val, setVal] = React.useState(()=>{
    try{ const s=localStorage.getItem(key); return s!==null?JSON.parse(s):defaultVal; }
    catch{ return defaultVal; }
  });
  const setPersist = React.useCallback((v)=>{
    setVal(prev=>{
      const next = typeof v==="function"?v(prev):v;
      try{ localStorage.setItem(key, JSON.stringify(next)); }catch{}
      return next;
    });
  },[key]);
  return [val, setPersist];
}

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://hmvlgesnxaqebfdzizmy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtdmxnZXNueGFxZWJmZHppem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjAwNzcsImV4cCI6MjA5MjUzNjA3N30.FXvGha4gIz9S0U2PzyZiHVeRLPIbgEJ_3z0xWinJROs";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth(){ return useContext(AuthCtx); }

function AuthProvider({children}){
  const [session,setSession]       = useState(undefined);
  const [profile,setProfile]       = useState(null);
  const [userPerms,setUserPerms]   = useState(null);
  const [allowedDepts,setAllowedDepts] = useState(null); // null = all depts
  const [permsLoaded,setPermsLoaded] = useState(false); // blocks UI until perms are ready

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session) loadProfile(session.user.id);
      else setPermsLoaded(true); // no session = show login immediately
    });
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(session){ setPermsLoaded(false); loadProfile(session.user.id); }
      else { setProfile(null); setUserPerms(null); setPermsLoaded(true); }
    });
    return ()=>subscription.unsubscribe();
  },[sb]);

  const loadProfile = async (uid) => {
    const {data:prof} = await sb.from('profiles').select('*').eq('id',uid).single();
    if(!prof){ setPermsLoaded(true); return; }
    setProfile(prof);
    if(prof.role==='admin'){
      setUserPerms(null); // null = full access
      setAllowedDepts(null); // admin sees all depts
      setPermsLoaded(true);
      return;
    }
    // Load role permissions for non-admin users
    const {data:roles} = await sb.from('role_permissions').select('*');
    if(roles){
      const assigned = roles.find(r=>(r.assigned_users||[]).includes(prof.email));
      if(assigned){
        setUserPerms(assigned.permissions||{});
        const depts = assigned.allowed_departments||[];
        setAllowedDepts(depts.length>0 ? depts : null);
      } else {
        setUserPerms({});
        setAllowedDepts(null);
      }
    }
    setPermsLoaded(true); // only NOW show the platform
  };

  // can() — never called before permsLoaded, so no flash
  const can = (moduleKey, action='view') => {
    if(!userPerms) return true; // admin (null = full access)
    return !!(userPerms[moduleKey]?.[action]);
  };

  const signIn = (email,password) => sb.auth.signInWithPassword({email,password});
  const signOut = () => sb.auth.signOut();

  return <AuthCtx.Provider value={{session,profile,userPerms,allowedDepts,can,permsLoaded,signIn,signOut,sb,loadProfile}}>{children}</AuthCtx.Provider>;
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
          <img src="data:image/png;base64,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" alt="Acquaint Communications" style={{width:200,height:"auto",margin:"0 auto 18px",display:"block"}}/>
          <h1 style={{margin:0,fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-.5px"}}>Team Allocation</h1>
          <p style={{margin:"6px 0 0",fontSize:13,color:"#64748b",lineHeight:1.5}}>Acquaint Communications</p>
        </div>

        {/* Card */}
        <div style={{background:"#fff",borderRadius:20,padding:32,boxShadow:"0 25px 50px rgba(0,0,0,.4)"}}>
          <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"#0f172a"}}>Sign in to your account</h2>
          <p style={{margin:"0 0 24px",fontSize:13,color:"#64748b",lineHeight:1.5}}>Enter your credentials to continue</p>

          {error&&(
            <div style={{padding:"10px 14px",background:"#1a0a0a",border:"1px solid #fecaca",borderRadius:10,marginBottom:16,fontSize:13,color:"#EF4444"}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#475569",marginBottom:6}}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com"
                style={{width:"100%",padding:"11px 14px",border:"1px solid #e2e8f0",borderRadius:10,fontSize:14,color:"#0f172a",lineHeight:1.5,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="#008A57"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#475569",marginBottom:6}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                style={{width:"100%",padding:"11px 14px",border:"1px solid #e2e8f0",borderRadius:10,fontSize:14,color:"#0f172a",lineHeight:1.5,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="#008A57"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
            </div>
            <button type="submit" disabled={loading}
              style={{padding:"12px",borderRadius:10,border:"none",background:"#008A57",color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,marginTop:4,transition:"opacity .2s"}}>
              {loading?"Signing in…":"Sign In →"}
            </button>
          </form>

          <p style={{margin:"20px 0 0",fontSize:12,color:"#64748b",lineHeight:1.5,textAlign:"center"}}>
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
      <div style={{padding:40,color:"#EF4444",fontFamily:"monospace",fontSize:13}}>
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
const fmtH = h => Math.round(parseFloat(h)||0).toLocaleString("en-US");
const currentMonth = "2026-04";
// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
const isActive=(c,month)=>{
  if(!c.sd||!c.ed) return false;
  const m=new Date(month+"-01");
  return new Date(c.sd)<=m && new Date(c.ed)>=m && (c.st||c.status)!=="Cancelled";
};
const diffDays=(dateStr)=>{
  if(!dateStr) return 9999;
  return Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
};
const fmtLong=(m)=>{
  if(!m) return "";
  const [y,mo]=m.split("-");
  return new Date(y,parseInt(mo)-1,1).toLocaleString("en-US",{month:"long",year:"numeric"});
};
const fmtShort=(m)=>{
  if(!m) return "";
  const [y,mo]=m.split("-");
  return new Date(y,parseInt(mo)-1,1).toLocaleString("en-US",{month:"short",year:"numeric"});
};
const fmtDate=(d)=>{if(!d)return"—";return new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});};
const fmtDateShort=(d)=>{if(!d)return"—";return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});};
const daysBetween=(end,todayStr)=>{if(!end)return null;const t=todayStr?new Date(todayStr):new Date();return Math.ceil((new Date(end)-t)/(1000*60*60*24));};
const addMonthsSimple=(dateStr,months)=>{
    if(!dateStr||!months) return"";
    const d=new Date(dateStr);
    const tm=parseInt(months)||0;
    // Last day of the tenure month: day 0 of month+1 = last day of month
    const end=new Date(d.getFullYear(),d.getMonth()+tm,0);
    return end.toISOString().slice(0,10);
  };
const calcProfitPct=(total,prev,amount,category,thirdParty)=>{
  const isRetainer=(category||"").toLowerCase().includes("retainer");
  const base=isRetainer?(parseFloat(thirdParty)||0):(parseFloat(total)||0);
  const p=parseFloat(prev)||0,a=parseFloat(amount)||0;
  if(base<=0) return"";
  return(((base-p-a)/base)*100).toFixed(2);
};
const genContractNum=(tenure,contracts)=>{
  const cat=tenure>=12?"CTR":tenure>=3?"PRJ":"ADH";
  const y=new Date().getFullYear();
  const existing=contracts.filter(c=>c.contract_number?.startsWith(`${cat}-${y}-`));
  const max=existing.reduce((m,c)=>{const n=parseInt(c.contract_number?.split("-")[2]||"0");return Math.max(m,n);},0);
  return `${cat}-${y}-${String(max+1).padStart(3,"0")}`;
};



const MONTHS=["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];

const CLIENTS=[
  {id:"cl1",name:"SABIC"},{id:"cl2",name:"Saudi Aramco"},{id:"cl3",name:"Almarai"},
  {id:"cl4",name:"STC"},{id:"cl5",name:"Mobily"},{id:"cl6",name:"Al Rajhi Bank"},
  {id:"cl7",name:"Noon"},{id:"cl8",name:"Zain KSA"},
];

const CONTRACTS=[
  {id:"ct1",cid:"cl1",cn:"SABIC",cv:480000,tm:12,sd:"2026-01-01",ed:"2026-12-31",st:"Active",bcs:80000,bp:140000,bc:160000,bpl:100000},
  {id:"ct2",cid:"cl2",cn:"Saudi Aramco",cv:360000,tm:12,sd:"2026-01-01",ed:"2026-05-15",st:"Active",bcs:60000,bp:100000,bc:120000,bpl:80000},
  {id:"ct3",cid:"cl3",cn:"Almarai",cv:240000,tm:12,sd:"2026-01-01",ed:"2026-12-31",st:"Active",bcs:40000,bp:70000,bc:80000,bpl:50000},
  {id:"ct4",cid:"cl4",cn:"STC",cv:180000,tm:6,sd:"2026-02-01",ed:"2026-07-31",st:"Active",bcs:30000,bp:50000,bc:60000,bpl:40000},
  {id:"ct5",cid:"cl5",cn:"Mobily",cv:90000,tm:3,sd:"2026-03-01",ed:"2026-06-25",st:"Active",bcs:15000,bp:25000,bc:30000,bpl:20000},
];

const EMPLOYEES_INIT=[
  {id:"e1",name:"Sarah Al-Rashidi",designation:"Account Director",department:"Client Servicing Department",mc:18000,email:"sarah@acq-c.com",status:"Active",start:"2022-01-15"},
  {id:"e2",name:"Mohammed Khalid",designation:"Senior Producer",department:"Production Department",mc:15000,email:"m.khalid@acq-c.com",status:"Active",start:"2021-06-01"},
  {id:"e3",name:"Lena Barakat",designation:"Creative Director",department:"Creative Department",mc:20000,email:"lena@acq-c.com",status:"Active",start:"2020-03-10"},
  {id:"e4",name:"Omar Farouk",designation:"Media Planner",department:"Planning Department",mc:12000,email:"omar@acq-c.com",status:"Active",start:"2023-02-01"},
  {id:"e5",name:"Nadia Hamdan",designation:"Account Manager",department:"Client Servicing Department",mc:14000,email:"nadia@acq-c.com",status:"Active",start:"2022-08-15"},
  {id:"e6",name:"Tariq Mansour",designation:"Video Producer",department:"Production Department",mc:13000,email:"tariq@acq-c.com",status:"Active",start:"2021-11-01"},
  {id:"e7",name:"Rana Al-Amin",designation:"Senior Designer",department:"Creative Department",mc:14500,email:"rana@acq-c.com",status:"Active",start:"2022-04-01"},
  {id:"e8",name:"Faisal Qureshi",designation:"Production Manager",department:"Production Department",mc:16000,email:"faisal@acq-c.com",status:"Active",start:"2020-09-01"},
  {id:"e9",name:"Yasmin Saleh",designation:"Social Media Manager",department:"Creative Department",mc:11000,email:"yasmin@acq-c.com",status:"Active",start:"2023-05-01"},
  {id:"e10",name:"Khalid Nasser",designation:"Junior Planner",department:"Planning Department",mc:9000,email:"khalid@acq-c.com",status:"Active",start:"2024-01-01"},
  {id:"e11",name:"Rami Shahin",designation:"Account Executive",department:"Client Servicing Department",mc:10000,email:"rami@acq-c.com",status:"Inactive",start:"2022-01-01",inactive_effective_month:"2026-02"},
  {id:"e12",name:"Hana Mustafa",designation:"Graphic Designer",department:"Creative Department",mc:11500,email:"hana@acq-c.com",status:"Active",start:"2023-09-01"},
];

const ALLOCS_BY_MONTH={
  "2026-04":[
    {eid:"e1",cid:"cl1",h:88,client_name:"SABIC"},{eid:"e1",cid:"cl3",h:66,client_name:"Almarai"},
    {eid:"e2",cid:"cl2",h:176,client_name:"Saudi Aramco"},{eid:"e3",cid:"cl1",h:120,client_name:"SABIC"},
    {eid:"e3",cid:"cl5",h:56,client_name:"Mobily"},{eid:"e4",cid:"cl3",h:44,client_name:"Almarai"},
    {eid:"e5",cid:"cl4",h:160,client_name:"STC"},{eid:"e6",cid:"cl2",h:176,client_name:"Saudi Aramco"},
    {eid:"e7",cid:"cl3",h:132,client_name:"Almarai"},{eid:"e8",cid:"cl1",h:176,client_name:"SABIC"},
    {eid:"e9",cid:"cl2",h:88,client_name:"Saudi Aramco"},{eid:"e9",cid:"cl5",h:88,client_name:"Mobily"},
    {eid:"e10",cid:"cl4",h:30,client_name:"STC"},
  ],
  "2026-03":[
    {eid:"e1",cid:"cl1",h:100,client_name:"SABIC"},{eid:"e2",cid:"cl2",h:160,client_name:"Saudi Aramco"},
    {eid:"e3",cid:"cl1",h:140,client_name:"SABIC"},{eid:"e5",cid:"cl4",h:130,client_name:"STC"},
    {eid:"e6",cid:"cl2",h:176,client_name:"Saudi Aramco"},{eid:"e7",cid:"cl3",h:110,client_name:"Almarai"},
    {eid:"e8",cid:"cl1",h:176,client_name:"SABIC"},{eid:"e9",cid:"cl5",h:176,client_name:"Mobily"},
  ],
};

const SNAPSHOTS=[
  {m:"2026-01",cn:"SABIC",r:40000,c:28000},{m:"2026-01",cn:"Saudi Aramco",r:30000,c:24000},{m:"2026-01",cn:"Almarai",r:20000,c:12000},
  {m:"2026-02",cn:"SABIC",r:40000,c:30000},{m:"2026-02",cn:"Saudi Aramco",r:30000,c:22000},{m:"2026-02",cn:"Almarai",r:20000,c:14000},{m:"2026-02",cn:"STC",r:30000,c:19000},
  {m:"2026-03",cn:"SABIC",r:40000,c:31000},{m:"2026-03",cn:"Saudi Aramco",r:30000,c:25000},{m:"2026-03",cn:"Almarai",r:20000,c:11000},{m:"2026-03",cn:"STC",r:30000,c:18000},{m:"2026-03",cn:"Mobily",r:30000,c:22000},
];


const DEPTS=["Production Department","Client Servicing Department","Creative Department","Planning Department"];
const EMPTY_EMP={name:"",designation:"",department:"",location:"Jeddah",mc:15000,email:"",status:"Active",start:""};
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
const MOCK_CONTRACTS_FULL = [
  {id:"ct1", contract_number:"CTR-2026-001", client_id:"cl1", client_name:"SABIC",        contract_value:480000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-12-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:80000,  budget_production:140000, budget_creative:160000, budget_planning:100000, notes:"Annual brand retainer.", contract_pdf_url:""},
  {id:"ct2", contract_number:"CTR-2026-002", client_id:"cl2", client_name:"Saudi Aramco", contract_value:360000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-05-15", status:"Active",  contract_category:"Retainer", budget_client_servicing:60000,  budget_production:100000, budget_creative:120000, budget_planning:80000,  notes:"",                   contract_pdf_url:""},
  {id:"ct3", contract_number:"CTR-2026-003", client_id:"cl3", client_name:"Almarai",      contract_value:240000, tenure_months:12, start_date:"2026-01-01", end_date:"2026-12-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:40000,  budget_production:70000,  budget_creative:80000,  budget_planning:50000,  notes:"Includes seasonal campaigns.", contract_pdf_url:""},
  {id:"ct4", contract_number:"CTR-2026-004", client_id:"cl4", client_name:"STC",          contract_value:180000, tenure_months:6,  start_date:"2026-02-01", end_date:"2026-07-31", status:"Active",  contract_category:"Retainer", budget_client_servicing:30000,  budget_production:50000,  budget_creative:60000,  budget_planning:40000,  notes:"",                   contract_pdf_url:""},
  {id:"ct5", contract_number:"PRJ-2026-001", client_id:"cl5", client_name:"Mobily",       contract_value:90000,  tenure_months:3,  start_date:"2026-03-01", end_date:"2026-06-25", status:"Active",  contract_category:"Project",  budget_client_servicing:15000,  budget_production:25000,  budget_creative:30000,  budget_planning:20000,  notes:"Brand refresh project.", contract_pdf_url:""},
  {id:"ct6", contract_number:"ADH-2025-001", client_id:"cl8", client_name:"Zain KSA",     contract_value:45000,  tenure_months:2,  start_date:"2025-10-01", end_date:"2025-11-30", status:"Expired", contract_category:"Adhoc",    budget_client_servicing:10000,  budget_production:15000,  budget_creative:12000,  budget_planning:8000,   notes:"Campaign support.",  contract_pdf_url:""},
  {id:"ct7", contract_number:"PRJ-2025-002", client_id:"cl3", client_name:"Almarai",      contract_value:120000, tenure_months:4,  start_date:"2025-06-01", end_date:"2025-09-30", status:"Expired", contract_category:"Project",  budget_client_servicing:20000,  budget_production:35000,  budget_creative:40000,  budget_planning:25000,  notes:"Ramadan campaign.",  contract_pdf_url:""},
];
const EMPTY_CONTRACT = {client_id:"",client_name:"",contract_value:"",tenure_months:"",project_name:"",start_date:"",end_date:"",status:"Active",contract_category:"Retainer",budget_client_servicing:"",budget_production:"",budget_creative:"",budget_planning:"",budget_third_party:"",contract_pdf_url:"",notes:""};
const CLIENT_MAP = {cl1:"SABIC",cl2:"Saudi Aramco",cl3:"Almarai",cl4:"STC",cl5:"Mobily",cl6:"Al Rajhi Bank",cl7:"Noon",cl8:"Zain KSA"};
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
const EXPENSE_TYPES = ["Freelancer","Production","Vendor","Other"];
const EXP_TYPE_COLORS = {Freelancer:"#008A57",Production:"#f59e0b",Vendor:"#008A57",Other:"#94a3b8"};
const MOCK_EXPENSES_INIT = [
  {id:"ex1", expense_number:"EXP-2026-001", request_date:"2026-01-15", contract_id:"ct1", contract_number:"CTR-2026-001", client_name:"SABIC",        contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:480000, contract_notes:"Annual brand retainer.", expense_type:"Vendor",      vendor_name:"Al Madar Print",      department:"Production Department",       amount:18000, previous_requested_total_amount:0,      project_profit_pct:"96.25", bill_number:"INV-2026-001", bill_date:"2026-01-14", item_details:"Large format printing for SABIC campaign",     notes:"Approved by manager", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex2", expense_number:"EXP-2026-002", request_date:"2026-01-20", contract_id:"ct2", contract_number:"CTR-2026-002", client_name:"Saudi Aramco",  contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-05-15", total_contract_value:360000, contract_notes:"",                   expense_type:"Freelancer",  vendor_name:"Ahmad Al-Shammari",    department:"Creative Department",         amount:12000, previous_requested_total_amount:0,      project_profit_pct:"96.67", bill_number:"INV-2026-002", bill_date:"2026-01-19", item_details:"Freelance motion graphics for Aramco brand",   notes:"Motion designer contract", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex3", expense_number:"EXP-2026-003", request_date:"2026-02-05", contract_id:"ct1", contract_number:"CTR-2026-001", client_name:"SABIC",        contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:480000, contract_notes:"Annual brand retainer.", expense_type:"Production",  vendor_name:"Studio One Media",    department:"Production Department",       amount:25000, previous_requested_total_amount:18000,  project_profit_pct:"91.04", bill_number:"INV-2026-003", bill_date:"2026-02-04", item_details:"Video production — Q1 brand film",              notes:"Approved by CEO", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex4", expense_number:"EXP-2026-004", request_date:"2026-02-12", contract_id:"ct3", contract_number:"CTR-2026-003", client_name:"Almarai",      contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-12-31", total_contract_value:240000, contract_notes:"Includes seasonal campaigns.", expense_type:"Vendor",  vendor_name:"NeonSigns Arabia",    department:"Creative Department",         amount:9500,  previous_requested_total_amount:0,      project_profit_pct:"96.04", bill_number:"INV-2026-004", bill_date:"2026-02-11", item_details:"LED display rental for Ramadan activation",     notes:"Seasonal activation", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex5", expense_number:"EXP-2026-005", request_date:"2026-03-01", contract_id:"ct4", contract_number:"CTR-2026-004", client_name:"STC",          contract_category:"Retainer", contract_start_date:"2026-02-01", contract_end_date:"2026-07-31", total_contract_value:180000, contract_notes:"",                   expense_type:"Freelancer",  vendor_name:"Layla Barakat Studio", department:"Creative Department",         amount:8000,  previous_requested_total_amount:0,      project_profit_pct:"95.56", bill_number:"INV-2026-005", bill_date:"2026-02-28", item_details:"Illustration pack — STC social media",          notes:"3 rounds of revision included", status:"Approved", attachment_url:"", attachment_name:""},
  {id:"ex6", expense_number:"EXP-2026-006", request_date:"2026-03-10", contract_id:"ct5", contract_number:"PRJ-2026-001", client_name:"Mobily",       contract_category:"Project",  contract_start_date:"2026-03-01", contract_end_date:"2026-06-25", total_contract_value:90000,  contract_notes:"Brand refresh project.", expense_type:"Production", vendor_name:"Reel Productions",     department:"Production Department",       amount:15000, previous_requested_total_amount:0,      project_profit_pct:"83.33", bill_number:"INV-2026-006", bill_date:"2026-03-09", item_details:"Brand film shoot — 2 days",                      notes:"Includes equipment hire", status:"Draft",    attachment_url:"", attachment_name:""},
  {id:"ex7", expense_number:"EXP-2026-007", request_date:"2026-03-18", contract_id:"ct2", contract_number:"CTR-2026-002", client_name:"Saudi Aramco",  contract_category:"Retainer", contract_start_date:"2026-01-01", contract_end_date:"2026-05-15", total_contract_value:360000, contract_notes:"",                   expense_type:"Other",       vendor_name:"Riyadh Events Co",    department:"Client Servicing Department", amount:6500,  previous_requested_total_amount:12000,  project_profit_pct:"93.75", bill_number:"INV-2026-007", bill_date:"2026-03-17", item_details:"Client event logistics & catering",             notes:"Q1 client appreciation event", status:"Draft", attachment_url:"", attachment_name:""},
];
const EMPTY_EXP_FORM = {
  expense_number:"",request_date:new Date().toISOString().slice(0,10),
  contract_id:"",contract_number:"",client_name:"",contract_category:"",
  contract_start_date:"",contract_end_date:"",total_contract_value:"",budget_third_party:"",contract_notes:"",
  expense_type:"",vendor_name:"",amount:"",previous_requested_total_amount:"",
  project_profit_pct:"",department:"",item_details:"",
  bill_number:"",bill_date:"",attachment_url:"",attachment_name:"",notes:"",status:"Draft"
};
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
  [{name:"Dashboard",key:"dashboard"},{name:"Employees",key:"employees"},{name:"Clients",key:"clients"},
   {name:"Contracts",key:"contracts"},{name:"Allocations",key:"allocations"},{name:"Reports",key:"reports"},
   {name:"Monthly Close",key:"monthlyClose"},{name:"Contract Expenses",key:"contractExpenses"},{name:"System Users",key:"systemUsers"}]
  .map(e=>[e.key,{view:false,create:false,edit:false,delete:false}])
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
const NAV=[
  {id:"Dashboard",        label:"Dashboard",                 Icon:LayoutDashboard},
  {id:"Employees",        label:"Employees",                 Icon:Users},
  {id:"Clients",          label:"Clients",                   Icon:Building2},
  {id:"Contracts",        label:"Contracts",                 Icon:FileText},
  {id:"Allocations",      label:"Allocations",               Icon:FolderKanban},
  {id:"Reports",          label:"Reports",                   Icon:TrendingUp},
  {id:"MonthlyClose",     label:"Monthly Close",             Icon:Calendar},
  {id:"ContractExpenses", label:"Contract/Project Expenses", Icon:Receipt},
  {id:"Settings",         label:"System Users",              Icon:UserCog},
];
const PAGE_PERM_KEY = {
  Dashboard:         "dashboard",
  Employees:         "employees",
  Clients:           "clients",
  Contracts:         "contracts",
  Allocations:       "allocations",
  Reports:           "reports",
  MonthlyClose:      "monthlyClose",
  ContractExpenses:  "contractExpenses",
  Settings:          "systemUsers",
};


// ─── SHARED UI COMPONENTS ────────────────────────────────────────────────────
function Card({children,style={}}){
  return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,.05)",...style}}>{children}</div>;
}
function Bdg({children,bg="#e2e8f0",color="#0f172a"}){
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:999,background:bg,color,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
}
function PBar({val,color}){
  return(
    <div style={{height:5,background:"#e2e8f0",borderRadius:3,overflow:"hidden",margin:"5px 0 3px"}}>
      <div style={{width:`${Math.min(100,val)}%`,height:"100%",background:color,borderRadius:3}}/>
    </div>
  );
}
function Avatar({name,size=36,style={}}){
  const initials=(name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:Math.round(size*.25),background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:Math.round(size*.35),fontWeight:700,flexShrink:0,...style}}>{initials}</div>;
}
function Btn({children,onClick,variant="primary",size="md",type="button",disabled,style={}}){
  const sz={sm:{padding:"5px 12px",fontSize:12},md:{padding:"8px 16px",fontSize:13}};
  const vs={
    primary:{background:"#0f172a",color:"#fff",border:"none",fontWeight:700},
    outline:{background:"transparent",color:"#475569",border:"1px solid #e2e8f0",fontWeight:500},
    ghost:{background:"transparent",color:"#475569",border:"none",fontWeight:500},
    danger:{background:"transparent",color:"#EF4444",border:"1px solid #EF444433",fontWeight:500},
  };
  return <button type={type} onClick={onClick} disabled={disabled}
    style={{...sz[size],...vs[variant],borderRadius:9,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,display:"inline-flex",alignItems:"center",gap:5,transition:"opacity .15s",...style}}
    onMouseEnter={e=>{if(!disabled&&variant==="primary")e.currentTarget.style.background="#1e293b";else if(!disabled&&variant==="outline")e.currentTarget.style.background="#f1f5f9";}}
    onMouseLeave={e=>{if(variant==="primary")e.currentTarget.style.background="#0f172a";else if(variant==="outline")e.currentTarget.style.background="transparent";}}
  >{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",required,min,max,style={}}){
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} required={required} min={min} max={max}
    style={{width:"100%",padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,color:"#0f172a",lineHeight:1.5,background:"#fff",outline:"none",boxSizing:"border-box",...style}}
    onFocus={e=>e.target.style.borderColor="#008A57"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}
  />;
}

function Sel({value,onChange,options,style={}}){
  return(
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,color:"#0f172a",lineHeight:1.5,background:"#fff",outline:"none",...style}}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function Lbl({children}){return <p style={{margin:"0 0 5px",fontSize:12,fontWeight:600,color:"#475569"}}>{children}</p>;}
function Modal({open,onClose,title,children}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto",border:"1px solid #e2e8f0",boxShadow:"0 25px 50px rgba(0,0,0,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #e2e8f0"}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:700,color:"#0f172a"}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#64748b",lineHeight:1,padding:"0 4px"}}>&times;</button>
        </div>
        <div style={{padding:"20px 22px"}}>{children}</div>
      </div>
    </div>
  );
}
function SortTh({k,sk,sd,onSort,children,align="left"}){
  const active=sk===k;
  return <th onClick={()=>onSort(k)} style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:active?"#008A57":"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
    {children}{active?sd==="asc"?" ↑":" ↓":""}
  </th>;
}


// ─── DEPT UTILIZATION CARDS (extracted to avoid IIFE hook violations) ─────────
const DEPT_META={
  "Creative Department":        {short:"CR",color:"#008A57",lightBg:"#e6f7f0",name:"Creative"},
  "Client Servicing Department":{short:"CS",color:"#7c3aed",lightBg:"#f3e8ff",name:"Client Servicing"},
  "Production Department":      {short:"PR",color:"#d97706",lightBg:"#fef9c3",name:"Production"},
  "Planning Department":        {short:"PL",color:"#475569",lightBg:"#f1f5f9",name:"Planning"},
};
function getDeptStatus(pct){
  if(pct>=90) return{label:"Fully Utilized",  color:"#059669",bg:"#d1fae5",border:"#6ee7b7"};
  if(pct>=70) return{label:"Optimal",          color:"#0891b2",bg:"#e0f7fa",border:"#67e8f9"};
  if(pct>=1)  return{label:"Under Util.",       color:"#ef4444",bg:"#fee2e2",border:"#fca5a5"};
  return       {label:"Unallocated",            color:"#94a3b8",bg:"#f1f5f9",border:"#cbd5e1"};
}
function getEmpStatus(h){
  if(h>158)  return{label:"Fully Util.",color:"#059669"};
  if(h>=123) return{label:"Optimal",    color:"#0891b2"};
  if(h>=1)   return{label:"Under Util.",color:"#ef4444"};
  return      {label:"Unallocated",     color:"#94a3b8"};
}
function DeptUtilizationCards({eu,HPM,fmtH,allowedDepts=null}){
  const [expandedDept,setExpandedDept]=useState(null);
  const depts=Object.entries(DEPT_META).filter(([key])=>!allowedDepts||allowedDepts.includes(key)).map(([key,meta])=>{
    const allEmps=eu.filter(e=>e.department===key);
    if(!allEmps.length)return null;
    const onLeaveEmps=allEmps.filter(e=>e.onLeave);
    const availEmps=allEmps.filter(e=>!e.onLeave);
    const allocated=availEmps.reduce((s,e)=>s+e.h,0);
    const capacity=availEmps.length*HPM;
    const pct=capacity>0?Math.round((allocated/capacity)*100):0;
    const fully=availEmps.filter(e=>e.h>158).length;
    const optimal=availEmps.filter(e=>e.h>=123&&e.h<=158).length;
    const under=availEmps.filter(e=>e.h>0&&e.h<123).length;
    const unalloc=availEmps.filter(e=>e.h===0).length;
    const onLeave=onLeaveEmps.length;
    const topEmps=[...availEmps].sort((a,b)=>b.h-a.h).slice(0,5);
    return{key,meta,allEmps,availEmps,allocated,capacity,pct,fully,optimal,under,unalloc,onLeave,topEmps};
  }).filter(Boolean);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start"}}>
      {depts.map(d=>{
        const st=getDeptStatus(d.pct);
        const open=expandedDept===d.key;
        return(
          <div key={d.key} style={{background:"#fff",border:`1.5px solid ${open?d.meta.color:"#e2e8f0"}`,borderRadius:14,overflow:"hidden",boxShadow:open?`0 6px 20px ${d.meta.color}22`:"0 1px 4px rgba(0,0,0,.06)",transition:"all .2s"}}>
            {/* Gradient header */}
            <div style={{background:`linear-gradient(135deg,${d.meta.color}18,${d.meta.color}06)`,padding:"14px 16px",borderBottom:`1px solid ${d.meta.color}18`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:10,background:d.meta.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#fff",letterSpacing:1,boxShadow:`0 3px 8px ${d.meta.color}55`,flexShrink:0}}>{d.meta.short}</div>
                  <div>
                    <p style={{margin:0,fontWeight:800,fontSize:14,color:"#0f172a",lineHeight:1.3}}>{d.meta.name}</p>
                    <p style={{margin:"2px 0 0",fontSize:10,color:"#64748b"}}>{d.allEmps.length} employees · {d.onLeave} on leave</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{margin:0,fontSize:24,fontWeight:900,color:st.color,lineHeight:1}}>{d.pct}%</p>
                  <span style={{display:"inline-block",padding:"2px 8px",borderRadius:999,background:st.bg,border:`1px solid ${st.border}`,fontSize:9,fontWeight:700,color:st.color,marginTop:3}}>{st.label}</span>
                </div>
              </div>
              <div style={{height:8,borderRadius:99,background:"rgba(0,0,0,.07)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(d.pct,100)}%`,background:d.meta.color,borderRadius:99,transition:"width .5s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontSize:9,color:"#94a3b8"}}>{fmtH(d.allocated)}h allocated</span>
                <span style={{fontSize:9,color:"#94a3b8"}}>{fmtH(d.capacity)}h capacity · {d.onLeave} excluded</span>
              </div>
            </div>
            {/* Stats pills */}
            <div style={{padding:"10px 16px"}}>
              <div style={{display:"flex",gap:4}}>
                {[
                  {n:d.fully,   l:"Fully Util.", bg:"#d1fae5",c:"#059669"},
                  {n:d.optimal, l:"Optimal",     bg:"#e0f7fa",c:"#0891b2"},
                  {n:d.under,   l:"Under Util.", bg:"#fee2e2",c:"#ef4444"},
                  {n:d.onLeave, l:"On Leave",    bg:"#fef9c3",c:"#d97706"},
                  {n:d.unalloc, l:"Unallocated", bg:"#f1f5f9",c:"#94a3b8"},
                ].filter(s=>s.n>0).map(s=>(
                  <div key={s.l} style={{flex:1,minWidth:0,padding:"4px 3px",borderRadius:6,background:s.bg,textAlign:"center"}}>
                    <p style={{margin:0,fontSize:14,fontWeight:800,color:s.c,lineHeight:1.2}}>{s.n}</p>
                    <p style={{margin:0,fontSize:8,color:s.c,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Expand button */}
            <button onClick={()=>setExpandedDept(open?null:d.key)} style={{width:"100%",padding:"8px 16px",border:"none",borderTop:"1px solid #f1f5f9",background:"#f8fafc",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11,fontWeight:600,color:d.meta.color,transition:"background .15s"}}>
              <span>Top employees by hours</span>
              <ChevronRight size={12} style={{transform:open?"rotate(90deg)":"none",transition:"transform .2s"}} color={d.meta.color}/>
            </button>
            {open&&(
              <div style={{padding:"8px 16px 14px",background:"#fafafa"}}>
                {d.topEmps.map((e,i)=>{
                  const es=getEmpStatus(e.h);
                  const epct=Math.round((e.h/HPM)*100);
                  return(
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:9,padding:"5px 0",borderTop:i>0?"1px solid #f1f5f9":"none"}}>
                      <div style={{width:26,height:26,borderRadius:7,background:d.meta.lightBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:d.meta.color,flexShrink:0}}>{e.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:0,fontSize:11,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.4}}>{e.name}</p>
                        <div style={{height:4,borderRadius:99,background:"#e2e8f0",marginTop:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(epct,100)}%`,background:d.meta.color,borderRadius:99}}/>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,minWidth:70}}>
                        <p style={{margin:0,fontSize:11,fontWeight:700,color:es.color,lineHeight:1.3}}>{fmtH(e.h)}h</p>
                        <p style={{margin:0,fontSize:8,color:es.color,fontWeight:600}}>{es.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ─── CAPACITY CARDS COMPONENT ─────────────────────────────────────────────────
const DEPT_COLORS={
  "Creative Department":        {color:"#008A57",bg:"#e6f7f0"},
  "Client Servicing Department":{color:"#7c3aed",bg:"#f3e8ff"},
  "Production Department":      {color:"#d97706",bg:"#fef9c3"},
  "Planning Department":        {color:"#475569",bg:"#f1f5f9"},
};
function getCapTheme(pct,hours,cap,onLeave){
  if(onLeave)    return{border:"#fde68a",cardBg:"#fffbeb",barColor:"#f59e0b",badgeBg:"#fef9c3",badgeColor:"#d97706",label:"On Leave"};
  if(hours===0)  return{border:"#e2e8f0",cardBg:"#fafafa",barColor:"#cbd5e1",badgeBg:"#f1f5f9",badgeColor:"#94a3b8",label:"Unallocated"};
  if(hours>158)  return{border:"#a7f3d0",cardBg:"#f0fdf4",barColor:"#008A57",badgeBg:"#d1fae5",badgeColor:"#059669",label:"Fully Utilized"};
  if(hours>=123) return{border:"#bae6fd",cardBg:"#f0f9ff",barColor:"#0891b2",badgeBg:"#e0f7fa",badgeColor:"#0891b2",label:"Optimal"};
  return          {border:"#fca5a5",cardBg:"#fef2f2",barColor:"#ef4444",badgeBg:"#fee2e2",badgeColor:"#ef4444",label:"Under Util."};
}
function CapacityCards({eu,HPM,fmtH,month,fmtLong,allowedDepts=null}){
  const [capDept,setCapDept]=useState("all");
  const [capStatus,setCapStatus]=useState("All Statuses");
  const [openId,setOpenId]=useState(null);
  const cardRefs=React.useRef({});

  React.useEffect(()=>{
    if(!openId) return;
    const handler=e=>{
      const ref=cardRefs.current[openId];
      if(ref&&!ref.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[openId]);

  const sortOrder=e=>{
    if(e.onLeave) return 4;
    if(e.h===0)   return 5;
    if(e.h>158)   return 0;
    if(e.h>=123)  return 1;
    return 2;
  };

  const deptFiltered=capDept==="all"?eu:eu.filter(e=>e.department===capDept);
  const visible=deptFiltered.filter(e=>{
    if(capStatus==="All Statuses") return true;
    const th=getCapTheme(Math.round((e.h/HPM)*100),e.h,HPM,e.onLeave);
    return th.label===capStatus;
  }).slice().sort((a,b)=>sortOrder(a)-sortOrder(b)||(b.h-a.h));

  const fullyCount =deptFiltered.filter(e=>!e.onLeave&&e.h>158).length;
  const optCount   =deptFiltered.filter(e=>!e.onLeave&&e.h>=123&&e.h<=158).length;
  const underCount =deptFiltered.filter(e=>!e.onLeave&&e.h>0&&e.h<123).length;
  const leaveCount =deptFiltered.filter(e=>e.onLeave).length;
  const unallocCount=deptFiltered.filter(e=>!e.onLeave&&e.h===0).length;

  const selStyle={padding:"7px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:11,fontWeight:600,color:"#0f172a",background:"#fff",cursor:"pointer",outline:"none",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 9px center",paddingRight:26};

  return(
    <Card style={{padding:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:12}}>
        <div>
          <p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Team Capacity</p>
          <p style={{margin:"1px 0 0",fontSize:10,color:"#64748b",lineHeight:1.5}}>{fmtLong(month)} · {HPM}h/person</p>
        </div>
        {/* Dropdowns */}
        <div style={{display:"flex",gap:8}}>
          <select value={capDept} onChange={e=>{setCapDept(e.target.value);setOpenId(null);}} style={selStyle}>
            <option value="all">All Departments</option>
            {(!allowedDepts||allowedDepts.includes("Creative Department"))&&<option value="Creative Department">Creative</option>}
            {(!allowedDepts||allowedDepts.includes("Client Servicing Department"))&&<option value="Client Servicing Department">Client Servicing</option>}
            {(!allowedDepts||allowedDepts.includes("Production Department"))&&<option value="Production Department">Production</option>}
            {(!allowedDepts||allowedDepts.includes("Planning Department"))&&<option value="Planning Department">Planning</option>}
          </select>
          <select value={capStatus} onChange={e=>setCapStatus(e.target.value)} style={selStyle}>
            <option>All Statuses</option>
            <option>Fully Utilized</option>
            <option>Optimal</option>
            <option>Under Util.</option>
            <option>On Leave</option>
            <option>Unallocated</option>
          </select>
        </div>
      </div>
      {/* Stats pills — clickable */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {[
          {count:fullyCount, label:"Fully Utilized", bg:"#d1fae5",border:"#a7f3d0",color:"#059669"},
          {count:optCount,   label:"Optimal",         bg:"#e0f7fa",border:"#bae6fd",color:"#0891b2"},
          {count:underCount, label:"Under Util.",     bg:"#fee2e2",border:"#fca5a5",color:"#ef4444"},
          {count:leaveCount, label:"On Leave",        bg:"#fef9c3",border:"#fde68a",color:"#d97706"},
          {count:unallocCount,label:"Unallocated",    bg:"#f1f5f9",border:"#e2e8f0",color:"#94a3b8"},
        ].filter(s=>s.count>0).map(s=>(
          <div key={s.label} onClick={()=>setCapStatus(capStatus===s.label?"All Statuses":s.label)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:6,background:s.bg,border:`1.5px solid ${capStatus===s.label?"#0f172a":s.border}`,cursor:"pointer",transition:"border-color .15s"}}>
            <span style={{fontSize:13,fontWeight:800,color:s.color}}>{s.count}</span>
            <span style={{fontSize:10,color:s.color,fontWeight:500}}>{s.label}</span>
          </div>
        ))}
      </div>
      {/* Cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
        {visible.map(emp=>{
          const pct    = Math.round((emp.h/HPM)*100);
          const theme  = getCapTheme(pct,emp.h,HPM,emp.onLeave);
          const meta   = DEPT_COLORS[emp.department]||{color:"#475569",bg:"#f1f5f9"};
          const over   = emp.h>HPM;
          const open   = openId===emp.id;
          const toggle = ()=>setOpenId(open?null:emp.id);

          return(
            <div key={emp.id}
              ref={el=>cardRefs.current[emp.id]=el}
              style={{position:"relative",padding:"12px 14px",borderRadius:12,
                border:`1.5px solid ${open?meta.color:theme.border}`,
                background:theme.cardBg,
                boxShadow:open?"0 4px 12px rgba(0,0,0,.08)":"0 1px 3px rgba(0,0,0,.04)",
                transition:"all .15s ease"}}
            >
              {/* Header row: avatar + name + eye icon */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${meta.color},${meta.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#fff",flexShrink:0}}>
                    {emp.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{minWidth:0}}>
                    <p style={{margin:0,fontWeight:700,fontSize:11,color:"#0f172a",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.name}</p>
                    <p style={{margin:0,fontSize:10,color:"#94a3b8",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{emp.designation||emp.department?.replace(" Department","")}</p>
                  </div>
                </div>
                {!emp.onLeave&&emp.clients&&emp.clients.length>0&&(
                  <button onClick={toggle} style={{padding:"4px",borderRadius:5,border:`1px solid ${open?meta.color:"#e2e8f0"}`,background:open?meta.bg:"#fff",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0,marginLeft:4,transition:"all .15s"}}>
                    <Eye size={11} strokeWidth={1.75} color={open?meta.color:"#94a3b8"}/>
                  </button>
                )}
              </div>
              {/* Dept badge */}
              {capDept==="all"&&(
                <span style={{padding:"2px 7px",borderRadius:999,background:meta.bg,color:meta.color,fontSize:9,fontWeight:600,display:"inline-block",marginBottom:8}}>
                  {emp.department?.replace(" Department","")}
                </span>
              )}
              {/* Progress bar */}
              {emp.onLeave?(
                <div style={{height:6,borderRadius:99,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:"100%",background:"repeating-linear-gradient(45deg,#fde68a,#fde68a 3px,#fef9c3 3px,#fef9c3 6px)"}}/>
                </div>
              ):(
                <div style={{height:6,borderRadius:99,background:"rgba(0,0,0,.07)",overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:theme.barColor,borderRadius:99,transition:"width .4s ease"}}/>
                </div>
              )}
              {/* Hours + badge */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:"#64748b",lineHeight:1.4}}>
                  {emp.onLeave
                    ?<span style={{fontWeight:700,color:"#d97706"}}>On Leave</span>
                    :emp.h===0
                      ?<span style={{color:"#94a3b8"}}>0h</span>
                      :<><strong style={{color:"#0f172a"}}>{fmtH(emp.h)}h</strong> · {fmtH(Math.max(0,HPM-emp.h))}h free</>
                  }
                </span>
                {!emp.onLeave&&(
                  <span style={{padding:"1px 7px",borderRadius:999,background:theme.badgeBg,color:theme.badgeColor,fontSize:9,fontWeight:700}}>{emp.h===0?"Unallocated":theme.label}</span>
                )}
              </div>
              {/* Over warning */}
              {over&&(
                <div style={{marginTop:6,display:"flex",alignItems:"center",gap:4,padding:"3px 7px",background:"#fee2e2",borderRadius:5,border:"1px solid #fca5a5"}}>
                  <AlertTriangle size={9} strokeWidth={2} color="#ef4444"/>
                  <span style={{fontSize:9,color:"#ef4444",fontWeight:600}}>Over by {fmtH(emp.h-HPM)}h</span>
                </div>
              )}
              {/* Eye dropdown — client breakdown */}
              {!emp.onLeave&&(
                <div style={{
                  position:"absolute",top:"calc(100% + 6px)",left:0,
                  width:"100%",minWidth:200,background:"#fff",
                  border:`1.5px solid ${meta.color}`,
                  borderRadius:12,padding:"11px 13px",
                  boxShadow:"0 8px 28px rgba(0,0,0,.15)",
                  opacity:open?1:0,
                  transform:open?"translateY(0)":"translateY(-6px)",
                  transition:"opacity .18s ease,transform .18s ease",
                  pointerEvents:open?"auto":"none",
                  zIndex:50,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                    <div>
                      <p style={{margin:0,fontWeight:700,fontSize:11,color:"#0f172a"}}>{emp.name}</p>
                      <p style={{margin:"1px 0 0",fontSize:9,color:"#94a3b8"}}>{(emp.clients||[]).length} client{(emp.clients||[]).length!==1?"s":""} · {fmtH(emp.h)}h total</p>
                    </div>
                    <button onClick={toggle} style={{padding:3,borderRadius:5,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",display:"flex"}}>
                      <X size={10} strokeWidth={2} color="#94a3b8"/>
                    </button>
                  </div>
                  <p style={{margin:"0 0 6px",fontSize:8,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".06em"}}>Client breakdown</p>
                  {(emp.clients||[]).length===0
                    ?<p style={{margin:0,fontSize:11,color:"#94a3b8"}}>No allocations this month</p>
                    :(
                      <div style={{overflowY:"auto",maxHeight:200,overscrollBehavior:"contain"}}>
                        {(emp.clients||[]).map((c,i)=>{
                          const share=emp.h>0?Math.round((c.hours/emp.h)*100):0;
                          return(
                            <div key={i} style={{marginBottom:7}}>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                                <span style={{fontSize:11,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8,lineHeight:1.4}}>{c.name}</span>
                                <span style={{fontSize:11,fontWeight:700,color:"#008A57",flexShrink:0,fontVariantNumeric:"tabular-nums"}}>{fmtH(c.hours)}h</span>
                              </div>
                              <div style={{height:4,borderRadius:99,background:"#f1f5f9",overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${share}%`,background:meta.color,borderRadius:99,opacity:.6}}/>
                              </div>
                              <p style={{margin:"1px 0 0",fontSize:9,color:"#94a3b8"}}>{share}% of total</p>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}


function DashboardPage(){
  const {sb,allowedDepts} = useAuth();
  const [month,setMonth]=usePersistState("pp_dash_month",currentMonth);
  const [finTab,setFinTab]=usePersistState("pp_dash_tab","finance");
  const [lc,setLc]=useState("all");
  const [rc,setRc]=useState("all");
  const [dc,setDc]=useState("all");
  const [capDept,setCapDept]=useState("all");
  const [dbEmployees,setDbEmployees]=useState([]);
  const [dbContracts,setDbContracts]=useState([]);
  const [dbAllocs,setDbAllocs]=useState([]);
  const [dbSnapshots,setDbSnapshots]=useState([]);

  useEffect(()=>{
    Promise.all([
      sb.from('employees').select('*'),
      sb.from('contracts').select('*'),
      sb.from('allocations').select('*'),
      sb.from('monthly_snapshots').select('*'),
    ]).then(([{data:e},{data:ct},{data:al},{data:sn}])=>{
      if(e)  setDbEmployees(e.map(x=>({...x,mc:parseFloat(x.monthly_cost)||0,id:x.id,name:x.name,designation:x.designation,department:x.department,status:x.status})));
      if(ct) setDbContracts(ct.map(x=>({...x,cn:x.client_name,cid:x.client_id,cv:parseFloat(x.contract_value)||0,tm:parseFloat(x.tenure_months)||1,sd:x.start_date,ed:x.end_date,st:x.status,bcs:parseFloat(x.budget_client_servicing)||0,bp:parseFloat(x.budget_production)||0,bc:parseFloat(x.budget_creative)||0,bpl:parseFloat(x.budget_planning)||0})));
      if(al) setDbAllocs(al.map(x=>({...x,eid:x.employee_id,cid:x.client_id,h:parseFloat(x.allocated_hours)||0})));
      if(sn) setDbSnapshots(sn.map(x=>({...x,m:x.month,cn:x.client_name,r:parseFloat(x.monthly_retainer)||0,c:parseFloat(x.resource_cost)||0})));
    });
  },[sb]);

  const dbAllocsByMonth=useMemo(()=>{const m={};dbAllocs.forEach(a=>{if(!m[a.month])m[a.month]=[];m[a.month].push(a);});return m;},[dbAllocs]);

  const C=useMemo(()=>{
    const als=dbAllocsByMonth[month]||[];
    const em={};dbEmployees.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
    const ac=dbContracts.filter(c=>isActive(c,month));
    // Build contract map keyed by contract id (for client matching)
    const cm={};ac.forEach(c=>{
      const cid=c.client_id||c.cid||c.id;
      cm[cid]={...c,mr:Math.round((parseFloat(c.contract_value)||parseFloat(c.cv)||0)/(parseFloat(c.tenure_months)||parseFloat(c.tm)||1))};
    });
    // Total revenue = sum of monthly retainers of all active contracts this month
    const tr=ac.reduce((s,c)=>s+Math.round((parseFloat(c.contract_value)||parseFloat(c.cv)||0)/(parseFloat(c.tenure_months)||parseFloat(c.tm)||1)),0);
    const cp=ac.map(c=>{
      const mr=Math.round((parseFloat(c.contract_value)||parseFloat(c.cv)||0)/(parseFloat(c.tenure_months)||parseFloat(c.tm)||1));
      const cid=c.client_id||c.cid||c.id;
      let rc2=0;
      als.filter(a=>a.cid===cid||a.client_id===cid).forEach(a=>{const e=em[a.eid||a.employee_id];if(e)rc2+=e.hr*a.h;});
      const gp=mr-rc2,mp=mr>0?(gp/mr)*100:0;
      return{id:cid,name:c.client_name||c.cn||"",mr,rc:rc2,gp,mp};
    });
    const tc=cp.reduce((s,c)=>s+c.rc,0);
    const tp=tr-tc,am=tr>0?(tp/tr)*100:0,lm=cp.filter(c=>c.mp<20&&c.mp>=0).length;
    const allAc=dbContracts.filter(c=>c.st==="Active"||c.status==="Active");
    // Total Contract Value = sum of all active contract values - total already closed (snapshotted) revenue
    const totalClosed=dbSnapshots.reduce((s,sn)=>s+(parseFloat(sn.monthly_retainer)||0),0);
    const tcv=allAc.reduce((s,c)=>s+(parseFloat(c.contract_value)||parseFloat(c.cv)||0),0)-totalClosed;
    const cvd=ac.map(c=>{const x=cp.find(p=>p.id===c.cid);return{name:c.cn.length>10?c.cn.slice(0,10)+"…":c.cn,monthly:Math.round(c.cv/c.tm),cost:Math.round(x?.rc||0),cid:c.cid};});
    const bld=(cs,as2)=>{
      const d={"Client Servicing":{b:0,c:0},"Production":{b:0,c:0},"Creative":{b:0,c:0},"Planning":{b:0,c:0},"3rd Party":{b:0,c:0}};
      cs.forEach(c=>{const f=c.tm>0?1/c.tm:0;d["Client Servicing"].b+=(c.bcs||0)*f;d["Production"].b+=(c.bp||0)*f;d["Creative"].b+=(c.bc||0)*f;d["Planning"].b+=(c.bpl||0)*f;d["3rd Party"].b+=(parseFloat(c.budget_third_party)||0)*f;});
      as2.forEach(a=>{const e=em[a.eid];if(e){const cost=e.hr*a.h,dep=e.department||"";if(dep.includes("Client Servicing"))d["Client Servicing"].c+=cost;else if(dep.includes("Production"))d["Production"].c+=cost;else if(dep.includes("Creative"))d["Creative"].c+=cost;else if(dep.includes("Planning"))d["Planning"].c+=cost;}});
      return Object.entries(d).map(([n,v])=>({name:n,budget:Math.round(v.b),cost:Math.round(v.c)}));
    };
    const da=bld(ac,als);
    const dbc=id=>id==="all"?da:bld(ac.filter(c=>c.cid===id),als.filter(a=>a.cid===id));
    const eu=dbEmployees.filter(e=>!allowedDepts||allowedDepts.includes(e.department)).map(e=>{const empAls=als.filter(a=>(a.eid||a.employee_id)===e.id);const h=empAls.reduce((s,a)=>s+(parseFloat(a.h||a.allocated_hours)||0),0);const clients=empAls.filter(a=>a.status!=='On Leave'&&parseFloat(a.h||a.allocated_hours)>0).map(a=>({name:a.client_name||a.cn||'',hours:parseFloat(a.h||a.allocated_hours)||0}));return{...e,h,u:(h/HPM)*100,av:Math.max(0,HPM-h),clients};});
    const fullyUtil=eu.filter(e=>!e.onLeave&&e.h>158);
    const optimal=eu.filter(e=>!e.onLeave&&e.h>=123&&e.h<=158);
    const underUtil=eu.filter(e=>!e.onLeave&&e.h>0&&e.h<123);
    const unallocated=eu.filter(e=>!e.onLeave&&e.h===0);
    const over=fullyUtil,under=underUtil; // keep aliases for backward compat
    const chart=eu.map(e=>({name:e.name.split(" ")[0],hours:e.h,available:e.av,u:e.u})).sort((a,b)=>b.u-a.u);
    const ren=allAc.filter(c=>{const d=diffDays(c.ed);return d>=0&&d<=60;}).sort((a,b)=>new Date(a.ed)-new Date(b.ed));
    const bm={};dbSnapshots.forEach(s=>{if(!bm[s.m])bm[s.m]={m:s.m,cl:{}};if(!bm[s.m].cl[s.cn])bm[s.m].cl[s.cn]={r:0,c:0};bm[s.m].cl[s.cn].r+=s.r;bm[s.m].cl[s.cn].c+=s.c;});
    const lt=Object.values(bm).sort((a,b)=>a.m.localeCompare(b.m)).map(x=>({label:fmtShort(x.m),m:x.m,cl:x.cl}));
    const sc=[...new Set(dbSnapshots.map(s=>s.cn))];
    return{cp,tr,tc,tp,am,lm,acnt:allAc.length,tcv,cvd,dbc,eu,fullyUtil,optimal,underUtil,unallocated,over,under,chart,ren,lt,sc};
  },[month,dbContracts,dbEmployees,dbAllocs,dbSnapshots,dbAllocsByMonth]);

  const ltd=C.lt.map(m=>{
    if(lc==="all")return{label:m.label,retainer:Object.values(m.cl).reduce((s,c)=>s+c.r,0),cost:Object.values(m.cl).reduce((s,c)=>s+c.c,0)};
    const x=m.cl[lc];return{label:m.label,retainer:x?.r||0,cost:x?.c||0};
  });
  const rd=rc==="all"?C.cvd:C.cvd.filter(d=>d.cid===rc);

  const KPI=({label,value,sub,Icon,dark,iBg,iC,bg,bd})=>(
    <Card style={{background:dark?"#0f172a":bg||"#fff",borderColor:bd||"#e2e8f0",padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{fontSize:10,color:dark?"#94a3b8":"#64748b",margin:0,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
          <p style={{fontSize:18,fontWeight:800,color:dark?"#fff":iC||"#0f172a",margin:"5px 0 3px"}}>{value}</p>
          <p style={{fontSize:10,color:dark?"#94a3b8":"#64748b",margin:0}}>{sub}</p>
        </div>
        <div style={{background:dark?"#1e293b":iBg||"#f1f5f9",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:dark?"#6ee7b7":iC||"#64748b"}}>{Icon&&<Icon size={18} strokeWidth={1.75}/>}</div>
      </div>
    </Card>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h1><p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Overview of finance and team metrics</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Calendar size={14} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>
          <Sel value={month} onChange={setMonth} options={MONTHS.map(m=>({v:m,l:fmtLong(m)}))} style={{width:160}}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:4,maxWidth:380}}>
        {[["finance",TrendingUp,"Financial Analysis"],["team",Users,"Team & Renewals"]].map(([v,Ic,l])=>(
          <button key={v} onClick={()=>setFinTab(v)} style={{flex:1,padding:"7px 10px",borderRadius:8,border:"none",background:finTab===v?"#fff":"transparent",fontWeight:finTab===v?700:500,fontSize:12,color:finTab===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:finTab===v?"0 1px 3px rgba(0,0,0,.1)":"none",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6}}><Ic size={14} strokeWidth={1.75}/>{l}</button>
        ))}
      </div>

      {finTab==="finance"&&(
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            <KPI dark label="Total Revenue"        value={SAR(C.tr)}  sub="Monthly retainers"    Icon={Wallet}/>
            <KPI label="Resource Cost"       value={SAR(C.tc)}  sub="Employee costs"       Icon={Coins} iBg="#fef3c7" iC="#d97706"/>
            <KPI label="Gross Profit"        value={SAR(C.tp)}  sub={`${C.am.toFixed(1)}% margin`} Icon={BarChart3} iBg={C.tp>=0?"#d1fae5":"#fee2e2"} iC={C.tp>=0?"#10b981":"#EF4444"} bg={C.tp>=0?"#f0fdf4":"#fff5f5"} bd={C.tp>=0?"#a7f3d0":"#fecaca"}/>
            <KPI label="Total Contract Value" value={SAR(C.tcv)} sub="Remaining contract value"  Icon={ClipboardList} iBg="#e6f7f0" iC="#008A57"/>
            <KPI label="Active Contracts"    value={C.acnt}     sub={`${C.lm} low margin`}  Icon={FileText} iBg="#e6f7f0" iC="#008A57"/>
          </div>
          <Card style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12}}>
              <p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>LifeTime — Monthly Retainer vs Resource Cost (Closed Months)</p>
              <Sel value={lc} onChange={setLc} options={[{v:"all",l:"All Clients"},...C.sc.map(c=>({v:c,l:c}))]} style={{width:155}}/>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ltd} margin={{top:5,right:15,left:5,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:"#64748b"}}/>
                <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}/>
                <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                <Bar dataKey="retainer" name="Contract Value" fill="#008A57" radius={[4,4,0,0]}/>
                <Bar dataKey="cost"     name="Resource Cost"  fill="#475569" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Card style={{padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10}}>
                <p style={{margin:0,fontWeight:700,fontSize:12,color:"#0f172a",lineHeight:1.5}}>Monthly Retainer vs Monthly Cost</p>
                <Sel value={rc} onChange={setRc} options={[{v:"all",l:"All Clients"},...[].map(c=>({v:c.id,l:c.name}))]} style={{width:135}}/>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={rd} margin={{top:5,right:5,left:0,bottom:36}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                  <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                  <Legend wrapperStyle={{fontSize:10,color:"#64748b",lineHeight:1.5}}/>
                  <Bar dataKey="monthly" name="Monthly Retainer" fill="#008A57" radius={[4,4,0,0]}/>
                  <Bar dataKey="cost"    name="Monthly Cost"     fill="#475569" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card style={{padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10}}>
                <p style={{margin:0,fontWeight:700,fontSize:12,color:"#0f172a",lineHeight:1.5}}>Department Budget vs Cost</p>
                <Sel value={dc} onChange={setDc} options={[{v:"all",l:"All Clients"},...[].map(c=>({v:c.id,l:c.name}))]} style={{width:135}}/>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={C.dbc(dc)} margin={{top:5,right:5,left:0,bottom:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}}/>
                  <YAxis tick={{fontSize:9,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                  <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                  <Legend wrapperStyle={{fontSize:10,color:"#64748b",lineHeight:1.5}}/>
                  <Bar dataKey="budget" name="Budget"      fill="#008A57" radius={[4,4,0,0]}/>
                  <Bar dataKey="cost"   name="Actual Cost" fill="#475569" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"13px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Client Profitability</p></div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#fff"}}>{["Client","Retainer","Cost","Profit","Margin"].map((h,i)=><th key={h} style={{padding:"7px 14px",textAlign:i===0?"left":i===4?"center":"right",fontSize:11,fontWeight:600,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>{C.cp.slice(0,5).map(c=>{const neg=c.gp<0,low=c.mp<20;return(<tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:neg?"#fff5f5":low?"#fffbeb":"#fff"}}>
                <td style={{padding:"9px 14px",fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{c.name}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13}}>{SAR(c.mr)}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13,color:"#64748b",fontVariantNumeric:"tabular-nums",lineHeight:1.5}}>{SAR(c.rc)}</td>
                <td style={{padding:"9px 14px",textAlign:"right",fontSize:13,fontWeight:700,color:neg?"#EF4444":"#10b981"}}>{SAR(c.gp)}</td>
                <td style={{padding:"9px 14px",textAlign:"center"}}><Bdg bg={neg?"#fee2e2":low?"#fef9c3":"#d1fae5"} color={neg?"#EF4444":low?"#d97706":"#10b981"}>{c.mp.toFixed(0)}%</Bdg></td>
              </tr>);})}</tbody>
            </table>
          </Card>
        </div>
      )}

      {finTab==="team"&&(
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            <KPI label="Active Employees"  value={dbEmployees.filter(e=>e.status==="Active").length} sub="Team members" Icon={Users} iBg="#e6f7f0" iC="#008A57"/>
            <KPI label="Fully Utilized"   value={C.fullyUtil.length} sub=">158h · ≥90% utilized" Icon={CheckCircle} iBg="#d1fae5" iC="#059669" bg="#f0fdf4" bd="#a7f3d0"/>
            <KPI label="Under Util."      value={C.underUtil.length} sub="<123h · below 70% capacity" Icon={TrendingDown} iBg={C.underUtil.length>0?"#fee2e2":"#f1f5f9"} iC={C.underUtil.length>0?"#ef4444":"#0f172a"} bg={C.underUtil.length>0?"#fef2f2":"#fff"} bd={C.underUtil.length>0?"#fca5a5":"#e2e8f0"}/>
            <KPI label="Renewals"         value={C.ren.length} sub="Within 60 days" Icon={CalendarClock} iBg="#e6f7f0" iC="#008A57" bg={C.ren.length>0?"#f0fdf4":"#fff"} bd={C.ren.length>0?"#a7f3d0":"#e2e8f0"}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
            <Card style={{padding:18}}>
              <p style={{margin:"0 0 14px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Team Utilization by Department</p>
              <DeptUtilizationCards eu={C.eu} HPM={HPM} fmtH={fmtH} allowedDepts={allowedDepts}/>
            </Card>
            <Card style={{padding:18}}>
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Contract Renewals</p>
              {C.ren.length===0?(<div style={{textAlign:"center",padding:"20px 0",color:"#64748b"}}><CalendarClock size={28} strokeWidth={1.5} style={{margin:"0 auto 6px",display:"block",color:"#94a3b8"}}/><p style={{fontSize:12}}>No renewals in 60 days</p></div>):(
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {C.ren.slice(0,4).map(c=>{const d=diffDays(c.ed),urg=d<=7,warn=d<=30&&!urg;return(<div key={c.id} style={{padding:10,borderRadius:9,border:`1px solid ${urg?"#fecaca":warn?"#fde68a":"#e2e8f0"}`,background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",lineHeight:1.5}}>{c.cn}</p><p style={{margin:"1px 0 0",fontSize:10,color:"#64748b",lineHeight:1.5}}>{fmtDate(c.ed)}</p></div>
                    <Bdg bg={urg?"#ef4444":warn?"#f59e0b":"#64748b"} color="#fff">{d}d</Bdg>
                  </div>);})}
                </div>
              )}
            </Card>
          </div>
          <CapacityCards eu={C.eu} HPM={HPM} fmtH={fmtH} month={month} fmtLong={fmtLong} allowedDepts={allowedDepts}/>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEES PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function EmployeesPage(){
  const {sb}=useAuth();
  const toast=useToast();
  const confirm=useConfirm();
  const [hoveredRow,setHoveredRow]=useState(null);
  const [emps,setEmps]=useState([]);
  const [loading,setLoading]=useState(true);
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

  useEffect(()=>{
    sb.from('employees').select('*').order('name').then(({data})=>{
      if(data) setEmps(data.map(e=>({...e,mc:e.monthly_cost||0,start:e.start_date||""})));
      setLoading(false);
    });
  },[sb]);

  const dbAdd=async p=>{
    const{data,error}=await sb.from('employees').insert([{
      name:p.name,designation:p.designation||"",department:p.department||"",
      location:p.location||null,
      monthly_cost:parseFloat(p.mc)||0,email:p.email||"",status:p.status||"Active",
      start_date:p.start||null,profile_picture_url:p.profile_picture_url||null
    }]).select().single();
    if(error){toast('Error: '+error.message,'error');return;}
    if(data){setEmps(x=>[...x,{...data,mc:data.monthly_cost,start:data.start_date}]);toast('Employee added successfully','success');}
  };
  const dbUpdate=async(id,p)=>{
    const{data,error}=await sb.from('employees').update({
      name:p.name,designation:p.designation||"",department:p.department||"",
      location:p.location||null,
      monthly_cost:parseFloat(p.mc)||0,email:p.email||"",status:p.status||"Active",
      start_date:p.start||null,inactive_effective_month:p.inactive_effective_month||null,
      profile_picture_url:p.profile_picture_url||null
    }).eq('id',id).select().single();
    if(error){toast('Error: '+error.message,'error');return;}
    if(data){setEmps(x=>x.map(e=>e.id===id?{...data,mc:data.monthly_cost,start:data.start_date}:e));toast('Employee updated','success');}
  };
  const dbDelete=async id=>{
    await sb.from('employees').delete().eq('id',id);
    setEmps(x=>x.filter(e=>e.id!==id));
  };

  const upd=(k,v)=>setForm(p=>({...p,[k]:v,...(k==="location"?{mc:{Jeddah:15000,Riyadh:18000}[v]||p.mc}:{})}));
  const openAdd=()=>{setEditing(null);setForm(EMPTY_EMP);setModalOpen(true);};
  const openEdit=e=>{setEditing(e);setForm({name:e.name,designation:e.designation,department:e.department,location:e.location,mc:e.mc,email:e.email,status:e.status,start:e.start});setModalOpen(true);};
  const close=()=>{setModalOpen(false);setEditing(null);};

  const [saving,setSaving]=useState(false);
  const handleSubmit=async e=>{
    e.preventDefault();
    const wasActive=editing?.status==="Active"||editing?.status==="On Leave";
    if(editing&&form.status==="Inactive"&&wasActive){setPendingInactive({id:editing.id,data:form});setInactiveModal(true);return;}
    setSaving(true);
    if(editing){ await dbUpdate(editing.id,{...form,mc:parseFloat(form.mc)||0}); }
    else{ await dbAdd({...form,mc:parseFloat(form.mc)||0}); }
    setSaving(false);
    close();
  };
  const confirmInactive=async()=>{
    if(!pendingInactive)return;
    await dbUpdate(pendingInactive.id,{...pendingInactive.data,inactive_effective_month:inactiveMonth,mc:pendingInactive.data.mc});
    setInactiveModal(false);setPendingInactive(null);close();
  };
  const del=async id=>{const ok=await confirm({title:'Remove employee?',message:'This employee will be permanently deleted. Their allocation history will be preserved.',danger:true,confirmLabel:'Remove'});if(ok){dbDelete(id);toast('Employee removed','success');}};
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
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Employees</h1><p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Manage your team members and their costs</p></div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="outline" style={{gap:6}}><Upload size={13} strokeWidth={1.75}/>Import</Btn>
          <Btn variant="primary" onClick={openAdd} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Add Employee</Btn>
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Search size={14} strokeWidth={1.75} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={locF} onChange={setLocF} options={[{v:"all",l:"All Locations"},{v:"Jeddah",l:"Jeddah"},{v:"Riyadh",l:"Riyadh"},{v:"Cairo",l:"Cairo"},{v:"Remote",l:"Remote"}]} style={{width:150}}/>
        <Btn variant="outline" style={{gap:6}}><Download size={13} strokeWidth={1.75}/>Export</Btn>
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
              {loading&&<SkeletonRows cols={7} rows={6}/>}
              {!loading&&sorted.map((emp,idx)=>{
                const hr=emp.mc/HPM;
                const sb=emp.status==="Active"?"#d1fae5":emp.status==="Inactive"?"#f1f5f9":"#fef9c3";
                const sc2=emp.status==="Active"?"#10b981":emp.status==="Inactive"?"#64748b":"#d97706";
                return(<tr key={emp.id} onMouseEnter={()=>setHoveredRow(emp.id)} onMouseLeave={()=>setHoveredRow(null)} style={{borderBottom:"1px solid #f1f5f9",background:hoveredRow===emp.id?"#f8fafc":idx%2===0?"#fff":"#fafafa",transition:"background .1s ease"}}>
                  <td style={{padding:"11px 13px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={emp.name}/><div><p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{emp.name}</p><p style={{margin:"1px 0 0",fontSize:11,color:"#64748b",lineHeight:1.5}}>{emp.designation}</p></div></div></td>
                  <td style={{padding:"11px 13px"}}><span style={{padding:"3px 9px",borderRadius:4,fontSize:11,fontWeight:600,background:({"Creative":"#e6f7f0","Production":"#fef9c3","Planning":"#e0f2fe","Client Servicing":"#f3e8ff"})[emp.department?.replace(" Department","")]||"#f1f5f9",color:({"Creative":"#008A57","Production":"#d97706","Planning":"#0ea5e9","Client Servicing":"#7c3aed"})[emp.department?.replace(" Department","")]||"#475569"}}>{emp.department?.replace(" Department","")}</span></td>
                  <td style={{padding:"11px 13px",fontSize:13,color:"#475569",lineHeight:1.5}}>{emp.location||"—"}</td>
                  <td style={{padding:"11px 13px",textAlign:"right",fontWeight:600,fontSize:13,color:"#0f172a",fontVariantNumeric:"tabular-nums",lineHeight:1.5}}>{SAR(emp.mc)}</td>
                  <td style={{padding:"11px 13px",textAlign:"right",fontSize:13,color:"#64748b",fontVariantNumeric:"tabular-nums",lineHeight:1.5}}>SAR {hr.toFixed(0)}/hr</td>
                  <td style={{padding:"11px 13px",textAlign:"center"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <Bdg bg={sb} color={sc2}>{emp.status}</Bdg>
                      {emp.status==="Inactive"&&emp.inactive_effective_month&&<span style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>from {emp.inactive_effective_month}</span>}
                    </div>
                  </td>
                  <td style={{padding:"11px 13px",textAlign:"right"}}><div style={{display:"flex",justifyContent:"flex-end",gap:4,opacity:hoveredRow===emp.id?1:0,transition:"opacity .15s ease"}}><Btn variant="ghost" size="sm" aria-label={`Edit ${emp.name}`} onClick={()=>openEdit(emp)}><Pencil size={14} strokeWidth={1.75}/></Btn><Btn variant="danger" size="sm" aria-label={`Delete ${emp.name}`} onClick={()=>del(emp.id)}><Trash2 size={14} strokeWidth={1.75}/></Btn></div></td>
                </tr>);
              })}
              {sorted.length>0&&<tr style={{background:"#f1f5f9",borderTop:"2px solid #cbd5e1"}}>
                <td colSpan={3} style={{padding:"9px 13px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Total ({filtered.length} employees)</td>
                <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{SAR(totalCost)}</td>
                <td colSpan={3}/>
              </tr>}
            </tbody>
          </table>
          {!loading&&sorted.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#64748b"}}><User size={36} strokeWidth={1.25} style={{margin:"0 auto 10px",display:"block",color:"#cbd5e1"}}/><p style={{fontSize:14}}>No employees found</p></div>}
        </div>
      </Card>

      <Modal open={modalOpen} onClose={close} title={editing?"Edit Employee":"Add New Employee"}>
        <form onSubmit={handleSubmit}><div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><Avatar name={form.name||"?"} size={50}/><div style={{flex:1}}><Lbl>Profile Picture</Lbl><input type="file" accept="image/*" disabled style={{fontSize:11,color:"#64748b",lineHeight:1.5}}/></div></div>
          <div><Lbl>Full Name *</Lbl><Inp value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Enter full name" required/></div>
          <div><Lbl>Designation *</Lbl><Inp value={form.designation} onChange={e=>upd("designation",e.target.value)} placeholder="Job title" required/></div>
          <div><Lbl>Department *</Lbl><Sel value={form.department} onChange={v=>upd("department",v)} options={[{v:"",l:"Select department"},...DEPTS.map(d=>({v:d,l:d}))]} style={{}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl>Location *</Lbl><Sel value={form.location} onChange={v=>upd("location",v)} options={["Jeddah","Riyadh","Cairo","Remote"].map(l=>({v:l,l}))}/></div>
            <div><Lbl>Status</Lbl><Sel value={form.status} onChange={v=>upd("status",v)} options={["Active","Inactive","On Leave"].map(s=>({v:s,l:s}))}/></div>
          </div>
          <div><Lbl>Monthly Cost (SAR) *</Lbl><Inp type="number" value={form.mc} onChange={e=>upd("mc",parseFloat(e.target.value))} placeholder="15000" required/></div>
          <div><Lbl>Email *</Lbl><Inp type="email" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="employee@company.com" required/></div>
          <div><Lbl>Start Date *</Lbl><Inp type="date" value={form.start} onChange={e=>upd("start",e.target.value)} required/></div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}><Btn variant="outline" onClick={close}>Cancel</Btn><Btn variant="primary" type="submit" disabled={saving} style={{gap:6,minWidth:90,justifyContent:"center"}}>{saving?<><Loader size={13} style={{animation:"spin .8s linear infinite"}}/>{editing?"Saving…":"Creating…"}</>:(editing?"Update Employee":"Create Employee")}</Btn></div>
        </div></form>
      </Modal>
      <Modal open={inactiveModal} onClose={()=>{setInactiveModal(false);setPendingInactive(null);}} title="Set Inactive Effective Month">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.5}}>From which month should this employee be considered inactive?</p>
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


function ClientsPage(){
  const {sb}=useAuth();
  const toast=useToast();
  const confirm=useConfirm();
  const [hoveredRow,setHoveredRow]=useState(null);
  const [clients,setClients]=useState([]);
  const [contracts,setContracts]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([
      sb.from('clients').select('*').order('name'),
      sb.from('contracts').select('id,client_id,contract_value,tenure_months,status,contract_category').eq('status','Active'),
    ]).then(([{data:cl},{data:ct}])=>{
      if(cl) setClients(cl);
      if(ct) setContracts(ct);
      setLoading(false);
    });
  },[sb]);
  const dbAdd=async p=>{
    const{data,error}=await sb.from('clients').insert([{
      name:p.name,industry:p.industry||"",status:p.status||"Active",
      contact_person:p.contact_person||"",
      contact_designation:p.contact_person_designation||p.contact_designation||"",
      contact_email:p.contact_email||"",contact_phone:p.contact_phone||"",notes:p.notes||""
    }]).select().single();
    if(error){
      console.error('Client insert error:',error);
      toast('Failed to save client: '+error.message,'error');
      return;
    }
    if(data) setClients(x=>[...x,data]);
    else toast('Client was not saved — check your permissions','error');
  };
  const dbUpdate=async(id,p)=>{
    const{data,error}=await sb.from('clients').update({
      name:p.name,industry:p.industry||"",status:p.status||"Active",
      contact_person:p.contact_person||"",
      contact_designation:p.contact_person_designation||p.contact_designation||"",
      contact_email:p.contact_email||"",contact_phone:p.contact_phone||"",notes:p.notes||""
    }).eq('id',id).select().single();
    if(error){console.error('Client update error:',error);toast('Failed to update: '+error.message,'error');return;}
    if(data) setClients(x=>x.map(c=>c.id===id?data:c));
  };
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

  const [saving,setSaving]=useState(false);
  const handleSubmit=async e=>{
    e.preventDefault();
    setSaving(true);
    if(editing){ await dbUpdate(editing.id,form); }
    else{ await dbAdd(form); }
    setSaving(false);
    close();
  };
  const del=async id=>{const ok=await confirm({title:'Remove client?',message:'This client and their data will be permanently deleted.',danger:true,confirmLabel:'Remove'});if(ok){dbDelete(id);toast('Client removed','success');}};
  const sort=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  // Link to real contracts by client_id
  const getContract=cid=>contracts.find(c=>c.client_id===cid&&c.status==="Active");

  const filtered=useMemo(()=>clients.filter(c=>{
    const ms=!search||c.name.toLowerCase().includes(search.toLowerCase())||c.industry.toLowerCase().includes(search.toLowerCase());
    return ms&&(statusF==="all"||c.status===statusF);
  }),[clients,search,statusF]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[filtered,sk,sd]);

  const statusStyle=s=>({
    Active:  {bg:"#d1fae5",color:"#10b981"},
    Prospect:{bg:"#dbeafe",color:"#008A57"},
    Inactive:{bg:"#f1f5f9",color:"#64748b"},
    Churned: {bg:"#fee2e2",color:"#EF4444"},
  }[s]||{bg:"#f1f5f9",color:"#64748b"});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Clients</h1>
          <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Manage your client portfolio</p>
        </div>
        <Btn variant="primary" onClick={openAdd} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Add Client</Btn>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Search size={14} strokeWidth={1.75} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={statusF} onChange={setStatusF} options={[{v:"all",l:"All Status"},{v:"Active",l:"Active"},{v:"Prospect",l:"Prospect"},{v:"Inactive",l:"Inactive"},{v:"Churned",l:"Churned"}]} style={{width:150}}/>
        <Btn variant="outline" style={{gap:6}}><Download size={13} strokeWidth={1.75}/>Export</Btn>
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
              {loading&&<SkeletonRows cols={6} rows={5}/>}
              {!loading&&sorted.map((client,idx)=>{
                const contract=getContract(client.id);
                const ss=statusStyle(client.status);
                return(
                  <tr key={client.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafafa"}}>
                    {/* Client name + industry */}
                    <td style={{padding:"12px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#008A57,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:15,flexShrink:0}}>
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{client.name}</p>
                          <p style={{margin:"1px 0 0",fontSize:11,color:"#64748b",lineHeight:1.5}}>{client.industry||"—"}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact info */}
                    <td style={{padding:"12px 13px"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:2}}>
                        {client.contact_person&&<p style={{margin:0,fontSize:13,fontWeight:500,color:"#0f172a"}}>{client.contact_person}</p>}
                        {client.contact_person_designation&&<p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>{client.contact_person_designation}</p>}
                        {client.contact_email&&<p style={{margin:"2px 0 0",fontSize:11,color:"#64748b",lineHeight:1.5,display:"flex",alignItems:"center",gap:3}}><Mail size={11} strokeWidth={1.75} style={{flexShrink:0}}/>{client.contact_email}</p>}
                        {client.contact_phone&&<p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5,display:"flex",alignItems:"center",gap:3}}><Phone size={11} strokeWidth={1.75} style={{flexShrink:0}}/>{client.contact_phone}</p>}
                      </div>
                    </td>
                    {/* Active contract */}
                    <td style={{padding:"12px 13px"}}>
                      {contract?(
                        <div>
                          <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>SAR {Math.round(contract.contract_value/contract.tenure_months).toLocaleString("en-US")}/mo</p>
                          <p style={{margin:"1px 0 0",fontSize:11,color:"#64748b",lineHeight:1.5}}>{contract.tenure_months} months</p>
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
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(client)}><Pencil size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(client.id)}><Trash2 size={14} strokeWidth={1.75}/></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length===0&&(
            <div style={{textAlign:"center",padding:"48px 24px",color:"#64748b"}}>
              <Building2 size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/>
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
                style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",lineHeight:1.5,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
              <Btn variant="outline" onClick={close}>Cancel</Btn>
              <Btn variant="primary" type="submit" disabled={saving} style={{gap:6,minWidth:90,justifyContent:"center"}}>{saving?<><Loader size={13} style={{animation:"spin .8s linear infinite"}}/>{editing?"Saving…":"Creating…"}</>:(editing?"Update Employee":"Create Employee")}</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}


// ─── ALLOCATIONS DATA & HELPERS (shared with ContractsPage) ─────────────────




function ContractSearchSelect({contracts,value,onChange}){
  const [search,setSearch]=useState("");
  const [catF,setCatF]=useState("all");
  const filtered=contracts.filter(c=>{
    const ms=!search||c.cn?.toLowerCase().includes(search.toLowerCase())||c.contract_number?.toLowerCase().includes(search.toLowerCase());
    return ms&&(catF==="all"||(c.contract_category||"Retainer")===catF);
  });
  const selected=contracts.find(c=>c.id===value);
  const catColors={all:{a:"#0f172a",b:"#f1f5f9"},Retainer:{a:"#1d4ed8",b:"#dbeafe"},Project:{a:"#047857",b:"#e6f7f0"},Adhoc:{a:"#d97706",b:"#fef9c3"}};
  return(
    <div style={{border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"flex",borderBottom:"1px solid #f1f5f9"}}>
        {["all","Retainer","Project","Adhoc"].map(cat=>{
          const act=catF===cat; const c=catColors[cat];
          return <button key={cat} type="button" onClick={()=>setCatF(cat)} style={{flex:1,padding:"4px 2px",fontSize:10,fontWeight:600,border:"none",background:act?c.b:"#fff",color:act?c.a:"#94a3b8",cursor:"pointer",borderBottom:act?`2px solid ${c.a}`:"2px solid transparent"}}>{cat==="all"?"All":cat}</button>;
        })}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",borderBottom:"1px solid #f1f5f9"}}>
        <Search size={12} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:1,fontSize:11,outline:"none",border:"none",background:"transparent",color:"#0f172a"}}/>
        {selected&&<button type="button" onClick={()=>onChange("")} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#64748b",border:"none",background:"none",cursor:"pointer"}}><X size={12} strokeWidth={2}/></button>}
      </div>
      {selected&&<div style={{padding:"3px 8px",background:"#e6f7f0",fontSize:11,fontWeight:600,color:"#008A57",borderBottom:"1px solid #c7ebd9",display:"flex",alignItems:"center",gap:5}}><Check size={11} strokeWidth={2.5}/>{selected.contract_number} – {selected.cn}</div>}
      <div style={{maxHeight:110,overflowY:"auto"}}>
        {filtered.length===0
          ?<p style={{padding:"6px 8px",fontSize:11,color:"#64748b",lineHeight:1.5,textAlign:"center"}}>No contracts</p>
          :filtered.map(c=>(
            <button key={c.id} type="button" onClick={()=>{onChange(c.id);setSearch("");}}
              style={{width:"100%",textAlign:"left",padding:"5px 8px",fontSize:11,border:"none",background:c.id===value?"#e6f7f0":"#fff",cursor:"pointer",borderBottom:"1px solid #f8fafc",display:"flex",gap:6,alignItems:"baseline"}}>
              <span style={{fontFamily:"monospace",color:"#64748b",flexShrink:0}}>{c.contract_number}</span>
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
  const toast=useToast();
  const confirm=useConfirm();
  const [saving,setSaving]=useState(false);
  const [hoveredRow,setHoveredRow]=useState(null);
  const [contracts,setContracts]=useState([]);
  const [clientList,setClientList]=useState([]); // real clients from Supabase
  const [loading,setLoading]=useState(true);
  const mapC=r=>({...r,cn:r.client_name,cid:r.client_id,cv:r.contract_value,tm:r.tenure_months,sd:r.start_date,ed:r.end_date,st:r.status,bcs:r.budget_client_servicing,bp:r.budget_production,bc:r.budget_creative,bpl:r.budget_planning});
  useEffect(()=>{
    // Load contracts and clients in parallel
    Promise.all([
      sb.from('contracts').select('*').order('contract_number'),
      sb.from('clients').select('id,name').order('name')
    ]).then(([{data:ctData},{data:clData}])=>{
      if(ctData) setContracts(ctData.map(mapC));
      if(clData) setClientList(clData);
      setLoading(false);
    });
  },[sb]);
  const dbAdd=async p=>{const{data,error}=await sb.from('contracts').insert([{contract_number:p.contract_number,client_id:p.client_id||null,client_name:p.client_name,contract_value:parseFloat(p.contract_value)||0,tenure_months:parseFloat(p.tenure_months)||0,project_name:p.project_name||"",start_date:p.start_date,end_date:p.end_date,status:p.status,contract_category:p.contract_category,budget_client_servicing:parseFloat(p.budget_client_servicing)||0,budget_production:parseFloat(p.budget_production)||0,budget_creative:parseFloat(p.budget_creative)||0,budget_planning:parseFloat(p.budget_planning)||0,budget_third_party:parseFloat(p.budget_third_party)||0,notes:p.notes||""}]).select().single();if(error){toast('Error saving: '+error.message,'error');return;}if(data){setContracts(x=>[...x,mapC(data)]);toast('Contract created','success');}};
  const dbUpdate=async(id,p)=>{const{data,error}=await sb.from('contracts').update({contract_number:p.contract_number,client_id:p.client_id||null,client_name:p.client_name,contract_value:parseFloat(p.contract_value)||0,tenure_months:parseFloat(p.tenure_months)||0,project_name:p.project_name||"",start_date:p.start_date,end_date:p.end_date,status:p.status,contract_category:p.contract_category,budget_client_servicing:parseFloat(p.budget_client_servicing)||0,budget_production:parseFloat(p.budget_production)||0,budget_creative:parseFloat(p.budget_creative)||0,budget_planning:parseFloat(p.budget_planning)||0,budget_third_party:parseFloat(p.budget_third_party)||0,notes:p.notes||""}).eq('id',id).select().single();if(error){toast('Error updating: '+error.message,'error');return;}if(data){setContracts(x=>x.map(c=>c.id===id?mapC(data):c));toast('Contract updated','success');}};
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
  const handleClient=cid=>{const cl=clientList.find(c=>c.id===cid);setForm(p=>({...p,client_id:cid,client_name:cl?.name||""}));};

  const getCatFromTenure=t=>t<=4?"Adhoc":t<=8?"Project":"Retainer";
  const genContractNum=(t,cons)=>{
    const y=new Date().getFullYear();
    const pre=t<=4?`ADH-${y}-`:t<=8?`PRJ-${y}-`:`CTR-${y}-`;
    const nums=cons.filter(c=>c.contract_number?.startsWith(pre)).map(c=>parseInt(c.contract_number.split("-").pop())||0);
    return `${pre}${String((Math.max(0,...nums)+1)).padStart(3,"0")}`;
  };

  const openAdd =()=>{setEditing(null);setForm(EMPTY_CONTRACT);setModalOpen(true);};
  const openEdit=c=>{setEditing(c);setForm({client_id:c.client_id,client_name:c.client_name,project_name:c.project_name||"",contract_value:c.contract_value,tenure_months:c.tenure_months,start_date:c.start_date,end_date:c.end_date,status:c.status,contract_category:c.contract_category,budget_client_servicing:c.budget_client_servicing||"",budget_production:c.budget_production||"",budget_creative:c.budget_creative||"",budget_planning:c.budget_planning||"",budget_third_party:c.budget_third_party||"",contract_pdf_url:c.contract_pdf_url||"",notes:c.notes||"",contract_number:c.contract_number});setModalOpen(true);};
  const close=()=>{setModalOpen(false);setEditing(null);};

  const handleSubmit=async e=>{
    e.preventDefault();
    const totalAlloc=[form.budget_client_servicing,form.budget_production,form.budget_creative,form.budget_planning,form.budget_third_party].reduce((s,v)=>s+(parseFloat(v)||0),0);
    const cv=parseFloat(form.contract_value)||0;
    const totalAllocCheck=[form.budget_client_servicing,form.budget_production,form.budget_creative,form.budget_planning,form.budget_third_party].reduce((s,v)=>s+(parseFloat(v)||0),0);
    if(Math.abs(totalAllocCheck-cv)>0.01){toast(`Total dept allocation (SAR ${totalAllocCheck.toLocaleString()}) must equal contract value (SAR ${cv.toLocaleString()})`);return;}
    const expired=form.end_date&&new Date(form.end_date)<new Date();
    const autoStatus=expired?"Expired":"Active";
    const autoCat=getCatFromTenure(form.tenure_months);
    const payload={...form,status:autoStatus,contract_category:autoCat};
    setSaving(true);
    if(editing){
      await dbUpdate(editing.id,payload);
    } else {
      const num=genContractNum(form.tenure_months,contracts);
      await dbAdd({...payload,contract_number:num});
    }
    setSaving(false);
    close();
  };

  const del=async id=>{const ok=await confirm({title:'Delete contract?',message:'This contract will be permanently deleted. Existing allocations linked to it will lose their contract reference.',danger:true,confirmLabel:'Delete'});if(ok){dbDelete(id);toast('Contract deleted','success');}};
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
    {label:"Client Servicing",key:"budget_client_servicing",bg:"#eff6ff",border:"#bfdbfe",color:"#008A57"},
    {label:"Production",      key:"budget_production",       bg:"#f5f3ff",border:"#ddd6fe",color:"#047857"},
    {label:"Creative",        key:"budget_creative",         bg:"#f0fdf4",border:"#bbf7d0",color:"#10b981"},
    {label:"Planning",        key:"budget_planning",         bg:"#fffbeb",border:"#fde68a",color:"#d97706"},
    {label:"3rd Party",       key:"budget_third_party",      bg:"#fff1f2",border:"#fecdd3",color:"#e11d48"},
  ].map(w=>({...w,total:contracts.reduce((s,c)=>s+((parseFloat(c[w.key])||0)),0)}));

  const totalAlloc=(parseFloat(form.budget_client_servicing)||0)+(parseFloat(form.budget_production)||0)+(parseFloat(form.budget_creative)||0)+(parseFloat(form.budget_planning)||0)+(parseFloat(form.budget_third_party)||0);
  const formCV=parseFloat(form.contract_value)||0;
  const allocMatch=formCV>0&&Math.abs(totalAlloc-formCV)<0.01;
  const allocOver=totalAlloc>formCV;

  const catStyle=c=>({Retainer:{bg:"#dbeafe",col:"#2563eb"},Project:{bg:"#e6f7f0",col:"#008A57"},Adhoc:{bg:"#fef9c3",col:"#d97706"}}[c]||{bg:"#f1f5f9",col:"#475569"});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Contracts</h1><p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Manage client contracts and retainers</p></div>
        <Btn variant="primary" onClick={openAdd} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Add Contract</Btn>
      </div>

      {/* Budget summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {budgetSummary.map(w=>(
          <Card key={w.label} style={{background:w.bg,borderColor:w.border,padding:"12px 14px"}}>
            <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:w.color,margin:"0 0 6px"}}>{w.label}</p>
            <p style={{fontSize:18,fontWeight:800,color:w.color,margin:"0 0 2px"}}>SAR {w.total.toLocaleString("en-US")}</p>
            <p style={{fontSize:10,color:"#64748b",lineHeight:1.5,margin:0}}>across all contracts</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <Search size={14} strokeWidth={1.75} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..." style={{width:"100%",padding:"8px 12px 8px 30px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <Sel value={statusF} onChange={setStatusF} options={[{v:"all",l:"All Status"},{v:"Active",l:"Active"},{v:"Expired",l:"Expired"}]} style={{width:140}}/>
        <Sel value={catF} onChange={setCatF} options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{width:160}}/>
        <Btn variant="outline" style={{gap:6}}><Download size={13} strokeWidth={1.75}/>Export</Btn>
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
              {loading&&<SkeletonRows cols={8} rows={5}/>}
              {!loading&&sorted.map((c,idx)=>{
                const dl=daysBetween(c.end_date,new Date().toISOString().slice(0,10));
                const soon=dl>=0&&dl<=30,expired=dl<0;
                const monthly=Math.round(c.contract_value/c.tenure_months);
                const cs=catStyle(c.contract_category);
                const rowBg=expired?"#fff5f5":soon?"#fffbeb":idx%2===0?"#fff":"#fafafa";
                return(
                  <tr key={c.id} onMouseEnter={()=>setHoveredRow(c.id)} onMouseLeave={()=>setHoveredRow(null)} style={{borderBottom:"1px solid #f1f5f9",background:hoveredRow===c.id?"#f8fafc":rowBg,transition:"background .1s ease"}}>
                    <td style={{padding:"11px 13px"}}><span style={{background:"#f1f5f9",color:"#475569",padding:"2px 8px",borderRadius:5,fontSize:11,fontWeight:600,fontFamily:"monospace"}}>{c.contract_number||"—"}</span></td>
                    <td style={{padding:"11px 13px",fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{c.client_name}</td>
                    <td style={{padding:"11px 13px"}}><Bdg bg={cs.bg} color={cs.col}>{c.contract_category||"Retainer"}</Bdg></td>
                    <td style={{padding:"11px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>SAR {c.contract_value.toLocaleString("en-US")}</td>
                    <td style={{padding:"11px 13px",textAlign:"right",fontSize:13,color:"#475569",lineHeight:1.5}}>SAR {monthly.toLocaleString("en-US")}</td>
                    <td style={{padding:"11px 13px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{fmtDateShort(c.start_date)} to {fmtDateShort(c.end_date)}</span>
                      </div>
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}>
                      {expired
                        ?<Bdg bg="#fee2e2" color="#EF4444">{dl} days</Bdg>
                        :soon
                          ?<Bdg bg="#fef9c3" color="#d97706"><span style={{display:"inline-flex",alignItems:"center",gap:3}}><AlertTriangle size={10} strokeWidth={2}/>{dl}d left</span></Bdg>
                          :<Bdg bg="#f1f5f9" color="#64748b">{dl}d left</Bdg>
                      }
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"center"}}>
                      <Bdg bg={expired?"#fee2e2":"#d1fae5"} color={expired?"#EF4444":"#10b981"}>{expired?"Expired":"Active"}</Bdg>
                    </td>
                    <td style={{padding:"11px 13px",textAlign:"right"}}>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(c)}><Pencil size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(c.id)}><Trash2 size={14} strokeWidth={1.75}/></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              {sorted.length>0&&(
                <tr style={{background:"#f1f5f9",borderTop:"2px solid #cbd5e1"}}>
                  <td colSpan={3} style={{padding:"9px 13px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>TOTAL</td>
                  <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>SAR {sorted.reduce((s,c)=>s+(parseFloat(c.contract_value)||0),0).toLocaleString("en-US")}</td>
                  <td style={{padding:"9px 13px",textAlign:"right",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>SAR {sorted.reduce((s,c)=>s+Math.round((parseFloat(c.contract_value)||0)/(parseFloat(c.tenure_months)||1)),0).toLocaleString("en-US")}</td>
                  <td colSpan={4}/>
                </tr>
              )}
            </tbody>
          </table>
          {sorted.length===0&&<div style={{textAlign:"center",padding:"48px 24px",color:"#64748b"}}><FileText size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/><p style={{fontSize:14}}>No contracts found</p></div>}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editing?"Edit Contract":"Add New Contract"}>
        <form onSubmit={handleSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {editing&&form.contract_number&&(
              <div style={{padding:"8px 12px",background:"#f1f5f9",borderRadius:8}}><p style={{margin:0,fontSize:12,color:"#475569",lineHeight:1.5}}>Contract ID: <strong style={{color:"#0f172a"}}>{form.contract_number}</strong></p></div>
            )}
            <div><Lbl>Client *</Lbl>
              <Sel value={form.client_id} onChange={handleClient} options={[{v:"",l:"Select client"},...clientList.map(c=>({v:c.id,l:c.name}))]}/>
            </div>
            <div><Lbl>Project Name *</Lbl><Inp value={form.project_name||""} onChange={e=>upd("project_name",e.target.value)} placeholder="Enter project name..." required/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Contract Value (SAR) *</Lbl><Inp type="number" value={form.contract_value||""} onChange={e=>upd("contract_value",e.target.value)} placeholder="Total value" required/></div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <Lbl>Tenure (Months) *</Lbl>
                  {form.tenure_months>0&&(
                    <span style={{
                      fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:999,
                      ...(getCatFromTenure(form.tenure_months)==="Retainer"?{background:"#dbeafe",color:"#2563eb"}:
                         getCatFromTenure(form.tenure_months)==="Project"?{background:"#e6f7f0",color:"#008A57"}:
                         {background:"#fef9c3",color:"#d97706"})
                    }}>{getCatFromTenure(form.tenure_months)}</span>
                  )}
                </div>
                <Inp type="number" min="1" value={form.tenure_months||""} onChange={e=>handleTenure(e.target.value)} placeholder="e.g. 12" required/>
              </div>
            </div>
            {form.contract_value&&form.tenure_months>0&&(
              <div style={{padding:"8px 12px",background:"#fff",borderRadius:8}}>
                <p style={{margin:0,fontSize:12,color:"#475569",lineHeight:1.5}}>Monthly Retainer: <strong style={{color:"#0f172a"}}>SAR {Math.round(parseFloat(form.contract_value)/form.tenure_months).toLocaleString("en-US")}</strong></p>
              </div>
            )}
            {/* Dept Budget Allocation */}
            <div style={{border:"1px solid #e2e8f0",borderRadius:10,padding:14,background:"#fff"}}>
              <p style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:"#475569"}}>Budget Allocation by Department</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["budget_client_servicing","Client Servicing Dept"],["budget_production","Production Dept"],["budget_creative","Creative Dept"],["budget_planning","Planning Dept"],["budget_third_party","3rd Party"]].map(([k,l])=>(
                  <div key={k}><Lbl>{l}</Lbl><Inp type="number" min="0" value={form[k]||""} onChange={e=>upd(k,e.target.value===""?"":parseFloat(e.target.value)||0)} placeholder=""/></div>
                ))}
              </div>
              <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:allocMatch?"#d1fae5":allocOver?"#fee2e2":"#fef9c3",border:`1px solid ${allocMatch?"#a7f3d0":allocOver?"#fecaca":"#fde68a"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,fontWeight:600,color:"#475569"}}>Total Allocated:</span>
                <span style={{fontSize:13,fontWeight:700,color:allocMatch?"#10b981":allocOver?"#EF4444":"#d97706"}}>
                  SAR {totalAlloc.toLocaleString("en-US")}
                  {formCV>0&&<span style={{fontSize:11,fontWeight:400,color:"#64748b",marginLeft:6}}>/ SAR {formCV.toLocaleString("en-US")}</span>}
                </span>
              </div>
              <p style={{margin:"6px 0 0",fontSize:10,color:"#94a3b8",fontStyle:"italic"}}>Amounts exclude VAT</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Start Date *</Lbl><Inp type="date" value={form.start_date} onChange={e=>handleStartDate(e.target.value)} required/></div>
              <div><Lbl>End Date *</Lbl><Inp type="date" value={form.end_date} onChange={e=>upd("end_date",e.target.value)} required/></div>
            </div>
            <div><Lbl>Contract PDF</Lbl><Inp type="file" accept="application/pdf" disabled style={{color:"#64748b"}}/></div>
            <div><Lbl>Notes</Lbl>
              <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Contract notes..." rows={2} style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",lineHeight:1.5,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
              <Btn variant="outline" onClick={close}>Cancel</Btn>
              <Btn variant="primary" type="submit" disabled={saving} style={{gap:6,minWidth:90,justifyContent:"center"}}>{saving?<><Loader size={13} style={{animation:"spin .8s linear infinite"}}/>{editing?"Saving…":"Creating…"}</>:(editing?"Update Employee":"Create Employee")}</Btn>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}


// ─── ADD ALLOCATION FORM (extracted component to respect React hook rules) ────
function AddAllocationForm({newForm,setNewForm,realEmps,realContracts,allocs,HPM,getRemainingHours,ALLOC_MONTHS,isActive,onClose,onSubmit,saving=false}){
  const{month,empStatus,clientId,clientCat,notes,rows}=newForm;
  const upd=(k,v)=>setNewForm(p=>({...p,[k]:v}));
  const onLeave=empStatus==="on_leave";

  const monthContracts=month?realContracts.filter(c=>isActive(c,month)):realContracts;
  const catContracts=clientCat==="all"?monthContracts:monthContracts.filter(c=>(c.contract_category||"Retainer")===clientCat);

  const catBadge=cat=>({
    Retainer:{bg:"#e6f7f0",color:"#008A57"},
    Project: {bg:"#e0f2fe",color:"#0ea5e9"},
    Adhoc:   {bg:"#fef9c3",color:"#d97706"},
  }[cat]||{bg:"#f1f5f9",color:"#475569"});

  const activeEmps=realEmps.filter(e=>e.status==="Active"||(e.status==="Inactive"&&e.inactive_effective_month&&month&&e.inactive_effective_month>=month));

  const addRow=()=>setNewForm(p=>({...p,rows:[...p.rows,{id:Date.now(),empId:"",hours:""}]}));
  const removeRow=id=>setNewForm(p=>({...p,rows:p.rows.filter(r=>r.id!==id)}));
  const updRow=(id,k,v)=>setNewForm(p=>({...p,rows:p.rows.map(r=>r.id===id?{...r,[k]:v}:r)}));

  const canSubmit=month&&(onLeave?rows.some(r=>r.empId):clientId&&rows.some(r=>r.empId&&parseFloat(r.hours)>0));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Month + Status */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Lbl>Month *</Lbl>
          <Sel value={month} onChange={v=>upd("month",v)} options={[{v:"",l:"Select month"},...ALLOC_MONTHS]}/>
        </div>
        <div>
          <Lbl>Employee Status *</Lbl>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            {[{v:"in_duty",l:"In Duty",color:"#008A57",bg:"#e6f7f0"},{v:"on_leave",l:"On Leave",color:"#d97706",bg:"#fef9c3"}].map(opt=>(
              <button key={opt.v} type="button" onClick={()=>upd("empStatus",opt.v)} style={{
                flex:1,padding:"7px 10px",borderRadius:8,border:`1.5px solid ${empStatus===opt.v?opt.color:"#e2e8f0"}`,
                background:empStatus===opt.v?opt.bg:"#fff",color:empStatus===opt.v?opt.color:"#64748b",
                cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s"
              }}>{opt.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* On Leave notice */}
      {onLeave&&(
        <div style={{padding:"8px 12px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
          <AlertTriangle size={13} strokeWidth={2} color="#d97706"/>
          <p style={{margin:0,fontSize:12,color:"#92400e",lineHeight:1.5}}>All other fields are disabled. Select employee(s) below and click Save — allocation saved with 0 hours and marked On Leave.</p>
        </div>
      )}

      {/* Client Name + Category filter */}
      <div style={{opacity:onLeave?.4:1,pointerEvents:onLeave?"none":"auto",transition:"opacity .2s"}}>
        <Lbl>Client Name {!onLeave&&"*"}</Lbl>
        <div style={{display:"flex",gap:4,marginBottom:6,marginTop:4}}>
          {["all","Retainer","Project","Adhoc"].map(cat=>{
            const bs=catBadge(cat);
            const active=clientCat===cat;
            return(
              <button key={cat} type="button" onClick={()=>upd("clientCat",cat)} style={{
                padding:"3px 10px",borderRadius:999,border:`1px solid ${active?bs.color:"#e2e8f0"}`,
                background:active?bs.bg:"#fff",color:active?bs.color:"#64748b",
                cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s"
              }}>{cat==="all"?"All":cat}</button>
            );
          })}
        </div>
        <select value={clientId} onChange={e=>upd("clientId",e.target.value)} style={{
          width:"100%",padding:"8px 12px",border:"1px solid #e2e8f0",
          borderRadius:8,fontSize:13,outline:"none",background:"#fff",
          color:clientId?"#0f172a":"#94a3b8",appearance:"none",cursor:"pointer"
        }}>
          <option value="">Select client…</option>
          {catContracts.map(c=>{
            const cat=c.contract_category||"Retainer";
            return <option key={c.id} value={c.id}>{c.cn||c.client_name} — {cat}</option>;
          })}
        </select>
        {clientId&&(()=>{
          const ct=realContracts.find(c=>c.id===clientId);
          const cat=ct?.contract_category||"Retainer";
          const bs=catBadge(cat);
          return(
            <div style={{marginTop:5,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,color:"#0f172a",fontWeight:600}}>{ct?.cn||ct?.client_name}</span>
              <span style={{padding:"2px 7px",borderRadius:999,background:bs.bg,color:bs.color,fontSize:10,fontWeight:600}}>{cat}</span>
            </div>
          );
        })()}
      </div>

      {/* Employee rows */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Lbl>Employees *</Lbl>
          <button type="button" onClick={addRow} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,color:"#008A57"}}>
            <Plus size={12} strokeWidth={2}/>Add Employee
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {rows.map((row)=>{
            const rem=row.empId&&month?getRemainingHours(row.empId,month):HPM;
            const hoursNum=parseFloat(row.hours)||0;
            const overAlloc=hoursNum>rem;
            return(
              <div key={row.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
                <div style={{flex:2,minWidth:0}}>
                  <select value={row.empId} onChange={e=>updRow(row.id,"empId",e.target.value)} style={{
                    width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:7,
                    fontSize:12,outline:"none",background:"#fff",color:row.empId?"#0f172a":"#94a3b8",appearance:"none"
                  }}>
                    <option value="">Select employee…</option>
                    {activeEmps.map(e=><option key={e.id} value={e.id}>{e.name} — {(e.department||"").replace(" Department","")}</option>)}
                  </select>
                </div>
                {!onLeave&&(
                  <div style={{flex:1,minWidth:0}}>
                    <input type="number" min="0" max={rem} value={row.hours}
                      onChange={e=>updRow(row.id,"hours",e.target.value)}
                      placeholder="Hours"
                      style={{width:"100%",padding:"7px 10px",border:`1px solid ${overAlloc?"#fca5a5":"#e2e8f0"}`,borderRadius:7,fontSize:12,outline:"none",background:overAlloc?"#fef2f2":"#fff",boxSizing:"border-box"}}
                    />
                    {row.empId&&month&&(
                      <p style={{margin:"2px 0 0",fontSize:10,lineHeight:1.4,color:overAlloc?"#ef4444":"#64748b"}}>
                        {overAlloc?`⚠ Exceeds ${fmtH(rem)}h limit`:`${fmtH(Math.max(0,rem-hoursNum))}h remaining`}
                      </p>
                    )}
                  </div>
                )}
                {rows.length>1&&(
                  <button type="button" onClick={()=>removeRow(row.id)} style={{padding:"6px",borderRadius:6,border:"1px solid #fecaca",background:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center"}}>
                    <X size={12} strokeWidth={2} color="#ef4444"/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Lbl>Notes (optional)</Lbl>
        <textarea value={notes} onChange={e=>upd("notes",e.target.value)} placeholder="Any notes for this allocation batch…" rows={2}
          style={{width:"100%",padding:"8px 12px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,outline:"none",resize:"none",lineHeight:1.5,fontFamily:"inherit",boxSizing:"border-box",color:"#0f172a"}}/>
      </div>

      {/* Actions */}
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4}}>
        <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
        <Btn variant="primary" onClick={onSubmit} disabled={!canSubmit||saving} style={{gap:6,minWidth:140,justifyContent:"center"}}>
          {saving
            ? <><Loader size={13} style={{animation:"spin .8s linear infinite"}}/>Saving…</>
            : <><Plus size={13} strokeWidth={2}/>{onLeave?"Save On Leave":"Create Allocations"}</>
          }
        </Btn>
      </div>

    </div>
  );
}

function AllocationsPage(){
  const {sb,allowedDepts}=useAuth();
  const toast=useToast();
  const confirm=useConfirm();
  const [allocs,setAllocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const mapA=a=>({...a,eid:a.employee_id,cid:a.client_id,h:a.allocated_hours});
  useEffect(()=>{
    sb.from('allocations').select('*').order('month',{ascending:false}).then(({data})=>{if(data)setAllocs(data.map(mapA));setLoading(false);});
  },[sb]);
  const dbBulkAdd=async items=>{const rows=items.map(a=>({employee_id:a.employee_id,employee_name:a.employee_name,employee_monthly_cost:a.employee_monthly_cost||0,client_id:a.client_id||null,client_name:a.client_name||'',contract_id:a.contract_id||null,allocated_hours:a.allocated_hours||0,month:a.month,status:a.status||'Assigned',notes:a.notes||''}));const{data,error}=await sb.from('allocations').insert(rows).select();if(error)throw new Error(error.message);if(data)setAllocs(p=>[...p,...data.map(mapA)]);};
  const dbUpdate=async(id,p)=>{const{data}=await sb.from('allocations').update({allocated_hours:p.allocated_hours,month:p.month,notes:p.notes}).eq('id',id).select().single();if(data)setAllocs(x=>x.map(a=>a.id===id?mapA(data):a));};
  const dbDelete=async id=>{await sb.from('allocations').delete().eq('id',id);setAllocs(x=>x.filter(a=>a.id!==id));};
  const [search,setSearch]       = useState("");
  const [filterEmp,setFilterEmp] = useState("all");
  const [filterCli,setFilterCli] = useState("all");
  const [filterDept,setFilterDept]=useState("all");
  const [filterCat,setFilterCat] = useState("all");
  const [chartMonth,setChartMonth]=usePersistState("pp_alloc_month","2026-04");
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [formStep,setFormStep]   = useState(1);
  const [selMonth,setSelMonth]   = useState("");
  const [selEmpIds,setSelEmpIds] = useState([]);
  const [empAllocs,setEmpAllocs] = useState({});
  const [empSearch,setEmpSearch] = useState("");
  const [confirmOpen,setConfirmOpen]=useState(false);
  const [editForm,setEditForm]   = useState({allocated_hours:"",month:"2026-04",notes:""});
  // New form state
  const [newForm,setNewForm]=useState({month:"",empStatus:"in_duty",clientId:"",clientCat:"all",notes:"",rows:[{id:1,empId:"",hours:""}]});
  const [expandedMonths,setExpandedMonths] = useState(()=>new Set([currentMonth]));
  const [monthViewMode,setMonthViewMode]   = useState({});
  const [realEmps,setRealEmps]   = useState([]);
  const [realContracts,setRealContracts] = useState([]);
  const [snapshots,setSnapshots] = useState([]);

  useEffect(()=>{
    Promise.all([
      sb.from('employees').select('*').order('name'),
      sb.from('contracts').select('*'),
      sb.from('monthly_snapshots').select('month,is_closed'),
    ]).then(([{data:e},{data:ct},{data:sn}])=>{
      if(e) setRealEmps(e.map(x=>({...x,mc:parseFloat(x.monthly_cost)||0})).filter(x=>!allowedDepts||allowedDepts.includes(x.department)));
      if(ct) setRealContracts(ct.map(x=>({...x,cid:x.client_id,cn:x.client_name,cv:parseFloat(x.contract_value)||0,tm:parseFloat(x.tenure_months)||1,sd:x.start_date,ed:x.end_date,st:x.status})));
      if(sn) setSnapshots(sn);
    });
  },[sb]);
  const [sk,setSk]=useState("employee_name");
  const [sd,setSd]=useState("asc");
  const sortFn=k=>{if(sk===k)setSd(d=>d==="asc"?"desc":"asc");else{setSk(k);setSd("asc");}};

  const availMonths=useMemo(()=>[...new Set(allocs.map(a=>a.month).filter(Boolean))].sort().reverse(),[allocs]);

  const utilForMonth=useCallback((month)=>{
    const map={};
    (realEmps).forEach(emp=>{
      const h=allocs.filter(a=>a.employee_id===emp.id&&a.month===month).reduce((s,a)=>s+(a.allocated_hours||0),0);
      map[emp.id]={totalHours:h,availableHours:Math.max(0,HPM-h),percentage:(h/HPM)*100};
    });
    return map;
  },[allocs]);

  const utilMap=useMemo(()=>utilForMonth(chartMonth),[utilForMonth,chartMonth]);

  const contractsForMonth=useMemo(()=>{
    if(!selMonth) return [];
    return (realContracts).filter(c=>isActive(c,selMonth));
  },[selMonth]);

  const getRemainingHours=(empId,month,excludeId=null)=>{
    const used=allocs.filter(a=>a.employee_id===empId&&a.month===month&&a.id!==excludeId).reduce((s,a)=>s+(a.allocated_hours||0),0);
    return Math.max(0,HPM-used);
  };

  const filtered=useMemo(()=>allocs.filter(a=>{
    const emp=(realEmps).find(e=>e.id===a.employee_id);
    const ct=(realContracts).find(c=>c.id===a.contract_id);
    const ms=!search||a.employee_name?.toLowerCase().includes(search.toLowerCase())||a.client_name?.toLowerCase().includes(search.toLowerCase());
    const isOnLeave=a.status==="On Leave";
    const deptAllowed = !allowedDepts || allowedDepts.includes(emp?.department);
    return ms&&deptAllowed&&(filterEmp==="all"||a.employee_id===filterEmp)&&(filterCli==="all"||a.client_id===filterCli)&&(filterDept==="all"||emp?.department===filterDept)&&(filterCat==="all"||isOnLeave||(ct?.contract_category||"Retainer")===filterCat);
  }),[allocs,search,filterEmp,filterCli,filterDept,filterCat]);

  // Group allocations by month for the new grouped view
  const groupedMonths=useMemo(()=>{
    const months=[...new Set(filtered.map(a=>a.month))].sort().reverse();
    return months.map(month=>({
      month,
      label:fmtLong(month),
      isClosed:snapshots.some(s=>s.month===month&&s.is_closed),
      items:filtered.filter(a=>a.month===month),
    }));
  },[filtered,snapshots]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{
    const av=a[sk]||"",bv=b[sk]||"";
    if(typeof av==="number") return sd==="asc"?av-bv:bv-av;
    return sd==="asc"?(av+"").localeCompare(bv+""):(bv+"").localeCompare(av+"");
  }),[filtered,sk,sd]);

  const chartAllocs=useMemo(()=>allocs.filter(a=>a.month===chartMonth),[allocs,chartMonth]);
  // Mirror Base44: inactive employees whose inactive_effective_month >= chartMonth still count
  const isEmpActiveForMonth=(e,month)=>e.status==="Active"||(e.status==="Inactive"&&e.inactive_effective_month&&e.inactive_effective_month>=month);
  const activeEmps=(realEmps).filter(e=>isEmpActiveForMonth(e,chartMonth));
  const totalCap=activeEmps.length*HPM;
  const utilizedHours=chartAllocs.reduce((s,a)=>s+(a.allocated_hours||0),0);
  const availHours=Math.max(0,totalCap-utilizedHours);
  const pieData=[{name:"Utilized",hours:utilizedHours},{name:"Available",hours:availHours}];
  const clientChartData=useMemo(()=>{
    const map={};
    chartAllocs.forEach(a=>{map[a.client_name]=(map[a.client_name]||0)+(a.allocated_hours||0);});
    return Object.entries(map).map(([name,hours])=>({name,hours})).sort((a,b)=>b.hours-a.hours).slice(0,6);
  },[chartAllocs]);

  const closeModal=()=>{setModalOpen(false);setEditing(null);setFormStep(1);setSelMonth("");setSelEmpIds([]);setEmpAllocs({});setEmpSearch("");setConfirmOpen(false);setNewForm({month:"",empStatus:"in_duty",clientId:"",clientCat:"all",notes:"",rows:[{id:1,empId:"",hours:""}]});};
  const openAdd=()=>{setEditing(null);setFormStep(1);setSelMonth("");setSelEmpIds([]);setEmpAllocs({});setNewForm({month:"",empStatus:"in_duty",clientId:"",clientCat:"all",notes:"",rows:[{id:1,empId:"",hours:""}]});setModalOpen(true);};
  const openEdit=a=>{setEditing(a);setEditForm({allocated_hours:a.allocated_hours,month:a.month,notes:a.notes||""});setModalOpen(true);};

  const handleEmpToggle=(id,checked)=>{
    if(checked){setSelEmpIds(p=>[...p,id]);setEmpAllocs(p=>({...p,[id]:{hours:"",notes:"",client_id:""}}));}
    else{setSelEmpIds(p=>p.filter(x=>x!==id));setEmpAllocs(p=>{const n={...p};delete n[id];return n;});}
  };
  const updEmpAlloc=(id,k,v)=>setEmpAllocs(p=>({...p,[id]:{...p[id],[k]:v}}));

  const [newFormSaving,setNewFormSaving]=useState(false);
  const handleNewSubmit=async()=>{
    if(newFormSaving)return; // prevent double-submit
    const{month,empStatus,clientId,notes,rows}=newForm;
    if(!month)return;
    setNewFormSaving(true);
    try{
      if(empStatus==="on_leave"){
        const onLeaveRows=rows.filter(r=>r.empId).map(r=>{
          const emp=realEmps.find(e=>e.id===r.empId);
          return{employee_id:r.empId,employee_name:emp?.name||"",employee_monthly_cost:emp?.mc||0,
                 client_id:null,client_name:"",contract_id:null,
                 allocated_hours:0,month,status:"On Leave",notes:notes||""};
        });
        if(onLeaveRows.length) await dbBulkAdd(onLeaveRows);
        toast(`${onLeaveRows.length} On Leave allocation(s) saved`,"success");
      } else {
        const ct=realContracts.find(c=>c.id===clientId);
        const toCreate=rows.filter(r=>r.empId&&parseFloat(r.hours)>0).map(r=>{
          const emp=realEmps.find(e=>e.id===r.empId);
          return{employee_id:r.empId,employee_name:emp?.name||"",employee_monthly_cost:emp?.mc||0,
                 client_id:ct?.cid||ct?.client_id||"",client_name:ct?.cn||ct?.client_name||"",
                 contract_id:clientId,allocated_hours:parseFloat(r.hours),
                 month,status:"Assigned",notes:notes||""};
        });
        if(toCreate.length) await dbBulkAdd(toCreate);
        toast(`${toCreate.length} allocation(s) created`,"success");
      }
      closeModal();
    } catch(err){
      console.error("Allocation save error:",err);
      toast("Failed to save allocations. Please try again.","error");
    } finally{
      setNewFormSaving(false);
    }
  };

  const handleBulkSubmit=async()=>{
    const toCreate=selEmpIds.flatMap(eid=>{
      const ea=empAllocs[eid]||{};
      if(!ea.client_id||!parseFloat(ea.hours)) return [];
      const emp=(realEmps).find(e=>e.id===eid);
      const ct=contractsForMonth.find(c=>c.id===ea.client_id);
      return [{
        employee_id:eid, employee_name:emp?.name||"",
        employee_monthly_cost:emp?.mc||0,
        client_id:ct?.cid||ct?.client_id||"", client_name:ct?.cn||ct?.client_name||"",
        contract_id:ea.client_id, allocated_hours:parseFloat(ea.hours),
        month:selMonth, status:ea.status||"Assigned", notes:ea.notes||""
      }];
    });
    if(toCreate.length) await dbBulkAdd(toCreate);
    closeModal();
  };

  const handleEditSubmit=async e=>{
    e.preventDefault();
    const rem=getRemainingHours(editing.employee_id,editForm.month,editing.id);
    if(parseFloat(editForm.allocated_hours)>rem+editing.allocated_hours){toast(`Only ${rem+editing.allocated_hours}h available.`);return;}
    await dbUpdate(editing.id,{allocated_hours:parseFloat(editForm.allocated_hours),month:editForm.month,notes:editForm.notes});
    closeModal();
  };

  const del=async id=>{const ok=await confirm({title:'Delete allocation?',message:'This allocation will be permanently removed.',danger:true,confirmLabel:'Delete'});if(ok){dbDelete(id);toast('Allocation deleted','success');}};
  const statusBadge=s=>s==="Assigned"?{bg:"#d1fae5",col:"#10b981"}:s==="On Leave"?{bg:"#fef9c3",col:"#d97706"}:{bg:"#f1f5f9",col:"#64748b"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Team Allocations</h1><p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Assign employees to client projects</p></div>
        <Btn variant="primary" onClick={openAdd} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Add Allocation</Btn>
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
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5,display:"flex",alignItems:"center",gap:7}}><PieChartIcon size={14} strokeWidth={1.75} style={{color:"#64748b"}}/>Hours Utilization</p>
          {totalCap>0?(
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="hours" labelLine={false}>
                      <Cell fill="#008A57"/><Cell fill="#e2e8f0"/>
                    </Pie>
                    <Tooltip formatter={v=>`${Math.round(v)} hrs`}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,minWidth:120}}>
                <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:10,height:10,borderRadius:"50%",background:"#008A57"}}/><span style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>Utilized</span></div><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{fmtH(utilizedHours)}h</p><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>{totalCap>0?((utilizedHours/totalCap)*100).toFixed(0):0}% of capacity</p></div>
                <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:10,height:10,borderRadius:"50%",background:"#e2e8f0"}}/><span style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>Available</span></div><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{fmtH(availHours)}h</p><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>of {fmtH(totalCap)}h total</p></div>
                <div style={{paddingTop:7,borderTop:"1px solid #f1f5f9"}}><p style={{margin:"0 0 1px",fontSize:10,color:"#64748b",lineHeight:1.5}}>Resources</p><p style={{margin:0,fontSize:17,fontWeight:800,color:"#0f172a"}}>{activeEmps.length}</p><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>active employees</p></div>
              </div>
            </div>
          ):<div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontSize:13}}>No allocation data</div>}
        </Card>

        <Card style={{padding:18}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5,display:"flex",alignItems:"center",gap:7}}><Users size={14} strokeWidth={1.75} style={{color:"#64748b"}}/>Top Clients by Hours</p>
          {clientChartData.length>0?(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={clientChartData} margin={{top:5,right:5,left:0,bottom:36}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                <YAxis tick={{fontSize:9,fill:"#64748b"}}/>
                <Tooltip formatter={v=>`${v} hrs`}/>
                <Bar dataKey="hours" fill="#008A57" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontSize:13}}>No allocation data</div>}
        </Card>
      </div>

      {/* Capacity cards — all active employees for chartMonth (mirrors Base44) */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
        {(realEmps).filter(e=>isEmpActiveForMonth(e,chartMonth)).map(emp=>{
          const u=utilMap[emp.id]||{totalHours:0,availableHours:HPM,percentage:0};
          const ov=u.percentage>100,ok=u.percentage>=70&&u.percentage<=100;
          const border=ov?"#fecaca":ok?"#a7f3d0":"#fde68a";
          const bg2=ov?"#fff5f5":ok?"#f0fdf4":"#fffbeb";
          const clr=ov?"#EF4444":ok?"#10b981":"#d97706";
          return(
            <Card key={emp.id} style={{background:bg2,borderColor:border,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:8,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:clr,flexShrink:0}}>{emp.name.slice(0,2).toUpperCase()}</div>
                  <div><p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",lineHeight:1.5}}>{emp.name}</p><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>{emp.designation}</p></div>
                </div>
                {ov&&<AlertTriangle size={12} strokeWidth={2} style={{color:"#ef4444",flexShrink:0}}/>}
              </div>
              <PBar val={u.percentage} color={clr}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",lineHeight:1.5,marginTop:3}}>
                <span>{fmtH(u.totalHours)}h allocated</span><span>{fmtH(u.availableHours)}h available</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      {/* ── Search / Filter bar ─────────────────────────────────── */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Search row */}
        <div style={{position:"relative",width:"100%"}}>
          <Search size={14} strokeWidth={1.75} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search allocations..."
            style={{width:"100%",padding:"8px 10px 8px 32px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {/* Filters row */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <Sel value={filterEmp} onChange={setFilterEmp} options={[{v:"all",l:"All Employees"},...[...new Set((realEmps).map(e=>e.id))].map(id=>{const e=(realEmps).find(x=>x.id===id);return{v:id,l:e?.name||id};})]} style={{flex:1,minWidth:150}}/>
          <Sel value={filterCli} onChange={setFilterCli} options={[{v:"all",l:"All Clients"},...[...new Set(allocs.map(a=>a.client_name))].filter(Boolean).map(c=>({v:c,l:c}))]} style={{flex:1,minWidth:140}}/>
          <Sel value={filterDept} onChange={setFilterDept} options={[{v:"all",l:"All Departments"},...(allowedDepts||DEPTS).map(d=>({v:d,l:d.replace(" Department","")}))]  } style={{flex:1,minWidth:150}}/>
          <Sel value={filterCat} onChange={setFilterCat} options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{flex:1,minWidth:130}}/>
          <Btn variant="outline" size="sm" onClick={()=>{const rows=sorted.map(a=>[a.employee_name,a.client_name,a.allocated_hours,a.month,a.status]);exportXLSX([["Employee","Client","Hours","Month","Status"],...rows],"Allocations","allocations.xlsx");}} style={{gap:6,flexShrink:0}}><Download size={13} strokeWidth={1.75}/>Export</Btn>
        </div>
      </div>

      {/* ── Grouped by Month ─────────────────────────────────────── */}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>
        {groupedMonths.length===0
          ?<Card><div style={{textAlign:"center",padding:40,color:"#94a3b8"}}><Users size={32} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/><p style={{fontSize:14}}>No allocations found</p></div></Card>
          :groupedMonths.map(({month,label,isClosed,items})=>{
            const expanded=expandedMonths.has(month);
            const totalHours=items.reduce((s,a)=>s+(parseFloat(a.allocated_hours)||0),0);
            const empCount=[...new Set(items.map(a=>a.employee_id))].length;
            return(
              <Card key={month} style={{overflow:"hidden",border:isClosed?"1px solid #a7f3d0":"1px solid #e2e8f0",background:isClosed?"#f0fdf4":"#fff"}}>
                {/* Month header - click to expand/collapse */}
                <div onClick={()=>setExpandedMonths(prev=>{const s=new Set(prev);s.has(month)?s.delete(month):s.add(month);return s;})}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer",userSelect:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {isClosed?<Lock size={15} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>:<Calendar size={15} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>}
                    <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>{label}</p>
                    {isClosed&&<span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:600,background:"#d1fae5",color:"#059669"}}>Closed</span>}
                    <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,background:"#f1f5f9",color:"#475569"}}>{empCount} employee{empCount!==1?"s":""}</span>
                    <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,background:"#eff6ff",color:"#3b82f6"}}>{fmtH(totalHours)}h total</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {expanded&&(
                      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:8,padding:3}}>
                        <button onClick={e=>{e.stopPropagation();setMonthViewMode(prev=>({...prev,[month]:"list"}));}}
                          style={{padding:"3px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
                            background:(!monthViewMode[month]||monthViewMode[month]==="list")?"#fff":"transparent",
                            color:(!monthViewMode[month]||monthViewMode[month]==="list")?"#0f172a":"#64748b",
                            boxShadow:(!monthViewMode[month]||monthViewMode[month]==="list")?"0 1px 3px rgba(0,0,0,.1)":"none"}}>≡ List</button>
                        <button onClick={e=>{e.stopPropagation();setMonthViewMode(prev=>({...prev,[month]:"cards"}));}}
                          style={{padding:"3px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
                            background:monthViewMode[month]==="cards"?"#fff":"transparent",
                            color:monthViewMode[month]==="cards"?"#0f172a":"#64748b",
                            boxShadow:monthViewMode[month]==="cards"?"0 1px 3px rgba(0,0,0,.1)":"none"}}>⊞ Cards</button>
                      </div>
                    )}
                    <span style={{fontSize:14,color:"#94a3b8",transition:"transform .2s",display:"inline-block",transform:expanded?"rotate(90deg)":"rotate(0deg)"}}>›</span>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded&&(
                  <div style={{borderTop:"1px solid #e2e8f0"}}>
                    {(!monthViewMode[month]||monthViewMode[month]==="list")?(
                      /* LIST VIEW */
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                        <thead><tr>
                          {["Employee","Client","Hours/Month","Status","Actions"].map((h,i)=>(
                            <th key={h} style={{padding:"8px 13px",textAlign:i>=2&&i<=3?"center":i===4?"right":"left",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {items.map((a,i)=>{
                            const emp=(realEmps).find(e=>e.id===a.employee_id);
                            const sb2=statusBadge(a.status);
                            return(
                              <tr key={a.id} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                                <td style={{padding:"10px 13px"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                                    <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#008A57)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,flexShrink:0}}>{(a.employee_name||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                                    <div><p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{a.employee_name||"—"}</p><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>{emp?.department?.replace(" Department","")||""}</p></div>
                                  </div>
                                </td>
                                <td style={{padding:"10px 13px",color:"#0f172a"}}>{a.status==="On Leave"?<span style={{fontSize:11,fontWeight:600,color:"#d97706",background:"#fef9c3",padding:"2px 8px",borderRadius:999}}>On Leave</span>:(a.client_name||"—")}</td>
                                <td style={{padding:"10px 13px",textAlign:"center"}}>
                                  <span style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f1f5f9",padding:"3px 10px",borderRadius:999,fontSize:12}}>
                                    <span style={{display:"inline-flex",alignItems:"center",gap:4}}><Clock size={11} strokeWidth={1.75}/>{a.allocated_hours} hrs</span>
                                  </span>
                                </td>
                                <td style={{padding:"10px 13px",textAlign:"center"}}>
                                  <span style={{padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:600,background:sb2.bg,color:sb2.color}}>{a.status}</span>
                                </td>
                                <td style={{padding:"10px 13px",textAlign:"right"}}>
                                  <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                                    {isClosed
                                      ?<Lock size={14} strokeWidth={1.75} title="Month is closed — cannot edit" style={{cursor:"not-allowed",opacity:0.35,color:"#64748b"}}/>
                                      :<Btn variant="ghost" size="sm" onClick={()=>openEdit(a)}><Pencil size={14} strokeWidth={1.75}/></Btn>}
                                    {!isClosed&&<Btn variant="danger" size="sm" onClick={()=>del(a.id)}><Trash2 size={14} strokeWidth={1.75}/></Btn>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ):(
                      /* CARD VIEW */
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,padding:16}}>
                        {items.map(a=>{
                          const emp=(realEmps).find(e=>e.id===a.employee_id);
                          const util=utilForMonth(month)[a.employee_id]||{totalHours:0,availableHours:HPM,percentage:0};
                          const pct=Math.min(100,util.percentage||0);
                          const clr=pct>100?"#ef4444":pct>=70?"#10b981":"#d97706";
                          const sb2=statusBadge(a.status);
                          return(
                            <div key={a.id} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:12,background:"#fff",display:"flex",flexDirection:"column",gap:8}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#008A57)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{(a.employee_name||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                                <div style={{flex:1,minWidth:0}}>
                                  <p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",lineHeight:1.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.employee_name||"—"}</p>
                                  <p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>{emp?.department?.replace(" Department","")||""}</p>
                                </div>
                                {isClosed
                                  ?<Lock size={13} strokeWidth={1.75} title="Closed" style={{opacity:0.4,color:"#64748b"}}/>
                                  :<Btn variant="ghost" size="sm" onClick={()=>openEdit(a)}><Pencil size={14} strokeWidth={1.75}/></Btn>}
                              </div>
                              <p style={{margin:0,fontSize:12,color:"#475569",lineHeight:1.5,fontWeight:500}}>{a.client_name||"—"}</p>
                              <div style={{background:"#e2e8f0",borderRadius:99,height:6,overflow:"hidden"}}>
                                <div style={{width:`${pct}%`,height:"100%",background:clr,borderRadius:99,transition:"width .3s"}}/>
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",lineHeight:1.5}}>
                                <span>{fmtH(a.allocated_hours)}h allocated</span>
                                <span>{fmtH(util.availableHours)}h free</span>
                              </div>
                              <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:600,background:sb2.bg,color:sb2.color,alignSelf:"flex-start"}}>{a.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        }
      </div>

      {/* Add / Edit modal */}
      {/* ─── ALLOCATION MODAL ─────────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={closeModal} title={editing?"Edit Allocation":"Add Allocation"}>

        {/* EDIT MODE — unchanged */}
        {editing&&(
          <form onSubmit={handleEditSubmit}>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{padding:"8px 12px",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
                <p style={{margin:0,fontSize:12,color:"#475569",lineHeight:1.5}}>Employee: <strong style={{color:"#0f172a"}}>{editing.employee_name}</strong></p>
                <p style={{margin:"2px 0 0",fontSize:12,color:"#475569",lineHeight:1.5}}>Client: <strong style={{color:"#0f172a"}}>{editing.client_name}</strong></p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <Lbl>Hours/Month *</Lbl>
                  <Inp type="number" min="0" value={editForm.allocated_hours} onChange={e=>setEditForm(p=>({...p,allocated_hours:e.target.value}))} required/>
                  <p style={{margin:"3px 0 0",fontSize:10,color:"#64748b",lineHeight:1.5}}>{fmtH(getRemainingHours(editing.employee_id,editForm.month,editing.id)+editing.allocated_hours)}h available</p>
                </div>
                <div><Lbl>Month *</Lbl><Sel value={editForm.month} onChange={v=>setEditForm(p=>({...p,month:v}))} options={ALLOC_MONTHS}/></div>
              </div>
              <div><Lbl>Notes</Lbl><Inp value={editForm.notes} onChange={e=>setEditForm(p=>({...p,notes:e.target.value}))} placeholder="Allocation notes..."/></div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn variant="primary" type="submit">Update</Btn></div>
            </div>
          </form>
        )}

        {/* ADD MODE — new single-step form */}
        {!editing&&<AddAllocationForm
          newForm={newForm} setNewForm={setNewForm}
          realEmps={realEmps} realContracts={realContracts}
          allocs={allocs} month={newForm.month}
          HPM={HPM} getRemainingHours={getRemainingHours}
          ALLOC_MONTHS={ALLOC_MONTHS} isActive={isActive}
          onClose={closeModal} onSubmit={handleNewSubmit}
          saving={newFormSaving}
        />}
      </Modal>

      {/* Confirm dialog */}
      <Modal open={confirmOpen} onClose={()=>setConfirmOpen(false)} title="Confirm Allocations">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{margin:0,fontSize:13,color:"#475569",lineHeight:1.5}}>Create <strong>{selEmpIds.filter(id=>empAllocs[id]?.client_id&&parseFloat(empAllocs[id]?.hours)>0).length}</strong> allocation(s) for <strong>{ALLOC_MONTHS.find(m=>m.v===selMonth)?.l}</strong>?</p>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><Btn variant="outline" onClick={()=>setConfirmOpen(false)}>Cancel</Btn><Btn variant="primary" onClick={handleBulkSubmit}>Confirm</Btn></div>
        </div>
      </Modal>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const REPORT_COLORS = ['#008A57','#475569','#10b981','#f59e0b','#ef4444','#94a3b8'];

// Shared mock snapshots for custom reports tab (extends the existing SNAPSHOTS)

// ── Excel export helper (uses SheetJS loaded from CDN) ──────────────────────
const exportXLSX = (wsData, sheetName, filename) => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  script.onload = () => {
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
    window.XLSX.writeFile(wb, filename);
  };
  if(window.XLSX) {
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, sheetName);
    window.XLSX.writeFile(wb, filename);
  } else {
    document.head.appendChild(script);
  }
};

const exportPDFTable = (title, headers, rows, filename) => {
  const script = document.createElement('script');
  const doExport = () => {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF({orientation:'landscape'});
    const pw = doc.internal.pageSize.getWidth();
    doc.setFontSize(13); doc.text(title, pw/2, 14, {align:'center'});
    doc.setFontSize(9); doc.text(new Date().toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}), pw/2, 20, {align:'center'});
    const colW = Math.floor((pw-20)/headers.length);
    const colX = headers.map((_,i)=>10+i*colW);
    let y=30;
    doc.setFillColor(30,41,59); doc.rect(10,y-4,pw-20,7,'F');
    doc.setTextColor(255,255,255); doc.setFont(undefined,'bold');
    headers.forEach((h,i)=>doc.text(String(h),colX[i],y,{maxWidth:colW-1}));
    doc.setTextColor(0,0,0); doc.setFont(undefined,'normal');
    y+=8;
    rows.forEach(row=>{
      if(y>190){doc.addPage();y=20;}
      row.forEach((v,i)=>doc.text(String(v??''),colX[i],y,{maxWidth:colW-1}));
      y+=6;
    });
    doc.save(filename);
  };
  if(window.jspdf) { doExport(); }
  else {
    script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload=doExport;
    document.head.appendChild(script);
  }
};

function ReportsPage(){
  const {sb} = useAuth();
  const [section,setSection]   = usePersistState("pp_reports_section","charts");
  const [chartTab,setChartTab] = usePersistState("pp_reports_chart_tab","profit-by-client");
  const [customTab,setCustomTab]= useState("revenue-profit-contract");
  const [selMonth,setSelMonth] = usePersistState("pp_reports_month",currentMonth);
  const [selDept,setSelDept]   = useState("all");
  const [selClosedClient,setSelClosedClient] = useState("all");
  const [selRevMonth,setSelRevMonth]   = useState("all");
  const [selRevCat,setSelRevCat]       = useState("all");
  const [selUtilMonth,setSelUtilMonth] = useState(currentMonth);
  const [selDeptMonth,setSelDeptMonth] = useState(currentMonth);
  const [selDeptCapMonth,setSelDeptCapMonth] = useState(currentMonth);

  // ── Real data from Supabase ──────────────────────────────────────────────────
  const [realEmployees,setRealEmployees] = useState([]);
  const [realContracts,setRealContracts] = useState([]);
  const [realClients,setRealClients]     = useState([]);
  const [realAllocs,setRealAllocs]       = useState([]);
  const [realSnapshots,setRealSnapshots] = useState([]);
  const [dataLoaded,setDataLoaded]       = useState(false);

  useEffect(()=>{
    Promise.all([
      sb.from('employees').select('*'),
      sb.from('contracts').select('*'),
      sb.from('clients').select('*'),
      sb.from('allocations').select('*'),
      sb.from('monthly_snapshots').select('*'),
    ]).then(([{data:e},{data:ct},{data:cl},{data:al},{data:sn}])=>{
      if(e)  setRealEmployees(e.map(x=>({...x,mc:parseFloat(x.monthly_cost)||0,id:x.id})));
      if(ct) setRealContracts(ct.map(x=>({...x,cn:x.client_name,cid:x.client_id,cv:parseFloat(x.contract_value)||0,tm:parseFloat(x.tenure_months)||1,sd:x.start_date,ed:x.end_date,st:x.status,bcs:parseFloat(x.budget_client_servicing)||0,bp:parseFloat(x.budget_production)||0,bc:parseFloat(x.budget_creative)||0,bpl:parseFloat(x.budget_planning)||0})));
      if(cl) setRealClients(cl);
      if(al) setRealAllocs(al.map(x=>({...x,eid:x.employee_id,cid:x.client_id,h:parseFloat(x.allocated_hours)||0})));
      if(sn) setRealSnapshots(sn);
      setDataLoaded(true);
    });
  },[sb]);

  // Build allocsByMonth-style lookup from real allocations
  const allocsByMonth = useMemo(()=>{
    const m={};
    realAllocs.forEach(a=>{
      if(!m[a.month]) m[a.month]=[];
      m[a.month].push(a);
    });
    return m;
  },[realAllocs]);

  // Use real data if available, fall back to mock for display
  // REAL DATA ONLY — no mock fallbacks
  const USE_EMPLOYEES = realEmployees;
  const USE_CONTRACTS = realContracts;
  const USE_CLIENTS   = realClients;
  const USE_SNAPSHOTS = realSnapshots.map(s=>({
    month:s.month, client_name:s.client_name, contract_number:s.contract_number,
    contract_value:parseFloat(s.monthly_retainer)*12,
    monthly_retainer:parseFloat(s.monthly_retainer)||0,
    allocated_hours:parseFloat(s.allocated_hours)||0,
    resource_cost:parseFloat(s.resource_cost)||0,
    profit:parseFloat(s.profit)||0,
    status:"Active", contract_category:"Retainer"
  }));

  // ── Calculations ────────────────────────────────────────────────────────────
  const R = useMemo(()=>{
    const als = (allocsByMonth[selMonth]||[]);
    const em  = {};
    USE_EMPLOYEES.forEach(e=>{em[e.id]={...e,hr:(e.mc||e.monthly_cost||0)/HPM};});
    const ac  = USE_CONTRACTS.filter(c=>isActive(c,selMonth));
    const cm  = {};
    ac.forEach(c=>{cm[c.cid]={...c,mr:c.cv/c.tm};});

    // 1. Profit by Client
    const profitByClient = USE_CLIENTS.filter(cl=>cm[cl.id]).map(cl=>{
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
    const cashFlow=(()=>{
      if(USE_CONTRACTS.length===0) return [];
      const allDates=USE_CONTRACTS.flatMap(c=>[c.sd,c.ed]).filter(Boolean);
      if(!allDates.length) return [];
      const minD=allDates.reduce((a,b)=>a<b?a:b);
      const maxD=allDates.reduce((a,b)=>a>b?a:b);
      const months=[];
      let d=new Date(minD.slice(0,7)+"-01");
      const endD=new Date(maxD.slice(0,7)+"-01");
      while(d<=endD){months.push(d.toISOString().slice(0,7));d=new Date(d.getFullYear(),d.getMonth()+1,1);}
      return months.map(mk=>{
        const ml=new Date(mk+"-01").toLocaleString("en-US",{month:"short",year:"numeric"});
        const rev=USE_CONTRACTS.filter(c=>c.st==="Active"&&isActive(c,mk)).reduce((s,c)=>s+(parseFloat(c.cv)||0)/(parseFloat(c.tm)||1),0);
        const cost=USE_EMPLOYEES.filter(e=>e.status==="Active").reduce((s,e)=>s+(parseFloat(e.mc)||0),0);
        const net=rev-cost; cumulative+=net;
        return{month:ml,expectedRevenue:Math.round(rev),expectedCost:Math.round(cost),netCashFlow:Math.round(net),cumulativeCash:Math.round(cumulative)};
      });
    })();

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
    USE_SNAPSHOTS.forEach(s=>{
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
    const uniqueClosedClients=[...new Set(USE_SNAPSHOTS.map(s=>s.client_name))];

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
    const col=m<0?"#EF4444":m<20?"#d97706":"#10b981";
    return <Bdg bg={bg} color={col}>{pct(m)}</Bdg>;
  };
  const riskBadge=(level)=>{
    const s={High:{bg:"#ef4444",col:"#fff"},Medium:{bg:"#f59e0b",col:"#fff"},Low:{bg:"#008A57",col:"#fff"}}[level]||{bg:"#e2e8f0",col:"#64748b"};
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
    {id:"dept-capacity-budget",    label:"Dept Capacity vs Budget"},
    {id:"contract-revenue-forecast",label:"Contract Revenue Forecast"},
  ];

  // ── Table header style ───────────────────────────────────────────────────────
  const TH=({children,align="left"})=><th style={{padding:"8px 12px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TDark=({children,align="left"})=><th style={{padding:"8px 12px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{children}</th>;
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

  const ExportBtn=({label,onClick})=>{
    const cleanLabel=(label||"").replace(/^[⬇⬆]\s*/,"").trim();
    return(
      <Btn variant="outline" size="sm" onClick={onClick} style={{gap:6}}><Download size={12} strokeWidth={1.75}/>{cleanLabel}</Btn>
    );
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Reports</h1>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Detailed analysis and insights</p>
      </div>

      {/* Top section tabs */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:12,padding:4,maxWidth:420}}>
        {[["charts",TrendingUp,"Charts & Graphs"],["custom",ClipboardList,"Custom Reports"]].map(([v,Ic,l])=>(
          <button key={v} onClick={()=>setSection(v)} style={{flex:1,padding:"9px 14px",borderRadius:9,border:"none",background:section===v?"#fff":"transparent",fontWeight:section===v?700:500,fontSize:13,color:section===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:section===v?"0 1px 3px rgba(0,0,0,.1)":"none",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}><Ic size={14} strokeWidth={1.75}/>{l}</button>
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
                  <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Month:</span>
                  <Sel value={selMonth} onChange={setSelMonth} options={MONTHS.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <ExportBtn label="CSV" onClick={()=>exportCSV(R.profitByClient.map(c=>[c.name,c.contractValue,c.tenure,c.resourceCost,c.monthlyProfit,c.marginPercent.toFixed(2),c.allocatedHours]),["Client","Contract Value","Tenure","Resource Cost","Net Profit","Margin%","Hours"],"profit-by-client.csv")}/>
                </div>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Profit by Client</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={R.profitByClient.slice(0,8)} margin={{top:10,right:20,left:10,bottom:50}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}} angle={-40} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                    <Bar dataKey="monthlyRetainer" name="Monthly Retainer" fill="#008A57" radius={[3,3,0,0]}/>
                    <Bar dataKey="resourceCost"    name="Resource Cost"    fill="#475569" radius={[3,3,0,0]}/>
                    <Bar dataKey="monthlyProfit"   name="Monthly Profit"   fill="#34D399" radius={[3,3,0,0]}/>
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
                        <TD align="right" style={{fontWeight:700,color:c.monthlyProfit>=0?"#10b981":"#EF4444"}}>{SAR(c.monthlyProfit)}</TD>
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
                <ExportBtn label="CSV" onClick={()=>exportCSV(R.profitByDepartment.map(d=>[d.name,d.budget,d.cost,d.profit,d.margin.toFixed(2)]),["Department","Budget","Cost","Profit","Margin%"],"profit-by-dept.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Profit by Department vs Contract Budget</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={R.profitByDepartment} margin={{top:10,right:20,left:10,bottom:50}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="name" tick={{fontSize:10,fill:"#64748b"}} angle={-20} textAnchor="end"/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                    <Bar dataKey="budget" name="Budget"      fill="#008A57" radius={[3,3,0,0]}/>
                    <Bar dataKey="cost"   name="Actual Cost" fill="#475569" radius={[3,3,0,0]}/>
                    <Bar dataKey="profit" name="Profit"      fill="#008A57" radius={[3,3,0,0]}/>
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
                        <TD align="right" style={{fontWeight:700,color:d.profit>=0?"#10b981":"#EF4444"}}>{SAR(d.profit)}</TD>
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
                <ExportBtn label="CSV" onClick={()=>{
                  const rows=R.resourceByDepartment.filter(d=>selDept==="all"||d.department===selDept).flatMap(d=>d.clientBreakdown.map(c=>[d.department,c.client,c.hours,c.cost]));
                  exportCSV(rows,["Department","Client","Hours","Cost"],"resource-allocation.csv");
                }}/>
              </div>
              {R.resourceByDepartment.filter(d=>selDept==="all"||d.department===selDept).map(dept=>(
                <Card key={dept.department} style={{padding:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>{dept.department} Department</p>
                    <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{dept.employeeCount} employees · {fmtH(dept.totalHours)}h · {dept.avgUtilization.toFixed(0)}% utilized</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dept.clientBreakdown} margin={{top:5,right:10,left:5,bottom:36}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                      <XAxis dataKey="client" tick={{fontSize:9,fill:"#64748b"}} angle={-35} textAnchor="end"/>
                      <YAxis tick={{fontSize:9,fill:"#64748b"}}/>
                      <Tooltip formatter={(v,n)=>n==="hours"?`${v}h`:SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                      <Legend wrapperStyle={{fontSize:10,color:"#64748b",lineHeight:1.5}}/>
                      <Bar dataKey="hours" name="Hours" fill="#008A57" radius={[3,3,0,0]}/>
                      <Bar dataKey="cost"  name="Cost"  fill="#475569" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                  <table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}>
                    <thead><tr><TH>Client</TH><TH align="center">Hours</TH><TH align="right">Cost to Client</TH></tr></thead>
                    <tbody>
                      {dept.clientBreakdown.map((c,i)=>(
                        <tr key={i}><TD><strong>{c.client}</strong></TD><TD align="center">{fmtH(c.hours)}h</TD><TD align="right" style={{color:"#10b981"}}>{SAR(c.cost)}</TD></tr>
                      ))}
                      <tr style={{background:"#fff",fontWeight:700}}>
                        <TD>Total</TD><TD align="center">{fmtH(dept.totalHours)}h</TD><TD align="right">{SAR(Math.round(dept.totalCost))}</TD>
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
                <ExportBtn label="CSV" onClick={()=>exportCSV(R.cashFlow.map(r=>[r.month,r.expectedRevenue,r.expectedCost,r.netCashFlow,r.cumulativeCash]),["Month","Revenue","Cost","Net","Cumulative"],"cash-flow.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>12-Month Cash Flow Forecast</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={R.cashFlow} margin={{top:10,right:20,left:10,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"#64748b"}}/>
                    <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                    <Tooltip formatter={v=>SAR(v)} contentStyle={{borderRadius:8,border:"none"}}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                    <Line type="monotone" dataKey="expectedRevenue" name="Revenue"       stroke="#008A57" strokeWidth={3}/>
                    <Line type="monotone" dataKey="expectedCost"    name="Cost"          stroke="#475569" strokeWidth={3}/>
                    <Line type="monotone" dataKey="netCashFlow"     name="Net Cash Flow" stroke="#34D399" strokeWidth={2} strokeDasharray="5 5"/>
                  </LineChart>
                </ResponsiveContainer>
                <div style={{overflowX:"auto",marginTop:16}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Month","Expected Revenue","Expected Cost","Net Cash Flow","Cumulative Cash"].map((h,i)=><TH key={h} align={i===0?"left":"right"}>{h}</TH>)}</tr></thead>
                    <tbody>{R.cashFlow.map((r,i)=>(
                      <tr key={i}>
                        <TD><strong>{r.month}</strong></TD>
                        <TD align="right" style={{color:"#10b981"}}>{SAR(r.expectedRevenue)}</TD>
                        <TD align="right" style={{color:"#d97706"}}>{SAR(r.expectedCost)}</TD>
                        <TD align="right" style={{fontWeight:700,color:r.netCashFlow>=0?"#008A57":"#EF4444"}}>{SAR(r.netCashFlow)}</TD>
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
                <ExportBtn label="CSV" onClick={()=>exportCSV(R.clientRisk.map(c=>[c.name,c.contractValue,c.monthlyProfit,c.marginPercent.toFixed(1),c.riskScore,c.riskLevel,c.recommendation]),["Client","Contract Value","Net Profit","Margin%","Risk Score","Risk Level","Recommendation"],"risk-analysis.csv")}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Client Risk Analysis & Recommendations</p>
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
                        <TD align="right" style={{fontWeight:700,color:c.monthlyProfit>=0?"#10b981":"#EF4444"}}>{SAR(c.monthlyProfit)}</TD>
                        <TD align="center">{marginBadge(c.marginPercent)}</TD>
                        <TD align="center" style={{fontWeight:700}}>{c.riskScore}</TD>
                        <TD align="center">{riskBadge(c.riskLevel)}</TD>
                        <TD style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{c.recommendation}</TD>
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
                <ExportBtn label="CSV" onClick={()=>{
                  const rows=R.closedMonths.flatMap(m=>m.clients.filter(c=>selClosedClient==="all"||c.name===selClosedClient).map(c=>[m.monthFormatted,c.name,c.retainer,c.cost,c.profit]));
                  exportCSV(rows,["Month","Client","Retainer","Cost","Profit"],"monthly-closed.csv");
                }}/>
              </div>
              <Card style={{padding:18}}>
                <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Historical Closed Months Performance</p>
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
                    <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                    <Bar dataKey="retainer" name="Monthly Retainer" fill="#008A57" radius={[3,3,0,0]}/>
                    <Bar dataKey="cost"     name="Resource Cost"    fill="#475569" radius={[3,3,0,0]}/>
                    <Bar dataKey="profit"   name="Profit"           fill="#008A57" radius={[3,3,0,0]}/>
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
                          <TD align="right" style={{fontWeight:700,color:c.profit>=0?"#10b981":"#EF4444"}}>{SAR(c.profit)}</TD>
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
            const rows=USE_SNAPSHOTS
              .filter(s=>selRevMonth==="all"||s.month===selRevMonth)
              .filter(s=>selRevCat==="all"||s.contract_category===selRevCat)
              .map(s=>({...s,margin:s.monthly_retainer>0?Math.round((s.profit/s.monthly_retainer)*100):0}))
              .sort((a,b)=>b.month.localeCompare(a.month));
            const totRev=rows.reduce((s,r)=>s+r.monthly_retainer,0);
            const totCost=rows.reduce((s,r)=>s+r.resource_cost,0);
            const totProfit=rows.reduce((s,r)=>s+r.profit,0);
            const totHours=rows.reduce((s,r)=>s+r.allocated_hours,0);
            const avgMargin=totRev>0?Math.round((totProfit/totRev)*100):0;
            const uniqueMonths=[...new Set(USE_SNAPSHOTS.map(s=>s.month))].sort().reverse();
            return(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Month:</span>
                      <Sel value={selRevMonth} onChange={setSelRevMonth} options={[{v:"all",l:"All Months"},...uniqueMonths.map(m=>({v:m,l:fmtLong(m)}))]} style={{width:155}}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Category:</span>
                      <Sel value={selRevCat} onChange={setSelRevCat} options={[{v:"all",l:"All Categories"},{v:"Retainer",l:"Retainer"},{v:"Project",l:"Project"},{v:"Adhoc",l:"Adhoc"}]} style={{width:150}}/>
                    </div>
                  </div>
                  <ExportBtn label="Export Excel" onClick={()=>exportCSV(rows.map(r=>[r.month,r.client_name,r.contract_number,r.contract_value,r.start_date,r.end_date,r.monthly_retainer,r.allocated_hours,r.resource_cost,r.profit,r.margin,r.status]),["Month","Client","Contract#","Value","Start","End","Revenue","Hours","Cost","Profit","Margin%","Status"],"revenue-profit.csv")}/>
                </div>
                <Card style={{overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Revenue & Profit by Contract</p></div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr>
                        {["Month","Client Name","Contract #","Contract Value","Start Date","End Date","Monthly Revenue","Hours","Resource Cost","Profit","Margin %","Status"].map((h,i)=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:i>=3&&i<=9?"right":i>=10?"center":"left",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.length===0
                          ?<tr><td colSpan={12} style={{textAlign:"center",padding:40,color:"#64748b"}}>No closed month data available yet</td></tr>
                          :rows.map((r,i)=>(
                            <tr key={i} style={{background:i%2===0?"#fff":"#fafafa"}}>
                              <td style={{padding:"7px 10px",fontWeight:600,fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.month}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.client_name}</td>
                              <td style={{padding:"7px 10px",fontSize:11,fontFamily:"monospace",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.contract_number}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.contract_value.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.start_date}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.end_date}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,fontWeight:600,color:"#10b981",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.monthly_retainer.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",fontSize:12,borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.allocated_hours)}h</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,color:"#d97706",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.resource_cost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:r.profit>=0?"#10b981":"#EF4444",whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.profit.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.margin)}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={r.status==="Active"?"#d1fae5":"#f1f5f9"} color={r.status==="Active"?"#10b981":"#64748b"}>{r.status}</Bdg></td>
                            </tr>
                          ))
                        }
                        <tr style={{background:"#e2e8f0",fontWeight:700}}>
                          <td colSpan={3} style={{padding:"8px 10px",fontSize:12}}>Totals</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12}}>{rows.reduce((s,r)=>s+r.contract_value,0).toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td colSpan={2} style={{padding:"8px 10px"}}/>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,color:"#10b981"}}>{totRev.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{fmtH(totHours)}h</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,color:"#d97706"}}>{totCost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                          <td style={{padding:"8px 10px",textAlign:"right",fontSize:12,fontWeight:700,color:totProfit>=0?"#10b981":"#EF4444"}}>{totProfit.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
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
            const als=(allocsByMonth[selUtilMonth]||[]);
            const availMonths=[...new Set(Object.keys(allocsByMonth))].sort().reverse();
            const rows=USE_EMPLOYEES.map(emp=>{
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
                    <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Month:</span>
                    <Sel value={selUtilMonth} onChange={setSelUtilMonth} options={availMonths.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                  </div>
                  <ExportBtn label="Export Excel" onClick={()=>exportCSV(rows.map(r=>[selUtilMonth,r.name,r.department?.replace(" Department",""),r.ah,r.avail,r.pct,r.hr,r.cost,r.contracts.join(", "),r.over?"Yes":"No"]),["Month","Employee","Dept","Alloc Hrs","Avail Hrs","Util%","Hourly Cost","Resource Cost","Contracts","Overalloc"],"employee-util.csv")}/>
                </div>
                <Card style={{overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}><p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Employee Utilization — {fmtLong(selUtilMonth)}</p></div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead><tr>
                        {["Employee Name","Department","Allocated Hrs","Available Hrs","Utilization %","Hourly Cost","Resource Cost","Contracts Worked On","Overallocated"].map((h,i)=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:i>=2&&i<=6?"center":i===7?"left":"center",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {rows.map((r,i)=>{
                          const utilBg=r.pct>100?"#fee2e2":r.pct>=80?"#d1fae5":r.pct>=50?"#fef9c3":"#f1f5f9";
                          const utilCol=r.pct>100?"#EF4444":r.pct>=80?"#10b981":r.pct>=50?"#d97706":"#64748b";
                          return(
                            <tr key={r.id} style={{background:r.over?"#fff5f5":i%2===0?"#fff":"#f8fafc"}}>
                              <td style={{padding:"7px 10px",fontWeight:600,fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.name}</td>
                              <td style={{padding:"7px 10px",fontSize:12,whiteSpace:"nowrap",borderBottom:"1px solid #f1f5f9"}}>{r.department?.replace(" Department","")}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.ah)}h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.avail)}h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={utilBg} color={utilCol}>{r.pct}%</Bdg></td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.hr)}/h</td>
                              <td style={{padding:"7px 10px",textAlign:"center",color:"#d97706",borderBottom:"1px solid #f1f5f9"}}>{r.cost.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
                              <td style={{padding:"7px 10px",fontSize:11,color:"#475569",lineHeight:1.5,borderBottom:"1px solid #f1f5f9"}}>{r.contracts.length>0?r.contracts.join(", "):<span style={{color:"#64748b"}}>None</span>}</td>
                              <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}><Bdg bg={r.over?"#ef4444":"#f1f5f9"} color={r.over?"#fff":"#64748b"}>{r.over?"Yes":"No"}</Bdg></td>
                            </tr>
                          );
                        })}
                        <tr style={{background:"#e2e8f0",fontWeight:700}}>
                          <td style={{padding:"8px 10px",fontSize:12}}>Totals</td>
                          <td style={{padding:"8px 10px"}}/>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{fmtH(rows.reduce((s,r)=>s+r.ah,0))}h</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:12}}>{fmtH(rows.reduce((s,r)=>s+r.avail,0))}h</td>
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
            const als=(allocsByMonth[selDeptMonth]||[]);
            const availMonths=[...new Set(Object.keys(allocsByMonth))].sort().reverse();
            const em={};
            USE_EMPLOYEES.forEach(e=>{em[e.id]={...e,hr:e.mc/HPM};});
            const ac=USE_CONTRACTS.filter(c=>isActive(c,selDeptMonth));
            const rows=["Client Servicing Department","Production Department","Creative Department","Planning Department"].map(dept=>{
              const shortName=dept.replace(" Department","");
              const deptEmps=USE_EMPLOYEES.filter(e=>e.department===dept);
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
                    <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Month:</span>
                    <Sel value={selDeptMonth} onChange={setSelDeptMonth} options={availMonths.map(m=>({v:m,l:fmtLong(m)}))} style={{width:155}}/>
                  </div>
                  <ExportBtn label="Export Excel" onClick={()=>exportCSV(rows.map(r=>[r.dept,r.empCount,r.totalHours,r.util,r.totalBudget,r.totalCost,r.profit,r.margin]),["Dept","Employees","Hours","Util%","Budget","Cost","Profit","Margin%"],"dept-performance.csv")}/>
                </div>
                <Card style={{padding:18}}>
                  <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Department Performance — {fmtLong(selDeptMonth)}</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={rows} margin={{top:5,right:20,left:10,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                      <XAxis dataKey="dept" tick={{fontSize:10,fill:"#64748b"}}/>
                      <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${v/1000}K`}/>
                      <Tooltip formatter={v=>typeof v==="number"&&v>100?SAR(v):`${v}`} contentStyle={{borderRadius:8,border:"none"}}/>
                      <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
                      <Bar dataKey="totalBudget" name="Budget" fill="#008A57" radius={[3,3,0,0]}/>
                      <Bar dataKey="totalCost"   name="Cost"   fill="#475569" radius={[3,3,0,0]}/>
                      <Bar dataKey="profit"      name="Profit" fill="#34D399" radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{overflowX:"auto",marginTop:16}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>
                        <th style={{padding:"8px 10px",textAlign:"left",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #334155"}}>Department</th>
                        {["Employees","Total Hours","Utilization %","Budget (SAR)","Actual Cost","Profit","Margin %"].map(h=>(
                          <th key={h} style={{padding:"8px 10px",textAlign:"center",fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>{rows.map((r,i)=>(
                        <tr key={r.dept} style={{background:i%2===0?"#fff":"#fafafa"}}>
                          <td style={{padding:"8px 10px",fontWeight:600,fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{r.dept}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{r.empCount}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.totalHours)}h</td>
                          <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.util)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,borderBottom:"1px solid #f1f5f9"}}>{SAR(r.totalBudget)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,color:"#d97706",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.totalCost)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontSize:13,fontWeight:700,color:r.profit>=0?"#10b981":"#EF4444",borderBottom:"1px solid #f1f5f9"}}>{SAR(r.profit)}</td>
                          <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{marginBadge(r.margin)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}

      {/* Dept Capacity vs Budget */}
      {customTab==="dept-capacity-budget"&&(()=>{
        const DEPTS=["Client Servicing Department","Production Department","Creative Department","Planning Department"];
        const budgetKey={"Production Department":"budget_production","Client Servicing Department":"budget_client_servicing","Creative Department":"budget_creative","Planning Department":"budget_planning"};
        const activeContracts=USE_CONTRACTS.filter(c=>isActive(c,selDeptCapMonth));
        const monthAllocs=realAllocs.filter(a=>a.month===selDeptCapMonth);
        const allMonths=[...new Set(realAllocs.map(a=>a.month))].sort().reverse();

        const rows=DEPTS.map(dept=>{
          const shortName=dept.replace(" Department","");
          const deptEmps=USE_EMPLOYEES.filter(e=>e.department===dept&&e.status==="Active");
          const totalEmployees=deptEmps.length;
          const totalMonthlyCost=Math.round(deptEmps.reduce((s,e)=>s+(parseFloat(e.mc)||parseFloat(e.monthly_cost)||0),0));
          const deptAllocs=monthAllocs.filter(a=>USE_EMPLOYEES.find(e=>e.id===a.employee_id&&e.department===dept));
          const allocatedHours=deptAllocs.reduce((s,a)=>s+(parseFloat(a.h)||parseFloat(a.allocated_hours)||0),0);
          const capacityHours=totalEmployees*HPM;
          const utilizationPct=capacityHours>0?Math.round((allocatedHours/capacityHours)*100):0;
          const totalClientBudget=Math.round(activeContracts.reduce((s,c)=>{
            const tm=parseFloat(c.tm)||parseFloat(c.tenure_months)||1;
            return s+((parseFloat(c[budgetKey[dept]])||0)/tm);
          },0));
          const budgetCoveragePct=totalMonthlyCost>0?Math.round((totalClientBudget/totalMonthlyCost)*100):0;
          const budgetSurplusDeficit=totalClientBudget-totalMonthlyCost;
          return{dept:shortName,totalEmployees,totalMonthlyCost,totalClientBudget,budgetCoveragePct,allocatedHours,capacityHours,utilizationPct,budgetSurplusDeficit};
        });

        const coverBadge=pct=>pct>=100?{bg:"#d1fae5",col:"#059669"}:pct>=70?{bg:"#fef9c3",col:"#d97706"}:{bg:"#fee2e2",col:"#dc2626"};
        const utilBadge=pct=>pct>100?{bg:"#fee2e2",col:"#dc2626"}:pct>=80?{bg:"#d1fae5",col:"#059669"}:pct>=50?{bg:"#fef9c3",col:"#d97706"}:{bg:"#f1f5f9",col:"#64748b"};

        const months=allMonths.length>0?allMonths:ALLOC_MONTHS.map(m=>m.v);

        return(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>Month:</span>
                <Sel value={selDeptCapMonth} onChange={setSelDeptCapMonth}
                  options={months.map(m=>({v:m,l:fmtLong(m)}))} style={{width:160}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="outline" size="sm" onClick={()=>{
                  const wsData=[
                    ['Month','Department','Total Employees','Monthly Resource Cost (SAR)','Client Budget (SAR)','Budget Coverage %','Allocated Hours','Capacity Hours','Utilization %','Budget Surplus/Deficit (SAR)'],
                    ...rows.map(r=>[selDeptCapMonth,r.dept,r.totalEmployees,r.totalMonthlyCost,r.totalClientBudget,r.budgetCoveragePct+'%',r.allocatedHours+'h',r.capacityHours+'h',r.utilizationPct+'%',r.budgetSurplusDeficit]),
                  ];
                  exportXLSX(wsData,'Dept Capacity vs Budget',`dept-capacity-${selDeptCapMonth}.xlsx`);
                }} style={{gap:6}}><FileSpreadsheet size={13} strokeWidth={1.75}/>Export Excel</Btn>
                <Btn variant="outline" size="sm" onClick={()=>{
                  const headers=['Department','Employees','Resource Cost','Client Budget','Coverage %','Alloc Hrs','Cap Hrs','Util %','Surplus/Deficit'];
                  const pdfRows=rows.map(r=>[r.dept,r.totalEmployees,r.totalMonthlyCost.toLocaleString(),r.totalClientBudget.toLocaleString(),r.budgetCoveragePct+'%',r.allocatedHours+'h',r.capacityHours+'h',r.utilizationPct+'%',r.budgetSurplusDeficit.toLocaleString()]);
                  exportPDFTable(`Department Capacity vs Budget — ${fmtLong(selDeptCapMonth)}`,headers,pdfRows,`dept-capacity-${selDeptCapMonth}.pdf`);
                }} style={{gap:6}}><Download size={13} strokeWidth={1.75}/>Export PDF</Btn>
              </div>
            </div>
            <Card style={{overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #e2e8f0"}}>
                <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Department Capacity vs Client Budget — {fmtLong(selDeptCapMonth)}</p>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>
                    {["Department","Employees","Monthly Resource Cost","Client Budget","Budget Coverage %","Allocated Hrs","Capacity Hrs","Utilization %","Budget Surplus / Deficit"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:h==="Department"?"left":"center",fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={r.dept} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                        <td style={{padding:"8px 10px",fontWeight:600,borderBottom:"1px solid #f1f5f9"}}>{r.dept}</td>
                        <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{r.totalEmployees}</td>
                        <td style={{padding:"8px 10px",textAlign:"right",color:"#d97706",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{r.totalMonthlyCost.toLocaleString()}</td>
                        <td style={{padding:"8px 10px",textAlign:"right",color:"#059669",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{r.totalClientBudget.toLocaleString()}</td>
                        <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                          <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:700,background:coverBadge(r.budgetCoveragePct).bg,color:coverBadge(r.budgetCoveragePct).col}}>{r.budgetCoveragePct}%</span>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.allocatedHours)}h</td>
                        <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{fmtH(r.capacityHours)}h</td>
                        <td style={{padding:"8px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                          <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:700,background:utilBadge(r.utilizationPct).bg,color:utilBadge(r.utilizationPct).col}}>{r.utilizationPct}%</span>
                        </td>
                        <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:r.budgetSurplusDeficit>=0?"#059669":"#dc2626",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{r.budgetSurplusDeficit.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{background:"#e2e8f0",fontWeight:700,borderTop:"2px solid #cbd5e1"}}>
                      <td style={{padding:"8px 10px"}}>Totals</td>
                      <td style={{padding:"8px 10px",textAlign:"center"}}>{rows.reduce((s,r)=>s+r.totalEmployees,0)}</td>
                      <td style={{padding:"8px 10px",textAlign:"right",color:"#d97706",whiteSpace:"nowrap"}}>{rows.reduce((s,r)=>s+r.totalMonthlyCost,0).toLocaleString()}</td>
                      <td style={{padding:"8px 10px",textAlign:"right",color:"#059669",whiteSpace:"nowrap"}}>{rows.reduce((s,r)=>s+r.totalClientBudget,0).toLocaleString()}</td>
                      <td style={{padding:"8px 10px",textAlign:"center"}}>
                        <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:700,background:"#e2e8f0",color:"#475569"}}>
                          {(()=>{const tc=rows.reduce((s,r)=>s+r.totalMonthlyCost,0);const tb=rows.reduce((s,r)=>s+r.totalClientBudget,0);return tc>0?Math.round((tb/tc)*100):0;})()}%
                        </span>
                      </td>
                      <td style={{padding:"8px 10px",textAlign:"center"}}>{fmtH(rows.reduce((s,r)=>s+r.allocatedHours,0))}h</td>
                      <td style={{padding:"8px 10px",textAlign:"center"}}>{fmtH(rows.reduce((s,r)=>s+r.capacityHours,0))}h</td>
                      <td style={{padding:"8px 10px",textAlign:"center"}}>
                        <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:700,background:"#e2e8f0",color:"#475569"}}>
                          {(()=>{const tc=rows.reduce((s,r)=>s+r.capacityHours,0);const ta=rows.reduce((s,r)=>s+r.allocatedHours,0);return tc>0?Math.round((ta/tc)*100):0;})()}%
                        </span>
                      </td>
                      <td style={{padding:"8px 10px",textAlign:"right",fontWeight:700,color:rows.reduce((s,r)=>s+r.budgetSurplusDeficit,0)>=0?"#059669":"#dc2626",whiteSpace:"nowrap"}}>{rows.reduce((s,r)=>s+r.budgetSurplusDeficit,0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
                {rows.every(r=>r.totalEmployees===0&&r.totalClientBudget===0)&&(
                  <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
                    <p>No data for {fmtLong(selDeptCapMonth)} — add employees and contracts first</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })()}

      {customTab==="contract-revenue-forecast"&&(()=>{
        // Wait for Supabase data to load
        if(!dataLoaded) return(
          <div style={{textAlign:"center",padding:60,color:"#94a3b8"}}>
            <Clock size={32} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/>
            <p style={{fontSize:14}}>Loading...</p>
          </div>
        );
        if(realContracts.length===0) return(
          <div style={{textAlign:"center",padding:60,color:"#94a3b8"}}>
            <ClipboardList size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/>
            <p style={{fontSize:14}}>No contracts found. Add contracts first.</p>
          </div>
        );

        // Build month list from contract date range
        const allDates=realContracts.flatMap(c=>[c.start_date,c.end_date]).filter(Boolean);
        const minD=allDates.reduce((a,b)=>a<b?a:b).slice(0,7);
        const maxD=allDates.reduce((a,b)=>a>b?a:b).slice(0,7);
        const buildMonths=(from,to)=>{
          const ms=[];let d=new Date(from+"-01");const e=new Date(to+"-01");
          while(d<=e){ms.push(d.toISOString().slice(0,7));d=new Date(d.getFullYear(),d.getMonth()+1,1);}
          return ms;
        };
        // Deduplicate months (in case multiple contracts start/end in same month)
        const allMonthsList=[...new Set(buildMonths(minD,maxD))];

        // Build rows - one per contract
        const rows=realContracts.map(c=>{
          const tenure=parseFloat(c.tenure_months)||1;
          const cv=parseFloat(c.contract_value)||0;
          const mr=Math.round(cv/tenure);
          const monthValues={};
          allMonthsList.forEach(m=>{monthValues[m]=isActive(c,m)?mr:null;});
          const total=allMonthsList.reduce((s,m)=>s+(monthValues[m]||0),0);
          return{
            clientName:c.client_name||"—",
            contractNumber:c.contract_number||"—",
            contractValue:Math.round(cv),
            tenureMonths:tenure,
            startDate:(c.start_date||"—").slice(0,10),
            endDate:(c.end_date||"—").slice(0,10),
            status:c.status||"—",
            monthValues,total
          };
        }).filter(r=>r.total>0).sort((a,b)=>a.clientName.localeCompare(b.clientName));

        const colTotals=allMonthsList.map(m=>rows.reduce((s,r)=>s+(r.monthValues[m]||0),0));
        const grandTotal=rows.reduce((s,r)=>s+r.total,0);

        const TH=({children,align="left"})=><th style={{padding:"7px 10px",textAlign:align,fontSize:11,fontWeight:600,color:"#fff",background:"#1e293b",borderBottom:"1px solid #334155",whiteSpace:"nowrap",position:"sticky",top:0}}>{children}</th>;

        return(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>From:</span>
                <select value={minD} style={{padding:"6px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}} onChange={()=>{}}>
                  {allMonthsList.map(m=><option key={m} value={m}>{fmtLong(m)}</option>)}
                </select>
                <span style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>To:</span>
                <select value={maxD} style={{padding:"6px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}} onChange={()=>{}}>
                  {allMonthsList.map(m=><option key={m} value={m}>{fmtLong(m)}</option>)}
                </select>
              </div>
              <Btn variant="outline" size="sm" onClick={()=>{
                const headers=["Client Name","Contract ID","Contract Value","Tenure (Month)","Start Date","End Date","Status",...allMonthsList.map(m=>fmtShort(m)),"Total"];
                const wsData=[headers];
                rows.forEach(r=>wsData.push([r.clientName,r.contractNumber,r.contractValue,r.tenureMonths,r.startDate,r.endDate,r.status,...allMonthsList.map(m=>r.monthValues[m]||""),r.total]));
                wsData.push(["Total","","","","","","",...colTotals,grandTotal]);
                exportXLSX(wsData,"Contract Revenue Forecast",`contract-forecast-${minD}-to-${maxD}.xlsx`);
              }} style={{gap:6}}><FileSpreadsheet size={13} strokeWidth={1.75}/>Export Excel</Btn>
            </div>
            <Card style={{overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0"}}>
                <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Contract Revenue Forecast — {fmtLong(minD)} to {fmtLong(maxD)}</p>
              </div>
              <div style={{overflowX:"auto",maxHeight:600,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr>
                    <TH>Client Name</TH>
                    <TH>Contract ID</TH>
                    <TH align="right">Contract Value</TH>
                    <TH align="center">Tenure (Month)</TH>
                    <TH>Start Date</TH>
                    <TH>End Date</TH>
                    <TH align="center">Status</TH>
                    {allMonthsList.map(m=><TH key={m} align="right">{fmtShort(m)}</TH>)}
                    <TH align="right">Total</TH>
                  </tr></thead>
                  <tbody>
                    {rows.map((row,i)=>(
                      <tr key={i} style={{background:i%2===0?"#fff":"#f8fafc"}}>
                        <td style={{padding:"7px 10px",fontWeight:500,borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{row.clientName}</td>
                        <td style={{padding:"7px 10px",fontFamily:"monospace",fontSize:11,borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{row.contractNumber}</td>
                        <td style={{padding:"7px 10px",textAlign:"right",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{row.contractValue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                        <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>{row.tenureMonths}</td>
                        <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{row.startDate}</td>
                        <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>{row.endDate}</td>
                        <td style={{padding:"7px 10px",textAlign:"center",borderBottom:"1px solid #f1f5f9"}}>
                          <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:600,background:row.status==="Active"?"#d1fae5":"#f1f5f9",color:row.status==="Active"?"#059669":"#64748b"}}>{row.status}</span>
                        </td>
                        {allMonthsList.map(m=>(
                          <td key={m} style={{padding:"7px 10px",textAlign:"right",borderBottom:"1px solid #f1f5f9",whiteSpace:"nowrap"}}>
                            {row.monthValues[m]!=null
                              ?<span style={{color:"#059669",fontWeight:500}}>{row.monthValues[m].toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                              :<span style={{color:"#cbd5e1"}}>-</span>}
                          </td>
                        ))}
                        <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,borderBottom:"1px solid #f1f5f9",background:"#f8fafc",whiteSpace:"nowrap"}}>{row.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                      </tr>
                    ))}
                    <tr style={{background:"#e2e8f0",fontWeight:700,borderTop:"2px solid #cbd5e1"}}>
                      <td colSpan={7} style={{padding:"7px 10px"}}>Total</td>
                      {colTotals.map((t,i)=>(
                        <td key={i} style={{padding:"7px 10px",textAlign:"right",color:t>0?"#059669":"#94a3b8",whiteSpace:"nowrap"}}>
                          {t>0?t.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"-"}
                        </td>
                      ))}
                      <td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:"#059669",whiteSpace:"nowrap"}}>{grandTotal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                    </tr>
                  </tbody>
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


function MonthlyClosePage(){
  const {sb}=useAuth();
  const [snapshots,setSnapshots]=useState([]);
  const [loading,setLoading]=useState(true);
  const [realContracts,setRealContracts]=useState([]);
  const [realEmployees,setRealEmployees]=useState([]);
  const [realAllocs,setRealAllocs]=useState([]);

  useEffect(()=>{
    Promise.all([
      sb.from('monthly_snapshots').select('*').order('month',{ascending:false}),
      sb.from('contracts').select('*'),
      sb.from('employees').select('*'),
      sb.from('allocations').select('*'),
    ]).then(([{data:sn},{data:ct},{data:em},{data:al}])=>{
      if(sn) setSnapshots(sn);
      if(ct) setRealContracts(ct.map(x=>({...x,cid:x.client_id,cn:x.client_name,cv:parseFloat(x.contract_value)||0,tm:parseFloat(x.tenure_months)||1,sd:x.start_date,ed:x.end_date,st:x.status})));
      if(em) setRealEmployees(em.map(x=>({...x,mc:parseFloat(x.monthly_cost)||0})));
      if(al) setRealAllocs(al.map(x=>({...x,eid:x.employee_id,cid:x.client_id,h:parseFloat(x.allocated_hours)||0})));
      setLoading(false);
    });
  },[sb]);
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
    const contracts = realContracts.length>0 ? realContracts : MOCK_CONTRACTS_FULL;
    const employees = realEmployees.length>0 ? realEmployees : EMPLOYEES_INIT;
    const allAllocs = realAllocs.length>0 ? realAllocs : (ALLOCS_BY_MONTH[month]||[]);
    const als = allAllocs.filter(a=>a.month===month);
    const em  = {};
    employees.forEach(e=>{em[e.id]={...e,hr:(e.mc||e.monthly_cost||0)/HPM};});
    return contracts.filter(c=>isActive(c,month)&&(c.st||c.status)==="Active").map(c=>{
      let rc=0,ah=0;
      als.filter(a=>(a.cid||a.client_id)===c.client_id||(a.contract_id===c.id)).forEach(a=>{
        const e=em[a.eid||a.employee_id];
        rc+=(e?e.hr:0)*(a.h||a.allocated_hours||0);
        ah+=(a.h||a.allocated_hours||0);
      });
      const mr=Math.round((c.cv||parseFloat(c.contract_value)||0)/(c.tm||parseFloat(c.tenure_months)||1));
      return{contract_id:c.id,contract_number:c.contract_number,client_name:c.cn||c.client_name,month,
        resource_cost:Math.round(rc),allocated_hours:Math.round(ah*10)/10,monthly_retainer:mr,
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
    toast(`${MC_MONTHS.find(m=>m.v===closingMonth)?.l} closed successfully`,'success');
  };

  const handleDeleteMonth = async (month) => {
    const _confOk=await confirm({title:'Delete close data?',message:`Delete close data for ${MC_MONTHS.find(m=>m.v===month)?.l}? This cannot be undone.`,danger:true,confirmLabel:'Delete'});
    if(!_confOk) return;
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
    const employees = realEmployees.length>0 ? realEmployees : EMPLOYEES_INIT;
    const allAllocs = realAllocs.length>0 ? realAllocs : (ALLOCS_BY_MONTH[month]||[]);
    const als = allAllocs.filter(a=>a.month===month);
    const em  = {};
    employees.forEach(e=>{em[e.id]={...e,hr:(e.mc||e.monthly_cost||0)/HPM};});
    const map = {};
    als.forEach(a=>{
      const eid=a.eid||a.employee_id;
      const emp=employees.find(e=>e.id===eid);
      if(!map[eid]) map[eid]={name:emp?.name||"—",department:(emp?.department||"—").replace(" Department",""),totalHours:0,totalCost:0,clients:[]};
      const e=em[eid];
      map[eid].totalHours+=(a.h||a.allocated_hours||0);
      map[eid].totalCost+=(e?e.hr:0)*(a.h||a.allocated_hours||0);
      map[eid].clients.push(a.client_name||"");
    });
    return Object.values(map).sort((a,b)=>b.totalCost-a.totalCost);
  };

  const marginBadge=(v)=>{const bg=v<0?"#fee2e2":v<20?"#fef9c3":"#d1fae5";const col=v<0?"#EF4444":v<20?"#d97706":"#10b981";return <Bdg bg={bg} color={col}>{v.toFixed(1)}%</Bdg>;};
  const TH=({children,align="left"})=><th style={{padding:"9px 13px",textAlign:align,fontSize:11,fontWeight:600,color:"#64748b",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{children}</th>;
  const TD=({children,align="left",style={}})=><td style={{padding:"9px 13px",textAlign:align,fontSize:13,borderBottom:"1px solid #f1f5f9",...style}}>{children}</td>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Header */}
      <div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#0f172a",margin:0}}>Monthly Financial Close</h1>
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Lock historical financial data for accurate reporting</p>
      </div>

      {/* 2026 Month Grid */}
      <Card style={{padding:20}}>
        <p style={{margin:"0 0 14px",fontWeight:700,fontSize:15,color:"#0f172a",lineHeight:1.5}}>2026 Months</p>
        {/* Warning banner */}
        <div style={{padding:"12px 16px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,marginBottom:16,display:"flex",gap:10}}>
          <AlertTriangle size={18} strokeWidth={2} style={{color:"#d97706",flexShrink:0}}/>
          <div>
            <p style={{margin:0,fontWeight:600,fontSize:13,color:"#92400e"}}>Important</p>
            <p style={{margin:"3px 0 0",fontSize:12,color:"#a16207"}}>You can only close past months. Closing a month will freeze all resource costs, allocations, and reset employee hours to {HPM} for the next period.</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {MC_MONTHS.map(m=>{
            const closed=isMonthClosed(m.v);
            const past=isPast(m.v);
            // Sequential check: all previous past months must be closed first
            const prevMonths=MC_MONTHS.filter(x=>x.v<m.v&&isPast(x.v));
            const allPrevClosed=prevMonths.every(x=>isMonthClosed(x.v));
            const canClose=past&&!closed&&allPrevClosed;
            const canDelete=closed&&m.v===latestClosed;
            return(
              <div key={m.v} style={{padding:16,border:`1px solid ${closed?"#a7f3d0":"#e2e8f0"}`,borderRadius:12,background:closed?"#f0fdf4":"#fff",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  {closed?<Lock size={15} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>:<Calendar size={15} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/>}
                  <p style={{margin:0,fontWeight:600,fontSize:13,color:"#0f172a",lineHeight:1.5}}>{m.l}</p>
                </div>
                {closed&&<Bdg bg="#d1fae5" color="#10b981">Closed</Bdg>}
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:"auto"}}>
                  {closed?(
                    <>
                      <Btn variant="outline" size="sm" onClick={()=>{setDetailMonth(m.v);setDetailModal(true);}} style={{width:"100%",justifyContent:"center",gap:6}}><Eye size={13} strokeWidth={1.75}/>View</Btn>
                      {canDelete&&<Btn variant="danger" size="sm" onClick={()=>handleDeleteMonth(m.v)} style={{width:"100%",justifyContent:"center",gap:6}}><Trash2 size={13} strokeWidth={1.75}/>Delete</Btn>}
                    </>
                  ):(
                    <Btn variant={canClose?"primary":"outline"} size="sm" 
                      onClick={()=>canClose&&handlePreview(m.v)} 
                      disabled={!canClose} 
                      title={!allPrevClosed?"Close previous months first":!past?"Future month":"Already closed"}
                      style={{width:"100%",justifyContent:"center",opacity:canClose?1:0.45}}
                    >
                      <span style={{display:"inline-flex",alignItems:"center",gap:6}}><Lock size={13} strokeWidth={1.75}/>Close</span>
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
          <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a",lineHeight:1.5}}>Closed Months History</p>
        </div>
        {closedSummary.length===0?(
          <div style={{textAlign:"center",padding:"48px",color:"#64748b"}}>
            <Calendar size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/>
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
              <tbody>{loading&&<SkeletonRows cols={5} rows={4}/>}{!loading&&closedSummary.map(m=>{
                const margin=m.totalRetainer>0?(m.totalProfit/m.totalRetainer)*100:0;
                return(
                  <tr key={m.month}>
                    <TD><div style={{display:"flex",alignItems:"center",gap:7}}><Lock size={13} strokeWidth={1.75} style={{color:"#64748b",flexShrink:0}}/><strong>{fmtLong(m.month)}</strong></div></TD>
                    <TD align="center">{m.contracts}</TD>
                    <TD align="right" style={{color:"#10b981",fontWeight:600}}>{SAR(m.totalRetainer)}</TD>
                    <TD align="right" style={{color:"#d97706"}}>{SAR(m.totalCost)}</TD>
                    <TD align="right" style={{fontWeight:700,color:m.totalProfit>=0?"#10b981":"#EF4444"}}>{SAR(m.totalProfit)}</TD>
                    <TD align="center">{marginBadge(margin)}</TD>
                    <TD align="center">
                      <div style={{display:"flex",justifyContent:"center",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>{setDetailMonth(m.month);setDetailModal(true);}}><Eye size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="ghost" size="sm" onClick={()=>handleViewEmployees(m.month)}><Users size={14} strokeWidth={1.75}/></Btn>
                        {m.month===latestClosed&&<Btn variant="danger" size="sm" onClick={()=>handleDeleteMonth(m.month)}><Trash2 size={14} strokeWidth={1.75}/></Btn>}
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
          <div style={{padding:"10px 14px",background:"#fff",borderRadius:9}}>
            <p style={{margin:0,fontSize:13,color:"#475569",lineHeight:1.5}}>The following data will be frozen. Employee hours reset to {HPM} for the next period.</p>
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
                  <TD align="right">{fmtH(item.allocated_hours)}h</TD>
                  <TD align="right" style={{color:"#d97706"}}>{SAR(item.resource_cost)}</TD>
                  <TD align="right" style={{color:"#10b981"}}>{SAR(item.monthly_retainer)}</TD>
                  <TD align="right" style={{fontWeight:700,color:item.profit>=0?"#10b981":"#EF4444"}}>{SAR(item.profit)}</TD>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {previewData.length===0&&<p style={{textAlign:"center",color:"#64748b",fontSize:13}}>No active contracts with allocations found for this month.</p>}
          {blockError&&(
            <div style={{padding:"12px 16px",background:"#1a0a0a",border:"1px solid #fecaca",borderRadius:9}}>
              <p style={{margin:"0 0 6px",fontWeight:700,fontSize:13,color:"#EF4444",display:"flex",alignItems:"center",gap:7}}><ShieldOff size={14} strokeWidth={2}/>Monthly Close Blocked — Over-Recognition Detected</p>
              <p style={{margin:0,fontSize:12,color:"#EF4444"}}><strong>{blockError.client_name}</strong> ({blockError.contract_number}): Total recognized would be <strong>SAR {blockError.total.toLocaleString("en-US",{maximumFractionDigits:0})}</strong>, exceeding contract value of <strong>SAR {blockError.cv.toLocaleString("en-US",{maximumFractionDigits:0})}</strong>.</p>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={()=>{setPreviewModal(false);setBlockError(null);}}>Cancel</Btn>
            <Btn variant="primary" disabled={!!blockError} onClick={handleConfirmClose} style={{gap:6}}><Lock size={13} strokeWidth={1.75}/>Confirm Close</Btn>
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
                  <TD align="right">{fmtH(s.allocated_hours)}h</TD>
                  <TD align="right" style={{color:"#d97706"}}>{SAR(s.resource_cost)}</TD>
                  <TD align="right" style={{color:"#10b981"}}>{SAR(s.monthly_retainer)}</TD>
                  <TD align="right" style={{fontWeight:700,color:s.profit>=0?"#10b981":"#EF4444"}}>{SAR(s.profit)}</TD>
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
            ?<p style={{textAlign:"center",color:"#64748b",padding:"32px 0",fontSize:13}}>No allocations found for this month</p>
            :(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <TH>Employee</TH><TH>Department</TH><TH>Clients</TH>
                  <TH align="right">Hours</TH><TH align="right">Cost</TH><TH align="right">Utilization</TH>
                </tr></thead>
                <tbody>{getEmpBreakdown(empMonth||"").map((e,i)=>{
                  const util=(e.totalHours/HPM)*100;
                  const ub=util>=100?"#d1fae5":util>=50?"#fef9c3":"#fee2e2";
                  const uc=util>=100?"#10b981":util>=50?"#d97706":"#EF4444";
                  return(
                    <tr key={i}>
                      <TD><strong>{e.name}</strong></TD>
                      <TD><Bdg bg="#f1f5f9" color="#475569">{e.department}</Bdg></TD>
                      <TD style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{[...new Set(e.clients)].join(", ")||"—"}</TD>
                      <TD align="right">{fmtH(e.totalHours)}h</TD>
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
  const EXP_COLORS=["#008A57","#f59e0b","#008A57","#ef4444","#3b82f6","#008A57"];
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card style={{padding:16,gridColumn:"1/-1"}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Expenses by Contract (Approved vs Draft)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byContract} margin={{top:4,right:12,left:0,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="contract" tick={{fontSize:10,fill:"#64748b"}}/>
            <YAxis tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:"none"}}/>
            <Legend wrapperStyle={{fontSize:11,color:"#64748b",lineHeight:1.5}}/>
            <Bar dataKey="approved" name="Approved" fill="#008A57" radius={[3,3,0,0]}/>
            <Bar dataKey="draft"    name="Draft"    fill="#f59e0b" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{padding:16}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Expense Distribution by Type</p>
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
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Expenses by Department</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byDept} layout="vertical" margin={{top:4,right:12,left:8,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:"#64748b"}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <YAxis type="category" dataKey="dept" tick={{fontSize:10,fill:"#64748b"}} width={88}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{borderRadius:8,border:"none"}}/>
            <Bar dataKey="total" name="Total" fill="#008A57" radius={[0,3,3,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      {profitData.length>0&&(
        <Card style={{padding:16,gridColumn:"1/-1"}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#0f172a",lineHeight:1.5}}>Average Profit % by Contract</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={profitData} margin={{top:4,right:12,left:0,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="contract" tick={{fontSize:10,fill:"#64748b"}}/>
              <YAxis tick={{fontSize:10,fill:"#64748b"}} unit="%" domain={[0,100]}/>
              <Tooltip formatter={v=>`${v}%`} contentStyle={{borderRadius:8,border:"none"}}/>
              <Bar dataKey="avg_profit" name="Avg Profit %">
                {profitData.map((e,i)=><Cell key={i} fill={e.avg_profit>=30?"#008A57":e.avg_profit>=10?"#f59e0b":"#ef4444"}/>)}
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
  const [realContracts,setRealContracts]=useState([]);
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false);
  useEffect(()=>{
    Promise.all([
      sb.from('contract_expenses').select('*').order('created_at',{ascending:false}),
      sb.from('contracts').select('*').order('contract_number'),
    ]).then(([{data:ex},{data:ct}])=>{
      if(ex) setExpenses(ex);
      if(ct) setRealContracts(ct.map(x=>({
        ...x,
        cn:x.client_name,
        cid:x.client_id,
        cv:parseFloat(x.contract_value)||0,
        tm:parseFloat(x.tenure_months)||1,
        sd:x.start_date,
        ed:x.end_date,
        st:x.status,
        contract_category:x.contract_category||'Retainer',
      })));
      setLoading(false);
    });
  },[sb]);
  const dbAdd=async p=>{
    const{data,error}=await sb.from('contract_expenses').insert([{
      expense_number:p.expense_number,request_date:p.request_date,
      contract_id:p.contract_id||null,contract_number:p.contract_number||"",
      client_name:p.client_name||"",contract_category:p.contract_category||"",
      contract_start_date:p.contract_start_date||null,contract_end_date:p.contract_end_date||null,
      total_contract_value:parseFloat(p.total_contract_value)||0,
      budget_third_party:parseFloat(p.budget_third_party)||0,
      contract_notes:p.contract_notes||"",
      expense_type:p.expense_type||"",vendor_name:p.vendor_name||"",
      amount:parseFloat(p.amount)||0,
      previous_requested_total_amount:parseFloat(p.previous_requested_total_amount)||0,
      project_profit_pct:parseFloat(p.project_profit_pct)||0,
      department:p.department||"",item_details:p.item_details||"",
      bill_number:p.bill_number||"",bill_date:p.bill_date||null,
      attachment_url:p.attachment_url||"",attachment_name:p.attachment_name||"",
      notes:p.notes||"",status:p.status||"Draft"
    }]).select().single();
    if(error){setSaving(false);toast('Error saving expense: '+error.message,'error');return;}
    if(data)setExpenses(x=>[data,...x]);
  };
  const dbUpdate=async(id,p)=>{
    const{data,error}=await sb.from('contract_expenses').update({
      expense_number:p.expense_number,request_date:p.request_date,
      contract_id:p.contract_id||null,contract_number:p.contract_number||"",
      client_name:p.client_name||"",contract_category:p.contract_category||"",
      contract_start_date:p.contract_start_date||null,contract_end_date:p.contract_end_date||null,
      total_contract_value:parseFloat(p.total_contract_value)||0,
      budget_third_party:parseFloat(p.budget_third_party)||0,
      contract_notes:p.contract_notes||"",
      expense_type:p.expense_type||"",vendor_name:p.vendor_name||"",
      amount:parseFloat(p.amount)||0,
      previous_requested_total_amount:parseFloat(p.previous_requested_total_amount)||0,
      project_profit_pct:parseFloat(p.project_profit_pct)||0,
      department:p.department||"",item_details:p.item_details||"",
      bill_number:p.bill_number||"",bill_date:p.bill_date||null,
      attachment_url:p.attachment_url||"",attachment_name:p.attachment_name||"",
      notes:p.notes||"",status:p.status||"Draft"
    }).eq('id',id).select().single();
    if(error){setSaving(false);toast('Error updating expense: '+error.message,'error');return;}
    if(data)setExpenses(x=>x.map(e=>e.id===id?data:e));};
  const dbDelete=async id=>{await sb.from('contract_expenses').delete().eq('id',id);setExpenses(x=>x.filter(e=>e.id!==id));};
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing]     = useState(null);
  const [form,setForm]           = useState(EMPTY_EXP_FORM);
  const [search,setSearch]       = useState("");
  const [contractFilter,setContractFilter] = useState("all");
  const [viewExpense,setViewExpense] = useState(null);

  // ── PDF Download (matches Base44 structure) ──────────────────────────────
  const handleDownloadPDF = (expense) => {
    const doExport = () => {
      const {jsPDF} = window.jspdf;
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;
      const colW = pageW - margin * 2;
      let y = 0;

      // Header
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageW, 32, "F");
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
      doc.text("Contract/Project Expense Report", margin, 14);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(148,163,184);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}`, margin, 22);

      // Status badge
      const sColor = expense.status==="Approved"?[16,185,129]:[245,158,11];
      doc.setFillColor(...sColor);
      doc.roundedRect(pageW-margin-28, 10, 28, 10, 3, 3, "F");
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
      doc.text(expense.status||"Draft", pageW-margin-14, 16.5, {align:"center"});

      y = 42;

      const sectionHeader = (title, color=[30,41,59]) => {
        doc.setFillColor(...color); doc.rect(margin, y, colW, 8, "F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
        doc.text(title.toUpperCase(), margin+4, y+5.5); y += 11;
      };

      const row = (label, value, highlight=false) => {
        if(highlight) doc.setFillColor(248,250,252); else doc.setFillColor(255,255,255);
        doc.rect(margin, y-1, colW, 7, "F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105);
        doc.text(label, margin+3, y+4);
        doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42);
        doc.text(String(value??"-"), margin+72, y+4);
        doc.setDrawColor(226,232,240); doc.line(margin, y+6, margin+colW, y+6);
        y += 7;
      };

      sectionHeader("Expense Reference", [15,23,42]);
      row("Expense Number", expense.expense_number||"-", false);
      row("Request Date", expense.request_date||"-", true);
      y += 4;

      sectionHeader("Contract Details", [30,41,59]);
      row("Contract Number", expense.contract_number, false);
      row("Client Name", expense.client_name, true);
      row("Category", expense.contract_category, false);
      row("Total Contract Value (SAR)", Number(expense.total_contract_value||0).toLocaleString(), true);
      if((expense.contract_category||"").toLowerCase().includes("retainer")){
        row("3rd Party Budget (SAR)", Number(expense.budget_third_party||0).toLocaleString(), false);
      }
      row("Start Date", expense.contract_start_date, false);
      row("End Date", expense.contract_end_date, true);
      if(expense.contract_notes) row("Notes", expense.contract_notes, false);
      y += 6;

      sectionHeader("Expense Details", [51,65,85]);
      row("Expense Type", expense.expense_type, false);
      row("Vendor Name", expense.vendor_name, true);
      row("Department", expense.department, false);
      row("Amount (SAR)", Number(expense.amount||0).toLocaleString(), true);
      row("Previous Requested Total (SAR)", Number(expense.previous_requested_total_amount||0).toLocaleString(), false);
      row("Bill Number", expense.bill_number, true);
      row("Bill Date", expense.bill_date, false);
      row("Item Details", expense.item_details, true);
      row("Notes", expense.notes, false);
      y += 6;

      sectionHeader("Profitability Overview", [15,118,110]);
      const isRetainer=(expense.contract_category||"").toLowerCase().includes("retainer");
      const profBase=isRetainer?(parseFloat(expense.budget_third_party)||0):(parseFloat(expense.total_contract_value)||0);
      const total=parseFloat(expense.total_contract_value)||0;
      const prev=parseFloat(expense.previous_requested_total_amount)||0;
      const current=parseFloat(expense.amount)||0;
      const profit=profBase-prev-current;
      const profitPct=parseFloat(expense.project_profit_pct)||0;

      if(profBase>0){
        const barX=margin+4, barY=y+2, barH=14, barW=colW-8;
        const prevR=Math.min(prev/profBase,1), currR=Math.min(current/profBase,1-prevR), profR=Math.max(0,1-prevR-currR);
        if(prevR>0){doc.setFillColor(245,158,11);doc.rect(barX,barY,barW*prevR,barH,"F");}
        if(currR>0){doc.setFillColor(239,68,68);doc.rect(barX+barW*prevR,barY,barW*currR,barH,"F");}
        if(profR>0){doc.setFillColor(16,185,129);doc.rect(barX+barW*(prevR+currR),barY,barW*profR,barH,"F");}
        doc.setDrawColor(200,200,200); doc.rect(barX,barY,barW,barH);
      }
      y += 22;

      const legend=[
        {label:"Previous Expenses",color:[245,158,11],value:`SAR ${prev.toLocaleString()}`},
        {label:"Current Expense",color:[239,68,68],value:`SAR ${current.toLocaleString()}`},
        {label:`Profit (${profitPct}%)`,color:[16,185,129],value:`SAR ${profit.toLocaleString()}`},
      ];
      const legW=colW/3;
      legend.forEach((item,i)=>{
        const lx=margin+4+i*legW;
        doc.setFillColor(...item.color); doc.rect(lx,y,5,5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(71,85,105);
        doc.text(item.label,lx+7,y+4);
        doc.setFont("helvetica","normal"); doc.setTextColor(15,23,42);
        doc.text(item.value,lx+7,y+9);
      });
      y += 18;

      const pctColor=profitPct>=30?[16,185,129]:profitPct>=10?[245,158,11]:[239,68,68];
      doc.setFillColor(...pctColor.map(c=>Math.round(c*0.12+243)));
      doc.roundedRect(margin,y,colW,16,3,3,"F");
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...pctColor);
      doc.text(`Profit: ${profitPct}%  |  Remaining: SAR ${profit.toLocaleString()}  |  Total: SAR ${total.toLocaleString()}`, margin+colW/2, y+10, {align:"center"});
      y += 22;

      // Footer
      doc.setFillColor(241,245,249); doc.rect(0,pageH-12,pageW,12,"F");
      doc.setFontSize(7); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
      doc.text("Confidential — Contract/Project Expense Report", margin, pageH-4.5);
      doc.text(`Ref: ${expense.contract_number||expense.id}`, pageW-margin, pageH-4.5, {align:"right"});

      doc.save(`expense-${expense.expense_number||expense.id}.pdf`);
    };

    if(window.jspdf) { doExport(); }
    else {
      const script=document.createElement('script');
      script.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload=doExport;
      document.head.appendChild(script);
    }
  };

  const genExpNum=()=>{
    const y=new Date().getFullYear();
    const nums=expenses.map(e=>e.expense_number).filter(n=>n&&n.startsWith(`EXP-${y}-`)).map(n=>parseInt(n.split("-")[2])||0);
    return `EXP-${y}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,"0")}`;
  };

  const handleContractSelect=cid=>{
    const contracts=realContracts.length>0?realContracts:MOCK_CONTRACTS_FULL;
    const c=contracts.find(x=>x.id===cid);
    if(!c) return;
    const prev=expenses.filter(e=>e.contract_id===cid&&e.id!==editing?.id).reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
    setForm(p=>{
      const n={...p,contract_id:c.id,contract_number:c.contract_number,client_name:c.cn,
        contract_category:c.contract_category||"Retainer",contract_start_date:c.sd,contract_end_date:c.ed,
        total_contract_value:c.cv,budget_third_party:parseFloat(c.budget_third_party)||0,contract_notes:c.notes||"",previous_requested_total_amount:prev};
      n.project_profit_pct=calcProfitPct(n.total_contract_value,n.previous_requested_total_amount,n.amount,n.contract_category,n.budget_third_party);
      return n;
    });
  };

  const updF=(k,v)=>setForm(p=>{
    const n={...p,[k]:v};
    n.project_profit_pct=calcProfitPct(n.total_contract_value,n.previous_requested_total_amount,n.amount,n.contract_category,n.budget_third_party);
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

  const del=async id=>{const ok=await confirm({title:'Delete expense?',message:'This expense record will be permanently deleted.',danger:true,confirmLabel:'Delete'});if(ok){dbDelete(id);toast('Expense deleted','success');}};

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

  const profitColor=pct=>{const n=parseFloat(pct);if(isNaN(n))return"#64748b";if(n>=30)return"#10b981";if(n>=10)return"#d97706";return"#EF4444";};
  const statusBg=s=>s==="Approved"?{bg:"#d1fae5",col:"#10b981"}:{bg:"#fef9c3",col:"#d97706"};

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
          <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Track and manage expenses per contract/project</p>
        </div>
        <Btn variant="primary" onClick={openAdd} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Add Expense</Btn>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {/* Total */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",flexShrink:0}}><Wallet size={20} strokeWidth={1.75}/></div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Total Expenses</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#0f172a"}}>{SAR(totalExp)}</p></div>
          </div>
        </Card>
        {/* Approved */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981",flexShrink:0}}><Check size={20} strokeWidth={2}/></div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Approved</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#10b981"}}>{SAR(approvedExp)}</p></div>
          </div>
        </Card>
        {/* Draft */}
        <Card style={{padding:18}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#fef9c3",display:"flex",alignItems:"center",justifyContent:"center",color:"#d97706",flexShrink:0}}><Pencil size={20} strokeWidth={1.75}/></div>
            <div><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Draft</p><p style={{margin:"2px 0 0",fontSize:17,fontWeight:800,color:"#d97706"}}>{SAR(draftExp)}</p></div>
          </div>
        </Card>
        {/* By Type */}
        <Card style={{padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>By Type</p>
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
        <Search size={14} strokeWidth={1.75} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
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
              {loading&&<SkeletonRows cols={7} rows={5}/>}
              {!loading&&filtered.map((e,idx)=>{
                const sb=statusBg(e.status);
                return(
                  <tr key={e.id} style={{background:idx%2===0?"#fff":"#fafafa"}}>
                    <td style={{padding:"9px 13px",fontFamily:"monospace",fontSize:11,fontWeight:600,color:"#475569",borderBottom:"1px solid #f1f5f9"}}>{e.expense_number||"—"}</td>
                    <TD style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{e.request_date||"—"}</TD>
                    <td style={{padding:"9px 13px",fontFamily:"monospace",fontSize:11,color:"#64748b",lineHeight:1.5,borderBottom:"1px solid #f1f5f9"}}>{e.contract_number||"—"}</td>
                    <TD><strong>{e.client_name}</strong></TD>
                    <TD><Bdg bg={EXP_TYPE_COLORS[e.expense_type]+"33"} color={EXP_TYPE_COLORS[e.expense_type]||"#64748b"}>{e.expense_type}</Bdg></TD>
                    <TD>{e.vendor_name||"—"}</TD>
                    <TD style={{fontSize:11,color:"#64748b",lineHeight:1.5}}>{e.department?.replace(" Department","")||"—"}</TD>
                    <TD style={{fontSize:11}}>{e.bill_date||"—"}</TD>
                    <TD align="right" style={{fontWeight:700}}>{Number(e.amount||0).toLocaleString()}</TD>
                    <TD align="right" style={{fontWeight:700,color:profitColor(e.project_profit_pct)}}>{e.project_profit_pct!=null&&e.project_profit_pct!==""?`${e.project_profit_pct}%`:"—"}</TD>
                    <TD align="center"><Bdg bg={sb.bg} color={sb.col}>{e.status}</Bdg></TD>
                    <TD align="right">
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <Btn variant="ghost" size="sm" onClick={()=>openEdit(e)} title="Edit"><Pencil size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="ghost" size="sm" onClick={()=>handleDownloadPDF(e)} title="Download PDF" style={{color:"#3b82f6"}}><Download size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="ghost" size="sm" onClick={()=>setViewExpense(e)} title="View Details" style={{color:"#008A57"}}><Eye size={14} strokeWidth={1.75}/></Btn>
                        <Btn variant="danger" size="sm" onClick={()=>del(e.id)} title="Delete"><Trash2 size={14} strokeWidth={1.75}/></Btn>
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{textAlign:"center",padding:"48px",color:"#64748b"}}><Receipt size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/><p style={{fontSize:14}}>No expenses found</p></div>}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={close} title={editing?"Edit Expense":"Add New Expense"}>
        <form onSubmit={handleSubmit}>
          <div style={{display:"flex",flexDirection:"column",gap:13}}>
            {/* Expense # + Date */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Expense Number</Lbl><input value={editing?form.expense_number||"—":"Auto-generated on save"} readOnly style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"monospace",color:"#64748b",background:"#fff",boxSizing:"border-box"}}/></div>
              <div><Lbl>Request Date *</Lbl><Inp type="date" value={form.request_date} onChange={e=>updF("request_date",e.target.value)} required/></div>
            </div>
            {/* Contract selector */}
            <div><Lbl>Contract *</Lbl>
              <Sel value={form.contract_id} onChange={handleContractSelect}
                options={[{v:"",l:"Select a contract..."},...(realContracts.length>0?realContracts:MOCK_CONTRACTS_FULL).map(c=>({v:c.id,l:`${c.contract_number} — ${c.cn||c.client_name}`}))]}
                style={{opacity:editing?.contract_id?0.6:1}}/>
            </div>
            {/* Read-only contract info */}
            {form.contract_id&&(
              <div style={{padding:"12px 14px",background:"#fff",borderRadius:10,border:"1px solid #e2e8f0"}}>
                <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em"}}>Contract Details (Read Only)</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Contract Number",form.contract_number],["Customer Name",form.client_name],["Category",form.contract_category],["Total Value (SAR)",Number(form.total_contract_value||0).toLocaleString()],["Start Date",form.contract_start_date],["End Date",form.contract_end_date]].map(([l,v])=>(
                    <div key={l}><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>{l}</p><p style={{margin:"1px 0 0",fontSize:13,fontWeight:600,color:"#0f172a"}}>{v||"—"}</p></div>
                  ))}
                  {form.contract_notes&&<div style={{gridColumn:"1/-1"}}><p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>Contract Notes</p><p style={{margin:"1px 0 0",fontSize:13,color:"#475569",lineHeight:1.5}}>{form.contract_notes}</p></div>}
                </div>
              </div>
            )}
            {/* Editable fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><Lbl>Expense Type *</Lbl><Sel value={form.expense_type} onChange={v=>updF("expense_type",v)} options={[{v:"",l:"Select type..."},...EXPENSE_TYPES.map(t=>({v:t,l:t}))]}/></div>
              <div><Lbl>Department *</Lbl><Sel value={form.department} onChange={v=>updF("department",v)} options={[{v:"",l:"Select department..."},...ALLOC_DEPTS.map(d=>({v:d,l:d}))]}/></div>
              <div><Lbl>Vendor Name *</Lbl><Inp value={form.vendor_name} onChange={e=>updF("vendor_name",e.target.value)} placeholder="Vendor name..." required/></div>
              <div><Lbl>Amount (SAR) *</Lbl><Inp type="number" min="0" value={form.amount} onChange={e=>updF("amount",e.target.value)} placeholder="0" required/></div>
              <div><Lbl>Previous Requested Total</Lbl><input value={form.previous_requested_total_amount} readOnly style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#64748b",lineHeight:1.5,background:"#fff",boxSizing:"border-box"}}/><p style={{margin:"3px 0 0",fontSize:10,color:"#64748b",lineHeight:1.5}}>Auto-calculated from existing expenses</p></div>
              <div><Lbl>Bill Number *</Lbl><Inp value={form.bill_number} onChange={e=>updF("bill_number",e.target.value)} placeholder="INV-001..." required/></div>
              <div><Lbl>Bill Date *</Lbl><Inp type="date" value={form.bill_date} onChange={e=>updF("bill_date",e.target.value)} required/></div>
              <div><Lbl>Status</Lbl><Sel value={form.status} onChange={v=>updF("status",v)} options={[{v:"Draft",l:"Draft"},{v:"Approved",l:"Approved"}]}/></div>
            </div>
            <div><Lbl>Item Details *</Lbl><Inp value={form.item_details} onChange={e=>updF("item_details",e.target.value)} placeholder="Describe the expense item..." required/></div>
            <div><Lbl>Notes *</Lbl><textarea value={form.notes} onChange={e=>updF("notes",e.target.value)} placeholder="Additional notes..." rows={2} required style={{width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#0f172a",lineHeight:1.5,outline:"none",resize:"vertical",boxSizing:"border-box"}}/></div>
            {/* Profit calc */}
            {form.contract_id&&(
              <div style={{padding:"12px 16px",background:"#fff",borderRadius:10,display:"flex",alignItems:"center",gap:14}}>
                <div data-chart-tile="1" style={{width:38,height:38,borderRadius:9,background:"#fff",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981"}}><TrendingUp size={18} strokeWidth={1.75}/></div>
                <div>
                  <p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5,fontWeight:600}}>Project Profit % (Auto-calculated)</p>
                  <p style={{margin:"2px 0 0",fontSize:20,fontWeight:800,color:profitColor(form.project_profit_pct)}}>{form.project_profit_pct!==""&&form.project_profit_pct!=null?`${form.project_profit_pct}%`:"—"}</p>
                  <p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>= (Contract Value − Previous − Amount) ÷ Contract Value × 100</p>
                </div>
              </div>
            )}
            {/* Attachment placeholder */}
            <div><Lbl>Attachment</Lbl>
              <div style={{border:"2px dashed #e2e8f0",borderRadius:10,padding:"16px 20px",textAlign:"center",color:"#64748b",cursor:"not-allowed"}}>
                <p style={{margin:0,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Paperclip size={14} strokeWidth={1.75}/>Click to upload PDF attachment</p>
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

    {/* View Expense Modal */}
    {viewExpense&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 50px rgba(0,0,0,.2)"}}>
          <div style={{padding:"18px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:1}}>
            <div>
              <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a",lineHeight:1.5}}>Expense Details</p>
              <p style={{margin:0,fontSize:12,color:"#64748b",lineHeight:1.5}}>{viewExpense.expense_number||"—"}</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="outline" size="sm" onClick={()=>handleDownloadPDF(viewExpense)} style={{gap:6}}><Download size={13} strokeWidth={1.75}/>Download PDF</Btn>
              <button onClick={()=>setViewExpense(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:4}}><X size={18} strokeWidth={2}/></button>
            </div>
          </div>
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:20}}>
            {/* Status */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{padding:"4px 12px",borderRadius:999,fontSize:12,fontWeight:600,background:viewExpense.status==="Approved"?"#d1fae5":"#fef3c7",color:viewExpense.status==="Approved"?"#059669":"#d97706"}}>{viewExpense.status||"Draft"}</span>
              <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{viewExpense.request_date||"—"}</span>
            </div>
            {/* Contract Details */}
            <div style={{background:"#f8fafc",borderRadius:10,padding:16}}>
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:12,color:"#0f172a",lineHeight:1.5,textTransform:"uppercase",letterSpacing:".05em"}}>Contract Details</p>
              {[["Contract","contract_number"],["Client","client_name"],["Category","contract_category"],["Contract Value","total_contract_value"],...((viewExpense.contract_category||"").toLowerCase().includes("retainer")?[["3rd Party Budget","budget_third_party"]]:[]),["Start Date","contract_start_date"],["End Date","contract_end_date"]].map(([l,k])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #e2e8f0",fontSize:13}}>
                  <span style={{color:"#64748b"}}>{l}</span>
                  <span style={{fontWeight:500,color:"#0f172a"}}>{k==="total_contract_value"?`SAR ${Number(viewExpense[k]||0).toLocaleString()}`:viewExpense[k]||"—"}</span>
                </div>
              ))}
            </div>
            {/* Expense Details */}
            <div style={{background:"#f8fafc",borderRadius:10,padding:16}}>
              <p style={{margin:"0 0 10px",fontWeight:700,fontSize:12,color:"#0f172a",lineHeight:1.5,textTransform:"uppercase",letterSpacing:".05em"}}>Expense Details</p>
              {[["Type","expense_type"],["Vendor","vendor_name"],["Department","department"],["Amount","amount"],["Previous Total","previous_requested_total_amount"],["Bill #","bill_number"],["Bill Date","bill_date"],["Item Details","item_details"],["Notes","notes"]].map(([l,k])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #e2e8f0",fontSize:13}}>
                  <span style={{color:"#64748b"}}>{l}</span>
                  <span style={{fontWeight:500,color:"#0f172a"}}>{["amount","previous_requested_total_amount"].includes(k)?`SAR ${Number(viewExpense[k]||0).toLocaleString()}`:viewExpense[k]||"—"}</span>
                </div>
              ))}
            </div>
            {/* Profitability */}
            {(()=>{
              const isRet=(viewExpense.contract_category||"").toLowerCase().includes("retainer");
              const profBase=isRet?(parseFloat(viewExpense.budget_third_party)||0):(parseFloat(viewExpense.total_contract_value)||0);
              const total=parseFloat(viewExpense.total_contract_value)||0;
              const prev=parseFloat(viewExpense.previous_requested_total_amount)||0;
              const curr=parseFloat(viewExpense.amount)||0;
              const profit=profBase-prev-curr;
              const pct=parseFloat(viewExpense.project_profit_pct)||0;
              const clr=pct>=30?"#059669":pct>=10?"#d97706":"#dc2626";
              return(
                <div style={{background:"#f0fdf4",borderRadius:10,padding:16}}>
                  <p style={{margin:"0 0 10px",fontWeight:700,fontSize:12,color:"#0f172a",lineHeight:1.5,textTransform:"uppercase",letterSpacing:".05em"}}>Profitability</p>
                  <div style={{display:"flex",gap:4,height:16,borderRadius:6,overflow:"hidden",marginBottom:12}}>
                    {prev>0&&<div style={{flex:prev/profBase,background:"#f59e0b"}}/>}
                    {curr>0&&<div style={{flex:curr/profBase,background:"#ef4444"}}/>}
                    {profit>0&&<div style={{flex:profit/profBase,background:"#10b981"}}/>}
                  </div>
                  <p style={{margin:"0 0 8px",fontSize:11,color:"#64748b",lineHeight:1.5}}>{isRet?"vs 3rd Party Budget":"vs Total Contract Value"}: SAR {profBase.toLocaleString()}</p>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <div style={{textAlign:"center"}}><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Previous</p><p style={{margin:0,fontWeight:600,color:"#d97706"}}>SAR {prev.toLocaleString()}</p></div>
                    <div style={{textAlign:"center"}}><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Current</p><p style={{margin:0,fontWeight:600,color:"#ef4444"}}>SAR {curr.toLocaleString()}</p></div>
                    <div style={{textAlign:"center"}}><p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>Profit ({pct}%)</p><p style={{margin:0,fontWeight:600,color:clr}}>SAR {profit.toLocaleString()}</p></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM USERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════



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
  },[sb]);
  const dbSaveRole=async(payload,id)=>{
    if(id){
      const{data,error}=await sb.from('role_permissions').update(payload).eq('id',id).select().single();
      if(error)throw new Error(error.message);
      if(data)setRoles(p=>p.map(r=>r.id===id?data:r));
    } else {
      const{data,error}=await sb.from('role_permissions').insert([payload]).select().single();
      if(error)throw new Error(error.message);
      if(data)setRoles(p=>[...p,data]);
    }
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
  const dbDeleteUser=async id=>{
    // Delete from profiles (RLS allows admin)
    await sb.from('profiles').delete().eq('id',id);
    // Also disable their session via admin RPC (requires SQL function in Supabase)
    await sb.rpc('delete_auth_user',{user_id:id}).catch(()=>null);
    setUsers(p=>p.filter(u=>u.id!==id));
  };
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

  const [roleSaving,setRoleSaving]=useState(false);
  const handleSaveRole=async()=>{
    if(!roleForm.role_name.trim()){toast('Please enter a role name','warning');return;}
    if(roleSaving)return;
    setRoleSaving(true);
    try{
      await dbSaveRole(roleForm, editingRole?.id||null);
      toast(editingRole?'Role updated':'Role created','success');
      closeRoleModal();
    } catch(err){
      console.error('Role save error:',err);
      toast(err.message||'Failed to save role. Please try again.','error');
    } finally{
      setRoleSaving(false);
    }
  };
  const deleteRole=async id=>{const ok=await confirm({title:'Delete role?',message:'This role will be permanently deleted. Users with this role will lose their permissions.',danger:true,confirmLabel:'Delete'});if(ok){await dbDeleteRole(id);toast('Role deleted','success');}};

  // Invite user
  const handleInvite=async e=>{
    e.preventDefault();
    if(!inviteEmail){toast('Enter an email address','warning');return;}
    if(!inviteRoleId){toast('Select a role before inviting','warning');return;}
    if(users.find(u=>u.email===inviteEmail)){toast('A user with this email already exists','warning');return;}
    const{error}=await dbInviteUser(inviteEmail,inviteRoleId);
    if(error){toast(`Failed: ${error.message}`,'error');return;}
    toast(`Invitation sent to ${inviteEmail}`,'success');
    setInviteEmail(""); setInviteRoleId("");
    const{data}=await sb.from('role_permissions').select('*');
    if(data)setRoles(data);
  };

  // Edit user
  const openEditUser=u=>{setEditingUser(u);setEditUserForm({full_name:u.full_name||"",email:u.email||"",departments:u.departments||[]});setEditUserModal(true);};
  const handleSaveUser=async()=>{
    if(!editUserForm.email){toast('Email is required','warning');return;}
    await dbUpdateUser(editingUser.id,{full_name:editUserForm.full_name,email:editUserForm.email,departments:editUserForm.departments});
    setEditUserModal(false);
  };
  const deleteUser=async u=>{
    if(u.role==="admin"){toast('Cannot delete admin users','warning');return;}
    const _uok=await confirm({title:'Remove user?',message:`${u.full_name||u.email} will lose access to Profit Pulse.`,danger:true,confirmLabel:'Remove'});
      if(_uok){await dbDeleteUser(u.id);toast('User removed','success');}
  };
  const resendInvite=email=>toast(`Activation email resent to ${email}`,'success');
  const assignRole=async(userEmail,newRoleId,curRoleId)=>{
    // Remove from old role
    if(curRoleId){
      const oldRole=roles.find(r=>r.id===curRoleId);
      if(oldRole){
        const updated=(oldRole.assigned_users||[]).filter(e=>e!==userEmail);
        await sb.from('role_permissions').update({assigned_users:updated}).eq('id',curRoleId);
      }
    }
    // Add to new role
    if(newRoleId&&newRoleId!=="none"){
      const newRole=roles.find(r=>r.id===newRoleId);
      if(newRole){
        const updated=[...(newRole.assigned_users||[]),userEmail];
        await sb.from('role_permissions').update({assigned_users:updated}).eq('id',newRoleId);
      }
    }
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
        <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,marginTop:3}}>Manage users and role permissions</p>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:4,maxWidth:340}}>
        {[["users",Users,"Users"],["roles",ShieldCheck,"Role Permissions"]].map(([v,Ic,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:tab===v?"#fff":"transparent",fontWeight:tab===v?700:500,fontSize:13,color:tab===v?"#0f172a":"#64748b",cursor:"pointer",boxShadow:tab===v?"0 1px 3px rgba(0,0,0,.1)":"none",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7}}><Ic size={14} strokeWidth={1.75}/>{l}</button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab==="users"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Invite card */}
          <Card style={{padding:20}}>
            <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5,display:"flex",alignItems:"center",gap:8}}><UserPlus size={16} strokeWidth={1.75} style={{color:"#64748b"}}/>Invite New User</p>
            <form onSubmit={handleInvite} style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
                placeholder="Enter email address" required
                style={{flex:1,minWidth:200,padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#f1f5f9",color:"#0f172a"}}/>
              <Sel value={inviteRoleId} onChange={setInviteRoleId}
                options={[{v:"",l:roles.length===0?"No roles — create one first":"Select role (required)"},...roles.map(r=>({v:r.id,l:r.role_name}))]}
                style={{width:200,borderColor:!inviteRoleId?"#fca5a5":"#e2e8f0"}}/>
              <Btn variant="primary" type="submit" style={{gap:6}}><Send size={13} strokeWidth={1.75}/>Send Invite</Btn>
            </form>
          </Card>

          {/* User list */}
          <Card style={{overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9"}}>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>User Management</p>
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
                  const statusCol=u.status==="active"?"#10b981":"#d97706";
                  const statusLabel=u.status==="active"?"Active":"Pending Invitation";
                  return(
                    <tr key={u.id} style={{background:idx%2===0?"#fff":"#fafafa"}}>
                      <TD>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:34,height:34,borderRadius:9,background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#475569",lineHeight:1.5,flexShrink:0}}>
                            {(u.full_name||u.email||"U").charAt(0).toUpperCase()}
                          </div>
                          <span style={{fontWeight:600}}>{u.full_name||"—"}</span>
                        </div>
                      </TD>
                      <TD style={{color:"#64748b"}}>{u.email}</TD>
                      <TD><Bdg bg={statusBg} color={statusCol}>{statusLabel}</Bdg></TD>
                      <TD><Bdg bg={u.role==="admin"?"#e6f7f0":"#f1f5f9"} color={u.role==="admin"?"#008A57":"#475569"}>{u.role==="admin"?"Admin":"Manager"}</Bdg></TD>
                      <TD>
                        {u.role!=="admin"?(
                          <select value={assignedRole?.id||"none"} onChange={e=>assignRole(u.email,e.target.value,assignedRole?.id)}
                            style={{padding:"5px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,color:"#0f172a",lineHeight:1.5,background:"#fff",cursor:"pointer",width:150}}>
                            <option value="none">No role</option>
                            {roles.map(r=><option key={r.id} value={r.id}>{r.role_name}</option>)}
                          </select>
                        ):<span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Full access</span>}
                      </TD>
                      <TD>
                        {u.departments?.length>0
                          ?<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{u.departments.map(d=><Bdg key={d} bg="#f1f5f9" color="#475569">{d.replace(" Department","")}</Bdg>)}</div>
                          :<span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>None</span>}
                      </TD>
                      <TD align="center">
                        <div style={{display:"flex",justifyContent:"center",gap:4}}>
                          {!u.isPending&&u.email!==CURRENT_USER?.email&&<Btn variant="ghost" size="sm" title="Impersonate" style={{color:"#008A57"}} data-impersonate="1" onClick={()=>toast(`Impersonating ${u.full_name||u.email} (not yet implemented)`,'info')}><Eye size={14} strokeWidth={1.75}/></Btn>}
                          <Btn variant="ghost" size="sm" onClick={()=>openEditUser(u)} title="Edit"><Pencil size={14} strokeWidth={1.75}/></Btn>
                          {u.status==="invited"&&<Btn variant="ghost" size="sm" style={{color:"#008A57"}} onClick={()=>resendInvite(u.email)} title="Resend invite"><Mail size={14} strokeWidth={1.75}/></Btn>}
                          {u.role!=="admin"&&<Btn variant="danger" size="sm" onClick={()=>deleteUser(u)} title="Delete"><Trash2 size={14} strokeWidth={1.75}/></Btn>}
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
            <p style={{margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#0f172a",lineHeight:1.5}}>Your Account</p>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:56,height:56,borderRadius:14,background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#475569",flexShrink:0}}>
                {(CURRENT_USER?.full_name||CURRENT_USER?.email||"A").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:16,color:"#0f172a",lineHeight:1.5}}>{CURRENT_USER?.full_name||"Admin"}</p>
                <p style={{margin:"2px 0 6px",fontSize:13,color:"#64748b",lineHeight:1.5}}>{CURRENT_USER?.email||"admin@company.com"}</p>
                <Bdg bg="#e6f7f0" color="#008A57">Admin</Bdg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {tab==="roles"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a",lineHeight:1.5}}>Role Permissions</p><p style={{margin:"2px 0 0",fontSize:12,color:"#64748b",lineHeight:1.5}}>Define what each role can access</p></div>
            <Btn variant="primary" onClick={openCreateRole} style={{gap:6}}><Plus size={14} strokeWidth={2}/>Create Role</Btn>
          </div>

          {roles.length===0?(
            <Card style={{padding:48,textAlign:"center",color:"#64748b"}}>
              <ShieldCheck size={40} strokeWidth={1.25} style={{margin:"0 auto 12px",display:"block",color:"#cbd5e1"}}/>
              <p style={{fontSize:14,fontWeight:600,color:"#64748b"}}>No roles created yet</p>
              <p style={{fontSize:12,marginTop:4}}>Create a role to define permissions for your team</p>
            </Card>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {roles.map(role=>(
                <Card key={role.id} style={{padding:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981"}}><ShieldCheck size={20} strokeWidth={1.75}/></div>
                      <div>
                        <p style={{margin:0,fontWeight:700,fontSize:15,color:"#0f172a",lineHeight:1.5}}>{role.role_name}</p>
                        <p style={{margin:"1px 0 0",fontSize:12,color:"#64748b",lineHeight:1.5}}>{role.assigned_users?.length||0} users assigned</p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <Btn variant="ghost" size="sm" onClick={()=>openEditRole(role)}><Pencil size={14} strokeWidth={1.75}/></Btn>
                      <Btn variant="danger" size="sm" onClick={()=>deleteRole(role.id)}><Trash2 size={14} strokeWidth={1.75}/></Btn>
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
                                {p[perm]?<Check size={16} strokeWidth={2.5} style={{color:"#10b981"}}/>:<span style={{color:"#e2e8f0"}}>—</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                  {role.allowed_departments?.length>0&&(
                    <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Dept Access:</span>
                      {role.allowed_departments.map(d=><Bdg key={d} bg="#dbeafe" color="#1d4ed8">{d.replace(" Department","")}</Bdg>)}
                    </div>
                  )}
                  {role.assigned_users?.length>0&&(
                    <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Assigned:</span>
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
                        <p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",lineHeight:1.5}}>{ent.name}</p>
                        <p style={{margin:0,fontSize:10,color:"#64748b",lineHeight:1.5}}>{ent.desc}</p>
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
            <p style={{margin:"2px 0 8px",fontSize:11,color:"#64748b",lineHeight:1.5}}>Leave all unchecked to allow all departments.</p>
            <div style={{border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
              {SU_DEPTS.map(dept=>(
                <label key={dept} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:7,cursor:"pointer",background:"#fff"}}>
                  <input type="checkbox" checked={roleForm.allowed_departments.includes(dept)} onChange={e=>toggleDept(dept,e.target.checked)} style={{accentColor:"#0f172a",width:14,height:14,cursor:"pointer"}}/>
                  <span style={{fontSize:13,color:"#0f172a",lineHeight:1.5}}>{dept}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={closeRoleModal} disabled={roleSaving}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSaveRole} disabled={roleSaving} style={{gap:6}}>
              {roleSaving?<><Loader size={13} style={{animation:"spin .8s linear infinite"}}/>Saving…</>:<><Save size={13} strokeWidth={1.75}/>{editingRole?"Update Role":"Create Role"}</>}
            </Btn>
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
            <p style={{margin:"2px 0 8px",fontSize:11,color:"#64748b",lineHeight:1.5}}>Select departments this user has access to</p>
            <div style={{border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 12px",display:"flex",flexDirection:"column",gap:4}}>
              {SU_DEPTS.map(dept=>(
                <label key={dept} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",borderRadius:7,cursor:"pointer"}}>
                  <input type="checkbox" checked={editUserForm.departments.includes(dept)} onChange={e=>setEditUserForm(p=>({...p,departments:e.target.checked?[...p.departments,dept]:p.departments.filter(d=>d!==dept)}))} style={{accentColor:"#0f172a",width:14,height:14,cursor:"pointer"}}/>
                  <span style={{fontSize:13,color:"#0f172a",lineHeight:1.5}}>{dept}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
            <Btn variant="outline" onClick={()=>setEditUserModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSaveUser} style={{gap:6}}><Save size={13} strokeWidth={1.75}/>Save Changes</Btn>
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
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,color:"#64748b"}}>
      <Construction size={56} strokeWidth={1.25} style={{margin:"0 auto 16px",display:"block",color:"#cbd5e1"}}/>
      <h2 style={{fontSize:20,fontWeight:700,color:"#475569",margin:"0 0 8px"}}>{page}</h2>
      <p style={{fontSize:14,margin:0}}>This page will be built next</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PLATFORM SHELL
// ═══════════════════════════════════════════════════════════════════════════════
// Map sidebar page IDs to permission module keys

function AccessDenied(){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,gap:14}}>
      <Lock size={48} strokeWidth={1.25} style={{margin:"0 auto",display:"block",color:"#cbd5e1"}}/>
      <h2 style={{margin:0,fontSize:20,fontWeight:700,color:"#0f172a"}}>Access Denied</h2>
      <p style={{margin:0,fontSize:13,color:"#64748b",lineHeight:1.5}}>You don't have permission to view this page.</p>
      <p style={{margin:0,fontSize:12,color:"#64748b",lineHeight:1.5}}>Contact your administrator to request access.</p>
    </div>
  );
}

function PlatformApp(){
  const {session,profile,signOut,sb,can} = useAuth();
  const [activePage,setActivePage]=useState(()=>localStorage.getItem("pp_activePage")||"Dashboard");
  const [sidebarHovered,setSidebarHovered]=useState(false);

  // Find first accessible page on load
  useEffect(()=>{
    if(can) {
      const first = NAV.find(n=>can(PAGE_PERM_KEY[n.id],"view"));
      if(first && !can(PAGE_PERM_KEY["Dashboard"],"view")){localStorage.setItem("pp_activePage",first.id);setActivePage(first.id);}
    }
  },[profile]);

  const renderPage=()=>{
    const key = PAGE_PERM_KEY[activePage];
    if(key && !can(key,"view")) return <AccessDenied/>;
    if(activePage==="Dashboard")         return <DashboardPage/>;
    if(activePage==="Employees")         return <EmployeesPage/>;
    if(activePage==="Clients")           return <ClientsPage/>;
    if(activePage==="Contracts")         return <ContractsPage/>;
    if(activePage==="Allocations")       return <AllocationsPage/>;
    if(activePage==="Reports")           return <ReportsPage/>;
    if(activePage==="MonthlyClose")      return <MonthlyClosePage/>;
    if(activePage==="ContractExpenses")  return <ContractExpensesPage/>;
    if(activePage==="Settings")          return <SystemUsersPage/>;
    return <ComingSoon page={NAV.find(n=>n.id===activePage)?.label||activePage}/>;
  };

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Inter',system-ui,sans-serif",background:"#f8fafc",overflow:"hidden",position:"relative"}}>

      {/* Sidebar spacer (always 64px wide — reserves layout space) */}
      <div style={{width:64,flexShrink:0}}/>

      {/* Sidebar (absolute, expands on hover — overlays content without resizing it) */}
      <aside
        onMouseEnter={()=>setSidebarHovered(true)}
        onMouseLeave={()=>setSidebarHovered(false)}
        style={{
          position:"absolute",top:0,left:0,bottom:0,
          width:sidebarHovered?240:64,
          background:"#fff",
          borderRight:"1px solid #e2e8f0",
          display:"flex",flexDirection:"column",
          overflowY:"auto",overflowX:"hidden",
          transition:"width .18s ease",
          zIndex:50,
          boxShadow:sidebarHovered?"4px 0 16px rgba(15,23,42,.06)":"none",
        }}>
        {/* Logo */}
        <div style={{padding:sidebarHovered?"18px 20px":"18px 0",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:sidebarHovered?"flex-start":"center",minHeight:62,flexShrink:0}}>
          {sidebarHovered?(
            <div style={{whiteSpace:"nowrap"}}>
              <p style={{margin:0,fontWeight:800,fontSize:15,color:"#0f172a",lineHeight:1.5}}>Team Allocation</p>
              <p style={{margin:"2px 0 0",fontSize:11,color:"#64748b",lineHeight:1.5}}>Acquaint Communications</p>
            </div>
          ):(
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#008A57,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff"}}>T</div>
          )}
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:sidebarHovered?"10px 12px":"10px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {NAV.filter(item=>can(PAGE_PERM_KEY[item.id],"view")).map(item=>{
            const active=activePage===item.id;
            return(
              <button key={item.id} onClick={()=>{localStorage.setItem("pp_activePage",item.id);setActivePage(item.id);}}
                title={!sidebarHovered?item.label:undefined}
                style={{display:"flex",alignItems:"center",gap:10,padding:sidebarHovered?"9px 12px":"9px 0",justifyContent:sidebarHovered?"flex-start":"center",borderRadius:10,border:"none",background:active?"#f1f5f9":"transparent",color:active?"#0f172a":"#64748b",cursor:"pointer",fontSize:13,fontWeight:active?600:500,textAlign:"left",transition:"background .15s",width:"100%",overflow:"hidden"}}>
                <item.Icon size={18} strokeWidth={1.75} style={{opacity:active?1:.85,color:active?"#0f172a":"#64748b",flexShrink:0}}/>
                {sidebarHovered&&<span style={{flex:1,whiteSpace:"nowrap"}}>{item.label}</span>}
                {sidebarHovered&&active&&<ChevronRight size={14} strokeWidth={2} style={{opacity:.7,color:"#64748b",flexShrink:0}}/>}
              </button>
            );
          })}
        </nav>
        {/* User */}
        <div style={{padding:sidebarHovered?"12px 14px":"12px 8px",borderTop:"1px solid #f1f5f9",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:sidebarHovered?8:0,justifyContent:sidebarHovered?"flex-start":"center"}}>
            <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#008A57,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>
              {(profile?.full_name||profile?.email||"U").charAt(0).toUpperCase()}
            </div>
            {sidebarHovered&&<div style={{flex:1,overflow:"hidden"}}>
              <p style={{margin:0,fontWeight:600,fontSize:12,color:"#0f172a",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.full_name||"User"}</p>
              <p style={{margin:0,fontSize:11,color:"#64748b",lineHeight:1.5}}>{profile?.role==="admin"?"Admin":"Manager"}</p>
            </div>}
          </div>
          {sidebarHovered&&<button onClick={signOut} style={{width:"100%",padding:"7px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:12,cursor:"pointer",fontWeight:500}}>Sign Out</button>}
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
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <PlatformRoot/>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

function PlatformRoot(){
  const {session,permsLoaded} = useAuth();
  // Show loading spinner until BOTH session AND permissions are resolved
  if(session===undefined || (session && !permsLoaded)) return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#f8fafc",gap:16}}>
      <div style={{width:40,height:40,border:"3px solid #e2e8f0",borderTopColor:"#008A57",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{fontSize:13,color:"#64748b",lineHeight:1.5,margin:0}}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if(!session) return <LoginPage/>;
  return <PlatformApp/>;

}
