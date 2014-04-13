(function (_) {

    /**
     * A base style
     * @class GXStyle
     * @extends GXNode
     * @mixes GXNode.Store
     * @constructor
     */
    function GXStyle() {
    }

    GObject.inheritAndMix(GXStyle, GXNode, [GXNode.Store]);

    /**
     * Style's mime-type
     * @type {string}
     */
    GXStyle.MIME_TYPE = "application/infinity+style";

    // -----------------------------------------------------------------------------------------------------------------
    // GXStyle.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on a style
     * @param {GXStyle} style the style that was hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class GXStyle.HitResult
     */
    GXStyle.HitResult = function (style, args) {
        this.style = style;
        this.data = args;
    };

    /**
     * The style that was hit
     * @type {GXStyle}
     */
    GXStyle.HitResult.prototype.style = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    GXStyle.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GXStyle Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GXStyle.prototype.validateInsertion = function (parent, reference) {
        // By default, a style can only be appended to a styleset
        return parent instanceof GXStyleSet;
    };

    /**
     * Called to paint this style providing the painting
     * context and the vertex source used for painting
     * @param {GXPaintContext} context the context used for painting
     * @parma {GXVertexSource} source the source vertices
     * @param {GRect} bbox the source geometry bbox
     */
    GXStyle.prototype.paint = function (context, source, bbox) {
        throw new Error("Not Supported.");
    };

    /**
     * Returns the bounding box of the style
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    GXStyle.prototype.getBBox = function (source) {
        return source;
    };

    /**
     * Called whenever a hit-test should be made on this style.
     * @parma {GXVertexSource} source the vertice source for the style
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance value for hit testing in view coordinates
     * @returns {GXStyle.HitResult} the style result or null for none
     */
    GXStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        return null;
    };

    /**
     * Returns the owner element in hiearchy of the style
     * @returns {GXElement}
     */
    GXStyle.prototype.getOwnerElement = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GXElement) {
                return p;
            }
        }
        return null;
    };

    /** @override */
    GXStyle.prototype._handleChange = function (change, args) {
        if (change === GXNode._Change.BeforeChildInsert || change === GXNode._Change.BeforeChildRemove) {
            this._notifyOwnerElementChange(GXElement._Change.PrepareGeometryUpdate);
        } else if (change === GXNode._Change.AfterChildInsert || change === GXNode._Change.AfterChildRemove) {
            this._notifyOwnerElementChange(GXElement._Change.FinishGeometryUpdate);
        }

        // Call super by default and be done with it
        GXNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Called to notify owner element about change
     * @param {Number} change
     * @param {Object} [args]
     * @private
     */
    GXStyle.prototype._notifyOwnerElementChange = function (change, args) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(change, args);
        }
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
    GXStyle.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
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
    GXStyle.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            return ownerElement._handleVisualChangeForProperties(change, args, properties);
        }
        return false;
    };

    /** @override */
    GXStyle.prototype.toString = function () {
        return "[GXStyle]";
    };

    _.GXStyle = GXStyle;
})(this);