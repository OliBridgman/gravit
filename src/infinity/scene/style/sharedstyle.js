(function (_) {

    /**
     * The shared style class
     * @class IFSharedStyle
     * @extends IFStyle
     * @mixes IFNode.Container
     * @constructor
     */
    function IFSharedStyle() {
        IFStyle.call(this);
    }

    IFNode.inheritAndMix('sharedStyle', IFSharedStyle, IFStyle, [IFNode.Container]);

    /** @override */
    IFSharedStyle.prototype.toString = function () {
        return "[IFSharedStyle]";
    };

    _.IFSharedStyle = IFSharedStyle;
})(this);