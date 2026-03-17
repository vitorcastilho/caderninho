import { cn } from "@/client/utils/utils";

describe("cn (className utility)", () => {
  it("deve combinar classes simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deve lidar com valores condicionais", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deve mesclar classes Tailwind conflitantes (tailwind-merge)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("deve lidar com undefined e null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("deve aceitar objetos condicionais (clsx)", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("deve aceitar arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("deve retornar string vazia sem argumentos", () => {
    expect(cn()).toBe("");
  });
});
