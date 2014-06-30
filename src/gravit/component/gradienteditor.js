(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
            }, options);

            var self = this;

            return this.each(function () {
                var data = {
                    stops: [],
                    selected: -1
                };

                var $this = $(this)
                    .addClass('g-gradient-editor')
                    .data('ggradienteditor', data);

                var container = $('<div></div>')
                    .addClass('container')
                    .appendTo($this);

                container
                    .append($('<div></div>')
                        .addClass('editor')
                        .append($('<div></div>')
                            .addClass('gradient g-input')
                            .css('background', 'transparent'))
                        .append($('<div></div>')
                            .addClass('stops')
                            .gColorTarget({
                                drag: false,
                                globalColor: false
                            })
                            .on('colordrop', function (evt, color, mouseEvent) {
                                var $stops = $(evt.target);
                                if ($stops.hasClass('stops')) {
                                    var stopsWidth = $stops.width();
                                    var relativePos = mouseEvent.pageX - $stops.offset().left;
                                    var percentPos = relativePos <= 0 ? 0 :
                                        relativePos >= stopsWidth ? 100 : (relativePos / stopsWidth * 100);
                                    methods.insertStop.call(self, percentPos, color, true);
                                    $this.trigger('change');
                                }
                            })
                            .on('dblclick', function (evt) {
                                var $stops = $(evt.target);
                                if ($stops.hasClass('stops')) {
                                    // Calculate insert position
                                    // TODO : Calculate gradient color at given position and set it
                                    var stopsWidth = $stops.width();
                                    var relativePos = evt.pageX - $stops.offset().left;
                                    var percentPos = relativePos <= 0 ? 0 :
                                        relativePos >= stopsWidth ? 100 : (relativePos / stopsWidth * 100);

                                    methods.insertStop.call(self, percentPos, IFColor.parseCSSColor('black'), true);
                                    $this.trigger('change');
                                }
                            })));
            });
        },

        value: function (value) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                var stops = data.stops;
                var result = [];

                for (var i = 0; i < stops.length; ++i) {
                    result.push({
                        position: stops[i].position,
                        color: stops[i].color
                    })
                }

                // Order stops before returning
                result.sort(function (a, b) {
                    return a.position > b.position;
                });

                return result;
            } else {
                // Reset any selection
                methods.selected.call(self, -1, true);

                // Clear stops and add all again
                data.stops = [];
                $this.find('.stops').empty();

                // Insert all stops now if any
                if (value) {
                    for (var i = 0; i < value.length; ++i) {
                        methods.insertStop.call(self, value[i].position, value[i].color);
                    }
                }

                return this;
            }
        },

        selected: function (selected, triggerEvent) {
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                var selected = data.selected;
                if (selected >= 0 && !data.stops[selected].markDelete) {
                    return selected;
                }
                return -1;
            } else {
                if (selected !== data.selected) {
                    data.selected = selected;

                    $this.find('.stop').each(function () {
                        var $stop = $(this);
                        $stop.toggleClass('g-active', $stop.attr('stop-index') == selected);
                    });

                    if (triggerEvent) {
                        this.trigger('selected');
                    }
                }
            }
        },

        insertStop: function (position, color, select) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');
            var $stops = $this.find('.stops');

            // Find insertion position for stop
            var insertIndex = -1;
            for (var i = 0; i < data.stops.length; ++i) {
                if (data.stops[i].position >= position) {
                    insertIndex = i;
                    break;
                }
            }

            // Normalize position
            position = Math.round(position);
            position = position < 0 ? 0 : position > 100 ? 100 : position;

            // Insert stop data keeper
            var stop = {
                position: position,
                color: color,
                markDelete: false
            };

            var stopIndex = data.stops.length;
            data.stops.push(stop);

            var hasChanged = false;

            // Insert stop widget
            $('<div></div>')
                .addClass('stop')
                .attr('stop-index', stopIndex.toString())
                .gColorButton({
                    drag: false,
                    transient: true,
                    autoOpen: false
                })
                .append($('<div></div>')
                    .addClass('stop-color'))
                .on('change', function (evt, color) {
                    if (color) {
                        methods.updateStop.call(self, stopIndex, null, color);
                        $this.trigger('change');
                    }
                })
                .on('click', function (evt) {
                    if (!hasChanged) {
                        $(this).gColorButton('open');
                    }
                })
                .on('mousedown', function (evt) {
                    // Important to prevent anything else as we might reside
                    // within a container that is draggable
                    evt.preventDefault();
                    evt.stopPropagation();

                    var $stop = $(this);
                    var stopindex = parseInt($stop.attr('stop-index'));

                    hasChanged = false;

                    // Select stop on mouse down
                    methods.selected.call(self, stopIndex, true);

                    // Implement dragging stuff
                    var stopsOffset = $stops.offset();
                    var moveMinX = stopsOffset.left;
                    var moveMaxX = moveMinX + $stops.width();
                    var moveMaxY = stopsOffset.top + $stops.outerHeight();
                    var stopWidth = $stop.outerWidth();
                    var startPosX = $stop.offset().left + stopWidth - evt.pageX;
                    var startPosY = $stop.offset().top - evt.pageY;

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

                        var stop = data.stops[stopIndex];

                        if (top > moveMaxY) {
                            // Moved outside area so get rid of our stop
                            $stop.css('display', 'none');
                            stop.markDelete = true;
                        } else {
                            $stop.css('display', '');
                            stop.markDelete = false;
                        }

                        // Calculate percentage for stop
                        var relativePos = left - moveMinX;
                        var relativeMoveArea = (moveMaxX - moveMinX);
                        var percentPos = relativePos <= 0 ? 0 :
                            relativePos >= relativeMoveArea ? 100 : (relativePos / relativeMoveArea * 100);

                        methods.updateStop.call(self, stopIndex, percentPos);
                        $this.trigger('change-stop', stopIndex);
                        hasChanged = true;
                    };

                    var docMouseUp = function (evt) {
                        // Clear the document listeners
                        $document
                            .off("mousemove", docMouseMove)
                            .off("mouseup", docMouseUp);

                        // Delete the stop if marked and we
                        // still have at least two steps left
                        var triggerChange = true;
                        if (data.stops[stopIndex].markDelete) {
                            if (data.stops.length > 2) {
                                data.stops.splice(stopIndex, 1);
                                $stop.remove();
                                hasChanged = true;
                            } else {
                                data.stops[stopIndex].markDelete = false;
                                hasChanged = true;
                                triggerChange = false;
                            }
                        }

                        if (hasChanged && triggerChange) {
                            $this.trigger('change');
                        }
                    };

                    $document
                        .on("mousemove", docMouseMove)
                        .on("mouseup", docMouseUp);
                })
                .appendTo($this.find('.stops'));

            // Update stop widget
            methods.updateStop.call(self, stopIndex);

            // Select stop if desired
            if (select) {
                methods.selected.call(self, stopIndex, true);
            }
        },

        updateStop: function (stopIndex, position, color) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            var $stop = $this.find('.stop[stop-index="' + stopIndex + '"]');
            var stop = data.stops[stopIndex];

            if (typeof position === 'number') {
                position = Math.round(position);
                stop.position = position < 0 ? 0 : position > 100 ? 100 : position;
            }

            if (color) {
                stop.color = color;
            }

            $stop.css('left', stop.position + '%');
            $stop.find('.stop-color').css('background', stop.color.asCSSString());
            $stop.gColorTarget('value', stop.color);

            methods._updateGradient.call(self, true);

            if (stopIndex === data.selected) {
                $this.trigger('selected');
            }
        },

        _updateGradient: function () {
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            // Order stops before building our gradient
            var orderedStops = data.stops.slice();
            orderedStops.sort(function (a, b) {
                return a.position > b.position;
            });

            var cssStops = [];
            for (var i = 0; i < orderedStops.length; ++i) {
                var stop = orderedStops[i];
                if (stop.markDelete) {
                    continue;
                }
                cssStops.push('' + stop.color.asCSSString() + ' ' + stop.position + '%');
            }

            $this.find('.gradient').css('background', 'linear-gradient(90deg, ' + cssStops.join(", ") + ')');
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