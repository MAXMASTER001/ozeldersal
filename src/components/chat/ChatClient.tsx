"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/actions/messages";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
};

type Conversation = {
  user: { id: string; name: string };
  messages: Message[];
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
      router.refresh(); // Fetches the latest data from server seamlessly
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [router]);

  const activeConversation = conversations.find(c => c.user.id === activeUserId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !activeUserId) return;
    
    setIsSending(true);
    await sendMessage(activeUserId, msg);
    setMsg("");
    setIsSending(false);
    
    // Auto scroll happens via useEffect because router.refresh/server action updates props
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto md:p-4 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full md:w-80 bg-white border-r border-neutral-200 flex flex-col h-full ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-200 flex items-center gap-2">
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
                  className={`p-4 border-b border-neutral-100 cursor-pointer transition-colors hover:bg-neutral-50 flex gap-3 ${activeUserId === conv.user.id ? 'bg-neutral-50' : ''}`}
                >
                  <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 flex-shrink-0 uppercase">
                    {conv.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-sm truncate pr-2">{conv.user.name}</h3>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{lastMessage?.content || "Yeni sohbet"}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 bg-neutral-50/50 flex flex-col h-full ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
        {activeUserId && activeConversation ? (
          <>
            <header className="p-4 bg-white border-b border-neutral-200 flex items-center gap-3">
              <button 
                className="md:hidden w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 rounded-full"
                onClick={() => setActiveUserId(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 uppercase">
                {activeConversation.user.name.charAt(0)}
              </div>
              <h2 className="font-semibold">{activeConversation.user.name}</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {activeConversation.messages.map(message => {
                const isMe = message.senderId === currentUserId;
                return (
                  <div key={message.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''}`}>
                    {!isMe && (
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 flex-shrink-0 text-sm uppercase">
                        {activeConversation.user.name.charAt(0)}
                      </div>
                    )}
                    <div className={`${isMe ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-neutral-200 rounded-tl-none'} p-3 rounded-2xl max-w-[80%] shadow-sm`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-neutral-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Mesajınızı yazın..." 
                  className="rounded-full bg-neutral-50" 
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
            <MessageSquare size={48} className="text-neutral-200" />
            <p>Sohbete başlamak için bir kişi seçin</p>
          </div>
        )}
      </main>
    </div>
  );
}
