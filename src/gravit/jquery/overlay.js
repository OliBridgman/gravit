(function ($) {
    var methods = {
        init: function (options) {
            var self = this;

            options = $.extend({
                // Default vertical position
                defaultVertical : 'start',
                // Default horizontal position
                defaultHorizontal : 'start'
            }, options);

            return this.each(function () {
                var $this = $(this)
                    .data('goverlay', {
                        vertical : options.defaultVertical,
                        horizontal : options.defaultHorizontal
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

        open: function (target, vertical, horizontal) {
            var $this = $(this);
            var data = $this.data('goverlay');

            vertical = vertical || data.vertical;
            horizontal = horizontal || data.horizontal;

            $this.parents('.g-modal-background').appendTo($('body'));

            var $window = $(window);
            var windowWidth = $window.width();
            var windowHeight = $window.height();
            var container = $this.parents('.g-overlay');
            var containerWidth = container.outerWidth();
            var containerHeight = container.outerHeight();
            var $target = $(target);
            var offset = $target.offset();
            var top = (offset.top + $target.outerHeight());
            var left = offset.left;

            // Normalize position to not run out of screen
            // TODO : Make this more solid + honor vertical / horizontal + merge with menus
            if (left + containerWidth > windowWidth) {
                left = windowWidth - containerWidth;
            }
            if (top + containerHeight > windowHeight) {
                top = windowHeight - containerHeight;
            }

            container
                .css('top', top + 'px')
                .css('left', left + 'px');

            return this;
        },

        close: function () {
            var $this = $(this);
            $this.parents('.g-modal-background').detach();
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