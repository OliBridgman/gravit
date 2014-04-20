(function (_) {

    /**
     * Object Palette
     * @class EXPropertiesPalette
     * @extends EXPalette
     * @constructor
     */
    function EXPropertiesPalette() {
        EXPalette.call(this);
        this._propertyPanels = [];
    }

    GObject.inherit(EXPropertiesPalette, EXPalette);

    EXPropertiesPalette.ID = "properties";
    EXPropertiesPalette.TITLE = new GLocale.Key(EXPropertiesPalette, "title");

    // -----------------------------------------------------------------------------------------------------------------
    // EXPropertiesPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class EXPropertiesPalette.DocumentState
     * @extends EXPalette.DocumentState
     * @constructor
     */
    EXPropertiesPalette.DocumentState = function (document, propertyPanels, objectTree) {
        EXPalette.DocumentState.call(this, document);
        this._propertyPanels = propertyPanels;
        this._objectTree = objectTree;
    };
    GObject.inherit(EXPropertiesPalette.DocumentState, EXPalette.DocumentState);

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: EXProperties}}>}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._propertyPanels = null;

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.activate = function () {
        var editor = this.document.getEditor();

        // Subscribe to the editor's events
        editor.addEventListener(GXEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Update from current selection
        this._updateFromSelection();
    };

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.deactivate = function () {
        var editor = this.document.getEditor();

        // Unsubscribe from the editor's events
        editor.addEventListener(GXEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Clear properties panels
        this._updateFromSelection();
    };

    /**
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._updateFromSelection = function () {
        var nodes = this.document.getEditor().getSelection();

        // If there's no selection, select the scene
        if (!nodes || nodes.length === 0) {
            nodes = [this.document.getScene()];
        }


        this._objectTree.tree('selectNode', null);
        this._objectTree.tree('loadData', []);
        this._objectTree.tree('appendNode', { id: 'ABC', label: nodes[0].getNodeNameTranslated() });

        // Iterate attributes
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXElement && nodes[i].hasMixin(GXElement.Attributes)) {
                this._insertAttributesNode(nodes[i].getAttributes());
            }
        }

        var lastVisiblePropertyPanel = null;
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !nodes || nodes.length === 0 ? false : propertyPanel.properties.updateFromNodes(this.document, nodes);

            propertyPanel.panel.removeClass('last-visible');
            if (available) {
                propertyPanel.category.css('display', '');

                if (propertyPanel.category.attr('data-expanded') == 'true') {
                    propertyPanel.panel.css('display', '');
                }

                propertyPanel.panel.attr('data-available', 'true');

                lastVisiblePropertyPanel = propertyPanel;
            } else {
                propertyPanel.category.css('display', 'none');
                propertyPanel.panel.css('display', 'none');
                propertyPanel.panel.attr('data-available', 'false');
            }
        }

        if (lastVisiblePropertyPanel) {
            lastVisiblePropertyPanel.panel.addClass('last-visible');
        }
    };

    EXPropertiesPalette.DocumentState.prototype._insertAttributesNode = function (attributes) {
        var canAdd = true;
        var forceAddChildren = false;

        // Avoid to add root attributes but force children
        if (attributes.getParent() instanceof GXElement) {
            canAdd = false;
            forceAddChildren = true;
        }

        /*
         if (canAdd && this._elements.length > 1) {
         // For multiple element selection we'll only pick up
         // render attributes and only on root and only one of a
         // type (first one found).
         // TODO : Take care on attributes references

         if (!(attributes instanceof IFRenderAttribute)) {
         canAdd = false;
         } else {
         var treeRoot = this._htmlTreeContainer.tree('getTree');
         // Iterate existing attributes nodes on root
         if (treeRoot && treeRoot.children) {
         for (var i = 0; i < treeRoot.children.length; i++) {
         var node = treeRoot.children[i];
         if (node.attributes.constructor === attributes.constructor) {
         canAdd = false;
         break;
         }
         }
         }
         }
         }
         */

        if (canAdd) {
            // Try to find the parent node and insertion position for the attributes
            // TODO
            var parentTreeNode = null;

            // Create an unique treeId for the new attributes
            var treeId = gUtil.uuid();

            // Apend the node & gather it's reference
            this._objectTree.tree('appendNode', { id: treeId, attributes: attributes, label: attributes.getNodeNameTranslated() }, parentTreeNode);
            var treeNode = this._objectTree.tree('getNodeById', treeId);

            // Insert the mapping
            //this._treeStyleMap.push({attributes: attributes, treeId: treeId});

            // If attributes is selected then mark it selected in tree and update
            /*
             if (attributes.hasFlag(GXNode.Flag.Selected)) {
             this._htmlTreeContainer.tree('selectNode', treeNode);
             this._htmlTreeContainer.tree('scrollToNode', treeNode);
             this._updateAttributesProperties();
             }
             */
        }

        // Add children (if any)
        if ((canAdd || forceAddChildren) && attributes.hasMixin(GXNode.Container)) {
            for (var child = attributes.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFAttribute) {
                    this._insertAttributesNode(child);
                }
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXPropertiesPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {JQuery}
     * @private
     */
    EXPropertiesPalette.prototype._htmlElement = null;

    /**
     * The container for the object tree
     * @type {JQuery}
     * @private
     */
    EXPropertiesPalette.prototype._objectTree = null;

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: EXProperties}}>}
     * @private
     */
    EXPropertiesPalette.prototype._propertyPanels = null;

    /** @override */
    EXPropertiesPalette.prototype.getId = function () {
        return EXPropertiesPalette.ID;
    };

    /** @override */
    EXPropertiesPalette.prototype.getTitle = function () {
        return EXPropertiesPalette.TITLE;
    };

    /** @override */
    EXPropertiesPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_PROPERTIES;
    };

    /**
     * @override
     */
    EXPropertiesPalette.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'F3'];
    };

    /** @override */
    EXPropertiesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    EXPropertiesPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        // Initiate our tree container widget
        this._objectTree = $('<div></div>')
            .addClass('object-tree')
            .tree({
                data: [],
                dragAndDrop: true,
                openFolderDelay: 0,
                slide: false,
                onIsMoveHandle: function ($element) {
                    return ($element.is('.jqtree-title'));
                }/*,
                 onCreateLi: this._createListItem.bind(this),
                 onCanMoveTo: this._canMoveTreeNode.bind(this)*/
            })
            //.on('tree.click', this._clickTreeNode.bind(this))
            //.on('tree.move', this._moveTreeNode.bind(this))
            .appendTo(this._htmlElement);

        var propertiesPanels = $('<div></div>')
            .addClass('properties-panels')
            .appendTo(this._htmlElement);

        var _addPropertiesPanel = function (properties) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .attr('data-available', 'false')
                .addClass('properties-panel-content');

            // Append category
            var category = $('<div></div>')
                .addClass('properties-panel-category')
                .css('display', 'none')
                .attr('data-expanded', 'true')
                .append($('<div></div>')
                    .addClass('title')
                    .append($('<i></i>')
                        .addClass('fa fa-caret-down'))
                    .append($('<span></span>')
                        .text(gLocale.get(properties.getCategory())))
                    .on('click', function () {
                        if (panel.attr('data-available') === 'true') {
                            var me = $(this);
                            var icon = me.find('i.fa');
                            if (panel.css('display') !== 'none') {
                                panel.css('display', 'none');
                                icon.attr('class', 'fa fa-caret-right');
                                me.attr('data-expanded', 'false');
                            } else {
                                panel.css('display', '');
                                icon.attr('class', 'fa fa-caret-down');
                                me.attr('data-expanded', 'true');
                            }
                        }
                    }))
                .append($('<div></div>')
                    .addClass('controls'))
                .appendTo(propertiesPanels);

            // Init properties
            properties.init(panel, category.find('.controls'));

            // Append panel
            panel.appendTo(propertiesPanels);

            this._propertyPanels.push({
                category: category,
                panel: panel,
                properties: properties
            })
        }.bind(this);

        // Initialize our properties panels
        for (var i = 0; i < gravit.properties.length; ++i) {
            _addPropertiesPanel(gravit.properties[i]);
        }
    };

    /** @override */
    EXPropertiesPalette.prototype._createDocumentState = function (document) {
        return new EXPropertiesPalette.DocumentState(document, this._propertyPanels, this._objectTree);
    };

    /** @override */
    EXPropertiesPalette.prototype.toString = function () {
        return "[Object EXPropertiesPalette]";
    };

    _.EXPropertiesPalette = EXPropertiesPalette;
})(this);