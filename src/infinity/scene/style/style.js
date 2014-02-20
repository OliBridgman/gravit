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
     * @param {GXPaintContext} context
     * @parma {GXVertexSource} source
     */
    GXStyle.prototype.paint = function (context, source) {
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

    /**
     * Called to invalidate the owner element
     * @param {Boolean} geometry whether to invalidate the owner element's geometry
     * or not which means to only repaint the element
     * @private
     */
    GXStyle.prototype._invalidateOwnerElement = function (geometry) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(geometry ? GXElement._Change.ChildGeometryUpdate : GXElement._Change.InvalidationRequest, this);
        }
    };

    /** @override */
    GXStyle.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterChildInsert) {
            this._invalidateOwnerElement(true);
            GXNode.prototype._handleChange.call(this, change, args);
        } else if (change == GXNode._Change.AfterChildRemove) {
            this._invalidateOwnerElement(true);
            GXNode.prototype._handleChange.call(this, change, args);
        } else {
            // Call super by default and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
        }
    };

    /** @override */
    GXStyle.prototype.toString = function () {
        return "[GXStyle]";
    };

    _.GXStyle = GXStyle;
})(this);