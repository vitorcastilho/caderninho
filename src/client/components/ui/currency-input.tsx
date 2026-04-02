'use client';

import { useState, useEffect } from 'react';
import { centsToDisplayValue, displayValueToCents } from '@/client/utils/currency-input';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';

interface CurrencyInputProps {
  value: number;
  onChange: (cents: number) => void;
  label: string;
  placeholder?: string;
  error?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = 'R$ 0,00',
  error,
  id,
  disabled,
  className,
  labelClassName,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => centsToDisplayValue(value));

  useEffect(() => {
    setDisplayValue(centsToDisplayValue(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    setDisplayValue(centsToDisplayValue(cents));
    onChange(cents);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClassName}>{label}</Label>
      <Input
        id={id}
        value={`R$ ${displayValue}`}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
        disabled={disabled}
        aria-invalid={!!error}
        className={className}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
