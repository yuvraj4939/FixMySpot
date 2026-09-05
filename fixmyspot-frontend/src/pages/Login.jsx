import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login(){
  const {login}=useAuth(); const navigate=useNavigate(); const [form,setForm]=useState({email:"",password:""}); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{const u=await login(form.email,form.password);navigate(u.role==="admin"?"/admin/dashboard":"/home",{replace:true});}catch(err){setError(err.message)}finally{setBusy(false)}};
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><Link to="/" className="brand auth-brand"><span className="brand-mark">F</span>FixMySpot</Link><h1>Welcome back 👋</h1><p>Login using your real FixMySpot account.</p>{error&&<div className="error-box">{error}</div>}<label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></label><button className="btn btn-primary full" disabled={busy}>{busy?"Signing in…":"Login"}</button><Link className="forgot-link" to="/forgot-password">Forgot password?</Link><p className="auth-switch">No account? <Link to="/register">Create one</Link></p></form></div>;
}
