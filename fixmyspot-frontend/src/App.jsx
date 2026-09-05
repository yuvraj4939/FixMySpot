import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ReportProblem from "./pages/ReportProblem";
import LiveMap from "./pages/LiveMap";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import ProblemDetails from "./pages/ProblemDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageReports from "./pages/admin/ManageReports";
import ManageUsers from "./pages/admin/ManageUsers";

export default function App(){
  return <Routes>
    <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/verify-otp" element={<VerifyOtp/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/register" element={<Register/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}>
      <Route path="/home" element={<Home/>}/><Route path="/report" element={<ReportProblem/>}/><Route path="/map" element={<LiveMap/>}/><Route path="/my-reports" element={<MyReports/>}/><Route path="/profile" element={<Profile/>}/><Route path="/reports/:id" element={<ProblemDetails/>}/>
    </Route></Route>
    <Route element={<ProtectedRoute adminOnly/>}><Route element={<AppLayout/>}>
      <Route path="/admin/dashboard" element={<AdminDashboard/>}/><Route path="/admin/reports" element={<ManageReports/>}/><Route path="/admin/users" element={<ManageUsers/>}/>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
