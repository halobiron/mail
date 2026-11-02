"use client";

import { GOALS, type CampaignInput, type Goal } from "@/lib/schema";

const input =
  "w-full border border-rule-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-shell";

function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs font-semibold">{legend}</legend>
      <div className="grid border border-rule-strong" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer border-r border-rule-strong px-1 py-2 text-center text-xs font-medium last:border-r-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-focus ${
              value === o.value ? "bg-shell text-white" : "bg-paper hover:bg-onair-soft"
            }`}
          >
            <input
              type="radio"
              name={legend}
              className="sr-only"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CampaignForm({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: CampaignInput;
  onChange: (next: CampaignInput) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const set = <K extends keyof CampaignInput>(key: K, v: CampaignInput[K]) => onChange({ ...value, [key]: v });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <Segmented<Goal>
          legend="Mục tiêu chiến dịch"
          value={value.goal}
          onChange={(v) => set("goal", v)}
          options={(Object.keys(GOALS) as Goal[]).map((g) => ({ value: g, label: GOALS[g] }))}
        />

        <label className="block">
          <span className="mb-1 block text-xs font-semibold">Tên thương hiệu</span>
          <input required maxLength={80} className={input} value={value.brand} onChange={(e) => set("brand", e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold">Ngành hàng (không bắt buộc)</span>
          <input
            maxLength={80}
            className={input}
            value={value.industry}
            onChange={(e) => set("industry", e.target.value)}
            placeholder="Bỏ trống để AI tự suy từ ưu đãi"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold">Nội dung ưu đãi</span>
          <textarea
            required
            rows={5}
            maxLength={1000}
            className={`${input} resize-none`}
            value={value.offer}
            onChange={(e) => set("offer", e.target.value)}
          />
        </label>

        <label className="flex items-center gap-3">
          <input
            type="color"
            className="h-9 w-12 cursor-pointer border border-rule-strong bg-paper p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"
            value={value.brandColor}
            onChange={(e) => set("brandColor", e.target.value)}
          />
          <span className="text-xs">
            <span className="block font-semibold">Màu thương hiệu</span>
            <span className="text-ink-soft">Cho tiêu đề và nút trong email · {value.brandColor.toUpperCase()}</span>
          </span>
        </label>
      </div>

      <div className="border-t border-rule bg-paper p-5">
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center bg-onair text-sm font-semibold text-shell hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Đang viết 3 mẫu…" : "Viết 3 mẫu email"}
        </button>
      </div>
    </form>
  );
}
