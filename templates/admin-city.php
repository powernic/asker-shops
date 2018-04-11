<div class="wrap">
    <h1 class="wp-heading-inline">Города</h1>
    <a href="#" id="add-new-page" class="page-title-action">Добавить еще</a>
    <a href="#" id="remove-page" class="page-title-action">Удалить</a>
    <form id="form-page">
        <input type="hidden" name="page" value="city">
        <table id="table-ms" class="wp-list-table widefat fixed striped pages">
            <thead>
            <td class="manage-column check-column"><input type="checkbox" id="plugins-select-all"/></td>
            <th>
                Наименование
            </th>
            <th>
                Широта
            </th>
            <th>
                Долгота
            </th>
            <th>
                Зум
            </th>
            </thead>
            <tbody id="the-list">
            <?php
            $items = get_option('_shopmap_city');
            if(!empty($items)):
                foreach($items as $id=>$item): ?>
                    <tr class="iedit level-2">
                        <th scope="row" class="check-column">
                            <input type="checkbox"></th>
                        <input type="hidden" name="data[]" value="<?=$item['name']?>"></th>
                        <input type="hidden" name="lat[]" value="<?=$item['lat']?>"></th>
                        <input type="hidden" name="lng[]" value="<?=$item['lng']?>"></th>
                        <input type="hidden" name="zoom[]" value="<?=$item['zoom']?>"></th>
                        <input type="hidden" name="ids[]" value="<?=$id?>"></th>
                        <td class="title column-title column-primary"><?=$item['name']?></td>
                        <td class="title column-lat column-primary"><?=$item['lat']?></td>
                        <td class="title column-lng column-primary"><?=$item['lng']?></td>
                        <td class="title column-zoom column-primary"><?=$item['zoom']?></td>
                    </tr>
                <?php endforeach;endif; ?>
            </tbody>
        </table></form>
</div>