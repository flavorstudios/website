import { useId } from "react";

import { Progress } from "@/components/ui/progress";

interface ProgressStatProps {
  label: string;
  current: number;
  total: number;
}

export default function ProgressStat({ label, current, total }: ProgressStatProps) {
  const labelId = useId();
  const descriptionId = useId();
  const value = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span id={labelId} className="text-sm font-medium">
          {label}
        </span>
        <span id={descriptionId} className="text-sm text-gray-600">
          {current}/{total}
        </span>
      </div>
      <Progress
        value={value}
        className="h-2"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
      />
    </div>
  );
}