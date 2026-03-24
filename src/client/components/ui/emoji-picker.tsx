'use client';

import { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES = [
  {
    label: '🍔',
    name: 'Alimentação',
    emojis: ['🛒', '🍕', '🍔', '🥗', '🍝', '🍣', '☕', '🍺', '🧃', '🍰', '🥐', '🍎'],
  },
  {
    label: '🏠',
    name: 'Moradia',
    emojis: ['🏠', '🔑', '💡', '🛋️', '🧹', '🚿', '🛏️', '🪴', '🔧', '🧊'],
  },
  {
    label: '🚗',
    name: 'Transporte',
    emojis: ['🚗', '⛽', '🚌', '🚲', '✈️', '🚕', '🛵', '🚇', '🛻', '🚂'],
  },
  {
    label: '💊',
    name: 'Saúde',
    emojis: ['💊', '🏥', '🩺', '🧘', '🦷', '👓', '🩹', '💉'],
  },
  {
    label: '🎓',
    name: 'Educação',
    emojis: ['🎓', '📚', '💻', '✏️', '📝', '🎒', '📐', '🧪'],
  },
  {
    label: '🎮',
    name: 'Lazer',
    emojis: ['🎮', '🎬', '🎵', '🏋️', '⚽', '🎭', '🎨', '🏊', '🎳', '🎪'],
  },
  {
    label: '🛍️',
    name: 'Compras',
    emojis: ['👕', '👟', '🛍️', '💄', '📱', '⌚', '👜', '🕶️', '💍', '🎁'],
  },
  {
    label: '💰',
    name: 'Finanças',
    emojis: ['💰', '💳', '🏦', '📊', '💵', '📈', '🧾', '💎'],
  },
  {
    label: '🐶',
    name: 'Pets & Outros',
    emojis: ['🐶', '🐱', '🐾', '📦', '🏢', '👶', '💒', '🎂', '📰', '🔔'],
  },
] as const;

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white text-xl transition-colors hover:border-indigo-400 hover:bg-indigo-50"
      >
        {value}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 w-[272px] rounded-lg border border-stone-200 bg-white shadow-lg">
          {/* Tabs de categoria */}
          <div className="flex gap-0.5 border-b border-stone-100 px-1.5 py-1.5">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveTab(i)}
                title={cat.name}
                className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
                  activeTab === i
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Nome da categoria */}
          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              {EMOJI_CATEGORIES[activeTab].name}
            </span>
          </div>

          {/* Grid de emojis */}
          <div className="grid grid-cols-8 gap-0.5 px-1.5 pb-2">
            {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded text-lg transition-colors hover:bg-indigo-50 ${
                  value === emoji ? 'bg-indigo-100 ring-1 ring-indigo-300' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
