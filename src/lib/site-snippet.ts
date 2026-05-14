/** Install script host for Nexa People personal sites (matches add-site wizard convention). */
export const PERSONAL_SITE_SCRIPT_SRC = "https://nexapeople.ciright.com/js/script.js";

export function buildPersonalSiteInstallSnippet(domain: string): string {
  const host = domain.trim();
  return `<script defer data-domain="${host}" src="${PERSONAL_SITE_SCRIPT_SRC}"></script>`;
}
