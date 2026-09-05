import { Link } from "react-router-dom";
import { MapPin, Users, CalendarDays, ArrowUpRight } from "lucide-react";

export default function ProblemCard({report}) {
  const priority = report.priority ?? 0;
  const statusClass = report.status.toLowerCase().replaceAll(" ","-");
  return <article className="problem-card">
    <div className="problem-card-top"><span className={`status status-${statusClass}`}>{report.status}</span><span className="priority">{priority}/100 priority</span></div>
    <h3>{report.title}</h3><p>{report.description}</p>
    <div className="meta-row"><MapPin size={16}/>{report.location?.address || "Location saved"}</div>
    <div className="card-stats"><span><Users size={16}/>{report.confirmations} confirmed</span><span><CalendarDays size={16}/>{new Date(report.createdAt).toLocaleDateString()}</span></div>
    <Link className="card-link" to={`/reports/${report.id}`}>View details <ArrowUpRight size={16}/></Link>
  </article>;
}
