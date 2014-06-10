(function (_) {

    /**
     * The inline style class
     * @class IFInlineStyle
     * @extends IFAppliedStyle
     * @mixes IFNode.Container
     * @constructor
     */
    function IFInlineStyle() {
        IFAppliedStyle.call(this);
    }

    IFNode.inheritAndMix('style', IFInlineStyle, IFAppliedStyle, [IFNode.Container]);

    /** @override */
    IFInlineStyle.prototype.toString = function () {
        return "[IFInlineStyle]";
    };

    _.IFInlineStyle = IFInlineStyle;
})(this);