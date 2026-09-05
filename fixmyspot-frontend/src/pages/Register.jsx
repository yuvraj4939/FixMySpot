import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register(){
  const {register}=useAuth(); const navigate=useNavigate(); const [form,setForm]=useState({name:"",email:"",password:""}); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{await register(form);navigate("/home",{replace:true});}catch(err){setError(err.message)}finally{setBusy(false)}};
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><Link to="/" className="brand auth-brand"><span className="brand-mark">F</span>FixMySpot</Link><h1>Create your account 🚀</h1><p>Your account will be stored in MongoDB.</p>{error&&<div className="error-box">{error}</div>}<label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Password<input type="password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></label><button className="btn btn-primary full" disabled={busy}>{busy?"Creating…":"Create account"}</button><p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p></form></div>;
}
