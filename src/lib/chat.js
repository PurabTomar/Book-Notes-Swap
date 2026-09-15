import { supabase } from "./supabase.js";

export async function getOrCreateConversation({ listingId, otherUserId }) {
  const { data: user } = await supabase.auth.getUser();
  const me = user?.user;
  if (!me) return { error: "auth-required" };

  if (otherUserId === me.id) return { error: "own-listing" };

  // Ensure a canonical ordering of participants for uniqueness checks.
  const a = me.id < otherUserId ? me.id : otherUserId;
  const b = me.id < otherUserId ? otherUserId : me.id;

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();

  if (existing) return { conversation: existing };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      user_a: a,
      user_b: b,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  return { conversation: created };
}

export function otherParticipant(conversation, userId) {
  if (!conversation) return null;
  return conversation.user_a === userId ? conversation.user_b : conversation.user_a;
}

export async function sendMessage(conversationId, content) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "auth-required" };

  const { error: msgErr } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.user.id,
    content,
  });
  if (msgErr) return { error: msgErr.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { ok: true };
}

export function participantDisplayName(user) {
  if (!user) return "Ex-member";
  return user.display_name || (user.email ? user.email.split("@")[0] : "Student");
}