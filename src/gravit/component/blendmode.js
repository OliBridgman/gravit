(function ($) {

    var blendModes = [
        {
            type: IFPaintCanvas.BlendMode.Normal,
            // TODO : I18N
            name: 'Normal'
        },
        {
            type: IFPaintCanvas.BlendMode.Multiply,
            // TODO : I18N
            name: 'Multiply'
        },
        {
            type: IFPaintCanvas.BlendMode.Screen,
            // TODO : I18N
            name: 'Screen'
        },
        {
            type: IFPaintCanvas.BlendMode.Overlay,
            // TODO : I18N
            name: 'Overlay'
        },
        {
            type: IFPaintCanvas.BlendMode.Darken,
            // TODO : I18N
            name: 'Darken'
        },
        {
            type: IFPaintCanvas.BlendMode.Lighten,
            // TODO : I18N
            name: 'Lighten'
        },
        {
            type: IFPaintCanvas.BlendMode.ColorDodge,
            // TODO : I18N
            name: 'Color Dodge'
        },
        {
            type: IFPaintCanvas.BlendMode.ColorBurn,
            // TODO : I18N
            name: 'Color Burn'
        },
        {
            type: IFPaintCanvas.BlendMode.HardLight,
            // TODO : I18N
            name: 'Hard Light'
        },
        {
            type: IFPaintCanvas.BlendMode.SoftLight,
            // TODO : I18N
            name: 'Soft Light'
        },
        {
            type: IFPaintCanvas.BlendMode.Difference,
            // TODO : I18N
            name: 'Difference'
        },
        {
            type: IFPaintCanvas.BlendMode.Exclusion,
            // TODO : I18N
            name: 'Exclusion'
        },
        {
            type: IFPaintCanvas.BlendMode.Hue,
            // TODO : I18N
            name: 'Hue'
        },
        {
            type: IFPaintCanvas.BlendMode.Saturation,
            // TODO : I18N
            name: 'Saturation'
        },
        {
            type: IFPaintCanvas.BlendMode.Color,
            // TODO : I18N
            name: 'Color'
        },
        {
            type: IFPaintCanvas.BlendMode.Luminosity,
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
     * represents the IFPaintCanvas.BlendMode choices
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