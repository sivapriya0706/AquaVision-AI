// AquaVision AI - Centralized API Configuration
// When deployed as a single-host app (Express serving React dist), API_BASE_URL defaults to ""
// When deployed as separate services, set VITE_API_BASE_URL in your hosting environment (e.g. https://your-backend.onrender.com)

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function getApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export default {
  API_BASE_URL,
  getApiUrl,
};
