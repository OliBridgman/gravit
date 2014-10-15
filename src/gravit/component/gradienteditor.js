(function ($) {

    function updateStop($this, $stop) {
        $stop.css('left', Math.round($stop.data('stop-position') * 100) + '%');
        $stop.find('.stop-value').css('background', $stop.data('stop-value').toScreenCSS());
        $stop.gPatternTarget('value', $stop.data('stop-value'));
    }

    function updateOpacity($this, $stop) {
        $stop.css('left', Math.round($stop.data('stop-position') * 100) + '%');
        var tone = Math.round(255 * (1 - $stop.data('stop-value')));
        $stop.find('.stop-value').css('background', IFColor.rgbToHtmlHex([tone, tone, tone]));
    }

    function updateGradient($this) {
        var gradient = new IFLinearGradient($this.gGradientEditor('value'));
        $this
            .find('.gradient')
            .css('background', IFPattern.asCSSBackground(gradient));
        $this.gPatternTarget('value', gradient);
    }

    function calculatePositionByMouse(target, x) {
        var width = target.width();
        var relativePos = x - target.offset().left;
        return relativePos < 0 ? 0 : relativePos > width ? 1 : (relativePos / width);
    }

    var methods = {
        init: function (options) {
            options = $.extend({}, options);

            return this.each(function () {
                var self = this;

                var data = {
                    options: options
                };

                var $this = $(this)
                    .addClass('g-gradient-editor')
                    .data('ggradienteditor', data)
                    .gPatternTarget({
                        //allowDrag: false
                    })
                    .gPatternTarget('types', [IFColor, IFGradient])
                    .on('patternchange', function (evt) {
                        evt.stopPropagation();
                    })
                    .on('patterndrop', function (evt, pattern, mouseEvent) {
                        evt.stopPropagation();
                        if (pattern && pattern instanceof IFColor) {
                            var $stops = $(this).find('.stops');
                            var position = calculatePositionByMouse($stops, mouseEvent.pageX);
                            methods.insertStop.call(self, position, pattern);
                            updateGradient($this);
                            $this.trigger('gradientchange');
                        } else if (pattern instanceof IFGradient) {
                            methods.value.call(self, pattern.getStops());
                            $this.trigger('gradientchange');
                        }
                    });

                var container = $('<div></div>')
                    .addClass('container')
                    .appendTo($this);

                container
                    .append($('<div></div>')
                        .addClass('editor')
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
                                    var opacity = IFGradient.interpolateOpacity(methods.value.call(self), position);
                                    methods.insertOpacity.call(self, position, opacity);
                                    updateGradient($this);
                                    $this.trigger('gradientchange');
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
                                    var color = IFGradient.interpolateColor(methods.value.call(self), position);
                                    methods.insertStop.call(self, position, color);
                                    updateGradient($this);
                                    $this.trigger('gradientchange');
                                }
                            })));
            });
        },

        value: function (value) {
            var self = this;
            var $this = $(this);

            if (!arguments.length) {
                var $stops = $this.find('.stops > .stop');
                var $opacities = $this.find('.opacities > .stop');

                var stops = [];

                $stops.each(function (index, element) {
                    var $stop = $(element);
                    if ($stop.data('stop-delete') === false) {
                        stops.push({
                            position: IFMath.round($stop.data('stop-position'), false, 2),
                            color: $stop.data('stop-value')
                        });
                    }
                });

                $opacities.each(function (index, element) {
                    var $stop = $(element);
                    if ($stop.data('stop-delete') === false) {
                        stops.push({
                            position: IFMath.round($stop.data('stop-position'), false, 2),
                            opacity: $stop.data('stop-value')
                        });
                    }
                });

                stops.sort(function (a, b) {
                    return a.position > b.position;
                });

                return stops;
            } else {
                $this.find('.stops').empty();
                $this.find('.opacities').empty();

                if (value) {
                    for (var i = 0; i < value.length; ++i) {
                        if (value[i].hasOwnProperty('color')) {
                            methods.insertStop.call(self, value[i].position, value[i].color);
                        } else if (value[i].hasOwnProperty('opacity')) {
                            methods.insertOpacity.call(self, value[i].position, value[i].opacity);
                        }
                    }
                }

                updateGradient($this);

                return this;
            }
        },

        insertOpacity: function (position, opacity) {
            var $this = $(this);
            var $stops = $this.find('.opacities');

            // Normalize position
            position = position < 0 ? 0 : position > 1 ? 1 : position;

            var hasChanged = false;

            // Insert stop widget
            var $stop = $('<div></div>')
                .addClass('stop')
                .data('stop-position', position)
                .data('stop-value', opacity)
                .data('stop-delete', false)
                .append($('<div></div>')
                    .addClass('stop-value'))
                .on('click', function (evt) {
                    if (!hasChanged) {
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
                                    .val(Math.round($stop.data('stop-value') * 100))
                                    .on('change', function () {
                                        var $target = $(this);
                                        var val = parseInt($target.val());
                                        if (!isNaN(val) && val >= 0 && val <= 100) {
                                            $target.parents('.opacity-editor')
                                                .find('input[type="range"]')
                                                .val($target.val());

                                            $stop.data('stop-value', val / 100.0);
                                            updateOpacity($this, $stop);
                                            updateGradient($this);
                                            $this.trigger('gradientchange');
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
                                .val(Math.round($stop.data('stop-value') * 100))
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
                })
                .on('mousedown', function (evt) {
                    hasChanged = false;

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
                        var percentPos = relativePos <= 0 ? 0 :
                            relativePos >= relativeMoveArea ? 1 : (relativePos / relativeMoveArea);

                        $stop.data('stop-position', percentPos);
                        updateOpacity($this, $stop);
                        updateGradient($this);
                        hasChanged = true;
                    };

                    var docMouseUp = function (evt) {
                        // Clear the document listeners
                        $document
                            .off("mousemove", docMouseMove)
                            .off("mouseup", docMouseUp);

                        // Delete the stop if marked
                        if ($stop.data('stop-delete') === true) {
                            $stop.remove();
                            hasChanged = true;
                        }

                        if (hasChanged) {
                            $this.trigger('gradientchange');
                        }
                    };

                    $document
                        .on("mousemove", docMouseMove)
                        .on("mouseup", docMouseUp);
                })
                .appendTo($stops);

            updateOpacity($this, $stop);

            return position;
        },

        insertStop: function (position, color) {
            var $this = $(this);
            var $stops = $this.find('.stops');

            // Normalize position
            position = position < 0 ? 0 : position > 1 ? 1 : position;

            var hasChanged = false;

            // Insert stop widget
            var $stop = $('<div></div>')
                .addClass('stop')
                .data('stop-position', position)
                .data('stop-value', color)
                .data('stop-delete', false)
                .gPatternTarget({
                    allowDrag: false
                })
                .gPatternTarget('types', [IFColor])
                .append($('<div></div>')
                    .addClass('stop-value'))
                .on('patternchange', function (evt, color) {
                    evt.stopPropagation();
                    if (color) {
                        $stop.data('stop-value', color);
                        updateStop($this, $stop);
                        updateGradient($this);
                        $this.trigger('gradientchange');
                    }
                })
                .on('patterndrop', function (evt, pattern, mouseEvent) {
                    evt.stopPropagation();
                })
                .on('click', function (evt) {
                    if (!hasChanged) {
                        // TODO : OPACITY POPUP
                        //$(this).gColorButton('open');
                    }
                })
                .on('mousedown', function (evt) {
                    hasChanged = false;

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
                        var percentPos = relativePos <= 0 ? 0 :
                            relativePos >= relativeMoveArea ? 1 : (relativePos / relativeMoveArea);

                        $stop.data('stop-position', percentPos);
                        updateStop($this, $stop);
                        updateGradient($this);
                        hasChanged = true;
                    };

                    var docMouseUp = function (evt) {
                        // Clear the document listeners
                        $document
                            .off("mousemove", docMouseMove)
                            .off("mouseup", docMouseUp);

                        // Delete the stop if marked
                        if ($stop.data('stop-delete') === true) {
                            $stop.remove();
                            hasChanged = true;
                        }

                        if (hasChanged) {
                            $this.trigger('gradientchange');
                        }
                    };

                    $document
                        .on("mousemove", docMouseMove)
                        .on("mouseup", docMouseUp);
                })
                .appendTo($stops);

            updateStop($this, $stop);

            return position;
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