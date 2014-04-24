(function (_) {

    /**
     * Attribute that does modify the input source without doing any painting at all
     * @class IFVectorAttribute
     * @extends IFDrawAttribute
     * @constructor
     */
    function IFVectorAttribute() {
        IFDrawAttribute.call(this);
    }

    GObject.inherit(IFVectorAttribute, IFDrawAttribute);

    /** @override */
    IFVectorAttribute.prototype.render = function (context, source, bbox) {
        // Let the effect take no place in outline
        var paintMode = context.configuration.paintMode;
        if (!context.configuration.isOutline(context)) {
            var newSource = this._createVectorSource(context, source, bbox) || source;
            this._renderChildren(context, newSource, bbox);
        } else {
            // in any other mode, do simply render the filter contents
            this._renderContents(context, source, bbox);
        }
    };

    /**
     * @param {GXPaintContext} context
     * @param {GXVertexSource} source
     * @param {GXRect} bbox
     * @returns {GXVertexSource}
     * @private
     */
    IFVectorAttribute.prototype._createVectorSource = function (context, source, bbox) {
        // NO-OP
        return source;
    };

    /** @override */
    IFVectorAttribute.prototype.toString = function () {
        return "[IFVectorAttribute]";
    };

    _.IFVectorAttribute = IFVectorAttribute;
})(this);