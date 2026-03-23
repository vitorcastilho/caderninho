/**
 * Badge visual inline de bandeira de cartão de crédito.
 * Segue o padrão `.method-brand` do protótipo proto-12-credit-card.html.
 *
 * Regra do projeto: sempre que apresentar um cartão, a bandeira deve estar visível.
 */

interface BrandConfig {
  bg: string;
  color: string;
  label: string;
  type: 'text' | 'mastercard';
}

const BRAND_MAP: Record<string, BrandConfig> = {
  visa: { bg: '#1A1F71', color: '#FFFFFF', label: 'VISA', type: 'text' },
  master: { bg: '#252525', color: '', label: '', type: 'mastercard' },
  mastercard: { bg: '#252525', color: '', label: '', type: 'mastercard' },
  elo: { bg: '#00A4E0', color: '#FFFFFF', label: 'elo', type: 'text' },
  amex: { bg: '#006FCF', color: '#FFFFFF', label: 'AMEX', type: 'text' },
  hipercard: { bg: '#822124', color: '#FFFFFF', label: 'HIPER', type: 'text' },
};

function resolveBrand(brand: string): BrandConfig {
  const lower = brand.toLowerCase();
  for (const [key, config] of Object.entries(BRAND_MAP)) {
    if (lower.includes(key)) return config;
  }
  return { bg: '#6B7280', color: '#FFFFFF', label: brand.slice(0, 3).toUpperCase(), type: 'text' };
}

interface CreditCardBrandBadgeProps {
  brand: string;
}

export function CreditCardBrandBadge({ brand }: CreditCardBrandBadgeProps) {
  const config = resolveBrand(brand);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-[3px] border border-black/[0.06]"
      style={{ width: 26, height: 16, background: config.bg }}
    >
      {config.type === 'mastercard' ? (
        <>
          <span
            className="absolute size-3 rounded-full"
            style={{ background: '#EB001B', left: 4 }}
          />
          <span
            className="absolute size-3 rounded-full"
            style={{ background: '#F79E1B', right: 4 }}
          />
        </>
      ) : (
        <span
          className="text-[7px] font-extrabold italic leading-none"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </span>
  );
}
