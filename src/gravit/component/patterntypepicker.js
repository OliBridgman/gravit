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
            clazz: IFGradient,
            // TODO : I18N
            name: 'Gradient'
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
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this);

                if ($this.is("select")) {
                    $this.data('gpatterntypepicker', {
                        types: null
                    });

                    methods._updateTypes.call(self);

                    $this.on('change', function (evt) {
                        $this.trigger('patterntypechange', methods.value.call(self));
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
                    var clazz = $element.data('class');
                    if (!clazz || !value) {
                        if (clazz === value) {
                            $this.val($element.attr('value'));
                            return false;
                        }
                    } else {
                        for (var p = value.prototype; !!p; p = Object.getPrototypeOf(p)) {
                            if (clazz.prototype === p) {
                                $this.val($element.attr('value'));
                                return false;
                            }
                        }
                    }
                });
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

            // Clear any existing entries, first
            $this.find('option').each(function (index, element) {
                var $element = $(element);
                if ($element.data().hasOwnProperty('class')) {
                    $element.remove();
                }
            });

            // If the last item is an optgroup, use that as a target
            var target = $this;
            var lastElement = $this.find(':last');
            if (lastElement.is('optgroup')) {
                target = lastElement;
            }

            for (var i = 0; i < patternTypes.length; ++i) {
                var patInfo = patternTypes[i];

                if (!data.types || !data.types.length || data.types.indexOf(patInfo.clazz) >= 0) {
                    $('<option></option>')
                        .attr('value', i.toString())
                        .data('class', patInfo.clazz)
                        .text(patInfo.name)
                        .appendTo(target);
                }
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