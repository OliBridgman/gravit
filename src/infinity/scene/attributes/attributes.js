(function (_) {

    /**
     * A base attributes class
     * @class GXAttributes
     * @extends GXNode
     * @mixes GXNode.Store
     * @constructor
     */
    function GXAttributes() {
    }

    GObject.inheritAndMix(GXAttributes, GXNode, [GXNode.Store]);

    /**
     * Attributes' mime-type
     * @type {string}
     */
    GXAttributes.MIME_TYPE = "application/infinity+attributes";

    /** @override */
    GXAttributes.prototype.validateInsertion = function (parent, reference) {
        // By default, attributes can only be appended to other attributes
        return parent instanceof GXAttributes;
    };

    /**
     * Apply properties to a given attributes class. If the given attributes class does not
     * yet exist as child on the root of this attributes, it'll be created and appended.
     * Note that this function will do nothing if the attributes doesn't have the
     * container mixin.
     *
     * @param {GXAttributes} attrClass the node class to assign properties to
     * @param {Array<String>} properties the properties to assign
     * @param {Array<*>} values the values to assign
     */
    GXAttributes.prototype.applySubAttrProperties = function (attrClass, properties, values) {
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
     * Assign all attributes from a given source attributes node. This will
     * remove all existing attributes, first.
     * Note that this function will do nothing if the attributes doesn't have the
     * container mixin.
     *
     * @param {GXAttributes} attributes the source attributes to assign from
     */
    GXAttributes.prototype.assignSubAttributesFrom = function (attributes) {
        // Remove all children of attributes and append the new cloned ones.
        // We'll take care by catching errors as sometimes, attributes insertion
        // validation may fail
        this.clearChildren();
        for (var child = attributes.getFirstChild(); child !== null; child = child.getNext()) {
            try {
                this.appendChild(child.clone());
            } catch (e) {
                // ignore
            }
        }
    };

    /**
     * Returns the owner element in hierarchy of the attributes
     * @returns {GXElement}
     */
    GXAttributes.prototype.getOwnerElement = function () {
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
    GXAttributes.prototype._notifyOwnerElementChange = function (change, args) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(change, args);
        }
    };

    /** @override */
    GXAttributes.prototype.toString = function () {
        return "[GXAttributes]";
    };

    _.GXAttributes = GXAttributes;
})(this);