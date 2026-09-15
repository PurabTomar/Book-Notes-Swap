import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { newId } from "../lib/format.js";
import { CONDITIONS, SEMESTERS, SUBJECTS } from "../data/constants.js";

export default function NewListingPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    condition: "Good",
    is_free: false,
    price: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.semester) errs.semester = "Semester is required";
    if (!form.is_free && (!form.price || Number(form.price) < 0))
      errs.price = "Enter a valid price or mark as Free";
    const hasContact =
      form.contact_email.trim() ||
      form.contact_phone.trim() ||
      form.contact_whatsapp.trim();
    if (!hasContact)
      errs.contact = "Enter at least one contact method";
    return errs;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGlobalError(null);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (!isSupabaseConfigured) {
      setGlobalError("Supabase is not configured. Add your .env keys and restart the dev server.");
      return;
    }

    setSaving(true);

    let photoUrl = null;

    if (photo) {
      const ext = photo.name.split(".").pop() || "jpg";
      const path = `listings/${newId()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("listing-images")
        .upload(path, photo, { upsert: false });
      if (uploadErr) {
        setGlobalError(`Photo upload failed: ${uploadErr.message}`);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);
      photoUrl = data?.publicUrl ?? null;
    }

    const row = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      semester: Number(form.semester),
      condition: form.condition,
      is_free: form.is_free,
      price: form.is_free ? null : Number(form.price),
      description: form.description.trim() || null,
      photo_url: photoUrl,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contact_whatsapp: form.contact_whatsapp.trim() || null,
      status: "available",
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(row)
      .select("id")
      .single();

    setSaving(false);

    if (error) {
      setGlobalError(error.message);
      return;
    }

    navigate(`/listing/${data.id}`, { replace: true });
  }

  const contactFieldError = errors.contact;

  return (
    <main className="page page--form">
      <h1 className="page__title">Post a Listing</h1>
      <p className="page__subtitle">
        Sell, trade, or give away textbooks, lab manuals, and notes
      </p>

      {globalError && <div className="alert alert--error">{globalError}</div>}

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form__group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            className={errors.title ? "input--error" : ""}
            placeholder="e.g. Engineering Physics – 3rd Edition"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form__group">
          <label htmlFor="subject">Subject *</label>
          <input
            id="subject"
            list="subjects-list"
            className={errors.subject ? "input--error" : ""}
            placeholder="Start typing to search..."
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
          />
          <datalist id="subjects-list">
            {SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {errors.subject && <span className="field-error">{errors.subject}</span>}
        </div>

        <div className="form__row">
          <div className="form__group">
            <label htmlFor="semester">Semester *</label>
            <select
              id="semester"
              value={form.semester}
              onChange={(e) => update("semester", e.target.value)}
              className={errors.semester ? "input--error" : ""}
            >
              <option value="">Select</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
            {errors.semester && <span className="field-error">{errors.semester}</span>}
          </div>

          <div className="form__group">
            <label>Condition *</label>
            <div className="radio-group">
              {CONDITIONS.map((c) => (
                <label key={c} className={`radio-pill ${form.condition === c ? "radio-pill--active" : ""}`}>
                  <input
                    type="radio"
                    name="condition"
                    value={c}
                    checked={form.condition === c}
                    onChange={(e) => update("condition", e.target.value)}
                    hidden
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form__row">
          <div className="form__group" style={{ flex: 2 }}>
            <label htmlFor="price">
              {form.is_free ? "Price" : "Price (₹) *"}
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              disabled={form.is_free}
              placeholder={form.is_free ? "Free" : "e.g. 250"}
              value={form.is_free ? "" : form.price}
              onChange={(e) => update("price", e.target.value)}
              className={errors.price ? "input--error" : ""}
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="form__group" style={{ flex: 1, justifyContent: "flex-end" }}>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={(e) => {
                  update("is_free", e.target.checked);
                  if (e.target.checked) setErrors((er) => ({ ...er, price: undefined }));
                }}
              />
              <span className="toggle-switch" />
              Free
            </label>
          </div>
        </div>

        <div className="form__group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows="3"
            placeholder="Edition, chapter coverage, any marks on the book, etc."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="form__group">
          <label>Photo</label>
          <div className="upload-area">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="upload-preview" />
            ) : (
              <label className="upload-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to upload a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoChange}
                  hidden
                />
              </label>
            )}
          </div>
          {photoPreview && (
            <button
              type="button"
              className="link-btn"
              onClick={() => { setPhoto(null); setPhotoPreview(null); }}
            >
              Remove photo
            </button>
          )}
        </div>

        <div className="form__divider" />

        <h2 className="form__section-title">Contact Information *</h2>
        <p className="form__section-sub">Enter at least one</p>
        {contactFieldError && <span className="field-error">{contactFieldError}</span>}

        <div className="form__group">
          <label htmlFor="contact_email">Email</label>
          <input
            id="contact_email"
            type="email"
            placeholder="you@college.edu"
            value={form.contact_email}
            onChange={(e) => update("contact_email", e.target.value)}
          />
        </div>

        <div className="form__group">
          <label htmlFor="contact_phone">Phone</label>
          <input
            id="contact_phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.contact_phone}
            onChange={(e) => update("contact_phone", e.target.value)}
          />
        </div>

        <div className="form__group">
          <label htmlFor="contact_whatsapp">WhatsApp Number</label>
          <input
            id="contact_whatsapp"
            type="tel"
            placeholder="919876543210 (with country code)"
            value={form.contact_whatsapp}
            onChange={(e) => update("contact_whatsapp", e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={saving}
        >
          {saving ? "Posting..." : "Post Listing"}
        </button>
      </form>
    </main>
  );
}