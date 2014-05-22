(function (_) {

    /**
     * A set of attributes
     * @class IFAttributes
     * @extends IFAttribute
     * @mixes IFNode.Container
     * @constructor
     */
    function IFAttributes() {
    }

    GObject.inheritAndMix(IFAttributes, IFAttribute, [IFNode.Container]);

    /**
     * Attribute's mime-type
     * @type {string}
     */
    IFAttributes.MIME_TYPE = "application/infinity+attributes";

    // -----------------------------------------------------------------------------------------------------------------
    // IFAttributes.Pattern Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin indicating support for pattern attribute within this set.
     *
     * @constructor
     * @class IFAttributes.Pattern
     * @mixin
     */
    IFAttributes.Pattern = function () {
    };

    /**
     * Get the color of the first fill pattern if any
     * @returns {IFColor}
     */
    IFAttributes.Pattern.prototype.getFillColor = function () {
        return this._getFillColor(IFFillAttribute);
    };

    /**
     * Set the color of the first fill pattern if any,
     * automatically creating a new fill pattern if there's none
     * and automatically removing an fill if color is null
     * @param {IFColor} color
     */
    IFAttributes.Pattern.prototype.setFillColor = function (color) {
        this._setFillColor(IFFillAttribute, color);
    };

    /**
     * Get the color of the first stroke pattern if any
     * @returns {IFColor}
     */
    IFAttributes.Pattern.prototype.getStrokeColor = function () {
        return this._getFillColor(IFStrokeAttribute);
    };

    /**
     * Set the color of the first stroke pattern if any,
     * automatically creating a new stroke pattern if there's none
     * and automatically removing a stroke if color is null
     * @param {IFColor} color
     */
    IFAttributes.Pattern.prototype.setStrokeColor = function (color) {
        return this._setFillColor(IFStrokeAttribute, color);
    };

    /**
     * @param {IFPatternAttribute} patternClass
     * @returns {IFColor}
     * @private
     */
    IFAttributes.Pattern.prototype._getFillColor = function (patternClass) {
        var result = null;
        this.acceptChildren(function (node) {
            if (node.constructor == patternClass) {
                result = node.getColor();
                return false;
            }
        });

        return result;
    };

    /**
     * @param {IFPatternAttribute} patternClass
     * @param {IFColor} color
     * @private
     */
    IFAttributes.Pattern.prototype._setFillColor = function (patternClass, color) {
        if (this.acceptChildren(function (node) {
            if (node.constructor == patternClass) {
                // If there's no color, we'll remove instead
                if (!color) {
                    node.getParent().removeChild(node);
                } else {
                    node.setColor(color);
                }

                // return here as we're done
                return false;
            }
        }) === true) {
            if (color) {
                this.applyAttributeProperties(patternClass, ['val'], [color]);
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFAttributes Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    IFAttributes.prototype.validateInsertion = function (parent, reference) {
        // Allow getting added anywhere by default
        return true;
    };

    /**
     * Apply properties to a given attribute class. If the given attribute class does not
     * yet exist as child on the root of this attribute, it'll be created and appended.
     * Note that this function will do nothing if the attribute doesn't have the
     * container mixin.
     *
     * @param {Function} attrClass the node class to assign properties to
     * @param {Array<String>} properties the properties to assign
     * @param {Array<*>} values the values to assign
     */
    IFAttributes.prototype.applyAttributeProperties = function (attrClass, properties, values) {
        var targetNode = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child.constructor === attrClass) {
                targetNode = child;
                break;
            }
        }

        if (!targetNode) {
            targetNode = new attrClass();
            try {
                this.appendChild(targetNode);
            } catch (e) {
                // ok, some may fail
            }
        }

        targetNode.setProperties(properties, values);
    };

    /**
     * Assign all attribute from a given source attribute node. This will
     * remove all existing attribute, first.
     * Note that this function will do nothing if the attribute doesn't have the
     * container mixin.
     *
     * @param {IFAttributes} attribute the source attribute to assign from
     */
    IFAttributes.prototype.assignAttributesFrom = function (attribute) {
        // Remove all children of attribute and append the new cloned ones.
        // We'll take care by catching errors as sometimes, attribute insertion
        // validation may fail
        this.clearChildren();
        for (var child = attribute.getFirstChild(); child !== null; child = child.getNext()) {
            try {
                this.appendChild(child.clone());
            } catch (e) {
                // ignore
            }
        }
    };

    /** @override */
    IFAttributes.prototype.toString = function () {
        return "[IFAttributes]";
    };

    _.IFAttributes = IFAttributes;
})(this);