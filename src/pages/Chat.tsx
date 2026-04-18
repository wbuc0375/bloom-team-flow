import { useState, useRef, useEffect, useCallback } from "react";
import { useBloom } from "@/contexts/BloomContext";
import { useAuth } from "@/contexts/AuthContext";
import { Send, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  generateGroupKey,
  exportKeyB64,
  importKeyB64,
  encryptMessage,
  decryptMessage,
} from "@/lib/crypto";
import { toast } from "@/hooks/use-toast";

interface DecryptedMsg {
  id: string;
  sender_id: string | null;
  text: string; // decrypted plaintext or placeholder
  is_system: boolean;
  created_at: string;
  failed?: boolean;
}

const Chat = () => {
  const { members } = useBloom();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupKey, setGroupKey] = useState<CryptoKey | null>(null);
  const [messages, setMessages] = useState<DecryptedMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve user's group + load/generate the AES-GCM key
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // Find any group the user is a member of
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .limit(1);

      let gid = memberships?.[0]?.group_id ?? null;

      // If no group, auto-create a personal one for the prototype
      if (!gid) {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const { data: newGroup, error } = await supabase
          .from("groups")
          .insert({ owner_id: user.id, project_name: "My Project", group_code: code })
          .select("id")
          .single();
        if (error || !newGroup) {
          toast({ title: "Could not create group", description: error?.message, variant: "destructive" });
          return;
        }
        gid = newGroup.id;
        await supabase.from("group_members").insert({ group_id: gid, user_id: user.id });
      }

      // Fetch encryption key; generate if missing
      const { data: groupRow } = await supabase
        .from("groups")
        .select("encryption_key")
        .eq("id", gid)
        .single();

      let key: CryptoKey;
      if (groupRow?.encryption_key) {
        key = await importKeyB64(groupRow.encryption_key);
      } else {
        key = await generateGroupKey();
        const exported = await exportKeyB64(key);
        await supabase.from("groups").update({ encryption_key: exported }).eq("id", gid);
      }

      if (cancelled) return;
      setGroupId(gid);
      setGroupKey(key);
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Load + decrypt messages once we have a key
  const loadMessages = useCallback(async (gid: string, key: CryptoKey) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, sender_id, text, iv, is_system, created_at")
      .eq("group_id", gid)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Failed to load messages", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const decrypted: DecryptedMsg[] = await Promise.all(
      (data ?? []).map(async (m) => {
        if (m.is_system || !m.iv) {
          return { id: m.id, sender_id: m.sender_id, text: m.text, is_system: m.is_system, created_at: m.created_at };
        }
        try {
          const pt = await decryptMessage(key, m.text, m.iv);
          return { id: m.id, sender_id: m.sender_id, text: pt, is_system: false, created_at: m.created_at };
        } catch {
          return {
            id: m.id,
            sender_id: m.sender_id,
            text: "Message could not be decrypted",
            is_system: false,
            created_at: m.created_at,
            failed: true,
          };
        }
      })
    );
    setMessages(decrypted);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (groupId && groupKey) loadMessages(groupId, groupKey);
  }, [groupId, groupKey, loadMessages]);

  // Realtime subscription — decrypt incoming messages on the client
  useEffect(() => {
    if (!groupId || !groupKey) return;
    const channel = supabase
      .channel(`chat:${groupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const m = payload.new as { id: string; sender_id: string | null; text: string; iv: string | null; is_system: boolean; created_at: string };
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return prev;
          });
          let text = m.text;
          let failed = false;
          if (!m.is_system && m.iv) {
            try {
              text = await decryptMessage(groupKey, m.text, m.iv);
            } catch {
              text = "Message could not be decrypted";
              failed = true;
            }
          }
          setMessages((prev) =>
            prev.some((x) => x.id === m.id)
              ? prev
              : [...prev, { id: m.id, sender_id: m.sender_id, text, is_system: m.is_system, created_at: m.created_at, failed }]
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, groupKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !groupId || !groupKey || !user) return;
    const plaintext = message.trim();
    setMessage("");
    try {
      const { ciphertext, iv } = await encryptMessage(groupKey, plaintext);
      // Optimistic insert
      const tempId = `tmp-${Date.now()}`;
      setMessages((prev) => [...prev, {
        id: tempId, sender_id: user.id, text: plaintext, is_system: false, created_at: new Date().toISOString(),
      }]);
      const { error } = await supabase.from("chat_messages").insert({
        group_id: groupId,
        sender_id: user.id,
        text: ciphertext,
        iv,
        is_system: false,
      });
      if (error) {
        toast({ title: "Send failed", description: error.message, variant: "destructive" });
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      toast({ title: "Encryption failed", description: String(err), variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            Chat
            <span title="End-to-end encrypted (AES-GCM 256)" className="inline-flex items-center text-primary">
              <Lock className="w-4 h-4" />
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {members.length} members · End-to-end encrypted
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {loading && (
          <p className="text-center text-xs text-muted-foreground">Loading encrypted messages…</p>
        )}
        <AnimatePresence>
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.is_system ? "justify-center" : isMine ? "justify-end" : "justify-start"}`}
              >
                {msg.is_system ? (
                  <div className="bg-secondary px-4 py-2 rounded-full text-xs text-muted-foreground max-w-md text-center">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-sm ${isMine ? "order-last" : ""}`}>
                    <p className="text-xs text-muted-foreground mb-1 px-1">
                      {isMine ? "You" : "Member"}
                    </p>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.failed
                          ? "bg-muted text-muted-foreground italic border border-dashed border-border"
                          : isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={groupKey ? "Type a message (encrypted)..." : "Setting up encryption..."}
            disabled={!groupKey}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="shrink-0" disabled={!groupKey}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
