"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/ReviewForm";

type Review = { id: string; rating: number; comment: string | null };

export function ReviewEditDialog({ teacherProfileId, teacherUserId, review }: { teacherProfileId: string; teacherUserId: string; review: Review }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-orange-600 hover:text-orange-700 dark:text-orange-400" onClick={() => setOpen(true)}>
        <Pencil size={14} className="mr-1.5" /> Düzenle
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="review-edit-title">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 sm:p-8">
            <button type="button" aria-label="Düzenlemeyi kapat" onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50">
              <X size={20} />
            </button>
            <ReviewForm teacherProfileId={teacherProfileId} teacherUserId={teacherUserId} existingReview={review} embedded onSaved={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
