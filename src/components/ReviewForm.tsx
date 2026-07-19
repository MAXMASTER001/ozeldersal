"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addReview, updateReview } from "@/actions/review";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ExistingReview = { id: string; rating: number; comment: string | null };

export function ReviewForm({ teacherProfileId, teacherUserId, existingReview, embedded = false, onSaved }: { teacherProfileId: string; teacherUserId: string; existingReview?: ExistingReview; embedded?: boolean; onSaved?: () => void }) {
  const router = useRouter();
  const isEditing = Boolean(existingReview);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = async () => {
    if (isSubmitting) return;
    if (rating === 0) {
      toast.error("Lütfen bir puan verin.");
      return;
    }
    
    setIsSubmitting(true);
    const result = isEditing && existingReview
      ? await updateReview(existingReview.id, teacherProfileId, teacherUserId, rating, comment)
      : await addReview(teacherProfileId, teacherUserId, rating, comment);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "Yorumunuz güncellendi!" : "Yorumunuz başarıyla eklendi!");
      onSaved?.();
      router.refresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitReview();
  };

  return (
    <form onSubmit={handleSubmit} className={embedded ? "" : "bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mt-8"}>
      <h3 id={embedded ? "review-edit-title" : undefined} className="text-xl font-bold mb-4">{isEditing ? "Yorumunuzu Düzenleyin" : "Değerlendirme Bırakın"}</h3>
      
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium mr-2">Puan:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              size={24}
              className={`transition-colors ${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-neutral-300 dark:text-neutral-700"}`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-500 font-medium">({rating}/5)</span>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Yorumunuz (İsteğe bağlı)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Öğretmen hakkındaki düşüncelerinizi paylaşın..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
        />
      </div>

      <Button type="button" onClick={submitReview} disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Kaydediliyor..." : isEditing ? "Yorumu Güncelle" : "Yorumu Gönder"}
      </Button>
    </form>
  );
}
