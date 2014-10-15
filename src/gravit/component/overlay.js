(function ($) {
    var openOverlayStack = [];

    document
        .addEventListener('keydown', function (evt) {
            if (openOverlayStack.length > 0) {
                if (evt.keyCode === 27) {
                    $(openOverlayStack[openOverlayStack.length - 1]).gOverlay('close');
                }
            }
        });

    document
        .addEventListener('mousedown', function (evt) {
            if (openOverlayStack.length > 0) {
                var overlay = $(openOverlayStack[openOverlayStack.length - 1]);
                var container = overlay.parents('.g-overlay');
                var containerWidth = container.outerWidth();
                var containerHeight = container.outerHeight();
                var offset = overlay.offset();

                var x = evt.pageX - offset.left;
                var y = evt.pageY - offset.top;

                if (x < 0 || y < 0 || x > containerWidth || y > containerHeight) {
                    overlay.gOverlay('close');
                }
            }
        });

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to show modal or not
                modal: false,
                // Whether to release on close or just detach
                releaseOnClose: false
            }, options);

            return this.each(function () {
                var $this = $(this)
                    .data('goverlay', {
                        options: options,
                        target: null,
                        modal: false
                    });

                $('<div></div>')
                    .addClass('g-overlay')
                    .css('position', 'absolute')
                    .append($this);
            });
        },

        relayout: function () {
            var $this = $(this);
            var data = $this.data('goverlay');
            if (!data.target) {
                return;
            }

            var container = $this.parents('.g-overlay');
            var $window = $(window);
            var windowWidth = $window.width();
            var windowHeight = $window.height();
            var containerWidth = container.outerWidth();
            var containerHeight = container.outerHeight();
            var $target = $(data.target);
            var offset = $target.offset();
            var top = offset.top;
            var left = offset.left;
            var right = offset.left + $target.outerWidth();
            var bottom = offset.top + +$target.outerHeight();

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

            if (y < 0) {
                y = 0;
            }
            if (x < 0) {
                x = 0;
            }

            container
                .css('left', x + 'px')
                .css('top', y + 'px');
        },

        open: function (target, modal) {
            var $this = $(this);
            var data = $this.data('goverlay');
            var options = data.options;
            data.target = target;
            data.modal = modal;

            var container = $this.parents('.g-overlay');

            var modal = modal || options.modal;
            if (modal) {
                $('<div></div>')
                    .addClass('g-overlay-modal')
                    .append(container)
                    .appendTo($('body'));
            } else {
                container.appendTo($('body'));
            }

            methods.relayout.call(this);

            openOverlayStack.push(this[0]);

            return this;
        },

        close: function () {
            var $this = $(this);
            var data = $this.data('goverlay');

            if (openOverlayStack.length && openOverlayStack[openOverlayStack.length - 1] === this[0]) {
                data.modal = false;
                data.target = null;
                var options = data.options;

                $this.trigger('close');

                var modal = $this.parents('.g-overlay-modal');

                if (options.releaseOnClose) {
                    $this.parents('.g-overlay').remove();
                } else {
                    $this.parents('.g-overlay').detach();
                }

                if (modal.length) {
                    modal.remove();
                }

                openOverlayStack.pop();
            }

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