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


        lat = 53.902692;
        lan = 27.573522;
        zoom = 10;

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

            var myMap = new ymaps.Map("shopmap", {
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
                clusterDisableClickZoom: false,
                clusterBalloonContentBodyLayout: "cluster#balloonCarouselContent"
            });

            balloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="baloon-shop"><a class="close" href="#">×</a><div class="arrow"></div><div class="balloon-header"></div>'+
                '<div class="balloon-body"><ul><span>{{ properties.shop.name }}</span>'+
                '<li class="baloon-address">{{ properties.shop.address }}</li>'+
                '<li class="baloon-time">{{ properties.shop.time|raw }}</li>'+
                '<li class="baloon-phone">{{ properties.shop.contacts|raw }}</li>'+
                '</ul></div>'+
                '<div class="balloon-footer"><a href="#">Как проехать?</a></div></div>', {

                    build: function () {
                        this.constructor.superclass.build.call(this);
                        this._$element = $('.baloon-shop', this.getParentElement());
                        this.applyElementOffset();
                        this._$element.find('.close')
                            .on('click', $.proxy(this.onCloseClick, this));
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

                        if(!this._isElement(this._$element)) {
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
                        if (dirs.indexOf(shop.unformat.dir) >= 0) {
                            filterObjects[ind] = shop;
                        }
                    });
                }
                if(services.length > 0) {
                    $.each(filterObjects, function (ind, shop) {
                        var intersec = IntersecArrays(services, shop.unformat.service.split(','));
                        if (intersec.length == 0) {
                            delete filterObjects[ind];
                        }
                    });
                }
                $.each(filterObjects,function(ind,shop) {
                    GeoObjects.push(new ymaps.Placemark([shop.unformat.lng,shop.unformat.lat], {
                        shop: shop,
                        hintContent: [shop.unformat.lng,shop.unformat.lat],
                    }, {
                        balloonLayout: balloonLayout,
                        iconLayout: 'default#image',
                        iconImageHref: '/wp-content/plugins/asker-shops/assets/images/placemarket.png',
                        // Отключаем режим панели для балуна.
                        balloonPanelMaxMapArea: 0,
                        iconImageSize: [41, 50],
                        iconImageOffset: [-21, -41],  balloonAutoPan: true
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
                filterShops();
                return false;
            })
            $('#filter-dir,#filter-service').find('[type=checkbox]').change(filterShops);
            $('#filter-city [type=checkbox]').change(function () {
                var lng = parseFloat($(this).data('lng'));
                var lat = parseFloat($(this).data('lat'));
                var z = parseInt($(this).data('z'));
                myMap.setCenter([lat, lng], z, {});
            });
        };
        $(document).on('click','#calcRouteRemove', function(){ // пользователь кликнул на очистку маршрута
            document.getElementById('descrRoute').innerHTML = '';
            myMap.geoObjects.remove(myRoute); // удаляем ранее построенный маршрут
            document.getElementById('clearRoute').style.display = 'none';
        });
        $('#shop-trace').appendTo('.modal-wrapper');
    });
})(jQuery)