/**
 * Badge visual inline de logo de banco brasileiro.
 * Segue o padrão do CreditCardBrandBadge — badge com cor institucional + sigla estilizada.
 * Fallback para bancos desconhecidos: iniciais em fundo neutro.
 */

interface BankConfig {
  color: string;
  bgColor: string;
  label: string;
}

const BANK_MAP: Record<string, BankConfig> = {
  nubank: { color: '#FFFFFF', bgColor: '#820AD1', label: 'Nu' },
  itau: { color: '#FFFFFF', bgColor: '#003399', label: 'Itaú' },
  itaú: { color: '#FFFFFF', bgColor: '#003399', label: 'Itaú' },
  bradesco: { color: '#FFFFFF', bgColor: '#CC092F', label: 'Brad' },
  'banco do brasil': { color: '#003882', bgColor: '#FFFF00', label: 'BB' },
  bb: { color: '#003882', bgColor: '#FFFF00', label: 'BB' },
  santander: { color: '#FFFFFF', bgColor: '#CC0000', label: 'San' },
  inter: { color: '#FFFFFF', bgColor: '#FF7A00', label: 'Inter' },
  c6: { color: '#FFFFFF', bgColor: '#242424', label: 'C6' },
  'c6 bank': { color: '#FFFFFF', bgColor: '#242424', label: 'C6' },
  caixa: { color: '#FFFFFF', bgColor: '#005CA9', label: 'CEF' },
  'caixa economica': { color: '#FFFFFF', bgColor: '#005CA9', label: 'CEF' },
  'caixa econômica': { color: '#FFFFFF', bgColor: '#005CA9', label: 'CEF' },
  sicoob: { color: '#FFFFFF', bgColor: '#003641', label: 'Sic' },
  sicredi: { color: '#FFFFFF', bgColor: '#33A02C', label: 'Sicr' },
  original: { color: '#FFFFFF', bgColor: '#006400', label: 'Orig' },
  btg: { color: '#FFFFFF', bgColor: '#091D42', label: 'BTG' },
  'btg pactual': { color: '#FFFFFF', bgColor: '#091D42', label: 'BTG' },
  safra: { color: '#FFFFFF', bgColor: '#003366', label: 'Safra' },
  pagbank: { color: '#FFFFFF', bgColor: '#00A868', label: 'Pag' },
  pagseguro: { color: '#FFFFFF', bgColor: '#00A868', label: 'Pag' },
  neon: { color: '#FFFFFF', bgColor: '#0066FF', label: 'Neon' },
  next: { color: '#FFFFFF', bgColor: '#00E676', label: 'Next' },
  'mercado pago': { color: '#FFFFFF', bgColor: '#009EE3', label: 'MP' },
  picpay: { color: '#FFFFFF', bgColor: '#21C25E', label: 'Pic' },
};

export function resolveBankIdentity(bankName: string): BankConfig {
  const lower = bankName.toLowerCase().trim();

  // Exact match first
  if (BANK_MAP[lower]) return BANK_MAP[lower];

  // Partial match
  for (const [key, config] of Object.entries(BANK_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return config;
  }

  // Fallback: initials on neutral background
  const initials = bankName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return { color: 'hsl(var(--muted-foreground))', bgColor: 'hsl(var(--muted))', label: initials || '?' };
}

const SIZE_MAP = {
  sm: { width: 24, height: 24, fontSize: '8px' },
  md: { width: 32, height: 32, fontSize: '10px' },
  lg: { width: 40, height: 40, fontSize: '12px' },
} as const;

interface BankLogoProps {
  bank: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BankLogo({ bank, size = 'md' }: BankLogoProps) {
  const config = resolveBankIdentity(bank);
  const dimensions = SIZE_MAP[size];

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-black/[0.06]"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: config.bgColor,
      }}
    >
      <span
        className="font-bold leading-none"
        style={{ color: config.color, fontSize: dimensions.fontSize }}
      >
        {config.label}
      </span>
    </span>
  );
}
