import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function AppLayout() {
  return <div className="app-shell"><Sidebar/><main className="main-content"><Topbar/><div className="page-wrap"><Outlet/></div></main></div>;
}
