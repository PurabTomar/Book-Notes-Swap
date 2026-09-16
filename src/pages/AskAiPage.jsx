import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import ListingCard from "../components/ListingCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  BRANCHES,
  SEMESTERS,
  RESOURCE_TYPES,
  ALL_SUBJECTS,
  SEMESTER_SUBJECTS,
  SUBJECT_GROUPS,
} from "../data/constants.js";

const QUICK_PROMPTS = [
  { label: "Find Physics notes", text: "Find physics notes for my semester" },
  { label: "Previous year papers", text: "Find previous year paper for my subject" },
  { label: "Lab manual", text: "Find lab manual for my subject" },
  { label: "Explain a topic", text: "explain a topic from my syllabus" },
  { label: "Important questions", text: "Important questions for my subject" },
];

const RESOURCE_KEYWORDS = {
  "Previous Year Paper": ["previous year", "pyq", "previous year paper", "question paper", "papers", "paper"],
  "PDF Notes": ["pdf notes", "pdf"],
  "Handwritten Notes": ["handwritten", "hand written", "handwriting notes", "handwriting"],
  "Lab Manual": ["lab manual", "lab"],
  "Question Bank": ["question bank", "bank"],
  Book: ["book", "textbook", "reference book"],
  Assignment: ["assignment", "assignments"],
  "Engineering Drawing": ["engineering drawing", "drawing"],
  "Coding Resource": ["coding resource", "coding", "programming"],
  "Cheat Sheet": ["cheat sheet", "cheatsheet", "formula sheet"],
  "Study Pack": ["study pack", "study materials", "materials"],
  "Project Material": ["project material", "project"],
};

function norm(s) {
  return (s || "").toLowerCase().trim();
}

function hasAny(text, words) {
  const t = norm(text);
  return words.some((w) => t.includes(w));
}

function detectResourceType(text) {
  const t = norm(text);
  for (const [label, words] of Object.entries(RESOURCE_KEYWORDS)) {
    if (hasAny(t, words)) return label;
  }
  const byItem = RESOURCE_TYPES.find((r) => hasAny(t, [norm(r.label)]));
  return byItem ? byItem.label : null;
}

function detectSubject(text) {
  const t = norm(text);
  const found = (ALL_SUBJECTS || []).find((s) => t.includes(norm(s)));
  if (found) return found;
  for (const sem of SEMESTERS) {
    const list = SEMESTER_SUBJECTS?.[sem] || [];
    const s = list.find((x) => t.includes(norm(x)));
    if (s) return s;
  }
  return null;
}

function detectSemester(text) {
  const m = norm(text).match(/sem(?:ester)?\s*(\d{1,2})|(\d{1,2})\s*(?:st|nd|rd|th)?\s*sem/);
  const num = Number(m ? m[1] || m[2] : NaN);
  return SEMESTERS.includes(num) ? num : null;
}

function detectBranch(text) {
  const t = norm(text);
  return (BRANCHES || []).find((b) => t.includes(norm(b))) || null;
}

function extractFreeText(text) {
  const t = norm(text);
  const stop = ["find", "find me", "show", "show me", "get", "get me", "need", "looking for", "for", "my", "the", "a", "an", "please", "explain", "explain me", "i want", "important", "questions"];
  let out = t;
  for (const w of stop) {
    out = out.replace(new RegExp(`\\b${w}\\b`, "g"), " ");
  }
  out = out.replace(/\s+/g, " ").trim();
  for (const s of [detectSubject(t), detectResourceType(t)]) {
    if (s) out = out.replace(norm(s), " ").trim();
    if (out) continue;
  }
  return out;
}

