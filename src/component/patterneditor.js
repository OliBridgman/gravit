(function ($) {
    var COLORS = [
        '#000000', '#1F1F1F', '#3D3D3D', '#5C5C5C', '#7A7A7A', '#999999', '#B8B8B8', '#D6D6D6', '#F5F5F5', '#FFFFFF',
        '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
    ];

    var methods = {
        init: function (options) {
            options = $.extend({}, options);

            return this.each(function () {
                var self = this;

                var $this = $(this)
                    .addClass('g-pattern-editor')
                    .data('gpatterneditor', {
                        scene: null,
                        value: null,
                        options: options
                    });

                $this
                    .append($('<div></div>')
                        .gColorEditor()
                        .on('colorchange', function (evt, color) {
                            methods._colorChanged.call(self);
                        }))
                    .append($('<div></div>')
                        .addClass('palette')
                        .append($('<div></div>')
                            .addClass('swatches')
                            .gSwatchPanel({
                                allowSelect: false,
                                allowNameEdit: false,
                                previewWidth: 20,
                                previewHeight: 20,
                                nullSwatch: $('<span></span>')
                                    .addClass('fa fa-plus')
                                    .css('padding-left', '4px'),
                                // TODO : I18N
                                nullName: 'Add Swatch',
                                nullAction: function () {
                                    $(this).gSwatchPanel('createSwatch', methods.value.call(self));
                                }
                            })
                            .on('swatchchange', function (evt, swatch) {
                                var pat = swatch.getProperty('pat');
                                if (pat instanceof GColor) {
                                    $this.find('.g-color-editor').gColorEditor('currentColor', pat);
                                    methods._colorChanged.call(self);
                                } else if (pat) {
                                    methods.value.call(self, pat);
                                    methods._firePatternChange.call(self);
                                }
                            }))
                        .append($('<div></div>')
                            .addClass('divider'))
                        .append($('<div></div>')
                            .addClass('builtin-colors')))
                    .append($('<div></div>')
                        .addClass('g-list pattern-editor')
                        .append($('<div></div>')
                            .data('pattern-class', GGradient)
                            .gGradientEditor()
                            .gGradientEditor('value', new GLinearGradient())
                            .on('gradientchange', function () {
                                methods._firePatternChange.call(self, true);
                            })
                    ))
                    .append($('<div></div>')
                        .addClass('toolbar')
                        .append($('<div></div>')
                            .addClass('pattern-type')
                            .gPatternTypePicker()
                            .on('patterntypechange', function (evt, patternClass) {
                                methods.value.call(self, GPattern.smartCreate(patternClass, methods.value.call(self)));
                                methods._firePatternChange.call(self);
                                methods._relayout.call(self);
                            }))
                        .append($('<label></label>')
                            .addClass('pattern-opacity')
                            .css('display', 'none')
                            .append($('<span></span>')
                                // TODO : I18N
                                .text(' Opacity: '))
                            .append($('<input>')
                                .css('width', '3em')
                                .on('change', function (evt) {
                                    if ($(evt.target).closest('label').css('display') !== 'none') {
                                        methods._firePatternChange.call(self);
                                    }
                                }))
                            .append($('<span>%</span>'))));

                var builtinColors = $this.find('.builtin-colors');
                for (var i = 0; i < COLORS.length; ++i) {
                    var color = GRGBColor.fromCSSColor(COLORS[i]);
                    $('<div></div>')
                        .css('background', color.toScreenCSS())
                        .gPatternTarget({
                            allowDrop: false
                        })
                        .gPatternTarget('types', [GColor])
                        .gPatternTarget('value', color)
                        .on('click', function (evt) {
                            $this.find('.g-color-editor').gColorEditor('currentColor', $(evt.target).gPatternTarget('value'));
                            methods._colorChanged.call(self);
                        })
                        .appendTo(builtinColors);
                }
            });
        },

        scene: function (scene) {
            var $this = $(this);
            var data = $this.data('gpatterneditor');

            if (!arguments.length) {
                return data.scene;
            } else {
                if (scene !== data.scene) {
                    var swatchPanel = $this.find('.swatches');

                    if (data.scene) {
                        swatchPanel.gSwatchPanel('detach');
                    }

                    data.scene = scene;

                    if (data.scene) {
                        swatchPanel.gSwatchPanel('attach', data.scene.getSwatchCollection());
                    }
                }

                return this;
            }
        },

        types: function (types) {
            var $this = $(this);

            if (!arguments.length) {
                return $this.find('.pattern-type')
                    .gPatternTypePicker('types');
            } else {
                $this.find('.pattern-type')
                    .gPatternTypePicker('types', types);

                $this.find('.swatches')
                    .gSwatchPanel('types', types);

                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('gpatterneditor');

            if (!arguments.length) {
                return data.value;
            } else {
                data.value = value;

                var patternType = $this.find('.pattern-type')
                    .gPatternTypePicker('value', value ? value.constructor : null)
                    .gPatternTypePicker('value');

                var hasPatternEditor = false;
                $this.find('.pattern-editor > div').each(function (index, element) {
                    var $element = $(element);
                    var isPatternType = $element.data('pattern-class') === patternType;
                    $element.css('display', isPatternType ? '' : 'none');
                    hasPatternEditor = hasPatternEditor || isPatternType;
                });

                $this.find('.pattern-editor').css('display', hasPatternEditor ? '' : 'none');

                // Update editor depending on value
                if (value instanceof GGradient) {
                    $this.find('.g-gradient-editor')
                        .gGradientEditor('value', value);
                }

                methods._updateToColor.call(this);

                return this;
            }
        },

        opacity: function (opacity) {
            var $this = $(this);

            if (!arguments.length) {
                var opc = $this.find('.pattern-opacity');
                if (opc.css('display') === 'none') {
                    return null;
                }

                return parseInt(opc.children('input').val()) / 100;
            } else {
                $this.find('.pattern-opacity')
                    .css('display', typeof opacity === 'number' ? '' : 'none')
                    /* !! */
                    .children('input')
                    .val(typeof opacity === 'number' ? Math.round(opacity * 100) : '');
                return this;
            }
        },

        _colorChanged: function () {
            var $this = $(this);
            var data = $this.data('gpatterneditor');
            var activeColor = $this.find('.g-color-editor').gColorEditor('value');

            if (!data.value || data.value instanceof GBackground) {
                var typePicker = $this.find('.pattern-type');
                var types = typePicker.gPatternTypePicker('types');
                var types = methods.types.call(this);
                if (!types || !types.length || (types && types.indexOf(GColor) >= 0)) {
                    data.value = activeColor;
                    typePicker.gPatternTypePicker('value', GColor);
                    methods._firePatternChange.call(this, false);
                }
            } else if (data.value instanceof GColor) {
                methods._firePatternChange.call(this, true);
            } else if (data.value instanceof GGradient) {
                // TODO : Assign selected stop color
            }
        },

        _updateToColor: function () {
            var $this = $(this);
            var data = $this.data('gpatterneditor');
            var activeColor = null;

            if (data.value instanceof GColor) {
                activeColor = data.value;
            } else if (data.value instanceof GGradient) {
                // TODO : Assign selected stop color
            }

            if (activeColor) {
                $this.find('.g-color-editor').gColorEditor('value', activeColor);
            }
        },

        _generatePattern: function () {
            var $this = $(this);
            var patternType = $this.find('.pattern-type').gPatternTypePicker('value');

            if (!patternType) {
                return null;
            } else if (patternType === GBackground) {
                return new GBackground();
            } else if (patternType === GColor) {
                return $this.find('.g-color-editor').gColorEditor('value');
            } else if (patternType === GGradient) {
                return $this.find('.g-gradient-editor').gGradientEditor('value');
            } else {
                throw new Error('Unknown pattern type.');
            }
        },

        _firePatternChange: function (regeneratePattern) {
            var $this = $(this);
            var data = $this.data('gpatterneditor');

            if (regeneratePattern) {
                data.value = methods._generatePattern.call(this);
            }

            $this.trigger('patternchange', [data.value, methods.opacity.call(this)]);
        },

        _relayout: function () {
            var $this = $(this);
            if ($this.data().hasOwnProperty('goverlay')) {
                $this.gOverlay('relayout');
            }
        }
    };

    /**
     * Block to transform divs into a pattern editor
     */
    $.fn.gPatternEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}
(jQuery)
)
;
