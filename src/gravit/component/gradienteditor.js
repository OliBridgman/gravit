(function ($) {

    function updateStop($this, $stop) {
        $stop.css('left', $stop.data('stop-position') + '%');
        $stop.find('.stop-color').css('background', $stop.data('stop-color').asCSSString());
        $stop.gColorTarget('value', stop.color);

        updateGradient($this);
    }

    function updateGradient($this) {
        var stops = $this.gGradientEditor('value');
        var cssStops = [];

        for (var i = 0; i < stops.length; ++i) {
            var stop = stops[i];
            cssStops.push('' + stop.color.asCSSString() + ' ' + stop.position + '%');
        }

        $this.find('.gradient').css('background', 'linear-gradient(90deg, ' + cssStops.join(", ") + ')');
    }

    var methods = {
        init: function (options) {
            options = $.extend({
                // An attached scene used for swatch handling
                // when coosing a color
                scene: null
            }, options);

            var self = this;

            return this.each(function () {
                var data = {
                    options: options
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
                                drag: false
                            })
                            .on('mousedown', function (evt) {
                                // Prevents any accident drag'n'drop actions
                                evt.preventDefault();
                                evt.stopPropagation();
                            })
                            .on('colordrop', function (evt, color, mouseEvent) {
                                var $stops = $(evt.target);
                                if ($stops.hasClass('stops')) {
                                    var stopsWidth = $stops.width();
                                    var relativePos = mouseEvent.pageX - $stops.offset().left;
                                    var percentPos = relativePos <= 0 ? 0 :
                                        relativePos >= stopsWidth ? 100 : (relativePos / stopsWidth * 100);
                                    methods.insertStop.call(self, percentPos, color);
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

                                    var finalPosition = methods.insertStop.call(self, percentPos, IFColor.parseCSSColor('black'));
                                    $this.trigger('change');

                                    $stops.find('> .stop').each(function (index, element) {
                                        var $stop = $(element);
                                        if ($stop.data('stop-position') === finalPosition) {
                                            $stop.gColorButton('open');
                                            return false;
                                        }
                                    });
                                }
                            })));
            });
        },

        value: function (value) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');
            var $stops = $this.find('.stops > .stop');

            if (!arguments.length) {
                var stops = [];
                $stops.each(function (index, element) {
                    var $stop = $(element);
                    if ($stop.data('stop-delete') === false) {
                        stops.push({
                            position: $stop.data('stop-position'),
                            color: $stop.data('stop-color')
                        });
                    }
                });

                stops.sort(function (a, b) {
                    return a.position > b.position;
                });

                return stops;
            } else {
                // Shortcut: If stops lengths are equal,
                // do a simple stop-update instead of clearing
                if (value && value.length === $stops.length) {
                    $stops.each(function (index, element) {
                        var $stop = $(element);
                        $stop
                            .data('stop-position', value[index].position)
                            .data('stop-color', value[index].color)
                            .data('stop-delete', false);

                        updateStop($this, $stop);
                    });
                } else {
                    // Clear stops and add all again
                    $this.find('.stops').empty();

                    // Insert all stops now if any
                    if (value) {
                        for (var i = 0; i < value.length; ++i) {
                            methods.insertStop.call(self, value[i].position, value[i].color);
                        }
                    }
                }

                return this;
            }
        },

        insertStop: function (position, color) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');
            var $stops = $this.find('.stops');

            // Normalize position
            position = Math.round(position);
            position = position < 0 ? 0 : position > 100 ? 100 : position;

            var hasChanged = false;

            // Insert stop widget
            var $stop = $('<div></div>')
                .addClass('stop')
                .data('stop-position', position)
                .data('stop-color', color)
                .data('stop-delete', false)
                .gColorButton({
                    drag: false,
                    transient: true,
                    autoOpen: false,
                    scene: data.options.scene
                })
                .append($('<div></div>')
                    .addClass('stop-color'))
                .on('colorchange', function (evt, color) {
                    if (color) {
                        $stop.data('stop-color', color);
                        updateStop($this, $stop);
                        $this.trigger('change');
                    }
                })
                .on('click', function (evt) {
                    if (!hasChanged) {
                        $(this).gColorButton('open');
                    }
                })
                .on('mousedown', function (evt) {
                    hasChanged = false;

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

                        if (top > moveMaxY) {
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
                            relativePos >= relativeMoveArea ? 100 : (relativePos / relativeMoveArea * 100);

                        $stop.data('stop-position', percentPos);
                        updateStop($this, $stop);
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
                        if ($stop.data('stop-delete') === true) {
                            if ($stops.find('> .stop').length > 2) {
                                $stop.remove();
                                hasChanged = true;
                            } else {
                                $stop.data('stop-delete', false);
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