import { useState, useEffect, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { CONDITIONS, SEMESTERS, SUBJECTS } from "../data/constants.js";
import ListingCard from "../components/ListingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [condition, setCondition] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const [refreshKey, setRefreshKey] = useState(0);

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
        const pattern = `%${debouncedSearch.trim()}%`;
        query = query.or(`title.ilike.${pattern},subject.ilike.${pattern}`);
      }
      if (subject) query = query.eq("subject", subject);
      if (semester) query = query.eq("semester", Number(semester));
      if (condition) query = query.eq("condition", condition);
      if (priceFilter === "free") query = query.eq("is_free", true);
      if (priceFilter === "paid") query = query.eq("is_free", false).gt("price", 0);

      const { data, error } = await query;
      if (!cancelled) {
        if (error) setDbError(true);
        else setListings(data ?? []);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, subject, semester, condition, priceFilter, refreshKey]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("listings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => {
          setRefreshKey((k) => k + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeCount = [subject, semester, condition, priceFilter].filter(Boolean).length;

  return (
    <main className="page">
      <div className="home-header">
        <h1 className="page__title">Browse Listings</h1>
        <p className="page__subtitle">
          Find textbooks, lab manuals, and notes from seniors
        </p>
      </div>

      <div className="search-bar">
        <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className="search-bar__input"
          placeholder="Search by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-bar__clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      <div className="filters">
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>Sem {s}</option>
          ))}
        </select>

        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="">Any Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
          <option value="">All Prices</option>
          <option value="free">Free Only</option>
          <option value="paid">Paid Only</option>
        </select>

        {activeCount > 0 && (
          <button
            className="filters__clear"
            onClick={() => { setSubject(""); setSemester(""); setCondition(""); setPriceFilter(""); }}
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="listing-card listing-card--skeleton">
              <div className="skeleton" style={{ height: 160, borderRadius: "12px 12px 0 0" }} />
              <div className="skeleton" style={{ height: 20, width: "70%", margin: "12px" }} />
              <div className="skeleton" style={{ height: 14, width: "50%", margin: "0 12px 12px" }} />
            </div>
          ))}
        </div>
      ) : dbError ? (
        <EmptyState
          icon="!"
          title="Supabase not connected"
          subtitle="Create a .env file with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then reload."
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="No listings found"
          subtitle={search ? "Try a different search or clear your filters." : "Be the first to post a listing."}
        />
      ) : (
        <p className="results-count">{listings.length} listing{listings.length !== 1 && "s"}</p>
      )}

      <div className="grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </main>
  );
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}