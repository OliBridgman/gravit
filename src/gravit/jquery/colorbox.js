(function ($) {

    var previewBoxSize = 14;

    var methods = {
        init: function (options) {
            options = $.extend({
                // Color can be dragged away
                drag: true,
                // Color can be droppend
                drop: true,
                // Double click assigns global color
                globalColor: true
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);
                $this
                    .addClass('g-swatch')
                    .data('gcolorbox', {
                        color: null
                    });

                if (options.drag) {
                    $this
                        .attr('draggable', 'true')
                        .addClass('g-cursor-hand-open')
                        .on('dragstart', function (evt) {
                            var event = evt.originalEvent;

                            var color = $this.data('gcolorbox').color;
                            if (!color) {
                                // No dragging without a color
                                event.preventDefault();
                                event.stopPropagation();
                            }

                            // Create our standard color drag image
                            var canvas = document.createElement("canvas");
                            canvas.width = previewBoxSize;
                            canvas.height = previewBoxSize;
                            var context = canvas.getContext("2d");
                            context.fillRect(0, 0, previewBoxSize, previewBoxSize);
                            context.fillStyle = $this.css('background-color');
                            context.fillRect(1, 1, previewBoxSize - 2, previewBoxSize - 2);
                            var img = document.createElement("img");
                            img.src = canvas.toDataURL();

                            // Setup our drag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(GXColor.MIME_TYPE, color.asString());
                            event.dataTransfer.setDragImage(img, previewBoxSize / 2, previewBoxSize / 2);
                            event.dataTransfer.sourceElement = this;
                        });
                }

                if (options.drop) {
                    $this
                        .on('dragenter', function (evt) {
                            var event = evt.originalEvent;
                            event.preventDefault();
                            event.stopPropagation();
                        })
                        .on('dragover', function (evt) {
                            var event = evt.originalEvent;
                            event.preventDefault();
                            event.stopPropagation();
                            evt.originalEvent.dataTransfer.dropEffect = 'move';
                        })
                        .on('drop', function (evt) {
                            var event = evt.originalEvent;
                            event.preventDefault();
                            event.stopPropagation();
                            var sourceColor = event.dataTransfer.getData(GXColor.MIME_TYPE);
                            if (sourceColor && sourceColor !== "") {
                                var color = GXColor.parseColor(sourceColor);
                                var myColor = $this.data('gcolorbox').color;
                                if (color && !GXColor.equals(color, myColor)) {
                                    methods.value.call(self, color);
                                    $this.trigger('change', color);
                                }
                            }
                            return false;
                        });
                }

                if (options.globalColor) {
                    $this
                        .on('dblclick', function () {
                            var color = $this.data('gcolorbox').color;
                            if (color) {
                                gApp.setGlobalColor(color);
                            }
                        });
                }
            });
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorbox').color;
            } else {
                value = typeof value === 'string' ? GXColor.parseColor(value) : value;
                $this.data('gcolorbox').color = value;
                $this.css('background', value ? value.asCSSString() : 'linear-gradient(135deg, rgba(255,255,255,1) 0%,rgba(255,255,255,1) 40%,rgba(203,0,11,1) 50%,rgba(255,255,255,1) 60%,rgba(255,255,255,1) 100%,rgba(255,255,255,1) 100%,rgba(255,255,255,1) 100%)');
                return this;
            }
        }
    };

    /**
     * Block to transform divs to draggable color boxes
     */
    $.fn.gColorBox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));