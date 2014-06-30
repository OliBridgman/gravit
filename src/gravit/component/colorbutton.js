(function ($) {
    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to behave as button or not, which, in the latter case,
                // means that the target element will only react on clicking but
                // not behave like a button with icon and background color
                transient: false,
                // Whether to automatically open the color chooser on click
                // or wait for a manual call to the open function
                autoOpen: true,
                // see options of gColorTarget
                // see options of gColorPanel
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);

                var colorpanel = $('<div></div>')
                    .css('padding', '5px')
                    .gColorPanel(options)
                    .gOverlay()
                    .on('change', function (evt, color) {
                        methods.close.call(self);
                        methods.value.call(self, color);
                        $this.trigger('change', color);
                    });

                $this
                    .gColorTarget(options)
                    .data('g-colorbutton', {
                        options: options,
                        colorpanel: colorpanel
                    })
                    .on('change', function (evt, color) {
                        methods.value.call(self, color);
                    });

                if (!options.transient) {
                    $this
                        .addClass('g-icon g-cursor-pipette')
                        .css('color', 'transparent')
                        .html('&#xe73c;');
                }

                if (options.autoOpen) {
                    $this
                        .on('click', function () {
                            methods.open.call(self);
                        })
                }
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
            var colorpanel = data.colorpanel;

            if (!arguments.length) {
                return $this.gColorTarget('value');
            } else {
                colorpanel.gColorPanel('value', value);
                $this.gColorTarget('value', value);

                if (!data.options.transient) {
                    $this.css({
                        'color': value ? 'transparent' : data.options.clearColor ? '' : 'transparent',
                        'background': value ? value.asCSSString() : 'transparent'
                    });
                }

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