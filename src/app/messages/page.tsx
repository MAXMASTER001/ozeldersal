import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatClient from "@/components/chat/ChatClient";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const currentUserId = session.user.id;

  // Fetch all messages involving the current user
  const allMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  // Group messages by conversation partner
  const conversationsMap = new Map<string, any>();

  // If URL has ?userId=..., make sure that user is in the conversations list (even if no messages yet)
  const initialUserId = params.userId;
  if (initialUserId && initialUserId !== currentUserId) {
    const userToChat = await prisma.user.findUnique({ where: { id: initialUserId }, select: { id: true, name: true } });
    if (userToChat) {
      conversationsMap.set(userToChat.id, {
        user: userToChat,
        messages: []
      });
    }
  }

  allMessages.forEach(msg => {
    const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
    
    if (!conversationsMap.has(partner.id)) {
      conversationsMap.set(partner.id, {
        user: partner,
        messages: []
      });
    }
    
    conversationsMap.get(partner.id).messages.push({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      createdAt: msg.createdAt,
    });
  });

  const conversations = Array.from(conversationsMap.values()).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.createdAt?.getTime() || 0;
    const bLast = b.messages[b.messages.length - 1]?.createdAt?.getTime() || 0;
    return bLast - aLast; // Most recent first
  });

  return (
    <ChatClient 
      currentUserId={currentUserId} 
      conversations={conversations} 
      initialUserId={initialUserId}
    />
  );
}