export default function AskAiPage() {
  const { profile } = useAuth();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);

  const parsed = useMemo(() => {
    if (!query.trim()) return { subject: null, resourceType: null, semester: null, branch: null, freeText: "" };
    return {
      subject: detectSubject(query),
      resourceType: detectResourceType(query),
      semester: detectSemester(query),
      branch: detectBranch(query),
      freeText: extractFreeText(query),
    };
  }, [query]);

  const effectiveSemester = parsed.semester || profile?.semester || null;
  const effectiveBranch = parsed.branch || profile?.branch || null;

  async function runAsk(text) {
    const t = (text || "").trim();
    if (!t || !isSupabaseConfigured) return;
    setQuery(t);
    setLoading(true);
    setDbError(false);
    setSearched(falseonge);
    setResults(null);
    try {
      const p = {
        subject: detectSubject(t),
        resourceType: detectResourceType(t),
        semester: detectSemester(t),
        branch: detectBranch(t),
        freeText: extractFreeText(t),
      };
      let q = supabase.from("listings").select("*").eq("status", "available");
      if (p.subject) q = q.eq("subject", p.subject);
      if (p.resourceType) q = q.eq("resource_type", p.resourceType);
      if (p.semester) q = q.eq("semester", p.semester);
      if (p.branch) q = q.eq("branch", p.branch);
      if (p.freeText) {
        const like = `%${p.freeText}%`;
        q = q.or(`title.ilike.${like},description.ilike.${like},subject.ilike.${like}`);
      }
      const { data, error } = await q.order("created_at", { ascending: false }).limit(40);
      if (error) throw error;
      setResults(data || []);
    } catch {
      setDbError(true);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const matched = results || [];

  return (
    <main className="page page--ask">
      <div className="ask-hero">
        <div className="ask-hero__badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.39 7.11L21.5 11.5l-7.11 2.39L12 21l-2.39-7.11L2.5 11.5l7.11-2.39z" />
          </svg>
          Ask AI
        </div>
        <h1 className="page__title">Ask about course resources</h1>
        <p className="page__subtitle">
          A grounded academic assistant for SATI students. It searches your real resource swap
          database and only surfaces listings that actually exist — it never makes resources up.
        </p>
      </div>

      <div className="ask-form">
        <div className="ask-form__bar">
          <textarea
            ref={inputRef}
            className="ask-form__input"
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                runAsk(query);
              }
            }}
            placeholder='Try "Find Physics notes for semester 4" or "previous year paper for Computer Networks"'
          />
          <button
            className="btn btn--primary ask-form__submit"
            onClick={() => runAsk(query)}
            disabled={loading || !query.trim()}
          >
            {loading ? "Finding…" : "Ask"}
          </button>
        </div>

        <div className="ask-quick">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              className="ask-quick__chip"
              onClick={() => runAsk(p.text)}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ask-state">
        {!isSupabaseConfigured ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            }
            title="Supabase not configured"
            subtitle="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then reload."
          />
        ) : loading ? (
          <div className="grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="listing-card">
                <div className="skeleton" style={{ height: 176, borderRadius: "18px 18px 0 0" }} />
                <div style={{ padding: "14px 16px" }}>
                  <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 6, marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 18, width: "80%", borderRadius: 6, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 6 }} />
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
            title="AI can’t reach the database"
            subtitle="The resource database isn’t connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then reload."
          />
        ) : searched && matched.length === 0 ? (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            }
            title="No real resources match that yet"
            subtitle="I won’t make anything up. Try a different subject, semester, or resource type — or be the first to share it in the swap."
            action={
              <Link to="/browse" className="btn btn--secondary">
                Browse all resources
              </Link>
            }
          />
        ) : searched ? (
          <div className="ask-results">
            <div className="ask-results__filters">
              {parsed.subject && <span className="ask-tag">Subject: {parsed.subject}</span>}
              {parsed.resourceType && <span className="ask-tag">Type: {parsed.resourceType}</span>}
              {(effectiveSemester || parsed.semester) && <span className="ask-tag">Semester {effectiveSemester}</span>}
              {(effectiveBranch || parsed.branch) && <span className="ask-tag">{effectiveBranch}</span>}
            </div>
            <div className="grid">
              {matched.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
