(function (_) {
    /**
     * An object representing an input event.
     * @class GInputEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    function GInputEvent() {
    }

    GObject.inherit(GInputEvent, GEvent);

    /** @override */
    GInputEvent.prototype.toString = function () {
        return "[Object GInputEvent(" + this._paramsToString() + ")]";
    };

    /** @private */
    GInputEvent.prototype._paramsToString = function () {
        return "";
    };

    _.GInputEvent = GInputEvent;
})(this);