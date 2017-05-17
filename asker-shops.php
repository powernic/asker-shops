<?php
/*
Plugin Name: Карта магазинов
Plugin URI: https://github.com/powernic
Description: Создание карты с фильтром для фильтрации магазинов.
Version: 0.0.1
Author: Ефименко Николай
Author URI: https://github.com/powernic
 */
if (!class_exists('MapShops')) {
    class MapShops
    {
        protected static $_instance = null;

        var $shopsData = array();

        public static function instance()
        {
            if (is_null(self::$_instance)) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        public function __construct()
        {

            $this->shopsData['dir'] = get_option('_shopmap_dir');
            $this->shopsData['service'] = get_option('_shopmap_service');
            $this->shopsData['city'] = get_option('_shopmap_city');
            if (is_admin()) {
                add_action('admin_menu', array($this, 'shops_add_admin'));
                add_action('admin_enqueue_scripts', array($this, 'init_scripts'));
                add_action('admin_print_styles', array($this, 'init_styles'));
                add_action('wp_ajax_sm_SaveData', array($this, 'saveData'));
                add_action('wp_ajax_nopriv_sm_SaveData', array($this, 'saveData'));
                add_action('wp_ajax_sm_updateShop', array($this, 'updateShop'));
                add_action('wp_ajax_nopriv_sm_updateShop', array($this, 'updateShop'));
                add_action('wp_ajax_sm_removeShops', array($this, 'removeShops'));
                add_action('wp_ajax_nopriv_sm_removeShops', array($this, 'removeShops'));
            }else{
                add_action('wp_enqueue_scripts', array($this, 'init_scripts'));
                add_action('wp_print_styles', array($this, 'init_styles'));
                add_shortcode('filter-shops',array($this,'displayFilterShops'));
            }
        }

        private function getShop($item = 0){
            $dir = $this->shopsData['dir'];
            $service = $this->shopsData['service'];
            $cities = $this->shopsData['city'];
            $unformat = $item;
            $unformat['dir'] = implode(',', $item['dir']);
            $unformat['service'] = implode(',', $item['service']);
            $item['unformat'] = $unformat;
            $dirs = array_intersect_key($dir , array_flip($item['dir']));
            $services = array_intersect_key($service , array_flip($item['service']));
            $item['cities'] = $cities[$item['cities']]['name'];
            $item['dir'] = implode(', ' , $dirs);
            $item['service'] = implode(', ' , $services);
            return $item;
        }

        static function getShops(){
            $items = get_option('_shopmap_shops');
            global $mapshops;
            foreach($items as $key=>$item){
                $items[$key] = $mapshops->getShop($item);
            }
            return $items;
        }
        public function removeShops(){
            if(!isset($_POST['ids'])){
                return false;
            }
            $ids = array_flip($_POST['ids']);
            $shops = get_option('_shopmap_shops');
            $shops = array_diff_key($shops,$ids);
            update_option('_shopmap_shops', $shops);
            die();
        }
        private function prepareShop($item){
            $item['address'] = htmlspecialchars($item['address']);
            $item['name'] = htmlspecialchars($item['name']);
            return $item;
        }
        public function updateShop(){
            $default_shop = array(
                'id' => 0,
                'name' => '',
                'cities' => '',
                'index' => '',
                'address' => '',
                'lng' => '',
                'lat' => '',
                'dir' => [],
                'service' => [],
                'contacts' => '',
                'time' => '',
            );
            $shopData = array_intersect_key($_POST,$default_shop);
            $default_shop = array_merge( $default_shop, $shopData );
            $default_shop = $this->prepareShop($default_shop);
            $default_shops = get_option('_shopmap_shops');
            if(isset($_POST['id']) && $_POST['id']==0){
                $last_id = (int)get_option('_shopmap_shops_id');
                update_option('_shopmap_shops_id', ++$last_id);
                $default_shop['id'] = $last_id;
                $default_shops[$last_id]=$default_shop;
            }else if(isset($_POST['id']) && $_POST['id']!==0){
                $default_shops[$_POST['id']] = $default_shop;
            }
            update_option('_shopmap_shops', $default_shops);
            echo json_encode($this::getShop($default_shop));
            die();
        }
        public function saveData(){
            $page = $_POST['page'];
            $event = $_GET['event'];
            $data = $_POST['data'];
            $ids = $_POST['ids'];
            if(!empty($page)) {
                if($event=='add') {
                    $last_id = (int)get_option('_shopmap_' . $page . '_id');
                    update_option('_shopmap_' . $page . '_id', ++$last_id);
                    echo $last_id;
                }
                $options = [];
                if ($page == 'city') {
                    $lng = $_POST['lng'];
                    $lat = $_POST['lat'];
                    $zoom = $_POST['zoom'];
                    foreach ($data as $key => $item) {
                        $id = $ids[$key];
                        $values = array('name' => $data[$key],
                            'lng' => $lng[$key],
                            'lat' => $lat[$key],
                            'zoom' => $zoom[$key]);
                        if (empty($id)) {
                            $options[$last_id] = $values;
                        } else {
                            $options[$id] = $values;
                        }
                    }
                } else {
                    foreach ($data as $key => $item) {
                        $id = $ids[$key];
                        if (empty($id)) {
                            $options[$last_id] = $item;
                        } else {
                            $options[$id] = $item;
                        }
                    }
                }
                update_option('_shopmap_' . $page, $options);
            }
            die();
        }

        public function init_scripts()
        {
            if (is_admin()) {
                wp_enqueue_script("jquery-ui-sortable", array('jquery', 'jquery-ui-core'));
                wp_enqueue_script('mapshops', plugins_url('assets/js/mapshops.js', __FILE__), array(), '15022017', true);
            }else{
                wp_enqueue_script('mapshops', plugins_url('assets/js/frontend.js', __FILE__), array(), '15052017', true);
            }
        }
        public function init_styles(){
            wp_enqueue_style("mapshops", plugins_url('assets/css/asker-shops.css', __FILE__), array(), '15022017' );
        }
        public function shops_add_admin()
        {
            add_menu_page('Магазины', 'Магазины', 'edit_users', 'asker-shop', array($this, 'display_shop'), 'dashicons-location-alt', 21);
            $pages = [
                'dir' => 'Направления',
                'city' => 'Города',
                'service' => 'Сервисы/Услуги'
            ];
            foreach ($pages as $slug => $title) {
                add_submenu_page('asker-shop', $title, $title, 'edit_users', 'asker-shop-' . $slug, array($this, 'display_' . $slug));
            }
        }

        public function display_shop()
        {
            $this->ms_get_template_part('admin', 'shop');
        }
        public function display_dir()
        {
            $this->ms_get_template_part('admin', 'dir');
        }

        public function display_city()
        {
            $this->ms_get_template_part('admin', 'city');
        }

        public function display_service()
        {
            $this->ms_get_template_part('admin', 'service');
        }

        public function displayFilterShops(){
            $this->ms_get_template_part('filter', 'shops');
        }
        public function plugin_path()
        {
            return untrailingslashit(plugin_dir_path(__FILE__));
        }

        public function ms_get_template_part($slug, $name = '')
        {
            $template = '';
            if (!$template && $name && file_exists($this->plugin_path() . "/templates/{$slug}-{$name}.php")) {
                $template = $this->plugin_path() . "/templates/{$slug}-{$name}.php";
            }
            if ($template) {
                load_template($template, false);
            }
        }
    }
}
function MS()
{
    return MapShops::instance();
}

$GLOBALS['mapshops'] = MS();
/** @var $mapshops MapShops */
global $mapshops;