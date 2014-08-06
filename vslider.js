
define([
    "lib/lodash"
], function(_) {
"use strict";

// 获取屏幕的形状类型
// () => [vertical|horizontal]::string
var _getScreenType = _.once(function() {

    var $window = $(window),
        screenWidth = $window.width(),
        screenHeight = $window.height();

    if (screenWidth > screenHeight) {
        var sharp = "vertical";
    } else {
        var sharp = "horizontal";
    }

    return sharp;
});

//
// @param $thumbnail
// @param $slider
// @param images 中需要传递的就是图片的 url 
//        url 一共有三种尺寸 small, big, origin
//        exp: images = [{"src/test1.jpg"}] 
// @param thumbnailMapper 是需要传入的将 imgaes 映射为 html 元素的方法
// @param bigImageMapper 是将 images 映射为大图列表的方法
//
var vslider2 = function($thumbnail, $slider) {

    // 记录是否已经生成了相关的 $dom 元素
    var is_fulfill_$thumbnail = false,
        is_fulfill_$slider = false;

    return function(images) {
        return function(thumbnailUrlMapper, bigImageUrlMapper) {

            var hide = function() {
            };

            var show = function() {
            };

            // 完全删除相关的 dom
            var destory = function() {
            };

            var unbindEvent = function() {
            };

            var bindEvent = function() {
            };

            var _renderTumbnailItemBox = function(url, index) {
                return '<div class="item-box" data-index="' + index + '"data-url="' + url + '">box</div>'
            };

            // 先生成 box 将 url 作为 data 挂在 dom 元素上
            // 之后生成 image 对象 初始化 onload 事件 完成后销毁 image 对象
            var _initThumbnail = function(images) {
                var index = 1;

                var $itemBoxs = _.map(images, function(item) {

                    var mapped_url = thumbnailUrlMapper(item.origin_url),
                        $itemBox = $(_renderTumbnailItemBox(index, mapped_url));

                    index += 1;

                    _.defer(function() {
                        var image = new Image();
                        image.src = mapped_url;
                        image.onload = function() {
                            // 加载完成 插入 box
                            $itemBox.html('<img src="' + mapped_url + '">');
                        };
                    });

                    return $itemBox;
                });

                _.forEach($itemBoxs, function($itemBox) {
                    $thumbnail.append($itemBox);
                });
            };

            var init = function() {
                if (!_.isArray(images)) {
                    throw new Error("images must be a Array");
                }

                var imagesCount = images.length,
                    // 当前显示的照片编号
                    imageCurrentIndex = 1,
                    screenType = _getScreenType();

                if (!is_fulfill_$thumbnail) {
                    _initThumbnail(images);
                    is_fulfill_$thumbnail = true;
                }
            };

            init();
        };
    };
};

return vslider2;

});



