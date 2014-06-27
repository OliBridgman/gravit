(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
                // see options of gColorTarget
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .addClass('g-color-swatch')
                    .html('&nbsp;')
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
                $this.toggleClass('g-cursor-hand-open', !!value);
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