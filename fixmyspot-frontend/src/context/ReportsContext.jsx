import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async (params = {}) => {
    if (!user) { setReports([]); return []; }
    setLoading(true);
    try {
      const data = await api.reports(params);
      setReports(data.reports || []);
      return data.reports || [];
    } finally { setLoading(false); }
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, [user]);

  const addReport = async (payload) => {
    const data = await api.createReport(payload);
    await refresh();
    return data.report;
  };

  const confirmReport = async (id) => {
    const data = await api.confirmReport(id);
    setReports(prev => prev.map(r => r.id === id ? data.report : r));
    return data.report;
  };

  const updateStatus = async (id, status) => {
    const data = await api.updateStatus(id, status);
    setReports(prev => prev.map(r => r.id === id ? data.report : r));
    return data.report;
  };

  const value = useMemo(() => ({ reports, loading, refresh, addReport, confirmReport, updateStatus }), [reports, loading]);
  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}
export const useReports = () => useContext(ReportsContext);
