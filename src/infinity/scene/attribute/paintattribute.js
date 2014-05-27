(function (_) {

    /**
     * Attribute that does the actual paint like fill,stroke,image etc.
     * This attribute will always be at the end of any chain.
     * @class IFPaintAttribute
     * @extends IFAttribute
     * @mixes IFAttribute.Render
     * @constructor
     */
    function IFPaintAttribute() {
        IFAttribute.call(this);
    }

    IFObject.inheritAndMix(IFPaintAttribute, IFAttribute, [IFAttribute.Render]);

    /** @override */
    IFPaintAttribute.prototype.validateInsertion = function (parent, reference) {
        // Paints can be appended only to render root and draw attributes
        return parent instanceof IFAttribute && parent.hasMixin(IFAttribute.Render) &&
            (parent instanceof IFAttributes || parent instanceof IFDrawAttribute);
    };

    /** @override */
    IFPaintAttribute.prototype.toString = function () {
        return "[IFPaintAttribute]";
    };

    _.IFPaintAttribute = IFPaintAttribute;
})(this);