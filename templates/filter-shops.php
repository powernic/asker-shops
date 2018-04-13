<style><?php require_once(__DIR__ . '/../assets/css/frontend.css') ?></style>

<div class="tab-switch-maps-contacts">
    <a href="#maps" class="active">КАРТА</a>
    <a href="#contacts">ПОДРОБНЫЕ КОНТАКТЫ СОТРУДНИКОВ</a>
</div>
<div id="maps" class="item-tab active">
    <div class="tab-contacts-items">
        <div id="shop-maps" class="active">
            <div class="description">
                <?=get_the_post_meta("desc");?>
            </div>
            <script>
                <?php
                global $mapshops;
                $items = $mapshops::getShops(); ?>
                window.shops = <?php echo json_encode($items)?>;
            </script>
            <div id="shopmap">

            </div>
            <?php
            if (!empty($items)) : ?>
                <div id="shop-item-empty" style="display:none;">
                    <?php foreach ($items as $item): ?>
                        <div data-shopID="<?= $item['id'] ?>" class="shop-item">
                            <div><?= $item['name'] ?></div>
                            <div><?= $item['address'] ?></div>
                            <div><?= $item['time'] ?></div>
                            <div><?= $item['contacts'] ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div id="list-shop" style="display:none;">
                    <div class="shop-header">
                        <div>Наименование</div>
                        <div>Адрес</div>
                        <div>Режим работы</div>
                        <div>Телефон</div>
                    </div>
                    <?php foreach ($items as $item): ?>
                        <div data-shopID="<?= $item['id'] ?>" class="shop-item">
                            <div><?= $item['name'] ?></div>
                            <div><?= $item['address'] ?></div>
                            <div><?= $item['time'] ?></div>
                            <div><?= $item['contacts'] ?></div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif ?>
            <div id="shop-trace" class="modal-block">
                <div class="close-modal"></div>
                <p>Для получения схемы проезда, пожалуйста, введите (откорректируйте) адрес отправления<br><em>(населенный
                        пункт, улица, дом)</em></p>
                <div id="fromAddress">
                    <textarea name="routeFrom" id="routeFrom" rows="5" cols="48" required=""></textarea>
                    <button type="submit" id="calcRoute">Проложить маршрут</button>
                </div>
            </div>
            <div id="descrRoute"></div> <!-- при выводе карты в этот div выводится описание пути -->
            <div id="clearRoute" style="display:none;">
                <button type="reset" id="calcRouteRemove">Очистить
                    маршрут
                </button>
            </div> <!-- очистка ранее построенного пути -->

        </div>
    </div>
</div>
<div id="contacts" class="item-tab">
    <div class="shop-info">Подробные контакты сотрудников:</div>
    <div class="tab-contacts">
        <?php
        $terms = get_terms(array(
            'taxonomy' => 'personal_cat',
            'parent' => 0
        ));
        ?>
    </div>
    <div class="tab-contacts-items">
        <?php foreach ($terms as $term) : ?>
            <div id="term-<?= $term->term_id ?>" class="personal-block active">
                <?php
                $categories = get_terms(array(
                    'taxonomy' => 'personal_cat',
                    'parent' => $term->term_id
                ));
                ?>
                <?php foreach ($categories as $cat) : ?>
                    <span><?= $cat->name ?></span>
                    <div class="personal-cat">
                        <?php
                        $args = array(
                            'numberposts' => -1, 'post_type' => 'personal', 'tax_query' => array(array(
                                'taxonomy' => 'personal_cat',
                                'field' => 'term_id',
                                'terms' => array($cat->term_id)
                            )
                            )
                        );
                        $posts = get_posts($args);

                        for($i = 1; $i < count($posts); $i++) {
                            if($posts[$i]->menu_order < $posts[$i-1]->menu_order) {
                                $tp = $posts[$i];
                                $posts[$i] = $posts[$i-1];
                                $posts[$i-1] = $tp;
                                $i = 0;
                            }
                        }

                        foreach ($posts as $post):
                            $pos = get_post_meta($post->ID, 'position', 'true');
                            $tel = get_post_meta($post->ID, 'phone', 'true');
                            $mail = get_post_meta($post->ID, 'email', 'true');
                            ?>
                            <div class="personal-item">
                                <div class="personal-left"><a data-fancybox="gallery" href="<?= get_the_post_thumbnail_url()?>"><?= get_the_post_thumbnail($post->ID, 'personal') ?></a></div>
                                <div class="personal-right">
                                    <div class="personal-name"><?= $post->post_title ?></div>
                                    <div class="personal-pos"><?= $pos ?></div>
                                    <div class="personal-tel"><a
                                            href="tel:<?= preg_replace('/[^0-9+]/i', '', $tel); ?>"><?= $tel ?></a>
                                    </div>
                                    <div class="personal-mail"><a
                                            href="mailto:<?= $mail ?>"><?= $mail ?></a></div>
                                </div>
                            </div>
                        <?php endforeach;
                        wp_reset_postdata(); // сброс
                        ?>

                    </div>
                <?php endforeach; ?>
            </div>
        <?php endforeach; ?>
    </div>
</div>