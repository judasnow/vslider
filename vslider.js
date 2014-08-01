define([], function() {
"use strict";

// apis
//
// imgCount
// imgIndex
// initIndex
// goIndex()
// goNext()
// goPrev()
// isFirst()
// isLast()
// distory()
//

var newImageItem = function(screenWidth, imgSrc) {
    return "<li style='min-width: " +
            screenWidth + "px;'><i class='fa fa-circle-o-notch fa-spin loading'></i>" +
            "<img style='min-width:100%;position:relative;' src='" +
            imgSrc + "' onload=''></li>";
};

var big_img_suffix= "!t320.jpg";

var castBigImzgSrc = function(originSrc) {
    return originSrc.split("!")[0] + big_img_suffix;
};

var cropPx = function(left) {
    return parseInt(left.substr(0, left.length - 2));
};


var hide = function() {
    console.dir("should hide")
};


//
// 获取需要 slider 之的图片列表
// 并初始化一个 slider dom 元素
//
var vslider = function(imgs) {

    if (!("length" in imgs && imgs.length > 0)) {
        return false;
    }

    var imgsCount = imgs.length,
        imgIndex = 1,
        initIndex = 1,

        // 初始化 slider list
        // 根据 img 的数量以及屏幕的 尺寸 设置一个 slider dom
        $window = $(window),
        screenWidth = $window.width(),
        screenHeight = $window.height(),

        $vslider = $("#vslider"),
        $vsliderList = $vslider.find("ul");

        // 判断屏幕形状
        if (screenWidth > screenHeight) {
            var sharp = "vertical";
        } else {
            var sharp = "horizontal";
        }

    // @TODO 自动生成
    //if ($slider.length == 0) {
    //   $slider = $("<div id='vslider'></div>");
    //}

    var init = function() {
        // 初始化处理 删除之前的元素以及
        // 绑定的事件
        $vsliderList.html("");
        $vsliderList.off("tap");
        $vsliderList.off("touchmove");
        $vsliderList.off("touchstart");
        $vsliderList.off("touchend");
    };
    init();

    var goIndex = function(index) {
        
    };

    var goNext = function() {
        var nowLeft = cropPx($vsliderList.css("left"));

        if (imgIndex === imgsCount) {
            // 已经到了最后一张
            $vsliderList.animate({left: (nowLeft - screenWidth/2) + "px"},
                {duration: 128, easing: "ease-in-out", complete: function() {
                    $vsliderList.animate({left: -(imgsCount - 1)*screenWidth + "px"}, 128, "ease-in-out");
                }});
        } else {
            // 移动到后一张
            imgIndex = imgIndex + 1;
            var left = 0 - parseInt((imgIndex - 1) * parseInt(screenWidth));
            $vsliderList.animate({left: left + "px"}, {duration: 128, easing: "ease-in-out", complete: function() {
                
            }});
        }
    };

    var goPrev = function() {
        // 向前滚动 如果当前的 left 值 大于0 则
        // 证明已经是第一张图片了
        var nowLeft = cropPx($vsliderList.css("left"));

        if (imgIndex === 1) {
            // 在第一张的情况之下 仍然尝试右滑动
            // 将会执行一个动画
            $vsliderList.animate({left: screenWidth/2 + "px"},
                {duration: 128, easing: "ease-in-out", complete: function() {
                    $vsliderList.animate({left: 0}, 64, "ease-in-out");
                }});
        } else {
            // 移动到前一张
            imgIndex = imgIndex - 1;
            var left = 0 - parseInt((imgIndex-1) * parseInt(screenWidth));
            $vsliderList.animate({left: left + "px"}, {duration: 128, easing: "ease-in-out", complete: function() {
                
            }});
        }
    };

    // calc and bind styles
    $vsliderList.css({"width": imgsCount * screenWidth, "height": "100%"});

    // 添加 imgs 
    // @TODO 在图片没有加载完成之前 li 仍然需要作为一个可以
    //       左右滑动事件的元素存在 所以这样看来的话 需要将 swipe 时间绑定在
    var sliderItems = _.reduce(imgs, function(items, item) {

        // 生成 image 对象进行一个预先的加载
        var img = new Image(),
            imgSrc = castBigImgSrc($(item).attr("src"));

        img.src = imgSrc;

        // 使用 url 进行 img 识别
        img.onload = function() {
            // 成功加载完成图片之后隐藏 loading gif
            var $imgInDom = $vsliderList.find("img[src='" + imgSrc + "']");

            // the loading li
            $imgInDom.prev().hide();

            // 如果尺寸超出了 screen 则按 5% 阶梯式减少尺寸 最小值是 50%
            var prec = 100;

            // 计算百分比 最小 50%
            var calcPrec = function(prec) {
                var precText = "50%";
                if ((prec-5) > 50) {
                    precText = (prec-5).toString() + "%";
                }
                return precText;
            }

            var height = $imgInDom.get(0).height,
                width = $imgInDom.get(0).width;

            // 尽量保证图片可以在屏幕中完整的显示出来
            var tuningImage = function() {
                // 加载完成之后调整图片尺寸
                var height = $imgInDom.get(0).height,
                    width = $imgInDom.get(0).width;

                if (height > screenHeight || width > screenWidth) {
                    if (calcPrec(prec) === "50%") {
                        return;
                    }

                    if ($imgInDom.css("max-width") !== "0px") {
                        $imgInDom.css("max-width", calcPrec(prec));
                    } else if ($imgInDom.css("max-height") !== "0px") {
                        $imgInDom.css("max-height", calcPrec(prec));
                    }

                    //tuningImage();
                } else {
                    return;
                }
            };
            tuningImage();

            // 水平居中显示
            if (sharp === "horizontal" && height !== 0 || true) {
                $imgInDom.css({"margin-top": -(Math.ceil(height/2)) + "px", top: "50%"});
            }
        };

        // @XXX 这里似乎应该先不添加 img 加载完成之后再添加
        //  但是这样的话 还是需要将其放在另外的地方才可以获得其
        //  尺寸
        if (sharp === "horizontal") {
            items = items + "<li style='min-width: " +
                    screenWidth + "px;'><i class='fa fa-circle-o-notch fa-spin loading'></i>" +
                    "<img style='max-width:100%;position:relative;' src='" +
                    imgSrc + "'></li>";
        } else {
            items = items + "<li style='min-width: " +
                    screenWidth + "px;'><i class='fa fa-circle-o-notch fa-spin loading'></i>" +
                    "<img style='max-height:100%;position:relative;' src='" +
                    imgSrc + "'></li>";
        }

        return items;
    }, "");
    // 需要先清空之前的数据
    $vsliderList.append(sliderItems);

    // 绑定事件

    // @TODO 挂上一个 class 应该可以减少性能损失 因为
    //       需要遍历的元素变少了
    //$vslider.on("swipeRight", "img", goPrev);
    //$vslider.on("swipeLeft", "img", goNext);

    (function() {

        // 目前只需记录 x 轴
        var touchmoveCounter = 0,
            touchmoveBeginX = 0,
            //touchmoveEndX = 0,
            toLeft = false,
            toRight = false,
            beginLeft = 0,
            delta = 0;

        // 点击任何一张图片 显示 slider 本身
        imgs.on("tap", function(event) {
            $vslider.show();
        });

        // 点击 li 关闭 slider 的显示
        $vsliderList.on("tap", "li", function(event) {
            $vslider.hide();
        });

        $vsliderList.on("touchstart", "li", function(event) {
            toLeft = false;
            toRight = false;
            touchmoveBeginX = event.touches[0].pageX;
            beginLeft = cropPx($vsliderList.css("left"));
        });

        $vsliderList.on("touchend", "li", function(event) {
            if (Math.abs(delta) <= 32) {
                // 移动的距离比较小 就回复原来的位置
                $vsliderList.css("left", beginLeft + "px");
            } else {
                if (delta < 0) {
                    goNext();
                } else {
                    goPrev();
                }
            }
        });

        $vsliderList.on("touchmove", "li", function(event) {
            // {0, screenWidth}
            var touchmoveX = event.touches[0].pageX;

            delta = touchmoveX - touchmoveBeginX;
            var left = beginLeft + delta;

            $vsliderList.css("left", left + "px");
        });

    })();

    $vslider.on("tap", "img", hide);

};

return vslider;

});



