(function (_) {
    /**
     * An object representing an input event.
     * @class IFInputEvent
     * @extends IFEvent
     * @constructor
     * @version 1.0
     */
    function IFInputEvent() {
    }

    IFObject.inherit(IFInputEvent, IFEvent);

    /** @override */
    IFInputEvent.prototype.toString = function () {
        return "[Object IFInputEvent(" + this._paramsToString() + ")]";
    };

    /** @private */
    IFInputEvent.prototype._paramsToString = function () {
        return "";
    };

    _.IFInputEvent = IFInputEvent;
})(this);