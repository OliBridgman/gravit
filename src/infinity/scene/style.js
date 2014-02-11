(function (_) {

    /**
     * A base vector style
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
        return parent instanceof GXStyle;
    };

    /** @override */
    GXStyle.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            //
            return true;
        }
        return false;
    };

    /** @override */
    GXStyle.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            return true;
        }
        return false;
    };

    /**
     * Called to paint this style providing the painting
     * context and the vertex source used for painting
     * @param {GXPaintContext} context
     * @parma {GXVertexSource} source
     */
    GXStyle.prototype.paint = function (context, source) {


        // TODO : Honor this.$odd (even/odd fill)
        context.canvas.putVertices(source);//new GXVertexPixelAligner(this));

        // Paint our styles
        // TODO : Get this right!!!
        // TODO : Take care on this.configuration.paintMode === GXPaintConfiguration.PaintMode.Fast to avoid painting too fancy stuff,
        // though this properly should be moved into the general effects handler (raster effects) so that it'll affects layers as well
        context.canvas.fillVertices(GXColor.parseColor('rgb180,50,50,25'));
        context.canvas.strokeVertices(GXColor.parseColor('black'));
    };

    /** @override */
    GXStyle.prototype.toString = function () {
        return "[GXStyle]";
    };

    _.GXStyle = GXStyle;
})(this);