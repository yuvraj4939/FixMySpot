import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useReports } from "../context/ReportsContext";
import { MapPin, Users, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ProblemDetails(){
 const {id}=useParams(); const {confirmReport,reports}=useReports(); const [report,setReport]=useState(reports.find(r=>r.id===id)||null); const [error,setError]=useState("");
 useEffect(()=>{if(!report)api.getReport(id).then(x=>setReport(x.report)).catch(e=>setError(e.message))},[id]);
 if(error)return <div className="empty-state"><h2>{error}</h2><Link to="/home">Back</Link></div>; if(!report)return <div className="empty-state"><h2>Loading…</h2></div>;
 const confirm=async()=>{try{setReport(await confirmReport(id))}catch(e){setError(e.message)}};
 return <div><Link to="/home" className="back-link"><ArrowLeft size={17}/>Back</Link><section className="details-hero"><div><span className="status status-reported">{report.status}</span><h1>{report.title}</h1><p>{report.description}</p>{error&&<div className="error-box">{error}</div>}</div><button className="btn btn-primary" onClick={confirm}><CheckCircle2 size={18}/>I also noticed this</button></section>{report.imageUrl && <section className="details-card report-photo-card"><h2>Problem photo</h2><img className="report-photo" src={`http://localhost:5000${report.imageUrl}`} alt={report.title} /></section>}<div className="details-grid"><section className="details-card"><h2>Location</h2><div className="location-preview tall"><MapPin size={34}/><span>{report.location?.address}</span></div></section><section className="details-card"><h2>Report information</h2><div className="info-list"><div><span>Category</span><strong>{report.category}</strong></div><div><span>Severity</span><strong>{report.severity}</strong></div><div><span><Users size={15}/>Confirmations</span><strong>{report.confirmations}</strong></div></div></section></div></div>;
}
