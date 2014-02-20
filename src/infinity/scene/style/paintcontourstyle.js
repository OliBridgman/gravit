(function (_) {

    /**
     * A contour paint style
     * @class GXPaintContourStyle
     * @extends GXPaintFillStyle
     * @constructor
     */
    function GXPaintContourStyle() {
        this.$fill = GXColor.parseCSSColor('blue');
    }

    GXNode.inherit("contour", GXPaintContourStyle, GXPaintFillStyle);

    var sw = 20;

    /** @override */
    GXPaintContourStyle.prototype.paint = function (context, source) {
        context.canvas.putVertices(source);
        context.canvas.strokeVertices(this.$fill, sw);
    };

    /** @override */
    GXPaintContourStyle.prototype.getBBox = function (source) {
        var sw2 = sw / 2;
        return source.expanded(sw2, sw2, sw2, sw2);
    };

    /** @override */
    GXPaintContourStyle.prototype.toString = function () {
        return "[GXPaintContourStyle]";
    };

    _.GXPaintContourStyle = GXPaintContourStyle;
})(this);