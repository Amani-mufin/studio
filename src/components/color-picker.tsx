'use client';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('grid gap-2', className)}>
      <Label>{label}</Label>
      <div className="relative">
        <button
          type="button"
          className="w-full h-10 rounded-md border border-input flex items-center px-3"
          onClick={() => inputRef.current?.click()}
        >
          <div
            className="w-6 h-6 rounded-sm border"
            style={{ backgroundColor: value }}
          />
          <span className="ml-2">{value}</span>
        </button>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute top-0 left-0 w-0 h-0 opacity-0"
        />
      </div>
    </div>
  );
}
