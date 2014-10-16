(function ($) {

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
        $stop.find('.stop-value').css('background', IFColor.rgbToHtmlHex([tone, tone, tone]));
    }

    function updateGradient() {
        var $this = $(this);
        var gradient = new IFLinearGradient($this.gGradientEditor('value').getStops());
        $this
            .find('.gradient')
            .css('background', 'linear-gradient(90deg, ' + gradient.toScreenCSS() + ')');
        $this.gPatternTarget('value', gradient);
    }

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
            updateGradient.call(this);
            $(this).trigger('gradientchange');
        }
    }

    function stopMouseDown(evt) {
        var self = this;
        var $this = $(this);
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
            updateGradient.call(self);
            $stop.data('stop-moved');
        };

        var docMouseUp = function (evt) {
            // Clear the document listeners
            $document
                .off("mousemove", docMouseMove)
                .off("mouseup", docMouseUp);

            // Delete the stop if marked
            if ($stop.data('stop-delete') === true) {
                $stop.remove();
            }

            if ($stop.data('stop-moved')) {
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
                                updateGradient.call(self);
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
            $stop.data('stop-moved', true);
            updateOpacity($stop);
            updateGradient.call(self);
        };

        var docMouseUp = function (evt) {
            // Clear the document listeners
            $document
                .off("mousemove", docMouseMove)
                .off("mouseup", docMouseUp);

            // Delete the stop if marked
            if ($stop.data('stop-delete') === true) {
                $stop.remove();
            }

            if ($stop.data('stop-moved')) {
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
                    })
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
                            updateGradient.call(self);
                            $this.trigger('gradientchange');
                        } else if (pattern instanceof IFGradient) {
                            methods.value.call(self, pattern.clone());
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
                                    updateGradient.call(self);
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
                                    updateGradient.call(self);
                                    $this.trigger('gradientchange');
                                }
                            })));
            });
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                return data.gradient;
            } else {
                data.gradient = value;

                $this.find('.stops').empty();
                $this.find('.opacities').empty();

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

                updateGradient.call(this);

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
                .gPatternTarget('types', [IFColor])
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