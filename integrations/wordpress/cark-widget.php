<?php
/**
 * Plugin Name: Çark Çevir Kazan
 * Description: Çark widget'ını WooCommerce mağazanıza ekler.
 * Version: 1.0.0
 * Requires Plugins: woocommerce
 * Text Domain: cark-widget
 */

if (!defined('ABSPATH')) { exit; }

add_action('admin_menu', function () {
    add_options_page('Çark Çevir Kazan', 'Çark', 'manage_options', 'cark-widget', 'cark_widget_settings_page');
});

add_action('admin_init', function () {
    register_setting('cark_widget', 'cark_widget_api_url', ['sanitize_callback' => 'esc_url_raw']);
    register_setting('cark_widget', 'cark_widget_store_slug', ['sanitize_callback' => 'sanitize_title']);
});

function cark_widget_settings_page() {
    if (!current_user_can('manage_options')) { return; }
    ?>
    <div class="wrap"><h1>Çark Çevir Kazan</h1>
      <p>Çark sunucunuzun adresini ve Çark yönetim panelindeki mağaza kodunuzu girin. WooCommerce kupon bağlantısı ayrıca Çark yönetim panelindeki Entegrasyon sekmesinden kurulur.</p>
      <form method="post" action="options.php">
        <?php settings_fields('cark_widget'); ?>
        <table class="form-table">
          <tr><th><label for="cark_widget_api_url">Çark sunucu adresi</label></th><td><input class="regular-text" type="url" id="cark_widget_api_url" name="cark_widget_api_url" value="<?php echo esc_attr(get_option('cark_widget_api_url', '')); ?>" placeholder="https://cark-sunucunuz.example" required></td></tr>
          <tr><th><label for="cark_widget_store_slug">Mağaza kodu</label></th><td><input class="regular-text" type="text" id="cark_widget_store_slug" name="cark_widget_store_slug" value="<?php echo esc_attr(get_option('cark_widget_store_slug', '')); ?>" required></td></tr>
        </table><?php submit_button(); ?>
      </form>
      <p>Bir sayfada çarkı göstermek için <code>[cark_widget]</code> kısa kodunu ekleyin.</p>
    </div>
    <?php
}

add_shortcode('cark_widget', function () {
    $api = untrailingslashit(get_option('cark_widget_api_url', ''));
    $slug = get_option('cark_widget_store_slug', '');
    if (!$api || !$slug) {
        return current_user_can('manage_options') ? '<p>Çark ayarları eksik. WordPress Yönetim → Ayarlar → Çark bölümünü tamamlayın.</p>' : '';
    }
    if (wp_script_is('cark-widget-embed', 'registered') === false) {
        wp_register_script('cark-widget-embed', esc_url($api . '/dist/cark-widget.v1.js'), [], '1.0.0', true);
        wp_enqueue_script('cark-widget-embed');
        $init = 'window.CarkWidget && window.CarkWidget.init({apiBaseUrl:' . wp_json_encode($api) . ',storeSlug:' . wp_json_encode($slug) . '}).catch(function(e){console.error("Çark başlatılamadı",e);});';
        wp_add_inline_script('cark-widget-embed', $init, 'after');
    }
    return '<div class="cark-widget-placeholder"></div>';
});
