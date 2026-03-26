import { useEffect, useMemo, useState } from "react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import {
  COOKIE_CONSENT_EVENT,
  hasTrackingConsent,
  readCookieConsent,
  type CookieConsentState,
} from "@/lib/cookie-consent";

const HEAD_SELECTOR = '[data-consent-managed="head"]';
const BODY_SELECTOR = '[data-consent-managed="body"]';

const removeManagedNodes = () => {
  document.head.querySelectorAll(HEAD_SELECTOR).forEach((node) => node.remove());
  document.body.querySelectorAll(BODY_SELECTOR).forEach((node) => node.remove());
};

const cloneExecutableNode = (node: ChildNode, target: "head" | "body") => {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || "");
  }

  if (!(node instanceof HTMLElement)) {
    return node.cloneNode(true);
  }

  if (node.tagName === "SCRIPT") {
    const script = document.createElement("script");
    Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
    script.text = node.textContent || "";
    script.dataset.consentManaged = target;
    return script;
  }

  const clone = node.cloneNode(true) as HTMLElement;
  clone.dataset.consentManaged = target;
  return clone;
};

const injectMarkup = (markup: string, target: "head" | "body") => {
  if (!markup.trim()) return;

  const template = document.createElement("template");
  template.innerHTML = markup.trim();

  Array.from(template.content.childNodes).forEach((node) => {
    const preparedNode = cloneExecutableNode(node, target);

    if (preparedNode instanceof HTMLElement && !preparedNode.dataset.consentManaged) {
      preparedNode.dataset.consentManaged = target;
    }

    if (target === "head") {
      document.head.appendChild(preparedNode);
      return;
    }

    document.body.appendChild(preparedNode);
  });
};

const ConsentScriptGate = () => {
  const { rawSettings } = useGlobalTheme();
  const [consent, setConsent] = useState<CookieConsentState | null>(() => readCookieConsent());

  useEffect(() => {
    const syncConsent = () => {
      setConsent(readCookieConsent());
    };

    syncConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    window.addEventListener("storage", syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  const trackingHeadCode = useMemo(() => {
    return typeof rawSettings?.tracking_head_code === "string" ? rawSettings.tracking_head_code : "";
  }, [rawSettings]);

  const trackingBodyCode = useMemo(() => {
    return typeof rawSettings?.tracking_body_code === "string" ? rawSettings.tracking_body_code : "";
  }, [rawSettings]);

  useEffect(() => {
    removeManagedNodes();

    if (!hasTrackingConsent(consent)) return;
    if (!trackingHeadCode.trim() && !trackingBodyCode.trim()) return;

    injectMarkup(trackingHeadCode, "head");
    injectMarkup(trackingBodyCode, "body");

    return removeManagedNodes;
  }, [consent, trackingBodyCode, trackingHeadCode]);

  return null;
};

export default ConsentScriptGate;
