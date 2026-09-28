import { Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return <header className="topbar">
    <div className="topbar-spacer"/>
    <button className="icon-button"><Bell size={19}/></button>
    <div className="user-chip"><div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div><div><strong>{user?.name}</strong><span>{user?.role === "admin" ? "Administrator" : "Community Member"}</span></div></div>
    <button className="icon-button" onClick={logout}><LogOut size={19}/></button>
  </header>;
}
