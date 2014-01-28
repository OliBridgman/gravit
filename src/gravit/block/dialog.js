(function ($) {
    var methods = {
        init: function (options) {
            var self = this;

            options = $.extend({
                // Width of dialog
                width: 650,
                // Height of dialog if any, otherwise auto
                height: null,
                // Whether to add padding to content or not
                padding: true,
                // Dialog can be closed
                closable: function () {
                    return true;
                },
                // Dialog title
                title: null,
                // Dialog buttons
                buttons: null,
                // Dialog close callback
                closed: null
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
                    .css('width', options.width.toString() + 'px')
                    .css('height', options.height ? options.height + 'px' : 'auto'));

                var container = content.parent('.container');

                if (options.title || options.buttons) {
                    var buttons = $('<div></div>')
                        .addClass('buttons');

                    if (options.buttons) {
                        for (var i = 0; i < options.buttons.length; ++i) {
                            _addButton(this, buttons, options.buttons[i]);
                        }
                    }

                    var title = options.title ? gLocale.get(options.title) : "";

                    container.prepend($('<div></div>')
                        .addClass('header')
                        .append($('<div></div>')
                            .addClass('title')
                            .append($('<h1></h1>')
                                .text(title)))
                        .append(buttons));
                }

                container.wrap($('<div></div>')
                    .addClass('g-block-dialog')
                    .on('click', function (evt) {
                        if ($(evt.target).hasClass('g-block-dialog')) {
                            if (options.closable()) {
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