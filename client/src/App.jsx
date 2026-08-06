import { useEffect, useState } from "react";
import { uploadPreview, uploadSave, fetchRecent, fetchById } from "./api";
import "./index.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const onSelectFile = (e) => {
    setError("");
    setSaved(null);
    setPreview(null);
    setSelectedReport(null);
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const doPreview = async () => {
    try {
      setError("");
      if (!file) return setError("Please choose an XML file first.");
      const data = await uploadPreview(file);
      setPreview(data);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const doSave = async () => {
    try {
      setError("");
      if (!file) return setError("Please choose an XML file first.");
      setSaving(true);
      const data = await uploadSave(file);
      setSaved(data);
      // refresh recent list after a save
      await loadRecent();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const loadRecent = async () => {
    try {
      setLoadingRecent(true);
      const data = await fetchRecent(5);
      setRecent(data.reports || []);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoadingRecent(false);
    }
  };

  const openReport = async (id) => {
    try {
      setLoadingReport(true);
      const data = await fetchById(id);
      setSelectedReport(data.report || null);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    // auto-load recent on first visit
    loadRecent();
  }, []);

  return (
    <div className="wrap">
      <h1>Creditsea — XML Report Uploader</h1>

      <section className="card">
        <h2>1) Upload XML</h2>
        <input type="file" accept=".xml" onChange={onSelectFile} />
        <div className="row">
          <button onClick={doPreview} disabled={!file}>Preview</button>
          <button onClick={doSave} disabled={!file || saving}>
            {saving ? "Saving..." : "Save to DB"}
          </button>
        </div>
        {error && <p className="error">⚠ {error}</p>}
      </section>

      {preview && (
        <section className="card">
          <h2>2) Preview</h2>
          <div className="grid2">
            <div>
              <h3>Basic</h3>
              <ul>
                <li><b>Name:</b> {preview.sample?.name || "—"}</li>
                <li><b>Phone:</b> {preview.sample?.phone || "—"}</li>
                <li><b>PAN:</b> {preview.sample?.pan || "—"}</li>
                <li><b>Bureau Score:</b> {preview.sample?.bureauScore ?? "—"}</li>
              </ul>
            </div>
            <div>
              <h3>Summary</h3>
              <ul>
                <li><b>Total Accounts:</b> {preview.sample?.totals?.totalAccounts ?? "—"}</li>
                <li><b>Active:</b> {preview.sample?.totals?.activeAccounts ?? "—"}</li>
                <li><b>Closed:</b> {preview.sample?.totals?.closedAccounts ?? "—"}</li>
                <li><b>Secured Amount:</b> {preview.sample?.totals?.securedAmount ?? "—"}</li>
                <li><b>Unsecured Amount:</b> {preview.sample?.totals?.unsecuredAmount ?? "—"}</li>
                <li><b>Enquiries (7d):</b> {preview.sample?.totals?.enquiriesLast7Days ?? "—"}</li>
              </ul>
              <p><b>Accounts parsed:</b> {preview.counts?.accounts ?? 0}</p>
            </div>
          </div>
          <details>
            <summary>Raw preview JSON</summary>
            <pre>{JSON.stringify(preview, null, 2)}</pre>
          </details>
        </section>
      )}

      {saved && (
        <section className="card ok">
          <h2>Saved ✅</h2>
          <p>
            <b>Report ID:</b> {saved.reportId}
            {" "}
            <button className="link" onClick={() => openReport(saved.reportId)}>
              View now
            </button>
          </p>
        </section>
      )}

      <section className="card">
        <h2>Recent Reports</h2>
        <button onClick={loadRecent} disabled={loadingRecent}>
          {loadingRecent ? "Loading..." : "Reload"}
        </button>
        <ul className="list">
          {recent.map((r) => (
            <li key={r._id}>
              <div>
                <div><b>{r.basic?.name || "Unknown"}</b> — {r.basic?.pan || "—"}</div>
                <div className="muted">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => openReport(r._id)}>View</button>
              </div>
            </li>
          ))}
          {recent.length === 0 && <li className="muted">No reports yet.</li>}
        </ul>
      </section>

      {selectedReport && (
        <section className="card">
          <h2>Report Details</h2>
          <div className="grid2">
            <div>
              <h3>Basic</h3>
              <ul>
                <li><b>Name:</b> {selectedReport.basic?.name || "—"}</li>
                <li><b>Phone:</b> {selectedReport.basic?.phone || "—"}</li>
                <li><b>PAN:</b> {selectedReport.basic?.pan || "—"}</li>
                <li><b>Score:</b> {selectedReport.basic?.bureauScore ?? "—"}</li>
              </ul>
            </div>
            <div>
              <h3>Summary</h3>
              <ul>
                <li><b>Total:</b> {selectedReport.summary?.totalAccounts ?? "—"}</li>
                <li><b>Active:</b> {selectedReport.summary?.activeAccounts ?? "—"}</li>
                <li><b>Closed:</b> {selectedReport.summary?.closedAccounts ?? "—"}</li>
                <li><b>Secured:</b> {selectedReport.summary?.securedAmount ?? "—"}</li>
                <li><b>Unsecured:</b> {selectedReport.summary?.unsecuredAmount ?? "—"}</li>
              </ul>
            </div>
          </div>
          <h3>Accounts ({selectedReport.accounts?.length || 0})</h3>
          <div className="table">
            <div className="t-head">
              <span>Lender</span><span>Type</span><span>Status</span><span>Opened</span><span>Closed</span><span>Limit</span><span>Balance</span><span>Overdue</span><span>EMI</span>
            </div>
            {(selectedReport.accounts || []).map((a, i) => (
              <div className="t-row" key={i}>
                <span>{a.lender || "—"}</span>
                <span>{a.type || "—"}</span>
                <span>{a.status || "—"}</span>
                <span>{a.openedOn || "—"}</span>
                <span>{a.closedOn || "—"}</span>
                <span>{a.creditLimit ?? "—"}</span>
                <span>{a.currentBalance ?? "—"}</span>
                <span>{a.overdue ?? "—"}</span>
                <span>{a.emi ?? "—"}</span>
              </div>
            ))}
          </div>
          <details>
            <summary>Full JSON</summary>
            <pre>{JSON.stringify(selectedReport, null, 2)}</pre>
          </details>
        </section>
      )}
    </div>
  );
}
