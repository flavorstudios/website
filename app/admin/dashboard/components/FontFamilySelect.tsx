"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fonts = [
  { label: "Inter", value: "var(--font-inter)" },
  { label: "Lora", value: "var(--font-lora)" },
  { label: "Roboto", value: "var(--font-roboto)" },
  { label: "Noto Serif", value: "var(--font-noto-serif)" },
  { label: "JetBrains Mono", value: "var(--font-jetbrains)" },
];

interface FontFamilySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Font" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Default</SelectItem>
        {fonts.map((f) => (
          <SelectItem key={f.value} value={f.value}>
            <span style={{ fontFamily: f.value }}>{f.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}