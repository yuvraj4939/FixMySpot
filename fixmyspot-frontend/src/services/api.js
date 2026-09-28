const configuredBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const API_BASE_URL = configuredBase.replace(/\/+$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function assetUrl(path = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("fixmyspot_token");

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Unable to connect to the FixMySpot server. Please check the backend URL and your internet connection.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Some server/proxy errors return an empty or non-JSON response.
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  verifyResetOtp: (email, otp) => request("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp })
  }),
  resetPassword: (email, otp, newPassword) => request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword })
  }),
  reports: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, v);
    });
    return request(`/reports${qs.toString() ? `?${qs}` : ""}`);
  },
  getReport: (id) => request(`/reports/${id}`),
  createReport: (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return request("/reports", { method: "POST", body: formData });
  },
  confirmReport: (id) => request(`/reports/${id}/confirm`, { method: "POST" }),
  updateStatus: (id, status) => request(`/reports/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  }),
  stats: () => request("/reports/stats"),
  users: () => request("/users")
};
