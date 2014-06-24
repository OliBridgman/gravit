(function (_) {

    /**
     * Color Mixer Palette
     * @class GColorMixerPalette
     * @extends GPalette
     * @constructor
     */
    function GColorMixerPalette() {
        GPalette.call(this);
    };
    IFObject.inherit(GColorMixerPalette, GPalette);

    GColorMixerPalette.ID = "color-mixer";
    GColorMixerPalette.TITLE = new IFLocale.Key(GColorMixerPalette, "title");

    /**
     * @private
     */
    GColorMixerPalette._Modes = [
        {
            id: 'cmyk',
            name: 'CMYK',
            components: [
                {
                    icon: 'tint',
                    color: '#00aeef',
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
                    icon: 'tint',
                    color: '#ec008c',
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
                    icon: 'tint',
                    color: '#d8c800',
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
                    icon: 'tint',
                    color: '#231f20',
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
            makeColor: function (components) {
                return new IFColor(IFColor.Type.CMYK, components);
            }
        },
        {
            id: 'rgb',
            name: 'RGB',
            components: [
                {
                    icon: 'circle-o',
                    color: 'red',
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
                    icon: 'circle-o',
                    color: 'green',
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
                    icon: 'circle-o',
                    color: 'blue',
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
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.RGB, components);
            }
        },
        {
            id: 'hsl',
            name: 'HSL',
            components: [
                {
                    icon: 'circle-o',
                    color: null,
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
                    icon: 'adjust',
                    color: null,
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
                    icon: 'sun-o',
                    color: null,
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
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.HSL, components);
            }
        },
        {
            id: 'tone',
            name: 'Tone',
            components: [
                {
                    icon: 'circle-o',
                    color: null,
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        return [IFColor.parseCSSColor('white'), IFColor.parseCSSColor('black')];
                    }
                },
                {
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.Tone, components);
            }
        }
    ];

    /**
     * @type {JQuery}
     * @private
     */
    GColorMixerPalette.prototype._htmlElement = null;

    /**
     * @type {*}
     * @private
     */
    GColorMixerPalette.prototype._modeInfo = null;

    /**
     * @type {boolean}
     * @private
     */
    GColorMixerPalette.prototype._noPreviousColorUpdate = false;

    /**
     * @returns {string}
     */
    GColorMixerPalette.prototype.getMode = function () {
        return this._mode;
    };

    /**
     * @returns {string}
     */
    GColorMixerPalette.prototype.setMode = function (mode) {
        if (!this._modeInfo || mode !== this._modeInfo.id) {
            for (var i = 0; i < GColorMixerPalette._Modes.length; ++i) {
                var modeInfo = GColorMixerPalette._Modes[i];
                if (modeInfo.id === mode) {
                    this._modeInfo = modeInfo;

                    // Activate button
                    this._htmlElement.find('.color-modes > button').each(function () {
                        var $this = $(this);
                        if ($this.attr('data-mode-id') === mode) {
                            $this.addClass('g-active');
                        } else {
                            $this.removeClass('g-active');
                        }
                    });

                    // Activate sliders
                    for (var i = 0; i < 4; ++i) {
                        var componentPanel = this._htmlElement.find('.color-component-' + i.toString());

                        if (i >= this._modeInfo.components.length) {
                            componentPanel.css('visibility', 'hidden');
                        } else {
                            componentPanel.css('visibility', '');

                            var component = this._modeInfo.components[i];
                            var range = componentPanel.find('input[type="range"]');
                            var icon = componentPanel.find('.color-icon');
                            var unit = componentPanel.find('.color-unit');

                            icon.attr('class', 'color-icon fa fa-fw fa-' + component.icon);
                            unit.text(component.unit);
                            unit.css('display', component.unit != '' ? '' : 'none');
                            icon.css('color', component.color ? component.color : '');

                            range.attr('min', component.min);
                            range.attr('max', component.max);
                        }
                    }

                    // Update values from global color to
                    // properly convert into our target format
                    this._updateFromGlobalColor(false);

                    // Update colors to global color now so that
                    // our global color reflects the correct color type
                    this._updateToGlobalColor();

                    break;
                }
            }
        }
    };

    /** @override */
    GColorMixerPalette.prototype.getId = function () {
        return GColorMixerPalette.ID;
    };

    /** @override */
    GColorMixerPalette.prototype.getTitle = function () {
        return GColorMixerPalette.TITLE;
    };

    /** @override */
    GColorMixerPalette.prototype.getGroup = function () {
        return GPalette.GROUP_COLOR;
    };

    /** @override */
    GColorMixerPalette.prototype.init = function (htmlElement, menu) {
        GPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        var _addComponent = function (index) {
            $('<div></div>')
                .addClass('color-component color-component-' + index.toString())
                .append($('<span></span>')
                    .addClass('color-icon')
                    .on('click', function () {
                        var input = this._htmlElement.find('.color-component-' + index.toString() + ' input[type="text"]');
                        if (input.val() == this._modeInfo.components[index].max) {
                            input.val(this._modeInfo.components[index].min);
                        } else {
                            input.val(this._modeInfo.components[index].max);
                        }
                        this._updateToGlobalColor();
                    }.bind(this)))
                .append($('<div></div>')
                    .addClass('color-range')
                    .append($('<input>')
                        .attr('type', 'range')
                        .attr('tabIndex', '-1')
                        .on('change', function (evt) {
                            this._htmlElement.find('.color-component-' + index.toString() + ' input[type="text"]').val($(evt.target).val());
                            this._updateToGlobalColor();
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('color-value')
                    .append($('<input>')
                        .attr('type', 'text')
                        .on('input', this._updateToGlobalColor.bind(this))))
                .append($('<span></span>')
                    .addClass('color-unit'))
                .appendTo(this._htmlElement);
        }.bind(this);

        // Append the components
        for (var i = 0; i < 4; ++i) {
            _addComponent(i);
        }

        // Append toolbar
        var toolbar = $('<div></div>')
            .addClass('color-toolbar')
            .appendTo(this._htmlElement);

        // Append component modes container
        var modes = $('<div></div>')
            .addClass('color-modes')
            .appendTo(toolbar);

        // Initiate component modes
        for (var i = 0; i < GColorMixerPalette._Modes.length; ++i) {
            var _modeInfo = GColorMixerPalette._Modes[i];
            $('<button></button>')
                .attr('data-mode-id', _modeInfo.id)
                .text(_modeInfo.name)
                .on('click', function (evt) {
                    this.setMode($(evt.target).attr('data-mode-id'));
                }.bind(this))
                .appendTo(modes);
        }

        // Append color picker to modes
        $('<button></button>')
            .gColorButton({
                swatch : false
            })
            .on('change', function (evt, color) {
                gApp.setGlobalColor(color);
            })
            .appendTo(modes);

        // Append component preview container
        $('<div></div>')
            .addClass('color-preview')
            .append($('<div></div>')
                .attr('data-color-type', 'previous')
                .gColorSwatch()
                .on('change', function (evt, color) {
                    gApp.setGlobalColor(color);
                }))
            .append($('<div></div>')
                .attr('data-color-type', 'current')
                .gColorSwatch()
                .on('change', function (evt, color) {
                    gApp.setGlobalColor(color);
                }))
            .appendTo(toolbar);

        // Set our initial mode
        this.setMode('rgb');

        // Make an initial update
        this._updateFromGlobalColor(true);

        // Subscribe to global color change event
        gApp.addEventListener(GApplication.GlobalColorChangedEvent, function () {
            this._updateFromGlobalColor(!this._noPreviousColorUpdate);
        }.bind(this));
    };

    /** @override */
    GColorMixerPalette.prototype._createDocumentState = function (document) {
        // Return dummy state for now to retrieve state updates
        return new GPalette.DocumentState(document);
    };

    /**
     * Update current global color from components
     * @private
     */
    GColorMixerPalette.prototype._updateToGlobalColor = function (color) {
        // Collect component values / correct them for current mode
        var components = [];
        for (var i = 0; i < this._modeInfo.components.length; ++i) {
            var component = this._modeInfo.components[i];
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

        var newColor = this._modeInfo.makeColor(components);

        // Prevent previous color update as we're setting the global color ourself
        this._noPreviousColorUpdate = true;
        gApp.setGlobalColor(newColor);
        this._noPreviousColorUpdate = false;
    };

    /**
     * Update components from current global color
     * @private
     */
    GColorMixerPalette.prototype._updateFromGlobalColor = function (updatePrevious) {
        var globalColor = gApp.getGlobalColor();

        // TODO !!! Take CMS into account !!!
        // Get the components in the right format
        var components = null;
        if (this._modeInfo.id === 'rgb') {
            components = globalColor.asRGB();
        } else if (this._modeInfo.id === 'hsl') {
            components = globalColor.asHSL();
        } else if (this._modeInfo.id === 'tone') {
            components = globalColor.asTone();
        } else if (this._modeInfo.id === 'cmyk') {
            components = globalColor.asCMYK();
        } else {
            throw new Error('Unknown mode.');
        }

        if (components) {
            for (var i = 0; i < this._modeInfo.components.length; ++i) {
                var component = this._modeInfo.components[i];
                var componentEl = this._htmlElement.find('.color-component-' + i.toString());
                var textInput = componentEl.find('input[type="text"]');
                var rangeInput = componentEl.find('input[type="range"]');
                var val = Math.min(component.max, Math.max(component.min, components[i])).toFixed(0);

                var stopsFunc = this._modeInfo.components[i].stops;
                var stops = stopsFunc ? stopsFunc(components) : null;

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

        var colorPreview = this._htmlElement.find('.color-preview');

        if (updatePrevious) {
            colorPreview.find('[data-color-type="previous"]').gColorSwatch('value', globalColor);
        }

        colorPreview.find('[data-color-type="current"]').gColorSwatch('value', globalColor);
        this._htmlElement.find('.color-modes > .g-color-button').gColorButton('value', globalColor);
    };

    /** @override */
    GColorMixerPalette.prototype.toString = function () {
        return "[Object GColorMixerPalette]";
    };

    _.GColorMixerPalette = GColorMixerPalette;
})(this);