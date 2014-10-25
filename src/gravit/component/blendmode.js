(function ($) {

    var blendModes = [
        {
            type: GPaintCanvas.BlendMode.Normal,
            // TODO : I18N
            name: 'Normal'
        },
        {
            type: GPaintCanvas.BlendMode.Multiply,
            // TODO : I18N
            name: 'Multiply'
        },
        {
            type: GPaintCanvas.BlendMode.Screen,
            // TODO : I18N
            name: 'Screen'
        },
        {
            type: GPaintCanvas.BlendMode.Overlay,
            // TODO : I18N
            name: 'Overlay'
        },
        {
            type: GPaintCanvas.BlendMode.Darken,
            // TODO : I18N
            name: 'Darken'
        },
        {
            type: GPaintCanvas.BlendMode.Lighten,
            // TODO : I18N
            name: 'Lighten'
        },
        {
            type: GPaintCanvas.BlendMode.ColorDodge,
            // TODO : I18N
            name: 'Color Dodge'
        },
        {
            type: GPaintCanvas.BlendMode.ColorBurn,
            // TODO : I18N
            name: 'Color Burn'
        },
        {
            type: GPaintCanvas.BlendMode.HardLight,
            // TODO : I18N
            name: 'Hard Light'
        },
        {
            type: GPaintCanvas.BlendMode.SoftLight,
            // TODO : I18N
            name: 'Soft Light'
        },
        {
            type: GPaintCanvas.BlendMode.Difference,
            // TODO : I18N
            name: 'Difference'
        },
        {
            type: GPaintCanvas.BlendMode.Exclusion,
            // TODO : I18N
            name: 'Exclusion'
        },
        {
            type: GPaintCanvas.BlendMode.Hue,
            // TODO : I18N
            name: 'Hue'
        },
        {
            type: GPaintCanvas.BlendMode.Saturation,
            // TODO : I18N
            name: 'Saturation'
        },
        {
            type: GPaintCanvas.BlendMode.Color,
            // TODO : I18N
            name: 'Color'
        },
        {
            type: GPaintCanvas.BlendMode.Luminosity,
            // TODO : I18N
            name: 'Luminosity'
        }
    ];

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            return this.each(function () {
                var $this = $(this);
                if ($this.is("select")) {
                    // If the last item is an optgroup, use that as a target
                    var target = $this;
                    var lastElement = $this.find(':last');
                    if (lastElement.is('optgroup')) {
                        target = lastElement;
                    }

                    for (var i = 0; i < blendModes.length; ++i) {
                        target.append($('<option></option>')
                            .attr('value', blendModes[i].type)
                            .text(blendModes[i].name));
                    }
                }
            });
        }
    };

    /**
     * Adds a translated list of options to a selection that
     * represents the GPaintCanvas.BlendMode choices
     * TODO : Replace select with visual selector with icons
     */
    $.fn.gBlendMode = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));