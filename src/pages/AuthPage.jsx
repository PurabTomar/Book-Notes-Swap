import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/my-listings";

  const [mode, setMode] = useState("signin"); // signin | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim()) return setError("Email is required.");

    if (mode === "magic") {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setInfo(`Sign-in link sent to ${email.trim()}. Check your inbox.`);
      return;
    }

    if (!password) return setError("Password is required.");

    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() || email.trim().split("@")[0] },
        },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) {
        navigate(from, { replace: true });
      } else {
        setInfo("Account created. Check your email to confirm, then sign in.");
        switchMode("signin");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (error) return setError(error.message);
      navigate(from, { replace: true });
    }
  };

  return (
    <main className="page page--form" style={{ maxWidth: 480 }}>
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="page__title">
            {mode === "signup" ? "Create an account" : mode === "magic" ? "Magic sign-in" : "Welcome back"}
          </h1>
          <p className="page__subtitle">
            {mode === "signup"
              ? "Join SATI students sharing free resources."
              : mode === "magic"
              ? "We'll email you a one-time sign-in link."
              : "Sign in to message posters and manage listings."}
          </p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {info && <div className="form-success">{info}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your handle, e.g. Priya"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@sati.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <p className="form-hint">
              Use your college email to get the "SATI Verified" badge later.
            </p>
          </div>

          {mode !== "magic" && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--full" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "signup"
              ? "Sign up"
              : mode === "magic"
              ? "Send magic link"
              : "Sign in"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "signin" && (
            <>
              <button type="button" className="link-btn" onClick={() => switchMode("signup")}>
                New here? Create an account
              </button>
              <span className="auth-or">or</span>
              <button type="button" className="link-btn" onClick={() => switchMode("magic")}>
                Sign in with a magic link
              </button>
            </>
          )}
          {mode !== "signin" && (
            <button type="button" className="link-btn" onClick={() => switchMode("signin")}>
              Already have an account? Sign in
            </button>
          )}
        </div>

        <p className="form-hint" style={{ textAlign: "center", marginTop: 12 }}>
          <Link to="/guidelines" className="link">Community guidelines</Link>
        </p>
      </div>
    </main>
  );
}