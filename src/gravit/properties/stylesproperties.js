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
    // GStylesProperties._PaintProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._PaintProperties
     * @extends GStylesProperties._StyleProperties
     * @constructor
     * @private
     */
    GStylesProperties._PaintProperties = function (properties, panel) {
        GStylesProperties._StyleProperties.call(this, properties, panel);

        var _createInput = function (property) {
            var self = this;
            if (property === 'tp') {
                return $('<select></select>')
                    .css('width', '100%')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', GXPaintStyle.Type.Color)
                        // TODO : I18N
                        .text('Color'))
                    .append($('<option></option>')
                        .attr('value', GXPaintStyle.Type.LinearGradient)
                        // TODO : I18N
                        .text('Linear Gradient'))
                    //.append($('<option></option>')
                    //    .attr('value', GXPaintStyle.Type.RadialGradient)
                    //    // TODO : I18N
                    //    .text('Radial Gradient'))
                    .on('change', function () {
                        var oldType = self._style.getProperty('tp');
                        var newType = $(this).val();
                        if (oldType !== newType) {
                            var newValue = null;

                            if (GXPaintStyle.isGradientType(newType)) {
                                if (!GXPaintStyle.isGradientType(oldType)) {
                                    newValue = new GXGradient([
                                        {position: 0, color: self._style.getColor()},
                                        {position: 100, color: new GXColor(GXColor.Type.Black)}
                                    ]);
                                } else {
                                    newValue = self._style.getProperty('val');
                                }
                            } else if (newType === GXPaintStyle.Type.Color) {
                                newValue = self._style.getColor();
                            }

                            self._properties._assignStyleProperties(self._style, ['tp', 'val'], [newType, newValue]);
                            self.update(self._style);
                        }
                    });
            } else if (property === 'color') {
                return $('<div></div>')
                    .css('position', 'relative')
                    .append($('<input>')
                        .attr('type', 'text')
                        .attr('data-property', 'position')
                        .css('width', '5em')
                        .gAutoBlur()
                        .on('change', function () {
                            var type = self._style.getProperty('tp');
                            if (GXPaintStyle.isGradientType(type)) {
                                self._assignStopInput();
                            } else {
                                throw new Error("Unsupported Type for Position.");
                            }
                        }))
                    .append($('<button></button>')
                        .addClass('g-flat')
                        .css('position', 'absolute')
                        .css('right', '5px')
                        .attr('data-property', 'color')
                        .gColorButton()
                        .on('change', function (evt, color) {
                            var type = this._style.getProperty('tp');
                            if (GXPaintStyle.isGradientType(type)) {
                                self._assignStopInput();
                            } else if (type === GXPaintStyle.Type.Color) {
                                self._properties._assignStyleProperty(self._style, 'val', color);
                            } else {
                                throw new Error("Unsupported Type for Color.");
                            }
                        }.bind(this)));
            } else if (property === 'gradient') {
                return $('<div></div>')
                    .attr('data-property', 'gradient')
                    .gGradientEditor()
                    .on('selected', function () {
                        self._updateStopInput();
                    })
                    .on('change', function (evt) {
                        self._assignGradient();
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
    GObject.inherit(GStylesProperties._PaintProperties, GStylesProperties._StyleProperties);

    /**
     * @type {boolean}
     * @private
     */
    GStylesProperties._PaintProperties._isGradientUpdate = false;

    GStylesProperties._PaintProperties.prototype.update = function (style) {
        if (this._isGradientUpdate) {
            return;
        }

        GStylesProperties._StyleProperties.prototype.update.call(this, style);

        var type = style.getProperty('tp');

        this._panel.find('input[data-property="position"]')
            .css('visibility', GXPaintStyle.isGradientType(type) ? '' : 'hidden');

        this._panel.find('button[data-property="color"]')
            .css('visibility', GXPaintStyle.isGradientType(type) || type === GXPaintStyle.Type.Color ? '' : 'hidden')
            .toggleClass('g-flat', type !== GXPaintStyle.Type.Color)
            .gColorButton('value', type === GXPaintStyle.Type.Color ? style.getProperty('val') : null)
            .prop('disabled', false);

        this._panel.find('[data-property="gradient"]')
            .css('display', GXPaintStyle.isGradientType(type) ? '' : 'none')
            .gGradientEditor('value', GXPaintStyle.isGradientType(type) ? style.getProperty('val').getStops() : null)
            .gGradientEditor('selected', GXPaintStyle.isGradientType(type) ? 0 : -1);

        this._updateStopInput();
    };

    GStylesProperties._PaintProperties.prototype._assignStopInput = function () {
        if (GXPaintStyle.isGradientType(this._style.getProperty('tp'))) {
            var $position = this._panel.find('input[data-property="position"]');
            var $color = this._panel.find('button[data-property="color"]');
            var $gradient = this._panel.find('div[data-property="gradient"]');

            var selected = $gradient.gGradientEditor('selected');
            var stops = $gradient.gGradientEditor('value');

            var position = parseInt($position.val());
            if (isNaN(position) || position < 0 || position > 100) {
                position = stops[selected].position;
            }

            var color = $color.gColorButton('value');
            if (!color) {
                color = stops[selected].color;
            }

            $gradient.gGradientEditor('updateStop', selected, position, color);

            this._assignGradient();
        }
    };

    GStylesProperties._PaintProperties.prototype._assignGradient = function () {
        if (GXPaintStyle.isGradientType(this._style.getProperty('tp'))) {
            var $gradient = this._panel.find('div[data-property="gradient"]');

            this._isGradientUpdate = true;
            try {
                this._properties._assignStyleProperty(this._style, 'val', new GXGradient($gradient.gGradientEditor('value')));
            } finally {
                this._isGradientUpdate = false;
            }
        }
    };

    GStylesProperties._PaintProperties.prototype._updateStopInput = function () {
        if (GXPaintStyle.isGradientType(this._style.getProperty('tp'))) {
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
    // GStylesProperties._FillProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._FillProperties
     * @extends GStylesProperties._PaintProperties
     * @constructor
     * @private
     */
    GStylesProperties._FillProperties = function (properties, panel) {
        GStylesProperties._PaintProperties.call(this, properties, panel);
    };
    GObject.inherit(GStylesProperties._FillProperties, GStylesProperties._PaintProperties);

    // -----------------------------------------------------------------------------------------------------------------
    // GStylesProperties._StrokeProperties Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GStylesProperties._StrokeProperties
     * @extends GStylesProperties._PaintProperties
     * @constructor
     * @private
     */
    GStylesProperties._StrokeProperties = function (properties, panel) {
        GStylesProperties._PaintProperties.call(this, properties, panel);

        var _createInput = function (property) {
            var self = this;
            if (property === 'sw') {
                return $('<input>')
                    .attr('data-property', property)
                    .attr('type', 'text')
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._style.getScene().stringToPoint($(this).val());
                        if (!isNaN(value)) {
                            self._properties._assignStyleProperty(self._style, 'sw', value);
                        } else {
                            self.update(self._style);
                        }
                    })
            } else if (property === 'si') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-property', property)
                        .on('change', function () {
                            self._properties._assignStyleProperty(self._style, 'si', $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Inside'))
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
                    .text('Width:'))
                .append($('<td></td>')
                    .append(_createInput('sw')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .append(_createInput('si'))));
    };
    GObject.inherit(GStylesProperties._StrokeProperties, GStylesProperties._PaintProperties);

    GStylesProperties._StrokeProperties.prototype.update = function (style) {
        GStylesProperties._PaintProperties.prototype.update.call(this, style);

        this._panel.find('input[data-property="sw"]').val(style.getScene().pointToString(style.getProperty('sw')));
        this._panel.find('input[data-property="si"]').prop('checked', style.getProperty('si'));
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
                .attr('data-control', 'stroke')
                // TODO : I18N
                .attr('title', 'Add Stroke')
                .append($('<span></span>')
                    .addClass('fa fa-circle-o'))
                .on('click', function () {
                    this._addStyleClass(GXStrokeStyle);
                }.bind(this)))
            .append($('<button></button>')
                .attr('data-control', 'fill')
                // TODO : I18N
                .attr('title', 'Add Fill')
                .append($('<span></span>')
                    .addClass('fa fa-circle'))
                .on('click', function () {
                    this._addStyleClass(GXFillStyle);
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

        _addStyleProperties(GStylesProperties._FillProperties, GXFillStyle);
        _addStyleProperties(GStylesProperties._StrokeProperties, GXStrokeStyle);
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
        this._controls.find('button[data-control="stroke"]')
            .prop('disabled', styleClasses.indexOf(GXStrokeStyle) >= 0);
        this._controls.find('button[data-control="fill"]')
            .prop('disabled', styleClasses.indexOf(GXFillStyle) >= 0);
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
        // TODO : Enable drag'n'drop for multiple elements one day...
        if (this._elements.length > 1) {
            return false;
        }

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