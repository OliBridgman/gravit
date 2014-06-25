(function ($) {

    function updateSelectedStyle($this, style) {
        $this.find('.style-block').each(function (index, element) {
            var $element = $(element);
            $element
                .toggleClass('selected', $element.data('style') === style);
        });
    };

    function afterInsertEvent(evt) {
        var $this = $(this);
        var container = $this.data('gstylepanel').container;
        if (evt.node instanceof IFStyle && evt.node.getParent() === container) {
            methods.insertStyle.call(this, evt.node);
        }
    };

    function beforeRemoveEvent(evt) {
        var $this = $(this);
        var container = $this.data('gstylepanel').container;
        if (evt.node instanceof IFStyle && evt.node.getParent() === container) {
            methods.removeStyle.call(this, evt.node);
        }
    };

    function styleChangeEvent(evt) {
        var $this = $(this);
        var container = $this.data('gstylepanel').container;
        if (evt.style.getParent() === container) {
            methods.updateStyle.call(this, evt.style);
        }
    };

    /** @type {IFStyle} */
    var dragStyle = null;

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to allow dragging of styles
                allowDrag: true,
                // Whether to allow dropping of styles
                allowDrop: false,
                // Whether to allow re-order of styles or not
                allowReorder: true,
                // The html code or Jquery for the null style, if set to null,
                // no null style will be provided for choosing
                nullStyle: null,
                // The width of the style preview
                previewWidth: 30,
                // The height of the style preview
                previewHeight: 30
            }, options);

            var self = this;
            return this.each(function () {
                var $this = $(this)
                    .addClass('g-style-panel')
                    .data('gstylepanel', {
                        selected: null,
                        options: options
                    });

                if (options.nullStyle) {
                    $('<div></div>')
                        .addClass('style-block style-null')
                        .append($('<div></div>')
                            .css({
                                'width': options.previewWidth + 'px',
                                'height': options.previewHeight + 'px'
                            })
                            .append(options.nullStyle))
                        .on('click', function () {
                            $this.data('gstylepanel').selected = null;
                            updateSelectedStyle($this, null);
                            self.trigger('change', null);
                        })
                        .data('style', null)
                        .appendTo($this);
                }
            });
        },

        insertStyle: function (style, index) {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var self = this;

            if (typeof index !== 'number') {
                index = style.getParent().getIndexOfChild(style);
            }

            if (data.options.nullStyle) {
                index += 1;
            }

            var block = $('<div></div>')
                .addClass('style-block')
                .data('style', style)
                .append($('<div></div>')
                    .addClass('style-content')
                    .append($('<div></div>')
                        .addClass('style-preview')
                        .append($('<img>')))
                    .append($('<div></div>')
                        .addClass('style-name')))
                .on('mousedown', function () {
                    $this.data('gstylepanel').selected = style;
                    updateSelectedStyle($this, style);
                })
                .on('click', function () {
                    self.trigger('change', style);
                });

            if (data.options.allowDrag || data.options.allowReorder) {
                block
                    .attr('draggable', 'true')
                    .on('dragstart', function (evt) {
                        var event = evt.originalEvent;

                        dragStyle = $(this).data('style');

                        if (data.options.allowDrag) {
                            self.trigger('styledragstart', style);

                            // Setup our drag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(IFNode.MIME_TYPE, IFNode.serialize(style));
                            event.dataTransfer.setDragImage(block.find('.style-preview > img')[0], data.options.previewWidth / 2, data.options.previewHeight / 2);
                        }
                    })
                    .on('dragend', function (evt) {
                        dragStyle = null;

                        if (data.options.allowDrag) {
                            var offset = $this.offset();
                            var width = $this.outerWidth();
                            var height = $this.outerHeight();
                            var x = evt.originalEvent.pageX;
                            var y = evt.originalEvent.pageY;

                            if (x <= offset.left || x >= offset.left + width ||
                                y <= offset.top || y >= offset.top + height) {
                                self.trigger('styledragaway', style);
                            } else {
                                self.trigger('styledragend', style);
                            }
                        }
                    });
            }

            var _canDrop = function () {
                if (dragStyle) {
                    var targetStyle = $(this).data('style');

                    if (targetStyle && targetStyle !== dragStyle) {
                        if (dragStyle.getParent() === targetStyle.getParent()) {
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
                        var event = evt.originalEvent;
                        event.preventDefault();
                        event.stopPropagation();
                        if (_canDrop.call(this)) {
                            $(this).addClass('drop');
                        }
                    })
                    .on('dragleave', function (evt) {
                        var event = evt.originalEvent;
                        event.preventDefault();
                        event.stopPropagation();
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
                        var event = evt.originalEvent;
                        event.preventDefault();
                        event.stopPropagation();
                        $(this).removeClass('drop');

                        if (data.options.allowReorder) {
                            if (data.container && dragStyle.getParent() === data.container) {
                                var targetStyle = $(this).data('style');
                                var parent = dragStyle.getParent();
                                var sourceIndex = parent.getIndexOfChild(dragStyle);
                                var targetIndex = parent.getIndexOfChild(targetStyle);
                                var editor = IFEditor.getEditor(parent.getScene());

                                if (editor) {
                                    editor.beginTransaction();
                                }

                                try {
                                    parent.removeChild(dragStyle);
                                    parent.insertChild(dragStyle, sourceIndex < targetIndex ? targetStyle.getNext() : targetStyle);
                                } finally {
                                    if (editor) {
                                        editor.commitTransaction('Move Style');
                                    }
                                }
                            }

                            self.trigger('stylemove', dragStyle, targetStyle);
                        } else if (data.options.allowDrop) {
                            self.trigger('styledrop', dragStyle, targetStyle);
                        }
                    });
            }

            var insertBefore = index >= 0 ? $this.children('.style-block').eq(index) : null;
            if (insertBefore && insertBefore.length > 0) {
                block.insertBefore(insertBefore);
            } else {
                block.appendTo($this);
            }

            methods.updateStyle.call(this, style);
        },

        updateStyle: function (style) {
            var $this = $(this);
            var data = $this.data('gstylepanel');

            $this.find('.style-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('style') === style) {
                    $element
                        .find('.style-preview > img')
                        .attr('src', style.createPreviewImage(data.options.previewWidth, data.options.previewHeight));

                    var name = '';
                    if (style instanceof IFSharedStyle) {
                        name = style.getProperty('name');
                        if (name === null) {
                            // TODO : I18N
                            name = '#Unnamed';
                        }
                    }

                    $element.attr('title', name);
                    $element.find('.style-name').text(name);
                    return false;
                }
            });
        },

        removeStyle: function (style) {
            $(this).find('.style-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('style') === style) {
                    $element.remove();
                    return false;
                }
            });
        },

        clear: function () {
            var remove = [];

            $(this).find('.style-block').each(function (index, block) {
                var $block = $(block);
                if (!$block.hasClass('style-null')) {
                    remove.push($block);
                }
            });

            for (var i = 0; i < remove.length; ++i) {
                remove[i].remove();
            }
        },

        attach: function (container) {
            var $this = $(this);
            var data = $this.data('gstylepanel');

            methods.detach.call(this);

            data.container = container;

            if (container) {
                for (var child = container.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFStyle) {
                        methods.insertStyle.call(this, child);
                    }
                }

                // Subscribe to container
                var scene = container.getScene();
                if (scene) {
                    data.afterInsertHandler = afterInsertEvent.bind(this);
                    data.beforeRemoveHandler = beforeRemoveEvent.bind(this);
                    data.styleChangeHandler = styleChangeEvent.bind(this);
                    scene.addEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.addEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                    scene.addEventListener(IFStyle.StyleChangeEvent, data.styleChangeHandler);
                }
            }
            return this;
        },

        detach: function () {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var container = data.container;

            if (container) {
                // Unsubscribe from container
                var scene = container.getScene();
                if (scene) {
                    scene.removeEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.removeEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                    scene.removeEventListener(IFStyle.StyleChangeEvent, data.styleChangeHandler);
                }
            }

            data.container = null;
            data.afterInsertHandler = null;
            data.beforeRemoveHandler = null;
            data.styleChangeHandler = null;

            methods.clear.call(this);

            return this;
        },

        // Assigns or returns the selected style
        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gstylepanel').selected;
            } else {
                $this.data('gstylepanel').selected = value;
                updateSelectedStyle($this, value);
                return this;
            }
        }
    };

    /**
     * Block to transform divs to style panels
     */
    $.fn.gStylePanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));