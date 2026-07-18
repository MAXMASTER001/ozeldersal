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

  // Mark messages from the active conversation partner as read
  if (params.userId) {
    await prisma.message.updateMany({
      where: { senderId: params.userId, receiverId: currentUserId, isRead: false },
      data: { isRead: true },
    });
  }

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
  type ConvMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
  };
  type Conv = {
    user: { id: string; name: string };
    messages: ConvMessage[];
    unreadCount: number;
  };
  const conversationsMap = new Map<string, Conv>();

  // If URL has ?userId=..., make sure that user is in the conversations list (even if no messages yet)
  const initialUserId = params.userId;
  if (initialUserId && initialUserId !== currentUserId) {
    const userToChat = await prisma.user.findUnique({ where: { id: initialUserId }, select: { id: true, name: true } });
    if (userToChat) {
      conversationsMap.set(userToChat.id, {
        user: userToChat,
        messages: [],
        unreadCount: 0,
      });
    }
  }

  allMessages.forEach(msg => {
    const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;

    if (!conversationsMap.has(partner.id)) {
      conversationsMap.set(partner.id, {
        user: partner,
        messages: [],
        unreadCount: 0,
      });
    }

    const conv = conversationsMap.get(partner.id)!;
    conv.messages.push({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    });

    if (msg.receiverId === currentUserId && !msg.isRead) {
      conv.unreadCount += 1;
    }
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
