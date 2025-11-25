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
    } catch (e: any) {
      if (!cancelled) setError(e.message || "Error");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();

  return () => {
    cancelled = true;  // ✔ cleanup without returning value
  };
}, [code]);
