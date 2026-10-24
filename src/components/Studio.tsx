"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import { saveDrafts, useDrafts } from "@/lib/drafts";
import {
  GOALS,
  migrateEmail,
  type CampaignInput,
  type CampaignResult,
  type Draft,
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
  ctaUrl: "",
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
  const drafts = useDrafts();
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice((n) => (n === text ? null : n)), 3500);
  }

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
    setNotice(null);
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

  function persist(next: Draft[]) {
    if (saveDrafts(next)) return true;
    flash("Không lưu được vào localStorage của trình duyệt.");
    return false;
  }

  function saveDraft() {
    if (!result || !generated) return;
    const draft: Draft = { id: crypto.randomUUID(), savedAt: new Date().toISOString(), input: generated, result };
    if (persist([draft, ...drafts])) flash("Đã lưu bản nháp");
  }

  function openDraft(d: Draft) {
    const input = { ...EMPTY_INPUT, ...d.input };
    setForm(input);
    reset(input, { ...d.result, emails: d.result.emails.map(migrateEmail) });
    setDraftsOpen(false);
    setNotice(null);
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
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {result && (
            <button onClick={saveDraft} className="h-9 whitespace-nowrap border border-white/50 px-3 text-sm font-semibold hover:bg-white/10">
              Lưu<span className="hidden sm:inline"> bản</span> nháp
            </button>
          )}
          <button
            aria-expanded={draftsOpen}
            onClick={() => setDraftsOpen((o) => !o)}
            className="h-9 whitespace-nowrap bg-white/10 px-3 text-sm font-semibold hover:bg-white/20"
          >
            Bản nháp ({drafts.length})
          </button>
        </div>

        {draftsOpen && (
          <>
            <button aria-label="Đóng danh sách bản nháp" className="fixed inset-0 z-10 cursor-default" onClick={() => setDraftsOpen(false)} />
            <div className="absolute right-4 top-[52px] z-20 w-[340px] max-w-[calc(100vw-2rem)] border border-rule-strong bg-paper text-ink shadow-lg">
              <h2 className="border-b border-rule bg-sheet px-4 py-2 font-channel text-base font-bold">Bản nháp trên trình duyệt này</h2>
              {drafts.length === 0 ? (
                <p className="p-4 text-sm text-ink-soft">Chưa có bản nháp. Tạo email rồi bấm Lưu bản nháp.</p>
              ) : (
                <ul className="scroll max-h-[60dvh] overflow-y-auto">
                  {drafts.map((d) => (
                    <li key={d.id} className="grid grid-cols-[1fr_auto] items-center border-b border-rule last:border-b-0">
                      <button className="min-w-0 px-4 py-3 text-left hover:bg-onair-soft" onClick={() => openDraft(d)}>
                        <span className="block truncate text-sm font-semibold">{d.input.brand}</span>
                        <span className="block truncate text-xs text-ink-soft">
                          {GOALS[d.input.goal]} · {new Date(d.savedAt).toLocaleString("vi-VN")}
                        </span>
                      </button>
                      <button
                        className="px-4 py-3 text-xs font-semibold text-danger hover:underline"
                        onClick={() => persist(drafts.filter((x) => x.id !== d.id))}
                      >
                        Xoá
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </header>

      <div className="grid min-h-0 lg:grid-cols-[300px_380px_1fr]">
        <aside className={`${pane("form")} min-h-0 flex-col border-r border-rule bg-paper`}>
          <h2 className="border-b border-rule bg-sheet px-5 py-2 font-channel text-base font-bold tracking-wide">Chiến dịch</h2>
          <CampaignForm value={form} onChange={setForm} onSubmit={generate} loading={loading} />
        </aside>

        <section className={`${pane("inbox")} scroll min-h-0 flex-col overflow-y-auto border-r border-rule bg-sheet`}>
          {error && (
            <p role="alert" className="border-b border-danger/40 bg-[#fdecee] p-4 text-sm text-danger">
              {error}
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

      {notice && (
        <p role="status" className="fixed bottom-16 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 bg-shell px-4 py-2 text-sm font-semibold text-white shadow-lg lg:bottom-6">
          {notice}
        </p>
      )}

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
