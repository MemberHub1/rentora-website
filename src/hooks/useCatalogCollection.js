import { useCallback, useEffect, useState } from "react";
import { catalogRepository } from "../lib/catalogRepository";

export function useCatalogCollection(collection, { admin = false } = {}) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState(catalogRepository.isConfigured && !admin ? "loading" : "preview");
  const [error, setError] = useState("");

  const load = useCallback(async (showLoading = true) => {
    if (!catalogRepository.isConfigured && admin) {
      setStatus("error");
      setError("Configure Supabase before using admin data.");
      return;
    }
    if (showLoading) {
      setStatus(catalogRepository.isConfigured ? "loading" : "preview");
      setError("");
    }
    try {
      const result = await catalogRepository.getAll(collection, { admin });
      setData(result);
      setStatus(catalogRepository.isConfigured ? "ready" : "preview");
    } catch (loadError) {
      console.error(`Unable to load ${collection}.`, loadError);
      setError(loadError instanceof Error ? loadError.message : `Unable to load ${collection}.`);
      setStatus("error");
    }
  }, [admin, collection]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(false), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { data, setData, status, error, reload: () => load(true) };
}
