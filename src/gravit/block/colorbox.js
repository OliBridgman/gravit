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
                    .data('ex-colorbox', {
                        color: null
                    })
                    .addClass('ex-color-box');

                if (options.drag) {
                    $this
                        .attr('draggable', 'true')
                        .addClass('g-cursor-hand-open')
                        .on('dragstart', function (evt) {
                            var event = evt.originalEvent;

                            var color = $this.data('ex-colorbox').color;
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
                            event.dataTransfer.setData('gxcolor', color.asString());
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
                            var sourceColor = event.dataTransfer.getData('gxcolor');
                            if (sourceColor && sourceColor !== "") {
                                var color = GXColor.parseColor(sourceColor);
                                var myColor = $this.data('ex-colorbox').color;
                                if (color && !GXColor.equals(color, myColor)) {
                                    methods.color.call(self, color);
                                    $this.trigger('ex.color-dropped', color);
                                }
                            }
                            return false;
                        });
                }

                if (options.globalColor) {
                    $this
                        .on('dblclick', function () {
                            var color = $this.data('ex-colorbox').color;
                            if (color) {
                                gApp.setGlobalColor(color);
                            }
                        });
                }
            });
        },

        color: function (newColor) {
            if (!newColor) {
                return $(this).data('ex-colorbox').color;
            } else {
                return this.each(function () {
                    var $this = $(this);
                    $this.data('ex-colorbox').color = newColor;
                    $this.css('background', newColor ? newColor.asCSSString() : '');
                });
            }
        }
    };

    /**
     * Block to transform divs to draggable color boxes
     */
    $.fn.exColorBox = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));