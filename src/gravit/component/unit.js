(function ($) {

    var units = [
        {
            unit: GLength.Unit.PX,
            // TODO : I18N
            name: 'Pixels'
        },
        {
            unit: GLength.Unit.MM,
            // TODO : I18N
            name: 'Millimeters'
        },
        {
            unit: GLength.Unit.CM,
            // TODO : I18N
            name: 'Centimeters'
        },
        {
            unit: GLength.Unit.IN,
            // TODO : I18N
            name: 'Inches'
        },
        {
            unit: GLength.Unit.PC,
            // TODO : I18N
            name: 'Picas'
        },
        {
            unit: GLength.Unit.PT,
            // TODO : I18N
            name: 'Points'
        }
    ];

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            return this.each(function () {
                var $this = $(this);
                if ($this.is("select")) {
                    for (var i = 0; i < units.length; ++i) {
                        $this.append($('<option></option>')
                            .attr('value', units[i].unit)
                            .text(units[i].name));
                    }
                }
            });
        }
    };

    /**
     * Adds a translated list of units to a selection that
     * represents the GLength.Unit choices
     */
    $.fn.gUnit = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));