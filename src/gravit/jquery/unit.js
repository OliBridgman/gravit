(function ($) {

    var units = [
        {
            unit: IFLength.Unit.PX,
            // TODO : I18N
            name: 'Pixels'
        },
        {
            unit: IFLength.Unit.MM,
            // TODO : I18N
            name: 'Millimeters'
        },
        {
            unit: IFLength.Unit.CM,
            // TODO : I18N
            name: 'Centimeters'
        },
        {
            unit: IFLength.Unit.IN,
            // TODO : I18N
            name: 'Inches'
        },
        {
            unit: IFLength.Unit.PC,
            // TODO : I18N
            name: 'Picas'
        },
        {
            unit: IFLength.Unit.PT,
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
     * represents the IFLength.Unit choices
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