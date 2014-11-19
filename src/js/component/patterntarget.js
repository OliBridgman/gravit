(function ($) {

    var previewBoxSize = 20;

    var dragImage = $('<div></div>')
        .css({
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'width': previewBoxSize + 'px',
            'height': previewBoxSize + 'px',
            'z-index': '-1'
        })
        .appendTo($('body'));

    var methods = {
        init: function (options) {
            options = $.extend({
                // Pattern can be dragged away
                allowDrag: true,
                // Pattern can be dropped in
                allowDrop: true
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this);

                $this
                    .data('gpatterntarget', {
                        options: options,
                        pattern: null,
                        types: null
                    });

                if (options.allowDrag) {
                    $this
                        .attr('draggable', 'true')
                        .on('dragstart', function (evt) {
                            var event = evt.originalEvent;

                            var pattern = $this.data('gpatterntarget').pattern;
                            if (!pattern) {
                                // No dragging without a pattern
                                event.preventDefault();
                                return;
                            }
                            event.stopPropagation();

                            $this.trigger('patterndrag', pattern);

                            // Create an invisible div with the pattern as background
                            dragImage.css('background', GPattern.asCSSBackground(pattern));

                            // Setup our allowDrag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(GPattern.MIME_TYPE, GPattern.serialize(pattern));
                            event.dataTransfer.setDragImage(dragImage[0], previewBoxSize / 2, previewBoxSize / 2);
                            event.dataTransfer.sourceElement = this;
                        })
                        .on('dragend', function (evt) {
                            var event = evt.originalEvent;
                            event.stopPropagation();
                        });
                }

                if (options.allowDrop) {
                    $this
                        .on('dragover', function (evt) {
                            evt.stopPropagation();
                            var event = evt.originalEvent;
                            event.preventDefault();
                            event.stopPropagation();
                            evt.originalEvent.dataTransfer.dropEffect = 'move';
                        })
                        .on('drop', function (evt) {
                            evt.stopPropagation();
                            var data = $this.data('gpatterntarget');
                            var event = evt.originalEvent;
                            var source = event.dataTransfer.getData(GPattern.MIME_TYPE);
                            if (source) {
                                source = GPattern.deserialize(source);
                                if (source) {
                                    var isCompatible = true;
                                    if (data.types && data.types.length > 0) {
                                        isCompatible = false;
                                        for (var i = 0; i < data.types.length; ++i) {
                                            if (data.types[i] && source instanceof data.types[i]) {
                                                isCompatible = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (isCompatible) {
                                        var myPattern = $this.data('gpatterntarget').pattern;
                                        if (!GUtil.equals(source, myPattern)) {
                                            methods.value.call(self, source);
                                            $this.trigger('patternchange', source);
                                        }

                                        // allowDrop will always fire
                                        $this.trigger('patterndrop', [source, event]);
                                    }
                                }
                            }

                            return false;
                        });
                }
            });
        },

        value: function (value) {
            var $this = $(this);
            var data = $this.data('gpatterntarget');

            if (!arguments.length) {
                return data.pattern;
            } else {
                value = typeof value === 'string' ? GPattern.deserialize(value) : value;
                data.pattern = value;
                return this;
            }
        },

        types: function (types) {
            var $this = $(this);
            var data = $this.data('gpatterntarget');

            if (!arguments.length) {
                return data.types;
            } else {
                data.types = types;
                return this;
            }
        }
    };

    /**
     * Block to transform target into a pattern target which holds a pattern value
     * and optionally supports allowDrag'n'allowDrop (out and in)
     */
    $.fn.gPatternTarget = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));