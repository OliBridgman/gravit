(function (_) {

    /**
     * A base attribute class
     * @class IFAttribute
     * @extends IFNode
     * @mixes IFNode.Store
     * @constructor
     */
    function IFAttribute() {
    }

    IFObject.inheritAndMix(IFAttribute, IFNode, [IFNode.Store]);

    /**
     * Attribute's mime-type
     * @type {string}
     */
    IFAttribute.MIME_TYPE = "application/infinity+attribute";


    // -----------------------------------------------------------------------------------------------------------------
    // IFAttribute.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on render attribute
     * @param {IFAttribute} attribute the render attribute that had been hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class IFAttribute.HitResult
     */
    IFAttribute.HitResult = function (attribute, args) {
        this.attribute = attribute;
        this.data = args;
    };

    /**
     * The attribute that had been hit
     * @type {IFAttribute}
     */
    IFAttribute.HitResult.prototype.attribute = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    IFAttribute.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFAttribute.Render Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin marking an attribute to be renderable
     * @class IFAttribute.Render
     * @mixin
     * @constructor
     */
    IFAttribute.Render = function() {
    }

    /**
     * Called to render this attribute providing the painting
     * context and the vertex source used for painting and the bbox
     * @param {IFPaintContext} context the context used for painting
     * @parma {IFVertexSource} source the source vertices
     * @param {GRect} bbox the source geometry bbox
     */
    IFAttribute.Render.prototype.render = function (context, source, bbox) {
        // by default, simply render our children if we're a container
        if (this.hasMixin(IFNode.Container)) {
            this._renderChildren(context, source, bbox);
        }
    };

    /**
     * Returns the bounding box of the attribute
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    IFAttribute.Render.prototype.getBBox = function (source) {
        // by default, either return children bbox for container or source
        if (this.hasMixin(IFNode.Container)) {
            return this._getChildrenBBox(source);
        } else {
            return source;
        }
    };

    /**
     * Called whenever a hit-test should be made on this attribute.
     * @parma {IFVertexSource} source the vertice source for the attribute
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance value for hit testing in view coordinates
     * @returns {IFAttribute.Render.HitResult} the attribute result or null for none
     */
    IFAttribute.Render.prototype.hitTest = function (source, location, transform, tolerance) {
        // by default, hit test children if this is a container
        if (this.hasMixin(IFNode.Container)) {
            return this._hitTestChildren(source, location, transform, tolerance);
        }
    };

    /** @private */
    IFAttribute.Render.prototype._renderChildren = function (context, source, bbox) {
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child.hasMixin(IFAttribute.Render)) {
                child.render(context, source, bbox);
            }
        }
    };

    /** @private */
    IFAttribute.Render.prototype._getChildrenBBox = function (source) {
        var result = source;
        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node.hasMixin(IFAttribute.Render)) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                }
            }
        }
        return result;
    };

    /** @private */
    IFAttribute.Render.prototype._hitTestChildren = function (source, location, transform, tolerance) {
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child.hasMixin(IFAttribute.Render)) {
                var result = child.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    /**
     * This will fire a change event for geometry updates on the owner element
     * whenever a given property has been changed that affected the geometry.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * geometrical changes
     * @return {Boolean} true if there was a property change that affected a
     * change of the geometry and was handled (false i.e. for no owner element)
     * @private
     */
    IFAttribute.Render.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            return ownerElement._handleGeometryChangeForProperties(change, args, properties);
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates on the owner element
     * whenever a given property has been changed that affected the visual.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * visual changes
     * @return {Boolean} true if there was a property change that affected a
     * visual change and was handled (false i.e. for no owner element)
     * @private
     */
    IFAttribute.Render.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            return ownerElement._handleVisualChangeForProperties(change, args, properties);
        }
        return false;
    };

    /** @override */
    IFAttribute.Render.prototype.toString = function () {
        return "[IFAttribute.Render]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFAttribute Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    IFAttribute.prototype.validateInsertion = function (parent, reference) {
        // By default, attribute can only be appended to other attribute
        return parent instanceof IFAttribute;
    };

    /**
     * Returns the owner element in hierarchy of the attribute
     * @returns {IFElement}
     */
    IFAttribute.prototype.getOwnerElement = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof IFElement) {
                return p;
            }
        }
        return null;
    };

    /** @override */
    IFAttribute.prototype._handleChange = function (change, args) {
        // Adding or removing render attribute need to notify parent
        if (change === IFNode._Change.BeforeChildInsert || change === IFNode._Change.BeforeChildRemove) {
            if (args instanceof IFAttribute && args.hasMixin(IFAttribute.Render)) {
                this._notifyOwnerElementChange(IFElement._Change.PrepareGeometryUpdate);
            }
        } else if (change === IFNode._Change.AfterChildInsert || change === IFNode._Change.AfterChildRemove) {
            if (args instanceof IFAttribute && args.hasMixin(IFAttribute.Render)) {
                this._notifyOwnerElementChange(IFElement._Change.FinishGeometryUpdate);
            }
        }

        // Call super by default and be done with it
        IFNode.prototype._handleChange.call(this, change, args);
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