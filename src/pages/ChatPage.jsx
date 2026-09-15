import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { timeAgo } from "../lib/format.js";
import { otherParticipant, participantDisplayName } from "../lib/chat.js";
import EmptyState from "../components/EmptyState.jsx";

export default function ChatPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [names, setNames] = useState({});
  const [listings, setListings] = useState({});
  const [messages, setMessages] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (cancelled || error) {
        if (!cancelled) setLoaded(true);
        return;
      }

      const otherIds = data.map((c) => otherParticipant(c, user.id)).filter(Boolean);
      const listingIds = data.map((c) => c.listing_id).filter(Boolean);

      const [profilesRes, listingsRes, msgsRes] = await Promise.all([
        otherIds.length
          ? supabase.from("profiles").select("id,display_name,email,is_sat_verified").in("id", otherIds)
          : { data: [] },
        listingIds.length
          ? supabase.from("listings").select("id,title,photo_url,status").in("id", listingIds)
          : { data: [] },
        data.length
          ? supabase
              .from("messages")
              .select("id,conversation_id,content,sender_id,created_at")
              .in("conversation_id", data.map((c) => c.id))
              .order("created_at", { ascending: true })
          : { data: [] },
      ]);

      if (cancelled) return;

      const nameMap = {};
      (profilesRes.data ?? []).forEach((p) => {
        nameMap[p.id] = participantDisplayName(p);
      });
      const listingMap = {};
      (listingsRes.data ?? []).forEach((l) => {
        listingMap[l.id] = l;
      });
      const msgMap = {};
      (msgsRes.data ?? []).forEach((m) => {
        if (!msgMap[m.conversation_id]) msgMap[m.conversation_id] = [];
        msgMap[m.conversation_id].push(m);
      });

      setConversations(data);
      setNames(nameMap);
      setListings(listingMap);
      setMessages(msgMap);
      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  // Live subscription: new messages bump the list
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    const channel = supabase
      .channel("chat-thread-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        setRefreshKey((k) => k + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
        setRefreshKey((k) => k + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  if (!user) {
    return (
      <main className="page">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
              <path d="M12 15a3 3 0 0 0 3-3M9 8h.01M15 8h.01" strokeLinecap="round" />
            </svg>
          }
          title="Sign in to see your chats"
          subtitle="Message a poster from any listing to start a conversation."
          action={
            <button className="btn btn--primary" onClick={() => navigate("/auth", { state: { from: "/chat" } })}>
              Sign in
            </button>
          }
        />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="browse-header">
        <h1 className="page__title">Chats</h1>
        <p className="page__subtitle">Your conversations with fellow SATI students.</p>
      </div>

      {!loaded ? (
        <div style={{ marginTop: 24 }} className="conversation-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: 84, borderRadius: 14, marginBottom: 12 }} />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
            </svg>
          }
          title="No conversations yet"
          subtitle="Message a poster from any listing to get started."
          action={
            <Link to="/browse" className="btn btn--primary">Browse resources</Link>
          }
        />
      ) : (
        <div className="conversation-list" style={{ marginTop: 20 }}>
          {conversations.map((c) => {
            const otherId = otherParticipant(c, user.id);
            const otherName = otherId ? names[otherId] || "SATI student" : "SATI student";
            const listing = listings[c.listing_id];
            const threadMsgs = messages[c.conversation_id] || [];
            const last = threadMsgs[threadMsgs.length - 1];
            const isUnread = last && last.sender_id !== user.id;
            return (
              <Link to={`/chat/${c.id}`} className={`conversation-item ${isUnread ? "conversation-item--unread" : ""}`} key={c.id}>
                <div className="conversation-item__avatar">
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div className="conversation-item__body">
                  <div className="conversation-item__top">
                    <strong>{otherName}</strong>
                    {last && <time>{timeAgo(last.created_at)}</time>}
                  </div>
                  <div className="conversation-item__mid">
                    {listing ? `Re: ${listing.title}` : "Listing"}
                  </div>
                  <div className="conversation-item__preview">
                    {last ? (
                      <>
                        {last.sender_id === user.id && "You: "}
                        {last.content}
                      </>
                    ) : (
                      "Say hello!"
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}