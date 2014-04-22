(function (_) {

    /**
     * Attribute properties panel
     * @class GAttributeProperties
     * @extends EXProperties
     * @constructor
     */
    function GAttributeProperties() {
        this._elements = [];
        this._attributesInfo = [];
        this._assignAttributePropertiesHandler = this._assignAttributeProperties.bind(this);
    };
    GObject.inherit(GAttributeProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GAttributeProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GAttributeProperties.prototype._document = null;

    /**
     * @type {Array<GXElement>}
     * @private
     */
    GAttributeProperties.prototype._elements = null;

    /**
     * @type {Array<{{panel: JQuery, attribute: GAttribute}}>}
     * @private
     */
    GAttributeProperties.prototype._attributesInfo = null;

    /** @override */
    GAttributeProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Attribute';
    };

    /** @override */
    GAttributeProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        // Initialize all of our available attributes
        var attributePanels = $('<div></div>')
            .addClass('attribute-panels')
            .appendTo(this._panel);

        var _addAttribute = function (attribute) {
            // Create and append panel
            var panel = $('<div></div>')
                //.css('display', 'none')
                .addClass('attribute-panel-content')
                .appendTo(attributePanels);

            attribute.init(panel);

            this._attributesInfo.push({
                panel: panel,
                attribute: attribute
            })
        }.bind(this);

        // Initialize our attributes
        for (var i = 0; i < gravit.attributes.length; ++i) {
            _addAttribute(gravit.attributes[i]);
        }
    };

    /** @override */
    GAttributeProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
            this._attribute = null;
        }

        // We'll work on attributes, only
        if (!node || !(node instanceof IFAttribute)) {
            return false;
        }

        // Collect all attribute elements
        this._elements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(GXElement.Attributes)) {
                this._elements.push(elements[i]);
            }
        }

        if (this._elements.length > 0) {
            this._document = document;

            if (!this._updateFromAttribute(node)) {
                this._document = null;
                return false;
            }

            this._document.getScene().addEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._attribute = node;
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GAttributeProperties.prototype._afterPropertiesChange = function (event) {
        if (this._attribute && event.node === this._attribute) {
            this._updateFromAttribute(this._attribute);
        }
    };

    /**
     * Try to update from a given attribute
     * @param {IFAttribute} attribute
     * @return {Boolean} true if update could take place, false if not
     * @private
     */
    GAttributeProperties.prototype._updateFromAttribute = function (attribute) {
        var result = false;
        for (var i = 0; i < this._attributesInfo.length; ++i) {
            var attrInfo = this._attributesInfo[i];
            if (attrInfo.attribute.getAttributeClass() === attribute.constructor) {
                attrInfo.panel.css('display', '');
                attrInfo.attribute.updateFromAttribute(this._document, attribute, this._assignAttributePropertiesHandler);
                result = true;
            } else {
                attrInfo.panel.css('display', 'none');
            }
        }
        return result;
    };

    /**
     * Assign properties to the active attribute
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GAttributeProperties.prototype._assignAttributeProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            // If we have multiple elements, we'll assign using the attribute class instead,
            // otherwise we'll assign to the attribute instance directly
            if (this._elements.length > 1) {
                for (var i = 0; i < this._elements.length; ++i) {
                    this._elements[i].getAttributes().applyAttributeProperties(this._attribute.constructor, properties, values);
                }
            } else {
                this._attribute.setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify ' + this._attribute.getNodeNameTranslated() + ' Attribute Properties');
        }
    };

    /** @override */
    GAttributeProperties.prototype.toString = function () {
        return "[Object GAttributeProperties]";
    };

    _.GAttributeProperties = GAttributeProperties;
})(this);