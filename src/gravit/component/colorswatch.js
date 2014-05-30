(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
                // Wether to show null color value or not
                clearColor: true
                // see options of gColorTarget
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .addClass('g-color-swatch g-cursor-hand-open')
                    .html('&nbsp;')
                    .data('gcolorswatch', {
                        clearColor: options.clearColor
                    })
                    .gColorTarget(options)
                    .on('change', function (evt, color) {
                        methods.value.call(self, color);
                    });
            });
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('gcolorswatch');

            if (!arguments.length) {
                return $this.gColorTarget('value');
            } else {
                $this.gColorTarget('value', value);
                var color = $this.gColorTarget('value');

                if (color) {
                    $this.css('background', color.asCSSString());
                } else {
                    if (data.clearColor) {
                        $this.css('background', 'linear-gradient(135deg, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 40%,rgba(203,0,11,1) 50%,rgba(255,255,255,1) 60%,rgba(255,255,255,1) 100%,rgba(255,255,255,1) 100%,rgba(255,255,255,1) 100%)');
                    } else {
                        $this.css('background', 'transparent');
                    }
                }
                return this;
            }
        }
    };

    /**
     * Block to transform divs to draggable color boxes
     */
    $.fn.gColorSwatch = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));