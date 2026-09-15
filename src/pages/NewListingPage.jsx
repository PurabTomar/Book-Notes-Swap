import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { newId } from "../lib/format.js";
import {
  BRANCHES,
  SEMESTERS,
  RESOURCE_TYPES,
  ALL_SUBJECTS,
  subjectImage,
  FALLBACK_IMAGE,
} from "../data/constants.js";

export default function NewListingPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [branch, setBranch] = useState("");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5 MB.");
      return;
    }
    setPhoto(file);
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required.");
    if (!subject.trim()) return setError("Subject is required.");
    if (!semester) return setError("Semester is required.");
    if (!resourceType) return setError("Resource type is required.");
    if (!branch) return setError("Branch is required.");

    if (!isSupabaseConfigured) {
      setError("Supabase is not connected. Please check your .env file.");
      return;
    }

    setSubmitting(true);

    let imageUrl = subjectImage(subject) || FALLBACK_IMAGE;

    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `listings/${newId()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("listing-images")
        .upload(path, photo, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);
        if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
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
      photo_url: imageUrl,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_whatsapp: contactWhatsApp.trim() || null,
      status: "available",
    };

    const { error: insertErr } = await supabase.from("listings").insert(listing);

    setSubmitting(false);

    if (insertErr) {
      setError(insertErr.message || "Failed to create listing.");
      return;
    }

    navigate("/browse");
  };

  return (
    <main className="page">
      <div className="form-page">
        <h1 className="page__title">Share a Resource</h1>
        <p className="page__subtitle" style={{ marginBottom: 32 }}>
          Share free academic resources with fellow SATI students.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Engineering Mathematics Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Engineering Mathematics I"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              list="subjects-list"
              required
            />
            <datalist id="subjects-list">
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label">Semester *</label>
            <div className="radio-pills">
              {SEMESTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`radio-pill ${semester === String(s) ? "radio-pill--active" : ""}`}
                  onClick={() => setSemester(String(s))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resource Type *</label>
            <div className="radio-pills">
              {RESOURCE_TYPES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`radio-pill ${resourceType === r.value ? "radio-pill--active" : ""}`}
                  onClick={() => setResourceType(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Branch *</label>
            <div className="radio-pills">
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`radio-pill ${branch === b ? "radio-pill--active" : ""}`}
                  onClick={() => setBranch(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Condition</label>
            <div className="radio-pills">
              {["New", "Good", "Fair"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`radio-pill ${condition === c ? "radio-pill--active" : ""}`}
                  onClick={() => setCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the resource, its condition, or anything helpful..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Photo</label>
            {photoPreview ? (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
                <button
                  type="button"
                  className="photo-preview__remove"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <label className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>Tap to add a photo</span>
              </label>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 8 }}>
              Contact Info
            </label>
            <div className="contact-inputs">
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="contact-field">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="WhatsApp"
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={submitting}
          >
            {submitting ? "Sharing..." : "Share Resource"}
          </button>
        </form>
      </div>
    </main>
  );
}