// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom/vitest";

import { BankLogo, resolveBankIdentity } from './bank-logo';

describe('resolveBankIdentity', () => {
  it('should resolve known banks (exact match)', () => {
    expect(resolveBankIdentity('Nubank')).toMatchObject({ label: 'Nu', bgColor: '#820AD1' });
    expect(resolveBankIdentity('Itaú')).toMatchObject({ label: 'Itaú', bgColor: '#003399' });
    expect(resolveBankIdentity('Bradesco')).toMatchObject({ label: 'Brad', bgColor: '#CC092F' });
    expect(resolveBankIdentity('Santander')).toMatchObject({ label: 'San', bgColor: '#CC0000' });
    expect(resolveBankIdentity('Inter')).toMatchObject({ label: 'Inter', bgColor: '#FF7A00' });
    expect(resolveBankIdentity('C6 Bank')).toMatchObject({ label: 'C6', bgColor: '#242424' });
    expect(resolveBankIdentity('Caixa')).toMatchObject({ label: 'CEF', bgColor: '#005CA9' });
    expect(resolveBankIdentity('BB')).toMatchObject({ label: 'BB', bgColor: '#FFFF00' });
  });

  it('should resolve known banks (partial match)', () => {
    expect(resolveBankIdentity('Banco Nubank')).toMatchObject({ label: 'Nu' });
    expect(resolveBankIdentity('Banco Bradesco S.A.')).toMatchObject({ label: 'Brad' });
    expect(resolveBankIdentity('Banco Santander Brasil')).toMatchObject({ label: 'San' });
  });

  it('should be case-insensitive', () => {
    expect(resolveBankIdentity('NUBANK')).toMatchObject({ label: 'Nu' });
    expect(resolveBankIdentity('itaú')).toMatchObject({ label: 'Itaú' });
    expect(resolveBankIdentity('BRADESCO')).toMatchObject({ label: 'Brad' });
  });

  it('should return fallback for unknown banks', () => {
    const result = resolveBankIdentity('Banco XYZ');
    expect(result.label).toBe('BX');
  });

  it('should return fallback initials from single word', () => {
    const result = resolveBankIdentity('Desconhecido');
    expect(result.label).toBe('D');
  });

  it('should return fallback for empty string', () => {
    const result = resolveBankIdentity('');
    expect(result.label).toBe('?');
    expect(result.bgColor).toBe('hsl(var(--muted))');
  });

  it('should return fallback for whitespace-only string', () => {
    const result = resolveBankIdentity('   ');
    expect(result.label).toBe('?');
  });
});

describe('BankLogo', () => {
  it('should render known bank with correct label', () => {
    render(<BankLogo bank="Nubank" />);
    expect(screen.getByText('Nu')).toBeInTheDocument();
  });

  it('should render known bank with correct background color', () => {
    const { container } = render(<BankLogo bank="Itaú" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.background).toBe('rgb(0, 51, 153)');
  });

  it('should render fallback for unknown bank', () => {
    render(<BankLogo bank="Banco Teste" />);
    expect(screen.getByText('BT')).toBeInTheDocument();
  });

  it('should render sm size', () => {
    const { container } = render(<BankLogo bank="Nubank" size="sm" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.width).toBe('24px');
    expect(badge.style.height).toBe('24px');
  });

  it('should render md size (default)', () => {
    const { container } = render(<BankLogo bank="Nubank" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.width).toBe('32px');
    expect(badge.style.height).toBe('32px');
  });

  it('should render lg size', () => {
    const { container } = render(<BankLogo bank="Nubank" size="lg" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.width).toBe('40px');
    expect(badge.style.height).toBe('40px');
  });
});
