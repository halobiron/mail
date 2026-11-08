"use client";

import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  HEADER_STYLES,
  MAX_BLOCKS,
  newBlock,
  type BlockType,
  type Email,
  type HeaderStyle,
} from "@/lib/schema";

const MIN_BLOCKS = 1;

const select =
  "h-8 border border-rule-strong bg-paper px-2 text-sm font-medium hover:bg-onair-soft disabled:opacity-50";
const action =
  "h-8 px-2 text-sm font-semibold text-ink-soft underline underline-offset-2 hover:text-ink disabled:opacity-40 disabled:no-underline";

/** Hiện cấu trúc email dưới dạng dãy khối; thêm, xoá, đổi thứ tự khối và đổi kiểu đầu thư. */
export default function BlockBar({
  email,
  selected,
  onSelect,
  onChange,
}: {
  email: Email;
  selected: number | null;
  /** `focus` true khi người dùng bấm chip: đưa con trỏ vào khối. Thao tác cấu trúc chỉ chọn khối. */
  onSelect: (block: number, focus: boolean) => void;
  onChange: (next: Email) => void;
}) {
  const at = selected ?? email.blocks.length - 1;
  const hasSel = selected !== null && selected < email.blocks.length;

  function move(d: -1 | 1) {
    if (!hasSel) return;
    const blocks = [...email.blocks];
    [blocks[at], blocks[at + d]] = [blocks[at + d], blocks[at]];
    onChange({ ...email, blocks });
    onSelect(at + d, false);
  }

  function remove() {
    if (!hasSel || email.blocks.length <= MIN_BLOCKS) return;
    onChange({ ...email, blocks: email.blocks.filter((_, i) => i !== at) });
    onSelect(Math.max(0, at - 1), false);
  }

  function add(type: BlockType) {
    const blocks = [...email.blocks];
    blocks.splice(at + 1, 0, newBlock(type));
    onChange({ ...email, blocks });
    onSelect(at + 1, false);
  }

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Các khối của email" className="scroll flex gap-1.5 overflow-x-auto pb-1">
        {email.blocks.map((b, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={selected === i}
            onClick={() => onSelect(i, true)}
            className={`h-8 shrink-0 border px-3 text-sm font-medium ${
              selected === i ? "border-shell bg-shell text-white" : "border-rule-strong bg-paper hover:bg-onair-soft"
            }`}
          >
            {i + 1}. {BLOCK_LABELS[b.type]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelect(-1, true)}
          title="Mỗi email có đúng một nút CTA, luôn nằm cuối"
          className="h-8 shrink-0 border border-shell bg-onair px-3 text-sm font-semibold text-shell hover:bg-onair-soft"
        >
          Nút CTA
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1">
        <p className="mr-auto text-sm font-semibold text-shell">
          Các vùng nét đứt trong thư là ô điền: bấm vào để gõ, bôi đen để nhờ AI chỉnh riêng đoạn đó.
        </p>
        <button type="button" className={action} disabled={!hasSel || at === 0} onClick={() => move(-1)}>
          Lên
        </button>
        <button type="button" className={action} disabled={!hasSel || at >= email.blocks.length - 1} onClick={() => move(1)}>
          Xuống
        </button>
        <button
          type="button"
          className={action}
          disabled={!hasSel || email.blocks.length <= MIN_BLOCKS}
          title={email.blocks.length <= MIN_BLOCKS ? `Email cần ít nhất ${MIN_BLOCKS} khối` : undefined}
          onClick={remove}
        >
          Xoá khối
        </button>
        <select
          aria-label="Thêm khối bên dưới khối đang chọn"
          className={select}
          value=""
          disabled={email.blocks.length >= MAX_BLOCKS}
          onChange={(e) => add(e.target.value as BlockType)}
        >
          <option value="">{email.blocks.length >= MAX_BLOCKS ? `Tối đa ${MAX_BLOCKS} khối` : "Thêm khối…"}</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          aria-label="Kiểu đầu thư"
          className={select}
          value={email.header}
          onChange={(e) => onChange({ ...email, header: e.target.value as HeaderStyle })}
        >
          {(Object.keys(HEADER_STYLES) as HeaderStyle[]).map((h) => (
            <option key={h} value={h}>
              Đầu thư: {HEADER_STYLES[h]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
