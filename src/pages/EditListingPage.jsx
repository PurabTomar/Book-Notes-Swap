import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  BRANCHES,
  SEMESTERS,
  RESOURCE_TYPES,
  ALL_SUBJECTS,
} from "../data/constants.js";
import EmptyState from "../components/EmptyState.jsx";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [denied, setDenied] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [branch, setBranch] = useState("");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false);
      if (!user && !isSupabaseConfigured) {
        return;
      }
      if (!user) navigate("/auth", { state: { from: `/listing/${id}/edit` } });
      return;
    }
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (data.owner_id !== user.id) {
        setDenied(true);
        setLoading(false);
        return;
      }
      setTitle(data.title || "");
      setSubject(data.subject || "");
      setSemester(data.semester != null ? String(data.semester) : "");
      setResourceType(data.resource_type || "");
      setBranch(data.branch || "");
      setCondition(data.condition || "Good");
      setDescription(data.description || "");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setContactWhatsApp(data.contact_whatsapp || "");
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title is required.");
    if (!subject.trim()) return setError("Subject is required.");
    if (!semester) return setError("Semester is required.");
    if (!resourceType) return setError("Resource type is required.");
    if (!branch) return setError("Branch is required.");

    setSubmitting(true);
    const { error: updateErr } = await supabase
      .from("listings")
      .update({
        title: title.trim(),
        subject: subject.trim(),
        semester: Number(semester),
        resource_type: resourceType,
        branch,
        condition,
        description: description.trim(),
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        contact_whatsapp: contactWhatsApp.trim() || null,
      })
      .eq("id", id);
    setSubmitting(false);
    if (updateErr) {
      setError(updateErr.message || "Failed to update listing.");
      return;
    }
    navigate(`/listing/${id}`);
  }

  if (loading) {
    return <main className="page"><div className="skeleton" style={{ height: 200, borderRadius: 16 }} /></main>;
  }

  if (notFound) {
    return (
      <main className="page">
        <EmptyState title="Listing not found" subtitle="This listing doesn't exist." action={<Link to="/my-listings" className="btn btn--primary">Go to My Listings</Link>} />
      </main>
    );
  }

  if (denied) {
    return (
      <main className="page">
        <EmptyState title="Not your listing" subtitle="Only the owner can edit this listing." action={<Link to="/browse" className="btn btn--primary">Browse</Link>} />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="form-page">
        <Link to={`/listing/${id}`} className="back-link">&larr; Back to listing</Link>
        <h1 className="page__title" style={{ marginTop: 12 }}>Edit listing</h1>
        <p className="page__subtitle" style={{ marginBottom: 32 }}>
          Update the details below. Photos can't be changed here yet.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-input" placeholder="e.g. Engineering Mathematics Notes" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input type="text" className="form-input" placeholder="e.g. Engineering Mathematics I" value={subject} onChange={(e) => setSubject(e.target.value)} list="edit-subjects-list" required />
            <datalist id="edit-subjects-list">
              {ALL_SUBJECTS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Semester *</label>
            <div className="radio-pills">
              {SEMESTERS.map((s) => (
                <button key={s} type="button" className={`radio-pill ${semester === String(s) ? "radio-pill--active" : ""}`} onClick={() => setSemester(String(s))}>{s}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resource Type *</label>
            <div className="radio-pills">
              {RESOURCE_TYPES.map((r) => (
                <button key={r.value} type="button" className={`radio-pill ${resourceType === r.value ? "radio-pill--active" : ""}`} onClick={() => setResourceType(r.value)}>{r.label}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Branch *</label>
            <div className="radio-pills">
              {BRANCHES.map((b) => (
                <button key={b} type="button" className={`radio-pill ${branch === b ? "radio-pill--active" : ""}`} onClick={() => setBranch(b)}>{b}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Condition</label>
            <div className="radio-pills">
              {["New", "Good", "Fair"].map((c) => (
                <button key={c} type="button" className={`radio-pill ${condition === c ? "radio-pill--active" : ""}`} onClick={() => setCondition(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe the resource..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Info</label>
            <div className="contact-inputs">
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <input type="email" className="form-input" placeholder="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <input type="tel" className="form-input" placeholder="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" /></svg>
                <input type="tel" className="form-input" placeholder="WhatsApp" value={contactWhatsApp} onChange={(e) => setContactWhatsApp(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to={`/listing/${id}`} className="btn btn--ghost">Cancel</Link>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}