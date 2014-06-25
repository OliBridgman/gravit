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
        // The blend mode of the style
        blm: IFPaintCanvas.BlendMode.Normal,
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
        IFStyle.prototype.prepareGeometryChange.call(this);
    };

    /** @override */
    IFAppliedStyle.prototype.finishGeometryChange = function () {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(IFElement._Change.FinishGeometryUpdate);
        }
        IFStyle.prototype.finishGeometryChange.call(this);
    };

    /** @override */
    IFAppliedStyle.prototype.visualChange = function () {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            ownerElement._notifyChange(IFElement._Change.InvalidationRequest);
        }
        IFStyle.prototype.visualChange.call(this);
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
    IFAppliedStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFStyleSet;
    };

    /** @override */
    IFAppliedStyle.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFAppliedStyle.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFAppliedStyle.VisualProperties);
        IFStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFAppliedStyle.prototype.toString = function () {
        return "[IFAppliedStyle]";
    };

    _.IFAppliedStyle = IFAppliedStyle;
})(this);