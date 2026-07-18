"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Settings, MessageSquare, ChevronDown, Bell } from "lucide-react";
import { signOut } from "next-auth/react";

type MenuUser = { name?: string | null; email?: string | null; role?: string };

export function UserMenu({ user }: { user: MenuUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
      >
        <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold uppercase">
          {user.name?.charAt(0) || "U"}
        </div>
        <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
        <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{user.email}</p>
            <div className="mt-2 text-xs font-medium px-2 py-1 bg-neutral-100 dark:bg-neutral-800 inline-block rounded-md text-neutral-600 dark:text-neutral-300">
              {user.role === "TEACHER" ? "Öğretmen" : "Öğrenci"}
            </div>
          </div>
          <div className="p-2">
            {user.role === "TEACHER" && (
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Settings size={16} className="text-neutral-500" /> Dashboard
              </Link>
            )}
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <MessageSquare size={16} className="text-neutral-500" /> Mesajlar
            </Link>
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Bell size={16} className="text-neutral-500" /> Bildirimler
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Settings size={16} className="text-neutral-500" /> Hesap Ayarları
            </Link>
            
            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1 mx-2" />
            
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
