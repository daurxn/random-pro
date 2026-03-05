import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create → Creating Button.tsx", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/Button.tsx" })).toBe("Creating Button.tsx");
});

test("str_replace_editor str_replace → Editing App.tsx", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" })).toBe("Editing App.tsx");
});

test("str_replace_editor insert → Editing index.tsx", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/src/index.tsx" })).toBe("Editing index.tsx");
});

test("str_replace_editor view → Viewing config.ts", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/src/config.ts" })).toBe("Viewing config.ts");
});

test("str_replace_editor undo_edit → Undoing edit to util.ts", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/src/util.ts" })).toBe("Undoing edit to util.ts");
});

test("file_manager rename → Renaming old.tsx to new.tsx", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/src/old.tsx", new_path: "/src/new.tsx" })).toBe("Renaming old.tsx to new.tsx");
});

test("file_manager delete → Deleting App.tsx", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/src/App.tsx" })).toBe("Deleting App.tsx");
});

test("unknown tool → capitalized fallback", () => {
  expect(getToolLabel("my_custom_tool", {})).toBe("My Custom Tool");
});

test("state !== result → shows spinner", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/Button.tsx" }} state="call" />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("state === result → shows green dot, no spinner", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/Button.tsx" }} state="result" />
  );
  expect(container.querySelector(".animate-spin")).toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});
