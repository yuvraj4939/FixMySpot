import { NavLink } from "react-router-dom";
import { Home, PlusCircle, Map, FileText, User, LayoutDashboard, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const userLinks = [["/home","Home",Home],["/report","Report Problem",PlusCircle],["/map","Live Map",Map],["/my-reports","My Reports",FileText],["/profile","Profile",User]];
const adminLinks = [["/admin/dashboard","Admin Dashboard",LayoutDashboard],["/admin/reports","Manage Reports",ShieldCheck],["/admin/users","Manage Users",Users]];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : userLinks;
  return <aside className="sidebar">
    <NavLink className="brand" to={user?.role === "admin" ? "/admin/dashboard" : "/home"}><span className="brand-mark">F</span>FixMySpot</NavLink>
    <p className="sidebar-label">{user?.role === "admin" ? "ADMIN PANEL" : "MAIN MENU"}</p>
    <nav>{links.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive ? "active":""}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><strong>Make your city better 🌍</strong><span>Report issues that matter.</span></div></div>
  </aside>;
}
