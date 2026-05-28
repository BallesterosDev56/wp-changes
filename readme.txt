=== Wizybot ===
Contributors: wizybot
Donate link: https://wizybot.com
Tags: woocommerce, chatbot, chat, sales, automation
Requires at least: 5.2
Tested up to: 7.0
Stable tag: 1.0.0
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Integrate Wizybot's intelligent customer engagement platform with your WordPress WooCommerce store.

== Description ==

Wizybot is a powerful customer engagement and sales platform designed for WooCommerce stores. This plugin integrates Wizybot's chatbot and customer communication tools directly into your WordPress site, enabling you to engage customers, recover abandoned carts, and drive more sales.

**Key Features:**

* Intelligent chatbot widget for customer engagement
* Abandoned cart recovery and conversion
* Customer interaction tracking and analytics
* Sales attribution and order tracking
* WhatsApp and SMS messaging capabilities
* WooCommerce integration with persistent cart tracking
* Centralized admin dashboard within WordPress
* Real-time customer communication

**Requirements:**

* WordPress 5.2 or higher
* PHP 7.2 or higher
* WooCommerce plugin (for full ecommerce features)
* Active Wizybot account or plan

By installing this plugin, you consent to share store information and customer interaction data with Wizybot. See the Privacy section below.

== Installation ==

1. Upload the wizybot folder to `/wp-content/plugins/` directory
2. Activate the plugin through the WordPress Plugins menu
3. Navigate to the Wizybot menu in WordPress admin
4. Complete setup by authenticating with your Wizybot account
5. Verify the chat widget appears on your store frontend

== Frequently Asked Questions ==

= Do I need a Wizybot account? =

Yes. You need an active Wizybot account (subscription or paid plan) to use this plugin. Visit [wizybot.com](https://wizybot.com) to create your account. Wizybot is a Software-as-a-Service (SaaS) platform that requires a valid subscription.

= Is this plugin free? =

The plugin code is free and open-source (GPL v2). However, accessing Wizybot's services requires an active paid subscription or plan with Wizybot Inc. You pay for access to the cloud service, not for the plugin code.

= What subscription plans are available? =

Visit [wizybot.com](https://wizybot.com) for current plan details, pricing, and features.

= Can I modify or redistribute the plugin? =

Yes, you can modify the plugin code under the GPL v2 license. However, the Wizybot cloud service itself is proprietary and subject to Wizybot's Terms of Service. You cannot:
- Modify, reverse engineer, or copy the Wizybot backend service
- Redistribute your Wizybot subscription to others
- Bypass subscription requirements

= Does it work without WooCommerce? =

The plugin loads on WordPress sites without WooCommerce, but ecommerce features (cart recovery, order attribution) require WooCommerce to be installed and active.

= What data does Wizybot collect? =

Wizybot collects customer interactions, cart data, and sales information to provide personalized engagement and track conversions. See our [Privacy Policy](https://app.wizybot.com/privacy) for details on how your data is handled.

= Do I need to modify my theme? =

No. The plugin integrates using native WordPress hooks and does not require theme modifications.

= Where do I get support? =

Visit [wizybot.com](https://wizybot.com) for technical support, billing questions, and commercial information about plans and features.

== Changelog ==

= 0.0.1 =
* Initial plugin release
* WooCommerce integration
* Abandoned cart recovery functionality
* Customer tracking and order attribution
* Admin dashboard integration

== Upgrade Notice ==

= 0.0.1 =
Initial release.

== Screenshots ==

1. Wizybot admin dashboard inside WordPress.
2. Chat widget on the storefront.

== Licensing ==

**Plugin Code:** GPL v2 or later
- You can modify, use, and redistribute the plugin code under GPL v2 terms
- Source code is open and freely available

**Wizybot Service:** Proprietary Software-as-a-Service (SaaS)
- The Wizybot platform itself is proprietary and closed-source
- Wizybot service is subject to Wizybot's Terms of Service and Privacy Policy
- You require an active paid subscription to access Wizybot services
- You cannot modify, reproduce, or redistribute the Wizybot subscription service
- You cannot bypass or circumvent subscription requirements

**What This Means:**
- This WordPress plugin is free and open-source
- Using Wizybot's cloud platform requires a paid subscription
- You pay for access to cloud services, not for software licenses
- The plugin integrates your WordPress site with Wizybot's proprietary platform

== Third-Party Service ==

This plugin integrates with **Wizybot**, a third-party Software-as-a-Service (SaaS) platform.

**Service Details:**
- **Provider:** Wizybot Inc
- **Service URL:** https://wizybot.com
- **API Communication:** Plugin communicates with Wizybot servers for:
  - Chat widget functionality
  - Customer engagement tracking
  - Cart recovery services
  - WhatsApp/SMS messaging
  - Analytics and reporting

**Subscription Required:**
- Active paid subscription with Wizybot is required
- Subscription terms and pricing at [wizybot.com/pricing](https://wizybot.com/pricing)
- Different plans available with varying features

**Data Sharing:**
By installing and activating this plugin, you consent to share:
- Store domain and basic shop information
- Customer interactions and conversations
- Shopping cart data
- Customer contact information
- Order information for attribution

**Privacy Policy:**
- Wizybot Privacy Policy: [https://app.wizybot.com/privacy](https://app.wizybot.com/privacy)
- Review these documents before using this plugin

== Support & Billing ==

For support, billing, feature requests, or account management:
- Visit [wizybot.com](https://wizybot.com)
- Email: support@wizybot.com

For WordPress plugin technical issues:
- Check installation instructions above
- Review FAQ section
- Contact Wizybot support for platform-related issues

== Código fuente incluido (source/) ==

El directorio `source/` contiene los archivos fuente del widget frontend (React + TypeScript) y la configuración necesaria para empaquetarlo y generar los assets que utiliza el plugin de WordPress.

**Estructura principal:**

- `package.json`: dependencias y scripts de desarrollo/compilación.
- `webpack.wordpress.config.js`: configuración de webpack para construir los paquetes destinados a WordPress.
- `public/`: archivos CSS que se copian al plugin durante el build:
  - `ShopifyWidgetInner.css`
  - `ShopifyWidgetOutter.css`
- `src/components/`: componentes React/TypeScript que implementan el widget y UI.
- `src/wordpress/`: entradas y assets específicos para WordPress:
  - `widget/indexWidget.wordpress.tsx`
  - `dashboard/indexDashboard.wordpress.tsx`
  - `index.wordpress.css`

**Como compilar los assets de WordPress (widget + dashboard):**

1. Instalar dependencias:
   - `cd source`
   - `npm install`
2. Compilar en modo produccion:
   - `npm run widget-wordpress`

El script `widget-wordpress` ejecuta:

`webpack --config webpack.wordpress.config.js --mode production`

**Salida del build:**

- Los archivos generados se escriben en `assets/` en la raiz del plugin.
- Se crean `main.js`, `dashboard.js`, `main.css`, `dashboard.css`.
- Se copian imagenes y CSS estaticos definidos en `webpack.wordpress.config.js`.

**Desarrollo (watch):**

- `npm run widget-wordpress:watch` recompila automaticamente en modo desarrollo.

Este codigo fuente representa la implementacion del widget frontend que se integra con el plugin para mostrar la interfaz de chat y funcionalidad en tiendas.
