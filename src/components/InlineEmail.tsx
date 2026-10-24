"use client";

import { useEffect, useRef, useState } from "react";
import { EDIT_ACTIONS } from "@/lib/edit-actions";
import { MAX_BLOCKS, newBlock, type EditField, type Email } from "@/lib/schema";
import type { Ask } from "./AssistField";

type Part = "text" | "label" | "item";
type Target = { block: number; part: Part; item: number };
type Selection = Target & { start: number; end: number; panelTop: number; panelLeft: number };
export type FocusRequest = { block: number; nonce: number };

const PANEL_W = 360;
const PANEL_H = 200;

/** Kiểu cho phần chữ sửa được bên trong email: viền nét đứt khi rê chuột, viền xanh khi đang sửa, nét đứt xanh cho khối đang chọn. */
const FRAME_CSS = `
[data-part]{cursor:text}
[data-part]:hover{outline:1px dashed #aeb8cd;outline-offset:3px}
[data-part]:focus{outline:2px solid #2b50e8;outline-offset:3px}
[data-selected]:not(:focus){outline:2px dashed #2b50e8;outline-offset:4px}
::selection{background:#ffd23f;color:#101b3d}
`;

function read(email: Email, t: Target): string {
  const b = email.blocks[t.block];
  if (!b) return "";
  if (t.part === "item") return b.items[t.item] ?? "";
  return t.part === "label" ? b.label : b.text;
}

function write(email: Email, t: Target, value: string): Email {
  return {
    ...email,
    blocks: email.blocks.map((b, i) => {
      if (i !== t.block) return b;
      if (t.part === "item") return { ...b, items: b.items.map((x, j) => (j === t.item ? value : x)) };
      return t.part === "label" ? { ...b, label: value } : { ...b, text: value };
    }),
  };
}

/** Trường nào của AI tương ứng với phần chữ đang chọn; quyết định luật độ dài khi chỉnh. */
function fieldFor(email: Email, t: Target): EditField {
  const type = email.blocks[t.block]?.type;
  if (type === "list") return "listItem";
  if (type === "offer") return t.part === "label" ? "offerLabel" : "offerText";
  if (type === "heading" || type === "button" || type === "note") return type;
  return "text";
}

function targetOf(node: Node | null): { el: HTMLElement; target: Target } | null {
  const element = node && node.nodeType === 3 ? node.parentElement : (node as Element | null);
  const el = element?.closest<HTMLElement>("[data-part]");
  if (!el) return null;
  return {
    el,
    target: { block: Number(el.dataset.block), part: el.dataset.part as Part, item: Number(el.dataset.item ?? 0) },
  };
}

function offsetIn(doc: Document, el: HTMLElement, node: Node, offset: number) {
  const r = doc.createRange();
  r.selectNodeContents(el);
  r.setEnd(node, offset);
  return r.toString().length;
}

function selectorOf(t: Target) {
  return `[data-block="${t.block}"][data-part="${t.part}"]${t.part === "item" ? `[data-item="${t.item}"]` : ""}`;
}

/**
 * Bản xem trước email sửa được ngay trên chính nó: bấm vào chữ để gõ, Enter tách đoạn hoặc ý,
 * Backspace ở đầu đoạn gộp với đoạn trên, bôi đen để nhờ AI chỉnh riêng đoạn đó.
 */
