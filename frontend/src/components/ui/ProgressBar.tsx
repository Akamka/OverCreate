'use client';

export default function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
      <div className="h-2 bg-black" style={{ width: `${v}%` }} />
    </div>
  );
}
