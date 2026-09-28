import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useReports } from "../context/ReportsContext";
import { useAuth } from "../context/AuthContext";
import ProblemCard from "../components/ProblemCard";

export default function MyReports(){
 const {reports}=useReports(); const {user}=useAuth(); const mine=reports.filter(r=>r.reporter?._id===user.id||r.reporter===user.id);
 return <><section className="page-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h1>My reports</h1><p>Reports stored in MongoDB under your account.</p></div><Link to="/report" className="btn btn-primary"><PlusCircle size={18}/>New report</Link></section>{mine.length?<div className="reports-list-grid">{mine.map(r=><ProblemCard key={r.id} report={r}/>)}</div>:<div className="empty-state"><h2>No reports yet</h2><p>Submit your first community issue.</p><Link to="/report" className="btn btn-primary">Report a problem</Link></div>}</>;
}
