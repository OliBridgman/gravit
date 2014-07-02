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
                autoOpen: true
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
                    .on('colorchange', function (evt, color) {
                        methods.value.call(self, color);
                        $this.trigger('colorchange', color);
                    });

                $this
                    .gColorTarget(options)
                    .data('g-colorbutton', {
                        options: options,
                        colorpanel: colorpanel
                    })
                    .on('colorchange', function (evt, color) {
                        methods.value.call(self, color);
                    });

                if (!options.transient) {
                    // Add an invisible placeholder for sizing
                    $this
                        .addClass('g-cursor-pipette')
                        .append($('<span></span>')
                            .addClass('fa fa-fw fa-ban')
                            .css('visibility', 'hidden'));
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
            data.colorpanel.gColorPanel('value', methods.value.call(this));
            data.colorpanel.gOverlay('open', this);
            return this;
        },

        close: function () {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            data.colorpanel.gOverlay('close', this);
            return this;
        },

        scene: function (value) {
            var $this = $(this);
            var data = $this.data('g-colorbutton');
            var result = data.colorpanel.gColorPanel('scene', value);
            return !arguments.length ? this: result
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('g-colorbutton');

            if (!arguments.length) {
                return $this.gColorTarget('value');
            } else {
                $this.gColorTarget('value', value);

                if (!data.options.transient) {
                    $this.css(IFColor.blendedCSSBackground(value));
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