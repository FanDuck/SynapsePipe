import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "刚刚";
}

export function formatDate(value: Date | string | number, withTime = false) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\[([^\][\n]{1,48})\]/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1].trim()).filter(Boolean)));
}

export function applyVariables(text: string, values: Record<string, string>) {
  return text.replace(/\[([^\][\n]{1,48})\]/g, (match, key: string) => {
    const value = values[key.trim()];
    return value?.trim() ? value.trim() : match;
  });
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

export function parseTags(value: string) {
  return uniqueStrings(value.split(/[,，]/));
}

export function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

export function getHostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function getExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index + 1).toLowerCase() : "";
}

export function truncate(value: string, length = 120) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function isProbablyUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getInitials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
