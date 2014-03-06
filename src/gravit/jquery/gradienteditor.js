(function ($) {

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to show inputs or not
                input: true
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
                                drag : false,
                                globalColor : false
                            })
                            .on('colordrop', function (evt, color, mouseEvent) {
                                var $stops = $(evt.target);
                                if ($stops.hasClass('stops')) {
                                    var stopsWidth = $stops.width();
                                    var relativePos = mouseEvent.pageX - $stops.offset().left;
                                    var percentPos = relativePos <= 0 ? 0 :
                                        relativePos >= stopsWidth ? 100 : (relativePos / stopsWidth * 100);
                                    methods._insertStop.call(self, percentPos, color, true);
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

                                    methods._insertStop.call(self, percentPos, GXColor.parseCSSColor('black'), true);
                                }
                            })));

                if (options.input) {
                    container
                        .append($('<div></div>')
                            .addClass('panel')
                            .append($('<input>')
                                .attr('type', 'text')
                                .addClass('position')
                                .gAutoBlur()
                                .on('change', function (evt) {
                                    var value = parseInt($(evt.target).val());
                                    if (!isNaN(value) && value >= 0 && value <= 100) {
                                        methods._updateStop.call(self, data.selected, value);
                                    }
                                }))
                            .append($('<button></button>')
                                .addClass('color g-flat')
                                .gColorButton({
                                    noneSelect: false,
                                    swatch: false
                                })
                                .on('change', function (evt, color) {
                                    methods._updateStop.call(self, data.selected, null, color);
                                })));
                }
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

                result.sort(function (a, b) {
                    return a.position > b.position;
                });

                return result;
            } else {
                // Clear stops and add all again
                data.stops = [];
                data.selected = -1;
                $this.find('.stops').empty();

                // Insert all stops now
                for (var i = 0; i < value.length; ++i) {
                    methods._insertStop.call(self, value[i].position, value[i].color);
                }

                methods._updatePanel.call(self);

                return this;
            }
        },

        selected: function (selected) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                return data.selected;
            } else {
                if (selected !== data.selected) {
                    data.selected = selected;

                    $this.find('.stop').each(function () {
                        var $stop = $(this);
                        $stop.toggleClass('g-active', $stop.attr('stop-index') == selected);
                    });

                    methods._updatePanel.call(self);
                }
            }
        },

        _insertStop: function (position, color, select) {
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

            // Insert stop widget
            $('<div></div>')
                .addClass('stop')
                .attr('stop-index', stopIndex.toString())
                .gColorTarget({
                    drag : false
                })
                .append($('<div></div>')
                    .addClass('stop-color'))
                .on('change', function (evt, color) {
                    if (color) {
                        methods._updateStop.call(self, stopIndex, null, color);
                    }
                })
                .on('mousedown', function (evt) {
                    // Select stop on mouse down
                    methods.selected.call(self, stopIndex);

                    // Implement dragging stuff
                    var $stop = $(this);
                    var stopindex = parseInt($stop.attr('stop-index'));
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

                        if (top > moveMaxY) {
                            // Moved outside area so get rid of our stop
                            $stop.css('display', 'none');
                            data.stops[stopIndex].markDelete = true;
                        } else {
                            $stop.css('display', '');
                            data.stops[stopIndex].markDelete = false;
                        }

                        // Calculate percentage for stop
                        var relativePos = left - moveMinX;
                        var relativeMoveArea = (moveMaxX - moveMinX);
                        var percentPos = relativePos <= 0 ? 0 :
                            relativePos >= relativeMoveArea ? 100 : (relativePos / relativeMoveArea * 100);

                        methods._updateStop.call(self, stopIndex, percentPos);
                    };

                    var docMouseUp = function (evt) {
                        // Clear the document listeners
                        $document
                            .off("mousemove", docMouseMove)
                            .off("mouseup", docMouseUp);

                        // Delete the stop if marked
                        if (data.stops[stopIndex].markDelete) {
                            data.stops.splice(stopIndex, 1);
                            $stop.remove();
                        }
                    };

                    $document
                        .on("mousemove", docMouseMove)
                        .on("mouseup", docMouseUp);
                })
                .appendTo($this.find('.stops'));

            // Update stop widget
            methods._updateStop.call(self, stopIndex);

            // Select stop if desired
            if (select) {
                methods.selected.call(self, stopIndex);
            }
        },

        _updateStop: function (stopIndex, position, color) {
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

            methods._updatePreview.call(self);

            if (stopIndex == data.selected) {
                methods._updatePanel.call(self);
            }
        },

        _updatePreview: function () {
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
        },

        _updatePanel: function () {
            var $this = $(this);
            var data = $this.data('ggradienteditor');
            var panel = $this.find('.panel');

            if (panel.length > 0) {
                var $position = panel.find('.position');
                var $color = panel.find('.color');
                var stop = data.selected < 0 ? null : data.stops[data.selected];

                if (stop && stop.markDelete) {
                    stop = null;
                }

                $position.prop('disabled', !stop);
                $position.val(stop ? stop.position : '');
                $color.prop('disabled', !stop);
                $color.gColorButton('value', stop ? stop.color : null);
            }
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