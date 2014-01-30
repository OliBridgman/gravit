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
                    .exColorBox();

                $this
                    .addClass('g-block-colorbutton')
                    .data('g-colorbutton', {
                        colorbox: colorBox
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
                    .addClass('fa fa-chevron-down')
                    .appendTo($this);
            });
        },

        color: function (newColor) {
            if (!newColor) {
                return $(this).data('g-colorbutton').colorbox.exColorBox('color');
            } else {
                return this.each(function () {
                    var $this = $(this);
                    $this.data('g-colorbutton').colorbox.exColorBox('color', newColor);
                });
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