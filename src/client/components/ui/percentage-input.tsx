'use client';

import { useState, useEffect } from 'react';
import { basisPointsToDisplayValue, displayValueToBasisPoints } from '@/client/utils/percentage-input';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';

interface PercentageInputProps {
  value: number;
  onChange: (basisPoints: number) => void;
  label: string;
  placeholder?: string;
  error?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export function PercentageInput({
  value,
  onChange,
  label,
  placeholder = '0,00',
  error,
  id,
  disabled,
  className,
  labelClassName,
}: PercentageInputProps) {
  const [displayValue, setDisplayValue] = useState(() => basisPointsToDisplayValue(value));

  useEffect(() => {
    setDisplayValue(basisPointsToDisplayValue(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    const bp = parseInt(digits || '0', 10);
    setDisplayValue(basisPointsToDisplayValue(bp));
    onChange(bp);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClassName}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode="numeric"
          disabled={disabled}
          aria-invalid={!!error}
          className={`pr-8 ${className ?? ''}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          %
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
