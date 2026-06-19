import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, RotateCcw, Copy, CheckCheck, BookOpen, ChevronRight, Download } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link, useSearch } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What does Islam say about the importance of intention (niyyah)?",
  "Explain the concept of Tawakkul (reliance on Allah)",
  "What are the virtues of Surah Al-Kahf and when should it be recited?",
  "What does the Quran say about patience (sabr) during hardship?",
  "What is the Islamic view on seeking knowledge?",
  "Explain the meaning and significance of Ayat al-Kursi",
  "What are the pillars of Islamic prayer (salah)?",
  "What does Islam teach about caring for parents?",
];

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const HISTORY_KEY = "ask-scholar-history";

export default function AskScholar() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Array<{ role: string; content: string; timestamp: string }>;
        return parsed.map((m) => ({ role: m.role as "user" | "assistant", content: m.content, timestamp: new Date(m.timestamp) }));
      }
    } catch { /* ignore */ }
    return [];
  });
  const searchStr = useSearch();
  const prefillQ = new URLSearchParams(searchStr).get("q") ?? "";

  const [input, setInput] = useState(prefillQ);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [prefillSent, setPrefillSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const copyMessage = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "", timestamp: new Date() };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (data.error) throw new Error(data.error);
            if (data.done) break;
            if (data.content) {
              fullContent += data.content;
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, content: fullContent };
                }
                return updated;
              });
            }
          } catch {
            // ignore parse errors on incomplete chunks
          }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unable to connect to the AI scholar.";
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `I apologize, but I encountered an error: ${errMsg}. Please try again.`,
          timestamp: new Date(),
        };
        return updated;
      });
      toast({ title: "Connection error", description: errMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30).map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp.toISOString() }))));
      } catch { /* ignore */ }
    }
  }, [messages]);

  // Auto-send prefill question from URL ?q= param
  useEffect(() => {
    if (prefillQ && !prefillSent && messages.length === 0) {
      setPrefillSent(true);
      void sendMessage(prefillQ);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillQ, prefillSent]);

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const exportChat = () => {
    if (messages.length === 0) return;
    const lines = messages.map((m) => {
      const role = m.role === "user" ? "You" : "Scholar AI";
      const time = m.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      return `[${time}] ${role}:\n${m.content}\n`;
    });
    const text = `Al-Muhandis — Ask the Scholar\nExported on ${new Date().toLocaleDateString()}\n${"─".repeat(40)}\n\n${lines.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholar-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold mt-2 mb-1">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("# ")) {
        return <h3 key={i} className="text-base font-bold mt-3 mb-1">{line.slice(2)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h4 key={i} className="text-sm font-bold mt-2 mb-1">{line.slice(3)}</h4>;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return <li key={i} className="ml-4 list-disc text-sm">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\. /)) {
        return <li key={i} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\. /, "")}</li>;
      }
      if (line.trim() === "") {
        return <br key={i} />;
      }
      return <p key={i} className="text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Header */}
      <div className="border-b border-border bg-sidebar/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Ask the Scholar</h1>
            <p className="text-xs text-muted-foreground">AI-powered Islamic knowledge assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={exportChat} className="gap-1.5 text-muted-foreground" title="Export chat as text file">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={clearConversation} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            </>
          )}
          <Link href="/quran">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Quran
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4 pb-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Islamic Scholar AI</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-8 leading-relaxed">
              Ask anything about the Quran, Hadith, Islamic jurisprudence, history, and spiritual practices.
              Powered by advanced AI trained on classical Islamic scholarship.
            </p>

            <div className="w-full max-w-2xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Suggested Questions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => void sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      <span className="text-sm text-foreground leading-snug">{q}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={cn(
                    "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 relative group",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="max-w-none">
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <div className="flex gap-1 items-center py-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {msg.role === "assistant" && msg.content && (
                      <button
                        onClick={() => void copyMessage(msg.content, index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-accent"
                      >
                        {copiedId === index
                          ? <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                          : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        }
                      </button>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">م</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background px-4 md:px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Quran, Hadith, Islamic jurisprudence..."
                className="min-h-[52px] max-h-[160px] resize-none pr-4 text-sm leading-relaxed rounded-xl border-border bg-card focus-visible:ring-primary/50"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <Button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-[52px] px-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-0 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI responses are for educational purposes. Consult a qualified scholar for personal religious guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
