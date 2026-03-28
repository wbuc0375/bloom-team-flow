import { useState, useRef, useEffect } from "react";
import { useBloom } from "@/contexts/BloomContext";
import { Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const Chat = () => {
  const { chatMessages, addChatMessage, currentUser, members } = useBloom();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    addChatMessage(message.trim());
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Chat</h1>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isSystem ? "justify-center" : msg.sender === currentUser ? "justify-end" : "justify-start"}`}
            >
              {msg.isSystem ? (
                <div className="bg-secondary px-4 py-2 rounded-full text-xs text-muted-foreground max-w-md text-center">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-sm ${msg.sender === currentUser ? "order-last" : ""}`}>
                  <p className="text-xs text-muted-foreground mb-1 px-1">
                    {msg.sender === currentUser ? "You" : msg.sender}
                  </p>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === currentUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
