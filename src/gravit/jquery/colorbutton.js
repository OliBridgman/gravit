(function ($) {
    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to show a swatch or not
                swatch: true
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);

                var colorswatch = null;

                if (options.swatch) {
                    colorswatch = $('<div></div>')
                        .gColorSwatch({
                            drag: false,
                            drop: false,
                            globalColor: false
                        })
                        .on('change', function (evt, color) {
                            $this.trigger('change', color);
                        });
                }

                var colorpanel = $('<div></div>')
                    .gColorPanel(options)
                    .gOverlay({
                        vertical: 'end',
                        horizontal: 'start'
                    })
                    .on('change', function (evt, color) {
                        methods.close.call(self);
                        methods.value.call(self, color);
                        $this.trigger('change', color);
                    });

                $this
                    .addClass('g-color-button')
                    .gColorTarget(options)
                    .data('g-colorbutton', {
                        colorswatch: colorswatch,
                        colorpanel: colorpanel,
                        container: null
                    })
                    .on('change', function (evt, color) {
                        methods.value.call(self, color);
                    });

                // Save and remove text
                var text = $this.text();
                $this.text('');

                // Append swatch if any
                if (colorswatch) {
                    $this.append(colorswatch);
                }

                // Append text
                $('<span></span>')
                    .text(text)
                    .appendTo($this);

                // Append dropdown indicator with space
                $('<span></span>')
                    .addClass('fa fa-caret-down')
                    .appendTo($this);

                $this.on('click', function () {
                    methods.open.call(self);
                });
            });
        },

        open: function () {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            data.colorpanel.gOverlay('open', this);
            return this;
        },

        close: function () {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            data.colorpanel.gOverlay('close', this);
            return this;
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            var colorswatch = data.colorswatch;
            var colorpanel = data.colorpanel;

            if (!arguments.length) {
                colorpanel.gColorPanel('value', value);
            } else {
                if (colorswatch) {
                    colorswatch.gColorSwatch('value', value);
                }
                colorpanel.gColorPanel('value', value);
                $this.gColorTarget('value', value);
                return this;
            }
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