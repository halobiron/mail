"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import {
  GOALS,
  type CampaignInput,
  type CampaignResult,
  type Email,
  type SendTime,
  type Tone,
} from "@/lib/schema";
import CampaignForm from "./CampaignForm";
import Inbox from "./Inbox";
import ReadingPane, { type RewriteOptions } from "./ReadingPane";
import SendTimePanel from "./SendTimePanel";

const EMPTY_INPUT: CampaignInput = {
  goal: "promotion",
  brand: "",
  industry: "",
  offer: "",
  brandColor: "#101b3d",
};

type View = "form" | "inbox" | "read";
type Snapshot = { email: Email; tone: Tone | "" };

export default function Studio() {
  const [form, setForm] = useState<CampaignInput>(EMPTY_INPUT);
  // Bản chụp của form tại thời điểm tạo, để xem trước không đổi khi người dùng sửa form.
  const [generated, setGenerated] = useState<CampaignInput | null>(null);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [tones, setTones] = useState<(Tone | "")[]>(["", "", ""]);
  const [history, setHistory] = useState<Snapshot[][]>([[], [], []]);
  const [active, setActive] = useState(0);
  const [view, setView] = useState<View>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendTimeError, setSendTimeError] = useState<string | null>(null);

  function reset(input: CampaignInput, next: CampaignResult) {
    setGenerated(input);
    setResult(next);
    setTones(["", "", ""]);
    setHistory([[], [], []]);
    setActive(0);
    setError(null);
    setSendTimeError(null);
    setView("inbox");
  }

  async function generate() {
    const input = form;
    setLoading(true);
    setError(null);
    setSendTimeError(null);
    setView("inbox");
    const sendTimeReq = postJson<SendTime>("/api/send-time", { brand: input.brand, industry: input.industry, offer: input.offer, goal: input.goal });
    try {
      const { emails } = await postJson<{ emails: Email[] }>("/api/generate", input);
      reset(input, { emails, sendTime: null });
      sendTimeReq
        .then((sendTime) => setResult((r) => (r ? { ...r, sendTime } : r)))
        .catch((e: Error) => setSendTimeError(e.message));
    } catch (e) {
      sendTimeReq.catch(() => {});
      setError(e instanceof Error ? e.message : "Không tạo được email");
    } finally {
      setLoading(false);
    }
  }

  function pushHistory(index: number, snapshot: Snapshot) {
    setHistory((h) => h.map((stack, i) => (i === index ? [...stack, snapshot] : stack)));
  }

  async function rewrite(index: number, options: RewriteOptions) {
    if (!result || !generated) return;
    const current = result.emails[index];
    const next = await postJson<Email>("/api/rewrite", { input: generated, email: current, ...options });
    pushHistory(index, { email: current, tone: tones[index] });
    if (options.tone) setTones((t) => t.map((x, i) => (i === index ? options.tone! : x)));
    setResult((r) => (r ? { ...r, emails: r.emails.map((e, i) => (i === index ? next : e)) } : r));
  }

  /** Sửa tay hoặc sửa một đoạn bằng AI. `commit` ghi mốc hoàn tác trước khi áp dụng thay đổi. */
  function editEmail(index: number, next: Email, commit: boolean) {
    if (!result) return;
    if (commit) pushHistory(index, { email: result.emails[index], tone: tones[index] });
    setResult((r) => (r ? { ...r, emails: r.emails.map((e, i) => (i === index ? next : e)) } : r));
  }

  function undo(index: number) {
    const prev = history[index].at(-1);
    if (!prev) return;
    setHistory((h) => h.map((s, i) => (i === index ? s.slice(0, -1) : s)));
    setTones((t) => t.map((x, i) => (i === index ? prev.tone : x)));
    setResult((r) => (r ? { ...r, emails: r.emails.map((e, i) => (i === index ? prev.email : e)) } : r));
  }

  const tabs: { id: View; label: string }[] = [
    { id: "form", label: "Chiến dịch" },
    { id: "inbox", label: "Hộp thư" },
    { id: "read", label: "Email" },
  ];
  const pane = (id: View) => (view === id ? "flex" : "hidden") + " lg:flex";

  return (
    <div className="grid h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[48px_1fr_auto] lg:grid-rows-[48px_1fr]">
      <header className="relative flex items-center gap-3 bg-shell px-4 text-white">
        <h1 className="min-w-0 truncate font-channel text-base font-bold tracking-wide sm:text-xl"><span className="sm:hidden">EMAIL STUDIO</span>
          <span className="hidden sm:inline">EMAIL CAMPAIGN STUDIO</span>
        </h1>
        {generated && (
          <p className="hidden truncate text-sm text-white/80 md:block">
            {generated.brand} · {GOALS[generated.goal]}
          </p>
        )}
      </header>

      <div className="grid min-h-0 lg:grid-cols-[300px_380px_1fr]">
        <aside className={`${pane("form")} min-h-0 flex-col border-r border-rule bg-paper`}>
          <h2 className="flex h-12 items-center border-b border-rule bg-sheet px-5 font-channel text-base font-bold tracking-wide">Chiến dịch</h2>
          <CampaignForm value={form} onChange={setForm} onSubmit={generate} loading={loading} />
        </aside>

        <section className={`${pane("inbox")} scroll min-h-0 flex-col overflow-y-auto border-r border-rule bg-sheet`}>
          {error && (
            <p role="alert" className="border-b border-danger/40 bg-[#fdecee] p-4 text-sm text-danger">
              {error}{" "}
              <button type="button" onClick={generate} disabled={loading} className="font-semibold underline disabled:opacity-50">
                Thử lại
              </button>
            </p>
          )}
          <Inbox
            input={generated}
            emails={result?.emails ?? null}
            active={active}
            loading={loading}
            onSelect={(i) => {
              setActive(i);
              setView("read");
            }}
          />
          {result && generated ? (
            <SendTimePanel sendTime={result.sendTime} error={sendTimeError} />
          ) : (
            <p className="p-4 text-sm text-ink-soft">Giờ gửi gợi ý sẽ hiện ở đây sau khi tạo email.</p>
          )}
        </section>

        <main className={`${pane("read")} min-h-0 min-w-0 flex-col`}>
          {result && generated ? (
            <ReadingPane
              key={active}
              input={generated}
              email={result.emails[active]}
              index={active}
              tone={tones[active]}
              canUndo={history[active].length > 0}
              onRewrite={(options) => rewrite(active, options)}
              onEdit={(next, commit) => editEmail(active, next, commit)}
              onUndo={() => undo(active)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-ink-soft">
              <p className="max-w-xs">Chọn một thư trong hộp thư để đọc, copy hoặc viết lại theo tông khác.</p>
            </div>
          )}
        </main>
      </div>

      <nav aria-label="Chuyển khu vực" className="grid grid-cols-3 border-t border-rule-strong bg-paper lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            aria-current={view === t.id}
            onClick={() => setView(t.id)}
            className={`h-12 text-sm font-semibold ${view === t.id ? "bg-shell text-white" : "text-ink hover:bg-onair-soft"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
