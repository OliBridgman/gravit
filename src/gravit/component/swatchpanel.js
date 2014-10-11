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

    function updatePlaceholder($this) {
        var data = $this.data('gswatchpanel');

        if (data.options.placeholder) {
            var placeholder = $this.find('.placeholder');
            var blocks = $this.find('> .swatch-block');
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
    };

    function afterInsertEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node instanceof IFSwatch && evt.node.getParent() === container) {
            insertSwatch.call(this, evt.node);
        }
    };

    function beforeRemoveEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node instanceof IFSwatch && evt.node.getParent() === container) {
            removeSwatch.call(this, evt.node);
        }
    };

    function afterPropertiesChangeEvent(evt) {
        var $this = $(this);
        var container = $this.data('gswatchpanel').container;
        if (evt.node.getParent() === container) {
            updateSwatch.call(this, evt.node);
        }
    };

    /** @type {IFSwatch} */
    var dragSwatch = null;

    function canDrop($this, target) {
        var data = $this.data('gswatchpanel');
        if (dragSwatch) {
            var targetSwatch = $(target).data('swatch');

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

    function insertSwatch (swatch, index) {
        var $this = $(this);
        var data = $this.data('gswatchpanel');

        var pattern = swatch.getProperty('pat');
        if (!pattern) {
            return;
        }

        // don't add if type is not right
        var types = data.types;
        if (types && types.length > 0) {
            var isCompatible = false;
            for (var i = 0; i < types.length; ++i) {
                if (pattern instanceof types[i]) {
                    isCompatible = true;
                    break;
                }
            }
            if (!isCompatible) {
                return;
            }
        }

        var insertBefore = null;

        if (typeof index === 'number') {
            if (data.options.nullSwatch) {
                index += 1;
            }
            insertBefore = $this.children('.swatch-block').eq(index);
        } else {
            if (swatch.getNext()) {
                $this.find('.swatch-block').each(function (index, element) {
                    var $element = $(element);
                    if ($element.data('swatch') === swatch.getNext()) {
                        insertBefore = $element;
                        return false;
                    }
                });
            }
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
                $this.trigger('swatchchange', swatch);
            });

        if (data.options.allowNameEdit) {
            block
                .gAutoEdit({
                    selector: '.swatch-name'
                })
                .on('submitvalue', function (evt, value) {
                    if (value && value.trim() !== '') {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(swatch, function () {
                            swatch.setProperty('name', value);
                        }, 'Rename Swatch');
                    }
                });
        }

        if (data.options.allowDrag || data.options.allowReorder) {
            block
                .attr('draggable', 'true')
                .on('dragstart', function (evt) {
                    var event = evt.originalEvent;
                    event.stopPropagation();

                    dragSwatch = $(this).data('swatch');
                    var pattern = dragSwatch.getProperty('pat');
                    if (!pattern) {
                        event.preventDefault();
                        return;
                    }

                    if (data.options.allowDrag) {
                        $this.trigger('swatchdragstart', dragSwatch);

                        // Setup our drag-event now
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData(IFPattern.MIME_TYPE, IFPattern.serialize(pattern));
                        event.dataTransfer.setDragImage(block.find('.swatch-preview > div')[0], data.options.previewWidth / 2, data.options.previewHeight / 2);
                    }
                })
                .on('dragend', function (evt) {
                    var event = evt.originalEvent;
                    event.stopPropagation();

                    dragSwatch = null;

                    if (data.options.allowDrag) {
                        var offset = $this.offset();
                        var width = $this.outerWidth();
                        var height = $this.outerHeight();
                        var x = event.pageX;
                        var y = event.pageY;

                        if (x <= offset.left || x >= offset.left + width ||
                            y <= offset.top || y >= offset.top + height) {
                            $this.trigger('swatchdragaway', swatch);
                        } else {
                            $this.trigger('swatchdragend', swatch);
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
                    var targetSwatch = $(this).data('swatch');

                    if (dragSwatch) {
                        if (data.options.allowReorder) {
                            if (data.container && dragSwatch.getParent() === data.container) {
                                var parent = dragSwatch.getParent();
                                var sourceIndex = parent.getIndexOfChild(dragSwatch);
                                var targetIndex = parent.getIndexOfChild(targetSwatch);

                                IFEditor.tryRunTransaction(parent, function () {
                                    parent.removeChild(dragSwatch);
                                    parent.insertChild(dragSwatch, sourceIndex < targetIndex ? targetSwatch.getNext() : targetSwatch);
                                }, 'Move Swatch');
                            }

                            $this.trigger('swatchmove', [dragSwatch, targetSwatch]);
                        } else if (data.options.allowDrop) {
                            $this.trigger('swatchdrop', [dragSwatch, targetSwatch]);
                        }
                    }
                });
        }

        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo($this);
        }

        updatePlaceholder($this);

        updateSwatch.call(this, swatch);
    };

    function updateSwatch (swatch) {
        var $this = $(this);

        $this.find('.swatch-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('swatch') === swatch) {
                $element
                    .find('.swatch-preview > div')
                    .css('background', IFPattern.asCSSBackground(swatch.getProperty('pat')));

                var name = swatch.getProperty('name');

                $element.attr('title', name);
                $element.find('.swatch-name').text(name);
                return false;
            }
        });
    };

    function removeSwatch (swatch) {
        var $this = $(this);
        var data = $this.data('gswatchpanel');

        $this.find('.swatch-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('swatch') === swatch) {
                $element.remove();

                if (swatch === data.selected) {
                    data.selected = null;
                    $this.trigger('swatchchange', null);
                }

                updatePlaceholder($this);
                return false;
            }
        });
    };

    function clear () {
        var $this = $(this);
        var remove = [];

        $this.find('.swatch-block').each(function (index, block) {
            var $block = $(block);
            if (!$block.hasClass('swatch-null')) {
                remove.push($block);
            }
        });

        for (var i = 0; i < remove.length; ++i) {
            remove[i].remove();
        }

        updatePlaceholder($this);
    };

    function updateFromContainer () {
        var $this = $(this);
        var data = $this.data('gswatchpanel');

        if (data.container) {
            for (var child = data.container.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFSwatch) {
                    insertSwatch.call(this, child);
                }
            }
        }
    };

    var methods = {
        init: function (options) {
            options = $.extend({
                // Whether to allow dragging of swatches
                allowDrag: true,
                // Whether to allow dropping of swatches
                allowDrop: false,
                // Whether to allow re-order of swatches or not
                allowReorder: true,
                // Whether to allow selecting or not
                allowSelect: true,
                // Allow editing the swatch name or not
                allowNameEdit: false,
                // The html code or Jquery for the null swatch, if set to null,
                // no null swatch will be provided for choosing
                nullSwatch: null,
                // The name of the null swatch if any
                nullName: null,
                // The action to be triggered for the null swatch
                nullAction: null,
                // The placeholder text if there's no content
                placeholder: null,
                // The width of the swatch preview
                previewWidth: 22,
                // The height of the swatch preview
                previewHeight: 22
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .addClass('g-swatch-panel')
                    .data('gswatchpanel', {
                        types: null,
                        selected: null,
                        options: options
                    })
                    .on('dragover', function (evt) {
                        var event = evt.originalEvent;
                        event.preventDefault();
                        event.stopPropagation();
                        event.dataTransfer.dropEffect = 'move';
                    })
                    .on('drop', function (evt) {
                        var data = $this.data('gswatchpanel');

                        var event = evt.originalEvent;
                        event.stopPropagation();

                        if (dragSwatch || !data.container || !data.container.getScene()) {
                            dragSwatch = null;
                            return;
                        }

                        var scene = data.container.getScene();
                        var sourcePattern = event.dataTransfer.getData(IFPattern.MIME_TYPE);
                        if (sourcePattern) {
                            var pattern = IFPattern.deserialize(sourcePattern);
                            if (pattern) {
                                methods.createSwatch.call(self, pattern);
                            }
                        }
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
                            if (options.nullAction) {
                                options.nullAction.call(self);
                            }
                        })
                        .appendTo($this);
                }

                updatePlaceholder($this);
            });
        },

        createSwatch: function (pattern) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');
            var scene = data.container.getScene();
            var sourceName = pattern instanceof IFColor ? pattern.toHumanString() : 'Swatch';
            vex.dialog.prompt({
                // TODO : I18N
                message: 'Enter a name for the new swatch:',
                value: sourceName,
                callback: function (name) {
                    if (!name) {
                        return;
                    }
                    if (name.trim() === '') {
                        name = sourceName;
                    }

                    // Add pattern as swatch
                    // TODO : I18N
                    IFEditor.tryRunTransaction(scene, function () {
                        var swatch = new IFSwatch();
                        swatch.setProperties(['name', 'pat'], [name, pattern]);
                        scene.getSwatchCollection().appendChild(swatch);
                    }, 'Add Swatch');
                }
            });
        },

        attach: function (container) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');

            methods.detach.call(this);

            data.container = container;

            if (container) {
                updateFromContainer.call(this);

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

            clear.call(this);

            return this;
        },

        types: function (types) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');

            if (!arguments.length) {
                return data.types;
            } else {
                data.types = types;
                clear.call(this);
                updateFromContainer.call(this);

                return this;
            }
        },

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