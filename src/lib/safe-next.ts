// Never redirect to another origin or to protocol-relative URLs from ?next=.
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value) || value.startsWith("/login")) return "/board";
  return value;
}
