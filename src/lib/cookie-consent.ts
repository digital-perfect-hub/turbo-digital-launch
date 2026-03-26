export const COOKIE_CONSENT_STORAGE_KEY = "dp.cookieConsent.v1";
export const COOKIE_CONSENT_EVENT = "dp:cookie-consent-changed";
export const COOKIE_SETTINGS_OPEN_EVENT = "dp:cookie-settings-open";


export type CookieConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
};

export const createConsentState = (
  values?: Partial<Pick<CookieConsentState, "analytics" | "marketing">>,
): CookieConsentState => ({
  essential: true,
  analytics: Boolean(values?.analytics),
  marketing: Boolean(values?.marketing),
  updatedAt: new Date().toISOString(),
  version: 1,
});

export const readCookieConsent = (): CookieConsentState | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed?.essential !== true || parsed?.version !== 1) return null;

    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      version: 1,
    };
  } catch {
    return null;
  }
};

export const writeCookieConsent = (state: CookieConsentState) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: state }));
  } catch {
    // noop
  }
};

export const clearCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
  } catch {
    // noop
  }
};

export const hasTrackingConsent = (state: CookieConsentState | null) =>
  Boolean(state?.analytics || state?.marketing);

export const openCookieSettings = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_OPEN_EVENT));
};
