(function ($) {

    var methods = {
        init: function (options) {
            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .data('gpivot', {
                        value: null
                    })
                    .addClass('g-pivot');

                var _addSide = function (side) {
                    $('<div></div>')
                        .addClass('side')
                        .attr('data-side', side)
                        .on('click', function (evt) {
                            methods.value.call(self, side);
                            $this.trigger('pivotchange', side);
                        })
                        .appendTo($this);
                };

                // Add borderline
                $('<div></div>')
                    .addClass('borderline')
                    .appendTo($this);

                // Add button for each side
                for (var side in GRect.Side) {
                    if (GRect.Side.hasOwnProperty(side)) {
                        var value = GRect.Side[side];
                        if (typeof value === 'string') {
                            _addSide(value);
                        }
                    }
                }
            });
        },

        // = GRect.Side
        value: function (value) {
            var $this = $(this);
            var data = $this.data('gpivot');

            if (!arguments.length) {
                return data.value;
            } else {
                data.value = value;
                $this.find('div[data-side]').each(function (index, element) {
                    var $element = $(element);
                    $element.toggleClass('g-active', $element.attr('data-side') === value);
                });

                return this;
            }
        }
    };

    /**
     * Converts a div into a pivot chooser panel
     */
    $.fn.gPivot = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));