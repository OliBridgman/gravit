(function (_) {

    /**
     * Color Palette
     * @class GColorPalette
     * @extends GPalette
     * @constructor
     */
    function GColorPalette() {
        GPalette.call(this);
    }

    IFObject.inherit(GColorPalette, GPalette);

    GColorPalette.ID = "color";
    GColorPalette.TITLE = new IFLocale.Key(GColorPalette, "title");

    /**
     * @private
     */
    GColorPalette._ColorModes = [
        {
            name: 'RGB',
            key: 'rgb',
            components: [
                {
                    label: 'R',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [0, rgba[1], rgba[2], 100]),
                            new IFColor(IFColor.Type.RGB, [255, rgba[1], rgba[2], 100]),
                        ];
                    }
                },
                {
                    label: 'G',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [rgba[0], 0, rgba[2], 100]),
                            new IFColor(IFColor.Type.RGB, [rgba[0], 255, rgba[2], 100]),
                        ];
                    }
                },
                {
                    label: 'B',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [rgba[0], rgba[1], 0, 100]),
                            new IFColor(IFColor.Type.RGB, [rgba[0], rgba[1], 255, 100]),
                        ];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            getComponents: function (color) {
                return color.asRGB();
            },
            makeColor: function (components) {
                return new IFColor(IFColor.Type.RGB, components);
            }
        },
        {
            name: 'HSL',
            key: 'hsl',
            components: [
                {
                    label: 'H',
                    min: 0,
                    max: 360,
                    unit: '° ',
                    stops: function (components) {
                        var hsla = components;
                        var result = [];
                        var steps = 60;
                        for (var i = 0; i <= 360; i += steps) {
                            result.push(new IFColor(IFColor.Type.HSL, [i, hsla[1], hsla[2], 100]));
                        }
                        return result;
                    }
                },
                {
                    label: 'S',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var hsla = components;
                        return [
                            new IFColor(IFColor.Type.HSL, [hsla[0], 0, hsla[2], 100]),
                            new IFColor(IFColor.Type.HSL, [hsla[0], 100, hsla[2], 100]),
                        ];
                    }
                },
                {
                    label: 'L',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var hsla = components;
                        return [
                            new IFColor(IFColor.Type.HSL, [hsla[0], hsla[1], 0, 100]),
                            new IFColor(IFColor.Type.HSL, [hsla[0], hsla[1], 100, 100]),
                        ];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            getComponents: function (color) {
                return color.asHSL();
            },
            makeColor: function (components) {
                return new IFColor(IFColor.Type.HSL, components);
            }
        },
        {
            name: 'Tone',
            key: 'tone',
            components: [
                {
                    label: 'T',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        return [IFColor.parseCSSColor('white'), IFColor.parseCSSColor('black')];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            getComponents: function (color) {
                return color.asTone();
            },
            makeColor: function (components) {
                return new IFColor(IFColor.Type.Tone, components);
            }
        },
        {
            name: 'CMYK',
            key: 'cmyk',
            components: [
                {
                    label: 'C',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [0, cmyk[1], cmyk[2], cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [100, cmyk[1], cmyk[2], cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'M',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], 0, cmyk[2], cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], 100, cmyk[2], cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'Y',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], 0, cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], 100, cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'K',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], cmyk[2], 0]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], cmyk[2], 100]),
                        ];
                    }
                }
            ],
            getComponents: function (color) {
                return color.asCMYK();
            },
            makeColor: function (components) {
                return new IFColor(IFColor.Type.CMYK, components);
            }
        },
        {
            name: 'Mixins',
            key: 'mixins',
            previousColor: true,
            _values: [0, 0, 0],
            components: [
                {
                    label: 'Ti',
                    min: 0,
                    max: 100,
                    step: 10,
                    unit: '%',
                    stops: function (components, previousColor) {
                        var result = [];
                        for (var i = 0; i <= 100; i += 10) {
                            result.push(previousColor.withTint(i));
                        }
                        return result;
                    }
                },
                {
                    label: 'Sh',
                    min: 0,
                    max: 100,
                    step: 10,
                    unit: '%',
                    stops: function (components, previousColor) {
                        var result = [];
                        for (var i = 0; i <= 100; i += 10) {
                            result.push(previousColor.withShade(i));
                        }
                        return result;
                    }
                },
                {
                    label: 'To',
                    min: 0,
                    max: 100,
                    step: 10,
                    unit: '%',
                    stops: function (components, previousColor) {
                        var result = [];
                        for (var i = 0; i <= 100; i += 10) {
                            result.push(previousColor.withTone(i));
                        }
                        return result;
                    }
                }
            ],
            getComponents: function (color) {
                return this._values;
            },
            makeColor: function (components, previousColor) {
                this._values = components;
                var result = previousColor;

                if (components[0] > 0) {
                    result = result.withTint(components[0]);
                }

                if (components[1] > 0) {
                    result = result.withShade(components[1]);
                }

                if (components[2] > 0) {
                    result = result.withTone(components[2]);
                }

                return result;
            }
        }
    ];

    /**
     * @type {JQuery}
     * @private
     */
    GColorPalette.prototype._htmlElement = null;

    /**
     * @type {JQuery}
     * @private
     */
    GColorPalette.prototype._controls = null;

    /**
     * @type {GDocument}
     * @private
     */
    GColorPalette.prototype._document = null;

    /**
     * @type {*}
     * @private
     */
    GColorPalette.prototype._colorMode = null;

    /**
     * @type {GColorMatcher}
     * @private
     */
    GColorPalette.prototype._matcher = null;

    /**
     * @type {IFColor}
     * @private
     */
    GColorPalette.prototype._previousColor = null;

    /**
     * @type {IFColor}
     * @private
     */
    GColorPalette.prototype._currentColor = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GColorPalette.prototype._syncElements = null;

    /** @override */
    GColorPalette.prototype.getId = function () {
        return GColorPalette.ID;
    };

    /** @override */
    GColorPalette.prototype.getTitle = function () {
        return GColorPalette.TITLE;
    };

    /** @override */
    GColorPalette.prototype.getGroup = function () {
        return "assets";
    };

    /** @override */
    GColorPalette.prototype.isEnabled = function () {
        return this._document !== null;
    };

    /** @override */
    GColorPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;
        this._controls = controls;

        htmlElement
            .append($('<input>')
                .attr('type', 'color')
                .css({
                    'position': 'absolute',
                    'visibility': 'hidden'
                })
                .on('change', function (evt) {
                    var color = IFColor.parseCSSColor($(evt.target).val());
                    this._assignPreviousColor(color);
                    this._assignCurrentColor(color);
                }.bind(this)))
            .append($('<div></div>')
                .addClass('toolbar')
                .append($('<div></div>')
                    .addClass('section-start')
                    .append($('<button></button>')
                        .attr('data-sync', 'fill')
                        // TODO : I18N
                        .attr('title', 'Synchronize with Fill')
                        .append($('<span></span>')
                            .addClass('gicon-fill'))
                        .on('click', function (evt) {
                            this._toggleSyncMode('fill');
                        }.bind(this)))
                    .append($('<button></button>')
                        .attr('data-sync', 'border')
                        // TODO : I18N
                        .attr('title', 'Synchronize with Border')
                        .append($('<span></span>')
                            .addClass('gicon-stroke'))
                        .on('click', function () {
                            this._toggleSyncMode('border');
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('section-center')
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .addClass('fa fa-plus'))
                        .append($('<span></span>')
                            // TODO : I18N
                            .text('Add Swatch'))
                        .on('click', function (evt) {
                            var scene = this._document.getScene();

                            // Make sure there's no such color, yet
                            var swatches = scene.getSwatchCollection();
                            for (var node = swatches.getFirstChild(); node !== null; node = node.getNext()) {
                                if (node instanceof IFSwatch && node.getPatternType() === IFPattern.Type.Color) {
                                    if (IFColor.equals(this._currentColor, node.getProperty('pat'))) {
                                        return; // leave here, colors are equal
                                    }
                                }
                            }

                            // Ask for a name
                            vex.dialog.prompt({
                                // TODO : I18N
                                message: 'Enter a name for the new swatch:',
                                value: this._currentColor.asString(),
                                callback: function (name) {
                                    if (!name) {
                                        return;
                                    }

                                    if (name.trim() === '') {
                                        name = this._currentColor.asString();
                                    }

                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(scene, function () {
                                        var swatch = new IFSwatch();
                                        swatch.setProperties(['name', 'pat'], [name, this._currentColor]);
                                        swatches.appendChild(swatch);
                                    }.bind(this), 'Add Swatch');
                                }.bind(this)
                            });
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('section-end')
                    .append($('<button></button>')
                        .attr('data-action', 'system-color')
                        // TODO : I18N
                        .attr('title', 'System')
                        .append($('<span></span>')
                            .addClass('fa fa-cog'))
                        .on('click', function () {
                            this._htmlElement.find('input[type="color"]').trigger('click');
                        }.bind(this)))
                    .append($('<select></select>')
                        .addClass('color-mode-select')
                        .on('change', function (evt) {
                            this._activateColorMode($(evt.target).val());
                        }.bind(this)))))
            .append($('<div></div>')
                .addClass('color-components'))
            .append($('<hr/>'))
            .append($('<div></div>')
                .addClass('color')
                .append($('<div></div>')
                    .append($('<div></div>')
                        .addClass('previous-color')
                        .gColorButton({})
                        .on('colorchange', function (evt, color) {
                            if (color) {
                                this._assignPreviousColor(color);
                            }
                        }.bind(this)))
                    .append($('<div></div>')
                        .addClass('current-color')
                        .gColorButton({})
                        .on('colorchange', function (evt, color) {
                            if (color) {
                                this._assignCurrentColor(color);
                            }
                        }.bind(this)))
                    .append($('<input>')
                        .addClass('color-input')
                        .on('change', function () {
                            var color = IFColor.parseCSSColor($(this).val());
                            if (color) {
                                this._assignCurrentColor(color);
                            }
                        }.bind(this))))
                .append($('<div></div>')
                    .append($('<select></select>')
                        .addClass('matcher-select')
                        .on('change', function (evt) {
                            this._activateMatcher($(evt.target).find(':selected').data('matcher'));
                        }.bind(this)))))
            .append($('<div></div>')
                .addClass('matcher-palette'));

        // Initiate components
        var components = htmlElement.find('.color-components');
        var _addComponent = function (index) {
            $('<div></div>')
                .addClass('color-component color-component-' + index.toString())
                .append($('<div></div>')
                    .addClass('color-label')
                    .on('click', function () {
                        var input = this._htmlElement.find('.color-component-' + index.toString() + ' input[type="text"]');
                        if (input.val() == this._colorMode.components[index].max) {
                            input.val(this._colorMode.components[index].min);
                        } else {
                            input.val(this._colorMode.components[index].max);
                        }

                        this._updateFromComponents();
                    }.bind(this)))
                .append($('<div></div>')
                    .addClass('color-range')
                    .append($('<input>')
                        .attr('type', 'range')
                        .attr('tabIndex', '-1')
                        .on('input', function (evt) {
                            this._htmlElement.find('.color-component-' + index.toString() + ' input[type="text"]').val($(evt.target).val());
                            this._updateFromComponents();
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('color-value')
                    .append($('<input>')
                        .attr('type', 'text')
                        .on('input', function () {
                            this._updateFromComponents();
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('color-unit'))
                .appendTo(components);
        }.bind(this);

        for (var i = 0; i < 4; ++i) {
            _addComponent(i);
        }

        // Init color modes
        var colorModeSelect = htmlElement.find('.color-mode-select');
        for (var i = 0; i < GColorPalette._ColorModes.length; ++i) {
            var modeInfo = GColorPalette._ColorModes[i];
            $('<option></option>')
                .attr('value', modeInfo.key)
                .text(modeInfo.name)
                .appendTo(colorModeSelect);
        }

        // Initiate matchers
        var matcherSelect = htmlElement.find('.matcher-select');
        var matcherGroup = matcherSelect;
        var lastCategory = null;
        var firstMatcher = null;
        for (var i = 0; i < gravit.colorMatchers.length; ++i) {
            var matcher = gravit.colorMatchers[i];
            var category = ifLocale.get(matcher.getCategory());

            // Add to selector
            if (!lastCategory || category !== lastCategory) {
                matcherGroup = $('<optgroup></optgroup>')
                    .attr('label', category)
                    .appendTo(matcherSelect);
                lastCategory = category;
            }

            $('<option></option>')
                .data('matcher', matcher)
                .text(ifLocale.get(matcher.getTitle()))
                .appendTo(matcherGroup);

            if (!firstMatcher) {
                firstMatcher = matcher;
            }
        }

        // Activate default color mode and matcher
        this._activateColorMode(IFColor.Type.RGB.key);

        if (firstMatcher) {
            this._activateMatcher(firstMatcher);
        }

        // Set default colors
        this._assignPreviousColor(IFColor.WHITE);
        this._assignCurrentColor(IFColor.WHITE);
    };

    /** @override */
    GColorPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getEditor().addEventListener(IFEditor.SelectionChangedEvent, this._syncMode, this);
            this._htmlElement.find('.current-color').gColorButton('scene', this._document.getScene());
            this._htmlElement.find('.previous-color').gColorButton('scene', this._document.getScene());
            this._syncMode();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getEditor().removeEventListener(IFEditor.SelectionChangedEvent, this._syncMode, this);
            this._document = null;
            this._htmlElement.find('.current-color').gColorButton('scene', null);
            this._htmlElement.find('.previous-color').gColorButton('scene', null);
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} evt
     * @private
     */
    GColorPalette.prototype._afterPropertiesChange = function (evt) {
        var syncMode = this._getSyncMode();
        if ((syncMode && syncMode === 'fill' && evt.properties.indexOf('_fpt') >= 0) ||
            (syncMode && syncMode === 'border' && evt.properties.indexOf('_bpt') >= 0) ||
            (!syncMode && evt.node === this._document.getScene() && evt.properties.indexOf('cltp') >= 0)) {
            this._syncMode();
        }
    };

    GColorPalette.prototype._activateColorMode = function (colorMode) {
        if (!this._colorMode || colorMode !== this._colorMode.key) {
            for (var i = 0; i < GColorPalette._ColorModes.length; ++i) {
                var modeInfo = GColorPalette._ColorModes[i];
                if (modeInfo.key === colorMode) {
                    this._colorMode = modeInfo;

                    // Activate sliders
                    for (var i = 0; i < 4; ++i) {
                        var componentPanel = this._htmlElement.find('.color-component-' + i.toString());

                        if (i >= modeInfo.components.length) {
                            componentPanel.css('visibility', 'hidden');
                        } else {
                            componentPanel.css('visibility', '');

                            var component = modeInfo.components[i];
                            var range = componentPanel.find('input[type="range"]');
                            var label = componentPanel.find('.color-label');
                            var unit = componentPanel.find('.color-unit');

                            label.text(component.label);
                            unit.text(component.unit);
                            unit.css('display', component.unit != '' ? '' : 'none');

                            range.attr('min', component.min);
                            range.attr('max', component.max);
                            range.attr('step', component.step ? component.step.toString() : '')
                        }
                    }

                    this._updateToComponents();
                    this._updateFromComponents();

                    break;
                }
            }
        }
        this._htmlElement.find('.color-mode-select').val(this._colorMode ? this._colorMode.key : 'rgb');
    };

    GColorPalette.prototype._updateFromComponents = function() {
        // Collect component values / correct them for current mode
        var components = [];
        for (var i = 0; i < this._colorMode.components.length; ++i) {
            var component = this._colorMode.components[i];
            var componentEl = this._htmlElement.find('.color-component-' + i.toString());
            var textInput = componentEl.find('input[type="text"]');
            var rangeInput = componentEl.find('input[type="range"]');
            var value = parseInt(textInput.val());

            if (isNaN(value) || value < component.min) {
                value = component.min;
            } else if (value > component.max) {
                value = component.max;
            }

            // Push value
            components.push(value);

            // Update inputs with correct value
            textInput.val(value);
            rangeInput.val(value);
        }

        var color = this._colorMode.makeColor(components, this._previousColor);
        this._assignCurrentColor(color);
        return color;
    };

    GColorPalette.prototype._updateToComponents = function() {
        var color = this._currentColor ? this._currentColor : IFColor.TRANSPARENT_WHITE;

        // Get the components in the right format
        var components = this._colorMode.getComponents(color);
        if (components) {
            for (var i = 0; i < this._colorMode.components.length; ++i) {
                var component = this._colorMode.components[i];
                var componentEl = this._htmlElement.find('.color-component-' + i.toString());
                var textInput = componentEl.find('input[type="text"]');
                var rangeInput = componentEl.find('input[type="range"]');
                var val = Math.min(component.max, Math.max(component.min, components[i])).toFixed(0);

                var stopsFunc = this._colorMode.components[i].stops;
                var stops = stopsFunc ? stopsFunc(components, this._previousColor) : null;

                if (stops) {
                    if (stops.length === 1) {
                        rangeInput.css('background', stops[0].asCSSString());
                    } else {
                        var cssStops = '';
                        for (var s = 0; s < stops.length; ++s) {
                            if (cssStops !== '') {
                                cssStops += ',';
                            }
                            cssStops += stops[s].asCSSString();
                        }
                        rangeInput.css('background', 'linear-gradient(90deg, ' + cssStops + ')');
                    }
                } else {
                    rangeInput.css('background', '');
                }

                textInput.val(val);
                rangeInput.val(val);
            }
        }
    };

    /**
     * @param {IFColor} value
     * @param {Boolean} noSync
     * @private
     */
    GColorPalette.prototype._assignCurrentColor = function(value, noSync) {
        value = typeof value === 'string' ? IFColor.parseColor(value) : value;

        this._currentColor = value;

        this._htmlElement.find('input[type="color"]').val(value ? value.asHTMLHexString() : '');
        this._htmlElement.find('.current-color').gColorButton('value', this._currentColor);
        this._htmlElement.find('.color-input').val(this._currentColor ? this._currentColor.asHTMLHexString() : '');

        this._updateColorDifference();

        this._updateToComponents();

        if (!noSync) {
            this._assignSyncMode();
        }
    };

    /**
     * @param {IFColor} value
     * @private
     */
    GColorPalette.prototype._assignPreviousColor = function(value) {
        value = typeof value === 'string' ? IFColor.parseColor(value) : value;

        this._previousColor = value;

        this._htmlElement.find('.previous-color').gColorButton('value', this._previousColor);

        this._updateColorDifference();

        if (this._colorMode && this._colorMode.previousColor) {
            this._updateToComponents();
        }

        this._updateMatches();
    };

    /**
     * @private
     */
    GColorPalette.prototype._updateColorDifference = function () {
        var colorDiff = '';
        if (this._previousColor && this._currentColor) {
            var diff = this._currentColor.difference(this._previousColor);
            colorDiff = (diff < 0 ? ifUtil.formatNumber(diff, 2) : diff.toFixed(0));
        }
        // TODO : I18N
        this._htmlElement.find('.current-color').attr('title', 'Color Difference (CIEDE2000): ' + colorDiff);
    };

    /**
     * @private
     */
    GColorPalette.prototype._updateMatches = function () {
        var palettePanel = this._htmlElement.find('.matcher-palette');
        palettePanel.empty();

        if (this._matcher && this._previousColor) {
            var _addMatchColor = function (color, width) {
                $('<div></div>')
                    .css('width', width.toString() + '%')
                    .css('background', IFPattern.asCSSBackground(color))
                    .on('click', function () {
                        this._assignCurrentColor(color);
                    }.bind(this))
                    .appendTo(palettePanel);
            }.bind(this);

            var matches = this._matcher.match(this._previousColor);
            if (matches && matches.length > 0) {
                var len = Math.min(matches.length, 8);
                var width = 100 / len;
                for (var i = 0; i < len; ++i) {
                    // Convert match color to same type as curent color if any
                    var match = this._currentColor ? matches[i].toType(this._currentColor.getType()) : matches[i];
                    _addMatchColor(match, width);
                }
            }
        }
    };

    /**
     * @return {String}
     * @private
     */
    GColorPalette.prototype._getSyncMode = function () {
        var result = this._htmlElement.find('[data-sync].g-active').attr('data-sync');
        if (!result || !result.length) {
            return null;
        }
        return result;
    };

    /**
     * @param {String} mode
     * @private
     */
    GColorPalette.prototype._toggleSyncMode = function (mode) {
        if (mode === this._getSyncMode()) {
            mode = '';
        }

        this._htmlElement.find('[data-sync]').each(function (index, element) {
            var $element = $(element);
            $element.toggleClass('g-active', $element.attr('data-sync') === mode);
        });
        
        this._syncMode();
    };

    /** @private */
    GColorPalette.prototype._syncMode = function () {
        var mode = this._getSyncMode();
        this._syncElements = null;
        this._syncColorElement = null;
        if (mode) {
            var selection = this._document.getEditor().getSelection();
            if (selection) {
                var assignedColor = false;
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i] instanceof IFElement && selection[i].hasMixin(IFElement.Stylable)) {
                        var element = selection[i];
                        var propertySets = element.getStylePropertySets();
                        var color = null;
                        var addElement = false;

                        if (mode === 'fill' && propertySets.indexOf(IFStylable.PropertySet.Fill) >= 0) {
                            var fpt = element.getProperty('_fpt');
                            if (fpt && fpt instanceof IFColor) {
                                color = fpt;
                            }
                            addElement = true;
                        } else if (mode === 'border' && propertySets.indexOf(IFStylable.PropertySet.Border) >= 0) {
                            var bpt = element.getProperty('_bpt');
                            if (bpt && bpt instanceof IFColor) {
                                color = bpt;
                            }
                            addElement = true;
                        }

                        if (addElement) {
                            if (!this._syncElements) {
                                this._syncElements = [element];
                            } else {
                                this._syncElements.push(element);
                            }
                        }

                        if (color && !assignedColor) {
                            this._assignPreviousColor(color);
                            this._assignCurrentColor(color, true);
                            this._activateColorMode(color.getType().key);
                            this._syncColorElement = element;
                            assignedColor = true;
                        }
                    }
                }
            }
        } else {
            this._activateColorMode(this._document.getScene().getProperty('cltp'));
        }
    };

    /** @private */
    GColorPalette.prototype._assignSyncMode = function () {
        var mode = this._getSyncMode();
        if (mode && this._syncElements && this._syncElements.length > 0) {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                for (var i = 0; i < this._syncElements.length; ++i) {
                    var element = this._syncElements[i];
                    if (mode === 'fill') {
                        element.setProperty('_fpt', this._currentColor);
                    } else if (mode === 'border') {
                        element.setProperty('_bpt', this._currentColor);
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Change Color');
            }
        }
    };

    /**
     * @param {GColorMatcher} matcher
     * @private
     */
    GColorPalette.prototype._activateMatcher = function (matcher) {
        this._matcher = matcher;
        this._updateMatches();
    };

    /** @override */
    GColorPalette.prototype.toString = function () {
        return "[Object GColorPalette]";
    };

    _.GColorPalette = GColorPalette;
})(this);