import { MessageSquare } from "lucide-react";
import ContactForm from "./_components/contact-form";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Hubungi Admin</h1>
        <p className="mt-1 text-sm text-violet-600">
          Punya pertanyaan atau masukan? Kirim pesan ke tim kami.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-violet-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-violet-800">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Kirim Pesan</span>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
