(function ($) {
    $(document).ready(function () {
        window.MS = {
            saveForm:function (callback,event) {
                var data = $('#form-page').serialize();
                $.ajax({
                    data: data,
                    type: 'POST',
                    url: '/wp-admin/admin-ajax.php?action=sm_SaveData&event='+event,
                    success:function(data){
                        if (!(typeof(callback)=='undefined')) {
                            callback(data);
                        }
                    }
                });
            },
            initSubPages: function () {
                $("#table-ms tbody").sortable({
                    axis: 'y',
                    update: function (event, ui) {
                        MS.saveForm();
                    }
                });
                $(document).on('click', '#remove-page', function () {
                    $('#table-ms tbody [type=checkbox]:checked').closest('tr').remove();
                    MS.saveForm();
                    return false;
                })
                $(document).on('click', '#add-new-page', function () {
                    var name = prompt("Название", "");
                    if ($('#form-page [name="page"]').val() == 'city') {
                        var lng = prompt("Широта", "");
                        if(!lng){
                            return false;
                        }
                        var lat = prompt("Долгота", "");
                        if(!lat){
                            return false;
                        }
                        var zoom = prompt("Зум", "11");
                        if(!zoom){
                            return false;
                        }
                    }
                    if (name) {
                        var htmlEl = ' <tr class="iedit level-2 need-id"> <th scope="row" class="check-column">';
                        htmlEl += '<input type="checkbox" ></th>';
                        htmlEl += '<input type="hidden" name="data[]" value="' + name + '"></th>';

                        if ($('#form-page [name="page"]').val() == 'city') {
                            htmlEl += '<input type="hidden" name="lng[]" value="' + lng + '"></th>';
                            htmlEl += '<input type="hidden" name="lat[]" value="' + lat + '"></th>';
                            htmlEl += '<input type="hidden" name="zoom[]" value="' + zoom + '"></th>';
                        }
                        htmlEl += '<td class="title column-title column-primary">' + name + '</td>';

                        if ($('#form-page [name="page"]').val() == 'city') {
                            htmlEl += '<td class="title column-lng column-primary">' + lng + '</td>';
                            htmlEl += '<td class="title column-lat column-primary">' + lat + '</td>';
                            htmlEl += '<td class="title column-zoom column-primary">' + zoom + '</td>';
                        }
                        htmlEl += '</tr>';
                        $('#table-ms tbody').append(htmlEl);
                        MS.saveForm(function (id) {
                            $('.need-id').append('<input type="hidden" name="ids[]" value="' + id + '"></th>')
                                .removeClass('need-id');
                        }, 'add');
                    }
                    return false;
                })
            },
            initShopPage:function () {
                if($('#shop-form').length == 0){
                    return false;
                }
               $(document).on('submit','#shop-form',function(){
                   var data = $(this).serialize();
                   $.ajax({
                       data: data,
                       type: 'POST',
                       url: '/wp-admin/admin-ajax.php?action=sm_updateShop',
                       success:function(shop){
                           var rowTable = '';
                           var dataRow = '';
                           shop = JSON.parse(shop);
                           $.each(shop.unformat,function(ind,item){
                               dataRow += 'data-'+ind+'="'+item+'" ' ;
                           });
                           rowTable = '<tr class="shop-'+shop.id+'"> \
                           <th scope="row" class="check-column"> \
                               <input type="checkbox"> \
                               <span class="data-shop" '+dataRow+'> \
                               </span></th> \
                               <td>'+shop.name+'</td> \
                               <td>'+shop.cities+'</td> \
                               <td>'+shop.address+'</td> \
                               <td width="50">'+shop.index+'</td> \
                               <td>'+shop.dir+'</td> \
                               <td>'+shop.service+'</td> \
                           <td>'+shop.contacts+'</td> \
                           <td>'+shop.time+'<a class="button-edit dashicons-edit dashicons-before alignright" href="#"></a></td> \
                               </tr>';

                           if($('.shop-'+shop.id).length > 0){
                               $('#the-list').find('.shop-'+shop.id).replaceWith(rowTable);
                           }else {
                               $('#the-list').append(rowTable);
                           }
                       }
                   });
                    return false;
               });
                var quickEdit = $('#quick-edit-blank');
                $(document).on('click','.button-edit',function(){
                    $('#shop-form .quick-edit-row-post').remove();
                    quickEdit.find('')
                    $('#shop-form table').prepend(quickEdit.html());
                    return false;
                });
                $(document).on('click','#add-new-shop',function(){
                    $('#shop-form .quick-edit-row-post').remove();
                    $('#shop-form table').prepend(quickEdit.html());
                    return false;
                });

                $(document).on('click', '#remove-shops', function () {
                    var ids = [];
                    $('#shop-form tbody [type=checkbox]:checked').parent().each(function(){
                        ids.push($(this).find('.data-shop').data('id'));
                    });
                    $('#shop-form tbody [type=checkbox]:checked').closest('tr').remove();
                    $.ajax({
                            data: {'ids':ids},
                            type: 'POST',
                            url: '/wp-admin/admin-ajax.php?action=sm_removeShops'
                    });
                    return false;
                })
                $(document).on('click','.button-edit',function(){
                    $('#shop-form .quick-edit-row-post').remove();
                    $(this).closest('tr').after(quickEdit.html());
                    var shop = $(this).closest('tr').find('.data-shop');
                    var shopElem = {
                        'id' : $(shop).data('id'),
                        'name' : $(shop).data('name'),
                        'cities' : $(shop).data('cities'),
                        'address' : $(shop).data('address'),
                        'index' : $(shop).data('index'),
                        'dir' : $(shop).data('dir').toString().split(','),
                        'service' : $(shop).data('service').toString().split(','),
                        'contacts' : $(shop).data('contacts'),
                        'lng' : $(shop).data('lng'),
                        'lat' : $(shop).data('lat'),
                        'time' : $(shop).data('time')
                    };
                    console.log(shopElem);
                    var newQuickEdit = $('#shop-form .quick-edit-row-post');
                    $.each(shopElem,function(name,value){
                        if(value instanceof Array){
                            $.each(value,function(ind,item){
                                newQuickEdit.find('[name="'+name+'[]"][value='+item+']').attr('checked', true);
                            });
                        }else{
                            newQuickEdit.find('[name='+name+']').val(value);
                        }
                    })
                })

                $(document).on('click','#shop-form .cancel',function(){
                    $('#shop-form .quick-edit-row-post').remove();
                })
                $(document).on('click','#shop-form .save',function(){
                    $('#shop-form .submit').click();
                    return false;
                })
            },
            init: function () {
                this.initSubPages();
                this.initShopPage();
            }
        };
        MS.init();
    })
})(jQuery);