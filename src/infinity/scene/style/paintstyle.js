(function (_) {

    /**
     * A base paint style
     * @class GXPaintStyle
     * @extends GXStyle
     * @constructor
     */
    function GXPaintStyle() {
        GXStyle.call(this);
    }

    GObject.inherit(GXPaintStyle, GXStyle);

    /** @override */
    GXPaintStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXStyleSet || parent instanceof GXVectorStyle;
    };

    /** @override */
    GXPaintStyle.prototype.toString = function () {
        return "[GXPaintStyle]";
    };

    _.GXPaintStyle = GXPaintStyle;
})(this);