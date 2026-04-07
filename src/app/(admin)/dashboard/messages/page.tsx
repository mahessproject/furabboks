import { getMessages } from "@/lib/actions/messages";
import { Mail, MailOpen } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">Pesan Masuk</h1>
        <p className="mt-1 text-sm text-violet-600">
          {messages.length} pesan
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unreadCount} belum dibaca
            </span>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-violet-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-violet-500">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => {
            const profileData = message.profiles;
            const senderName = Array.isArray(profileData)
              ? (profileData[0]?.full_name ?? "User")
              : ((profileData as { full_name: string } | null)?.full_name ?? "User");
            return (
              <div
                key={message.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  message.is_read
                    ? "border-violet-200 bg-white"
                    : "border-violet-300 bg-violet-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {message.is_read ? (
                        <MailOpen className="h-4 w-4 text-violet-400" />
                      ) : (
                        <Mail className="h-4 w-4 text-violet-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            message.is_read ? "text-violet-600" : "text-violet-900"
                          }`}
                        >
                          {senderName}
                        </span>
                        {!message.is_read && <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />}
                      </div>
                      <p
                        className={`mt-0.5 text-sm ${
                          message.is_read
                            ? "text-violet-500"
                            : "font-medium text-violet-800"
                        }`}
                      >
                        {message.subject}
                      </p>
                      <p className="mt-1 text-sm text-violet-500 line-clamp-2">{message.body}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-violet-400">
                    {formatDate(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
