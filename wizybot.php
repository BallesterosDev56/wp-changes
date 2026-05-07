<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
/**
 * Plugin Name:       Wizybot
 * Plugin URI:        https://wizybot.com
 * Description:       A plugin to integrate Wizybot with WordPress.
 * Version:           1.0.0
 * Author:            Wizybot Inc
 * Author URI:        https://wizybot.com
 * Text Domain:       wizybot
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Requires at least: 5.2
 * Requires PHP:      7.2
 */

define('STAGE', 'prod');
define('GLOBAL_SELECTED_BACKEND', 'https://api.wizybot.com');
define('IP_REGISTRY_KEY', '47m2mudauztxbwih');


if (!class_exists('Wizybot')):

    /**
     * Wizybot Core Class
     */
    class Wizybot
    {
        /**
         * The single instance of the class.
         */
        protected static $_instance = null;


        /**
         * Constructor.
         */
        protected function __construct()
        {
            $this->includes();
            $this->init();
        }

        /**
         * Main Extension Instance.
         */
        public static function instance()
        {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        /**
         * Cloning is forbidden.
         */
        public function __clone()
        {
            if (function_exists('wc_doing_it_wrong')) {
                wc_doing_it_wrong(__FUNCTION__, esc_html__('Cheatin&#8217; huh?', 'wizybot'), '1.0.0');
            } else {
                _doing_it_wrong(__FUNCTION__, esc_html__('Cheatin&#8217; huh?', 'wizybot'), '1.0.0');
            }
        }

        /**
         * Unserializing instances of this class is forbidden.
         */
        public function __wakeup()
        {
            if (function_exists('wc_doing_it_wrong')) {
                wc_doing_it_wrong(__FUNCTION__, esc_html__('Cheatin&#8217; huh?', 'wizybot'), '1.0.0');
            } else {
                _doing_it_wrong(__FUNCTION__, esc_html__('Cheatin&#8217; huh?', 'wizybot'), '1.0.0');
            }
        }

        /**
         * Load dependencies.
         */
        private function includes()
        {
            // Include other files if needed
            if (!function_exists('is_plugin_active')) {
                include_once(ABSPATH . 'wp-admin/includes/plugin.php');
            }
        }

        /**
         * Initialize hooks and filters.
         */
        private function init()
        {
            // Check if token is in the url of admin or stored in options
            $token = get_option('wizybot_token');
            if (!$token) {
                $token = get_option('wizybot_shop_token');
            }

            // Woocommerce return url
            $woocommerce_success = null;
            if (isset($_GET['success'])) {
                $woocommerce_success = sanitize_text_field( wp_unslash( $_GET['success'] ) );
                if ($woocommerce_success) {
                    update_option('wizybot_woocommerce_success', $woocommerce_success);
                }
            }

            if (isset($_GET['token'])) {
                $token = sanitize_text_field( wp_unslash( $_GET['token'] ) );
                if ($token) {
                    update_option('wizybot_shop_token', $token);
                }
            }

            // Shop Domain
            $siteUrl = site_url();
            $parsedUrl = wp_parse_url($siteUrl);
            $shopDomain = str_replace('.', '-', $parsedUrl['host'] ?? '');
            $path = trim($parsedUrl['path'] ?? '/', '/');
            $path = str_replace('/', '.', $path);
            $shopDomain = $shopDomain . ($path ? '.' . $path : '') . '.mywordpress.com';
            update_option('wizybot_shop_domain', $shopDomain);


            // Shop Main Domain
            $shopMainDomain = $parsedUrl["host"] . ($parsedUrl["path"] ?? '');
            update_option('wizybot_shop_main_domain', $shopMainDomain);

            // Shop Name
            $shopName = get_bloginfo('name');
            update_option('wizybot_shop_name', $shopName);

            // Shop Email
            $shopEmail = wp_get_current_user()->user_email;
            update_option('wizybot_shop_email', $shopEmail);


            $is_already_installed = $this->request_is_already_installed();
            update_option('wizybot_is_already_installed', $is_already_installed);

            // Delete all info because doesn't exists shop but we have token
            if (!$is_already_installed && $token) {
                delete_option('wizybot_woocommerce_success');
                delete_option('wizybot_token');
            }

            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_head', array($this, 'admin_icon_styles'));

            // Admin Scripts
            add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

            // Frontend Scripts
            add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

            // Forces WooCommerce to initialize the session and cart on every frontend request.
            // Must be PHP: WC()->session is a server-side PHP object; React has no access to it.
            add_action('init', array($this, 'init_woocommerce_session'));

            // REST API
            add_action('rest_api_init', array($this, 'register_rest_routes'));

            // Generates the WIZY_CART_* cookie if it doesn't exist yet.
            // Must be PHP: the cookie must be set in the HTTP response headers before the page HTML
            // is sent, so it is available to the widget on the very first load.
            add_action('init', array($this, 'init_wizy_cart_id'));

            // Handles the cart recovery URL (?wizy_action=recover) sent in abandoned checkout messages.
            // Must be PHP: reconstructing the cart requires WC()->cart and WC()->session, which are
            // server-side objects. React cannot manipulate WooCommerce cart state directly.
            add_action('init', array($this, 'handle_cart_recovery'));

            // Persists the Wizybot client ID and cart ID in the order meta when checkout completes.
            // Two hooks are registered because WooCommerce has two independent checkout implementations:
            // - woocommerce_checkout_order_created   → classic shortcode checkout
            // - woocommerce_store_api_checkout_order_processed → Blocks (Gutenberg) checkout
            // Both fire server-side; React is never notified that a checkout occurred.
            add_action('woocommerce_checkout_order_created', array($this, 'save_wizybot_client_in_order'));
            add_action('woocommerce_store_api_checkout_order_processed', array($this, 'save_wizybot_client_in_order'));

            // Persists wizy_recover_id and wizy_referral in each order line item meta.
            // Must be PHP: woocommerce_checkout_create_order_line_item is a WooCommerce hook that
            // passes the in-memory $item object before it is saved; there is no browser equivalent.
            add_action('woocommerce_checkout_create_order_line_item', array($this, 'save_item_metadata'), 10, 4);
        }

        /**
         * Add Admin Menu
         */
        public function add_admin_menu()
        {
            add_menu_page(
                'Wizybot',
                'Wizybot',
                'manage_options',
                'wizybot-dashboard',
                array($this, 'admin_page_contents'),
                plugin_dir_url(__FILE__) . 'assets/Logo.svg',
                56
            );
        }

        /**
         * Custom Icon Styles
         */
        public function admin_icon_styles()
        {
            ?>
            <style>
                /* Target by both the specific ID and a more generic selector for the redirect URL */
                #adminmenu li[id^="toplevel_page_wizybot"] .wp-menu-image,
                #adminmenu li[class*="toplevel_page_http"] .wp-menu-image {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                }

                #adminmenu li[id^="toplevel_page_wizybot"] .wp-menu-image:before,
                #adminmenu li[class*="toplevel_page_http"] .wp-menu-image:before {
                    display: none !important;
                }

                #adminmenu li[id^="toplevel_page_wizybot"] .wp-menu-image img,
                #adminmenu li[class*="toplevel_page_http"] .wp-menu-image img {
                    width: 18px !important;
                    height: auto !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    opacity: 0.6;
                    filter: brightness(0) invert(1);
                    transition: all 0.2s ease-in-out;
                }

                #adminmenu li[id^="toplevel_page_wizybot"]:hover .wp-menu-image img,
                #adminmenu li[id^="toplevel_page_wizybot"].current .wp-menu-image img,
                #adminmenu li[id^="toplevel_page_wizybot"].wp-has-current-submenu .wp-menu-image img,
                #adminmenu li[class*="toplevel_page_http"]:hover .wp-menu-image img,
                #adminmenu li[class*="toplevel_page_http"].current .wp-menu-image img,
                #adminmenu li[class*="toplevel_page_http"].wp-has-current-submenu .wp-menu-image img {
                    opacity: 1;
                    filter: brightness(0) invert(1);
                }
            </style>

            <?php

            // Global error and exception handlers for Wizybot plugin
            set_error_handler(function($errno, $errstr, $errfile, $errline) {
                return false; // Let native handler also process
            });

            set_exception_handler(function($exception) {
              if (WP_DEBUG) {
                error_log("Wizybot Excepción: " . $exception->getMessage() . " en " . $exception->getFile() . ":" . $exception->getLine());
              }
            });

            register_shutdown_function(function() {
                $error = error_get_last();
                if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR]) && WP_DEBUG) {
                    error_log("Wizybot Fatal: [{$error['type']}] {$error['message']} en {$error['file']}:{$error['line']}");
                }
            });
        }

        /**
         * Render Admin Page
         */
        public function admin_page_contents()
        {
            echo '<div id="wizybot-dashboard-app" class="tw-class"></div>';
        }

        /**
         * Enqueue Admin Scripts
         *
         * Loads the dashboard React app and passes WordPress server-side context via wp_localize_script.
         * Must be PHP: shop token, nonce, and install state are stored in wp_options and cannot be
         * read securely from the browser.
         */
        public function enqueue_admin_scripts($hook)
        {
            if ($hook !== 'toplevel_page_wizybot-dashboard') {
                return;
            }

            // CSS from Webpack build
            wp_enqueue_style(
                'wizybot-dashboard-css',
                plugin_dir_url(__FILE__) . 'assets/dashboard.css',
                array(),
                '1.0.0'
            );

            // JS from Webpack build
            wp_enqueue_script(
                'wizybot-dashboard-js',
                plugin_dir_url(__FILE__) . 'assets/dashboard.js',
                array('react', 'wp-element', 'wp-dom-ready'),
                '1.0.0',
                true
            );

            wp_localize_script('wizybot-dashboard-js', 'wizybot', array(

                'appUUID' => get_option('wizybot_app_uuid'),
                "shopDomain" => get_option('wizybot_shop_domain'),
                'shopMainDomain' => get_option('wizybot_shop_main_domain'),
                'shopName' => get_option('wizybot_shop_name'),
                'shopEmail' => get_option('wizybot_shop_email'),
                'shopToken' => get_option('wizybot_shop_token', ''),
                'globalSelectedBackend' => GLOBAL_SELECTED_BACKEND,
                'isAlreadyInstalled' => get_option('wizybot_is_already_installed', false),
                'stage' => STAGE,
                'wordpressUrl' => site_url(),
                'siteUrl' => site_url(),
                'hasWooCommerce' => class_exists('WooCommerce'),
                'wooCommerceSuccess' => get_option('wizybot_woocommerce_success', false),
                'nonce' => wp_create_nonce('wp_rest'),
                'apiUrl' => esc_url_raw(rest_url('wizybot/v1')),
                'userId' => wp_get_current_user()->ID,
                'isSuperAdmin' => is_super_admin(),
            ));
        }

        /**
         * Enqueue Frontend Scripts
         *
         * Loads the chat widget React app and passes server-side context via wp_localize_script.
         * Must be PHP: wizyCartId must be read from the cookie and injected before JS executes,
         * so the widget has it available on the very first render without an extra round-trip.
         * All other widget calls (widget config, sale creation, abandoned checkout) go directly
         * from React to the Wizybot backend — no PHP relay needed for those.
         */
        public function enqueue_scripts()
        {
            // CSS from Webpack build
            wp_enqueue_style(
                'wizybot-main-css',
                plugin_dir_url(__FILE__) . 'assets/main.css',
                array(),
                '1.0.0'
            );

            // JS from Webpack build
            wp_enqueue_script(
                'wizybot-main-js',
                plugin_dir_url(__FILE__) . 'assets/main.js',
                array('react', 'wp-element', 'wp-dom-ready'),
                '1.0.0',
                true
            );

            // Build cart items from WC()->cart so the React widget has them at first render
            // without making any HTTP request. Used as fallback for Classic checkout where
            // wp.data (Blocks) is not available.
            $wizy_cart_items = array();
            if (class_exists('WooCommerce') && function_exists('WC') && WC()->cart) {
                foreach (WC()->cart->get_cart() as $cart_item) {
                    $product = $cart_item['data'];
                    if (!$product) continue;
                    $image_id = $product->get_image_id();
                    $wizy_cart_items[] = array(
                        'id'          => $cart_item['product_id'],
                        'variationId' => $cart_item['variation_id'] ?? 0,
                        'name'        => $product->get_name(),
                        'quantity'    => $cart_item['quantity'],
                        'price'       => strval($product->get_price()),
                        'image'       => $image_id ? wp_get_attachment_url($image_id) : null,
                    );
                }
            }

            wp_localize_script('wizybot-main-js', 'wizybot', array(
                'shopDomain' => get_option('wizybot_shop_domain'),
                'ipRegistryKey' => IP_REGISTRY_KEY,
                'globalSelectedBackend' => GLOBAL_SELECTED_BACKEND,
                'chatProfileImage' => plugin_dir_url(__FILE__) . 'assets/wizy_chat_profile.png',
                'curvyBorderImage' => plugin_dir_url(__FILE__) . 'assets/wizy_curvy_border.png',
                'wizyLogoImage' => plugin_dir_url(__FILE__) . 'assets/wizy_logo_blue.svg',
                'noImageImage' => plugin_dir_url(__FILE__) . 'assets/wizy_no_image_available.png',
                'widgetLoader' => plugin_dir_url(__FILE__) . 'assets/wizy_widget_loader.svg',
                'stylesPathOutter' => plugin_dir_url(__FILE__) . 'assets/ShopifyWidgetOutter.css',
                'stylesPathInner' => plugin_dir_url(__FILE__) . 'assets/ShopifyWidgetInner.css',
                'isShopifyForeing' => 'true',
                'wizyCartId'       => $_COOKIE[str_replace('.', '_', 'WIZY_CART_' . get_option('wizybot_shop_domain'))] ?? null,
                'wizyCartItems'    => $wizy_cart_items,
                'checkoutUrl'      => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : null,
            ));
        }

        /**
         * Register REST Routes
         */
        public function register_rest_routes()
        {
        }

        public function check_admin_permissions($request)
        {
            return current_user_can('manage_options');
        }

        /**
         * Check whether this shop is already registered in the Wizybot backend.
         *
         * Called server-to-server during plugin init so the result is stored in wp_options
         * and available synchronously to the admin dashboard on first load. Cannot be moved
         * to React because the check must complete before wp_localize_script runs.
         */
        public function request_is_already_installed()
        {
            $url_backend = GLOBAL_SELECTED_BACKEND;
            $shopDomain = get_option('wizybot_shop_domain');
            $url = STAGE === 'local'
                ? 'https://host.docker.internal:3001/wordpress/isinstalled/' . urlencode($shopDomain)
                : $url_backend . '/wordpress/isinstalled/' . urlencode($shopDomain);

            if (STAGE === 'local') {
                $options = [
                    'sslverify' => false,
                ];
                $response = wp_remote_get($url, $options);

            } else {
                $response = wp_remote_get(($url));
            }

            if (is_wp_error($response)) {
                return false;
            }

            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            if (WP_DEBUG) {
                error_log('Wizybot Debug - API Response: ' . $body);
            }

            $installed = !empty($data['installed']);
            return $installed;
        }

        /**
         * Force WooCommerce to initialize the session and cart on every frontend request.
         *
         * Must be PHP: WC()->session is a server-side PHP object. Without this early init,
         * the session cookie may not exist when init_wizy_cart_id or handle_cart_recovery run,
         * causing WooCommerce to lose cart state mid-flow.
         */
        public function init_woocommerce_session()
        {
            if (is_admin()) return;
            if (!function_exists('WC') || !WC()->session) return;

            WC()->session->set_customer_session_cookie(true);
            WC()->cart;
        }

        /**
         * Generate and persist the WIZY_CART_* cookie if it does not exist yet.
         *
         * Must be PHP: the cookie must be written to the HTTP response headers before the page
         * HTML is sent to the browser. If this were done in React, the widget would have no
         * cart ID on the very first page load, breaking sale attribution for new visitors.
         * The value is later passed to React via wp_localize_script (wizyCartId prop).
         */
        public function init_wizy_cart_id()
        {
            $shop_domain = get_option('wizybot_shop_domain');
            $cookie_name = 'WIZY_CART_' . $shop_domain;
            $cookie_key = str_replace('.', '_', $cookie_name); // PHP converts dots to underscores in $_COOKIE
            if (!isset($_COOKIE[$cookie_key])) {
                $cart_id = wp_generate_uuid4();
                setcookie($cookie_name, $cart_id, time() + (86400 * 365), '/');
                $_COOKIE[$cookie_key] = $cart_id;
            }
        }

        /**
         * Reconstruct the WooCommerce cart from a Wizybot recovery URL.
         *
         * Triggered when the customer clicks the recovery link sent via WhatsApp/SMS.
         * The URL carries ?wizy_action=recover&products=id:qty,...&wizy_recover=cartId&wizyreferral=clientId.
         *
         * Must be PHP: adding items to the cart and persisting the session requires WC()->cart
         * and WC()->session, which are server-side objects. React has no mechanism to manipulate
         * WooCommerce cart state. After rebuilding the cart, PHP redirects to the checkout page.
         */
        public function handle_cart_recovery()
        {
            if (!isset($_GET['wizy_action']) || sanitize_text_field( wp_unslash( $_GET['wizy_action'] ) ) !== 'recover') {
                return;
            }

            if (!function_exists('WC')) return;

            // Session must exist before we can write to the cart
            if (!WC()->session || !WC()->session->has_session()) {
                WC()->session->set_customer_session_cookie(true);
            }

            WC()->cart->empty_cart();

            // Parse products param: "productId:quantity,productId:quantity"
            if (isset($_GET['products'])) {
                $products_data = explode(',', sanitize_text_field( wp_unslash( $_GET['products'] ) ));

                foreach ($products_data as $item_str) {
                    $parts = explode(':', $item_str);
                    if (count($parts) !== 2) continue;

                    $product_id = intval($parts[0]);
                    $qty = intval($parts[1]);

                    $cart_item_data = [
                        'wizy_recover_id' => sanitize_text_field( wp_unslash( $_GET['wizy_recover'] ?? '' ) ),
                        'wizy_referral'   => sanitize_text_field( wp_unslash( $_GET['wizy_client'] ?? $_GET['wizyreferral'] ?? '' ) )
                    ];

                    WC()->cart->add_to_cart($product_id, $qty, 0, [], $cart_item_data);
                }
            }

            // Restore tracking cookies so the eventual order is attributed to this recovery
            $shop_domain = get_option('wizybot_shop_domain');
            if (isset($_GET['wizy_recover'])) {
                setcookie('WIZY_CART_' . $shop_domain, sanitize_text_field( wp_unslash( $_GET['wizy_recover'] ) ), time() + (86400 * 365), '/');
            }
            if (isset($_GET['wizy_client']) || isset($_GET['wizyreferral'])) {
                $client_id = sanitize_text_field( wp_unslash( $_GET['wizy_client'] ?? $_GET['wizyreferral'] ?? '' ) );
                setcookie('WIZY_CLIENT_' . $shop_domain, $client_id, time() + (86400 * 365), '/');
            }

            WC()->cart->calculate_totals();
            WC()->cart->set_session();
            WC()->session->save_data();

            wp_safe_redirect(wc_get_checkout_url());
            exit;
        }

        /**
         * Persist Wizybot tracking IDs in each WooCommerce order line item.
         *
         * Must be PHP: woocommerce_checkout_create_order_line_item passes the in-memory $item
         * object before it is written to the database. There is no browser-side equivalent —
         * React is never notified that an order line item is being created.
         */
        public function save_item_metadata($item, $cart_item_key, $values, $order)
        {
            if (isset($values['wizy_recover_id'])) {
                $item->add_meta_data('_wizy_recover_id', $values['wizy_recover_id']);
            }
            if (isset($values['wizy_referral'])) {
                $item->add_meta_data('_wizy_referral', $values['wizy_referral']);
            }
        }

        /**
         * Persist the Wizybot client ID and cart ID in the order meta when checkout completes.
         *
         * Must be PHP: this runs inside a WooCommerce checkout hook (fired server-side after the
         * order is created). React has no way to hook into this event. The IDs are read from
         * cookies set earlier by init_wizy_cart_id and by the React widget (WIZY_CLIENT_*),
         * then saved as order meta so the Wizybot backend can attribute the sale correctly.
         * After saving, the cart cookie is regenerated so the next purchase gets a fresh ID.
         */
        public function save_wizybot_client_in_order($order)
        {
            $shop_domain = get_option('wizybot_shop_domain');

            $client_cookie = str_replace('.', '_', 'WIZY_CLIENT_' . $shop_domain);
            if (isset($_COOKIE[$client_cookie])) {
                $client_id = sanitize_text_field($_COOKIE[$client_cookie]);
                if ($client_id) {
                    $order->update_meta_data('_wizybot_client_id', $client_id);
                }
            } else {
                if (WP_DEBUG) {
                    error_log('Wizybot - client cookie not found: ' . $client_cookie);
                }
            }

            $cart_cookie = 'WIZY_CART_' . $shop_domain;
            $cart_cookie_key = str_replace('.', '_', $cart_cookie);
            if (isset($_COOKIE[$cart_cookie_key])) {
                $cart_id = sanitize_text_field($_COOKIE[$cart_cookie_key]);
                if ($cart_id) {
                    $order->update_meta_data('_wizybot_cart_id', $cart_id);
                    // Regenerate so the next purchase gets a fresh cart ID
                    $new_cart_id = wp_generate_uuid4();
                    setcookie($cart_cookie, $new_cart_id, time() + (86400 * 365), '/');
                    $_COOKIE[$cart_cookie_key] = $new_cart_id;
                }
            } else {
                if (WP_DEBUG) {
                    error_log('Wizybot - cart cookie not found: ' . $cart_cookie_key);
                }
            }

            $order->save();
        }

        /**
         * Deactivation logic: Delete all plugin options.
         */
        public static function deactivate()
        {
            $options = array(
                'wizybot_token',
                'wizybot_shop_token',
                'wizybot_shop_domain',
                'wizybot_shop_main_domain',
                'wizybot_shop_name',
                'wizybot_shop_email',
                'wizybot_is_already_installed',
                'wizybot_app_uuid',
                'wizybot_woocommerce_success'
            );

            foreach ($options as $option) {
                delete_option($option);
            }

            if (WP_DEBUG) {
                error_log('Wizybot Debug - Plugin Deactivated: Options deleted.');
            }
        }
    }

endif;

/**
 * Initialize Plugin
 */
function wizybot_init()
{
    $GLOBALS['wizybot'] = Wizybot::instance();
}
add_action('plugins_loaded', 'wizybot_init');

/**
 * Register Deactivation Hook
 */
register_deactivation_hook(__FILE__, array('Wizybot', 'deactivate'));
