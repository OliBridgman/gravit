(function ($) {
    var patternTypes = [
        {
            clazz: null,
            // TODO : I18N
            name: 'None'
        },
        {
            clazz: IFColor,
            // TODO : I18N
            name: 'Color'
        },
        {
            clazz: IFLinearGradient,
            // TODO : I18N
            name: 'Linear'
        },
        {
            clazz: IFRadialGradient,
            // TODO : I18N
            name: 'Radial'
        },
        {
            clazz: IFBackground,
            // TODO : I18N
            name: 'Background'
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

                    for (var i = 0; i < patternTypes.length; ++i) {
                        var patInfo = patternTypes[i];
                        if (options.types && options.types.length) {
                            if (options.types.indexOf(patInfo[i].clazz) < 0) {
                                continue;
                            }
                        }


                        target.append($('<option></option>')
                            .attr('value', i.toString())
                            .text(patInfo.name));
                    }

                    $this.on('change', function (evt) {
                        var patternClass = patternTypes[parseInt($this.val())].clazz;
                        $this.trigger('patternchange', patternClass);
                    });
                }
            });
        },

        value: function (value) {
            var $this = $(this);

            if (!arguments.length) {
                return patternTypes[parseInt($this.val())].clazz;
            } else {
                for (var i = 0; i < patternTypes.length; ++i) {
                    if (patternTypes[i].clazz === value) {
                        $this.val(i.toString());
                        break;
                    }
                }
                return this;
            }
        }
    };

    /**
     * Fills a select dropdown with available pattern types
     */
    $.fn.gPatternTypes = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));