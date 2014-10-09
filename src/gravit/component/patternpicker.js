(function ($) {

    var PATTERN_EDITOR = null;

    function getPatternEditor() {
        if (!PATTERN_EDITOR) {
            PATTERN_EDITOR = $('<div></div>')
                .css('margin', '5px')
                .gPatternEditor()
                .gOverlay();
        }
        return PATTERN_EDITOR;
    }

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to behave as button or not, which, in the latter case,
                // means that the target element will only react on clicking but
                // not behave like a button with icon and background color
                transient: false,
                // Whether to automatically open the color chooser on click
                // or wait for a manual call to the open function
                autoOpen: true
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
                        manualChangeEvent: false,
                        closeListener: function (evt) {
                            var data = $this.data('gpatternpicker');
                            var patternEditor = getPatternEditor();
                            patternEditor.gPatternEditor('scene', null);
                            patternEditor.off('patternchange', data.changeListener);
                            patternEditor.off('close', data.closeListener);
                            data.opened = false;
                        },
                        changeListener: function (evt, pattern) {
                            var data = $this.data('gpatternpicker');
                            data.manualChangeEvent = true;
                            methods.value.call(self, pattern);
                            try {
                            $this.trigger('patternchange', pattern);
                            } finally {
                            data.manualChangeEvent = false;
                            }
                        }
                    })
                    .gPatternTarget(options)
                    .on('patternchange', function (evt, pattern) {
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
            var patternEditor = getPatternEditor();
            patternEditor.gOverlay('close', this);
            patternEditor.gPatternEditor('scene', data.scene);
            patternEditor.gPatternEditor('types', data.types);
            patternEditor.gPatternEditor('value', $this.gPatternTarget('value'));
            patternEditor.on('patternchange', data.changeListener);
            patternEditor.on('close', data.closeListener);
            patternEditor.gOverlay('open', this);
            data.opened = true;
            return this;
        },

        close: function () {
            var patternEditor = getPatternEditor();
            patternEditor.gOverlay('close', this);
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

        value: function (value, noEditorUpdate) {
            var $this = $(this);
            var data = $this.data('gpatternpicker');

            if (!arguments.length) {
                return $this.gPatternTarget('value');
            } else {
                $this.gPatternTarget('value', value);

                if (!data.options.transient) {
                    $this.css('background', IFPattern.asCSSBackground(value));
                }

                if (data.opened && !data.manualChangeEvent) {
                    var patternEditor = getPatternEditor();
                    patternEditor.gPatternEditor('value', $this.gPatternTarget('value'));
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
    }

}(jQuery));