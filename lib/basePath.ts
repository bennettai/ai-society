export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Returns path prefixed with basePath if running under a subpath (e.g. GitHub Pages /ai-society).
 */
export function assetPath(path: string): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}
