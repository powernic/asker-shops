<div class="wrap">
    <h1 class="wp-heading-inline">Магазины</h1>
    <a href="#" id="add-new-shop" class="page-title-action">Добавить еще</a>
    <a href="#" id="remove-shops" class="page-title-action">Удалить</a>
    <form id="shop-form">
    <table class="wp-list-table widefat fixed striped pages">
        <thead>
        <td class="manage-column check-column"><input type="checkbox" id="plugins-select-all"/></td>
        <th>Название магазина</th>
        <th>Город</th>
        <th>Адрес</th>
        <th width="50">Индекс</th>
        <th>Направления</th>
        <th>Сервисы/Услуги</th>
        <th>Контактные телефоны</th>
        <th>Режим работы</th>
        </thead>
        <tbody id="the-list">

        <?php
        global $mapshops;
        $items = $mapshops::getShops();
        if(!empty($items)):
        foreach($items as $id => $item):?>
        <tr class="shop-<?=$id?>">
            <th scope="row" class="check-column">
                <input type="checkbox">
                <span class="data-shop" data-name="<?=$item['unformat']['name'] ?>"
                      data-id="<?=$id?>"
                      data-cities="<?=$item['unformat']['cities'] ?>"
                      data-address="<?=$item['unformat']['address'] ?>"
                      data-index="<?=$item['unformat']['index'] ?>"
                      data-dir="<?=$item['unformat']['dir'] ?>"
                      data-service="<?=$item['unformat']['service'] ?>"
                      data-contacts="<?=$item['unformat']['contacts'] ?>"
                      data-lng="<?=$item['unformat']['lng'] ?>"
                      data-lat="<?=$item['unformat']['lat'] ?>"
                      data-time="<?=$item['unformat']['time'] ?>">
            </span></th>
            <td><?=$item['name']?></td>
            <td><?=$item['cities']?></td>
            <td><?=$item['address']?></td>
            <td width="50"><?=$item['index']?></td>
            <td><?=$item['dir']?></td>
            <td><?=$item['service']?></td>
            <td><?=$item['contacts']?></td>
            <td><?=$item['time']?><a class="button-edit dashicons-edit dashicons-before alignright" href="#"></a></td>
        </tr>
        <?php endforeach;
        endif; ?>
        </tbody>
    </table>
    </form>
    <table>
    <tbody id="quick-edit-blank">
        <tr class="quick-edit-row-post inline-edit-row inline-edit-row inline-edit-row-post">
            <input type="hidden" name="id" value="0">
            <td colspan="9" class="colspanchange">
                <fieldset class="inline-edit-col-left">
                    <div class="inline-edit-col">
                        <label>
                            <span class="title">Магазин</span>
                            <span class="input-text-wrap">
                                        <input type="text" required="required" name="name"  value=""></span>
                        </label>
                        <div class="inline-edit-group wp-clearfix">
                            <label class="alignleft">
                                <span class="title">Город</span>
                                <span class="input-text-wrap">
                                    <select name="cities">
                            <?php
                            $cities = get_option('_shopmap_city');
                            if (!empty($cities)):
                                foreach ($cities as $id => $city): ?>
                                    <option value="<?= $id ?>"><?= $city['name'] ?></option>
                                <?php endforeach; endif; ?>
                        </select></span>
                            </label>
                            <em class="alignleft inline-edit-or"></em>
                            <label class="alignleft">
                                <span class="title">Индекс</span>
                                <span class="input-text-wrap">
                                        <input type="text" name="index" class="ptitle" value=""></span>
                            </label></div>
                        <label>
                            <span class="title">Адрес</span>
                            <span class="input-text-wrap">
                                        <input type="text" name="address" class="ptitle" value=""></span>
                        </label>
                        <div class="inline-edit-group wp-clearfix">
                            <label class="alignleft">
                                <span class="title">Широта</span>
                                <span class="input-text-wrap">
                                        <input type="text" required="required" name="lng" class="ptitle" value=""></span>
                            </label>
                            <em class="alignleft inline-edit-or"></em>
                            <label class="alignleft">
                                <span class="title">Долгота</span>
                                <span class="input-text-wrap">
                                        <input type="text" required="required" name="lat" class="ptitle" value=""></span>
                            </label>
                        </div>
                    </div>
                </fieldset>
                <fieldset class="inline-edit-col-center">
                    <div class="inline-edit-col">
                        <span class="title inline-edit-categories-label">Направления</span>
                        <ul class="cat-checklist category-checklist">
                            <?php
                            $dirs = get_option('_shopmap_dir');
                            if (!empty($dirs)):
                                foreach ($dirs as $id => $dir): ?>
                                    <li><label class="selectit">
                                            <input value="<?= $id ?>" type="checkbox" name="dir[]">
                                            <?= $dir ?></label></li>
                                <?php endforeach; endif; ?>
                        </ul>
                    </div>
                </fieldset>
                <fieldset class="inline-edit-col-center">
                    <div class="inline-edit-col">
                        <span class="title inline-edit-categories-label">Сервисы/Услуги</span>
                        <ul class="cat-checklist category-checklist">
                            <?php
                            $services = get_option('_shopmap_service');
                            if (!empty($services)):
                                foreach ($services as $id => $service): ?>
                                    <li><label class="selectit">
                                            <input value="<?= $id ?>" type="checkbox" name="service[]">
                                            <?= $service ?></label></li>
                                <?php endforeach; endif; ?>
                        </ul>
                    </div>
                </fieldset>
                <fieldset class="inline-edit-col-center">
                    <div class="inline-edit-col">
                        <span class="title inline-edit-categories-label">Контактные телефоны</span>
                        <textarea name="contacts"></textarea>
                        <span class="title inline-edit-categories-label">Режим работы</span>
                        <textarea name="time"></textarea>
                    </div>
                </fieldset>
                <p class="submit inline-edit-save">
                    <button type="button" class="button cancel alignleft">Отмена</button>
                    <button type="button" class="button button-primary save alignright">Добавить</button>
                    <input type="submit" class="submit" style="display:none;">
                    <br class="clear">
                </p>
            </td>
        </tr>
    </tbody>
    </table>
</div>