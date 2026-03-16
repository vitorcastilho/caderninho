// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DensityProvider, useDensity } from "./DensityProvider";
import type { ReactNode } from "react";

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <DensityProvider>{children}</DensityProvider>;
}

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
});
