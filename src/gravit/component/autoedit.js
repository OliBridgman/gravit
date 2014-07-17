(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
                // Selector for the content, if not provided
                // takes this element as content
                selector: null
            }, options);

            return this.each(function () {
                var self = this;
                $(this)
                    .data('gautoedit', {
                        options: options,
                        input: null
                    })
                    .on('dblclick', function (evt) {
                        methods.open.call(self);
                    });
            });
        },

        // Open the editor
        open: function () {
            var self = this;
            var $this = $(this);
            var data = $this.data('gautoedit');

            if (data.input) {
                methods.close.call(this);
            }

            var container = $this.find(data.options.selector);

            if (container.length === 0) {
                if (data.options.selector) {
                    return;
                }

                container = $this;
            }

            var offset = container.offset();

            data.value = container.text();

            data.input = $('<input>')
                .css({
                    'position': 'absolute',
                    'left': offset.left + 'px',
                    'top': offset.top + 'px',
                    'width': container.outerWidth() + 'px',
                    'height': container.outerHeight() + 'px'
                })
                .val(data.value)
                .on('blur', function (evt) {
                    methods.submit.call(self);
                })
                .on('keyup', function (evt) {
                    if (evt.keyCode === 13) {
                        methods.submit.call(self);
                    } else if (evt.keyCode === 27) {
                        methods.close.call(self);
                    }
                })
                .appendTo($('body'))
                .focus()
                .select();
        },

        // Submit editor contents and close it
        submit: function () {
            var $this = $(this);
            var data = $this.data('gautoedit');

            // save input value
            var inputVal = data.input ? data.input.val() : null;

            // close first
            methods.close.call(this);

            if (inputVal) {
                if (data.value !== inputVal) {
                    $this.trigger('submitvalue', inputVal);
                }
            }
        },

        // Close the editor
        close: function () {
            var self = this;
            var $this = $(this);
            var data = $this.data('gautoedit');

            if (data.input) {
                data.input.remove();
                data.input = null;
                data.value = null;
            }
        },
    };

    /**
     * Adds the capability to edit some text
     */
    $.fn.gAutoEdit = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));