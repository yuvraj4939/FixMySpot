export default function StatCard({label,value,icon:Icon,hint}) {
  return <div className="stat-card"><div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong>{hint && <small>{hint}</small>}</div><div className="stat-icon"><Icon size={22}/></div></div>;
}
