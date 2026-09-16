import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { CATEGORIES } from "../data/constants.js";
import ListingCard from "../components/ListingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setDbError(false);
      if (!isSupabaseConfigured) {
        setDbError(true);
        setLoading(false);
        return;
      }
      let query = supabase
        .from("listings")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (debouncedSearch.trim()) {
        const p = `%${debouncedSearch.trim()}%`;
        query = query.or(
          `title.ilike.${p},subject.ilike.${p},description.ilike.${p}`
        );
      }
      if (category === "Notes" || category === "Handwritten Notes") {
        query = query.in("resource_type", ["Handwritten Notes", "PDF Notes"]);
      } else if (category) {
        query = query.eq("resource_type", category);
      }
      const { data, error } = await query;
      if (!cancelled) {
        if (error) setDbError(true);
        else setListings(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, refreshKey]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("listings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => setRefreshKey((k) => k + 1)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="page">
      <div className="home-hero">
        <h1 className="home-hero__title">
          Discover Free
          <br />
          Academic Resources
        </h1>
        <p className="home-hero__subtitle">
          Share, discover, and learn from your SATI peers.
        </p>
        <div className="search-bar">
          <svg
            className="search-bar__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            className="search-bar__input"
            placeholder="Search notes, books, papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-bar__clear"
              onClick={() => setSearch("")}
              aria-label="Clear"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="category-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`category-chip ${
              category === c.value ? "category-chip--active" : ""
            }`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="listing-card">
              <div
                className="skeleton"
                style={{ height: 176, borderRadius: "18px 18px 0 0" }}
              />
              <div style={{ padding: "14px 16px" }}>
                <div
                  className="skeleton"
                  style={{ height: 14, width: 80, borderRadius: 6, marginBottom: 10 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 18, width: "80%", borderRadius: 6, marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, width: "60%", borderRadius: 6 }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : dbError ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          }
          title="Supabase not connected"
          subtitle="Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then reload."
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="No resources found"
          subtitle={search ? "Try a different search or clear your filters." : "Be the first to share a resource."}
        />
      ) : (
        <>
          <p className="results-count">
            {listings.length} resource{listings.length !== 1 && "s"} shared
          </p>
          <div className="grid">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}