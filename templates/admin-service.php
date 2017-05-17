<div class="wrap">
    <h1 class="wp-heading-inline">Сервисы/Услуги</h1>
    <a href="#" id="add-new-page" class="page-title-action">Добавить еще</a>
    <a href="#" id="remove-page" class="page-title-action">Удалить</a>
    <form id="form-page">
        <input type="hidden" name="page" value="service">
    <table id="table-ms" class="wp-list-table widefat fixed striped pages">
        <thead>
        <td class="manage-column check-column"><input type="checkbox" id="plugins-select-all"/></td>
        <th>
            Наименование
        </th>
        </thead>
        <tbody id="the-list">
        <?php
        $items = get_option('_shopmap_service');
        if(!empty($items)):
        foreach($items as $id=>$item): ?>
            <tr class="iedit level-2">
                <th scope="row" class="check-column">
                    <input type="checkbox"></th>
                <input type="hidden" name="data[]" value="<?=$item?>"></th>
                <input type="hidden" name="ids[]" value="<?=$id?>"></th>
                <td class="title column-title column-primary"><?=$item?></td>
            </tr>
        <?php endforeach;endif; ?>
        </tbody>
    </table></form>
</div>