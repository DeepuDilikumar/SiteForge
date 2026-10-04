/**
 * The address the app is served from. Uses BETTER_AUTH_URL when set; inside GitHub Codespaces it
 * falls back to the forwarded port address, so sign-in works there without extra setup.
 */
export function codespacesUrl(): string | undefined {
  const name = process.env.CODESPACE_NAME;
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (!name || !domain) return undefined;
  return `https://${name}-${process.env.PORT || "3000"}.${domain}`;
}

export function configuredAppUrl(): string | undefined {
  const url = process.env.BETTER_AUTH_URL || codespacesUrl();
  return url ? url.replace(/\/$/, "") : undefined;
}

/** Origins allowed to call the auth endpoints, besides the base URL itself. */
export function trustedOrigins(): string[] {
  const origins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const name = process.env.CODESPACE_NAME;
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (name && domain) origins.push(`https://${name}-*.${domain}`);
  const configured = configuredAppUrl();
  if (configured) origins.push(configured);
  return origins;
}
