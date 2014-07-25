(function (_) {

    var dragPage = null;

    function canDropPage(target) {
        if (dragPage) {
            var targetPage = $(target).data('page');

            if (targetPage && (targetPage !== dragPage || ifPlatform.modifiers.shiftKey)) {
                return dragPage.getParent() === targetPage.getParent();
            }
        }

        return false;
    };

    /**
     * The pages & layers sidebar
     * @class GPagesLayersSidebar
     * @extends GSidebar
     * @constructor
     */
    function GPagesLayersSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GPagesLayersSidebar, GSidebar);

    GPagesLayersSidebar.ID = "pages-layers";
    GPagesLayersSidebar.TITLE = new IFLocale.Key(GPagesLayersSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pagesPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageDeleteControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layersTree = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GPagesLayersSidebar.prototype._layersTreeNodeMap = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerDeleteControl = null;

    /** @override */
    GPagesLayersSidebar.prototype.getId = function () {
        return GPagesLayersSidebar.ID;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getTitle = function () {
        return GPagesLayersSidebar.TITLE;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-bars"></span>';
    };

    /** @override */
    GPagesLayersSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        // -- Pages --
        this._pagesPanel = $('<div></div>')
            .addClass('pages');

        this._pageAddControl =
            $('<button></button>')
                .addClass('fa fa-plus')
                // TODO : I18N
                .attr('title', 'Add Page')
                .on('click', function () {
                    gApp.executeAction(GAddPageAction.ID);
                }.bind(this));

        this._pageDeleteControl =
            $('<button></button>')
                .addClass('fa fa-trash-o')
                .css('margin-left', '5px')
                // TODO : I18N
                .attr('title', 'Delete Page')
                .on('click', function () {
                    gApp.executeAction(GDeletePageAction.ID);
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Pages',
                content: this._pagesPanel,
                controls: [
                    this._pageAddControl,
                    this._pageDeleteControl
                ]
            })
            .appendTo(htmlElement);

        // -- Layers --
        this._layersTree = $('<div></div>')
            .addClass('layers')
            .tree({
                data: [],
                dragAndDrop: true,
                openFolderDelay: 500,
                closedIcon: $('<span class="fa fa-caret-right"></span>'),
                openedIcon: $('<span class="fa fa-caret-down"></span>'),
                slide: false,
                selectable: false,
                onIsMoveHandle: function ($element) {
                    return ($element.is('.jqtree-title'));
                },
                onCreateLi: this._createLayerTreeItem.bind(this),
                onCanMoveTo: this._canMoveLayerTreeNode.bind(this)
            })
            .on('tree.open', function (evt) {
                if (evt.node.layerOrItem) {
                    evt.node.layerOrItem.setFlag(IFNode.Flag.Expanded);
                }
            }.bind(this))
            .on('tree.close', function (evt) {
                if (evt.node.layerOrItem) {
                    evt.node.layerOrItem.removeFlag(IFNode.Flag.Expanded);
                }
            }.bind(this))
            .on('tree.click', this._clickLayerTreeNode.bind(this))
            .on('tree.move', this._moveLayerTreeNode.bind(this));

        this._layerAddControl =
            $('<button></button>')
                .addClass('fa fa-plus')
                // TODO : I18N
                .attr('title', 'Add Layer')
                .on('click', function () {
                    gApp.executeAction(GAddLayerAction.ID);
                }.bind(this));

        this._layerDeleteControl =
            $('<button></button>')
                .addClass('fa fa-trash-o')
                .css('margin-left', '5px')
                // TODO : I18N
                .attr('title', 'Delete Layer')
                .on('click', function () {
                    gApp.executeAction(GDeleteLayerAction.ID);
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Layers',
                content: this._layersTree,
                controls: [
                    this._layerAddControl,
                    this._layerDeleteControl
                ]
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GPagesLayersSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._clear = function () {
        // first clear layers, then pages
        this._clearLayers();
        this._clearPages();
    };

    /** @private */
    GPagesLayersSidebar.prototype._clearPages = function () {
        this._pagesPanel.empty();
        if (this._document) {
            var scene = this._document.getScene();
            for (var child = scene.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFPage) {
                    this._insertPage(child);
                }
            }
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._insertPage = function (page) {
        var insertBefore = null;
        if (page.getNext()) {
            this._pagesPanel.find('.page-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('page') === page.getNext()) {
                    insertBefore = $element;
                    return false;
                }
            });
        }

        var block = $('<div></div>')
            .addClass('page-block')
            .data('page', page)
            .attr('draggable', 'true')
            .append($('<div></div>')
                .addClass('page-visibility')
                // TODO : I18N
                .attr('title', 'Toggle Page Visibility')
                .on('click', function (evt) {
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('visible', !page.getProperty('visible'));
                    }, 'Toggle Page Visibility');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .append($('<div></div>')
                .addClass('page-lock')
                // TODO : I18N
                .attr('title', 'Toggle Page Lock')
                .on('click', function (evt) {
                    // TODO : I18N
                    IFEditor.tryRunTransaction(page, function () {
                        page.setProperty('locked', !page.getProperty('locked'));
                    }, 'Toggle Page Lock');
                })
                .append($('<span></span>')
                    .addClass('fa fa-fw')))
            .append($('<div></div>')
                .addClass('page-name')
                .gAutoEdit({
                })
                .on('submitvalue', function (evt, value) {
                    if (value && value.trim() !== '') {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(page, function () {
                            page.setProperty('name', value);
                        }, 'Rename Page');
                    }
                }))
            .on('mousedown', function () {
                // TODO
            })
            .on('click', function () {
                page.getScene().setActivePage(page);
            })
            .on('dragstart', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                dragPage = $this.data('page');

                // Setup our drag-event now
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', 'dummy_data');

                // Add drag overlays
                $this.closest('.pages').find('.page-block').each(function (index, element) {
                    $(element)
                        .append($('<div></div>')
                            .addClass('drag-overlay')
                            .on('dragenter', function (evt) {
                                if (canDropPage(this.parentNode)) {
                                    $(this).parent().addClass('drop');
                                }
                            })
                            .on('dragleave', function (evt) {
                                if (canDropPage(this.parentNode)) {
                                    $(this).parent().removeClass('drop');
                                }
                            })
                            .on('dragover', function (evt) {
                                var event = evt.originalEvent;
                                if (canDropPage(this.parentNode)) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    event.dataTransfer.dropEffect = 'move';
                                }
                            })
                            .on('drop', function (evt) {
                                var $this = $(this);
                                var $parent = $(this.parentNode);

                                $parent.removeClass('drop');

                                // Remove drag overlays
                                $parent.closest('.pages').find('.drag-overlay').remove();

                                var targetPage = $parent.data('page');
                                if (dragPage && dragPage.getParent() === targetPage.getParent()) {
                                    var parent = dragPage.getParent();
                                    var sourceIndex = parent.getIndexOfChild(dragPage);
                                    var targetIndex = parent.getIndexOfChild(targetPage);

                                    // TODO : I18N
                                    IFEditor.tryRunTransaction(parent, function () {
                                        if (ifPlatform.modifiers.shiftKey) {
                                            // Clone page
                                            var insertPos = dragPage.getScene().getPageInsertPosition();
                                            var pageClone = dragPage.clone();
                                            pageClone.setProperties(['x', 'y', 'name'], [insertPos.getX(), insertPos.getY(), pageClone.getProperty('name') + '-copy']);
                                            parent.insertChild(pageClone, sourceIndex < targetIndex ? targetPage.getNext() : targetPage);
                                        } else {
                                            // Move page
                                            parent.removeChild(dragPage);
                                            parent.insertChild(dragPage, sourceIndex < targetIndex ? targetPage.getNext() : targetPage);
                                        }
                                    }, ifPlatform.modifiers.shiftKey ? 'Duplicate Page' : 'Move Page');
                                }
                            }));
                });
            })
            .on('dragend', function (evt) {
                var $this = $(this);

                var event = evt.originalEvent;
                event.stopPropagation();

                // Remove drag overlays
                $this.closest('.pages').find('.drag-overlay').remove();

                dragPage = null;
            });

        if (insertBefore && insertBefore.length > 0) {
            block.insertBefore(insertBefore);
        } else {
            block.appendTo(this._pagesPanel);
        }

        this._updatePage(page);
    };

    /** @private */
    GPagesLayersSidebar.prototype._updatePage = function (page) {
        var pageVisible = page.getProperty('visible');
        var pageLocked = page.getProperty('locked');

        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.toggleClass('g-active', page.hasFlag(IFNode.Flag.Active));
                $element.toggleClass('g-selected', page.hasFlag(IFNode.Flag.Selected));

                $element.find('.page-visibility')
                    .toggleClass('page-default', pageVisible)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-eye', pageVisible)
                    .toggleClass('fa-eye-slash', !pageVisible);

                $element.find('.page-lock')
                    .toggleClass('page-default', !pageLocked)
                    /*!!*/
                    .find('> span')
                    .toggleClass('fa-lock', pageLocked)
                    .toggleClass('fa-unlock', !pageLocked);

                $element.find('.page-name').text(page.getProperty('name'));
                return false;
            }
        });
    };

    /** @private */
    GPagesLayersSidebar.prototype._removePage = function (page) {
        this._pagesPanel.find('.page-block').each(function (index, element) {
            var $element = $(element);
            if ($element.data('page') === page) {
                $element.remove();
                return false;
            }
        });
    };

    /** @private */
    GPagesLayersSidebar.prototype._clearLayers = function () {
        // Clear layer tree and mark root opened afterwards (!!)
        this._layersTree.tree('loadData', []);
        this._layersTree.tree('getTree').is_open = true;

        this._layersTreeNodeMap = [];

        if (this._document) {
            var activePage = this._document.getScene().getActivePage();
            if (activePage) {
                for (var child = activePage.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFLayer) {
                        this._insertLayer(child);
                    }
                }
            }
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._insertLayer = function (layerOrItem) {
        // Create an unique treeId for the new tree node
        var treeId = ifUtil.uuid();

        // Either insert before or append
        var nextNode = layerOrItem.getNext() ? this._getLayerTreeNode(layerOrItem.getNext()) : null;
        if (nextNode) {
            this._layersTree.tree('addNodeBefore', { id: treeId, layerOrItem: layerOrItem }, nextNode);
        } else {
            var parent = layerOrItem.getParent();
            var parentTreeNode = !parent || parent instanceof IFPage ? null : this._getLayerTreeNode(parent);
            this._layersTree.tree('appendNode', { id: treeId, layerOrItem: layerOrItem }, parentTreeNode);
        }

        // Insert the mapping
        this._layersTreeNodeMap.push({
            node: layerOrItem,
            treeId: treeId
        });

        // Make an initial update
        this._updateLayer(layerOrItem);

        // Iterate children and add them as well
        if (layerOrItem.hasMixin(IFNode.Container)) {
            for (var child = layerOrItem.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFLayer || child instanceof IFItem) {
                    this._insertLayer(child);
                }
            }
        }

        // Gather the new treenode for our node
        var treeNode = this._getLayerTreeNode(layerOrItem);

        // Select if item and selected
        if (layerOrItem instanceof IFItem && layerOrItem.hasFlag(IFNode.Flag.Selected)) {
            this._layersTree.tree('selectNode', treeNode);
        }

        // Open entry if collapsed
        if (layerOrItem.hasFlag(IFNode.Flag.Expanded)) {
            this._layersTree.tree('openNode', treeNode, false);
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._updateLayer = function (layerOrItem) {
        // Gather a tree node for the item
        var treeNode = this._getLayerTreeNode(layerOrItem);

        if (treeNode) {
            // Call an update for the node
            var label = layerOrItem.getLabel();

            // Mark draft layers
            if (layerOrItem instanceof IFLayer && layerOrItem.getProperty('tp') === IFLayer.Type.Draft) {
                label = '*' + label;
            }

            this._layersTree.tree('updateNode', treeNode, label);
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._removeLayer = function (layerOrItem) {
        var treeNode = this._getLayerTreeNode(layerOrItem);
        if (treeNode) {
            this._layersTree.tree('removeNode', treeNode);

            // Visit to remove each mapping as well
            layerOrItem.accept(function (node) {
                if (node instanceof IFLayer || node instanceof IFItem) {
                    for (var i = 0; i < this._layersTreeNodeMap.length; ++i) {
                        if (this._layersTreeNodeMap[i].node === node) {
                            this._layersTreeNodeMap.splice(i, 1);
                            break;
                        }
                    }
                }
            }.bind(this));
        }
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof IFPage) {
            this._insertPage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            var activePage = this._document.getScene().getActivePage();
            if (event.node.getPage() === activePage) {
                this._insertLayer(event.node);
            }
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFPage) {
            this._removePage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            this._removeLayer(event.node);

            // If parent has no more children then update it accordingly
            var parent = event.node.getParent();

            if (parent instanceof IFLayer || parent instanceof IFItem) {
                var hasChildren = false;
                for (var child = parent.getFirstChild(); child !== null; child = child.getNext()) {
                    if ((child instanceof IFLayer || child instanceof IFItem) && child !== event.node) {
                        hasChildren = true;
                        break;
                    }
                }

                if (!hasChildren) {
                    parent.removeFlag(IFNode.Flag.Expanded);
                    this._updateLayer(parent);
                }
            }
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFPage) {
            this._updatePage(event.node);
        } else if (event.node instanceof IFLayer || event.node instanceof IFItem) {
            this._updateLayer(event.node);
        }
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} event
     * @private
     */
    GPagesLayersSidebar.prototype._afterFlagChange = function (event) {
        if (event.node instanceof IFPage && (event.flag === IFNode.Flag.Active || event.flag === IFNode.Flag.Selected)) {
            this._pagesPanel.find('.page-block').each(function (index, element) {
                var $element = $(element);
                if ($element.data('page') === event.node) {
                    $element.toggleClass(event.flag === IFNode.Flag.Active ? 'g-active' : 'g-selected', event.set);
                }
            });

            if (event.flag === IFNode.Flag.Active) {
                // Page activeness change requires clearing layers
                this._clearLayers();
            }
        } else if (event.node instanceof IFLayer && (event.flag === IFNode.Flag.Active || event.flag === IFNode.Flag.Selected || event.flag === IFNode.Flag.Expanded)) {
            this._updateLayer(event.node);
        } else if (event.node instanceof IFItem && event.flag === IFNode.Flag.Selected) {
            this._updateLayer(event.node);
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._clickLayerTreeNode = function (evt) {
        if (evt.node.layerOrItem) {
            if (evt.node.layerOrItem instanceof IFLayer) {
                this._document.getScene().setActiveLayer(evt.node.layerOrItem);
            } else if (evt.node.layerOrItem instanceof IFItem) {
                if (ifPlatform.modifiers.shiftKey || !evt.node.layerOrItem.hasFlag(IFNode.Flag.Selected)) {
                    // Add element to selection
                    this._document.getEditor().updateSelection(ifPlatform.modifiers.shiftKey, [evt.node.layerOrItem]);
                } else if (evt.node.layerOrItem.hasFlag(IFNode.Flag.Selected)) {
                    // Clear selection leaving only the one element
                    this._document.getEditor().clearSelection([evt.node.layerOrItem]);
                }
            }
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._createLayerTreeItem = function (node, li) {
        if (node.layerOrItem) {
            var layerOrItem = node.layerOrItem;

            // Iterate parents up and collect some information
            var itemLevel = 0;
            var parentHidden = false;
            var parentLocked = false;
            var parentOutlined = false;

            for (var p = layerOrItem.getParent(); p !== null; p = p.getParent()) {
                // Stop on page root
                if (p instanceof IFPage) {
                    break;
                }

                // Query information
                parentHidden = p.getProperty('visible') === false || parentHidden;
                parentLocked = p.getProperty('locked') === true || parentLocked;

                if (p instanceof IFLayer) {
                    parentOutlined = p.getProperty('otl') === true || parentOutlined;
                }

                itemLevel += 1;
            }

            var isHidden = parentHidden || layerOrItem.getProperty('visible') === false;
            var isLocked = parentLocked || layerOrItem.getProperty('locked') === true;
            var isOutlined = parentOutlined || (layerOrItem instanceof IFLayer && layerOrItem.getProperty('otl'));

            // Gather a reference to the element container
            var container = li.find('div.jqtree-element');
            var title = container.find('> .jqtree-title');

            // First, we'll make our title editable and toogle active/selected
            container
                .toggleClass('g-active', layerOrItem.hasFlag(IFNode.Flag.Active))
                .toggleClass('g-selected', layerOrItem.hasFlag(IFNode.Flag.Selected))
                .gAutoEdit({
                    selector: '> .jqtree-title'
                })
                .on('submitvalue', function (evt, value) {
                    // TODO : I18M
                    if (value && value.trim() !== '') {
                        IFEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('name', value);
                        }, 'Rename Layer/Item');
                    }
                });

            // Prepend level spacers
            for (var i = 0; i < itemLevel; ++i) {
                $('<span></span>')
                    .addClass('layer-spacer')
                    .prependTo(container);
            }

            // Figure an icon for the item if any
            var icon = null;
            if (layerOrItem instanceof IFLayer) {
                icon = layerOrItem.hasFlag(IFNode.Flag.Expanded) ? 'folder-open' : 'folder';
            } else if (layerOrItem instanceof IFShape) {
                if (layerOrItem instanceof IFText) {
                    icon = 'font';
                } else if (layerOrItem instanceof IFImage) {
                    icon = 'image';
                } else if (layerOrItem instanceof IFEllipse) {
                    icon = 'circle';
                } else if (layerOrItem instanceof IFRectangle) {
                    icon = 'stop';
                } else if (layerOrItem instanceof IFPath) {
                    icon = 'pencil';
                } else if (layerOrItem instanceof IFPolygon) {
                    icon = 'star';
                }
            }

            if (icon) {
                $('<span></span>')
                    .addClass('layer-icon fa fa-' + icon)
                    .insertBefore(title);
            }

            // Prepend locked and visibility markers
            $('<span></span>')
                .addClass('layer-lock fa fa-fw fa-' + (isLocked ? 'lock' : 'unlock'))
                .toggleClass('layer-default', !isLocked)
                // TODO : I18N
                .attr('title', 'Toggle Lock')
                .on('click', function () {
                    if (!parentLocked) {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('locked', !layerOrItem.getProperty('locked'));
                        }, 'Toggle Layer Locked');
                    }
                })
                .prependTo(container);

            var visibleContainer = $('<span></span>')
                .addClass('layer-visibility fa fa-' + (isHidden ? 'eye-slash' : 'eye'))
                .toggleClass('layer-default', !isHidden)
                // TODO : I18N
                .attr('title', 'Toggle Visibility')
                .on('click', function () {
                    if (!parentHidden) {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('visible', !layerOrItem.getProperty('visible'));
                        }, 'Toggle Layer Visibility');
                    }
                })
                .prependTo(container);


            // Add highlighter if item
            if (layerOrItem instanceof IFItem) {
                visibleContainer
                    .on('mouseenter', function (evt) {
                        if (!layerOrItem.hasFlag(IFElement.Flag.Hidden)) {
                            layerOrItem.setFlag(IFNode.Flag.Highlighted);
                        }
                    })
                    .on('mouseleave', function (evt) {
                        if (!layerOrItem.hasFlag(IFElement.Flag.Hidden)) {
                            layerOrItem.removeFlag(IFNode.Flag.Highlighted);
                        }
                    });
            }

            // Append outline & color for layers
            if (layerOrItem instanceof IFLayer) {
                // Don't add outline for guide layers
                if (layerOrItem.getProperty('tp') !== IFLayer.Type.Guide) {
                    $('<span></span>')
                        .addClass('layer-outline fa fa-' + (isOutlined ? 'circle-o' : 'circle'))
                        .toggleClass('layer-default', !isOutlined)
                        // TODO : I18N
                        .attr('title', 'Toggle Outline')
                        .on('click', function () {
                            if (!parentHidden) {
                                // TODO : I18N
                                IFEditor.tryRunTransaction(layerOrItem, function () {
                                    layerOrItem.setProperty('otl', !layerOrItem.getProperty('otl'));
                                }, 'Toggle Layer Outline');
                            }
                        })
                        .appendTo(container);
                }

                $('<span></span>')
                    .addClass('layer-color')
                    .gColorButton({
                        scene: this._document.getScene(),
                        immediateClose: true
                    })
                    .gColorButton('value', layerOrItem.getProperty('cls'))
                    .on('colorchange', function (evt, color) {
                        // TODO : I18N
                        IFEditor.tryRunTransaction(layerOrItem, function () {
                            var myColor = layerOrItem.getProperty('cls');
                            layerOrItem.setProperty('cls', color);

                            // Apply color to all child layers recursively that
                            // do have the same color as our layer
                            layerOrItem.acceptChildren(function (node) {
                                if (node instanceof IFLayer) {
                                    var childColor = node.getProperty('cls');
                                    if (IFColor.equals(childColor, myColor)) {
                                        node.setProperty('cls', color);
                                    }
                                }
                            });
                        }, 'Change Layer Color');
                    })
                    .appendTo(container);
            }
        }
    };

    /** @private */
    GPagesLayersSidebar.prototype._canMoveLayerTreeNode = function (moved_node, target_node, position) {
        return this._getLayerTreeNodeMoveInfo(position, moved_node.layerOrItem, target_node.layerOrItem) !== null;
    };

    /** @private */
    GPagesLayersSidebar.prototype._moveLayerTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getLayerTreeNodeMoveInfo(event.move_info.position,
            event.move_info.moved_node.layerOrItem, event.move_info.target_node.layerOrItem);

        if (moveInfo) {
            // TODO : I18N
            IFEditor.tryRunTransaction(this._document.getScene(), function () {
                moveInfo.source.getParent().removeChild(moveInfo.source);
                moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);

                // Having dragged something inside requires to expand parent(s) and update 'em'
                var rootParent = null;
                for (var parent = moveInfo.parent; parent !== null; parent = parent.getParent()) {
                    if (parent instanceof IFPage) {
                        break;
                    }

                    parent.setFlag(IFNode.Flag.Expanded);
                    rootParent = parent;
                }

                this._updateLayer(rootParent);
            }.bind(this), 'Move Layer/Item');
        }
    };

    /**
     * @param event
     * @return {{parent: IFNode, before: IFNode, source: IFNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    GPagesLayersSidebar.prototype._getLayerTreeNodeMoveInfo = function (position, source, target) {
        target = target || this._document.getScene().getActivePage();

        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                parent = target;
                before = target.getFirstChild();
            } else if (position === 'before') {
                if (target instanceof IFPage) {
                    parent = target;
                    before = target.getFirstChild();
                } else {
                    parent = target.getParent();
                    before = target;
                }
            } else if (position == 'after') {
                if (target instanceof IFPage) {
                    parent = target;
                    before = null;
                } else {
                    parent = target.getParent();
                    before = target.getNext();
                }
            }

            if (before === source) {
                // we can not insert before ourself
                return null;
            }

            if (source.validateInsertion(parent, before)) {
                return {
                    parent: parent,
                    before: before,
                    source: source
                };
            }
        }

        return null;
    };

    /**
     * @param {IFNode} node
     * @return {*}
     * @private
     */
    GPagesLayersSidebar.prototype._getLayerTreeNodeId = function (node) {
        if (this._layersTreeNodeMap) {
            for (var i = 0; i < this._layersTreeNodeMap.length; ++i) {
                if (this._layersTreeNodeMap[i].node === node) {
                    return this._layersTreeNodeMap[i].treeId;
                }
            }
        }
    };

    /**
     * @param {IFNode} node
     * @return {*}
     * @private
     */
    GPagesLayersSidebar.prototype._getLayerTreeNode = function (node) {
        return this._layersTree.tree('getNodeById', this._getLayerTreeNodeId(node));
    };

    /** @override */
    GPagesLayersSidebar.prototype.toString = function () {
        return "[Object GPagesLayersSidebar]";
    };

    _.GPagesLayersSidebar = GPagesLayersSidebar;
})(this);