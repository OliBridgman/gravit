(function (_) {

    /**
     * A base attribute class
     * @class IFAttribute
     * @extends GXNode
     * @mixes GXNode.Store
     * @constructor
     */
    function IFAttribute() {
    }

    GObject.inheritAndMix(IFAttribute, GXNode, [GXNode.Store]);

    /**
     * Attribute's mime-type
     * @type {string}
     */
    IFAttribute.MIME_TYPE = "application/infinity+attribute";

    /** @override */
    IFAttribute.prototype.validateInsertion = function (parent, reference) {
        // By default, attribute can only be appended to other attribute
        return parent instanceof IFAttribute;
    };

    /**
     * Apply properties to a given attribute class. If the given attribute class does not
     * yet exist as child on the root of this attribute, it'll be created and appended.
     * Note that this function will do nothing if the attribute doesn't have the
     * container mixin.
     *
     * @param {IFAttribute} attrClass the node class to assign properties to
     * @param {Array<String>} properties the properties to assign
     * @param {Array<*>} values the values to assign
     */
    IFAttribute.prototype.applySubAttrProperties = function (attrClass, properties, values) {
        var targetNode = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child.constructor === attrClass) {
                targetNode = child;
                break;
            }
        }

        if (!targetNode) {
            targetNode = new attrClass();
            this.appendChild(targetNode);
        }

        targetNode.setProperties(properties, values);
    };

    /**
     * Assign all attribute from a given source attribute node. This will
     * remove all existing attribute, first.
     * Note that this function will do nothing if the attribute doesn't have the
     * container mixin.
     *
     * @param {IFAttribute} attribute the source attribute to assign from
     */
    IFAttribute.prototype.assignSubAttributesFrom = function (attribute) {
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

    /**
     * Returns the owner element in hierarchy of the attribute
     * @returns {GXElement}
     */
    IFAttribute.prototype.getOwnerElement = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GXElement) {
                return p;
            }
        }
        return null;
    };

    /**
     * Called to notify owner element about change
     * @param {Number} change
     * @param {Object} [args]
     * @private
     */
    IFAttribute.prototype._notifyOwnerElementChange = function (change, args) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(change, args);
        }
    };

    /** @override */
    IFAttribute.prototype.toString = function () {
        return "[IFAttribute]";
    };

    _.IFAttribute = IFAttribute;
})(this);