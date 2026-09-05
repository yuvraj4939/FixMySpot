import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";

export default function ResetPassword(){
  const params=new URLSearchParams(useLocation().search);
  const navigate=useNavigate();
  const email=params.get("email")||"";
  const otp=params.get("otp")||"";
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);
  const [busy,setBusy]=useState(false);

  const submit=async e=>{
    e.preventDefault();setError("");
    if(password!==confirm){setError("Passwords do not match.");return}
    setBusy(true);
    try{
      await api.resetPassword(email,otp,password);
      setDone(true);
      setTimeout(()=>navigate("/login",{replace:true}),1200);
    }catch(err){setError(err.message)}finally{setBusy(false)}
  };

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <Link to="/login" className="back-link">← Back to login</Link>
    <h1>Set new password</h1>
    <p>Create a new password for your FixMySpot account.</p>
    {error&&<div className="error-box">{error}</div>}
    {done&&<div className="success-box">Password reset successfully. Redirecting to login…</div>}
    <label>New password<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
    <label>Confirm password<input type="password" minLength="6" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>
    <button className="btn btn-primary full" disabled={busy||done}>{busy?"Updating…":"Reset password"}</button>
  </form></div>;
}