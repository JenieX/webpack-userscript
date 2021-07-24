import { URL } from 'url';

export function interpolate(
  tpl: string,
  info: Record<string, unknown>,
): string {
  return tpl.replace(
    /(\\?)(\[([a-zA-Z]+)\])/g,
    (_, escaped: string, match: string, token: string) =>
      !escaped && token in info ? String(info[token]) : match,
  );
}

export function resolveUrl(url: string, baseUrl?: string): string {
  return new URL(url, baseUrl).toString();
}
