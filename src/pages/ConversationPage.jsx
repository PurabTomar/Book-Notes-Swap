import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { timeAgo } from "../lib/format.js";
import { otherParticipant, participantDisplayName, sendMessage } from "../lib/chat.js";
import EmptyState from "../components/EmptyState.jsx";

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [other, setOther] = useState(null);
  const [listing, setListing] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false);
      if (!user) navigate("/auth", { state: { from: `/chat/${id}` } });
      return;
    }
    let cancelled = false;

    async function load() {
      const { data: conv, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !conv) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const otherId = otherParticipant(conv, user.id);

      const [profRes, listRes, msgRes] = await Promise.all([
        otherId
          ? supabase.from("profiles").select("id,display_name,email,is_sat_verified").eq("id", otherId).maybeSingle()
          : { data: null },
        conv.listing_id
          ? supabase.from("listings").select("*").eq("id", conv.listing_id).maybeSingle()
          : { data: null },
        supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;
      setConversation(conv);
      setOther(profRes.data || null);
      setListing(listRes.data || null);
      setMsgs(msgRes.data || []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // Live messages
  useEffect(() => {
    if (!id || !isSupabaseConfigured) return;
    const channel = supabase
      .channel(`conv-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          setMsgs((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs.length, conversation]);

  const otherName = other ? participantDisplayName(other) : "Student";
  const otherVerified = other?.is_sat_verified;

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSendError("");
    setSending(true);
    const { error } = await sendMessage(id, text);
    setSending(false);
    if (error) {
      setSendError(typeof error === "string" ? error : "Could not send the message.");
      return;
    }
    setDraft("");
  }

  if (loading) {
    return (
      <main className="page" style={{ maxWidth: 720 }}>
        <div className="skeleton" style={{ height: 56, borderRadius: 14, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          }
          title="Conversation not found"
          subtitle="This thread may have been deleted, or you aren't a participant."
          action={<Link to="/chat" className="btn btn--primary">Back to Chats</Link>}
        />
      </main>
    );
  }

  return (
    <main className="page page--chat" style={{ maxWidth: 720 }}>
      <Link to="/chat" className="back-link">&larr; All chats</Link>

      <div className="chat-header">
        <div className="chat-header__avatar">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header__info">
          <strong>
            {otherName}
            {otherVerified && <span className="verified-badge" title="SATI Verified student"> ✓</span>}
          </strong>
          <span className="chat-header__listing">
            {listing ? `Re: ${listing.title}` : "Conversation"}
          </span>
        </div>
        {listing && (
          <Link to={`/listing/${listing.id}`} className="btn btn--ghost btn--sm">
            View listing
          </Link>
        )}
      </div>

      <div className="thread" ref={listRef}>
        {msgs.length === 0 ? (
          <div className="thread__empty">
            <p>No messages yet — say hi and mention what you're interested in!</p>
          </div>
        ) : (
          msgs.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`bubble ${mine ? "bubble--mine" : ""}`}>
                <div className="bubble__text">{m.content}</div>
                <div className="bubble__meta">{timeAgo(m.created_at)}</div>
              </div>
            );
          })
        )}
      </div>

      {sendError && <div className="form-error">{sendError}</div>}

      <form className="composer" onSubmit={handleSend}>
        <input
          type="text"
          className="form-input"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
        />
        <button type="submit" className="btn btn--primary" disabled={sending || !draft.trim()}>
          {sending ? "..." : "Send"}
        </button>
      </form>
    </main>
  );
}