(function ($) {
    var methods = {
        init: function (options) {
            var self = this;

            options = $.extend({
                // Width of dialog
                width: null,
                // Height of dialog if any, otherwise auto
                height: null,
                // Whether to add padding to content or not
                padding: true,
                // Dialog can be closed
                closeable: true,
                // Dialog title
                title: null,
                // Dialog buttons
                buttons: null
            }, options);

            var _addButton = function (this_, container, button) {
                $('<button></button>')
                    .data('g-button', button)
                    .on('click', function () {
                        if ((!button.enabled || (button.enabled && button.enabled())) && button.click) {
                            button.click.call(this_);
                        }
                    })
                    .appendTo(container);
            };

            return this.each(function () {
                var $this = $(this);

                $this.wrap($('<div></div>')
                    .addClass('content')
                    .css('overflow', 'auto'));

                var content = $this.parent('.content');

                if (options.padding) {
                    content.addClass('padding');
                }

                if (options.height) {
                    content.css({
                        'height': options.height + 'px'
                    })
                }

                content.wrap($('<div></div>')
                    .addClass('g-dialog g-regular container')
                    .css('width', options.width ? options.width.toString() + 'px' : 'auto'));

                var container = content.parent('.container');

                if (options.title) {
                    container.prepend($('<div></div>')
                        .addClass('header')
                        .text(ifLocale.get(options.title)));
                }

                if (options.buttons) {
                    var footer = $('<div></div>')
                        .addClass('footer')
                        .css('text-align', 'right')
                        .appendTo(container);

                    if (options.buttons) {
                        for (var i = 0; i < options.buttons.length; ++i) {
                            _addButton(this, footer, options.buttons[i]);
                        }
                    }
                }

                container.wrap($('<div></div>')
                    .addClass('g-modal-background')
                    .on('click', function (evt) {
                        if ($(evt.target).hasClass('g-modal-background')) {
                            if (options.closeable) {
                                methods.close.call(this);
                            } else {
                                $(evt.target).fadeIn(100).fadeOut(100).fadeIn(100);
                            }
                        }
                    }.bind(this)));
            });
        },

        open: function () {
            methods.update.call(this);

            var $this = $(this);
            $this.parents('.g-modal-background').appendTo($('body'));

            return this;
        },

        close: function () {
            var $this = $(this);
            $this.parents('.g-modal-background').detach();
            return this;
        },

        update: function () {
            var $this = $(this);
            var buttons = $this.parents('.container').find('.footer');
            buttons.find('button').each(function () {
                var $this = $(this);
                var button = $this.data('g-button');
                $this.text(button.title ? ifLocale.get(button.title) : "");
                $this.attr('disabled', !button.enabled || (button.enabled && button.enabled()) ? null : 'disabled');
                $this.css('display', !button.visible || (button.visible && button.visible()) ? null : 'none');
            });
            return this;
        }
    };

    /**
     * Block to create a (modal) dialog
     */
    $.fn.gDialog = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));