"use client";

import Link from "next/link";
import { Bell, MessageSquare, Star, Eye } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

function iconFor(type: string) {
  switch (type) {
    case "NEW_MESSAGE":
      return <MessageSquare size={18} />;
    case "REVIEW":
      return <Star size={18} />;
    case "PROFILE_VIEW_SUMMARY":
      return <Eye size={18} />;
    default:
      return <Bell size={18} />;
  }
}

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-500 flex flex-col items-center gap-3">
        <Bell size={40} className="text-neutral-300 dark:text-neutral-700" />
        <p>Henüz bir bildiriminiz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => {
        const content = (
          <div
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
              n.isRead
                ? "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-600 dark:text-neutral-300">
              {iconFor(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{n.title}</p>
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {new Date(n.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </span>
              </div>
              {n.body && <p className="text-sm text-neutral-500 mt-0.5">{n.body}</p>}
            </div>
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-black dark:bg-white flex-shrink-0 mt-2" />}
          </div>
        );
        return n.link ? (
          <Link key={n.id} href={n.link} className="block hover:opacity-80 transition-opacity">
            {content}
          </Link>
        ) : (
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
