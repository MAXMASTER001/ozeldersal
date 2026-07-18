"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMessage, reportUser, markConversationRead } from "@/actions/messages";
import { toast } from "sonner";
import { Send, ArrowLeft, MessageSquare, Check, CheckCheck, Flag } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
};

type Conversation = {
  user: { id: string; name: string };
  messages: Message[];
  unreadCount: number;
};

export default function ChatClient({
  currentUserId,
  conversations,
  initialUserId
}: {
  currentUserId: string;
  conversations: Conversation[];
  initialUserId?: string;
}) {
  const router = useRouter();
  const [activeUserId, setActiveUserId] = useState<string | null>(initialUserId || null);
  const [msg, setMsg] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeUserId, conversations]);

  // Polling for new messages
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [router]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (activeUserId) {
      markConversationRead(activeUserId);
    }
  }, [activeUserId]);

  const activeConversation = conversations.find(c => c.user.id === activeUserId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !activeUserId) return;

    setIsSending(true);
    const res = await sendMessage(activeUserId, msg);
    if (res.error) {
      toast.error(res.error);
    } else {
      setMsg("");
    }
    setIsSending(false);
  };

  const handleReport = async () => {
    if (!activeUserId) return;
    const reason = window.prompt("Rapor sebebini kısaca açıklayın (örn: spam, taciz, uygunsuz içerik):");
    if (!reason || !reason.trim()) return;
    const res = await reportUser(activeUserId, reason.trim());
    if (res.error) toast.error(res.error);
    else toast.success("Raporunuz alındı. İnceleme ekibimiz değerlendirecek.");
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto md:p-4 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full md:w-80 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
          <MessageSquare size={20} />
          <h1 className="text-xl font-bold">Mesajlar</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm flex flex-col items-center gap-2">
              <MessageSquare size={32} className="text-neutral-300" />
              Henüz bir mesajınız yok.
            </div>
          ) : (
            conversations.map(conv => {
              const lastMessage = conv.messages[conv.messages.length - 1];
              return (
                <div
                  key={conv.user.id}
                  onClick={() => setActiveUserId(conv.user.id)}
                  className={`p-4 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 flex gap-3 ${activeUserId === conv.user.id ? 'bg-neutral-50 dark:bg-neutral-900' : ''}`}
                >
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-500 flex-shrink-0 uppercase">
                    {conv.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm truncate pr-2">{conv.user.name}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-neutral-500'}`}>
                      {lastMessage?.content || "Yeni sohbet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col h-full ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
        {activeUserId && activeConversation ? (
          <>
            <header className="p-4 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <button
                className="md:hidden w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                onClick={() => setActiveUserId(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-500 uppercase">
                {activeConversation.user.name.charAt(0)}
              </div>
              <h2 className="font-semibold flex-1">{activeConversation.user.name}</h2>
              <button
                onClick={handleReport}
                title="Kullanıcıyı raporla"
                className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
              >
                <Flag size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {activeConversation.messages.map(message => {
                const isMe = message.senderId === currentUserId;
                return (
                  <div key={message.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                    {!isMe && (
                      <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-500 flex-shrink-0 text-sm uppercase">
                        {activeConversation.user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[80%]">
                      <div className={`${isMe ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-tl-none'} p-3 rounded-2xl shadow-sm`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {isMe && (
                        <div className="flex justify-end mt-1 text-neutral-400">
                          {message.isRead ? (
                            <span className="flex items-center gap-1 text-xs"><CheckCheck size={14} className="text-blue-500" /> Okundu</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs"><Check size={14} /> Gönderildi</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-neutral-400 mb-2">
                Güvenliğiniz için telefon numarası, e-posta ve bağlantı paylaşımı engellenir.
              </p>
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="rounded-full bg-neutral-50 dark:bg-neutral-900"
                  disabled={isSending}
                />
                <Button className="rounded-full px-6 flex items-center gap-2" disabled={isSending || !msg.trim()}>
                  <Send size={16} /> <span className="hidden sm:inline">Gönder</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-4">
            <MessageSquare size={48} className="text-neutral-200 dark:text-neutral-700" />
            <p>Sohbete başlamak için bir kişi seçin</p>
          </div>
        )}
      </main>
    </div>
  );
}
