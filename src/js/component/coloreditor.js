(function ($) {
    var wheelSize = 250;
    var wheelSegments = 24;
    var wheelMixSegments = 5;
    var mapWidth = 220;
    var mapHeight = 150;

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
                            GColor.rgbToHtmlHex([0, components[1], components[2]]),
                            GColor.rgbToHtmlHex([255, components[1], components[2]])
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
                            GColor.rgbToHtmlHex([components[0], 0, components[2]]),
                            GColor.rgbToHtmlHex([components[0], 255, components[2]])
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
                            GColor.rgbToHtmlHex([components[0], components[1], 0]),
                            GColor.rgbToHtmlHex([components[0], components[1], 255])
                        ];
                    }
                },
                {
                    label: '#',
                    component: '#',
                    text: true,
                    unit: ' ',
                    map: false,
                    componentsToValue: function (components) {
                        return GColor.rgbToHtmlHex(components).substr(1);
                    },
                    valueToColor: function (value) {
                        if (value.length > 3) {
                            return GRGBColor.fromCSSColor(value);
                        }
                        return null;
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
                return new GRGBColor(components);
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
                            result.push(GColor.rgbToHtmlHex(GColor.hsvToRGB(hsv)));
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
                            GColor.rgbToHtmlHex(GColor.hsvToRGB([components[0], 0, components[2]])),
                            GColor.rgbToHtmlHex(GColor.hsvToRGB([components[0], 1, components[2]]))
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
                            GColor.rgbToHtmlHex(GColor.hsvToRGB([components[0], components[1], 0])),
                            GColor.rgbToHtmlHex(GColor.hsvToRGB([components[0], components[1], 1]))
                        ];
                    }
                },
                {
                    label: '#',
                    component: '#',
                    text: true,
                    unit: ' ',
                    map: false,
                    componentsToValue: function (components) {
                        return GColor.rgbToHtmlHex(GColor.hsvToRGB(components)).substr(1);
                    },
                    valueToColor: function (value) {
                        if (value.length > 3) {
                            return GRGBColor.fromCSSColor(value);
                        }
                        return null;
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
                return GColor.rgbToHSV(color.toScreen());
            },
            colorFromComponents: function (components) {
                return new GRGBColor(GColor.hsvToRGB(components));
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
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([0, components[1], components[2], components[3]])),
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([1, components[1], components[2], components[3]]))
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
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], 0, components[2], components[3]])),
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], 1, components[2], components[3]]))
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
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], components[1], 0, components[3]])),
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], components[1], 1, components[3]]))
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
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], components[1], components[2], 0])),
                            GColor.rgbToHtmlHex(GColor.cmykToRGB([components[0], components[1], components[2], 1]))
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
                return color instanceof GCMYKColor ? color.getValue() : GColor.rgbToCMYK(color.toScreen(true/*no-cms*/));
            },
            colorFromComponents: function (components) {
                return new GCMYKColor(components);
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
        var map = $this.find('canvas.map');
        var offset = $(map).offset();
        var x = Math.max(0, Math.min(map[0].width, Math.round(evt.pageX - offset.left - 4)));
        var y = Math.max(0, Math.min(map[0].height, Math.round(evt.pageY - offset.top - 4)));


        var $this = $(this);
        var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
        var components = methods._getComponents.call(this);
        var mappedComponents = colorModeInfo.componentsFromMap(components.active.component, components.active.value, x / mapWidth, y / mapHeight, components.components);
        var mappedColor = colorModeInfo.colorFromComponents(mappedComponents);

        methods._setCurrentColor.call(this, mappedColor);
        methods._updateComponents.call(this, mappedComponents);
        methods._updateMapMarker.call(this);
        methods._updateWheelColor.call(this);

        $this.trigger('colorchange', mappedColor);
    };

    /**
     * @param {Function (segmentIndex, highlightSegment, hsvColor, angleStart, angleEnd, mixes} iterator
     */
    function iterateWheel(iterator) {
        var $this = $(this);
        var data = $this.data('gcoloreditor');

        if (!data.currentColor) {
            return;
        }

        var highlight = $this.find('[data-wheel="highlight"]').val();
        var mixes = $this.find('[data-wheel="mix"]').val();
        var segmentAngleDeg = 360 / wheelSegments;
        var segmentAngleRad = segmentAngleDeg * Math.PI / 180;

        var startColor = GColor.rgbToHSV(data.currentColor.toScreen());
        var hueStart = startColor[0];
        var hueHighlights = null;

        if (highlight) {
            hueHighlights = [hueStart];

            if ('triadic' === highlight) {
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart - 120));
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 120));
            } else if ('tetradic' === highlight) {
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 90));
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 180));
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 270));
            } else if ('split_complements' === highlight) {
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart - 150));
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 150));
            } else if ('analogous' === highlight) {
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart - 30));
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 30));
            } else if ('complement' === highlight) {
                hueHighlights.push(GMath.normalizeAngleDegrees(hueStart + 180));
            }
        }

        for (var i = wheelSegments - 1; i >= 0; --i) {
            var segmentHue = GMath.normalizeAngleDegrees(startColor[0] + i * segmentAngleDeg);
            var segmentHSV = [segmentHue, startColor[1], startColor[2]];
            var highlightSegment = hueHighlights && hueHighlights.indexOf(segmentHue) >= 0;

            var angleStart = i * segmentAngleRad - segmentAngleRad / 2 - Math.PI / 2;
            iterator(i, highlightSegment, segmentHSV, angleStart, angleStart + segmentAngleRad, mixes);
        }
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
                                    var $target = $(evt.target);
                                    var componentEl = $target.parents('.color-component');
                                    var colorModeInfo = COLOR_MODES[methods.colorMode.call(self)];

                                    if (colorModeInfo.components[index].text) {
                                        var color = colorModeInfo.components[index].valueToColor($target.val());
                                        if (color) {
                                            methods.currentColor.call(self, color);
                                            $this.trigger('colorchange', color);
                                        }
                                    } else {
                                        var components = methods._getComponents.call(self);
                                        var color = colorModeInfo.colorFromComponents(components.components);

                                        methods._setCurrentColor.call(self, color);
                                        methods._updateComponents.call(self, components.components);
                                        methods._updateMapMarker.call(self);
                                        methods._updateWheelColor.call(self);

                                        $this.trigger('colorchange', color);

                                        if (!colorModeInfo.components[index].map || componentEl.find('input[type="radio"]').is(':checked')) {
                                            methods._updateMap.call(self);
                                        }
                                    }
                                })))
                        .append($('<div></div>')
                            .addClass('color-unit'));
                };

                var $this = $(this)
                    .addClass('g-color-editor')
                    .data('gcoloreditor', {
                        scene: null,
                        previousColor: null,
                        currentColor: null,
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
                            var color = GRGBColor.fromCSSColor($(evt.target).val());
                            methods.currentColor.call(self, color);
                            $this.trigger('colorchange', color);
                        }.bind(this)))
                    .append($('<div></div>')
                        .addClass('color-container')
                        .append($('<div></div>')
                            .addClass('color')
                            .append($('<div></div>')
                                .addClass('map-container')
                                .append($('<canvas></canvas>')
                                    .addClass('map')
                                    .attr({
                                        width: mapWidth.toString() + 'px',
                                        height: mapHeight.toString() + 'px',
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
                                .addClass('toolbar')
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
                                    }))
                                .append($('<div></div>')
                                    .addClass('color-preview')
                                    .append($('<div></div>')
                                        .addClass('previous-color')
                                        .gPatternTarget()
                                        .gPatternTarget('types', [GColor])
                                        .on('patternchange', function (evt, color) {
                                            if (color) {
                                                methods.previousColor.call(self, color);
                                            }
                                        }))
                                    .append($('<div></div>')
                                        .addClass('current-color')
                                        .gPatternTarget()
                                        .gPatternTarget('types', [GColor])
                                        .on('patternchange', function (evt, color) {
                                            if (color) {
                                                methods.value.call(self, color);
                                            }
                                        })
                                        .on('click', function () {
                                            $this.find('input[type="color"]').trigger('click');
                                        }))))
                            .append($('<div></div>')
                                .addClass('color-components')
                                .append(_createColorComponent(0))
                                .append(_createColorComponent(1))
                                .append(_createColorComponent(2))
                                .append(_createColorComponent(3))))
                        .append($('<div></div>')
                            .addClass('wheel')
                            .append($('<div></div>')
                                .addClass('toolbar')
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
                                        methods._updateWheelColor.call(self);
                                    })
                                    .val('tint'))
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
                                        methods._updateWheelColor.call(self);
                                        methods._updateWheelBorder.call(self);
                                    })))
                            .append($('<div></div>')
                                .addClass('wheel-container')
                                .append($('<canvas></canvas>')
                                    .addClass('color-wheel')
                                    .attr({
                                        width: wheelSize.toString() + 'px',
                                        height: wheelSize.toString() + 'px',
                                    }))
                                .append($('<canvas></canvas>')
                                    .addClass('wheel-border')
                                    .attr({
                                        width: wheelSize.toString() + 'px',
                                        height: wheelSize.toString() + 'px',
                                    })
                                    .on('mousedown', function (evt) {
                                        var data = $this.data('gcoloreditor');
                                        if (!data.wheelMap) {
                                            return;
                                        }

                                        var wheel = $this.find('canvas.color-wheel');
                                        var offset = $(wheel).offset();
                                        var x = Math.max(0, Math.min(wheel[0].width, Math.round(evt.pageX - offset.left)));
                                        var y = Math.max(0, Math.min(wheel[0].height, Math.round(evt.pageY - offset.top)));

                                        var idx = (y * wheel[0].width + x) * 4;
                                        var pixels = data.wheelMap.data;
                                        if (pixels[idx + 3] === 0) {
                                            return;
                                        }

                                        var color = new GRGBColor([pixels[idx], pixels[idx + 1], pixels[idx + 2]]);
                                        var newColor = methods._convertColor.call(self, color);

                                        //methods.currentColor.call(self, newColor);
                                        //$this.trigger('colorchange', newColor);
                                        $this.find('.wheel-border').gPatternTarget('value', newColor);
                                    })
                                    .gPatternTarget({
                                        allowDrop: false
                                    })
                                    .gPatternTarget('types', [GColor])))));

                // Set some initial values
                methods.colorMode.call(self, 'hsv');
                methods._updateWheelBorder.call(self);
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
                    var newColor = methods._getColorFromComponents.call(this);
                    methods.currentColor.call(this, newColor);
                    $this.trigger('colorchange', newColor);
                }

                return this;
            }
        },

        previousColor: function (previousColor) {
            var $this = $(this);
            var data = $this.data('gcoloreditor');

            if (!arguments.length) {
                return data.previousColor;
            } else {
                if (!GUtil.equals(data.previousColor, previousColor)) {
                    data.previousColor = previousColor;
                    $this.find('.color-preview > .previous-color')
                        .css('background', GPattern.asCSSBackground(data.previousColor))
                        .gPatternTarget('value', data.previousColor);
                }

                return this;
            }
        },

        currentColor: function (currentColor) {
            var $this = $(this);
            var data = $this.data('gcoloreditor');

            if (!arguments.length) {
                return data.currentColor;
            } else {
                methods._setCurrentColor.call(this, currentColor);

                methods._updateComponents.call(this);
                methods._updateMap.call(this);
                methods._updateMapMarker.call(this);
                methods._updateWheelColor.call(this);

                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('gcoloreditor');

            if (!arguments.length) {
                return data.currentColor;
            } else {
                methods.previousColor.call(this, value);
                methods.currentColor.call(this, value);

                var colorMode = methods.colorMode.call(this);
                if (value instanceof GCMYKColor) {
                    methods.colorMode.call(this, 'cmyk');
                } else if (value instanceof GRGBColor && colorMode === 'cmyk') {
                    methods.colorMode.call(this, 'hsv');
                }

                return this;
            }
        },

        _setCurrentColor: function (currentColor) {
            var $this = $(this);
            var data = $this.data('gcoloreditor');
            data.currentColor = currentColor;
            $this.find('input[type="color"]').val(GColor.rgbToHtmlHex(data.currentColor.toScreen()));
            $this.find('.color-preview > .current-color')
                .css('background', GPattern.asCSSBackground(data.currentColor))
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

        _convertColor: function (color) {
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var components = colorModeInfo.componentsFromColor(color);
            return colorModeInfo.colorFromComponents(components);
        },

        _updateComponents: function (components) {
            var $this = $(this);
            var data = $this.data('gcoloreditor');
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

                    checkInput
                        .css('visibility', component.map ? '' : 'hidden');

                    textInput
                        .css('text-align', component.text ? 'left' : '')
                        /* !! */
                        .parent()
                        .css('width', component.text ? '100%' : '');

                    rangeInput
                        /* !! */
                        .parent()
                        .css('display', component.text ? 'none' : '');

                    if (component.text) {
                        textInput.val(component.componentsToValue(components));
                    } else {
                        var val = Math.min(component.max, Math.max(component.min, colorModeInfo.valueToComponent(component.component, components[i]))).toFixed(0);
                        textInput.val(val);
                        rangeInput.val(val);
                    }
                }
            }
        },

        _updateMap: function () {
            var $this = $(this);
            var colorModeInfo = COLOR_MODES[methods.colorMode.call(this)];
            var components = methods._getComponents.call(this);
            var context = $this.find('canvas.map')[0].getContext('2d');

            var pixels = context.getImageData(0, 0, mapWidth, mapHeight);
            for (var x = 0; x < mapWidth; ++x) {
                for (var y = 0; y < mapHeight; ++y) {
                    var mapComponents = colorModeInfo.componentsFromMap(components.active.component, components.active.value, x / mapWidth, y / mapHeight, components.components);
                    var rgb = colorModeInfo.colorFromComponents(mapComponents).toScreen();
                    var idx = (y * mapWidth + x) * 4;
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

        _updateWheelColor: function () {
            var $this = $(this);
            var data = $this.data('gcoloreditor');
            var wheel = $this.find('canvas.color-wheel')[0];
            var ctx = wheel.getContext('2d');
            var cp = wheelSize / 2;
            var radius = (wheelSize - 14) / 2;

            ctx.clearRect(0, 0, wheel.width, wheel.height);

            iterateWheel.call(this, function (segmentIndex, highlightSegment, hsvColor, angleStart, angleEnd, mixes) {
                ctx.beginPath();
                ctx.moveTo(cp, cp);
                ctx.arc(cp, cp, radius + (highlightSegment ? 5 : 0), angleStart, angleEnd);
                ctx.lineTo(cp, cp);
                ctx.fillStyle = GColor.rgbToHtmlHex(GColor.hsvToRGB(hsvColor));
                ctx.fill();

                if (mixes) {
                    ctx.globalAlpha = 10 / wheelMixSegments * 0.1;
                    var radiusPart = radius / wheelMixSegments;

                    switch (mixes) {
                        case 'tint':
                            ctx.fillStyle = 'white';
                            break;
                        case 'shade':
                            ctx.fillStyle = 'black';
                            break;
                        case 'tone':
                            ctx.fillStyle = 'rgb(128,128,128)';
                            break;
                        default:
                            var blendAngle = parseInt(mixes);
                            if (!isNaN(blendAngle)) {
                                var blendHue = GMath.normalizeAngleDegrees(hsvColor[0] + blendAngle);
                                ctx.fillStyle = GColor.rgbToHtmlHex(GColor.hsvToRGB([blendHue, hsvColor[1], hsvColor[2]]));
                            }
                            break;
                    }

                    for (var i = 1; i <= wheelMixSegments; ++i) {
                        ctx.beginPath();
                        ctx.moveTo(cp, cp);
                        ctx.arc(cp, cp, radius - (i * radiusPart), angleStart, angleEnd);
                        ctx.lineTo(cp, cp);
                        ctx.fill();
                    }

                    ctx.globalAlpha = 1.0;
                }
            });

            data.wheelMap = ctx.getImageData(0, 0, wheel.width, wheel.height);
        },

        _updateWheelBorder: function () {
            var $this = $(this);
            var wheel = $this.find('canvas.wheel-border')[0];
            var ctx = wheel.getContext('2d');
            var cp = wheelSize / 2;
            var radius = (wheelSize - 14) / 2;

            ctx.clearRect(0, 0, wheel.width, wheel.height);

            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5;

            iterateWheel.call(this, function (segmentIndex, highlightSegment, hsvColor, angleStart, angleEnd, mixes) {
                ctx.beginPath();
                ctx.moveTo(cp, cp);
                ctx.arc(cp, cp, radius + (highlightSegment ? 5 : 0), angleStart, angleEnd);

                if (highlightSegment) {
                    ctx.lineTo(cp, cp);
                    ctx.shadowBlur = 3;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
                    ctx.lineWidth = 1;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 0.5;
                }

                ctx.stroke();
            });

            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(cp, cp, 8, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.stroke();
        }
    };

    /**
     * Block to transform divs into a color editor
     */
    $.fn.gColorEditor = function (method) {
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
