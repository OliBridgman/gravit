(function ($) {
    var patternTypes = [
        {
            label: '',
            types: [
                {
                    clazz: null,
                    // TODO : I18N
                    name: 'None'
                }
            ]
        },
        {
            // TODO : I18N
            label: 'Color',
            types: [
                {
                    clazz: IFRGBColor,
                    // TODO : I18N
                    name: 'RGB'
                },
                {
                    clazz: IFCMYKColor,
                    // TODO : I18N
                    name: 'CMYK'
                }
            ]
        },
        {
            // TODO : I18N
            label: 'Gradient',
            types: [
                {
                    clazz: IFLinearGradient,
                    // TODO : I18N
                    name: 'Linear'
                },
                {
                    clazz: IFRadialGradient,
                    // TODO : I18N
                    name: 'Radial'
                }
            ]
        },
        {
            // TODO : I18N
            label: 'Pattern',
            types: [
                {
                    clazz: IFBackground,
                    // TODO : I18N
                    name: 'Background'
                }
            ]
        }
    ];

    var methods = {
        init: function (options) {
            options = $.extend({
                // Supported pattern classes. Null value within array stands for 'no pattern'
                types: []
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this);
                if ($this.is("select")) {
                    // If the last item is an optgroup, use that as a target
                    var target = $this;
                    var lastElement = $this.find(':last');
                    if (lastElement.is('optgroup')) {
                        target = lastElement;
                    }

                    var index = 0;
                    for (var i = 0; i < patternTypes.length; ++i) {
                        var groupInfo = patternTypes[i];
                        var group = groupInfo.label ? $('<optgroup></optgroup>')
                            .attr('label', groupInfo.label).appendTo(target) : target;

                        for (var k = 0; k < groupInfo.types.length; ++k) {
                            var patInfo = groupInfo.types[k];

                            var isCompatible = true;
                            if (options.types && options.types.length > 0) {
                                isCompatible = false;
                                for (var i = 0; i < options.types.length; ++i) {
                                    if (patInfo[i].clazz === options.types[i] || patInfo[i].clazz === Object.getPrototypeOf(options.types[i])) {
                                        isCompatible = true;
                                        break;
                                    }
                                }
                            }

                            if (isCompatible) {
                                $('<option></option>')
                                    .attr('value', (++index).toString())
                                    .data('class', patInfo.clazz)
                                    .text(patInfo.name)
                                    .appendTo(group);
                            }
                        }
                    }

                    $this.on('change', function (evt) {
                        $this.trigger('patternchange', methods.value.call(self));
                    });
                }
            });
        },

        value: function (value) {
            var $this = $(this);

            if (!arguments.length) {
                return $this.find('option:selected').data('class');
            } else {
                $this.find('option').each(function (index, element) {
                    var $element = $(element);
                    if ($element.data('class') === value) {
                        $this.val($element.attr('value'));
                        return false;
                    }
                });
                return this;
            }
        }
    };

    /**
     * Fills a select dropdown with available pattern types
     */
    $.fn.gPatternTypePicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));