export default function InlineEmail({
  html,
  error,
  email,
  ask,
  selected,
  focusRequest,
  onEdit,
  onHold,
  onNotice,
  onFocusBlock,
}: {
  html: string | null;
  error: string | null;
  email: Email;
  ask: Ask;
  selected: number | null;
  focusRequest: FocusRequest | null;
  onEdit: (next: Email, commit: boolean) => void;
  /** true khi người dùng đang gõ hoặc đang mở thanh AI: tạm dừng dựng lại để không mất con trỏ. */
  onHold: (hold: boolean) => void;
  onNotice: (text: string) => void;
  onFocusBlock: (block: number) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const live = useRef({ email, ask, selected, onEdit, onHold, onNotice, onFocusBlock });
  useEffect(() => {
    live.current = { email, ask, selected, onEdit, onHold, onNotice, onFocusBlock };
  });
  const typing = useRef(false); // đã ghi mốc hoàn tác cho phiên gõ hiện tại chưa
  const focused = useRef(false);
  const assistOpen = useRef(false);
  const panelFocus = useRef(false);
  const busyRef = useRef(false);
  const caret = useRef<{ target: Target; offset: number } | null>(null);

  const [sel, setSel] = useState<Selection | null>(null);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    assistOpen.current = !!sel;
    live.current.onHold(focused.current || !!sel);
  }, [sel]);

  // Đánh dấu khối đang chọn trong khung email.
  useEffect(() => {
    markSelected(frame.current?.contentDocument ?? null, selected);
  }, [selected, html]);

  // Thanh cấu trúc yêu cầu đưa con trỏ vào một khối.
  useEffect(() => {
    if (!focusRequest) return;
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const el = doc.querySelector<HTMLElement>(`[data-block="${focusRequest.block}"][data-part]`);
    if (el) el.focus();
    else doc.querySelector(`[data-block="${focusRequest.block}"]`)?.scrollIntoView({ block: "nearest" });
  }, [focusRequest]);

  function markSelected(doc: Document | null, block: number | null) {
    if (!doc) return;
    doc.querySelectorAll("[data-selected]").forEach((e) => e.removeAttribute("data-selected"));
    if (block === null) return;
    doc.querySelectorAll(`[data-block="${block}"]`).forEach((e) => e.setAttribute("data-selected", ""));
  }

  const syncHold = () => live.current.onHold(focused.current || assistOpen.current);

  /** Cấu trúc đổi (tách/gộp): cần dựng lại ngay nên nhả khoá. */
  function restructure(next: Email, to: { target: Target; offset: number }) {
    caret.current = to;
    live.current.onEdit(next, true);
    focused.current = false;
    syncHold();
  }

  function onInput(e: Event) {
    const hit = targetOf(e.target as Node);
    if (!hit) return;
    const { email: current } = live.current;
    let text = hit.el.textContent ?? "";
    if (current.blocks[hit.target.block]?.type !== "text") text = text.replace(/\s*\n+\s*/g, " ");
    const commit = !typing.current;
    typing.current = true;
    live.current.onEdit(write(current, hit.target, text), commit);
  }

  function onKey(e: KeyboardEvent) {
    const hit = targetOf(e.target as Node);
    if (!hit) return;
    if (e.key !== "Enter" && e.key !== "Backspace") return;
    const doc = hit.el.ownerDocument;
    const s = doc.getSelection();
    const { email: current } = live.current;
    const t = hit.target;
    const block = current.blocks[t.block];
    if (!block || !s || s.rangeCount === 0) return;
    const r = s.getRangeAt(0);
    const off = offsetIn(doc, hit.el, r.startContainer, r.startOffset);
    const value = read(current, t);

    if (e.key === "Enter") {
      e.preventDefault();
      if (block.type === "text") {
        if (current.blocks.length >= MAX_BLOCKS) {
          live.current.onNotice(`Tối đa ${MAX_BLOCKS} khối`);
          return;
        }
        const blocks = [...current.blocks];
        blocks.splice(
          t.block,
          1,
          { ...block, text: value.slice(0, off).trimEnd() },
          { ...newBlock("text"), text: value.slice(off).trimStart() },
        );
        restructure({ ...current, blocks }, { target: { block: t.block + 1, part: "text", item: 0 }, offset: 0 });
      } else if (block.type === "list" && t.part === "item") {
        const items = [...block.items];
        items.splice(t.item, 1, value.slice(0, off).trimEnd(), value.slice(off).trimStart());
        const blocks = current.blocks.map((b, i) => (i === t.block ? { ...b, items } : b));
        restructure({ ...current, blocks }, { target: { block: t.block, part: "item", item: t.item + 1 }, offset: 0 });
      }
      return;
    }

    if (!s.isCollapsed || off !== 0) return;
    if (block.type === "text" && t.block > 0 && current.blocks[t.block - 1].type === "text") {
      e.preventDefault();
      const prev = current.blocks[t.block - 1].text;
      const joiner = prev && value ? " " : "";
      const blocks = [...current.blocks];
      blocks.splice(t.block - 1, 2, { ...blocks[t.block - 1], text: prev + joiner + value });
      restructure(
        { ...current, blocks },
        { target: { block: t.block - 1, part: "text", item: 0 }, offset: prev.length + joiner.length },
      );
    } else if (block.type === "list" && t.part === "item" && t.item > 0) {
      e.preventDefault();
      const prev = block.items[t.item - 1];
      const joiner = prev && value ? " " : "";
      const items = [...block.items];
      items.splice(t.item - 1, 2, prev + joiner + value);
      const blocks = current.blocks.map((b, i) => (i === t.block ? { ...b, items } : b));
      restructure(
        { ...current, blocks },
        { target: { block: t.block, part: "item", item: t.item - 1 }, offset: prev.length + joiner.length },
      );
    }
  }

  function onSelection(doc: Document) {
    if (panelFocus.current || busyRef.current) return;
    const s = doc.getSelection();
    if (!s || s.rangeCount === 0 || s.isCollapsed) {
      setSel(null);
      return;
    }
    const range = s.getRangeAt(0);
    const a = targetOf(range.startContainer);
    const b = targetOf(range.endContainer);
    if (!a || !b || a.el !== b.el) {
      setSel(null);
      return;
    }
    const start = offsetIn(doc, a.el, range.startContainer, range.startOffset);
    const end = offsetIn(doc, a.el, range.endContainer, range.endOffset);
    if (end <= start || !frame.current || !wrap.current) {
      setSel(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    const fr = frame.current.getBoundingClientRect();
    const wr = wrap.current.getBoundingClientRect();
    const top = fr.top - wr.top + rect.top;
    const bottom = fr.top - wr.top + rect.bottom;
    const below = bottom + 8;
    const width = Math.min(PANEL_W, wr.width - 16);
    setSel({
      ...a.target,
      start,
      end,
      panelTop: below + PANEL_H > wr.height ? Math.max(4, top - 8 - PANEL_H) : below,
      panelLeft: Math.min(Math.max(fr.left - wr.left + rect.left, 8), Math.max(8, wr.width - width - 8)),
    });
  }

  function setup() {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    // Tài liệu mới tải xong chưa có phần tử nào đang được focus.
    focused.current = false;
    typing.current = false;
    const style = doc.createElement("style");
    style.textContent = FRAME_CSS;
    doc.head.appendChild(style);
    doc.querySelectorAll<HTMLElement>("[data-part]").forEach((el) => {
      el.setAttribute("contenteditable", "plaintext-only");
      if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
      el.spellcheck = false;
    });
    markSelected(doc, live.current.selected);
    doc.addEventListener("focusin", (e) => {
      const hit = targetOf(e.target as Node);
      focused.current = !!hit;
      typing.current = false;
      if (hit) live.current.onFocusBlock(hit.target.block);
      syncHold();
    });
    doc.addEventListener("focusout", () =>
      setTimeout(() => {
        focused.current = !!targetOf(doc.activeElement);
        syncHold();
      }, 0),
    );
    doc.addEventListener("input", onInput);
    doc.addEventListener("keydown", onKey);
    doc.addEventListener("selectionchange", () => onSelection(doc));
    doc.addEventListener("scroll", () => onSelection(doc), true);
    doc.addEventListener("click", (e) => {
      if ((e.target as Element).closest?.("a")) e.preventDefault();
    });
    doc.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      doc.execCommand("insertText", false, text.replace(/\s*\n+\s*/g, " "));
    });

    const at = caret.current;
    caret.current = null;
    if (at) {
      const el = doc.querySelector<HTMLElement>(selectorOf(at.target));
      if (el) {
        el.focus();
        const node = el.firstChild;
        const range = doc.createRange();
        if (node) range.setStart(node, Math.min(at.offset, node.textContent?.length ?? 0));
        else range.setStart(el, 0);
        range.collapse(true);
        const s = doc.getSelection();
        s?.removeAllRanges();
        s?.addRange(range);
      }
    }
  }

  async function run(label: string, instruction: string) {
    if (!sel) return;
    const snap = sel;
    const { email: current, ask: askAI } = live.current;
    const value = read(current, snap);
    busyRef.current = true;
    setBusy(label);
    setErr(null);
    try {
      const text = await askAI(fieldFor(current, snap), value.slice(snap.start, snap.end), value, instruction);
      live.current.onEdit(write(live.current.email, snap, value.slice(0, snap.start) + text + value.slice(snap.end)), true);
      busyRef.current = false;
      panelFocus.current = false;
      // Con trỏ còn nằm trong đoạn vừa sửa sẽ giữ nguyên khung cũ; rời khỏi trường để khung dựng lại với chữ mới.
      focused.current = false;
      (frame.current?.contentDocument?.activeElement as HTMLElement | null)?.blur();
      setSel(null);
      setCustom("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không chỉnh được");
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  function closePanel() {
    panelFocus.current = false;
    setSel(null);
    setErr(null);
  }

  return (
    <div ref={wrap} className="relative flex min-h-0 flex-1 flex-col">
      {error ? (
        <p role="alert" className="p-5 text-sm text-danger">
          Không dựng được xem trước: {error}
        </p>
      ) : !html ? (
        <p className="p-5 text-sm text-ink-soft">Đang dựng email…</p>
      ) : (
        <iframe
          ref={frame}
          title="Email: bấm vào chữ để sửa, bôi đen để nhờ AI chỉnh"
          sandbox="allow-same-origin"
          srcDoc={html}
          onLoad={setup}
          className="min-h-0 w-full flex-1 border-0"
        />
      )}

      {sel && (
        <div
          role="dialog"
          aria-label="Nhờ AI chỉnh đoạn đã chọn"
          className="absolute z-20 border border-rule-strong bg-paper p-3 shadow-lg"
          style={{ top: sel.panelTop, left: sel.panelLeft, width: `min(${PANEL_W}px, calc(100% - 16px))` }}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName !== "INPUT") e.preventDefault();
          }}
        >
          <div className="mb-2 flex items-center">
            <p className="mr-auto text-xs font-semibold">Chỉnh đoạn đã chọn ({sel.end - sel.start} ký tự)</p>
            <button type="button" onClick={closePanel} className="h-6 px-1 text-xs font-semibold text-ink-soft underline underline-offset-2 hover:text-ink">
              Đóng
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EDIT_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                disabled={busy !== null}
                onClick={() => run(a.label, a.instruction)}
                className="h-8 border border-rule-strong bg-paper px-2.5 text-sm font-medium hover:bg-onair-soft disabled:opacity-50"
              >
                {busy === a.label ? "Đang chỉnh…" : a.label}
              </button>
            ))}
          </div>
          <form
            className="mt-2 flex gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (custom.trim()) run("custom", custom.trim());
            }}
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onFocus={() => {
                panelFocus.current = true;
              }}
              onBlur={() => {
                panelFocus.current = false;
              }}
              maxLength={300}
              placeholder="Yêu cầu riêng, ví dụ: thêm con số cụ thể"
              aria-label="Yêu cầu riêng cho đoạn đã chọn"
              className="h-9 w-full border border-rule-strong bg-paper px-2.5 text-sm placeholder:text-ink-soft focus:border-shell"
            />
            <button type="submit" disabled={busy !== null || !custom.trim()} className="h-9 shrink-0 bg-shell px-3 text-sm font-semibold text-white disabled:opacity-50">
              {busy === "custom" ? "Đang chỉnh…" : "Chỉnh"}
            </button>
          </form>
          {err && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {err}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
