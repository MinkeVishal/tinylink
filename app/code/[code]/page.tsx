useEffect(() => {
  let cancelled = false;

<<<<<<< HEAD
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
    } catch (e: any) {
      if (!cancelled) setError(e.message || "Error");
    } finally {
      if (!cancelled) setLoading(false);
=======
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
    return () => (cancelled = true);
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
>>>>>>> ae99372 (fixed issue)
    }
  }

  load();

  return () => {
    cancelled = true;  // ✔ cleanup without returning value
  };
}, [code]);
