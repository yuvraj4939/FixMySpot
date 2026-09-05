import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";

export default function VerifyOtp(){
  const params=new URLSearchParams(useLocation().search);
  const navigate=useNavigate();
  const [email]=useState(params.get("email")||"");
  const [otp,setOtp]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  const submit=async e=>{
    e.preventDefault();setError("");setBusy(true);
    try{
      await api.verifyResetOtp(email,otp);
      navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    }catch(err){setError(err.message)}finally{setBusy(false)}
  };

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <Link to="/login" className="back-link">← Back to login</Link>
    <h1>Verify OTP</h1>
    <p>Enter the 6-digit OTP sent to <strong>{email}</strong>.</p>
    {error&&<div className="error-box">{error}</div>}
    <label>OTP<input inputMode="numeric" maxLength="6" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} required/></label>
    <button className="btn btn-primary full" disabled={busy}>{busy?"Verifying…":"Verify OTP"}</button>
  </form></div>;
}