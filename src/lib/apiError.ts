/** Pull a human-readable message out of an axios/FastAPI error (handles `{detail}` and `{error, detail}` shapes). */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = error as {
    response?: { status?: number; data?: { detail?: unknown; error?: unknown; message?: unknown } };
    message?: string;
  } | null;
  const data = e?.response?.data;
  const detail = data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d: { msg?: string; loc?: unknown[] }) => {
        if (!d?.msg) return null;
        const loc = Array.isArray(d.loc) ? d.loc.filter((x) => x !== "body").join(".") : "";
        const msg = d.msg.replace(/^Value error, /, "");
        return loc ? `${loc}: ${msg}` : msg;
      })
      .filter(Boolean);
    if (msgs.length) return msgs.join("; ");
  }
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (e?.response?.status === 429) return "Too many requests. Please wait a moment and try again.";
  if (e?.message && !e.message.startsWith("Request failed")) return e.message;
  return fallback;
}
