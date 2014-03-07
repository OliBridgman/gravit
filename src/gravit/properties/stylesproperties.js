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

        // Create empty tree style mapping table
        this._treeStyleMap = [];

        // Initiate our controls panel
        controls
            .append($('<button></button>')
                .append('<span></span>')
                .addClass('fa fa-circle-o')
                // TODO : I18N
                .attr('title', 'Add Contour')
                .on('click', function () {
                    this._addStyleClass(GXPaintContourStyle);
                }.bind(this)))
            .append($('<button></button>')
                .append('<span></span>')
                .addClass('fa fa-circle')
                // TODO : I18N
                .attr('title', 'Add Area')
                .on('click', function () {
                    this._addStyleClass(GXPaintAreaStyle);
                }.bind(this)));
        /*
         .append($('<button></button>')
         .append('<span></span>')
         .addClass('fa fa-plus')
         // TODO : I18N
         .attr('title', 'Add Effect'));
         */

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('style-tree')
            .css('padding-right', '5px')
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
            this._updateStyles();
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
            this._insertStyle(event.node);
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
            }
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GStylesProperties.prototype._afterPropertiesChange = function (event) {
        // TODO : Update active style and style nodes
        /*
         // If properties of first polygon has changed then update ourself
         if (this._polygons.length > 0 && this._polygons[0] === event.node) {
         this._updateProperties();
         }
         */
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    GStylesProperties.prototype._afterFlagChange = function (event) {
        if (event.node instanceof GXStyle) {
            //this._updateItemProperties(event.node);
            //TODO
        }
    };

    /**
     * @private
     */
    GStylesProperties.prototype._updateStyles = function () {
        // Clear styles tree
        this._htmlTreeContainer.tree('loadData', []);
        this._treeStyleMap = [];
        this._updateStyleProperties(null);

        // Iterate styles
        for (var i = 0; i < this._elements.length; ++i) {
            var style = this._elements[i].getStyle();
            if (style) {
                this._insertStyle(style);
            }
        }
    };

    GStylesProperties.prototype._insertStyle = function (style) {
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

            // If style is selected then mark it selected in tree
            if (style.hasFlag(GXNode.Flag.Selected)) {
                this._htmlTreeContainer.tree('selectNode', treeNode);
            }
        }

        // Add children (if any)
        if ((canAdd || forceAddChildren) && style.hasMixin(GXNode.Container)) {
            for (var child = style.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof GXStyle) {
                    this._insertStyle(child);
                }
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

    GStylesProperties.prototype._addStyleClass = function (styleClass) {
        var styleName = null;

        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._elements.length; ++i) {
                var instance = new styleClass();
                styleName = instance.getNodeNameTranslated();
                this._elements[i].getStyle(true).appendChild(instance);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Add ' + styleName + ' Style');
        }
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

    /** @override */
    GStylesProperties.prototype.toString = function () {
        return "[Object GStylesProperties]";
    };

    _.GStylesProperties = GStylesProperties;
})(this);