(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);
                $this
                    .data('ex-autoinput', {
                        options: options
                    })
                    .on('dblclick', methods.activate.bind(self));
            });
        },
        activate: function () {
            var self = this;
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ex-autoinput');
                if (!data.input) {
                    var offset = $this.offset();
                    var width = $this.outerWidth();
                    var height = $this.outerHeight();
                    var value = data.options.getter ?
                        data.options.getter.call(this) : $this.text();

                    data.input = $('<input>')
                        .css('position', 'absolute')
                        .css('z-index', '999999')
                        .css('top', offset.top.toString() + 'px')
                        .css('left', offset.left.toString() + 'px')
                        .css('width', width.toString() + 'px')
                        .css('height', height.toString() + 'px')
                        .css('font-family', $this.css('font-family'))
                        .css('font-size', $this.css('font-size'))
                        .css('outline', 'none')
                        .css('padding', '0x')
                        .css('margin', '0x')
                        .on('blur', methods.finish.bind(self))
                        .on('keyup', function (evt) {
                            if (evt.keyCode == 13 || evt.keyCode == 9) {
                                $(this).blur();
                            }
                        })
                        .appendTo($("body"))
                        .val(value)
                        .select()
                        .focus();
                }
            });
        },
        finish: function () {
            return this.each(function () {
                var $this = $(this);
                var data = $this.data('ex-autoinput');
                if (data && data.input) {
                    var value = data.input.val();
                    data.input.remove();
                    data.input = null;

                    if (data.options.setter) {
                        data.options.setter.call(this, value);
                    } else {
                        $this.text(value);
                    }
                }
            });
        }
    };

    /**
     * Adds a behavior to edit an element's content via a text-input field
     * that gets automatically sized to the attached element's size. By
     * default the editor is triggered by a double-click.
     */
    $.fn.gAutoSize = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));