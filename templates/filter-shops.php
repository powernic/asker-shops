<div id="shop-maps">
    <style><?php require_once(__DIR__ . '/../assets/css/frontend.css') ?></style>
    <span class="shop-info">Для расширенного поиска контактов используйте фильтры:</span>
    <div id="shop-filter">
        <div class="title-filter"><span class="icon icon-funnel"></span>ФИЛЬТР:</div>
        <div class="filter-param"><span>Направления<span class="icon icon-arrow-down"></span></span>
            <ul class="nano" id="filter-dir">
                <?php
                global $mapshops;
                foreach ($mapshops->shopsData['dir'] as $value => $item) {
                    echo "<li><label><input type='checkbox' value='$value'><span class='filter-check'></span>{$item}</label></li>";
                }
                ?></ul>
        </div>
        <div class="filter-param disable-check"><span>Города<span class="icon icon-arrow-down"></span></span>
            <ul class="nano" id="filter-city">
                <?php
                foreach ($mapshops->shopsData['city'] as $item) {
                    echo "<li><label><input type='checkbox' data-lng=\"{$item['lng']}\" data-lat=\"{$item['lat']}\" data-z=\"{$item['zoom']}\" ><span class='filter-text'>{$item['name']}</span></label></li>";
                }
                ?></ul>
        </div>
        <div class="filter-param"><span>Сервисы/Услуги<span class="icon icon-arrow-down"></span></span>
            <ul class="nano" id="filter-service">
                <?php
                foreach ($mapshops->shopsData['service'] as $value => $item) {
                    echo "<li><label><input type='checkbox' value='$value'><span class='filter-check'></span>{$item}</label></li>";
                }
                ?></ul>
        </div>
        <a href="#" class="filter-reset">Сбросить фильтр</a>
    </div>
    <script>
        <?php
        $items = $mapshops::getShops(); ?>
        window.shops = <?php echo json_encode($items)?>;
    </script>
    <div id="shopmap">

    </div>
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