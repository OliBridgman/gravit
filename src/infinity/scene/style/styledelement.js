(function (_) {
    /**
     * Mixin to mark an element being styled
     * @class IFStyledElement
     * @extends IFStylable
     * @constructor
     * @mixin
     */
    IFStyledElement = function () {
    };
    IFObject.inherit(IFStyledElement, IFStylable);

    /** @override */
    IFStyledElement.prototype._stylePrepareGeometryChange = function () {
        this._notifyChange(IFElement._Change.PrepareGeometryUpdate);
    };

    /** @override */
    IFStyledElement.prototype._styleFinishGeometryChange = function () {
        this._notifyChange(IFElement._Change.FinishGeometryUpdate);
    };

    /** @override */
    IFStyledElement.prototype._styleRepaint = function () {
        this._notifyChange(IFElement._Change.InvalidationRequest);
    };

    /** @override */
    IFStyledElement.prototype.toString = function () {
        return "[Mixin IFStyledElement]";
    };

    _.IFStyledElement = IFStyledElement;
})(this);