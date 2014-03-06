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
                            .addClass('stops')));

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

        value : function (value) {
            var self = this;
            var $this = $(this);
            var data = $this.data('ggradienteditor');

            if (!arguments.length) {
                var stops = data.stops;
                var result = [];

                for (var i = 0; i < stops.length; ++i) {
                    result.push({
                        position : stops[i].position,
                        color : stops[i].color
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

                // If we have any stops, select the first one
                //if (data.stops.length) {
                //    methods.selected.call(self, 0);
                //}
                methods._updatePanel.call(self);

                return this;
            }
        },

        selected : function (selected) {
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

        _insertStop : function (position, color) {
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

            // Insert stop data keeper
            var stop = {
                position : position,
                color : color,
                inside : true
            };

            var stopIndex = data.stops.length;
            data.stops.push(stop);

            // Insert stop widget
            $('<div></div>')
                .addClass('stop')
                .attr('stop-index', stopIndex.toString())
                .append($('<div></div>')
                    .addClass('stop-color'))
                .on('mousedown', function (e) {
                    // Select stop on mouse down
                    methods.selected.call(self, stopIndex);

                    // Implement dragging stuff
                    var moveMinX = $stops.offset().left;
                    var moveMaxX = moveMinX + $stops.width();

                    var $drag = $(this);

                    var z_idx = $drag.css('z-index'),
                        drg_h = $drag.outerHeight(),
                        drg_w = $drag.outerWidth(),
                        pos_y = $drag.offset().top + drg_h - e.pageY,
                        pos_x = $drag.offset().left + drg_w - e.pageX;

                    var docMove = function (e) {

                        var left = e.pageX + pos_x - (drg_w / 2);

                        if (left <= moveMinX) {
                            left = moveMinX;
                        } else if (left >= moveMaxX) {
                            left = moveMaxX;
                        }

                        var pos = left - moveMinX;

                        var width = (moveMaxX - moveMinX);
                        var prc = pos === 0 ? 0 : pos >= width ? 100 : (pos / width * 100);

                        methods._updateStop.call(self, stopIndex, prc);
                    };


                    $(document).on("mousemove", docMove)
                        .on("mouseup", function (e) {
                            console.log('STOP_DRAG');
                            $(document).off("mousemove", docMove);
                        });
                    e.preventDefault(); // disable selection
                })
                .appendTo($this.find('.stops'));

            // Update stop widget
            methods._updateStop.call(self, stopIndex);
        },

        _updateStop : function (stopIndex, position, color) {
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

            methods._updatePreview.call(self);

            if (stopIndex == data.selected) {
                methods._updatePanel.call(self);
            }
        },

        _updatePreview : function () {
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
                cssStops.push('' + stop.color.asCSSString() + ' ' + stop.position + '%');
            }

            $this.find('.gradient').css('background', 'linear-gradient(90deg, ' + cssStops.join(", ") + ')');
        },

        _updatePanel : function () {
            var $this = $(this);
            var data = $this.data('ggradienteditor');
            var panel = $this.find('.panel');

            if (panel.length > 0) {
                var $position = panel.find('.position');
                var $color = panel.find('.color');

                $position.prop('disabled', data.selected < 0);
                $position.val(data.selected >= 0 ? data.stops[data.selected].position : '');
                $color.prop('disabled', data.selected < 0);
                $color.gColorButton('value', data.selected >= 0 ? data.stops[data.selected].color : null);
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