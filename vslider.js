//
// vslider3
//
define([
    "lib/lodash"
],
function(_) {
"use struct";


// helper {{{
var cropPx = function(pxString) {
    if (pxString === "auto") {
        return 0;
    } else {
        return parseInt(pxString.substr(0, pxString.length - 2));
    }
};

// 将传入的 images 转化为延迟加载的列表 并返回相应的 dom 元素
//
// @param images {Array}
// @param urlMapper {Function} 用来映射 image.url
// @param render {Function} 用来渲染相应的 html
// @param imgOnload {Function} 图片加载成功之后的回调
//
// @return $dom
//
// @TODO 缺点是不能单独的为一个 img 元素增加回调
//
var initImageList = function(images, urlMapper, render, imgOnload) {

    var index = 1;

    var $itemBoxs = _.map(images, function(item) {

        var mapped_url = urlMapper($(item).attr("src")),
            $itemBox = $(render(mapped_url, index));

        index += 1;

        _.defer(function() {
            var image = new Image();
            image.src = mapped_url;

            image.onload = function() {
                var $image = $('<img src="' + mapped_url + '">');

                // 加载完成 插入 box
                if (_.isFunction(imgOnload)) {
                    imgOnload($image);
                }

                $itemBox.html($image);
            };
        });

        return $itemBox;
    });

    return $itemBoxs;
};
// }}}


// Slider {{{
var Slider = function($sliderBox, $images, options) {
    var that = this;

    this._$sliderBox = $sliderBox;
    this._$slider = $sliderBox.find(".slider");

    this._$images = $images;
    this._imagesCount = $images.length;
    // 当前显示的图像编号
    this._currentImageIndex = 1;
    // 为 true 的时候 不相应用户的滑动操作
    this._sliderLock = false;
    // 因为用户对于同一个 slider 会进行 多次的的 hide , show 操作
    // 因此这个变量记录的是不是已经 
    this._isRender = false;

    this._bigUrlMapper = options.bigImageMapper;

    if (this._imagesCount === 0) {
        console.log("image count 0");
        return false;
    }

    // 点击图片开始显示 slider
    $images.on("tap", function(event) {
        var $currentTarget = $(event.currentTarget);

        that._currentImageIndex = $currentTarget.data("index");
        that._show();
    });

    this._getScreenSize();
    this._getScreenSize();
    this._bindEvents();
};

Slider.prototype._getScreenSize = function() {
    // 屏幕信息的初始化
    var $window = $(window);

    this._screenWidth = $window.width();
    this._screenHeight = $window.height();

    if (this._screenWidth > this._screenHeight) {
        this._screenType = "horizontal";
        this._deltaTrigger = this._screenWidth / 3;
        // 用来确定 item-box 的宽度
        this._baseScreenSize = this._screenWidth;
    } else {
        this._screenType = "vertical";
        this._deltaTrigger = this._screenHeight / 3;
        this._baseScreenSize = this._screenWidth;
    }
};

Slider.prototype._tuningSliderImage = function($image) {
    var image = $image.get(0);

    if (this._screenType === "horizontal") {
        $image.css({
            "max-height": this._screenHeight,
            "min-height": this._screenHeight
        });
    } else {

        $image.css({
            "max-height": this._screenWidth,
            "min-height": this._screenWidth
        });

        // 竖屏的水平居中显示
        $image.css({
            "margin-top": -(Math.ceil(this._screenWidth/2)) + "px",
            top: "50%"
        });
    }
};

// 进行显示之前的初始化
// 需要参考的要素是
//
// 1    slider 内容是否已经渲染
// 2    当前的 imageIndex
//
Slider.prototype._init = function() {
    console.dir("slider init");

    if (!this._isRender) {
        console.log("will render");

        this._isRender = true;
        this._render();
    } else {
        console.log("just show");
    }

    // 根据提供的 index 定位到指定的图片
    this._animateSetLeft(
        this._$slider,
        // @XXX 这里到底用不用 this ?
        this._calcLeft(this._currentImageIndex, this._baseScreenSize)
    );
};

Slider.prototype._render = function() {
    var that = this;

    this._$sliderBox.width(this._screenWidth * this._imagesCount);

    // @XXX 这里应该传入的应该是 url 的数组
    //      修改之后 函数内部获取 url 的方法也需要更新
    var $sliderItemBoxs = initImageList(
        this._$images,
        this._bigUrlMapper,
        this._renderTumbnailItemBox,

        this._tuningSliderImage.bind(this)
    );

    _.forEach($sliderItemBoxs, function($itemBox) {
        $itemBox.width(that._screenWidth);
        $itemBox.height(that._screenHeight);

        that._$slider.append($itemBox);
    });
};

Slider.prototype._goNext = function() {
   var nowLeft = cropPx(this._$slider.css("left"));

   if (this._currentImageIndex === this._imagesCount) {
        // 已经到了最后一张
        // 恢复到之前的位置
        var left = this._calcLeft(this._currentImageIndex, this._screenWidth);
        this._animateSetLeft(this._$slider, left);
    } else {
        // 移动到后一张
        this._currentImageIndex = this._currentImageIndex + 1;
        var left = this._calcLeft(this._currentImageIndex, this._screenWidth);
        this._animateSetLeft(this._$slider, left);
    }
};

Slider.prototype._goPrev = function() {
    // 向前滚动 如果当前的 left 值 大于0 则
    // 证明已经是第一张图片了
    var nowLeft = cropPx(this._$slider.css("left"));

    if (this._currentImageIndex === 1) {
        // 在第一张的情况之下 仍然尝试左滑动
        // 则会从用户 touchend 的位置回复到 0
        this._animateSetLeft(this._$slider, 0);
    } else {
        // 移动到前一张
        this._currentImageIndex = this._currentImageIndex - 1;

        var left = this._calcLeft(this._currentImageIndex, this._screenWidth);
        this._animateSetLeft(this._$slider, left);
    }
};

// 设置 left 的时候需要的动画
Slider.prototype._animateSetLeft = function($slider, left, cb) {
    $slider.animate(
        {left: left + "px"},
        {duration: 128,
         easing: "ease-in-out",
         complete: function() {
             if(_.isFunction(cb)) {
                cb();
             }
             this._sliderLock = false;
         }});
};

Slider.prototype._bindEvents = function() {
    var that = this;

    var touchmoveCounter = 0,
        touchmoveBeginX = 0,
        //touchmoveEndX = 0,
        toLeft = false,
        toRight = false,
        beginLeft = 0,
        delta = 0;

    this._$sliderBox.on("tap", function(event) {
        // 单击隐藏 slider
        that._hide();
    });

    this._$sliderBox.on("touchstart", "li", function(event) {
        if (that._sliderLock) {
            return;
        } else {
            toLeft = false;
            toRight = false;
            touchmoveBeginX = event.touches[0].pageX;
            beginLeft = cropPx(that._$slider.css("left"));
        }
    });

    this._$sliderBox.on("touchend", "li", function(event) {
        if (that._sliderLock) {
            return;
        } else {

            if (Math.abs(delta) <= Math.abs(this._screenWidth/4)) {
                // 移动的距离比较小 就回复原来的位置
                $slider.animate(
                    {left: beginLeft + "px"},
                    {duration: 100, easing: "ease-in"}
                );
            } else {

                // 锁住切换行为
                this._sliderLock = true;

                if (delta < 0) {
                    that._goNext();
                } else {
                    that._goPrev();
                }
            }

            delta = 0;
        }
    });

    this._$sliderBox.on("touchmove", "li", function(event) {
        if (that._sliderLock) {
            return;
        } else {
            var touchmoveX = event.touches[0].pageX;

            delta = touchmoveX - touchmoveBeginX;
            var left = beginLeft + delta;

            that._$slider.animate(
                {left: left + "px"},
                {duration: 300, easing: "ease-in-out"}
            );
        }
    });

};

Slider.prototype._unBindEvents = function() {
    
};

Slider.prototype._show = function() {
    this._init();
    this._$sliderBox.show();
};

Slider.prototype._hide = function() {
    this._$sliderBox.fadeOut("fast");
};

Slider.prototype._destory = function() {
    
}

// 根据当前的 imageIndex 计算相应的 slider 元素 left 属性的值
Slider.prototype._calcLeft = function(imageIndex, screenWidth) {
    return 0 - parseInt((imageIndex - 1) * parseInt(screenWidth));
};

// 根据 url 以及序号 生成
Slider.prototype._renderTumbnailItemBox = function(url, index) {
    return '<li class="slider-item-box" data-index="' +
        index + '"data-url="' + url + '"></li>'
};
//}}}

// 在 options 中需要提供一个 bigImageMapper 方法，将 images 映射为一个大图 url
var vslider = function($sliderBox, $images, options) {
    var slider = new Slider(
        $sliderBox,
        $images,
        {
            bigImageMapper: function(url) {
                return url + "!c180x180.jpg";
            }
        }
    );
};

return vslider;

});


