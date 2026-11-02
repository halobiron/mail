"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EDIT_ACTIONS } from "@/lib/edit-actions";
import type { EditField } from "@/lib/schema";

/** `commit` ở onChange là true ở lần đổi đầu tiên sau mỗi lần đặt con trỏ vào trường, để mỗi lượt sửa chỉ ghi một mốc hoàn tác. */
export type Ask = (field: EditField, text: string, fieldText: string, instruction: string) => Promise<string>;

const control =
  "w-full border border-rule-strong bg-paper px-3 py-2 text-sm text-ink focus:border-shell";
const chip =
  "h-8 border border-rule-strong bg-paper px-3 text-sm font-medium hover:bg-onair-soft disabled:opacity-50";
const textBtn = "h-8 px-2 text-sm font-semibold text-ink-soft underline underline-offset-2 hover:text-ink disabled:opacity-40 disabled:no-underline";

export function Field({
  label,
  field,
  value,
  multiline,
  onChange,
  ask,
  actions,
  inline,
  meta,
}: {
  label: string;
  field: EditField;
  value: string;
  multiline?: boolean;
  onChange: (value: string, commit: boolean) => void;
  ask: Ask;
  actions?: React.ReactNode;
  /** Tiêu đề thư: chữ lớn không khung, hiện viền nét đứt khi rê chuột như các phần chữ trong thân email. */
  inline?: boolean;
  /** Dòng phụ bên trái nút "Nhờ AI chỉnh" (chỉ dùng với inline). */
  meta?: React.ReactNode;
}) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const session = useRef(false);
  const [sel, setSel] = useState<{ start: number; end: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const hasSel = !!sel && sel.end > sel.start;
  const show = hasSel || open;
  const toolbar = useRef<HTMLDivElement>(null);

  // Thanh chỉnh hiện ra thì cuộn vào tầm nhìn, vì trường có thể nằm sát mép dưới vùng soạn.
  useEffect(() => {
    if (show) toolbar.current?.scrollIntoView({ block: "nearest" });
  }, [show]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (multiline && el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value, multiline]);

  function syncSelection() {
    const el = ref.current;
    if (el) setSel({ start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 });
  }

  async function run(instruction: string) {
    const start = hasSel ? sel!.start : 0;
    const end = hasSel ? sel!.end : value.length;
    const part = value.slice(start, end);
    if (!part.trim()) {
      setError("Chưa có nội dung để chỉnh");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const text = await ask(field, part, value, instruction);
      onChange(value.slice(0, start) + text + value.slice(end), true);
      setSel(null);
      setCustom("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không chỉnh được");
    } finally {
      setBusy(false);
    }
  }

  const shared = {
    ref,
    value,
    onFocus: () => {
      session.current = false;
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const commit = !session.current;
      session.current = true;
      onChange(e.target.value, commit);
    },
    onSelect: syncSelection,
    onKeyUp: syncSelection,
    onMouseUp: syncSelection,
    className: inline
      ? "-mx-1 w-[calc(100%+0.5rem)] border border-transparent bg-transparent px-1 py-0.5 text-lg font-semibold leading-snug text-ink hover:border-dashed hover:border-rule-strong"
      : `${control} ${multiline ? "resize-none overflow-hidden leading-relaxed" : ""}`,
    "aria-label": label,
  };

  return (
    <div>
      {!inline && (
        <div className="mb-1 flex min-h-8 items-center gap-1">
          <span className="mr-auto text-xs font-semibold">{label}</span>
          {actions}
          <button type="button" aria-expanded={show} disabled={busy} onClick={() => setOpen((o) => !o)} className={textBtn}>
            Nhờ AI chỉnh
          </button>
        </div>
      )}
      {multiline ? <textarea rows={2} {...shared} /> : <input type="text" {...shared} />}
      {inline && (
        <div className="mt-0.5 flex min-h-8 items-center gap-1">
          <span className="mr-auto min-w-0 truncate text-xs text-ink-soft">{meta}</span>
          <button type="button" aria-expanded={show} disabled={busy} onClick={() => setOpen((o) => !o)} className={textBtn}>
            Nhờ AI chỉnh
          </button>
        </div>
      )}

      {show && (
        <div ref={toolbar} className="mt-2 border border-rule bg-sheet p-3">
          <p className="mb-2 text-xs font-semibold">
            {hasSel ? `Chỉnh đoạn đã chọn (${sel!.end - sel!.start} ký tự)` : "Chỉnh cả trường này. Bôi đen một đoạn để chỉ sửa đoạn đó."}
          </p>
          <div className="flex flex-wrap gap-2">
            {EDIT_ACTIONS.map((a) => (
              <button
                key={a.label}
                type="button"
                disabled={busy}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(a.instruction)}
                className={chip}
              >
                {a.label}
              </button>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (custom.trim()) run(custom.trim());
            }}
          >
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={300}
              placeholder="Hoặc nhập yêu cầu riêng, ví dụ: thêm con số cụ thể"
              aria-label={`Yêu cầu riêng cho ${label}`}
              className={`${control} h-9`}
            />
            <button type="submit" disabled={busy || !custom.trim()} className="h-9 shrink-0 bg-shell px-4 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Đang chỉnh…" : "Chỉnh"}
            </button>
          </form>
          {error && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
