"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { sendMessage } from "@/lib/actions/messages";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
        <p className="font-medium text-green-800">Pesan berhasil dikirim!</p>
        <p className="text-sm text-green-700">Admin akan segera membalas pesanmu.</p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 text-sm underline underline-offset-4 text-green-700 hover:text-green-900"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="contact-subject" className="block text-sm font-medium text-violet-800">
          Subjek
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          className="w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Pertanyaan tentang pesanan"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-body" className="block text-sm font-medium text-violet-800">
          Pesan
        </label>
        <textarea
          id="contact-body"
          name="body"
          rows={5}
          required
          className="w-full rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm text-violet-900 placeholder:text-violet-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="Tuliskan pesanmu di sini..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isPending ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
