(function ($) {

    var previewBoxSize = 14;

    var methods = {
        init: function (options) {
            options = $.extend({
                // Color can be dragged away
                drag: true,
                // Color can be droppend
                drop: true,
                // Double click assigns global color
                globalColor: true
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);

                var colorBox = $('<div></div>')
                    .exColorBox()
                    .on('g-color-change', function (evt, color) {
                        $this.trigger('g-color-change', color);
                    });

                $this
                    .addClass('g-block-colorbutton')
                    .data('g-colorbutton', {
                        colorbox: colorBox,
                        container: null
                    });

                // Save and remove text
                var text = $this.text();
                $this.text('');

                // Append color box
                colorBox
                    .appendTo($this);

                // Append text
                $('<span></span>')
                    .text(text)
                    .appendTo($this);

                // Append dropdown indicator
                $('<span></span>')
                    .addClass('fa fa-caret-down')
                    .appendTo($this);

                // Register for click event
                $this.on('click', function () {
                    methods.open.call(self);
                });
            });
        },

        open: function () {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            if (!data.container) {
                var container = $('<div></div>')
                    .addClass('g-block-colorbutton-container')
                    .on('click', function (evt) {
                        if ($(evt.target).hasClass('g-block-colorbutton-container')) {
                            methods.close.call(this);
                        }
                    }.bind(this))
                    .appendTo($('body'));

                var offset = $this.offset();
                $('<div></div>')
                    .css('top', (offset.top + $this.outerHeight()) + 'px')
                    .css('left', offset.left + 'px')
                    .gColorPanel()
                    .on('g-color-change', function (evt, color) {
                        methods.close.call(this);
                        methods.color.call(this, color);
                        $this.trigger('g-color-change', color);
                    }.bind(this))
                    .appendTo(container);

                data.container = container;
            }
            return this;
        },

        close: function () {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            if (data.container) {
                data.container.remove();
                data.container = null;
            }
            return this;
        },

        color: function (newColor) {
            var $this = $(this);
            $this.data('g-colorbutton').colorbox.exColorBox('color', newColor);
            return this;
        }
    };

    /**
     * Block to transform buttons to color buttons
     */
    $.fn.gColorButton = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));