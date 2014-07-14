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
    }

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
            methods.updateSwatch.call(this, evt.node);
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
                // Allow editing the swatch name or not
                allowNameEdit: false,
                // The html code or Jquery for the null swatch, if set to null,
                // no null swatch will be provided for choosing
                nullSwatch: null,
                // The name of the null swatch if any
                nullName: null,
                // The placeholder text if there's no content
                placeholder: null,
                // The width of the swatch preview
                previewWidth: 20,
                // The height of the swatch preview
                previewHeight: 20
            }, options);

            return this.each(function () {
                var self = this;
                var $this = $(this)
                    .addClass('g-swatch-panel')
                    .data('gswatchpanel', {
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
                            var pattern = IFPattern.parsePattern(sourcePattern);
                            if (pattern) {
                                // Make sure there's no such swatch, yet
                                var swatches = scene.getSwatchCollection();
                                for (var node = swatches.getFirstChild(); node !== null; node = node.getNext()) {
                                    if (node instanceof IFSwatch) {
                                        if (IFPattern.equals(pattern, node.getProperty('pat'))) {
                                            return; // leave here, patterns are equal
                                        }
                                    }
                                }

                                // Ask for a name
                                // TODO : I18N
                                var sourceName = pattern instanceof IFColor ? pattern.asString() : 'pattern';
                                var name = prompt('Enter a name for the new swatch:', sourceName);
                                if (name === null) {
                                    return; // leave here, user has canceled
                                }
                                if (name.trim() === '') {
                                    name = sourceName;
                                }

                                // Add pattern as swatch
                                // TODO : I18N
                                IFEditor.tryRunTransaction(scene, function () {
                                    var swatch = new IFSwatch();
                                    swatch.setProperties(['name', 'pat'], [name, pattern]);
                                    swatches.appendChild(swatch);
                                }, 'Add Swatch');
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
                            $this.data('gswatchpanel').selected = null;
                            updateSelectedSwatch($this, null);
                            self.trigger('swatchchange', null);
                        })
                        .appendTo($this);
                }

                updatePlaceholder($this);
            });
        },

        insertSwatch: function (swatch, index) {
            var $this = $(this);
            var data = $this.data('gswatchpanel');
            var self = this;

            // don't add if type is not right
            var types = data.options.types;
            if (types !== null && types.length > 0 && types.indexOf(swatch.getPatternType()) < 0) {
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
                    self.trigger('swatchchange', swatch);
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
                            self.trigger('swatchdragstart', dragSwatch);

                            // Setup our drag-event now
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(IFPattern.MIME_TYPE, IFPattern.asString(pattern));
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
                                self.trigger('swatchdragaway', swatch);
                            } else {
                                self.trigger('swatchdragend', swatch);
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

                                self.trigger('swatchmove', [dragSwatch, targetSwatch]);
                            } else if (data.options.allowDrop) {
                                self.trigger('swatchdrop', [dragSwatch, targetSwatch]);
                            }
                        }
                    });
            }

            var insertBefore = index >= 0 ? $this.children('.swatch-block').eq(index) : null;
            if (insertBefore && insertBefore.length > 0) {
                block.insertBefore(insertBefore);
            } else {
                block.appendTo($this);
            }

            updatePlaceholder($this);

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
                        .css('background', IFPattern.asCSSBackground(swatch.getProperty('pat')));

                    var name = swatch.getProperty('name');

                    $element.attr('title', name);
                    $element.find('.swatch-name').text(name);
                    return false;
                }
            });
        },

        removeSwatch: function (swatch) {
            var self = this;
            var $this = $(this);
            var data = $this.data('gswatchpanel');

            $this.find('.swatch-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('swatch') === swatch) {
                    $element.remove();

                    if (swatch === data.selected) {
                        data.selected = null;
                        self.trigger('swatchchange', null);
                    }

                    updatePlaceholder($this);
                    return false;
                }
            });
        },

        clear: function () {
            var $this = $(this);
            var data = $this.data('gswatchpanel');
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