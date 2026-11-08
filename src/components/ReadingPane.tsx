"use client";

import { useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/api";
import { EDIT_ACTIONS } from "@/lib/edit-actions";
import { TONES, type CampaignInput, type EditField, type Email, type Tone } from "@/lib/schema";
import { Field, type Ask } from "./AssistField";
import BlockBar from "./BlockBar";
import { CHANNELS, btnOutline, btnPrimary } from "./channels";
import InlineEmail, { type FocusRequest } from "./InlineEmail";

export type RewriteOptions = { tone?: Tone; instruction?: string };

type Rendered = { html: string; text: string };

function plainCopy(email: Email) {
  const lines = email.blocks.flatMap((b) => {
    switch (b.type) {
      case "list":
        return [...b.items.map((item) => `- ${item}`), ""];
      case "offer":
        return [b.label ? `${b.label}: ${b.text}` : b.text, ""];
      case "divider":
        return ["---", ""];
      default:
        return [b.text, ""];
    }
  });
  return [`Tiêu đề: ${email.subject}`, "", ...lines, `[${email.cta}]`].join("\n");
}

const chip = "h-8 shrink-0 border border-rule-strong bg-paper px-3 text-sm font-medium hover:bg-onair-soft disabled:opacity-50";

export default function ReadingPane({
  input,
  email,
  index,
  tone,
  canUndo,
  onRewrite,
  onEdit,
  onUndo,
}: {
  input: CampaignInput;
  email: Email;
  index: number;
  tone: Tone | "";
  canUndo: boolean;
  onRewrite: (options: RewriteOptions) => Promise<void>;
  onEdit: (next: Email, commit: boolean) => void;
  onUndo: () => void;
}) {
  const channel = CHANNELS[index];
  const [html, setHtml] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const hold = useRef(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState<"text" | "html" | null>(null);
  const [custom, setCustom] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [selected, setSelected] = useState<number | null>(null);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const latest = useRef({ input, email });
  useEffect(() => {
    latest.current = { input, email };
  });

  // Dựng lại bản xem trước khi nội dung đổi, trừ lúc người dùng đang gõ trong email (dựng lại sẽ làm mất con trỏ).
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (hold.current) return;
      postJson<Rendered>("/api/render", { input, email })
        .then((r) => {
          if (cancelled) return;
          setHtml(r.html);
          setRenderError(null);
        })
        .catch((e: Error) => !cancelled && setRenderError(e.message));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [email, input, tick]);

  function onHold(next: boolean) {
    const was = hold.current;
    hold.current = next;
    if (was && !next) setTick((n) => n + 1);
  }

  const ask: Ask = (field: EditField, text, fieldText, instruction) =>
    postJson<{ text: string }>("/api/edit", { input, email: latest.current.email, field, text, fieldText, instruction }).then((r) => r.text);

  async function copy(kind: "text" | "html") {
    try {
      if (kind === "text") {
        await navigator.clipboard.writeText(plainCopy(latest.current.email));
      } else {
        const { html } = await postJson<Rendered>("/api/render", { input, email: latest.current.email });
        // Ghi cả text/html (để dán vào Gmail ra email định dạng, có nút) lẫn text/plain (để dán vào trình soạn mã ra mã nguồn).
        if (typeof ClipboardItem === "undefined") {
          await navigator.clipboard.writeText(html);
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([html], { type: "text/html" }),
              "text/plain": new Blob([html], { type: "text/plain" }),
            }),
          ]);
        }
      }
      setMessage(null);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      setMessage({
        ok: false,
        text: e instanceof DOMException || !(e instanceof Error) ? "Trình duyệt không cho phép copy. Hãy cấp quyền clipboard cho trang." : e.message,
      });
    }
  }

  async function rewrite(key: string, options: RewriteOptions, doneText: string) {
    setBusy(key);
    setMessage(null);
    try {
      await onRewrite(options);
      setMessage({ ok: true, text: doneText });
      if (options.instruction) setCustom("");
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Không viết lại được" });
    } finally {
      setBusy(null);
    }
  }

  const quick = (label: string, instruction: string) =>
    rewrite(label, { instruction }, `Đã chỉnh cả email: ${label.toLowerCase()}`);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-rule bg-sheet px-4 py-1.5">
        <span className={`${channel.bg} flex h-9 w-9 items-center justify-center font-channel text-xl font-bold text-white`} aria-hidden>
          {channel.letter}
        </span>
        <p className="text-sm font-semibold">
          Mẫu {channel.letter}
          <span className="font-normal text-ink-soft"> · {email.angle}</span>
        </p>
        {message?.ok && (
          <p role="status" className="min-w-0 truncate text-sm text-ink-soft">
            {message.text}
          </p>
        )}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button
            className="h-9 whitespace-nowrap px-2 text-sm font-semibold text-ink-soft underline underline-offset-2 hover:text-ink disabled:no-underline disabled:opacity-40"
            disabled={!canUndo || busy !== null}
            onClick={onUndo}
          >
            Hoàn tác
          </button>
          <button className={btnPrimary} onClick={() => copy("text")}>
            {copied === "text" ? "Đã copy" : "Copy nội dung"}
          </button>
          <button className={btnOutline} onClick={() => copy("html")}>
            {copied === "html" ? "Đã copy" : "Copy HTML"}
          </button>
        </div>
        {message && !message.ok && (
          <p role="alert" className="w-full border border-danger/40 bg-[#fdecee] px-3 py-2 text-sm text-danger">
            {message.text}
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-sheet p-4 md:px-6 md:pb-4 md:pt-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold">Xem trên</span>
          <div className="flex border border-rule-strong" role="group" aria-label="Xem trước theo thiết bị">
            {([["desktop", "Desktop"], ["mobile", "Mobile"]] as const).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={`h-8 border-r border-rule-strong px-3 text-sm font-semibold last:border-r-0 ${
                  device === id ? "bg-onair text-shell" : "bg-paper hover:bg-onair-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {device === "mobile" && <span className="text-xs text-ink-soft">Khung rộng 375px</span>}
        </div>
        <div className="mb-3 w-full">
          <BlockBar
            email={email}
            selected={selected}
            onSelect={(block, focus) => {
              setSelected(block < 0 ? null : block);
              if (focus) setFocusRequest((r) => ({ block, nonce: (r?.nonce ?? 0) + 1 }));
            }}
            onChange={(next) => {
              // Thêm, xoá, đổi thứ tự khối cần dựng lại ngay, kể cả khi con trỏ đang nằm trong email.
              hold.current = false;
              onEdit(next, true);
            }}
          />
        </div>
        <div className="flex min-h-[320px] w-full min-w-0 flex-1 flex-col border border-rule bg-paper">
          <div className="border-b border-rule px-6 pb-1 pt-4">
            <Field
              inline
              label="Tiêu đề thư"
              field="subject"
              value={email.subject}
              ask={ask}
              meta={`Từ: ${input.brand}`}
              onChange={(v, c) => onEdit({ ...email, subject: v }, c)}
            />
          </div>
          <InlineEmail
            html={html}
            error={renderError}
            email={email}
            ask={ask}
            selected={selected}
            focusRequest={focusRequest}
            device={device}
            onEdit={onEdit}
            onHold={onHold}
            onNotice={(text) => setMessage({ ok: true, text })}
            onFocusBlock={setSelected}
          />
        </div>
      </div>

      <div className="border-t border-rule-strong bg-paper px-3 pb-3 pt-2">
        <div className="scroll mb-2 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-sm font-semibold">Viết lại theo tông khác</span>
          <div className="flex shrink-0 border border-rule-strong" role="group" aria-label="Viết lại theo tông khác">
            {(Object.keys(TONES) as Tone[]).map((t) => (
              <button
                key={t}
                aria-pressed={tone === t}
                disabled={busy !== null}
                onClick={() => rewrite(t, { tone: t }, `Đã viết lại theo tông ${TONES[t].toLowerCase()}`)}
                className={`h-8 border-r border-rule-strong px-3 text-sm font-semibold last:border-r-0 disabled:opacity-60 ${
                  tone === t ? "bg-onair text-shell" : "bg-paper hover:bg-onair-soft"
                }`}
              >
                {busy === t ? "Đang viết…" : TONES[t]}
              </button>
            ))}
          </div>
          <span className="ml-2 shrink-0 text-sm font-semibold">Chỉnh cả email</span>
          {EDIT_ACTIONS.filter((a) => a.label !== "Trang trọng hơn").map((a) => (
            <button key={a.label} disabled={busy !== null} onClick={() => quick(a.label, a.instruction)} className={chip}>
              {busy === a.label ? "Đang chỉnh…" : a.label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const text = custom.trim();
            if (text) rewrite("custom", { instruction: text }, "Đã chỉnh cả email theo yêu cầu của bạn");
          }}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={500}
            disabled={busy !== null}
            placeholder="Nhập yêu cầu riêng, ví dụ: nhấn mạnh hạn 31/10 và bỏ đoạn cuối"
            aria-label="Yêu cầu chỉnh cả email"
            className="h-10 w-full border border-rule-strong bg-paper px-3 text-sm placeholder:text-ink-soft focus:border-shell"
          />
          <button
            type="submit"
            disabled={busy !== null || !custom.trim()}
            className="h-10 shrink-0 bg-shell px-5 text-sm font-semibold text-white hover:bg-[#1c2c5e] disabled:opacity-50"
          >
            {busy === "custom" ? "Đang chỉnh…" : "Chỉnh"}
          </button>
        </form>
      </div>
    </div>
  );
}
