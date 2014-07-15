(function ($) {

    function updateSelectedStyle($this, style) {
        $this.find('.style-block').each(function (index, element) {
            var $element = $(element);
            $element
                .toggleClass('selected', $element.data('style') === style);
        });
    };

    function updatePlaceholder($this) {
        var data = $this.data('gstylepanel');

        if (data.options.placeholder) {
            var placeholder = $this.find('.placeholder');
            var blocks = $this.find('> .style-block');
            if (blocks.length === 0) {
                if (placeholder.length === 0) {
                    placeholder = $('<div></div>')
                        .addClass('placeholder')
                        .text(data.options.placeholder)
                        .appendTo($this);
                }
            } else {
                if (placeholder.length > 0) {
                    placeholder.remove();
                }
            }
        }
    }

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

    function afterPropertiesChangeEvent(evt) {
        var $this = $(this);
        var container = $this.data('gstylepanel').container;
        if (evt.node.getParent() === container) {
            methods.updateStyle.call(this, evt.node);
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

    function canDrop($this, target) {
        var data = $this.data('gstylepanel');
        if (dragStyle) {
            var targetStyle = $(target).data('style');

            if (targetStyle && (targetStyle !== dragStyle || ifPlatform.modifiers.shiftKey)) {
                if (dragStyle.getParent() === targetStyle.getParent()) {
                    return data.options.allowReorder;
                } else {
                    return data.options.allowDrop;
                }
            }
        }

        return false;
    };

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to allow dragging of styles
                allowDrag: true,
                // Whether to allow dropping of styles
                allowDrop: false,
                // Whether to allow re-order of styles or not
                allowReorder: true,
                // Allow editing the style name or not
                allowNameEdit: false,
                // The html code or Jquery for the null style, if set to null,
                // no null style will be provided for choosing
                nullStyle: null,
                // The name of the null style if any
                nullName: null,
                // The placeholder text if there's no content
                placeholder: null,
                // The width of the style preview
                previewWidth: 30,
                // The height of the style preview
                previewHeight: 30
            }, options);

            return this.each(function () {
                var self = this;

                var $this = $(this)
                    .addClass('g-style-panel')
                    .data('gstylepanel', {
                        selected: null,
                        options: options
                    });

                if (options.nullStyle) {
                    $('<div></div>')
                        .addClass('style-block style-null')
                        .data('style', null)
                        .attr('title', options.nullName ? options.nullName : '')
                        .append($('<div></div>')
                            .addClass('style-content')
                            .append($('<div></div>')
                                .addClass('style-preview')
                                .append($('<div></div>')
                                    .css({
                                        'display': 'inline-block',
                                        'width': options.previewWidth + 'px',
                                        'height': options.previewHeight + 'px',
                                        'line-height': options.previewHeight + 'px'
                                    })
                                    .append(options.nullStyle)))
                            .append($('<div></div>')
                                .addClass('style-name')
                                .text(options.nullName ? options.nullName : '')))
                        .on('click', function () {
                            $this.data('gstylepanel').selected = null;
                            updateSelectedStyle($this, null);
                            $this.trigger('stylechange', null);
                        })
                        .appendTo($this);
                }

                updatePlaceholder($this);
            });
        },

        insertStyle: function (style, index) {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var self = this;

            var insertBefore = null;

            if (typeof index === 'number') {
                if (data.options.nullStyle) {
                    index += 1;
                }
                insertBefore = $this.children('.style-block').eq(index);
            } else {
                if (style.getNext()) {
                    $this.find('.style-block').each(function (index, element) {
                        var $element = $(element);
                        if ($element.data('style') === style.getNext()) {
                            insertBefore = $element;
                            return false;
                        }
                    });
                }
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
                    self.trigger('stylechange', style);
                });

            if (data.options.allowNameEdit && style instanceof IFSharedStyle) {
                block
                    .gAutoEdit({
                        selector: '.style-name'
                    })
                    .on('submitvalue', function (evt, value) {
                        if (value && value.trim() !== '') {
                            // TODO : I18N
                            IFEditor.tryRunTransaction(style, function () {
                                style.setProperty('name', value);
                            }, 'Rename Style');
                        }
                    });
            }

            if (data.options.allowDrag || data.options.allowReorder) {
                block
                    .attr('draggable', 'true')
                    .on('dragstart', function (evt) {
                        var event = evt.originalEvent;
                        event.stopPropagation();

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
                        var event = evt.originalEvent;
                        event.stopPropagation();

                        dragStyle = null;

                        if (data.options.allowDrag) {
                            var offset = $this.offset();
                            var width = $this.outerWidth();
                            var height = $this.outerHeight();
                            var x = event.pageX;
                            var y = event.pageY;

                            if (x <= offset.left || x >= offset.left + width ||
                                y <= offset.top || y >= offset.top + height) {
                                self.trigger('styledragaway', style);
                            } else {
                                self.trigger('styledragend', style);
                            }
                        }
                    });
            }

            if (data.options.allowDrop || data.options.allowReorder) {
                block
                    .on('dragenter', function (evt) {
                        if (canDrop($this, this)) {
                            $(this).addClass('drop');
                        }
                    })
                    .on('dragleave', function (evt) {
                        if (canDrop($this, this)) {
                            $(this).removeClass('drop');
                        }
                    })
                    .on('dragover', function (evt) {
                        var event = evt.originalEvent;
                        if (canDrop($this, this)) {
                            event.preventDefault();
                            event.stopPropagation();
                            event.dataTransfer.dropEffect = 'move';
                        }
                    })
                    .on('drop', function (evt) {
                        $(this).removeClass('drop');
                        var targetStyle = $(this).data('style');

                        if (data.options.allowReorder && dragStyle) {
                            if (data.container && dragStyle.getParent() === data.container) {
                                var parent = dragStyle.getParent();
                                var sourceIndex = parent.getIndexOfChild(dragStyle);
                                var targetIndex = parent.getIndexOfChild(targetStyle);

                                // TODO : I18N
                                IFEditor.tryRunTransaction(parent, function () {
                                    if (ifPlatform.modifiers.shiftKey) {
                                        // Clone style
                                        var styleClone = dragStyle.clone();
                                        styleClone.setProperty('name', styleClone.getProperty('name') + '-copy');
                                        parent.insertChild(styleClone, sourceIndex < targetIndex ? targetStyle.getNext() : targetStyle);
                                    } else {
                                        parent.removeChild(dragStyle);
                                        parent.insertChild(dragStyle, sourceIndex < targetIndex ? targetStyle.getNext() : targetStyle);
                                    }
                                }, ifPlatform.modifiers.shiftKey ? 'Duplicate Style' : 'Move Style');
                            }

                            self.trigger('stylemove', [dragStyle, targetStyle]);
                        } else if (data.options.allowDrop) {
                            self.trigger('styledrop', [dragStyle, targetStyle, ]);
                        }
                    });
            }

            if (insertBefore && insertBefore.length > 0) {
                block.insertBefore(insertBefore);
            } else {
                block.appendTo($this);
            }

            updatePlaceholder($this);

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
                    }

                    $element.attr('title', name);
                    $element.find('.style-name').text(name);
                    return false;
                }
            });
        },

        removeStyle: function (style) {
            var self = this;
            var $this = $(this);
            var data = $this.data('gstylepanel');

            $this.find('.style-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('style') === style) {
                    $element.remove();

                    if (style === data.selected) {
                        data.selected = null;
                        self.trigger('stylechange', null);
                    }

                    updatePlaceholder($this);
                    return false;
                }
            });
        },

        clear: function () {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var remove = [];

            $this.find('.style-block').each(function (index, block) {
                var $block = $(block);
                if (!$block.hasClass('style-null')) {
                    remove.push($block);
                }
            });

            for (var i = 0; i < remove.length; ++i) {
                remove[i].remove();
            }

            updatePlaceholder($this);
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
                    data.afterPropertiesChangeHandler = afterPropertiesChangeEvent.bind(this);
                    scene.addEventListener(IFNode.AfterInsertEvent, data.afterInsertHandler);
                    scene.addEventListener(IFNode.BeforeRemoveEvent, data.beforeRemoveHandler);
                    scene.addEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
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
                    scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, data.afterPropertiesChangeHandler);
                    scene.removeEventListener(IFStyle.StyleChangeEvent, data.styleChangeHandler);
                }
            }

            data.container = null;
            data.afterInsertHandler = null;
            data.beforeRemoveHandler = null;
            data.afterPropertiesChangeHandler = null;
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