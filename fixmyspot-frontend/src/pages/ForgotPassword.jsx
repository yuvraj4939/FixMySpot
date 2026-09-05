import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";

export default function ForgotPassword(){
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  const submit=async e=>{
    e.preventDefault(); setError(""); setBusy(true);
    try{
      await api.forgotPassword(email);
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    }catch(err){setError(err.message)}finally{setBusy(false)}
  };

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <Link to="/login" className="back-link">← Back to login</Link>
    <h1>Forgot password?</h1>
    <p>Enter your registered email and we'll send you a 6-digit OTP.</p>
    {error&&<div className="error-box">{error}</div>}
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
    <button className="btn btn-primary full" disabled={busy}>{busy?"Sending OTP…":"Send OTP"}</button>
  </form></div>;
}