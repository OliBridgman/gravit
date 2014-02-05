(function (_) {

    /**
     * Pages Palette
     * @class EXPagesPalette
     * @extends EXPalette
     * @constructor
     */
    function EXPagesPalette() {
        EXPalette.call(this);
    };
    GObject.inherit(EXPagesPalette, EXPalette);

    EXPagesPalette.ID = "pages";
    EXPagesPalette.TITLE = new GLocale.Key(EXPagesPalette, "title");

    // -----------------------------------------------------------------------------------------------------------------
    // EXPagesPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class EXPagesPalette.DocumentState
     * @extends EXPalette.DocumentState
     * @constructor
     */
    EXPagesPalette.DocumentState = function (document) {
        EXPalette.DocumentState.call(this, document);

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('page-tree')
            .tree({
                data: [],
                dragAndDrop: true,
                openFolderDelay: 0,
                slide: false,
                onIsMoveHandle: function ($element) {
                    return ($element.is('.jqtree-title'));
                },
                onCreateLi: this._createListItem.bind(this),
                onCanMoveTo: this._canMoveTreeNode.bind(this)
            })
            .on('tree.click', this._clickTreeNode.bind(this))
            .on('tree.move', this._moveTreeNode.bind(this));

        // Create empty tree node mapping table
        this._treeNodeMap = [];
    };
    GObject.inherit(EXPagesPalette.DocumentState, EXPalette.DocumentState);

    /**
     * The container for the pages tree
     * @type {JQuery}
     * @private
     */
    EXPagesPalette.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXNode to Tree nodes
     * @type {Array<{{node: GXNode, treeId: String}}>}
     * @private
     */
    EXPagesPalette.DocumentState.prototype._treeNodeMap = null;

    /** @override */
    EXPagesPalette.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Subscribe to the document scene's events
        scene.addEventListener(GXNode.AfterInsertEvent, this._insertEvent, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._removeEvent, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent, this);
        scene.addEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent, this);

        // Subscribe to the editor's events
        editor.addEventListener(GXEditor.CurrentPageChangedEvent, this._currentPageChanged, this);

        // Add the root pageSet
        this._insertPageOrSet(scene.getPageSet());
    };

    /** @override */
    EXPagesPalette.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);
        scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent);

        // Unsubscribe from the editor's events
        editor.addEventListener(GXEditor.CurrentPageChangedEvent, this._currentPageChanged, this);
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._insertEvent = function (event) {
        if (event.node instanceof GXPageSet || event.node instanceof GXPage) {
            this._insertPageOrSet(event.node);
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._removeEvent = function (event) {
        if (event.node instanceof GXPageSet || event.node instanceof GXPage) {
            var _removeMapping = function (pageOrSet) {
                for (var i = 0; i < this._treeNodeMap.length; ++i) {
                    if (this._treeNodeMap[i].node === pageOrSet) {
                        this._treeNodeMap.splice(i, 1);
                        break;
                    }
                }

                // For pageSets we'll remove the subpage mappings, too
                if (pageOrSet instanceof GXPageSet) {
                    for (var page = pageOrSet.getFirstChild(); page !== null; page = page.getNext()) {
                        _removeMapping(page);
                    }
                }
            }.bind(this);

            // Remove Tree Node, first
            this._htmlTreeContainer.tree('removeNode', this._getTreeNode(event.node));

            // Remove all tree node mappings noew
            _removeMapping(event.node);
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._propertiesChangeEvent = function (event) {
        if (event.node instanceof GXPageSet || event.node instanceof GXPage) {
            this._updatePageOrSet(event.node);
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._flagChangeEvent = function (event) {
        if (event.node instanceof GXPageSet || event.node instanceof GXPage) {
            if (event.flag === GXNode.Flag.Active) {
                this._updatePageOrSet(event.node);
            }
        }
    };

    /**
     * @param {GXEditor.CurrentPageChangedEvent} event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._currentPageChanged = function (event) {
        if (event.previousPage) {
            this._updatePageOrSet(event.previousPage);
        }
        var currentPage = this.document.getEditor().getCurrentPage();
        if (currentPage) {
            this._updatePageOrSet(currentPage);
        }
    };

    /**
     * @param {GXPageSet|GXPage} pageOrSet
     * @private
     */
    EXPagesPalette.DocumentState.prototype._insertPageOrSet = function (pageOrSet) {
        // Only add page/pageSets which have a pageSet as parent
        if (pageOrSet.getParent() instanceof GXPageSet) {
            // Create an unique treeId for the new page/pageSet
            var treeId = gUtil.uuid();

            // Either insert before or append
            var nextNode = pageOrSet.getNext() ? this._getTreeNode(pageOrSet.getNext()) : null;
            if (nextNode) {
                this._htmlTreeContainer.tree('addNodeBefore', { id: treeId, pageOrSet: pageOrSet }, nextNode);
            } else {
                var parentTreeNode = pageOrSet.getParent() === pageOrSet.getScene().getPageSet() ? null : this._getTreeNode(pageOrSet.getParent());
                this._htmlTreeContainer.tree('appendNode', { id: treeId, pageOrSet: pageOrSet }, parentTreeNode);
            }

            // Insert the mapping
            this._treeNodeMap.push({
                node: pageOrSet,
                treeId: treeId
            });

            // Make an initial update
            this._updatePageOrSet(pageOrSet);
        }

        // For pageSets we'll add the subpages
        if (pageOrSet instanceof GXPageSet) {
            // We'll always add pages in reverse order to have the topmost page being on top
            for (var page = pageOrSet.getFirstChild(); page !== null; page = page.getNext()) {
                this._insertPageOrSet(page);
            }
        }
    };

    /**
     * @param {GXPageSet|GXPage} pageOrSet
     * @private
     */
    EXPagesPalette.DocumentState.prototype._updatePageOrSet = function (pageOrSet) {
        this._htmlTreeContainer.tree('updateNode', this._getTreeNode(pageOrSet), {
            label: pageOrSet.getProperty('title'),
            pageOrSet: pageOrSet
        });
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXPagesPalette.DocumentState.prototype._getTreeNodeId = function (node) {
        for (var i = 0; i < this._treeNodeMap.length; ++i) {
            if (this._treeNodeMap[i].node === node) {
                return this._treeNodeMap[i].treeId;
            }
        }
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXPagesPalette.DocumentState.prototype._getTreeNode = function (node) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(node));
    };

    /**
     * @private
     */
    EXPagesPalette.DocumentState.prototype._createListItem = function (node, li) {
        if (node.pageOrSet) {
            var pageOrSet = node.pageOrSet;
            var scene = this.document.getScene();
            var editor = this.document.getEditor();

            // Mark our list element selected if our page is the current page
            if (pageOrSet === editor.getCurrentPage()) {
                li.addClass('jqtree-selected');
            } else {
                li.removeClass('jqtree-selected');
            }

            // Attach an auto-input for editing the page's title
            li.find('.jqtree-title')
                .gAutoSize({
                    getter: function () {
                        return pageOrSet.getProperty('title');
                    },
                    setter: function (value) {
                        if (value && value.trim() !== "") {
                            pageOrSet.setProperty('title', value.trim());
                        }
                    }
                });

            // Hacky: Clicking on a li element should kill any active input editor
            li.on('click', function () {
                this._htmlTreeContainer.find('.jqtree-title').each(function () {
                    $(this).gAutoSize('finish');
                });
            }.bind(this));

            // Gather our container for insertions
            var container = li.find('div.jqtree-element');

            // Iterate parents up and collect information about them
            for (var p = pageOrSet.getParent(); p !== null; p = p.getParent()) {
                // Stop on root pageSet
                if (p === scene.getPageSet()) {
                    break;
                }

                // Append a hidden toggler to ensure proper spacing
                container.prepend($('<a class="jqtree_common jqtree-toggler" style="visibility: hidden;">▼</a>'));
            }

            //
            // Add folder marker if any
            //
            if (pageOrSet instanceof GXPageSet) {
                $('<span></span>')
                    .addClass('page-icon fa fa-folder-o')
                    // TODO : I18N
                    .attr('title', 'Page-Set')
                    .insertBefore(container.find('.jqtree-title'));
            }
        }
    };

    /**
     * @param event
     * @return {{parent: GXNode, before: GXNode, source: GXNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    EXPagesPalette.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                parent = target;
                before = target instanceof GXPageSet ? target.getFirstChild() : null;
            } else if (position === 'before') {
                parent = target.getParent();
                before = target;
            } else if (position == 'after') {
                parent = target.getParent();
                before = target.getNext();
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
     * @param event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        if (moved_node.pageOrSet && target_node.pageOrSet) {
            return this._getMoveTreeNodeInfo(position, moved_node.pageOrSet, target_node.pageOrSet) !== null;
        }
    };

    /**
     * @param event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.pageOrSet, event.move_info.target_node.pageOrSet);

        if (moveInfo) {
            // TODO : UNDO-GROUP HERE

            // Save and reset if page is current page
            var wasCurrentPage = moveInfo.source === this.document.getEditor().getCurrentPage();

            moveInfo.source.getParent().removeChild(moveInfo.source);
            moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);

            if (wasCurrentPage) {
                this.document.getEditor().setCurrentPage(moveInfo.source);
            }
        }
    };

    /**
     * @param event
     * @private
     */
    EXPagesPalette.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();
        if (event.node && event.node.pageOrSet && event.node.pageOrSet instanceof GXPage) {
            this.document.getEditor().setCurrentPage(event.node.pageOrSet);
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXPagesPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {JQuery}
     * @private
     */
    EXPagesPalette.prototype._htmlElement = null;

    /** @override */
    EXPagesPalette.prototype.getId = function () {
        return EXPagesPalette.ID;
    };

    /** @override */
    EXPagesPalette.prototype.getTitle = function () {
        return EXPagesPalette.TITLE;
    };

    /** @override */
    EXPagesPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_PROPERTIES;
    };

    /** @override */
    EXPagesPalette.prototype.getShortcut = function () {
        // TODO : Return correct shortcut
        return null;
    };

    /** @override */
    EXPagesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    EXPagesPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;
        this._htmlElement.append($('<div></div>')
            .addClass('page-tree-container'));

        //
        // Create Menu
        //
        var newPageItem = new GUIMenuItem();
        menu.addItem(newPageItem);
        // TODO : I18N
        newPageItem.setCaption('Add Page');
        newPageItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            newPageItem.setEnabled(!!gApp.getActiveDocument());
        }.bind(this));
        newPageItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            // TODO : FIX THIS, ASK USER FOR PAGE INPUT AND LET HIM CREATE MULTIPLE ONES!!
            var pageHeight = GXLength.parseLength("297mm").toPoint();
            var pageWidth = GXLength.parseLength("210mm").toPoint();
            var marginY = GXLength.parseLength("0.5in").toPoint();
            var marginX = GXLength.parseLength("0.5in").toPoint();
            var page = new GXPage(0, 0, pageWidth, pageHeight, null, marginX, marginY, marginX, marginY);


            this._addPageOrSet(page, gLocale.getValue(GXPage, "name"));
        }.bind(this));

        var newPageSetItem = new GUIMenuItem();
        menu.addItem(newPageSetItem);
        // TODO : I18N
        newPageSetItem.setCaption('Add Set');
        newPageSetItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            newPageSetItem.setEnabled(!!gApp.getActiveDocument());
        }.bind(this));
        newPageSetItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            this._addPageOrSet(new GXPageSet(), gLocale.getValue(GXPageSet, "name"));
        }.bind(this));

        var removeItem = new GUIMenuItem();
        menu.addItem(removeItem);
        // TODO : I18N
        removeItem.setCaption('Remove Pages');
        removeItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            removeItem.setEnabled(!!gApp.getActiveDocument());
        }.bind(this));
        removeItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            // TODO
        }.bind(this));

        menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));

        var lockToPageItem = new GUIMenuItem();
        menu.addItem(lockToPageItem);
        // TODO : I18N
        lockToPageItem.setCaption('Lock to Current Page');
        lockToPageItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            var editor = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor() : null;
            lockToPageItem.setEnabled(!!editor);
            lockToPageItem.setChecked(editor && editor.isLockedToCurrentPage());
        }.bind(this));
        lockToPageItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            var editor = gApp.getActiveDocument().getEditor();
            editor.setLockedToCurrentPage(!editor.isLockedToCurrentPage());
        }.bind(this));
    };

    /** @override */
    EXPagesPalette.prototype._createDocumentState = function (document) {
        return new EXPagesPalette.DocumentState(document);
    };

    /** @override */
    EXPagesPalette.prototype._activateDocumentState = function (state) {
        // Attach the state's tree to ourself
        state._htmlTreeContainer.appendTo(this._htmlElement.find('.page-tree-container'));
    };

    /** @override */
    EXPagesPalette.prototype._deactivateDocumentState = function (state) {
        // Detach the state's tree from ourself
        state._htmlTreeContainer.detach();
    };

    /**
     * @param {GXPage|GXPageSet} pageOrSet
     * @param {String} titlePrefix
     * @private
     */
    EXPagesPalette.prototype._addPageOrSet = function (pageOrSet, titlePrefix) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var currentPage = document.getEditor().getCurrentPage();

        var counter = 1;
        for (; ;) {
            var title = titlePrefix + '-' + counter.toString();
            if (!scene.querySingle(pageOrSet.getNodeName() + '[title="' + title + '"]')) {
                pageOrSet.setProperty('title', title);
                break;
            }
            counter++;
        }

        if (currentPage) {
            currentPage.getParent().insertChild(pageOrSet, currentPage);
        } else {
            document.getScene().getPageSet().appendChild(pageOrSet);
        }

        if (pageOrSet instanceof GXPage) {
            document.getEditor().setCurrentPage(pageOrSet);
        }
    };

    /** @override */
    EXPagesPalette.prototype.toString = function () {
        return "[Object EXPagesPalette]";
    };

    _.EXPagesPalette = EXPagesPalette;
})(this);