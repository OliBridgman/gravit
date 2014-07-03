(function ($) {

    var previewBoxSize = 14;

    var methods = {
        init: function (options) {
            options = $.extend({
                // Color can be dragged away
                drag: true,
                // Color can be dropped
                drop: true
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this);
                $this
                    .data('gcolortarget', {
                        color: null
                    });

                if (options.drag) {
                    $this
                        .attr('draggable', 'true')
                        .on('dragstart', function (evt) {
                            var event = evt.originalEvent;

                            var color = $this.data('gcolortarget').color;
                            if (!color) {
                                // No dragging without a color
                                event.preventDefault();
                                event.stopPropagation();
                                return;
                            }

                            $this.trigger('colordrag', color);

                            // Create our standard color drag image
                            var canvas = document.createElement("canvas");
                            canvas.width = previewBoxSize;
                            canvas.height = previewBoxSize;
                            var context = canvas.getContext("2d");
                            context.fillRect(0, 0, previewBoxSize, previewBoxSize);
                            context.fillStyle = color.asCSSString();
                            context.fillRect(1, 1, previewBoxSize - 2, previewBoxSize - 2);
                            var img = document.createElement("img");
                            img.src = canvas.toDataURL();

                            // Setup our drag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(IFColor.MIME_TYPE, color.asString());
                            event.dataTransfer.setDragImage(img, previewBoxSize / 2, previewBoxSize / 2);
                            event.dataTransfer.sourceElement = this;
                        });
                }

                if (options.drop) {
                    $this
                        .on('dragover', function (evt) {
                            var event = evt.originalEvent;
                            event.preventDefault();
                            event.stopPropagation();
                            evt.originalEvent.dataTransfer.dropEffect = 'move';
                        })
                        .on('drop', function (evt) {
                            var event = evt.originalEvent;
                            var sourceColor = event.dataTransfer.getData(IFColor.MIME_TYPE);
                            if (sourceColor && sourceColor !== "") {
                                var color = IFColor.parseColor(sourceColor);
                                var myColor = $this.data('gcolortarget').color;
                                if (color && !IFColor.equals(color, myColor)) {
                                    methods.value.call(self, color);
                                    $this.trigger('colordrop', [color, event]);
                                    $this.trigger('colorchange', color);
                                }
                            }
                            return false;
                        });
                }
            });
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolortarget').color;
            } else {
                value = typeof value === 'string' ? IFColor.parseColor(value) : value;
                $this.data('gcolortarget').color = value;
                return this;
            }
        }
    };

    /**
     * Block to transform target into a color target which holds a color value
     * and optionally supports drag'n'drop and assigning global color via double click
     */
    $.fn.gColorTarget = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));