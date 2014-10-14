(function ($) {

    var PATTERN_EDITOR = null;

    $.gPatternPicker = {};

    $.gPatternPicker.getEditor = function () {
        if (!PATTERN_EDITOR) {
            PATTERN_EDITOR = $('<div></div>')
                .css('margin', '5px')
                .gPatternEditor()
                .gOverlay();
        }
        return PATTERN_EDITOR;
    };

    $.gPatternPicker.open = function (options) {
        options = $.extend({
            target: null,
            scene: null,
            types: null,
            value: null,
            modal: false,
            opacity: null,
            closeCallback: null,
            changeCallback: null
        }, options);

        var patternEditor = $.gPatternPicker.getEditor();
        patternEditor.gOverlay('close');
        patternEditor.gPatternEditor('scene', options.scene);
        patternEditor.gPatternEditor('types', options.types);
        patternEditor.gPatternEditor('value', options.value);
        patternEditor.gPatternEditor('opacity', options.opacity);

        var closeCallback = function () {
            patternEditor.gPatternEditor('scene', null);


            if (options.changeCallback) {
                patternEditor.off('patternchange', options.changeCallback);
            }

            patternEditor.off('close', closeCallback);

            if (options.closeCallback) {
                options.closeCallback();
            }
        };
        patternEditor.on('close', closeCallback);

        if (options.changeCallback) {
            patternEditor.on('patternchange', options.changeCallback);
        }

        patternEditor.gOverlay('open', options.target, options.modal);
    };

    $.gPatternPicker.close = function () {
        $.gPatternPicker.getEditor().gOverlay('close');
    };

    $.gPatternPicker.value = function (value) {
        if (!arguments.length) {
            return $.gPatternPicker.getEditor().gPatternEditor('value');
        } else {
            $.gPatternPicker.getEditor().gPatternEditor('value', value);
        }
    };

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to behave as button or not, which, in the latter case,
                // means that the target element will only react on clicking but
                // not behave like a button with icon and background color
                transient: false,
                // Whether to automatically open the color chooser on click
                // or wait for a manual call to the open function
                autoOpen: true,
                // Whether to show the picker modal or not
                modal: false,
                // see options of gPatternTarget
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this);

                if (!options.transient) {
                    $this
                        .addClass('g-input')
                        .addClass('g-cursor-pipette')
                        .css('min-width', '20px');
                }

                $this
                    .data('gpatternpicker', {
                        options: options,
                        opened: false,
                        scene: null,
                        types: null,
                        opacity: null,
                        manualChangeEvent: false,
                        closeListener: function (evt) {
                            $this.data('gpatternpicker').opened = false;
                        },
                        changeListener: function (evt, pattern, opacity) {
                            var data = $this.data('gpatternpicker');
                            data.manualChangeEvent = true;
                            methods.value.call(self, pattern);
                            methods.opacity.call(self, opacity);
                            try {
                                $this.trigger('patternchange', [pattern, opacity]);
                            } finally {
                                data.manualChangeEvent = false;
                            }
                        }
                    })
                    .gPatternTarget(options)
                    .on('patternchange', function (evt, pattern, opacity) {
                        var data = $this.data('gpatternpicker');
                        if (!data.manualChangeEvent) {
                            methods.value.call(self, pattern);
                        }
                    });

                if (options.autoOpen) {
                    $this
                        .on('click', function () {
                            methods.open.call(self);
                        })
                }
            });
        },

        open: function () {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            $.gPatternPicker.open({
                target: this,
                scene: data.scene,
                types: data.types,
                modal: data.options.modal,
                value: $this.gPatternTarget('value'),
                opacity: data.opacity,
                closeCallback: data.closeListener,
                changeCallback: data.changeListener
            });

            data.opened = true;

            return this;
        },

        close: function () {
            $.gPatternPicker.close();
            return this;
        },

        scene: function (value) {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            if (!arguments.length) {
                return data.scene;
            } else {
                data.scene = value;
                return this;
            }
        },

        types: function (types) {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            if (!arguments.length) {
                return data.types;
            } else {
                data.types = types;
                return this;
            }
        },

        opacity: function (opacity) {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            if (!arguments.length) {
                return data.opacity;
            } else {
                data.opacity = opacity;
                return this;
            }
        },

        value: function (value, noEditorUpdate) {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            if (!arguments.length) {
                return $this.gPatternTarget('value');
            } else {
                $this.gPatternTarget('value', value);

                if (!data.options.transient) {
                    $this.css('background', IFPattern.asCSSBackground(value, typeof data.opacity === 'number' ? data.opacity : 1));
                }

                if (data.opened && !data.manualChangeEvent) {
                    $.gPatternPicker.value($this.gPatternTarget('value'));
                }

                return this;
            }
        }
    };

    /**
     * Creates a picker for patterns
     */
    $.fn.gPatternPicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    };

}(jQuery));