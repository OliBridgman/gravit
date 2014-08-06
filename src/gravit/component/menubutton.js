(function ($) {

    var DEF_ACTION_CARET_CSS = {
        'margin': '0px 1px',
        'transform': 'rotate(-45deg)',
        'position': 'absolute',
        'bottom': '3px',
        'font-size': '10px'
    };

    var NO_DEF_ACTION_CARET_CSS = {
        'margin-left': '3px'
    };

    var methods = {
        init: function (options) {
            options = $.extend({
                // The menu to be shown
                menu: null,
                // A default action to be fired. If this is provided,
                // the menu will be shown with some delay, otherwise the
                // defaultAction gets fired
                defaultAction: null
            }, options);

            return this.each(function () {
                var self = this;
                var timeout = null;

                $(this)
                    .data('gmenubutton', {
                        options: options
                    })
                    .on('mousedown', function (evt) {
                        evt.stopPropagation(); //!! prevent menu closing !!
                        if (!options.defaultAction) {
                            methods.open.call(self);
                        } else {
                            timeout = setTimeout(function () {
                                methods.open.call(self);
                                timeout = null;
                            }.bind(this), 250);
                        }
                    })
                    .on('mouseup', function (evt) {
                        evt.stopPropagation(); //!! prevent menu closing !!
                        if (timeout !== null) {
                            clearTimeout(timeout);
                            timeout = null;
                        }

                        if (!options.menu.isOpen() && options.defaultAction) {
                            options.defaultAction();
                        }
                    })
                    .append($('<span></span>')
                        .addClass('fa fa-caret-down')
                        .css(options.defaultAction ? DEF_ACTION_CARET_CSS : NO_DEF_ACTION_CARET_CSS));
            });
        },

        // Open the menu
        open: function () {
            var $this = $(this);
            var menu = $this.data('gmenubutton').options.menu;
            if (!menu.isOpen()) {
                menu.open($this, GMenu.Position.Center, GMenu.Position.Right_Bottom);
            }
        },

        // Close the menu
        close: function () {
            var menu = $this.data('gmenubutton').options.menu;
            if (menu.isOpen()) {
                menu.close();
            }
        }
    };

    /**
     * Converts a given button into a button with a menu
     */
    $.fn.gMenuButton = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));