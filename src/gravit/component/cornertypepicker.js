(function ($) {
    var cornerTypes = [
        {
            type: GPathBase.CornerType.Rounded,
            icon: 'gicon-corner-rounded'
        },
        {
            type: GPathBase.CornerType.InverseRounded,
            icon: 'gicon-corner-inverse-rounded'
        },
        {
            type: GPathBase.CornerType.Bevel,
            icon: 'gicon-corner-bevel'
        },
        {
            type: GPathBase.CornerType.Inset,
            icon: 'gicon-corner-inset'
        },
        {
            type: GPathBase.CornerType.Fancy,
            icon: 'gicon-corner-fancy'
        }
    ];

    function getCornerIcon (cornerType) {
        for (var i = 0; i < cornerTypes.length; ++i) {
            if (cornerTypes[i].type === cornerType) {
                return cornerTypes[i].icon;
            }
        }
        return null;
    }

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .data('gcornertype', {
                        cornerType: null
                    })
                    .append('<span></span>')
                    .on('click', function () {
                        var panel = $('<div></div>')
                            .gOverlay({
                                releaseOnClose: true
                            });

                        for (var i = 0; i < cornerTypes.length; ++i) {
                            $('<button></button>')
                                .addClass('g-flat')
                                .toggleClass('g-active', cornerTypes[i].type === $this.data('gcornertype').cornerType)
                                .attr('data-corner-type', cornerTypes[i].type)
                                .append($('<span></span>')
                                    .addClass(cornerTypes[i].icon))
                                .on('click', function () {
                                    var cornerType = $(this).attr('data-corner-type');
                                    methods.value.call(self, cornerType);
                                    $this.trigger('cornertypechange', cornerType);
                                    panel.gOverlay('close');
                                })
                                .appendTo(panel);
                        }

                        panel.gOverlay('open', this);
                    });
            });
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('gcornertype');

            if (!arguments.length) {
                return data.cornerType;
            } else {
                data.cornerType = value;
                $this.find('span').attr('class', getCornerIcon(data.cornerType))
                return this;
            }
        }
    };

    /**
     * Converts a button into a corner-type chooser
     */
    $.fn.gCornerTypePicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));