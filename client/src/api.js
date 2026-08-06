// client/src/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function uploadPreview(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadSave(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/api/upload/save`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchRecent(limit = 5) {
  const res = await fetch(`${BASE}/api/reports?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchById(id) {
  const res = await fetch(`${BASE}/api/reports/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLatestByPan(pan) {
  const res = await fetch(`${BASE}/api/reports?pan=${encodeURIComponent(pan)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
