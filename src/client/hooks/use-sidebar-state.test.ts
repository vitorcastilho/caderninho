// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useSidebarState } from "@/client/hooks/use-sidebar-state";

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

describe("useSidebarState", () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    storageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve iniciar expandido por padrao", () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(false);
  });

  it("deve alternar para colapsado ao chamar toggle", () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
  });

  it("deve alternar de volta para expandido ao chamar toggle duas vezes", () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(false);
  });

  it("deve persistir estado colapsado no localStorage", () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.toggle();
    });

    expect(storageMock.getItem("sidebar-collapsed")).toBe("true");
  });

  it("deve restaurar estado colapsado do localStorage", () => {
    storageMock.setItem("sidebar-collapsed", "true");

    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(true);
  });

  it("deve restaurar estado expandido do localStorage", () => {
    storageMock.setItem("sidebar-collapsed", "false");

    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(false);
  });

  it("deve permitir setar estado diretamente via setCollapsed", () => {
    const { result } = renderHook(() => useSidebarState());

    act(() => {
      result.current.setCollapsed(true);
    });

    expect(result.current.collapsed).toBe(true);
    expect(storageMock.getItem("sidebar-collapsed")).toBe("true");
  });
});
