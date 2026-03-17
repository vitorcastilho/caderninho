// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { createLocalStorageStore } from "./create-local-storage-store";
import { createLocalStorageMock } from "@/client/test-utils/local-storage-mock";

describe("createLocalStorageStore", () => {
  let storageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    storageMock = createLocalStorageMock();
    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve retornar defaultValue quando localStorage esta vazio", () => {
    const store = createLocalStorageStore("test-key", false, (s) => s === "true");

    const { result } = renderHook(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
    );
    expect(result.current).toBe(false);
  });

  it("deve retornar valor parseado do localStorage", () => {
    storageMock.setItem("test-key", "true");
    const store = createLocalStorageStore("test-key", false, (s) => s === "true");

    const { result } = renderHook(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
    );
    expect(result.current).toBe(true);
  });

  it("deve retornar defaultValue do getServerSnapshot", () => {
    const store = createLocalStorageStore("test-key", "spacious", (s) =>
      s === "compact" || s === "spacious" ? s : "spacious"
    );
    expect(store.getServerSnapshot()).toBe("spacious");
  });

  it("deve persistir valor no localStorage via setValue", () => {
    const store = createLocalStorageStore("test-key", false, (s) => s === "true");

    store.setValue(true);
    expect(storageMock.getItem("test-key")).toBe("true");
  });

  it("deve notificar subscribers apos setValue", () => {
    const store = createLocalStorageStore("test-key", false, (s) => s === "true");
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    store.setValue(true);

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("deve funcionar com tipos string enum", () => {
    storageMock.setItem("mode", "compact");
    const store = createLocalStorageStore("mode", "spacious" as string, (s) =>
      s === "compact" || s === "spacious" ? s : "spacious"
    );

    expect(store.getSnapshot()).toBe("compact");

    store.setValue("spacious");
    expect(storageMock.getItem("mode")).toBe("spacious");
    expect(store.getSnapshot()).toBe("spacious");
  });

  it("deve remover listener no unsubscribe", () => {
    const store = createLocalStorageStore("test-key", false, (s) => s === "true");
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setValue(true);

    expect(listener).not.toHaveBeenCalled();
  });

  it("deve ignorar storage events de outras keys", () => {
    const store = createLocalStorageStore("my-key", false, (s) => s === "true");
    const listener = vi.fn();

    store.subscribe(listener);

    // Simulate storage event from another key
    const event = new StorageEvent("storage", { key: "other-key" });
    window.dispatchEvent(event);

    expect(listener).not.toHaveBeenCalled();
  });

  it("deve reagir a storage events da mesma key", () => {
    const store = createLocalStorageStore("my-key", false, (s) => s === "true");
    const listener = vi.fn();

    store.subscribe(listener);

    // Simulate storage event from same key
    const event = new StorageEvent("storage", { key: "my-key" });
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalledOnce();
  });

  it("deve retornar snapshot cacheado quando raw string nao mudou", () => {
    storageMock.setItem("cache-key", "true");
    const parseFn = vi.fn((s: string | null) => s === "true");
    const store = createLocalStorageStore("cache-key", false, parseFn);

    // Primeira chamada: parse é chamado
    const snap1 = store.getSnapshot();
    expect(snap1).toBe(true);
    expect(parseFn).toHaveBeenCalledTimes(1);

    // Segunda chamada: raw string igual, parse NAO é chamado novamente
    const snap2 = store.getSnapshot();
    expect(snap2).toBe(true);
    expect(parseFn).toHaveBeenCalledTimes(1);
  });

  it("deve atualizar snapshot cacheado apos setValue sem re-parse", () => {
    const parseFn = vi.fn((s: string | null) => s === "true");
    const store = createLocalStorageStore("cache-key", false, parseFn);

    // Primeira leitura: parse chamado com null
    expect(store.getSnapshot()).toBe(false);
    expect(parseFn).toHaveBeenCalledTimes(1);

    // setValue atualiza cache diretamente
    store.setValue(true);

    // getSnapshot retorna valor do cache sem chamar parse novamente
    expect(store.getSnapshot()).toBe(true);
    expect(parseFn).toHaveBeenCalledTimes(1);
  });
});
