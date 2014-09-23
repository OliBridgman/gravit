(function ($) {
    function createStylePreviewImage (style, width, height) {
        // Create either a temporary rectangle or text depending on the property sets
        var previewBox = style.getStyleBBox(new IFRect(0, 0, width, height), false);
        var propertySets = style.getStylePropertySets();

        var previewElement = null;
        if (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0 || propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0) {
            previewElement = new IFText();
            previewElement.fromHtml('<p style="font-size:30">A</p>');
        } else {
            previewElement = new IFRectangle();
            var rectWidth = previewBox.getWidth() - previewBox.getX();
            var rectHeight = previewBox.getHeight() - previewBox.getY();
            previewElement.setProperty('trf', new IFTransform(rectWidth / 2, 0, 0, rectHeight / 2, rectWidth / 2, rectHeight / 2));
        }

        previewElement.assignFrom(style);

        return previewElement.toBitmap(new IFLength(width), new IFLength(height), 2).toImageDataUrl(IFBitmap.ImageType.PNG);
    };

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

                updatePlaceholder($this);
            });
        },

        insertStyle: function (style, index) {
            var $this = $(this);
            var data = $this.data('gstylepanel');
            var self = this;

            var insertBefore = null;

            if (typeof index === 'number') {
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
                    $this.trigger('stylechange', style);
                });

            if (data.options.allowNameEdit) {
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
                            $this.trigger('styledragstart', style);

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
                                $this.trigger('styledragaway', style);
                            } else {
                                $this.trigger('styledragend', style);
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

                            $this.trigger('stylemove', [dragStyle, targetStyle]);
                        } else if (data.options.allowDrop) {
                            $this.trigger('styledrop', [dragStyle, targetStyle, ]);
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
                        .attr('src', createStylePreviewImage(style, data.options.previewWidth, data.options.previewHeight));


                    var name = style.getProperty('name');
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
                        $this.trigger('stylechange', null);
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
            var data = $this.data('gstylepanel');
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