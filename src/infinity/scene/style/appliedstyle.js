(function (_) {

    /**
     * The applied style class
     * @class IFAppliedStyle
     * @extends IFStyle
     * @constructor
     */
    function IFAppliedStyle() {
        IFStyle.call(this);
        this._setDefaultProperties(IFAppliedStyle.VisualProperties);
    }

    IFObject.inherit(IFAppliedStyle, IFStyle);

    /**
     * Visual properties
     */
    IFAppliedStyle.VisualProperties = {
        // Whether the style is visible or not
        vs: true,
        // The composite of the style
        cmp: IFPaintCanvas.CompositeOperator.SourceOver,
        // The opacity of the style
        opc: 1.0
    };

    /** @override */
    IFAppliedStyle.prototype.store = function (blob) {
        if (IFStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFAppliedStyle.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAppliedStyle.prototype.restore = function (blob) {
        if (IFStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFAppliedStyle.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAppliedStyle.prototype.toString = function () {
        return "[IFAppliedStyle]";
    };

    _.IFAppliedStyle = IFAppliedStyle;
})(this);