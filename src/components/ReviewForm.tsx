"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addReview } from "@/actions/review";
import { toast } from "sonner";

export function ReviewForm({ teacherProfileId }: { teacherProfileId: string }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Lütfen bir puan verin.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await addReview(teacherProfileId, rating, comment);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Yorumunuz başarıyla eklendi!");
      setComment("");
      setRating(5);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mt-8">
      <h3 className="text-xl font-bold mb-4">Değerlendirme Bırakın</h3>
      
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
      </Button>
    </form>
  );
}
