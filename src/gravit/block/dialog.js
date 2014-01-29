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
                    .addClass('content'));

                var content = $this.parent('.content');

                if (options.padding) {
                    content.addClass('padding');
                }

                content.wrap($('<div></div>')
                    .addClass('container')
                    .css('width', options.width ? options.width.toString() + 'px' : 'auto')
                    .css('height', options.height ? options.height + 'px' : 'auto'));

                var container = content.parent('.container');

                if (options.title) {
                    var title = options.title ? gLocale.get(options.title) : "";

                    container.prepend($('<div></div>')
                        .addClass('header')
                        .append($('<h2></h2>')
                            .addClass('title')
                                .text(gLocale.get(options.title))));
                }

                if (options.buttons) {
                    var buttons = $('<div></div>')
                        .addClass('buttons')
                        .append('<hr>');

                    if (options.buttons) {
                        for (var i = 0; i < options.buttons.length; ++i) {
                            _addButton(this, buttons, options.buttons[i]);
                        }
                    }

                    container.append($('<div></div>')
                        .addClass('footer')
                        .append(buttons));
                }

                container.wrap($('<div></div>')
                    .addClass('g-block-dialog')
                    .on('click', function (evt) {
                        if ($(evt.target).hasClass('g-block-dialog')) {
                            if (options.closeable) {
                                methods.close.call(self);
                            }
                        }
                    }));
            });
        },

        open: function () {
            var self = this;

            return this.each(function () {
                methods.update.call(self);

                var $this = $(this);
                $this.parents('.g-block-dialog').appendTo($('body'));

                var container = $this.parents('.container');
                container.css('left', (($(window).width() - container.outerWidth()) / 2).toString() + 'px');
                //container.css('top', (($(window).height() - container.outerHeight()) / 2).toString() + 'px')
            });
        },

        close: function () {
            return this.each(function () {
                var $this = $(this);
                $this.parents('.g-block-dialog').detach();
            });
        },

        update: function () {
            return this.each(function () {
                var $this = $(this);
                var buttons = $this.parents('.container').find('.buttons');
                buttons.find('button').each(function () {
                    var $this = $(this);
                    var button = $this.data('g-button');
                    $this.text(button.title ? gLocale.get(button.title) : "");
                    $this.attr('disabled', !button.enabled || (button.enabled && button.enabled()) ? null : 'disabled');
                    $this.css('display', !button.visible || (button.visible && button.visible()) ? null : 'none');
                });
            });
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