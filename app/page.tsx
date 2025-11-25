"use client"
import { useEffect, useState } from "react";

type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLinks(data);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Validate form inputs and create a new short link
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (include https://)");
      return;
    }
    const CODE_RE = /^[A-Za-z0-9]{6,8}$/;
    if (customCode && !CODE_RE.test(customCode)) {
      setError("Custom code must match [A-Za-z0-9]{6,8}");
      return;
    }

    setSubmitting(true);
    try {
      const payload: { url: string; customCode?: string } = { url };
      if (customCode) payload.customCode = customCode;
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        const body = await res.json();
        setError(body.error || "Code already exists");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Failed to create link");
        return;
      }
      const created = await res.json();
      setUrl("");
      setCustomCode("");
      setLinks((s) => [created, ...s]);
      // show success briefly
      setToast("Link created");
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setError((err as Error).message || "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link ${code}?`)) return;
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setLinks((s) => s.filter((l) => l.code !== code));
      setToast("Link deleted");
      setTimeout(() => setToast(null), 2000);
    } catch (e: any) {
      alert(e.message || "Error deleting");
    }
  }

  // Sort state: 'new' | 'clicks'
  const [sortBy, setSortBy] = useState<'new' | 'clicks'>('new');
  const [toast, setToast] = useState<string | null>(null);

  const filtered = links
    .filter((l) => l.code.toLowerCase().includes(query.toLowerCase()) || l.url.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'clicks') return b.clicks - a.clicks;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      <h1>Tinylink — Dashboard</h1>

      <div className="controls">
        <form onSubmit={handleAdd} className="form">
          <input className="flex" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <input placeholder="custom code (optional)" value={customCode} onChange={(e) => setCustomCode(e.target.value)} style={{ width: 180 }} />
          <button className="btn" type="submit" disabled={submitting || !url}>{submitting ? 'Adding…' : 'Add'}</button>
        </form>
        <div className="controls-meta">
          <div className="note">Codes: <span className="muted">{"[A-Za-z0-9]{6,8}"}</span></div>
          <div>
            <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="new">Sort: New</option>
              <option value="clicks">Sort: Clicks</option>
            </select>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input className="search-input" placeholder="Search by code or URL" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="search-action">
          <button className="btn" onClick={() => setQuery('')}>Clear</button>
        </div>
      </div>

      <section>
        {loading && <div className="empty">Loading…</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="empty">No links — create one above.</div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>URL</th>
                    <th style={{ textAlign: 'right' }}>Clicks</th>
                    <th>Last Clicked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.code}>
                      <td>
                        <a className="code-link" href={`/${l.code}`} target="_blank" rel="noreferrer">{l.code}</a>
                        <span className="link-pill">{(() => { try { return new URL(l.url).hostname } catch { return '' } })()}</span>
                      </td>
                      <td title={l.url} className="muted url-cell">{l.url}</td>
                      <td className="align-right">{l.clicks}</td>
                      <td>{l.lastClicked ? new Date(l.lastClicked).toLocaleString() : '—'}</td>
                      <td className="actions">
                        <button className="btn" aria-label={`Copy ${l.code}`} onClick={() => { navigator.clipboard?.writeText(`${location.origin}/${l.code}`); setToast('Copied'); setTimeout(() => setToast(null), 1200); }}>Copy</button>
                        <a className="stats-link" href={`/code/${l.code}`}>Stats</a>
                        <button className="btn" onClick={() => handleDelete(l.code)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
