(function ($) {

    var COLORPANEL = null;

    function getColorPanel() {
        if (!COLORPANEL) {
            COLORPANEL = $('<div></div>')
                .css('padding', '5px')
                .gColorPanel()
                .gOverlay();
        }
        return COLORPANEL;
    }

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
                // Whether to allow clearing the color or not
                allowClear: false,
                // Scene to be used for swatches
                scene: null
                // see options of gPatternTarget
            }, options);

            // always overwrite types to allow colors, only
            options.types = [IFPattern.Type.Color];

            var self = this;
            return this.each(function () {
                var $this = $(this);

                $this
                    .data('g-colorbutton', {
                        options: options,
                        scene: options.scene,
                        panelCloseListener: function (evt) {
                            var data = $this.data('g-colorbutton');
                            var colorPanel = getColorPanel();
                            colorPanel.gColorPanel('scene', null);
                            colorPanel.off('colorchange', data.panelChangeListener);
                            colorPanel.off('close', data.panelCloseListener);
                        },
                        panelChangeListener: function (evt, color) {
                            methods.value.call(self, color);
                            $this.trigger('colorchange', color);
                        }
                    })
                    .gPatternTarget(options)
                    .on('patternchange', function (evt, color) {
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
            var colorPanel = getColorPanel();
            colorPanel.gColorPanel('scene', data.scene);
            colorPanel.gColorPanel('value', methods.value.call(this));
            colorPanel.gColorPanel('allowClear', data.options.allowClear);
            colorPanel.on('colorchange', data.panelChangeListener);
            colorPanel.on('close', data.panelCloseListener);
            colorPanel.gOverlay('open', this);
            return this;
        },

        close: function () {
            var colorPanel = getColorPanel();
            colorPanel.gOverlay('close', this);
            return this;
        },

        scene: function (value) {
            var $this = $(this);
            var data = $this.data('g-colorbutton');

            if (!arguments.length) {
                return data.scene;
            } else {
                data.scene = value;
                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('g-colorbutton');

            if (!arguments.length) {
                return $this.gPatternTarget('value');
            } else {
                $this.gPatternTarget('value', value);

                if (!data.options.transient) {
                    $this.css('background', IFPattern.asCSSBackground(value));
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