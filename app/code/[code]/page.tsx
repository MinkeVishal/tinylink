"use client"
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Link = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
};

export default function CodeStats() {
  const params = useParams();
  const code = params?.code as string;
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/links/${code}`);
        if (res.status === 404) {
          setError("Not found");
          setLink(null);
        } else if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b.error || "Failed");
        } else {
          const data = await res.json();
          if (!cancelled) setLink(data);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code]);

  async function handleDelete() {
    if (!confirm(`Delete link ${code}?`)) return;
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // redirect back to dashboard
      router.push("/");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Error deleting");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!link) return <div style={{ padding: 20 }}>Not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Stats for {link.code}</h1>
      <p>
        <strong>Target:</strong> <a href={link.url}>{link.url}</a>
      </p>
      <p>
        <strong>Clicks:</strong> {link.clicks}
      </p>
      <p>
        <strong>Last clicked:</strong> {link.lastClicked ? new Date(link.lastClicked).toLocaleString() : "—"}
      </p>
      <p>
        <strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}
      </p>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigator.clipboard?.writeText(`${location.origin}/${link.code}`) || alert(`${location.origin}/${link.code}`)} style={{ marginRight: 8 }}>
          Copy Short URL
        </button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
