import { useEffect, useState } from "react";
import { AlertTriangle, Users, CheckCircle2, Clock3 } from "lucide-react";
import { api } from "../../services/api";
import { useReports } from "../../context/ReportsContext";
import StatCard from "../../components/StatCard";
import ProblemCard from "../../components/ProblemCard";

export default function AdminDashboard(){
 const {reports}=useReports(); const [s,setS]=useState(null); useEffect(()=>{api.stats().then(setS).catch(console.error)},[reports]);
 return <><section className="page-heading"><div><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>Dashboard overview</h1><p>Live numbers from your MongoDB database.</p></div></section><div className="stats-grid"><StatCard label="Total reports" value={s?.total??reports.length} icon={AlertTriangle}/><StatCard label="Active issues" value={s?.active??0} icon={Clock3}/><StatCard label="High priority" value={s?.high??0} icon={Users}/><StatCard label="Resolved" value={s?.fixed??0} icon={CheckCircle2}/></div><section className="section-block"><div className="section-title"><h2>Latest reports</h2></div><div className="reports-list-grid">{reports.slice(0,6).map(r=><ProblemCard key={r.id} report={r}/>)}</div></section></>;
}
