"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = (args.path as string | undefined) ?? "";
    const file = basename(path);
    switch (command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Viewing ${file}`;
      case "undo_edit":
        return `Undoing edit to ${file}`;
      default:
        return `Working on ${file}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = (args.path as string | undefined) ?? "";
    const newPath = (args.new_path as string | undefined) ?? "";
    switch (command) {
      case "rename":
        return `Renaming ${basename(path)} to ${basename(newPath)}`;
      case "delete":
        return `Deleting ${basename(path)}`;
    }
  }

  // Fallback: capitalize and replace underscores/hyphens with spaces
  return toolName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getToolLabel(toolName, args);
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {state === "result" ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
