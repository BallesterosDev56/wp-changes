import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.wordpress.css';
import '../../translations/I18n';
import WordpressWidgetWrapper from '../../components/WordpressWidgetWrapper';
import { PhoneNumberUtil } from 'google-libphonenumber';

import '../types/WizybotWindow';

const phoneUtil = PhoneNumberUtil.getInstance();

const isValidPhone = (phone: string, countryCode: string): boolean => {
  try {
    const parsed = phoneUtil.parseAndKeepRawInput(phone, countryCode || 'CO');
    return phoneUtil.isValidNumber(parsed);
  } catch {
    return false;
  }
};

// Append wizybot to the body
const dataDiv = document.createElement('div');
dataDiv.id = 'wizydiv';
document.body.appendChild(dataDiv);

const data = window.wizybot;

console.log('data: ', data);

const root = ReactDOM.createRoot(dataDiv);

root.render(
  <WordpressWidgetWrapper
    isTest={false}
    isAdmin={false}
    isRelative={false}
    isDashboard={false}
    domain={data?.shopDomain || ''}
    globalSelectedBackend={data?.globalSelectedBackend || ''}
    chatProfileImage={data?.chatProfileImage || ''}
    curvyBorderImage={data?.curvyBorderImage || ''}
    wizyLogoImage={data?.wizyLogoImage || ''}
    noImageImage={data?.noImageImage || ''}
    widgetLoader={data?.widgetLoader || ''}
    stylesPathOutter={data?.stylesPathOutter || ''}
    stylesPathInner={data?.stylesPathInner || ''}
    shopifyRootPath={data?.shopifyRootPath || ''}
    shopifyCurrentPath={data?.shopifyCurrentPath || ''}
    isShopifyForeing={data?.isShopifyForeing === 'true' ? true : false || false}
    marketId={data?.marketId || ''}
    languageCode={data?.languageCode || ''}
    languageUrl={data?.languageUrl || ''}
    platform="WORDPRESS"
    wizyCartId={data?.wizyCartId || ''}
  />,
);

// ── Abandoned checkout capture ──────────────────────────────────────────────
// Runs in parent page context (not inside iframe) so it has full DOM access.
// Supports both classic and block-based WooCommerce checkout.
if (data?.globalSelectedBackend && data?.shopDomain) {
  let alreadySent = false;
  let lastPhone = '';
  let lastEmail = '';

  // ── Block checkout: intercept WooCommerce Store API fetch calls ──────────
  // Block checkout sends a batch request: POST /wc/store/v1/batch
  // with body { requests: [{ path: "/wc/store/v1/cart/update-customer", body: {...} }] }
  const originalFetch = window.fetch.bind(window);

  // Read cart items without making any HTTP request to avoid session collisions.
  // Priority: Blocks wp.data store (most up-to-date) → PHP-injected wizyCartItems (Classic fallback).
  const getCartItems = (): {
    id: number;
    name: string;
    quantity: number;
    price: string;
    image?: string;
  }[] => {
    // Blocks checkout: wp.data has the live cart state
    try {
      const cartData = (window as any).wp?.data
        ?.select('wc/store/cart')
        ?.getCartData?.();
      if (cartData?.items?.length) {
        return cartData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.prices?.price ?? '0',
          image: item.images?.[0]?.src ?? undefined,
        }));
      }
    } catch {}

    // Classic checkout: items injected by PHP via WC()->cart at page load
    if (Array.isArray(data?.wizyCartItems) && data.wizyCartItems.length) {
      return data.wizyCartItems;
    }

    return [];
  };

  const sendAbandonedCheckout = async (fields: {
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  }) => {
    console.log('Attempting to send abandoned checkout data:', fields);
    console.log(lastPhone, lastEmail, alreadySent);
    if (!fields.phone || !fields.email) return;
    if (!isValidPhone(fields.phone, fields.country || '')) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return;
    if (alreadySent && fields.phone === lastPhone && fields.email === lastEmail)
      return;

    console.log('Sending abandoned checkout data to backend:', fields);

    alreadySent = true;
    lastPhone = fields.phone;
    lastEmail = fields.email;

    try {
      const items = getCartItems();
      const clientCookieKey = `WIZY_CLIENT_${data.shopDomain}`.replace(
        /\./g,
        '_',
      );
      const clientId = document.cookie
        .split('; ')
        .find((row) => row.startsWith(clientCookieKey + '='))
        ?.split('=')[1];
      await originalFetch(
        `${data.globalSelectedBackend}/webhooks/wordpress/abandoned-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...fields,
            cartId: data.wizyCartId || '',
            shopDomain: data.shopDomain || '',
            clientId: clientId || undefined,
            checkoutUrl: data.checkoutUrl || undefined,
            items,
          }),
        },
      );
    } catch (e) {
      console.error('Wizybot - abandoned checkout error:', e);
    }
  };

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const response = await originalFetch(...args);

    try {
      const init = args[1];
      if (init?.body) {
        const body = JSON.parse(init.body as string);

        // Batch format: { requests: [...] }
        const requests: any[] = body?.requests ?? [];
        const updateCustomer = requests.find((r: any) =>
          r.path?.includes('/wc/store/v1/cart/update-customer'),
        );

        if (updateCustomer) {
          const billing =
            updateCustomer.body?.billing_address ??
            updateCustomer.data?.billing_address ??
            {};
          if (billing.phone && billing.email) {
            sendAbandonedCheckout({
              phone: billing.phone,
              firstName: billing.first_name,
              lastName: billing.last_name,
              email: billing.email,
              city: billing.city,
              country: billing.country,
              zipCode: billing.postcode,
            });
          }
        }
      }
    } catch (_) {
      // never break the original fetch
    }

    return response;
  };

  // ── Classic checkout: listen to blur on billing fields ───────────────────
  const getVal = (id: string): string =>
    (document.getElementById(id) as HTMLInputElement | null)?.value?.trim() ||
    '';

  const sendFromClassicFields = () => {
    const phone = getVal('billing_phone');
    const email = getVal('billing_email');
    if (!phone || !email) return;
    sendAbandonedCheckout({
      phone,
      firstName: getVal('billing_first_name'),
      lastName: getVal('billing_last_name'),
      email,
      city: getVal('billing_city'),
      country: getVal('billing_country'),
      zipCode: getVal('billing_postcode'),
    });
  };

  const attachClassicListeners = () => {
    const phoneField = document.getElementById('billing_phone');
    const emailField = document.getElementById('billing_email');
    if (phoneField) phoneField.addEventListener('blur', sendFromClassicFields);
    if (emailField) emailField.addEventListener('blur', sendFromClassicFields);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachClassicListeners);
  } else {
    attachClassicListeners();
  }
}
