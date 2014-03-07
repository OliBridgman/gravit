(function (_) {

    /**
     * Styles properties panel
     * @class GStylesProperties
     * @extends EXProperties
     * @constructor
     */
    function GStylesProperties() {
        this._elements = [];
    };
    GObject.inherit(GStylesProperties, EXProperties);

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties._StyleProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._StyleProperties
     * @constructor
     * @private
     */
    GStylesProperties._StyleProperties = function (properties, panel) {
        this._properties = properties;
        this._panel = panel;
    };

    /**
     * @type {GStylesProperties}
     * @private
     */
    GStylesProperties._StyleProperties.prototype._properties = null;

    /**
     * @type {Jquery}
     * @private
     */
    GStylesProperties._StyleProperties.prototype._panel = null;

    /**
     * @type {Jquery}
     * @private
     */
    GStylesProperties._StyleProperties.prototype._controls = null;

    /**
     * @type {GXStyle}
     * @private
     */
    GStylesProperties._StyleProperties.prototype._style = null;

    /**
     * @param {GXStyle} style
     */
    GStylesProperties._StyleProperties.prototype.update = function (style) {
        this._style = style;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties._PaintFillProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._PaintFillProperties
     * @extends GStylesProperties._StyleProperties
     * @constructor
     * @private
     */
    GStylesProperties._PaintFillProperties = function (properties, panel) {
        GStylesProperties._StyleProperties.call(this, properties, panel);

        var _createInput = function (property) {
            var self = this;
            if (property === 'tp') {
                return $('<select></select>')
                    .css('width', '100%')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', GXPaintFillStyle.Type.Color)
                        // TODO : I18N
                        .text('Color'))
                    .append($('<option></option>')
                        .attr('value', GXPaintFillStyle.Type.Gradient)
                        // TODO : I18N
                        .text('Gradient'))
                    .on('change', function () {
                        self._properties._assignStyleProperty(self._style, 'tp', $(this).val());
                        self.update(self._style);
                    });
            } else if (property === 'color') {
                return $('<div></div>')
                    .css('position', 'relative')
                    .append($('<input>')
                        .attr('type', 'text')
                        .attr('data-property', 'position')
                        .css('width', '5em')
                        .on('change', function () {
                            //self._updatePosition($(this).val());
                        }))
                    .append($('<button></button>')
                        .addClass('g-flat')
                        .css('position', 'absolute')
                        .css('right', '5px')
                        .attr('data-property', 'color')
                        .gColorButton()
                        .on('change', function (evt, color) {
                            //self._updateColor(color);
                            self._properties._assignStyleProperty(self._style, 'cls', color);
                        }));
            } else if (property === 'gradient') {
                return $('<div></div>')
                    .attr('data-property', 'gradient')
                    .gGradientEditor({
                    })
                    .gGradientEditor('value', [
                        {position: 0, color: GXColor.parseCSSColor('blue')},
                        {position: 50, color: GXColor.parseCSSColor('yellow')},
                        {position: 100, color: GXColor.parseCSSColor('red')}
                    ])
                    .on('selected', function () {
                        self._updateStopInput();
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('width', '100%')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Fill:'))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .append(_createInput('tp')))
                .append($('<td></td>')
                    .css('text-align', 'right')
                    .append(_createInput('color'))))
            .append($('<tr></tr>')
                .append($('<td></td>'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('gradient'))))
            .appendTo(panel);

    };
    GObject.inherit(GStylesProperties._PaintFillProperties, GStylesProperties._StyleProperties);

    GStylesProperties._PaintFillProperties.prototype.update = function (style) {
        GStylesProperties._StyleProperties.prototype.update.call(this, style);

        var type = style.getProperty('tp');

        this._panel.find('input[data-property="position"]')
            .css('visibility', type === GXPaintFillStyle.Type.Gradient ? '' : 'hidden');

        this._panel.find('button[data-property="color"]')
            .css('visibility', type === GXPaintFillStyle.Type.Gradient || type === GXPaintFillStyle.Type.Color ? '' : 'hidden')
            .toggleClass('g-flat', type !== GXPaintFillStyle.Type.Color)
            .gColorButton('value', type === GXPaintFillStyle.Type.Color ? style.getProperty('cls') : null)
            .prop('disabled', false);

        this._panel.find('[data-property="gradient"]')
            .css('display', type === GXPaintFillStyle.Type.Gradient ? '' : 'none');

        this._updateStopInput();
    };

    GStylesProperties._PaintFillProperties.prototype._updateStopInput = function () {
        var type = this._style.getProperty('tp');

        if (type === GXPaintFillStyle.Type.Gradient) {
            var $position = this._panel.find('input[data-property="position"]');
            var $color = this._panel.find('button[data-property="color"]');
            var $gradient = this._panel.find('div[data-property="gradient"]');

            var selected = $gradient.gGradientEditor('selected');
            var stops = $gradient.gGradientEditor('value');

            $position
                .prop('disabled', selected < 0)
                .val(stops && selected >= 0 ? stops[selected].position : '');

            $color
                .prop('disabled', selected < 0)
                .gColorButton('value', stops && selected >= 0 ? stops[selected].color : null);
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties._PaintAreaProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._PaintAreaProperties
     * @extends GStylesProperties._PaintFillProperties
     * @constructor
     * @private
     */
    GStylesProperties._PaintAreaProperties = function (properties, panel) {
        GStylesProperties._PaintFillProperties.call(this, properties, panel);
    };
    GObject.inherit(GStylesProperties._PaintAreaProperties, GStylesProperties._PaintFillProperties);

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties._PaintContourProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._PaintContourProperties
     * @extends GStylesProperties._PaintFillProperties
     * @constructor
     * @private
     */
    GStylesProperties._PaintContourProperties = function (properties, panel) {
        GStylesProperties._PaintFillProperties.call(this, properties, panel);

        var _createInput = function (property) {
            var self = this;
            if (property === 'cw') {
                return $('<input>')
                    .attr('data-property', property)
                    .attr('type', 'text')
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._style.getScene().stringToPoint($(this).val());
                        if (!isNaN(value)) {
                            self._properties._assignStyleProperty(self._style, 'cw', value);
                        } else {
                            self.update(self._style);
                        }
                    })
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel.find('.g-form')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Stroke:'))
                .append($('<td></td>')
                    .append(_createInput('cw')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Align:'))
                .append($('<td></td>')
                    .append($('<select></select>')
                        .css('width', '100%')
                        .append($('<option></option>')
                            .text('Inside')))));
    };
    GObject.inherit(GStylesProperties._PaintContourProperties, GStylesProperties._PaintFillProperties);

    GStylesProperties._PaintContourProperties.prototype.update = function (style) {
        GStylesProperties._PaintFillProperties.prototype.update.call(this, style);

        this._panel.find('input[data-property="cw"]').val(style.getScene().pointToString(style.getProperty('cw')));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {JQuery}
     * @private
     */
    GStylesProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GStylesProperties.prototype._document = null;

    /**
     * @type {Array<GXElement>}
     * @private
     */
    GStylesProperties.prototype._elements = null;

    /**
     * The container for the styles tree
     * @type {JQuery}
     * @private
     */
    GStylesProperties.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXStyle to Tree nodes
     * @type {Array<{{style: GXStyle, treeId: String}}>}
     * @private
     */
    GStylesProperties.prototype._treeStyleMap = null;

    /**
     * @type {Array<{{styleClass: Function, properties: GStyleProperties._StyleProperties, panel: Jquery}}>}
     * @private
     */
    GStylesProperties.prototype._styleProperties = null;

    /** @override */
    GStylesProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Styles';
    };

    /** @override */
    GStylesProperties.prototype.init = function (panel, controls) {
        this._panel = panel;
        this._controls = controls;

        // Create empty tree style mapping table
        this._treeStyleMap = [];

        // Initiate our controls panel
        controls
            .append($('<button></button>')
                .attr('data-control', 'contour')
                // TODO : I18N
                .attr('title', 'Add Contour')
                .append($('<span></span>')
                    .addClass('fa fa-circle-o'))
                .on('click', function () {
                    this._addStyleClass(GXPaintContourStyle);
                }.bind(this)))
            .append($('<button></button>')
                .attr('data-control', 'area')
                // TODO : I18N
                .attr('title', 'Add Area')
                .append($('<span></span>')
                    .addClass('fa fa-circle'))
                .on('click', function () {
                    this._addStyleClass(GXPaintAreaStyle);
                }.bind(this)))
            .append($('<span></span>')
                .html('&nbsp;'))
            .append($('<button></button>')
                .attr('data-control', 'remove')
                // TODO : I18N
                .attr('title', 'Remove selected Style')
                .append($('<span></span>')
                    .addClass('fa fa-times'))
                .on('click', function () {
                    this._removeSelectedStyle();
                }.bind(this)));

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('style-tree')
            .css('padding-right', '5px')
            .css('max-height', '8em')
            .css('overflow-x', 'hidden')
            .css('overflow-y', 'auto')
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
            .on('tree.move', this._moveTreeNode.bind(this))
            .appendTo(this._panel);

        $('<hr>')
            .appendTo(this._panel);


        // Initialize and add our style panels
        var stylePanels = $('<div></div>')
            .addClass('style-panels')
            .appendTo(this._panel);

        this._styleProperties = [];
        var _addStyleProperties = function (propertiesClass, styleClass) {
            var panel = $('<div></div>')
                //.css('display', 'none')
                .appendTo(stylePanels);

            this._styleProperties.push({
                styleClass: styleClass,
                properties: new propertiesClass(this, panel),
                panel: panel
            });
        }.bind(this);

        _addStyleProperties(GStylesProperties._PaintAreaProperties, GXPaintAreaStyle);
        _addStyleProperties(GStylesProperties._PaintContourProperties, GXPaintContourStyle);
    };

    /** @override */
    GStylesProperties.prototype.updateFromNodes = function (document, nodes) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXNode.AfterInsertEvent, this._afterInsert);
            this._document.getScene().removeEventListener(GXNode.AfterRemoveEvent, this._afterRemove);
            this._document.getScene().removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getScene().removeEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange);
            this._document = null;
        }

        // Collect all styleable elements
        this._elements = [];
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] instanceof GXElement && nodes[i].hasMixin(GXElement.Style)) {
                this._elements.push(nodes[i]);
            }
        }

        if (this._elements.length > 0) {
            this._document = document;
            this._document.getScene().addEventListener(GXNode.AfterInsertEvent, this._afterInsert, this);
            this._document.getScene().addEventListener(GXNode.AfterRemoveEvent, this._afterRemove, this);
            this._document.getScene().addEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().addEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._updateStylesTree();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    GStylesProperties.prototype._afterInsert = function (event) {
        if (event.node instanceof GXStyle) {
            // Insert style into tree
            this._insertStyleNode(event.node);

            // Select first one if there's none yet
            this._selectFirstStyle();

            // Update adding controls
            this._updateAddControls();
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    GStylesProperties.prototype._afterRemove = function (event) {
        if (event.node instanceof GXStyle) {
            var treeNode = this._getTreeNode(event.node);
            if (treeNode) {
                var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');

                // Remove the tree node, first
                this._htmlTreeContainer.tree('removeNode', treeNode);

                // Iterate node and remove all tree mappings
                event.node.accept(function (node) {
                    if (node instanceof GXStyle) {
                        for (var i = 0; i < this._treeStyleMap.length; ++i) {
                            if (this._treeStyleMap[i].style === node) {
                                this._treeStyleMap.splice(i, 1);
                                break;
                            }
                        }
                    }
                }.bind(this));

                // Reset selection if removed one was selected tree node
                if (selectedNode && selectedNode.style === event.node) {
                    this._selectFirstStyle(true);
                }

                // Update adding controls
                this._updateAddControls();
            }
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GStylesProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof GXStyle) {
            // If modified node is the selected style then update
            var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');
            if (selectedNode && selectedNode.style === event.node) {
                this._updateStyleProperties();
            }

            // Update the style tree node if any for the style in any case
            var treeNode = this._getTreeNode(event.node);
            if (treeNode) {
                this._htmlTreeContainer.tree('updateNode', treeNode, {
                    label: event.node.getNodeNameTranslated(),
                    style: event.node
                });
            }
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    GStylesProperties.prototype._afterFlagChange = function (event) {
        if (event.node instanceof GXStyle) {
            if (event.flag === GXNode.Flag.Selected && event.set) {
                var treeNode = this._getTreeNode(event.node);
                if (treeNode) {
                    this._htmlTreeContainer.tree('selectNode', treeNode);
                    this._updateStyleProperties();
                }
            }
        }
    };

    /**
     * Clears and udpates the styles tree
     * @private
     */
    GStylesProperties.prototype._updateStylesTree = function () {
        // Clear styles tree
        this._htmlTreeContainer.tree('selectNode', null);
        this._htmlTreeContainer.tree('loadData', []);
        this._treeStyleMap = [];
        this._updateStyleProperties();

        // Iterate styles
        for (var i = 0; i < this._elements.length; ++i) {
            var style = this._elements[i].getStyle();
            if (style) {
                this._insertStyleNode(style);
            }
        }

        // Select first one if there's none yet
        this._selectFirstStyle();

        // Update adding controls
        this._updateAddControls();
    };

    /**
     * Insert a style into the tree
     * @param {GXStyle} style
     * @private
     */
    GStylesProperties.prototype._insertStyleNode = function (style) {
        var canAdd = true;
        var forceAddChildren = false;

        // Avoid to add root styleSet but force children
        if (style.getParent() instanceof GXElement) {
            canAdd = false;
            forceAddChildren = true;
        }

        if (canAdd && this._elements.length > 1) {
            // For multiple element selection we'll only pick up
            // paint styles and only on root and only one of a
            // type (first one found).
            // TODO : Take care on style references

            if (!(style instanceof GXPaintStyle)) {
                canAdd = false;
            } else {
                var treeRoot = this._htmlTreeContainer.tree('getTree');
                // Iterate existing style nodes on root
                if (treeRoot && treeRoot.children) {
                    for (var i = 0; i < treeRoot.children.length; i++) {
                        var node = treeRoot.children[i];
                        if (node.style.constructor === style.constructor) {
                            canAdd = false;
                            break;
                        }
                    }
                }
            }
        }

        if (canAdd) {
            // Try to find the parent node and insertion position for the style
            // TODO
            var parentTreeNode = null;

            // Create an unique treeId for the new style
            var treeId = gUtil.uuid();

            // Apend the node & gather it's reference
            this._htmlTreeContainer.tree('appendNode', { id: treeId, style: style, label: style.getNodeNameTranslated() }, parentTreeNode);
            var treeNode = this._htmlTreeContainer.tree('getNodeById', treeId);

            // Insert the mapping
            this._treeStyleMap.push({style: style, treeId: treeId});

            // If style is selected then mark it selected in tree and update
            if (style.hasFlag(GXNode.Flag.Selected)) {
                this._htmlTreeContainer.tree('selectNode', treeNode);
                this._htmlTreeContainer.tree('scrollToNode', treeNode);
                this._updateStyleProperties();
            }
        }

        // Add children (if any)
        if ((canAdd || forceAddChildren) && style.hasMixin(GXNode.Container)) {
            for (var child = style.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof GXStyle) {
                    this._insertStyleNode(child);
                }
            }
        }
    };

    /**
     * Update properties of currently selected style if any
     * @param {GXStyle} style
     * @private
     */
    GStylesProperties.prototype._updateStyleProperties = function () {
        var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');
        var style = selectedNode ? selectedNode.style : null;

        for (var i = 0; i < this._styleProperties.length; ++i) {
            var styleProperties = this._styleProperties[i];
            if (style && styleProperties.styleClass === style.constructor) {
                styleProperties.panel.css('display', '');
                styleProperties.properties.update(style);
            } else {
                styleProperties.panel.css('display', 'none');
            }
        }

        // Enable / disable removal based on selection
        this._controls.find('button[data-control="remove"]')
            .prop('disabled', !this._htmlTreeContainer.tree('getSelectedNode'));
    };

    /**
     * Assign a property to a given style
     * @param {GXStyle} style
     * @param {String} property
     * @param {*} value
     * @private
     */
    GStylesProperties.prototype._assignStyleProperty = function (style, property, value) {
        this._assignStyleProperties(style, [property], [value]);
    };

    /**
     * Assign properties to a given style
     * @param {GXStyle} style
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GStylesProperties.prototype._assignStyleProperties = function (style, properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            // If we have multiple elements, we'll assign using the style class instead,
            // otherwise we'll assign to the style instance directly
            if (this._elements.length > 1) {
                for (var i = 0; i < this._elements.length; ++i) {
                    this._elements[i].getStyle(true).applyStyleProperties(style.constructor, properties, values);
                }
            } else {
                style.setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Style Properties');
        }
    };

    /**
     * Add a new style of a given class
     * @param {GXStyle} styleClass
     * @private
     */
    GStylesProperties.prototype._addStyleClass = function (styleClass) {
        var styleName = null;

        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._elements.length; ++i) {
                var instance = new styleClass();
                instance.setFlag(GXNode.Flag.Selected);
                styleName = instance.getNodeNameTranslated();
                this._elements[i].getStyle(true).appendChild(instance);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Add ' + styleName + ' Style');
        }
    };

    /**
     * Remove the currently selected style if any
     * @private
     */
    GStylesProperties.prototype._removeSelectedStyle = function () {
        var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');
        if (selectedNode) {
            var styleClass = selectedNode.style.constructor;

            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                for (var i = 0; i < this._elements.length; ++i) {
                    var styleSet = this._elements[i].getStyle(false);
                    if (styleSet) {
                        for (var style = styleSet.getFirstChild(); style !== null; style = style.getNext()) {
                            if (style.constructor === styleClass) {
                                styleSet.removeChild(style);
                                break;
                            }
                        }
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Remove ' + selectedNode.style.getNodeNameTranslated() + ' Style');
            }
        }
    };

    /**
     * Selects the first style node if any if no other one
     * is already selected or this call is enforced
     * @param {Boolean} [force] force selection no matter of the
     * current selection, defaults to false
     * @private
     */
    GStylesProperties.prototype._selectFirstStyle = function (force) {
        var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');
        if (!selectedNode || force) {
            var treeRoot = this._htmlTreeContainer.tree('getTree');
            if (treeRoot && treeRoot.children) {
                this._htmlTreeContainer.tree('selectNode', treeRoot.children[0]);
            } else {
                this._htmlTreeContainer.tree('selectNode', null);
            }
            this._updateStyleProperties();
        }
    };

    /**
     * Update the controls for adding styles
     */
    GStylesProperties.prototype._updateAddControls = function () {
        // For multiple elements, we'll be collecting all style classes on the root
        var styleClasses = [];
        if (this._elements.length > 1) {
            var treeRoot = this._htmlTreeContainer.tree('getTree');
            if (treeRoot && treeRoot.children) {
                for (var i = 0; i < treeRoot.children.length; i++) {
                    var node = treeRoot.children[i];
                    if (styleClasses.indexOf(node.style.constructor) < 0) {
                        styleClasses.push(node.style.constructor);
                    }
                }
            }
        }

        // Enable / disable add controls
        this._controls.find('button[data-control="contour"]')
            .prop('disabled', styleClasses.indexOf(GXPaintContourStyle) >= 0);
        this._controls.find('button[data-control="area"]')
            .prop('disabled', styleClasses.indexOf(GXPaintAreaStyle) >= 0);
    };

    /**
     * @param {GXStyle} style
     * @return {*}
     * @private
     */
    GStylesProperties.prototype._getTreeNodeId = function (style) {
        for (var i = 0; i < this._treeStyleMap.length; ++i) {
            if (this._treeStyleMap[i].style === style) {
                return this._treeStyleMap[i].treeId;
            }
        }
    };

    /**
     * @param {GXStyle} style
     * @return {*}
     * @private
     */
    GStylesProperties.prototype._getTreeNode = function (style) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(style));
    };

    /**
     * @private
     */
    GStylesProperties.prototype._createListItem = function (node, li) {
        if (node.style) {
            var style = node.style;

            // TODO : Icons
        }
    };

    /**
     * @param event
     * @return {{parent: GXNode, before: GXNode, source: GXNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    GStylesProperties.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                if (!target.hasMixin(GXNode.Container)) {
                    return null;
                }

                parent = target;
                before = target.getFirstChild();
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
    GStylesProperties.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        return this._getMoveTreeNodeInfo(position, moved_node.style, target_node.style) !== null;
    };

    /**
     * @param event
     * @private
     */
    GStylesProperties.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.style, event.move_info.target_node.style);

        if (moveInfo) {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                moveInfo.source.getParent().removeChild(moveInfo.source);
                moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Drag Style(s)');
            }
        }
    };

    /**
     * @param event
     * @private
     */
    GStylesProperties.prototype._clickTreeNode = function (event) {
        event.preventDefault();

        if (event.node && event.node.style) {
            // TODO : Support multiple selection one day??
            // Select the style and de-select all others
            var ownerElement = event.node.style.getOwnerElement();
            ownerElement.getStyle().accept(function (node) {
                if (node instanceof GXStyle) {
                    if (node === event.node.style) {
                        node.setFlag(GXNode.Flag.Selected);
                    } else {
                        node.removeFlag(GXNode.Flag.Selected);
                    }
                }
            });

        }
    };

    /** @override */
    GStylesProperties.prototype.toString = function () {
        return "[Object GStylesProperties]";
    };

    _.GStylesProperties = GStylesProperties;
})(this);