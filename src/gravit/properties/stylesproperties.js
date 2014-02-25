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

        var self = this;

        panel
            .append($('<select></select>')
                .append($('<option></option>')
                    // TODO : I18N
                    .text('Color')))
            .append($('<button></button>')
                .attr('data-property', 'fill')
                .gColorButton()
                .on('change', function (evt, color) {
                    self._properties._assignStyleProperty(self._style, 'fill', color);
                }));
    };
    GObject.inherit(GStylesProperties._PaintFillProperties, GStylesProperties._StyleProperties);

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

        var self = this;

        panel.append($('<input>')
            .attr('data-property', 'cw')
            .gAutoBlur()
            .on('change', function () {
                var value = parseInt($(this).val());
                if (!isNaN(value)) {
                    self._properties._assignStyleProperty(self._style, 'cw', value);
                } else {
                    self.update(self._style);
                }
            }));
    };
    GObject.inherit(GStylesProperties._PaintContourProperties, GStylesProperties._PaintFillProperties);

    GStylesProperties._PaintContourProperties.prototype.update = function (style) {
        GStylesProperties._PaintFillProperties.prototype.update.call(this, style);

        this._panel.find('input[data-property="cw"]').val(style.getProperty('cw'));
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
    GStylesProperties.prototype._treeNodeMap = null;

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
    GStylesProperties.prototype.init = function (panel, menu) {
        this._panel = panel;

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('style-tree')
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
            //.on('tree.move', this._moveTreeNode.bind(this));
            .on('tree.select', this._selectStyle.bind(this))
            .appendTo(this._panel);

        // Create empty tree node mapping table
        this._treeNodeMap = [];

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
            this._document.getScene().removeEventListener(GXElement.GeometryChangeEvent, this._geometryChange);
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
            this._document.getScene().addEventListener(GXElement.GeometryChangeEvent, this._geometryChange, this);
            this._updateStyles();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXElement.GeometryChangeEvent} event
     * @private
     */
    GStylesProperties.prototype._geometryChange = function (event) {
        if ((event.type === GXElement.GeometryChangeEvent.Type.After) ||
            (event.type === GXElement.GeometryChangeEvent.Type.Child))
            if (this._elements.indexOf(event.element) >= 0) {
                this._updateStyles();
            }
    };

    /**
     * @private
     */
    GStylesProperties.prototype._updateStyles = function () {
        // Clear styles tree
        this._htmlTreeContainer.tree('loadData', []);
        var firstStyleInTree = null;
        this._updateStyleProperties(null);

        var rootStyleClasses = [];

        var _addStyle = function (style, parentTreeNode) {
            var canAdd = true;
            var forceAddChildren = false;

            // Avoid to add root styleSet but force children
            if (style.getParent() instanceof GXElement) {
                canAdd = false;
                forceAddChildren = true;
            }

            // For multiple element selection we'll only
            // pick up styles on the root and only one
            // of a specific style class type
            if (this._elements.length > 1) {
                if (rootStyleClasses.indexOf(style.constructor) >= 0) {
                    canAdd = false;
                } else {
                    rootStyleClasses.push(style.constructor);
                }
            }

            if (canAdd) {
                // Create an unique treeId for the new style
                var treeId = gUtil.uuid();

                // Apend the node & gather it's reference
                this._htmlTreeContainer.tree('appendNode', { id: treeId, style: style, label: style.getNodeNameTranslated() }, parentTreeNode);
                var treeNode = this._htmlTreeContainer.tree('getNodeById', treeId);

                // Insert the mapping
                this._treeNodeMap.push({style: style, treeId: treeId});

                // Assign first style if none yet and select it
                if (!firstStyleInTree) {
                    firstStyleInTree = style;
                    this._htmlTreeContainer.tree('selectNode', treeNode);
                }
            }

            // Add children (if any)
            if ((canAdd || forceAddChildren) && style.hasMixin(GXNode.Container)) {
                for (var child = style.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof GXStyle) {
                        _addStyle(child, treeNode);
                    }
                }
            }
        }.bind(this);

        // Iterate styles
        for (var i = 0; i < this._elements.length; ++i) {
            var style = this._elements[i].getStyle();
            if (style) {
                _addStyle(style, null);
            }
        }
    };

    GStylesProperties.prototype._selectStyle = function (evt) {
        if (evt.node) {
            var style = evt.node.style;
            this._updateStyleProperties(style);
        }
    };

    GStylesProperties.prototype._updateStyleProperties = function (style) {
        for (var i = 0; i < this._styleProperties.length; ++i) {
            var styleProperties = this._styleProperties[i];
            if (style && styleProperties.styleClass === style.constructor) {
                styleProperties.panel.css('display', '');
                styleProperties.properties.update(style);
            } else {
                styleProperties.panel.css('display', 'none');
            }
        }
    };

    GStylesProperties.prototype._assignStyleProperty = function (style, property, value) {
        this._assignStyleProperties(style, [property], [value]);
    };

    GStylesProperties.prototype._assignStyleProperties = function (style, properties, values) {
        // TODO : Undo

        // If we have multiple elements, we'll assign using the style class instead,
        // otherwise we'll assign to the style instance directly
        if (this._elements.length > 1) {
            for (var i = 0; i < this._elements.length; ++i) {
                this._elements[i].getStyle(true).applyStyleProperties(style.constructor, properties, values);
            }
        } else {
            style.setProperties(properties, values);
        }
    };

    /** @override */
    GStylesProperties.prototype.toString = function () {
        return "[Object GStylesProperties]";
    };

    _.GStylesProperties = GStylesProperties;
})(this);