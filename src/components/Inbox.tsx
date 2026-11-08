import type { CampaignInput, Email } from "@/lib/schema";
import { CHANNELS } from "./channels";

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const pick = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return pick.map((w) => Array.from(w)[0]?.toUpperCase() ?? "").join("") || "?";
}

/** Danh sách 3 mẫu hiển thị như các dòng thư trong hộp thư; chọn dòng nào thì khung đọc mở thư đó. */
export default function Inbox({
  input,
  emails,
  active,
  loading,
  onSelect,
}: {
  input: CampaignInput | null;
  emails: Email[] | null;
  active: number;
  loading: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <section aria-label="Hộp thư 3 mẫu" className="border-b border-rule bg-paper">
      <h2 className="flex h-12 items-center border-b border-rule bg-sheet px-4 font-channel text-base font-bold tracking-wide">
        Hộp thư · 3 kênh
      </h2>
      {!emails ? (
        <ul>
          {CHANNELS.map((c) => (
            <li key={c.letter} className="grid grid-cols-[34px_1fr] gap-3 border-b border-rule px-4 py-3 last:border-b-0">
              <span className={`${c.bg} ${loading ? "opacity-40" : "opacity-25"} flex h-[34px] w-[34px] items-center justify-center font-channel text-xl font-bold text-white`}>
                {c.letter}
              </span>
              <span className="self-center text-sm text-ink-soft">
                {loading ? "Đang viết…" : c.letter === "A" ? "Điền form bên trái rồi bấm Viết 3 mẫu email." : "Chưa có mẫu"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul role="tablist" aria-label="Chọn mẫu email">
          {emails.map((e, i) => {
            const c = CHANNELS[i];
            const on = active === i;
            return (
              <li key={i} role="presentation" className="air-in" style={{ animationDelay: `${i * 70}ms` }}>
                <button
                  role="tab"
                  aria-selected={on}
                  onClick={() => onSelect(i)}
                  className={`grid w-full grid-cols-[34px_1fr] gap-3 border-b border-rule px-4 py-3 text-left last:border-b-0 ${
                    on ? "bg-onair-soft" : "bg-paper hover:bg-sheet"
                  }`}
                >
                  <span className="relative h-[34px] w-[34px]">
                    <span
                      aria-hidden
                      style={{ backgroundColor: input?.brandColor }}
                      className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-sm font-bold text-white"
                    >
                      {initials(input?.brand ?? "")}
                    </span>
                    <span
                      className={`${c.bg} absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center border border-paper font-channel text-[10px] font-bold leading-none text-white`}
                    >
                      {c.letter}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-ink-soft">
                      {input?.brand} · {e.angle}
                    </span>
                    <span className="line-clamp-2 text-sm font-semibold">{e.subject}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
