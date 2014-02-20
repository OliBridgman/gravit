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

    GXStyle.prototype.getBBox = function (source) {
        return source;
    };

    GXStyle.prototype.getOwnerElement = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof GXElement) {
                return p;
            }
        }
        return null;
    };

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