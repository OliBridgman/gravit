(function (_) {

    /**
     * Color Mixer Palette
     * @class EXColorMixerPalette
     * @extends EXPalette
     * @constructor
     */
    function EXColorMixerPalette() {
        EXPalette.call(this);
    };
    GObject.inherit(EXColorMixerPalette, EXPalette);

    EXColorMixerPalette.ID = "color-mixer";
    EXColorMixerPalette.TITLE = new GLocale.Key(EXColorMixerPalette, "title");

    /**
     * @private
     */
    EXColorMixerPalette._Modes = [
        {
            id: 'cmyk',
            name: 'CMYK',
            components: [
                {
                    icon: 'tint',
                    color: '#00aeef',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'tint',
                    color: '#ec008c',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'tint',
                    color: '#d8c800',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'tint',
                    color: '#231f20',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new GXColor(GXColor.Type.CMYK, components);
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
                    unit: ' '
                },
                {
                    icon: 'circle-o',
                    color: 'green',
                    min: 0,
                    max: 255,
                    unit: ' '
                },
                {
                    icon: 'circle-o',
                    color: 'blue',
                    min: 0,
                    max: 255,
                    unit: ' '
                },
                {
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new GXColor(GXColor.Type.RGB, components);
            }
        },
        {
            id: 'hsl',
            name: 'HSL',
            components: [
                {
                    icon: 'circle-o',
                    color: 'black',
                    min: 0,
                    max: 360,
                    unit: '° '
                },
                {
                    icon: 'adjust',
                    color: 'black',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'sun-o',
                    color: 'black',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new GXColor(GXColor.Type.HSL, components);
            }
        },
        {
            id: 'tone',
            name: 'Tone',
            components: [
                {
                    icon: 'circle-o',
                    color: 'gray',
                    min: 0,
                    max: 100,
                    unit: '%'
                },
                {
                    icon: 'star-half-o',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new GXColor(GXColor.Type.Tone, components);
            }
        }
    ];

    /**
     * @type {JQuery}
     * @private
     */
    EXColorMixerPalette.prototype._htmlElement = null;

    /**
     * @type {*}
     * @private
     */
    EXColorMixerPalette.prototype._modeInfo = null;

    /**
     * @type {boolean}
     * @private
     */
    EXColorMixerPalette.prototype._noPreviousColorUpdate = false;

    /**
     * @returns {string}
     */
    EXColorMixerPalette.prototype.getMode = function () {
        return this._mode;
    };

    /**
     * @returns {string}
     */
    EXColorMixerPalette.prototype.setMode = function (mode) {
        if (!this._modeInfo || mode !== this._modeInfo.id) {
            for (var i = 0; i < EXColorMixerPalette._Modes.length; ++i) {
                var modeInfo = EXColorMixerPalette._Modes[i];
                if (modeInfo.id === mode) {
                    this._modeInfo = modeInfo;

                    // Activate button
                    this._htmlElement.find('.color-modes > .g-button').each(function () {
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
                            icon.css('color', component.color ? component.color : 'black');

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
    EXColorMixerPalette.prototype.getId = function () {
        return EXColorMixerPalette.ID;
    };

    /** @override */
    EXColorMixerPalette.prototype.getTitle = function () {
        return EXColorMixerPalette.TITLE;
    };

    /** @override */
    EXColorMixerPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_COLOR;
    };

    /**
     * @override
     */
    EXColorMixerPalette.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, 'F9'];
    };

    /** @override */
    EXColorMixerPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

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
                        .exAutoBlur()
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
        for (var i = 0; i < EXColorMixerPalette._Modes.length; ++i) {
            var _modeInfo = EXColorMixerPalette._Modes[i];
            $('<div></div>')
                .addClass('g-button g-flat')
                .attr('data-mode-id', _modeInfo.id)
                .text(_modeInfo.name)
                .on('click', function (evt) {
                    this.setMode($(evt.target).attr('data-mode-id'));
                }.bind(this))
                .appendTo(modes);
        }

        // Append component preview container
        $('<div></div>')
            .addClass('color-preview')
            .append($('<div></div>')
                .addClass('ex-color-preview')
                .append($('<div></div>')
                    .attr('data-color-type', 'previous')
                    .exColorBox()
                    .on('g-color-change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    }))
                .append($('<div></div>')
                    .attr('data-color-type', 'current')
                    .exColorBox()
                    .on('g-color-change', function (evt, color) {
                        gApp.setGlobalColor(color);
                    })))
            .appendTo(toolbar);

        // Set our initial mode
        this.setMode('rgb');

        // Make an initial update
        this._updateFromGlobalColor(true);

        // Subscribe to global color change event
        gApp.addEventListener(EXApplication.GlobalColorChangedEvent, function () {
            this._updateFromGlobalColor(!this._noPreviousColorUpdate);
        }.bind(this));
    };

    /** @override */
    EXColorMixerPalette.prototype._createDocumentState = function (document) {
        // Return dummy state for now to retrieve state updates
        return new EXPalette.DocumentState(document);
    };

    /**
     * Update current global color from components
     * @private
     */
    EXColorMixerPalette.prototype._updateToGlobalColor = function () {
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

        // Prevent previous color update as we're setting the global color ourself
        this._noPreviousColorUpdate = true;
        gApp.setGlobalColor(this._modeInfo.makeColor(components));
        this._noPreviousColorUpdate = false;
    };

    /**
     * Update components from current global color
     * @private
     */
    EXColorMixerPalette.prototype._updateFromGlobalColor = function (updatePrevious) {
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

        for (var i = 0; i < this._modeInfo.components.length; ++i) {
            var component = this._modeInfo.components[i];
            var componentEl = this._htmlElement.find('.color-component-' + i.toString());
            var textInput = componentEl.find('input[type="text"]');
            var rangeInput = componentEl.find('input[type="range"]');
            var val = Math.min(component.max, Math.max(component.min, components[i])).toFixed(0);

            textInput.val(val);
            rangeInput.val(val);
        }

        var colorPreview = this._htmlElement.find('.ex-color-preview');

        if (updatePrevious) {
            colorPreview.find('[data-color-type="previous"]').exColorBox('color', globalColor);
        }

        colorPreview.find('[data-color-type="current"]').exColorBox('color', globalColor);
    };

    /** @override */
    EXColorMixerPalette.prototype.toString = function () {
        return "[Object EXColorMixerPalette]";
    };

    _.EXColorMixerPalette = EXColorMixerPalette;
})(this);