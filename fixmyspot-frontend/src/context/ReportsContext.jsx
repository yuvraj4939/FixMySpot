import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (params = {}) => {
    if (!user) {
      setReports([]);
      return [];
    }

    setLoading(true);
    try {
      const data = await api.reports(params);
      const nextReports = data.reports || [];
      setReports(nextReports);
      return nextReports;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh().catch((error) => console.error("Unable to load reports:", error));
  }, [refresh]);

  const addReport = async (payload) => {
    const data = await api.createReport(payload);
    await refresh();
    return data.report;
  };

  const confirmReport = async (id) => {
    const data = await api.confirmReport(id);
    setReports((prev) => prev.map((report) => report.id === id ? data.report : report));
    return data.report;
  };

  const updateStatus = async (id, status) => {
    const data = await api.updateStatus(id, status);
    setReports((prev) => prev.map((report) => report.id === id ? data.report : report));
    return data.report;
  };

  const value = useMemo(
    () => ({ reports, loading, refresh, addReport, confirmReport, updateStatus }),
    [reports, loading, refresh]
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export const useReports = () => useContext(ReportsContext);
