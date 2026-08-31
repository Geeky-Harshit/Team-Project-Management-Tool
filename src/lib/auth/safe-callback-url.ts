export const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
): string {
  if (!callbackUrl) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const decodedUrl = decodeURIComponent(callbackUrl);
    const isInternalPath =
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.includes("\\") &&
      !decodedUrl.startsWith("//") &&
      !decodedUrl.includes("\\") &&
      !/[\u0000-\u001f\u007f]/.test(decodedUrl);

    if (!isInternalPath) {
      return DEFAULT_AUTH_REDIRECT;
    }

    const baseUrl = "https://local.invalid";
    const parsedUrl = new URL(callbackUrl, baseUrl);

    return parsedUrl.origin === baseUrl
      ? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
      : DEFAULT_AUTH_REDIRECT;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}
