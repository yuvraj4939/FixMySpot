import { AlertTriangle, CheckCircle2, Clock3, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useReports } from "../context/ReportsContext";
import ProblemCard from "../components/ProblemCard";
import StatCard from "../components/StatCard";
import MapPlaceholder from "../components/MapPlaceholder";

export default function Home(){
  const {reports,loading}=useReports(); const active=reports.filter(r=>r.status!=="Fixed"); const fixed=reports.filter(r=>r.status==="Fixed"); const high=active.filter(r=>r.severity==="High");
  return <><section className="page-heading"><div><span className="eyebrow">YOUR COMMUNITY</span><h1>Community overview 👋</h1><p>See what needs attention around you.</p></div><Link to="/report" className="btn btn-primary"><PlusCircle size={18}/>Report a problem</Link></section>
    <div className="stats-grid"><StatCard label="Active reports" value={active.length} icon={AlertTriangle}/><StatCard label="High priority" value={high.length} icon={Clock3}/><StatCard label="Problems fixed" value={fixed.length} icon={CheckCircle2}/></div>
    <section className="split-section"><div className="section-block"><div className="section-title"><div><h2>Live problem map</h2><p>Reports loaded from MongoDB</p></div><Link to="/map">View full map</Link></div><MapPlaceholder reports={reports}/></div><div className="section-block"><div className="section-title"><div><h2>Recent reports</h2><p>{loading?"Loading…":"Latest community activity"}</p></div></div>{reports.slice(0,4).map(r=><ProblemCard key={r.id} report={r}/>)}</div></section>
  </>;
}
