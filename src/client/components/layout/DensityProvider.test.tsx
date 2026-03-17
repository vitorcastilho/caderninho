// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DensityProvider, useDensity } from "./DensityProvider";
import type { ReactNode } from "react";
import { createLocalStorageMock } from "@/client/test-utils/local-storage-mock";

function wrapper({ children }: { children: ReactNode }) {
  return <DensityProvider>{children}</DensityProvider>;
}

describe("useDensity fora do Provider", () => {
  it("deve lancar erro quando usado fora do DensityProvider", () => {
    expect(() => renderHook(() => useDensity())).toThrow(
      "useDensity deve ser usado dentro de um DensityProvider"
    );
  });
});

describe("DensityProvider", () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    storageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", storageMock);
    // Reset the body data-density attribute
    document.body.removeAttribute("data-density");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve iniciar com modo 'spacious' por padrao", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });
    expect(result.current.density).toBe("spacious");
  });

  it("deve alternar para modo 'compact'", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });

    act(() => {
      result.current.setDensity("compact");
    });

    expect(result.current.density).toBe("compact");
  });

  it("deve persistir preferencia no localStorage", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });

    act(() => {
      result.current.setDensity("compact");
    });

    expect(storageMock.getItem("density-mode")).toBe("compact");
  });

  it("deve restaurar preferencia do localStorage", () => {
    storageMock.setItem("density-mode", "compact");

    const { result } = renderHook(() => useDensity(), { wrapper });
    expect(result.current.density).toBe("compact");
  });

  it("deve ter funcao toggle que alterna entre modos", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });

    act(() => {
      result.current.toggleDensity();
    });
    expect(result.current.density).toBe("compact");

    act(() => {
      result.current.toggleDensity();
    });
    expect(result.current.density).toBe("spacious");
  });

  it("deve atualizar data-density no document.body ao mudar modo", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });

    // Default spacious
    expect(document.body.getAttribute("data-density")).toBe("spacious");

    act(() => {
      result.current.setDensity("compact");
    });

    expect(document.body.getAttribute("data-density")).toBe("compact");

    act(() => {
      result.current.setDensity("spacious");
    });

    expect(document.body.getAttribute("data-density")).toBe("spacious");
  });
});
