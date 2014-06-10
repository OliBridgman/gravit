(function (_) {

    /**
     * The linked style class
     * @class IFLinkedStyle
     * @extends IFAppliedStyle
     * @constructor
     */
    function IFLinkedStyle() {
        IFAppliedStyle.call(this);
    }

    IFNode.inherit('lnStyle', IFLinkedStyle, IFAppliedStyle);

    /**
     * @type {IFStyle}
     * @private
     */
    IFLinkedStyle.prototype._styleReference = null;

    /** @override */
    IFLinkedStyle.prototype.getActualStyle = function () {
        return this._styleReference;
    };

    /** @override */
    IFLinkedStyle.prototype.toString = function () {
        return "[IFLinkedStyle]";
    };

    _.IFLinkedStyle = IFLinkedStyle;
})(this);