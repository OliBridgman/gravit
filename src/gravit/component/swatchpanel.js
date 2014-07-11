(function ($) {

    function updateSelectedSwatch($this, swatch) {
        if ($this.data('gswatchpanel').options.allowSelect) {
            $this.find('.swatch-block').each(function (index, element) {
                var $element = $(element);
                $element
                    .toggleClass('selected', $element.data('swatch') === swatch);
            });
        }
    };

    function afterInsertEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node instanceof IFSwatch && evt.node.getParent() === container) {
            methods.insertSwatch.call(this, evt.node);
        }
    };

    function beforeRemoveEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node instanceof IFSwatch && evt.node.getParent() === container) {
            methods.removeSwatch.call(this, evt.node);
        }
    };

    function afterPropertiesChangeEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node.getParent() === container) {
            methods.updateSwatch.call(this, evt.swatch);
        }
    };

    /** @type {IFSwatch} */
    var dragSwatch = null;

    var methods = {
        init: function (options) {
            options = $.extend({
                // Types of swatches to be shown, if null or empty,
                // all types will be shown
                types: null,
                // Whether to allow dragging of swatches
                allowDrag: true,
                // Whether to allow dropping of swatches
                allowDrop: false,
                // Whether to allow re-order of swatches or not
                allowReorder: true,
                // Whether to allow selecting or not
                allowSelect: true,
                // The html code or Jquery for the null swatch, if set to null,
                // no null swatch will be provided for choosing
                nullSwatch: null,
                // The name of the null swatch if any
                nullName: null,
                // The width of the swatch preview
                previewWidth: 20,
                // The height of the swatch preview
                previewHeight: 20
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .addClass('g-swatch-panel')
                    .data('gswatchpanel', {
                        selected: null,
                        options: options
                    });

                if (options.nullSwatch) {
                    $('<div></div>')
                        .addClass('swatch-block swatch-null')
                        .data('swatch', null)
                        .attr('title', options.nullName ? options.nullName : '')
                        .append($('<div></div>')
                            .addClass('swatch-content')
                            .append($('<div></div>')
                                .addClass('swatch-preview')
                                .append($('<div></div>')
                                    .css({
                                        'width': options.previewWidth + 'px',
                                        'height': options.previewHeight + 'px',
                                        'line-height': options.previewHeight + 'px'
                                    })
                                    .append(options.nullSwatch)))
                            .append($('<div></div>')
                                .addClass('swatch-name')
                                .text(options.nullName ? options.nullName : '')))
                        .on('click', function () {
                            $this.data('gswatchpanel').selected = null;
                            updateSelectedSwatch($this, null);
                            self.trigger('change', null);
                        })
                        .appendTo($this);
                }
            });
        },

        insertSwatch: function (swatch, index) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');
            var self = this;

            // don't add if type is not right
            var types = data.options.types;
            if (types !== null && types.length > 0 && types.indexOf(swatch.getSwatchType()) < 0) {
                return;
            }

            if (typeof index !== 'number') {
                index = swatch.getParent().getIndexOfChild(swatch);
            }

            if (data.options.nullSwatch) {
                index += 1;
            }

            var block = $('<div></div>')
                .addClass('swatch-block')
                .data('swatch', swatch)
                .append($('<div></div>')
                    .addClass('swatch-content')
                    .append($('<div></div>')
                        .addClass('swatch-preview')
                        .append($('<div></div>')
                            .css({
                                'width': data.options.previewWidth + 'px',
                                'height': data.options.previewHeight + 'px'
                            })))
                    .append($('<div></div>')
                        .addClass('swatch-name')))
                .on('mousedown', function () {
                    $this.data('gswatchpanel').selected = swatch;
                    updateSelectedSwatch($this, swatch);
                })
                .on('click', function () {
                    self.trigger('change', swatch);
                });

            if (data.options.allowDrag || data.options.allowReorder) {
                block
                    .attr('draggable', 'true')
                    .on('dragstart', function (evt) {
                        var event = evt.originalEvent;

                        dragSwatch = $(this).data('swatch');

                        if (data.options.allowDrag) {
                            self.trigger('swatchdragstart', swatch);

                            // Setup our drag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(IFNode.MIME_TYPE, IFNode.serialize(swatch));
                            event.dataTransfer.setDragImage(block.find('.swatch-preview > div')[0], data.options.previewWidth / 2, data.options.previewHeight / 2);
                        }
                    })
                    .on('dragend', function (evt) {
                        dragSwatch = null;

                        if (data.options.allowDrag) {
                            var offset = $this.offset();
                            var width = $this.outerWidth();
                            var height = $this.outerHeight();
                            var x = evt.originalEvent.pageX;
                            var y = evt.originalEvent.pageY;

                            if (x <= offset.left || x >= offset.left + width ||
                                y <= offset.top || y >= offset.top + height) {
                                self.trigger('swatchdragaway', swatch);
                            } else {
                                self.trigger('swatchdragend', swatch);
                            }
                        }
                    });
            }

            var _canDrop = function () {
                if (dragSwatch) {
                    var targetSwatch = $(this).data('swatch');

                    if (targetSwatch && targetSwatch !== dragSwatch) {
                        if (dragSwatch.getParent() === targetSwatch.getParent()) {
                            return data.options.allowReorder;
                        } else {
                            return data.options.allowDrop;
                        }
                    }
                }

                return false;
            };

            if (data.options.allowDrop || data.options.allowReorder) {
                block
                    .on('dragenter', function (evt) {
                        if (_canDrop.call(this)) {
                            $(this).addClass('drop');
                        }
                    })
                    .on('dragleave', function (evt) {
                        if (_canDrop.call(this)) {
                            $(this).removeClass('drop');
                        }
                    })
                    .on('dragover', function (evt) {
                        var event = evt.originalEvent;
                        if (_canDrop.call(this)) {
                            event.preventDefault();
                            event.stopPropagation();
                            event.dataTransfer.dropEffect = 'move';
                        }
                    })
                    .on('drop', function (evt) {
                        $(this).removeClass('drop');
                        var targetSwatch = $(this).data('swatch');

                        if (data.options.allowReorder) {
                            if (data.container && dragSwatch.getParent() === data.container) {
                                var parent = dragSwatch.getParent();
                                var sourceIndex = parent.getIndexOfChild(dragSwatch);
                                var targetIndex = parent.getIndexOfChild(targetSwatch);
                                var editor = IFEditor.getEditor(parent.getScene());

                                if (editor) {
                                    editor.beginTransaction();
                                }

                                try {
                                    parent.removeChild(dragSwatch);
                                    parent.insertChild(dragSwatch, sourceIndex < targetIndex ? targetSwatch.getNext() : targetSwatch);
                                } finally {
                                    if (editor) {
                                        editor.commitTransaction('Move Swatch');
                                    }
                                }
                            }

                            self.trigger('swatchmove', [dragSwatch, targetSwatch]);
                        } else if (data.options.allowDrop) {
                            self.trigger('swatchdrop', [dragSwatch, targetSwatch]);
                        }
                    });
            }

            var insertBefore = index >= 0 ? $this.children('.swatch-block').eq(index) : null;
            if (insertBefore && insertBefore.length > 0) {
                block.insertBefore(insertBefore);
            } else {
                block.appendTo($this);
            }

            methods.updateSwatch.call(this, swatch);
        },

        updateSwatch: function (swatch) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');

            $this.find('.swatch-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('swatch') === swatch) {
                    $element
                        .find('.swatch-preview > div')
                        .css(swatch.asCSSBackgroundString(data.options.previewWidth, data.options.previewHeight));

                    var name = swatch.getProperty('name');

                    $element.attr('title', name);
                    $element.find('.swatch-name').text(name);
                    return false;
                }
            });
        },

        removeSwatch: function (swatch) {
            $(this).find('.swatch-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('swatch') === swatch) {
                    $element.remove();
                    return false;
                }
            });
        },

        clear: function () {
            var remove = [];

            $(this).find('.swatch-block').each(function (index, block) {
                var $block = $(block);
                if (!$block.hasClass('swatch-null')) {
                    remove.push($block);
                }
            });

            for (var i = 0; i < remove.length; ++i) {
                remove[i].remove();
            }
        },

        attach: function (container) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');

            methods.detach.call(this);

            data.container = container;

            if (container) {
                for (var child = container.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFSwatch) {
                        methods.insertSwatch.call(this, child);
                    }
                }

                // Subscribe to container
                var scene = container.getScene();
                if (scene) {
                    data.afterInsertHandler = afterInsertEvent.bind(this);
                    data.beforeRemoveHandler = beforeRemoveEvent.bind(this);
                    data.afterPropertiesChangeHandler = afterPropertiesChangeEvent.bind(this);
                    scene.addEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.addEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                    scene.addEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                }
            }
            return this;
        },

        detach: function () {
            var $this = $(this);
            var data = $this.data('gswatchpanel');
            var container = data.container;

            if (container) {
                // Unsubscribe from container
                var scene = container.getScene();
                if (scene) {
                    scene.removeEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.removeEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                    scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                }
            }

            data.container = null;
            data.afterInsertHandler = null;
            data.beforeRemoveHandler = null;
            data.afterPropertiesChangeHandler = null;

            methods.clear.call(this);

            return this;
        },

        // Assigns or returns the selected swatch
        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gswatchpanel').selected;
            } else {
                $this.data('gswatchpanel').selected = value;
                updateSelectedSwatch($this, value);
                return this;
            }
        }
    };

    /**
     * Block to transform divs to swatch panels
     */
    $.fn.gSwatchPanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));