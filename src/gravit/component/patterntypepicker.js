(function ($) {
    var PATTERN_TYPES = [
        {
            clazz: null,
            // TODO : I18N
            name: 'None',
            cssBackground: IFPattern.asCSSBackground(null)
        },
        {
            clazz: IFColor,
            // TODO : I18N
            name: 'Color',
            cssBackground: 'black'
        },
        {
            clazz: IFGradient,
            // TODO : I18N
            name: 'Gradient',
            cssBackground: new IFLinearGradient().asCSSBackground()
        },
        {
            clazz: IFBackground,
            // TODO : I18N
            name: 'Background',
            cssBackground: new IFBackground().asCSSBackground()
        }
    ];

    var methods = {
        init: function (options) {
            options = $.extend({}, options);

            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .data('gpatterntypepicker', {
                        types: null
                    })
                    .addClass('pattern-type-picker');

                methods._updateTypes.call(self);

                if ($this.is("select")) {
                    $this.on('change', function (evt) {
                        $this.trigger('patterntypechange', methods.value.call(self));
                    });
                } else {
                    for (var i = 0; i < PATTERN_TYPES.length; ++i) {
                        var patInfo = PATTERN_TYPES[i];

                        $('<span></span>')
                            .data('patternClass', patInfo.clazz)
                            .addClass('g-button pattern-type')
                            .attr('title', patInfo.name)
                            .append($('<span></span>')
                                .css({
                                    'background': patInfo.cssBackground
                                }))
                            .on('click', function (evt) {
                                var oldValue = methods.value.call(self);
                                methods.value.call(self, $(evt.target).closest('.pattern-type').data('patternClass'));
                                var newValue = methods.value.call(self);
                                if (oldValue !== newValue) {
                                    $this.trigger('patterntypechange', newValue);
                                }
                            })
                            .appendTo($this);
                    }
                }
            });
        },

        value: function (value) {
            var $this = $(this);

            var isValueType = function (patternClass) {
                if (!patternClass || !value) {
                    if (patternClass === value) {
                        return true;
                    }
                } else {
                    for (var p = value.prototype; !!p; p = Object.getPrototypeOf(p)) {
                        if (patternClass.prototype === p) {
                            return true;
                        }
                    }
                }
                return false;
            };

            if (!arguments.length) {
                if ($this.is("select")) {
                    return $this.find('option:selected').data('patternClass');
                } else {
                    var result = null;

                    $this.find('span').each(function (index, element) {
                        var $element = $(element);
                        if ($element.data().hasOwnProperty('patternClass')) {
                            if ($element.hasClass('g-active')) {
                                result = $element.data('patternClass');
                                return false;
                            }
                        }
                    });

                    return result;
                }
            } else {
                if ($this.is("select")) {
                    $this.find('option').each(function (index, element) {
                        var $element = $(element);
                        if (isValueType($element.data('patternClass'))) {
                            $this.val($element.attr('value'));
                            return false;
                        }
                    });
                } else {
                    $this.find('span').each(function (index, element) {
                        var $element = $(element);
                        if ($element.data().hasOwnProperty('patternClass')) {
                            $element.toggleClass('g-active', isValueType($element.data('patternClass')));
                        }
                    });
                }
                return this;
            }
        },

        types: function (types) {
            var $this = $(this);
            var data = $this.data('gpatterntypepicker');

            if (!arguments.length) {
                return data.types;
            } else {
                data.types = types;
                methods._updateTypes.call(this);

                return this;
            }
        },

        _updateTypes: function () {
            var $this = $(this);
            var data = $this.data('gpatterntypepicker');

            if ($this.is("select")) {
                // Clear any existing entries, first
                $this.find('option').each(function (index, element) {
                    var $element = $(element);
                    if ($element.data().hasOwnProperty('patternClass')) {
                        $element.remove();
                    }
                });

                // If the last item is an optgroup, use that as a target
                var target = $this;
                var lastElement = $this.find(':last');
                if (lastElement.is('optgroup')) {
                    target = lastElement;
                }

                for (var i = 0; i < PATTERN_TYPES.length; ++i) {
                    var patInfo = PATTERN_TYPES[i];

                    if (!data.types || !data.types.length || data.types.indexOf(patInfo.clazz) >= 0) {
                        $('<option></option>')
                            .attr('value', i.toString())
                            .data('patternClass', patInfo.clazz)
                            .text(patInfo.name)
                            .appendTo(target);
                    }
                }
            } else {
                // Clear any existing entries, first
                $this.find('span').each(function (index, element) {
                    var $element = $(element);
                    if ($element.data().hasOwnProperty('patternClass')) {
                        var patternClass = $element.data('patternClass');
                        var isAvailable = !data.types || !data.types.length || data.types.indexOf(patternClass) >= 0;
                        $element.css('display', isAvailable ? '' : 'none');
                    }
                });
            }
        }
    };

    /**
     * Fills a select dropdown with available pattern types or creates buttons for no-selects
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