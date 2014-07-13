(function ($) {
    var methods = {
        init: function (options) {
            options = $.extend({
                // The title of the panel
                title: '',
                // The content of the panel
                content: '',
                // The controls for the panel if any
                controls: null
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .empty()
                    .addClass('g-panel')
                    .data('gpanel', {
                        options: options,
                        expanded: true
                    })
                    .append($('<div></div>')
                        .addClass('header')
                        .append($('<div></div>')
                            .addClass('title')
                            .append($('<i></i>')
                                .addClass('fa fa-fw fa-caret-down'))
                            .append($('<span></span>')
                                .text(options.title))
                            .on('click', function () {
                                methods.toggle.call(self);
                            }))
                        .append($('<div></div>')
                            .addClass('controls')
                            .append(options.controls)))
                    .append($('<div></div>')
                        .addClass('content')
                        .append(options.content));
            });
        },

        toggle: function () {
            var $this = $(this);
            var data = $this.data('gpanel');
            methods.expanded.call(this, !data.expanded);
        },

        expanded: function (value) {
            var $this = $(this);
            var data = $this.data('gpanel');

            if (!arguments.length) {
                return data.expanded;
            } else {
                if (value !== data.expanded) {
                    data.expanded = value;
                    $this.find('.content').css('display', data.expanded ? '' : 'none');
                    $this.find('.controls').css('visibility', data.expanded ? '' : 'hidden');
                    $this.find('.header i.fa')
                        .toggleClass('fa-caret-down', data.expanded)
                        .toggleClass('fa-caret-right', !data.expanded);
                }
                return this;
            }
        }
    };

    /**
     * Block convert a div into a panel with a title and content
     */
    $.fn.gPanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));