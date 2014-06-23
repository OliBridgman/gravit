(function ($) {
    var openOverlayStack = [];

    document.addEventListener('keydown', function (evt) {
        if (openOverlayStack.length > 0) {
            if (evt.keyCode === 27) {
                openOverlayStack[openOverlayStack.length - 1].gOverlay('close');
            }
        }
    });

    var methods = {
        init: function (options) {
            var self = this;

            options = $.extend({
                // Whether to release on close or just detach
                releaseOnClose: false
            }, options);

            return this.each(function () {
                var $this = $(this)
                    .data('goverlay', {
                        releaseOnClose: options.releaseOnClose
                    });

                var overlay = $('<div></div>')
                    .addClass('g-modal-background')
                    .on('click', function (evt) {
                        if ($(evt.target).hasClass('g-modal-background')) {
                            methods.close.call(self);
                        }
                    });

                var container = $('<div></div>')
                    .addClass('g-overlay')
                    .css('position', 'absolute')
                    .append($this)
                    .appendTo(overlay);
            });
        },

        open: function (target) {
            var $this = $(this);
            var data = $this.data('goverlay');

            $this.parents('.g-modal-background').appendTo($('body'));

            var $window = $(window);
            var windowWidth = $window.width();
            var windowHeight = $window.height();
            var container = $this.parents('.g-overlay');
            var containerWidth = container.outerWidth();
            var containerHeight = container.outerHeight();
            var $target = $(target);
            var offset = $target.offset();
            var top = offset.top;
            var left = offset.left;
            var right = offset.left + $target.outerWidth();
            var bottom = offset.top +  + $target.outerHeight();

            // By default we try to position at left-bottom
            // but need to check whether we run out of window
            // and eventually adjust positioning
            var x = left;
            var y = bottom;

            if (x + containerWidth > windowWidth) {
                x = right - containerWidth;
            }
            if (x + containerWidth > windowWidth) {
                x = windowWidth - containerWidth;
            }

            if (y + containerHeight > windowHeight) {
                y = top - containerHeight;
            }
            if (y + containerHeight > windowHeight) {
                y = windowHeight - containerHeight;
            }

            container
                .css('left', x + 'px')
                .css('top', y + 'px');

            openOverlayStack.push($this);

            return this;
        },

        close: function () {
            var $this = $(this);
            var data = $this.data('goverlay');

            this.trigger('close');

            if (data.releaseOnClose) {
                $this.parents('.g-modal-background').remove();
            } else {
                $this.parents('.g-modal-background').detach();
            }

            openOverlayStack.pop();

            return this;
        }
    };

    /**
     * Block to create an overlay
     */
    $.fn.gOverlay = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));