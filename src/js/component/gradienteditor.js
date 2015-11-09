(function ($) {
    // TODO : I18N
    var GRADIENT_TYPES = [
        {
            clazz: GLinearGradient,
            name: 'Linear Gradient',
            cssBackground: new GLinearGradient().asCSSBackground(),
            initSettings: function (settings, updateCall) {
                settings
                    .append($('<span></span>')
                        .addClass('fa fa-rotate-right')
                        .css('padding-right', '3px'))
                    .append($('<input>')
                        .attr({
                            'type': 'text',
                            'data-property': 'angle'
                        })
                        .css('width', '30px')
                        .on('change', function (evt) {
                            updateCall();
                        }))
                    .append($('<span>°</span>'));

                return true;
            },
            updateSettings: function (settings, gradient) {
                var angle = GMath.toDegrees(gradient.getAngle());
                settings.find('[data-property="angle"]').val(GUtil.formatNumber(angle, 2));
            },
            createGradient: function (stops, scale, settings) {
                var angle = 0;

                if (settings) {
                    angle = GUtil.parseNumber(settings.find('[data-property="angle"]').val());

                    if (isNaN(angle)) {
                        angle = 0;
                    } else {
                        angle = GMath.toRadians(GMath.normalizeAngleDegrees(angle));
                    }
                }

                return new GLinearGradient(stops, scale, angle);
            }
        },
        {
            clazz: GRadialGradient,
            name: 'Radial Gradient',
            cssBackground: new GRadialGradient().asCSSBackground(),
            initSettings: function (settings, updateCall) {
                return false;
            },
            updateSettings: function (settings, gradient) {
                // NO-OP
            },
            createGradient: function (stops, scale) {
                return new GRadialGradient(stops, scale);
            }
        }
    ];

    function getGradientTypeInfo(gradientClass) {
        for (var i = 0; i < GRADIENT_TYPES.length; ++i) {
            if (GRADIENT_TYPES[i].clazz === gradientClass) {
                return GRADIENT_TYPES[i];
            }
        }
        return null;
    };

    function updateStop($stop) {
        var stop = $stop.data('stop');
        $stop.css('left', Math.round(stop.position * 100) + '%');
        $stop.find('.stop-value').css('background', stop.color.toScreenCSS());
        $stop.gPatternTarget('value', stop.color);
    }

    function updateOpacity($stop) {
        var stop = $stop.data('stop');
        $stop.css('left', Math.round(stop.position * 100) + '%');
        var tone = Math.round(255 * (1 - stop.opacity));
        $stop.find('.stop-value').css('background', GColor.rgbToHtmlHex([tone, tone, tone]));
    }

    function updateGradient() {
        var $this = $(this);
        var data = $this.data('ggradienteditor');

        var gradientClass = $this.find('[data-section="type"] > .g-button.g-active').data('gradientClass');
        var stops = data.gradient.getStops();
        var scale = GUtil.parseNumber($this.find('[data-property="scale"]').val());
        var settings = $this.find('[data-section="settings"]');

        if (isNaN(scale) || scale <= 0) {
            scale = 1;
        } else {
            scale /= 100;
        }

        var gradientTypeInfo = getGradientTypeInfo(gradientClass);
        var gradient = gradientTypeInfo.createGradient(stops, scale, settings.css('display') !== 'none' ? settings : null);

        methods.value.call(this, gradient);
    }

    function updateGradientAndTrigger () {
        updateGradient.call(this);
        $(this).trigger('gradientchange');
    };

    function updateGradientPreview(temporary) {
        var $this = $(this);
        var data = $this.data('ggradienteditor');

        var gradient = data.gradient;

        if (temporary) {
            var $stops = $this.find('.stops > .stop');
            var $opacities = $this.find('.opacities > .stop');

            var stops = [];

            $stops.each(function (index, element) {
                var $stop = $(element);
                if ($stop.data('stop-delete') === false) {
                    stops.push($stop.data('stop'));
                }
            });

            $opacities.each(function (index, element) {
                var $stop = $(element);
                if ($stop.data('stop-delete') === false) {
                    stops.push($stop.data('stop'));
                }
            });

            stops.sort(function (a, b) {
                return a.position > b.position;
            });

            gradient = new GGradient(stops);
        }

        $this
            .find('.gradient')
            .css('background', 'linear-gradient(90deg, ' + gradient.toScreenCSS() + '), ' + GPattern.asCSSBackground(null));
    }

    function updateGradientPreviewAndTrigger () {
        updateGradientPreview.call(this);
        $(this).trigger('gradientchange');
    };

    function updatedStops() {
        var $this = $(this);
        var data = $this.data('ggradienteditor');

        data.gradient.getStops().sort(function (a, b) { return a.position > b.position; });

        methods.value.call(this, data.gradient);

        $(this).trigger('gradientchange');
    };

    function calculatePositionByMouse(target, x) {
        var width = target.width();
        var relativePos = x - target.offset().left;
        return relativePos < 0 ? 0 : relativePos > width ? 1 : (relativePos / width);
    }

    function stopPatternDrop(evt) {
        evt.stopPropagation();
    }

    function stopPatternChange(evt, color) {
        evt.stopPropagation();
        var $stop = $(evt.target).closest('.stop');
        if (color) {
            $stop.data('stop').color = color;
            updateStop($stop);
            updateGradientPreviewAndTrigger.call(this);
        }
    }

    function stopMouseDown(evt) {
        var self = this;
        var $this = $(this);
        var data = $this.data('ggradienteditor');
        var $stops = $this.find('.stops');

        var $stop = $(evt.target).closest('.stop');

        // Implement dragging stuff
        var stopsOffset = $stops.offset();
        var moveMinX = stopsOffset.left;
        var moveMaxX = moveMinX + $stops.width();
        var moveMinY = stopsOffset.top - 5;
        var moveMaxY = stopsOffset.top + $stops.outerHeight() + 5;
        var stopWidth = $stop.outerWidth();
        var startPosX = $stop.offset().left + stopWidth - evt.pageX;
        var startPosY = $stop.offset().top - evt.pageY;
        var stopsTotal = $stops.children('.stop').length;

        var $document = $(document);
        $stop.data('stop-moved', false);

        var docMouseMove = function (evt) {
            var left = evt.pageX + startPosX - (stopWidth / 2);
            var top = evt.pageY + startPosY;

            // Ensure to not move outside our range horizontally
            if (left <= moveMinX) {
                left = moveMinX;
            } else if (left >= moveMaxX) {
                left = moveMaxX;
            }

            if ((top < moveMinY || top > moveMaxY) && stopsTotal > 2) {
                // Moved outside area so get rid of our stop
                $stop
                    .css('display', 'none')
                    .data('stop-delete', true);
            } else {
                $stop
                    .css('display', '')
                    .data('stop-delete', false);
            }

            // Calculate percentage for stop
            var relativePos = left - moveMinX;
            var relativeMoveArea = (moveMaxX - moveMinX);
            var position = relativePos <= 0 ? 0 :
                relativePos >= relativeMoveArea ? 1 : (relativePos / relativeMoveArea);

            $stop.data('stop').position = position;
            updateStop($stop);
            updateGradientPreview.call(self, true);
            $stop.data('stop-moved', true);
        };

        var docMouseUp = function (evt) {
            // Clear the document listeners
            $document
                .off("mousemove", docMouseMove)
                .off("mouseup", docMouseUp);

            // Delete the stop if marked
            if ($stop.data('stop-delete') === true) {
                var stops = data.gradient.getStops();
                stops.splice(stops.indexOf($stop.data('stop')), 1);
                updatedStops.call(self);
            } else if ($stop.data('stop-moved')) {
                $this.trigger('gradientchange');
            }
        };

        $document
            .on("mousemove", docMouseMove)
            .on("mouseup", docMouseUp);
    }

    function opacityClick(evt) {
        var self = this;
        var $this = $(this);
        var $stop = $(evt.target).closest('.stop');

        if (!$stop.data('stop-moved')) {
            $('<div></div>')
                .addClass('opacity-editor')
                .css({
                    'display': 'inline-block',
                    'padding': '5px'
                })
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Opacity: ')
                    .append($('<input>')
                        .attr('type', 'text')
                        .css('width', '40px')
                        .val(Math.round($stop.data('stop').opacity * 100))
                        .on('change', function () {
                            var $target = $(this);
                            var val = parseInt($target.val());
                            if (!isNaN(val) && val >= 0 && val <= 100) {
                                $target
                                    .parents('.opacity-editor')
                                    .find('input[type="range"]')
                                    .val($target.val());

                                $stop.data('stop').opacity = val / 100.0;
                                updateOpacity($stop);
                                updateGradientPreviewAndTrigger.call(self);
                            }
                        }))
                    .append($('<span>%</span>')))
                .append($('<input>')
                    .css({
                        'display': 'block',
                        'margin-top': '5px'
                    })
                    .attr({
                        'type': 'range',
                        'min': '0',
                        'max': '100'
                    })
                    .val(Math.round($stop.data('stop').opacity * 100))
                    .on('input', function () {
                        var $target = $(this);
                        $target.parents('.opacity-editor')
                            .find('input:not([type="range"])')
                            .val($target.val())
                            .trigger('change');
                    }))
                .gOverlay({
                    modal: true,
                    releaseOnClose: true
                })
                .gOverlay('open', $stop);
        }
    }

    function opacityMouseDown(evt) {
        var self = this;
        var $this = $(this);
        var data = $this.data('ggradienteditor');
        var $stops = $this.find('.opacities');

        var $stop = $(evt.target).closest('.stop');

        // Implement dragging stuff
        var stopsOffset = $stops.offset();
        var moveMinX = stopsOffset.left;
        var moveMaxX = moveMinX + $stops.width();
        var moveMinY = stopsOffset.top - 5;
        var moveMaxY = stopsOffset.top + $stops.outerHeight() + 5;
        var stopWidth = $stop.outerWidth();
        var startPosX = $stop.offset().left + stopWidth - evt.pageX;
        var startPosY = $stop.offset().top - evt.pageY;
        var stopsTotal = $stops.children('.stop').length;

        var $document = $(document);
        $stop.data('stop-moved', false);

        var docMouseMove = function (evt) {
            var left = evt.pageX + startPosX - (stopWidth / 2);
            var top = evt.pageY + startPosY;

            // Ensure to not move outside our range horizontally
            if (left <= moveMinX) {
                left = moveMinX;
            } else if (left >= moveMaxX) {
                left = moveMaxX;
            }

            if ((top < moveMinY || top > moveMaxY) && stopsTotal > 2) {
                // Moved outside area so get rid of our stop
                $stop
                    .css('display', 'none')
                    .data('stop-delete', true);
            } else {
                $stop
                    .css('display', '')
                    .data('stop-delete', false);
            }

            // Calculate percentage for stop
            var relativePos = left - moveMinX;
            var relativeMoveArea = (moveMaxX - moveMinX);
            var position = relativePos <= 0 ? 0 :
                relativePos >= relativeMoveArea ? 1 : (relativePos / relativeMoveArea);

            $stop.data('stop').position = position;
            $stop.data('stop-moved', true);
            updateOpacity($stop);
            updateGradientPreview.call(self, true);
        };

        var docMouseUp = function (evt) {
            // Clear the document listeners
            $document
                .off("mousemove", docMouseMove)
                .off("mouseup", docMouseUp);

            // Delete the stop if marked
            if ($stop.data('stop-delete') === true) {
                var stops = data.gradient.getStops();
                stops.splice(stops.indexOf($stop.data('stop')), 1);
                updatedStops.call(self);
            } else if ($stop.data('stop-moved')) {
                $this.trigger('gradientchange');
            }
        };

        $document
            .on("mousemove", docMouseMove)
            .on("mouseup", docMouseUp);
    }

    var methods = {
        init: function (options) {
            options = $.extend({}, options);

            return this.each(function () {
                var self = this;

                var $this = $(this)
                    .addClass('g-gradient-editor')
                    .data('ggradienteditor', {
                        options: options,
                        gradient: null
                    });

                var container = $('<div></div>')
                    .addClass('container')
                    .appendTo($this);

                var typeSection = $('<div></div>')
                    .attr('data-section', 'type');

                for (var i = 0; i < GRADIENT_TYPES.length; ++i) {
                    var gradTypeInfo = GRADIENT_TYPES[i];

                    $('<span></span>')
                        .data('gradientClass', gradTypeInfo.clazz)
                        .addClass('g-button')
                        .attr('title', gradTypeInfo.name)
                        .append($('<span></span>')
                            .css({
                                'background': gradTypeInfo.cssBackground
                            }))
                        .on('click', function (evt) {
                            var gradientClass = $(evt.target).closest('.g-button').data('gradientClass');

                            $this.find('[data-section="type"] > .g-button').each(function (index, button) {
                                var $button = $(button);
                                $button.toggleClass('g-active', $button.data('gradientClass') === gradientClass);
                            });

                            updateGradientAndTrigger.call(self);
                        })
                        .appendTo(typeSection);
                }

                container
                    .append($('<div></div>')
                        .addClass('editor')
                        .gPatternTarget()
                        .gPatternTarget('types', [GColor, GGradient])
                        .on('patternchange', function (evt) {
                            evt.stopPropagation();
                        })
                        .on('patterndrop', function (evt, pattern, mouseEvent) {
                            evt.stopPropagation();
                            if (pattern && pattern instanceof GColor) {
                                var $stops = $this.find('.stops');
                                var stops = $this.gGradientEditor('value').getStops();
                                stops.push({
                                    position: calculatePositionByMouse($stops, mouseEvent.pageX),
                                    color: pattern
                                });
                                updatedStops.call(self);
                            } else if (pattern instanceof GGradient) {
                                methods.value.call(self, pattern.clone());
                                $this.trigger('gradientchange');
                            }
                        })
                        .append(($('<div></div>')
                            .addClass('opacities')
                            .on('mousedown', function (evt) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            })
                            .on('dblclick', function (evt) {
                                var $opacities = $(evt.target);
                                if ($opacities.hasClass('opacities')) {
                                    var position = calculatePositionByMouse($opacities, evt.pageX);
                                    var stops = $this.gGradientEditor('value').getStops();
                                    stops.push({
                                        position: position,
                                        opacity: GGradient.interpolateOpacity(stops, position)
                                    });
                                    updatedStops.call(self);
                                }
                            })))
                        .append($('<div></div>')
                            .addClass('gradient g-input')
                            .css('background', 'transparent'))
                        .append($('<div></div>')
                            .addClass('stops')
                            .on('mousedown', function (evt) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            })
                            .on('dblclick', function (evt) {
                                var $stops = $(evt.target);
                                if ($stops.hasClass('stops')) {
                                    var position = calculatePositionByMouse($stops, evt.pageX);
                                    var stops = $this.gGradientEditor('value').getStops();
                                    stops.push({
                                        position: position,
                                        color: GGradient.interpolateColor(stops, position)
                                    });
                                    updatedStops.call(self);
                                }
                            })))
                    .append($('<div></div>')
                        .addClass('toolbar')
                        .append(typeSection)
                        .append($('<div></div>')
                            .append($('<span></span>')
                                .addClass('fa fa-arrows-h')
                                .css('padding-right', '3px'))
                            .append($('<input>')
                                .attr({
                                    'type': 'text',
                                    'data-property': 'scale'
                                })
                                .css('width', '30px')
                                .on('change', function () {
                                    updateGradientAndTrigger.call(self);
                                }))
                            .append($('<span>%</span>')))
                        .append($('<div></div>')
                            .attr('data-section', 'settings'))
                        .append($('<div></div>')
                            .append($('<button></button>')
                                .append($('<span></span>')
                                    .addClass('fa fa-exchange'))
                                .on('click', function () {
                                    var stops = $this.gGradientEditor('value').getStops();

                                    for (var i = 0; i < stops.length; ++i) {
                                        stops[i].position = 1 - stops[i].position;
                                    }

                                    updatedStops.call(self);
                                }))));
            });
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                return data.gradient;
            } else {
                var oldGradientClass = data.gradient ? data.gradient.constructor : null;

                data.gradient = value;

                var gradientTypeInfo = getGradientTypeInfo(value.constructor);

                $this.find('.editor').gPatternTarget('value', value);

                $this.find('.stops').empty();
                $this.find('.opacities').empty();

                $this.find('[data-section="type"] > .g-button').each(function (index, button) {
                    var $button = $(button);
                    $button.toggleClass('g-active', $button.data('gradientClass') === value.constructor);
                });

                var settings = $this.find('[data-section="settings"]');

                if (oldGradientClass !== data.gradient.constructor) {
                    settings
                        .css('display', 'none')
                        .empty();

                    if (gradientTypeInfo.initSettings(settings, updateGradientAndTrigger.bind(this))) {
                        settings.css('display', '');
                    }
                }

                var scale = Math.round(data.gradient.getScale() * 100.0);
                $this.find('[data-property="scale"]').val(scale);

                gradientTypeInfo.updateSettings(settings, data.gradient);

                if (value) {
                    var stops = value.getStops();
                    for (var i = 0; i < stops.length; ++i) {
                        if (stops[i].hasOwnProperty('color')) {
                            methods.insertStop.call(this, stops[i]);
                        } else if (stops[i].hasOwnProperty('opacity')) {
                            methods.insertOpacity.call(this, stops[i]);
                        }
                    }
                }

                updateGradientPreview.call(this);

                return this;
            }
        },

        insertOpacity: function (stop) {
            var $this = $(this);
            var $stops = $this.find('.opacities');

            // Insert stop widget
            var $stop = $('<div></div>')
                .addClass('stop')
                .data('stop', stop)
                .data('stop-delete', false)
                .append($('<div></div>')
                    .addClass('stop-value'))
                .on('click', opacityClick.bind(this))
                .on('mousedown', opacityMouseDown.bind(this))
                .appendTo($stops);

            updateOpacity($stop);
        },

        insertStop: function (stop) {
            var $this = $(this);
            var $stops = $this.find('.stops');

            // Insert stop widget
            var $stop = $('<div></div>')
                .addClass('stop')
                .data('stop', stop)
                .data('stop-delete', false)
                .gPatternTarget({
                    allowDrag: false
                })
                .gPatternTarget('types', [GColor])
                .append($('<div></div>')
                    .addClass('stop-value'))
                .on('patternchange', stopPatternChange.bind(this))
                .on('patterndrop', stopPatternDrop)
                .on('mousedown', stopMouseDown.bind(this))
                .appendTo($stops);

            updateStop($stop);
        }
    };

    /**
     * Initiates a gradient editor on a given div
     */
    $.fn.gGradientEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }
})(jQuery);