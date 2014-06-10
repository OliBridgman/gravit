(function (_) {

    /**
     * The applied style class
     * @class IFAppliedStyle
     * @extends IFStyle
     * @constructor
     */
    function IFAppliedStyle() {
        IFStyle.call(this);
        this._setDefaultProperties(IFAppliedStyle.GeometryProperties, IFAppliedStyle.VisualProperties);
    }

    IFObject.inherit(IFAppliedStyle, IFStyle);

    /**
     * Geometry properties
     */
    IFAppliedStyle.GeometryProperties = {
        // Whether the style is visible or not
        vs: true
    };

    /**
     * Visual properties
     */
    IFAppliedStyle.VisualProperties = {
        // The composite of the style
        cmp: IFPaintCanvas.CompositeOperator.SourceOver,
        // The opacity of the style
        opc: 1.0
    };

    /**
     * Returns the owner element of this style if any or null
     * @return {IFElement}
     */
    IFAppliedStyle.prototype.getOwnerElement = function () {
        for (var p = this.getParent(); p !== null; p = p.getParent()) {
            if (p instanceof IFElement) {
                return p;
            }
        }
        return null;
    };

    /** @override */
    IFAppliedStyle.prototype.prepareGeometryChange = function () {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(IFElement._Change.PrepareGeometryUpdate);
        }
    };

    /** @override */
    IFAppliedStyle.prototype.finishGeometryChange = function () {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(IFElement._Change.FinishGeometryUpdate);
        }
    };

    /** @override */
    IFAppliedStyle.prototype.visualChange = function () {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(IFElement._Change.InvalidationRequest);
        }
    };

    /** @override */
    IFAppliedStyle.prototype.store = function (blob) {
        if (IFStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFAppliedStyle.GeometryProperties);
            this.storeProperties(blob, IFAppliedStyle.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAppliedStyle.prototype.restore = function (blob) {
        if (IFStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFAppliedStyle.GeometryProperties);
            this.restoreProperties(blob, IFAppliedStyle.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFAppliedStyle.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFAppliedStyle.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFAppliedStyle.VisualProperties);
        IFNode.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFAppliedStyle.prototype.toString = function () {
        return "[IFAppliedStyle]";
    };

    _.IFAppliedStyle = IFAppliedStyle;
})(this);