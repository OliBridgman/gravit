(function (_) {

    /**
     * Attribute that contains other render attributes and works
     * with the actual content to draw itself, i.e. like effects.
     * If the draw attribute doesn't contain any children it is
     * supposed to do nothing.
     * @class IFDrawAttribute
     * @extends IFAttribute
     * @mixes IFAttribute.Render
     * @mixes GXNode.Container
     * @constructor
     */
    function IFDrawAttribute() {
        IFAttribute.call(this);
    }

    GObject.inheritAndMix(IFDrawAttribute, IFAttribute, [IFAttribute.Render, GXNode.Container]);

    /** @override */
    IFDrawAttribute.prototype.validateInsertion = function (parent, reference) {
        // Draw Attributes can only be inserted on root or other draw attributes
        return parent instanceof IFAttribute && parent.hasMixin(IFAttribute.Render) &&
            (parent instanceof IFAttributes || parent instanceof IFDrawAttribute);
    };

    /** @override */
    IFDrawAttribute.prototype.getBBox = function (source) {
        var result = source;
        var hasBBox = false;

        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node.hasMixin(IFAttribute.Render)) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                    hasBBox = true;
                }
            }
        }

        if (hasBBox) {
            var padding = this._getBBoxPadding();
            if (padding) {
                result = result.expanded(padding[0], padding[1], padding[2], padding[3]);
            }
        }

        return result;
    };

    /**
     * @return {Array<Number>} x,y,w,h paddings or null
     * for no padding
     * @private
     */
    IFDrawAttribute.prototype._getBBoxPadding = function () {
        // NO-OP
        return null;
    };

    /** @override */
    IFDrawAttribute.prototype.toString = function () {
        return "[IFDrawAttribute]";
    };

    _.IFDrawAttribute = IFDrawAttribute;
})(this);