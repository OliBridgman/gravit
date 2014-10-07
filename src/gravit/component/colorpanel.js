(function ($) {

    var COLORS = [
        ['#1abc9c', '#16a085', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#34495e', '#2c3e50', '#f1c40f', '#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b', '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d'],
    ];

    var wheelSize = 250;
    var mapSize = 250;

    var COLOR_MODES = {
        'rgb': {
            components: [
                {
                    label: 'R',
                    component: 'r',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex([0, components[1], components[2]]),
                            IFColor.rgbToHtmlHex([255, components[1], components[2]])
                        ];
                    }
                },
                {
                    label: 'G',
                    component: 'g',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex([components[0], 0, components[2]]),
                            IFColor.rgbToHtmlHex([components[0], 255, components[2]])
                        ];
                    }
                },
                {
                    label: 'B',
                    component: 'b',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex([components[0], components[1], 0]),
                            IFColor.rgbToHtmlHex([components[0], components[1], 255])
                        ];
                    }
                }
            ],
            componentToValue: function (component, componentValue) {
                return componentValue;
            },
            valueToComponent: function (component, value) {
                return value;
            },
            componentsFromColor: function (color) {
                return color.toScreen();
            },
            colorFromComponents: function (components) {
                return new IFRGBColor(components);
            },
            componentsFromMap: function (component, value, x, y) {
                switch (component) {
                    case 'r':
                        return [value, (1 - y) * 255, x * 255];
                    case 'g':
                        return [(1 - y) * 255, value, x * 255];
                    case 'b':
                        return [x * 255, (1 - y) * 255, value];
                }
            },
            mapFromComponents: function (component, components) {
                switch (component) {
                    case 'r':
                        return [components[2] / 255, (1 - components[1] / 255)];
                    case 'g':
                        return [components[2] / 255, (1 - components[0] / 255)];
                    case 'b':
                        return [components[0] / 255, (1 - components[1] / 255)];
                }
            }
        },
        'hsv': {
            components: [
                {
                    label: 'H',
                    component: 'h',
                    min: 0,
                    max: 360,
                    unit: '° ',
                    map: true,
                    stops: function (components) {
                        var result = [];
                        var steps = 60;
                        for (var i = 0; i <= 360; i += steps) {
                            var hsv = [i, components[1], components[2]];
                            result.push(IFColor.rgbToHtmlHex(IFColor.hsvToRGB(hsv)));
                        }
                        return result;
                    }
                },
                {
                    label: 'S',
                    component: 's',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.hsvToRGB([components[0], 0, components[2]])),
                            IFColor.rgbToHtmlHex(IFColor.hsvToRGB([components[0], 1, components[2]]))
                        ];
                    }
                },
                {
                    label: 'B',
                    component: 'v',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.hsvToRGB([components[0], components[1], 0])),
                            IFColor.rgbToHtmlHex(IFColor.hsvToRGB([components[0], components[1], 1]))
                        ];
                    }
                }
            ],
            componentToValue: function (component, componentValue) {
                switch (component) {
                    case 's':
                    case 'v':
                        return componentValue / 100.0;
                    default:
                        return componentValue;
                }
            },
            valueToComponent: function (component, value) {
                switch (component) {
                    case 's':
                    case 'v':
                        return value * 100.0;
                    default:
                        return value;
                }
            },
            componentsFromColor: function (color) {
                return IFColor.rgbToHSV(color.toScreen());
            },
            colorFromComponents: function (components) {
                return new IFRGBColor(IFColor.hsvToRGB(components));
            },
            componentsFromMap: function (component, value, x, y) {
                switch (component) {
                    case 'h':
                        return [value, x, 1 - y];
                    case 's':
                        return [x * 360, value, 1 - y];
                    case 'v':
                        return [x * 360, 1 - y, value];
                }
            },
            mapFromComponents: function (component, components) {
                switch (component) {
                    case 'h':
                        return [components[1], 1 - components[2]];
                    case 's':
                        return [components[0] / 360, 1 - components[2]];
                    case 'v':
                        return [components[0] / 360, 1 - components[1]];
                }
            }
        },
        'cmyk': {
            components: [
                {
                    label: 'C',
                    component: 'c',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([0, components[1], components[2], components[3]])),
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([1, components[1], components[2], components[3]]))
                        ];
                    }
                },
                {
                    label: 'M',
                    component: 'm',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], 0, components[2], components[3]])),
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], 1, components[2], components[3]]))
                        ];
                    }
                },
                {
                    label: 'Y',
                    component: 'y',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: true,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], components[1], 0, components[3]])),
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], components[1], 1, components[3]]))
                        ];
                    }
                },
                {
                    label: 'K',
                    component: 'k',
                    min: 0,
                    max: 100,
                    unit: '%',
                    map: false,
                    stops: function (components) {
                        return [
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], components[1], components[2], 0])),
                            IFColor.rgbToHtmlHex(IFColor.cmykToRGB([components[0], components[1], components[2], 1]))
                        ];
                    }
                }
            ],
            componentToValue: function (component, componentValue) {
                return componentValue / 100.0;
            },
            valueToComponent: function (component, value) {
                return value * 100.0;
            },
            componentsFromColor: function (color) {
                return color instanceof IFCMYKColor ? color.getValue() : IFColor.rgbToCMYK(color.toScreen(true/*no-cms*/));
            },
            colorFromComponents: function (components) {
                return new IFCMYKColor(components);
            },
            componentsFromMap: function (component, value, x, y, components) {
                switch (component) {
                    case 'c':
                        return [value, 1.0 - y, x, components[3]];
                    case 'm':
                        return [1.0 - y, value, x, components[3]];
                    case 'y':
                        return [1.0 - y, x, value, components[3]];
                }
            },
            mapFromComponents: function (component, components) {
                switch (component) {
                    case 'c':
                        return [components[2], 1 - components[1]];
                    case 'm':
                        return [components[2], 1 - components[0]];
                    case 'y':
                        return [components[1], 1 - components[0]];
                }
            }
        }
    };

    function mapMouseEvent(evt) {
        var $this = $(this);
        var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
        var mapContainer = $this.find('.map-container');
        var offset = $(mapContainer).offset();
        var x = Math.max(0, Math.min(mapContainer.outerWidth(), evt.pageX - offset.left - 4));
        var y = Math.max(0, Math.min(mapContainer.outerHeight(), evt.pageY - offset.top - 4));


        var $this = $(this);
        var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
        var components = methods._getComponents.call(this);
        var mappedComponents = colorModeInfo.componentsFromMap(components.active.component, components.active.value, x / mapSize, y / mapSize, components.components);
        var mappedColor = colorModeInfo.colorFromComponents(mappedComponents);

        methods._setCurrentColor.call(this, mappedColor);
        methods._updateComponents.call(this, mappedComponents);
        methods._updateMapMarker.call(this);
        methods._updateWheel.call(this);
    };

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            return this.each(function () {
                var self = this;

                var mapMouseHandler = mapMouseEvent.bind(self);

                var _createColorModeButton = function (mode, title) {
                    return $('<button></button>')
                        .attr('data-color-mode', mode)
                        .text(title)
                        .on('click', function (evt) {
                            methods.colorMode.call(self, mode);
                        });
                };

                var _createColorComponent = function (index) {
                    return $('<div></div>')
                        .addClass('color-component color-component-' + index.toString())
                        .append($('<div></div>')
                            .addClass('color-check')
                            .append($('<input>')
                                .attr('type', 'radio')
                                .attr('name', 'component-check')
                                .on('change', function () {
                                    methods._updateMap.call(self);
                                })))
                        .append($('<div></div>')
                            .addClass('color-label')
                            .on('click', function () {
                                var input = $this.find('.color-component-' + index.toString() + ' input[type="text"]');
                                var colorModeInfo = COLOR_MODES[methods.colorMode.call(self)];
                                if (input.val() == colorModeInfo.components[index].max) {
                                    input.val(colorModeInfo.components[index].min);
                                } else {
                                    input.val(colorModeInfo.components[index].max);
                                }

                                input.trigger('input');
                            }))
                        .append($('<div></div>')
                            .addClass('color-range')
                            .append($('<input>')
                                .attr('type', 'range')
                                .attr('tabIndex', '-1')
                                .on('input', function (evt) {
                                    $this.find('.color-component-' + index.toString() + ' input[type="text"]')
                                        .val($(evt.target).val())
                                        .trigger('input');
                                })))
                        .append($('<div></div>')
                            .addClass('color-value')
                            .append($('<input>')
                                .attr('type', 'text')
                                .on('input', function (evt) {
                                    var componentEl = $(evt.target).parents('.color-component');
                                    var colorModeInfo = COLOR_MODES[methods.colorMode.call(self)];
                                    var components = methods._getComponents.call(self);
                                    var color = colorModeInfo.colorFromComponents(components.components);

                                    methods._setCurrentColor.call(self, color);
                                    methods._updateComponents.call(self, components.components);
                                    methods._updateMapMarker.call(self);
                                    methods._updateWheel.call(self);

                                    if (!colorModeInfo.components[index].map || componentEl.find('input[type="radio"]').is(':checked')) {
                                        methods._updateMap.call(self);
                                    }
                                })))
                        .append($('<div></div>')
                            .addClass('color-unit'));
                };

                var $this = $(this)
                    .addClass('g-color-panel')
                    .data('gcolorpanel', {
                        scene: null,
                        previousColor: null,
                        color: null,
                        options: options
                    });

                $this
                    .append($('<input>')
                        .attr('type', 'color')
                        .css({
                            'position': 'absolute',
                            'visibility': 'hidden'
                        })
                        .on('change', function (evt) {
                            var color = IFRGBColor.parseCSSColor($(evt.target).val());
                            methods.currentColor.call(self, color);
                        }.bind(this)))
                    .append($('<div></div>')
                        .addClass('toolbar')
                        .append($('<div></div>')
                            .addClass('section-start')
                            .append(_createColorModeButton('rgb', 'RGB'))
                            .append(_createColorModeButton('hsv', 'HSB'))
                            .append(_createColorModeButton('cmyk', 'CMYK'))
                            .append($('<button></button>')
                                // TODO : I18N
                                .attr('title', 'System')
                                .append($('<span></span>')
                                    .addClass('fa fa-cog'))
                                .on('click', function () {
                                    $this.find('input[type="color"]').trigger('click');
                                })))
                        .append($('<div></div>')
                            .addClass('section-center')
                            .append($('<div></div>')
                                .addClass('color-preview')
                                .append($('<div></div>')
                                    .addClass('previous-color')
                                    .gPatternTarget({
                                        types: [IFColor]
                                    })
                                    .on('patternchange', function (evt, color) {
                                        if (color) {
                                            methods.previousColor.call(self, color);
                                        }
                                    }))
                                .append($('<div></div>')
                                    .addClass('current-color')
                                    .gPatternTarget({
                                        types: [IFColor]
                                    })
                                    .on('patternchange', function (evt, color) {
                                        if (color) {
                                            methods.color.call(self, color);
                                        }
                                    })
                                    .on('click', function () {
                                        $this.find('input[type="color"]').trigger('click');
                                    }))))
                        .append($('<div></div>')
                            .addClass('section-end')
                            .append($('<select></select>')
                                .attr('data-wheel', 'mix')
                                .append($('<option></option>')
                                    .attr('value', '')
                                    // TODO : I18N
                                    .text('No Mixes'))
                                .append($('<optgroup label="Mix"></optgroup>')
                                    .append($('<option></option>')
                                        .attr('value', 'tint')
                                        // TODO : I18N
                                        .text('Tints'))
                                    .append($('<option></option>')
                                        .attr('value', 'shade')
                                        // TODO : I18N
                                        .text('Shades'))
                                    .append($('<option></option>')
                                        .attr('value', 'tone')
                                        // TODO : I18N
                                        .text('Tones')))
                                .append($('<optgroup label="Blend Right"></optgroup>')
                                    .append($('<option></option>')
                                        .attr('value', '60')
                                        // TODO : I18N
                                        .text('1 Quarter'))
                                    .append($('<option></option>')
                                        .attr('value', '120')
                                        // TODO : I18N
                                        .text('2 Quarter'))
                                    .append($('<option></option>')
                                        .attr('value', '240')
                                        // TODO : I18N
                                        .text('3 Quarter')))
                                .append($('<optgroup label="Blend Left"></optgroup>')
                                    .append($('<option></option>')
                                        .attr('value', '-60')
                                        // TODO : I18N
                                        .text('1 Quarter'))
                                    .append($('<option></option>')
                                        .attr('value', '-120')
                                        // TODO : I18N
                                        .text('2 Quarter'))
                                    .append($('<option></option>')
                                        .attr('value', '-240')
                                        // TODO : I18N
                                        .text('3 Quarter')))
                                .on('change', function () {
                                    methods._updateWheel.call(self);
                                }))
                            .append($('<select></select>')
                                .attr('data-wheel', 'highlight')
                                .append($('<option></option>')
                                    .attr('value', 'start')
                                    // TODO : I18N
                                    .text('Color Wheel'))
                                .append($('<option></option>')
                                    .attr('value', 'triadic')
                                    // TODO : I18N
                                    .text('Triads'))
                                .append($('<option></option>')
                                    .attr('value', 'tetradic')
                                    // TODO : I18N
                                    .text('Tetrads'))
                                .append($('<option></option>')
                                    .attr('value', 'split_complements')
                                    // TODO : I18N
                                    .text('Split'))
                                .append($('<option></option>')
                                    .attr('value', 'complement')
                                    // TODO : I18N
                                    .text('Complement'))
                                .append($('<option></option>')
                                    .attr('value', 'analogous')
                                    // TODO : I18N
                                    .text('Analogous'))
                                .on('change', function () {
                                    methods._updateWheel.call(self);
                                }))))
                    .append($('<div></div>')
                        .addClass('color-container')
                        .append($('<div></div>')
                            .addClass('color')
                            .append($('<div></div>')
                                .addClass('map-container')
                                .append($('<canvas></canvas>')
                                    .addClass('map')
                                    .attr({
                                        width: mapSize.toString() + 'px',
                                        height: mapSize.toString() + 'px',
                                    })
                                    .on('mousedown', function (evt) {
                                        mapMouseHandler(evt);

                                        var upHandler = function (evt) {
                                            evt.stopPropagation();
                                            document.removeEventListener('mousemove', mapMouseHandler);
                                            document.removeEventListener('mouseup', upHandler, true);
                                        };

                                        document.addEventListener('mousemove', mapMouseHandler);
                                        document.addEventListener('mouseup', upHandler, true);
                                    }))
                                .append($('<div></div>')
                                    .addClass('marker')))
                            .append($('<div></div>')
                                .addClass('color-components')
                                .append(_createColorComponent(0))
                                .append(_createColorComponent(1))
                                .append(_createColorComponent(2))
                                .append(_createColorComponent(3))))
                        .append($('<div></div>')
                            .addClass('wheel')
                            .append($('<canvas></canvas>')
                                .addClass('color-wheel')
                                .attr({
                                    width: wheelSize.toString() + 'px',
                                    height: wheelSize.toString() + 'px',
                                }))));

                // Set some initial values
                methods.colorMode.call(self, 'hsv');


                //methods._updateMap.call(self);

                /*

                 function _createModeInput(mode, prefix, postfix) {
                 var result = $('<label></label>')
                 .attr('data-mode', mode);

                 if (mode) {
                 result
                 .append($('<input>')
                 .attr('type', 'radio')
                 .attr('name', 'mode')
                 .on('change', function (evt) {
                 if ($(evt.target).is(':checked')) {
                 methods.mode.call(self, mode);
                 }
                 }));
                 }

                 if (prefix) {
                 result
                 .append($('<span></span>')
                 .addClass('prefix')
                 .text(prefix + ':'));
                 }

                 result
                 .append($('<input>')
                 .attr('type', 'text'));

                 if (postfix) {
                 result
                 .append($('<span></span>')
                 .addClass('postfix')
                 .text(postfix))
                 }

                 return result;
                 };

                 var $this = $(this)
                 .addClass('g-color-panel')
                 .data('gcolorpanel', {
                 scene: null,
                 options: options
                 })
                 .append($('<canvas></canvas>')
                 .addClass('g-list color-map')
                 .attr({
                 'width': options.mapSize.toString(),
                 'height': options.mapSize.toString()
                 }))
                 .append($('<canvas></canvas>')
                 .addClass('g-list color-wheel')
                 .attr({
                 'width': options.mapSize.toString(),
                 'height': options.mapSize.toString()
                 }))
                 .append($('<input>')
                 .addClass('color-slider')
                 .attr('type', 'range')
                 .on('input', function () {
                 methods._updateMap.call(self);
                 }))
                 .append($('<div></div>')
                 .addClass('input hsv')
                 .append(_createModeInput('h', 'H', '°'))
                 .append(_createModeInput('s', 'S', '%'))
                 .append(_createModeInput('v', 'B', '%')))
                 .append($('<div></div>')
                 .addClass('input rgb')
                 .append(_createModeInput('r', 'R'))
                 .append(_createModeInput('g', 'G'))
                 .append(_createModeInput('b', 'B')))
                 .append($('<div></div>')
                 .addClass('input cmyk')
                 .append(_createModeInput('c', 'C', '%'))
                 .append(_createModeInput('m', 'M', '%'))
                 .append(_createModeInput('y', 'Y', '%'))
                 .append(_createModeInput(null, 'K', '%')));


                 methods.mode.call(self, options.mode);

                 var palette = $('<table></table>')
                 .addClass('palette')
                 .appendTo($this);

                 for (var y = 0; y < COLORS.length; ++y) {
                 var colorRow = COLORS[y];
                 var tableRow = $('<tr></tr>');
                 for (var x = 0; x < 20; ++x) {
                 var color = x < colorRow.length ? IFRGBColor.parseCSSColor(colorRow[x]) : IFRGBColor.WHITE;
                 $('<td></td>')
                 .css('background', color.asCSSString())
                 .css('border', '1px solid ' + color.asCSSString())
                 .data('color', color)
                 .on('click', function (evt) {
                 $this.trigger('colorchange', $(evt.target).data('color'));
                 })
                 .appendTo(tableRow);
                 }
                 tableRow.appendTo(palette);
                 }
                 */
            });
        },

        colorMode: function (colorMode) {
            var $this = $(this);
            var currentColorMode = $this.find('[data-color-mode].g-active').attr('data-color-mode');
            if (!arguments.length) {
                return currentColorMode;
            } else {
                if (colorMode !== currentColorMode) {
                    $this.find('[data-color-mode]').each(function (index, element) {
                        var $element = $(element);
                        $element.toggleClass('g-active', $element.attr('data-color-mode') === colorMode);
                    });

                    var colorModeInfo = COLOR_MODES[colorMode];

                    // Update components
                    for (var i = 0; i < 4; ++i) {
                        var componentPanel = $this.find('.color-component-' + i.toString());

                        if (i >= colorModeInfo.components.length) {
                            componentPanel.css('visibility', 'hidden');
                            componentPanel.removeAttr('data-component');
                        } else {
                            var component = colorModeInfo.components[i];

                            componentPanel.css('visibility', '');
                            componentPanel.attr('data-component', component.component);

                            var check = componentPanel.find('input[type="radio"]');
                            var range = componentPanel.find('input[type="range"]');
                            var label = componentPanel.find('.color-label');
                            var unit = componentPanel.find('.color-unit');

                            check.prop('checked', i === 0);

                            label.text(component.label);
                            unit.text(component.unit);
                            unit.css('display', component.unit != '' ? '' : 'none');

                            range.attr('min', component.min);
                            range.attr('max', component.max);
                            range.attr('step', component.step ? component.step.toString() : '')
                        }
                    }

                    methods._updateComponents.call(this);
                    methods.currentColor.call(this, methods._getColorFromComponents.call(this));
                }

                return this;
            }
        },

        previousColor: function (previousColor) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.previousColor;
            } else {
                if (!IFUtil.equals(data.previousColor, previousColor)) {
                    data.previousColor = previousColor;
                    $this.find('.color-preview > .previous-color')
                        .css('background', IFPattern.asCSSBackground(data.previousColor))
                        .gPatternTarget('value', data.previousColor);
                }

                return this;
            }
        },

        currentColor: function (currentColor) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.currentColor;
            } else {
                methods._setCurrentColor.call(this, currentColor);

                methods._updateMap.call(this);
                methods._updateComponents.call(this);
                methods._updateMapMarker.call(this);
                methods._updateWheel.call(this);

                return this;
            }
        },

        color: function (color) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.currentColor;
            } else {
                methods.previousColor.call(this, color);
                methods.currentColor.call(this, color);

                var colorMode = methods.colorMode.call(this);
                if (color instanceof IFCMYKColor) {
                    methods.colorMode.call(this, 'cmyk');
                } else if (color instanceof IFRGBColor && colorMode === 'cmyk') {
                    methods.colorMode.call(this, 'hsv');
                }

                return this;
            }
        },

        scene: function (value) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.scene;
            } else {
                var oldScene = data.scene;
                data.scene = value;

                /*
                 // Update swatches
                 var swatchView = $this.find('[data-view="' + ViewType.Swatches + '"]');
                 if (oldScene) {
                 swatchView.gSwatchPanel('detach');
                 }

                 if (data.scene) {
                 swatchView.gSwatchPanel('attach', data.scene.getSwatchCollection());
                 }

                 $this.find('[data-activate-view="' + ViewType.Swatches + '"]')
                 .css('display', data.scene ? '' : 'none');
                 */

                return this;
            }
        },

        _setCurrentColor: function (currentColor) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');
            data.currentColor = currentColor;
            $this.find('input[type="color"]').val(IFColor.rgbToHtmlHex(data.currentColor.toScreen()));
            $this.find('.color-preview > .current-color')
                .css('background', IFPattern.asCSSBackground(data.currentColor))
                .gPatternTarget('value', data.currentColor);
        },

        /**
         * @returns {{active: {component: String, value: Number}, components: Array<Number>}}
         * @private
         */
        _getComponents: function () {
            var $this = $(this);
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var activeComponent = $this.find('input[name="component-check"]:checked').closest('.color-component').attr('data-component');

            var result = {
                active: {
                    component: activeComponent,
                    value: null
                },
                components: []
            }

            for (var i = 0; i < colorModeInfo.components.length; ++i) {
                var component = colorModeInfo.components[i];
                var componentEl = $this.find('.color-component-' + i.toString());
                var textInput = componentEl.find('input[type="text"]');
                var rangeInput = componentEl.find('input[type="range"]');
                var value = parseInt(textInput.val());

                if (isNaN(value) || value < component.min) {
                    value = component.min;
                } else if (value > component.max) {
                    value = component.max;
                }

                var componentValue = colorModeInfo.componentToValue(component.component, value);
                result.components.push(componentValue);
                if (component.component === activeComponent) {
                    result.active.value = componentValue;
                }
            }

            return result;
        },

        _getColorFromComponents: function () {
            var $this = $(this);
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var components = methods._getComponents.call(this);
            return colorModeInfo.colorFromComponents(components.components);
        },

        _updateComponents: function (components) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');
            if (!data.currentColor) {
                return;
            }

            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];

            components = components || colorModeInfo.componentsFromColor(data.currentColor);

            if (components) {
                for (var i = 0; i < colorModeInfo.components.length; ++i) {
                    var component = colorModeInfo.components[i];
                    var componentEl = $this.find('.color-component-' + i.toString());
                    var checkInput = componentEl.find('input[type="radio"]');
                    var textInput = componentEl.find('input[type="text"]');
                    var rangeInput = componentEl.find('input[type="range"]');
                    var val = Math.min(component.max, Math.max(component.min, colorModeInfo.valueToComponent(component.component, components[i]))).toFixed(0);

                    var stopsFunc = colorModeInfo.components[i].stops;
                    var stops = stopsFunc ? stopsFunc(components) : null;

                    if (stops) {
                        if (stops.length === 1) {
                            rangeInput.css('background', stops[0]);
                        } else {
                            var cssStops = '';
                            for (var s = 0; s < stops.length; ++s) {
                                if (cssStops !== '') {
                                    cssStops += ',';
                                }
                                cssStops += stops[s];
                            }
                            rangeInput.css('background', 'linear-gradient(90deg, ' + cssStops + ')');
                        }
                    } else {
                        rangeInput.css('background', '');
                    }

                    checkInput.css('visibility', component.map ? '' : 'hidden');
                    textInput.val(val);
                    rangeInput.val(val);
                }
            }
        },

        _updateMap: function () {
            var $this = $(this);
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var components = methods._getComponents.call(this);
            var context = $this.find('canvas.map')[0].getContext('2d');

            var pixels = context.getImageData(0, 0, mapSize, mapSize);
            for (var x = 0; x < mapSize; ++x) {
                for (var y = 0; y < mapSize; ++y) {
                    var mapComponents = colorModeInfo.componentsFromMap(components.active.component, components.active.value, x / mapSize, y / mapSize, components.components);
                    var rgb = colorModeInfo.colorFromComponents(mapComponents).toScreen();
                    var idx = (y * mapSize + x) * 4;
                    pixels.data[idx] = rgb[0];
                    pixels.data[idx + 1] = rgb[1];
                    pixels.data[idx + 2] = rgb[2];
                    pixels.data[idx + 3] = 255;
                }
            }

            context.putImageData(pixels, 0, 0);
        },

        _updateMapMarker: function () {
            var $this = $(this);
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var components = methods._getComponents.call(this);

            var coordinates = colorModeInfo.mapFromComponents(components.active.component, components.components);
            $this
                .find('.map-container > .marker')
                .css({
                    'left': Math.round(coordinates[0] * 100) + '%',
                    'top': Math.round(coordinates[1] * 100) + '%'
                });
        },

        _updateWheel: function () {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!data.currentColor) {
                return;
            }

            var wheel = $this.find('canvas.color-wheel')[0];
            var ctx = wheel.getContext('2d');
            var highlight = $this.find('[data-wheel="highlight"]').val();


            ctx.clearRect(0, 0, wheelSize, wheelSize);

            var options = {
                cx: wheelSize / 2,
                cy: wheelSize / 2,
                radius: (wheelSize - 14) / 2,
                startColor: IFColor.rgbToHSV(data.currentColor.toScreen()),
                segments: 24,
                mixSteps: 10,
                mix: 30 // either degree or 'tint'|'shade'|'tone'
            };

            var segments = options.segments;
            var startColor = options.startColor;
            var cx = options.cx;
            var cy = options.cy;
            var radius = options.radius;
            var segmentAngleDeg = 360 / segments;
            var segmentAngleRad = segmentAngleDeg * Math.PI / 180;
            var hueStart = startColor[0];
            var hueHighlights = null;

            if (highlight) {
                hueHighlights = [hueStart];

                if ('triadic' === highlight) {
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart - 120));
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 120));
                } else if ('tetradic' === highlight) {
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 90));
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 180));
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 270));
                } else if ('split_complements' === highlight) {
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart - 150));
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 150));
                } else if ('analogous' === highlight) {
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart - 30));
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 30));
                } else if ('complement' === highlight) {
                    hueHighlights.push(IFMath.normalizeAngleDegrees(hueStart + 180));
                }
            }

            for (var i = segments - 1; i >= 0; --i) {

                var hue = IFMath.normalizeAngleDegrees(hueStart + i * segmentAngleDeg);
                var arcRadius = radius;
                var finalRadius = arcRadius;

                if (hueHighlights && hueHighlights.indexOf(hue) >= 0) {
                    finalRadius += 5;
                    arcRadius += 5;
                }

                var arcAngleStart = i * segmentAngleRad - segmentAngleRad / 2 - Math.PI / 2;

                var diffSegs = 5;
                var radDiff = arcRadius / diffSegs;
                var mixes = options.mix ? diffSegs : 1;
                for (var k = 0; k < mixes; ++k) {

                    var oppHue = IFMath.normalizeAngleDegrees(hueStart + 60 + i * segmentAngleDeg);
                    var sat = startColor[1] - (k / diffSegs);
                    var val = startColor[2];// - (k/diffSegs);
                    var hsv = [hue, sat, val];
                    var rgb = IFColor.hsvToRGB(hsv);

                    var oppRGB = IFColor.hsvToRGB([oppHue, startColor[1], startColor[2]]);
                    if (k > 0) {
                        //rgb = IFColor.blendRGBColors(rgb, oppRGB, (k / diffSegs));
                    }


                    var css = IFColor.rgbToHtmlHex(rgb);

                    arcRadius -= k > 0 ? radDiff : 0;

                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, arcRadius, arcAngleStart, arcAngleStart + segmentAngleRad);
                    ctx.lineTo(cx, cy);
                    ctx.fillStyle = css;
                    ctx.fill();

                    if (k === 0) {
                        arcRadius -= 5;
                    }
                }
            }

            for (var i = segments - 1; i >= 0; --i) {
                var hue = IFMath.normalizeAngleDegrees(hueStart + i * segmentAngleDeg);
                var arcAngleStart = i * segmentAngleRad - segmentAngleRad / 2 - Math.PI / 2;

                if (hueHighlights && hueHighlights.indexOf(hue) >= 0) {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, radius + 5, arcAngleStart, arcAngleStart + segmentAngleRad);
                    ctx.lineTo(cx, cy);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, radius, arcAngleStart, arcAngleStart + segmentAngleRad);
                    //ctx.lineTo(cx, cy);
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = 'black';
                    ctx.stroke();
                }
            }

            ctx.beginPath();
            ctx.arc(options.cx, options.cy, 8, 8, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.fill();
            ctx.stroke();

            /*
             ctx.beginPath();
             ctx.arc(options.cx, options.cy, options.radius, options.radius, 0, Math.PI * 2);
             ctx.closePath();

             ctx.lineWidth = 1;
             ctx.strokeStyle = 'black';
             ctx.stroke();
             */
        }
    };

    /**
     * Block to transform divs to color panels
     */
    $.fn.gColorPanel = function (method) {
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
