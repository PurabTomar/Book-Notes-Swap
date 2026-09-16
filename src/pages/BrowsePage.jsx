import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  BRANCHES,
  SEMESTERS,
  RESOURCE_TYPES,
  ALL_SUBJECTS,
  SUBJECT_GROUPS,
  SEMESTER_SUBJECTS,
} from "../data/constants.js";
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
  searchable = false,
  searchPlaceholder = "Search...",
  groups,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // All selectable options come from EITHER flat `options` OR `groups`.
  // Resolve them into one canonical list so the trigger label and the
  // highlighted item always agree, regardless of which prop the app passes.
  const flatFromGroups = groups
    ? Object.values(groups).flat().filter(Boolean)
    : [];

  const allOptions =
    flatFromGroups.length > 0 ? flatFromGroups : options || [];

  const displayLabel = value
    ? allOptions.find((o) => o.value === value)?.label || value
    : label;

  const filteredOptions = searchable
    ? allOptions.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : allOptions;

  const filteredGroups = groups
    ? Object.entries(groups).reduce((acc, [key, items]) => {
        const filtered = items.filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) acc[key] = filtered;
        return acc;
      }, {})
    : null;

  const handleSelect = (val) => {
    onChange(val === value ? "" : val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="filter-select" ref={ref}>
      <button
        className={`filter-select__trigger ${open ? "filter-select__trigger--open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{displayLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="filter-select__dropdown">
          {searchable && (
            <input
              type="text"
              className="filter-select__search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          )}
          <div className="filter-select__options">
            {value && (
              <button
                className="filter-select__option filter-select__option--clear"
                onClick={() => handleSelect("")}
              >
                Clear
              </button>
            )}
            {filteredGroups
              ? Object.entries(filteredGroups).map(([group, items]) => (
                  <div key={group} className="filter-select__group">
                    <div className="filter-select__group-label">{group}</div>
                    {items.map((o) => (
                      <button
                        key={o.value}
                        className={`filter-select__option ${value === o.value ? "filter-select__option--active" : ""}`}
                        onClick={() => handleSelect(o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                ))
              : filteredOptions.map((o) => (
                  <button
                    key={o.value}
                    className={`filter-select__option ${value === o.value ? "filter-select__option--active" : ""}`}
                    onClick={() => handleSelect(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [branch, setBranch] = useState(searchParams.get("branch") || "");
  const [semester, setSemester] = useState(searchParams.get("semester") || "");
  const [resourceType, setResourceType] = useState(searchParams.get("resource_type") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set("q", debouncedSearch.trim());
    if (branch) next.set("branch", branch);
    if (semester) next.set("semester", semester);
    if (resourceType) next.set("resource_type", resourceType);
    if (subject) next.set("subject", subject);
    const query = next.toString();
    if (searchParams.toString() !== query) {
      setSearchParams(query, { replace: true });
    }
  }, [debouncedSearch, branch, semester, resourceType, subject]);

  const PAGE_SIZE = 12;

  const sortLabels = {
    newest: "Newest first",
    oldest: "Oldest first",
    semester_asc: "Semester (low → high)",
    semester_desc: "Semester (high → low)",
  };

  const sortOrders = {
    newest: { column: "created_at", ascending: false },
    oldest: { column: "created_at", ascending: true },
    semester_asc: { column: "semester", ascending: true },
    semester_desc: { column: "semester", ascending: false },
  };

  const activeFilters = [
    branch && { key: "branch", label: branch, clear: () => setBranch("") },
    semester && { key: "semester", label: `Sem ${semester}`, clear: () => setSemester("") },
    resourceType && {
      key: "resourceType",
      label: RESOURCE_TYPES.find((r) => r.value === resourceType)?.label || resourceType,
      clear: () => setResourceType(""),
    },
    subject && { key: "subject", label: subject, clear: () => setSubject("") },
  ].filter(Boolean);

  const clearAll = () => {
    setBranch("");
    setSemester("");
    setResourceType("");
    setSubject("");
    setSearch("");
  };

  const subjectOptions = semester
    ? (SEMESTER_SUBJECTS[semester] || []).map((s) => ({ value: s, label: s }))
    : null;

  useEffect(() => {
    if (semester && subject) {
      const valid = subjectOptions || [];
      if (!valid.some((s) => s.value === subject)) {
        setSubject("");
      }
    }
  }, [semester]);

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
        .order(sortOrders[sortBy].column, { ascending: sortOrders[sortBy].ascending })
        .limit(visibleCount);
      if (debouncedSearch.trim()) {
        const p = `%${debouncedSearch.trim()}%`;
        query = query.or(
          `title.ilike.${p},subject.ilike.${p},description.ilike.${p}`
        );
      }
      if (branch) query = query.eq("branch", branch);
      if (semester) query = query.eq("semester", Number(semester));
      if (resourceType) query = query.eq("resource_type", resourceType);
      if (subject) query = query.eq("subject", subject);
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
  }, [debouncedSearch, branch, semester, resourceType, subject, refreshKey, sortBy, visibleCount]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, branch, semester, resourceType, subject, sortBy]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("listings-browse")
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

  const filtersContent = (
    <>
      <FilterSelect
        label="Branch"
        value={branch}
        options={BRANCHES.filter((b) => b !== "All Branches").map((b) => ({ value: b, label: b }))}
        onChange={setBranch}
        searchable
        searchPlaceholder="Search branches..."
      />
      <FilterSelect
        label="Semester"
        value={semester}
        options={SEMESTERS.map((s) => ({ value: String(s), label: `Sem ${s}` }))}
        onChange={setSemester}
      />
      <FilterSelect
        label="Resource Type"
        value={resourceType}
        options={RESOURCE_TYPES.map((r) => ({ value: r.value, label: r.label }))}
        onChange={setResourceType}
      />
      <FilterSelect
        label="Subject"
        value={subject}
        options={
          subjectOptions ||
          ALL_SUBJECTS.map((s) => ({ value: s, label: s }))
        }
        groups={
          !semester
            ? SUBJECT_GROUPS.reduce((acc, group) => {
                acc[group.label] = group.subjects.map((s) => ({ value: s, label: s }));
                return acc;
              }, {})
            : null
        }
        onChange={setSubject}
        searchable
        searchPlaceholder="Search subjects..."
      />
    </>
  );

  return (
    <main className="page">
      <div className="browse-header">
        <h1 className="page__title">Browse Resources</h1>
        <p className="page__subtitle">
          Find free books, notes, papers and study material from SATI students.
        </p>
      </div>

      <div className="search-bar" style={{ marginTop: 16 }}>
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
          placeholder="Search by title, subject..."
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

      <button
        className="mobile-filter-btn"
        onClick={() => setMobileFiltersOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="4" y1="21" y2="14" />
          <line x1="4" x2="4" y1="10" y2="3" />
          <line x1="12" x2="12" y1="21" y2="12" />
          <line x1="12" x2="12" y1="8" y2="3" />
          <line x1="20" x2="20" y1="21" y2="16" />
          <line x1="20" x2="20" y1="12" y2="3" />
          <line x1="2" x2="6" y1="14" y2="14" />
          <line x1="10" x2="14" y1="8" y2="8" />
          <line x1="18" x2="22" y1="16" y2="16" />
        </svg>
        Filters
        {activeFilters.length > 0 && (
          <span className="mobile-filter-btn__count">{activeFilters.length}</span>
        )}
      </button>

      <div className="filters-bar desktop-only">{filtersContent}</div>

      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((f) => (
            <span key={f.key} className="active-filter-chip">
              {f.label}
              <button
                className="active-filter-chip__remove"
                onClick={f.clear}
                aria-label={`Remove ${f.label}`}
              >
                &times;
              </button>
            </span>
          ))}
          <button className="active-filters__clear" onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}

      {mobileFiltersOpen && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet__handle" />
            <div className="bottom-sheet__header">
              <h3>Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                &times;
              </button>
            </div>
            <div className="bottom-sheet__body">
              {filtersContent}
              <button className="btn btn--primary" style={{ marginTop: 16, width: "100%" }} onClick={() => setMobileFiltersOpen(false)}>
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

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
          subtitle={activeFilters.length > 0 ? "Try adjusting your filters." : "Be the first to share a resource."}
          action={
            activeFilters.length > 0 ? (
              <button className="btn btn--secondary" onClick={clearAll}>
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="results-bar">
            <p className="results-count">
              {listings.length} resource{listings.length !== 1 && "s"} found
            </p>
            <div className="filter-select filter-select--small">
              <button
                className={`filter-select__trigger ${sortOpen ? "filter-select__trigger--open" : ""}`}
                onClick={() => setSortOpen(!sortOpen)}
              >
                <span>{sortLabels[sortBy]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {sortOpen && (
                <div className="filter-select__dropdown">
                  <div className="filter-select__options">
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <button
                        key={key}
                        className={`filter-select__option ${sortBy === key ? "filter-select__option--active" : ""}`}
                        onClick={() => {
                          setSortBy(key);
                          setSortOpen(false);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {listings.length > 0 && (
            <div className="results-bar results-bar--center">
              <button
                className="btn btn--ghost"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}