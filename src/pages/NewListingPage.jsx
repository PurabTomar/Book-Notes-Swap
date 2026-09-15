import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { newId } from "../lib/format.js";
import {
  BRANCHES,
  SEMESTERS,
  RESOURCE_TYPES,
  ALL_SUBJECTS,
  subjectImage,
} from "../data/constants.js";

const STEPS = ["Details", "Photos", "Contact"];

async function compressImage(file, maxDim = 1400, quality = 0.8) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function dataUrlToFile(dataUrl, filename) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/jpeg" });
}

export default function NewListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const honeypot = useRef("");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [branch, setBranch] = useState("");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");

  const [photos, setPhotos] = useState([]); // [{preview, name, file}]
  const [photoBusy, setPhotoBusy] = useState(false);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  if (!user) {
    return (
      <main className="page">
        <div className="form-page">
          <h1 className="page__title">Share a resource</h1>
          <p className="page__subtitle" style={{ margin: "12px 0 24px" }}>
            You need an account so others can message you about your resource.
          </p>
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn--primary" onClick={() => navigate("/auth", { state: { from: "/new" } })}>
              Sign in / Sign up
            </button>
          </div>
          <p className="form-hint" style={{ marginTop: 12 }}>
            Already signed in? Refresh the page.
          </p>
        </div>
      </main>
    );
  }

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!title.trim()) return setError("A title is required.");
      if (!subject.trim()) return setError("Pick the subject.");
      if (!semester) return setError("Select the semester.");
      if (!resourceType) return setError("Choose the resource type.");
      if (!branch || branch === "All Branches") return setError("Select your branch.");
      return true;
    }
    if (step === 2) {
      const hasEmail = contactEmail.trim().length > 0;
      const hasPhone = contactPhone.trim().length > 0;
      const hasWhatsApp = contactWhatsApp.trim().length > 0;
      if (!hasEmail && !hasPhone && !hasWhatsApp) {
        return setError("Add at least one way for students to reach you.");
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (validateStep() === true) setStep((s) => s + 1);
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  async function handleFiles(e) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    if (!files.length) return;
    setPhotoBusy(true);
    const compressed = [];
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) continue;
      const preview = await compressImage(f);
      if (preview) compressed.push({ name: f.name, preview, file: f });
    }
    setPhotos((prev) => [...prev, ...compressed].slice(0, 6));
    setPhotoBusy(false);
    e.target.value = "";
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (honeypot.current.value) return; // bots fill hidden fields
    if (validateStep() !== true) return;
    if (!isSupabaseConfigured) {
      setError("Supabase is not connected. Check your .env file.");
      return;
    }
    setSubmitting(true);

    const uploaded = [];
    for (const p of photos) {
      const path = `listings/${newId()}.jpg`;
      const file = await dataUrlToFile(p.preview, p.name.replace(/\.[^.]+$/, "") + ".jpg");
      const { error: uploadErr } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { upsert: true, contentType: "image/jpeg" });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        if (urlData?.publicUrl) uploaded.push(urlData.publicUrl);
      }
    }

    const listing = {
      title: title.trim(),
      subject: subject.trim(),
      semester: Number(semester),
      resource_type: resourceType,
      branch,
      condition,
      description: description.trim(),
      photo_url: uploaded[0] || subjectImage(subject),
      photo_urls: uploaded,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_whatsapp: contactWhatsApp.trim() || null,
      status: "available",
      owner_id: user.id,
    };

    const { data, error: insertErr } = await supabase.from("listings").insert(listing).select().single();
    setSubmitting(false);
    if (insertErr) {
      setError(insertErr.message || "Failed to create listing.");
      return;
    }
    setCreated(data);
    window.scrollTo(0, 0);
  }

  if (created) {
    return (
      <main className="page">
        <div className="form-page">
          <div className="form-success form-success--hero">
            <div className="form-success__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="page__title" style={{ margin: "16px 0 8px" }}>Your resource is live!</h1>
            <p className="page__subtitle">
              "{created.title}" is now visible to every SATI student on Browse.
            </p>
            <div className="form-actions" style={{ justifyContent: "center", marginTop: 24 }}>
              <button className="btn btn--primary" onClick={() => navigate(`/listing/${created.id}`)}>
                View your listing
              </button>
              <button className="btn btn--ghost" onClick={() => navigate("/browse")}>
                Browse
              </button>
              <button className="btn btn--ghost" onClick={() => navigate("/chat")}>
                Check messages
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="form-page" style={{ maxWidth: 640 }}>
        <div className="browse-header">
          <h1 className="page__title">Share a Resource</h1>
          <p className="page__subtitle">It's free, it's easy, and it helps someone study.</p>
        </div>

        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={label} className={`stepper__item ${i <= step ? "stepper__item--done" : ""}`}>
              <span className="stepper__dot">{i < step ? "✓" : i + 1}</span>
              <span className="stepper__label">{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <input
            type="text"
            ref={honeypot}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
          />

          {step === 0 && (
            <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-input" placeholder="e.g. Engineering Mathematics Notes" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input type="text" className="form-input" placeholder="e.g. Engineering Mathematics I" value={subject} onChange={(e) => setSubject(e.target.value)} list="new-subjects-list" />
                <datalist id="new-subjects-list">
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
                <div className="radio-pills radio-pills--wrap">
                  {RESOURCE_TYPES.filter((r) => r.value).map((r) => (
                    <button key={r.value} type="button" className={`radio-pill ${resourceType === r.value ? "radio-pill--active" : ""}`} onClick={() => setResourceType(r.value)}>{r.icon} {r.label}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch *</label>
                <div className="radio-pills">
                  {BRANCHES.filter((b) => b !== "All Branches").map((b) => (
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
                <textarea className="form-textarea" rows={4} placeholder="What's inside, who it's for, its condition..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--primary btn--full" onClick={next}>Continue</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Photos ({photos.length}/6)</label>
                <div className="photo-grid">
                  {photos.map((p, i) => (
                    <div className="photo-preview photo-preview--grid" key={p.name + i}>
                      <img src={p.preview} alt={`Upload ${i + 1}`} />
                      <button type="button" className="photo-preview__remove" onClick={() => removePhoto(i)} aria-label="Remove photo">&times;</button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <label className="photo-upload photo-upload--tile">
                      <input type="file" accept="image/*" multiple onChange={handleFiles} hidden disabled={photoBusy} />
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                      <span>{photoBusy ? "Compressing..." : "Add photo"}</span>
                    </label>
                  )}
                </div>
                <p className="form-hint">Photos are compressed automatically. The first photo becomes your cover.</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={back}>Back</button>
                <button type="button" className="btn btn--primary" onClick={next}>Continue</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 8 }}>How can students reach you? *</label>
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
                <p className="form-hint">Pick at least one. Chat opens automatically when a student messages you.</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={back}>Back</button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? "Sharing..." : "Share Resource"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}