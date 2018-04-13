function IntersecArrays(A,B)
{
    var m = A.length, n = B.length, c = 0, C = [];
    for (var i = 0; i < m; i++)
    { var j = 0, k = 0;
        while (B[j] !== A[ i ] && j < n) j++;
        while (C[k] !== A[ i ] && k < c) k++;
        if (j != n && k == c) C[c++] = A[ i ];
    }
    return C;
}
(function ($) {
    $(document).ready(function () {

        window.selectedCity = '';

        lat = 48.3708477;
        lan = 66.99462891;
        zoom = 5;

        var	// глобальные переменные, для упрощения передачи данных между объектами Promise
            visitorLocationObject, // объект типа IDataManager, содержащий текстовый адрес нахождения посетителя
            visitorLocation, // координаты посетителя
            myRoute, // объект-текущий построенный маршрут на карте. Переменная используется для возможности очистки карты при повторном запросе без перезагрузки
            curPOI; // координаты текущей точки интереса (заполнение при клике на точке карты)

        var descrPoint = [];
        var arrPointAdress = [];
        var strPointAddress = "";
// Читаем текущие координаты пользователя
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        function success(pos) {
            visitorLocation = pos.coords;
        };
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        };
        navigator.geolocation.getCurrentPosition(success, error, options);

// Как только будет загружен API и готов DOM, выполняем инициализацию
        ymaps.ready(init);


        $(document).on('click', '.balloon-footer a', function () {
            document.getElementById('routeFrom').value = visitorLocationObject.GeocoderMetaData.text;
            $('#shop-trace').css({"visibility": "visible"});
            $('#overlay').fadeIn(400);
            $('.modal-wrapper').addClass('open');
            return false;
        });



// Инициализация карты.

        var myMap = null; // карта глобально

        function init() {

// Считываем адрес и координаты посетителя
            ymaps.geolocation.get({
// Автоматически геокодируем полученный результат.
                autoReverseGeocode: true
            }).then(function (result) {
// Отформатируем и разложим данные, полученные в результате геокодирования объекта.
                visitorLocationObject = result.geoObjects.get(0).properties.get('metaDataProperty');
                visitorLocation.latitude = result.geoObjects.position[0];
                visitorLocation.longitude = result.geoObjects.position[1];
                myMap.setCenter([visitorLocation.latitude, visitorLocation.longitude]);
                myMap.redraw();	// перерисуем карту с "уточненными" координатами посетителя
            });

            myMap = new ymaps.Map("shopmap", {
                center: [lat, lan],
                zoom: zoom,
            });
            getPointOptions = function (curPreset) {
                return {
                    openHintOnHover: true,
                    preset: curPreset,
                    draggable: false
                };
            };
            $('#calcRoute').click( function(){ // пользователь кликнул на "машинку" - просчет результата
                var VisitorLocationStr = document.getElementById('routeFrom').value;
                $('#shop-trace .close-modal').trigger('click');

                /* Прокладка маршрута, если введен адрес отправки */
                ymaps.route([VisitorLocationStr, curPOI]).then(
                    function (route) {
                        myMap.geoObjects.remove(myRoute); // удаляем ранее построенный маршрут
                        myRoute = route;	// глобальная переменная, для сохранения ссылки на построенный маршрут и очистки карты
                        myMap.geoObjects.add(route);	// помещаем новый маршрут на карту
                        var points = route.getWayPoints(),
                            lastPoint = points.getLength() - 1;
// Задаем стиль метки - иконки будут красного цвета, и
// их изображения будут растягиваться под контент.
                        points.options.set('preset', 'islands#redStretchyIcon');
// Задаем контент меток в начальной и конечной точках.
                        points.get(0).properties.set('iconContent', 'Начало пути');
                        points.get(lastPoint).properties.set('iconContent', 'Место назначения');

                        var moveList = '<h2>Описание маршрута</h2><strong>Начинаем движение</strong><ul>',
                            way,
                            expectedTime, expTimeH = 0, expTimeM = 0, expTimeS = 0,
                            segments;
// Получаем массив путей.
                        for (var i = 0; i < route.getPaths().getLength(); i++) {
                            way = route.getPaths().get(i);
                            segments = way.getSegments();
                            for (var j = 0; j < segments.length; j++) {
                                var street = segments[j].getStreet();
                                moveList += ('<li>едем ' + segments[j].getHumanAction() + (street ? ' на ' + street : '') + ', проезжаем ' + segments[j].getLength() + ' м. (~' + segments[j].getHumanTime() + '),');
                                moveList += '</li>' //'</br>'
                            }
                        }
                        expectedDistance = route.getLength();
                        expDistKm = parseInt(expectedDistance/1000);
                        expDistM = parseInt(expectedDistance-expDistKm*1000);
                        expectedTime = route.getJamsTime();
                        expTimeH = parseInt(expectedTime/3600);
                        expTimeM = parseInt((expectedTime-expTimeH*3600)/60);
                        moveList += '</ul><strong>Маршрут закончен, Вы прибыли в место назначения.</strong><br /><em>Расчетное время в пути (с учетом пробок) ' + expTimeH + 'ч. ' + expTimeM + 'мин.<br />Расчетное расстояние: ' + expDistKm + 'км ' + expDistM + 'м.</em><br />&nbsp;<br />';
// Выводим маршрутный лист.
                        $('#descrRoute').html(moveList);
                        document.getElementById('clearRoute').style.display = 'block';	// показываем кнопку стирания карты


                    },
                    function (err) {
// обработка ошибки
                        console.warn('ERROR(' + err.code + '): ' + err.message);
                        if (err.code != 500)
                            alert('Произошла ошибка при прокладке маршрута: ' + err.message);
                        else
                            alert('Попробуйте уточнить свое местоположение. Яндекс.Карты не могут построить маршрут из точки: '+visitorLocation);

                    }
                );
            });
            var shopClusterer = new ymaps.Clusterer({
                preset: 'islands#redClusterIcons',
                clusterDisableClickZoom: true,
                clusterBalloonContentBodyLayout: "cluster#balloonCarouselContent"
            });
            var pointBodyLayout =
                '<li class="baloon-address">{{ properties.shop.address }}</li>'+
                '<li class="baloon-time">{{ properties.shop.time|raw }}</li>'+
                '<li class="baloon-phone">{{ properties.shop.contacts|raw }}</li>';
            var pointFooterLayout ='<div class="balloon-footer"><a href="#">Как проехать?</a></div>';
            balloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="baloon-shop"><a class="close" href="#">×</a><div class="arrow"></div><div class="balloon-header"></div>' +
                '<div class="balloon-body"><ul><span>{{ properties.shop.name }}</span>'+
                pointBodyLayout+
                pointFooterLayout+'</ul></div></div>', {

                    build: function () {
                        this.constructor.superclass.build.call(this);
                        this._$element = $('.baloon-shop', this.getParentElement());
                        this.applyElementOffset();
                        this._$element.find('.close')
                            .on('click', $.proxy(this.onCloseClick, this));
                        var geoObject = this.getData().geoObject,
// карту
                            map = geoObject.getMap(),
                            coords = geoObject.geometry.getCoordinates(),
                            container = $(this.getParentElement());
                        container.find('.baloon-shop').each(function () {
                            $(this).css({
                                left: -Math.round($(this).outerWidth() / 2),
                                top: -$(this).outerHeight()
                            });
                            var zoom = map.getZoom(),
                                width = $(this).outerWidth(),
                                height = $(this).outerHeight(),
                                projection = map.options.get('projection'),
// переводим геокоординаты геообъекта в пиксельные
                                global = projection.toGlobalPixels(coords, zoom),
// получаем пиксельные координаты центра карты
                                center = map.getGlobalPixelCenter(),
// получаем прямоугольник баллуна в пиксельных координатах
// прямоугольник смещаем над точкой посередине
                                balloonGlobalBounds = [[global[0] - Math.round(width / 2), global[1] + 0],
                                    [global[0] + Math.round(width / 2), global[1] - height - 17]],
                                bounds = map.getBounds(),
// получаем вьюпорт карты в пиксельных координатах
                                globalBounds = [projection.toGlobalPixels(bounds[0], zoom),
                                    projection.toGlobalPixels(bounds[1], zoom)],
// инициализируем смещение
                                pan = [0, 0];
// проверяем, находится ли прямоугольник баллуна внутри прямоугольника вьюпорта
// если нет, то смещаем его и прибавляем 20 пикселей для красоты
                            if (balloonGlobalBounds[0][0] < globalBounds[0][0]) {
                                pan[0] = balloonGlobalBounds[0][0] - globalBounds[0][0] - 0
                            } else if (balloonGlobalBounds[1][0] > globalBounds[1][0]) {
                                pan[0] = balloonGlobalBounds[1][0] - globalBounds[1][0] + 20
                            }
                            if (balloonGlobalBounds[0][1] > globalBounds[0][1]) {
                                pan[1] = balloonGlobalBounds[0][1] - globalBounds[0][1] + 20
                            } else if (balloonGlobalBounds[1][1] < globalBounds[1][1]) {
                                pan[1] = balloonGlobalBounds[1][1] - globalBounds[1][1] - 20
                            }
                            if (pan[0] || pan[1]) {
                                center[0] += pan[0];
                                center[1] += pan[1];
// вызываем panTo
                                map.panTo(projection.fromGlobalPixels(center, zoom), {delay: 0, duration: 500});
                            }
                        })
                    },
                    clear: function () {
                        this._$element.find('.close')
                            .off('click');

                        this.constructor.superclass.clear.call(this);
                    },
                    onCloseClick: function (e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },
                    onSublayoutSizeChange: function () {
                        balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                        this.events.fire('shapechange');
                    },
                    applyElementOffset: function () {
                        var css = {
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(this._$element[0].offsetHeight +this._$element.find('.arrow')[0].offsetHeight+30)
                        };
                        this._$element.css(css);
                    },
                    getShape: function () {
                        if (!this._isElement(this._$element)) {
                            return balloonLayout.superclass.getShape.call(this);
                            var position = this._$element.position();
                            return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                                [position.left, position.top], [
                                    position.left + this._$element[0].offsetWidth,
                                    position.top + this._$element[0].offsetHeight + this._$element.find('.arrow')[0].offsetHeight+30
                                ]
                            ]));
                        }
                    },
                    _isElement: function (element) {
                        return element && element[0] && element.find('.arrow')[0];
                    }
                }
            ),

                myMap.geoObjects.add(shopClusterer);
            var GeoObjects = [];
            function filterShops(){
                shopClusterer.remove(GeoObjects);
                GeoObjects = [];
                var dirs = [];
                var services = [];
                $('#filter-dir [type=checkbox]:checked').each(function(){
                    dirs.push($(this).val());
                })
                $('#filter-service [type=checkbox]:checked').each(function(){
                    services.push($(this).val());
                })

                var filterObjects = {};
                if(dirs.length == 0){
                    //Клонируем объект
                    filterObjects =  JSON.parse(JSON.stringify(shops));
                }else {
                    $.each(shops, function (ind, shop) {

                        var intersec = IntersecArrays(dirs, shop.unformat.dir.split(','));
                        if (intersec.length !== 0) {
                            filterObjects[ind] = shop;
                        }
                    });
                }
                if(services.length > 0) {
                    $.each(filterObjects, function (ind, shop) {
                        var intersec = IntersecArrays(services, shop.unformat.service.split(','));
                        if (intersec.length < services.length) {
                            delete filterObjects[ind];
                        }
                    });
                }

                $('#list-shop .shop-item').remove();
                $.each(filterObjects,function(ind,shop){
                    //фильтруем список
                    if(window.selectedCity == '' || shop.cities==window.selectedCity){
                        $('#shop-item-empty .shop-item[data-shopID="'+ind+'"]').clone().appendTo('#list-shop');
                    }
                    var data = new ymaps.data.Manager({ properties: {shop: shop }});
                    var templateContentBody = new ymaps.Template('<div class="balloon-body"><ul>'+pointBodyLayout+'</ul></div>');
                    balloonContentBody = templateContentBody.build(data);
                    GeoObjects.push(new ymaps.Placemark([shop.unformat.lng,shop.unformat.lat], {
                        shop: shop,
                        balloonContentBody: balloonContentBody.text,
                        balloonContentFooter: pointFooterLayout,
                        clusterCaption: shop.name,
                        hintContent: [shop.unformat.lng,shop.unformat.lat]
                    },{
                        balloonLayout: balloonLayout,
                        iconLayout: 'default#image',
                        iconImageHref: '/wp-content/plugins/asker-shops/assets/images/placemarket.png',
                        // Отключаем режим панели для балуна.
                        balloonPanelMaxMapArea: 0,
                        iconImageSize: [41, 50],
                        iconImageOffset: [-21, -41],
                    }));
                });
                for (var i = 0, len = GeoObjects.length; i < len; i++) {
                    GeoObjects[i].events.add([
                        'balloonopen'
                    ], function (e) {
                        var obj = e.get('target');
                        var hintContent = obj.properties.get('hintContent');
                        curPOI = hintContent;	// в hintContent мы ранее записали координаты точки в формате [lat, long]
                    });
                }
                shopClusterer.add(GeoObjects);

                shopClusterer.events.add('balloonopen',
                    function (e) {
                        var clusterGeoObjects = e.get('cluster').getGeoObjects();
                        var hintContent = clusterGeoObjects[0].properties.get('hintContent');
                        curPOI = hintContent;	// в hintContent мы ранее записали координаты точки в формате [lat, long]
                    });
            }

            filterShops();
            $('.filter-reset').click(function(){
                $('#filter-dir,#filter-service').find('[type=checkbox]:checked').prop('checked',false);
                myMap.setCenter([lat, lan], zoom, {});
                filterShops();
                return false;
            })
            $('#filter-dir,#filter-service').find('[type=checkbox]').change(function () {
                filterShops();
                myMap.setCenter([lat, lan], 6, {});
            });
            $('#filter-city [type=radio]').change(function () {
                var lan = parseFloat($(this).data('lng'));
                var lat = parseFloat($(this).data('lat'));
                var z = parseInt($(this).data('z'));
                selectedCity = $(this).data('city');
                filterShops();
                myMap.setCenter([lat, lan], z, {});
            });
            $('#shopmap').click(function(){
                if(screen.width < 695) {
                    myMap.container.enterFullscreen();
                }
            });
        };
        $(document).on('click','#calcRouteRemove', function(){ // пользователь кликнул на очистку маршрута
            document.getElementById('descrRoute').innerHTML = '';
            myMap.geoObjects.add(myRoute); // обновляем путь перед удалением
            myMap.geoObjects.remove(myRoute); // удаляем ранее построенный маршрут
            document.getElementById('clearRoute').style.display = 'none';
        });
        $('#shop-trace').appendTo('.modal-wrapper');
        $('.filter-view').find('a').click(function(){
            $('.filter-view .active').removeClass('active');
            $(this).addClass('active');
            $('#shopmap,#list-shop').hide();
            $($(this).attr('href')).show();
            return false;
        })
        $('.tab-contacts > a ').click(function(){
            $('.tab-contacts-items,#tab-contacts').find('.active').removeClass('active');
            $($(this).attr('href')).addClass('active');
            $('.tab-contacts > a').removeClass('active');
            $(this).addClass('active');
            return false;
        })

        $('.tab-switch-maps-contacts > a').click(function () {
            $('#maps,#contacts').removeClass('active');
            $($(this).attr('href')).addClass('active');
            $('.tab-switch-maps-contacts > a').removeClass('active');
            $(this).addClass('active');
        })
    });
})(jQuery);