(function (_) {
    /**
     * An object representing an input event.
     * @class GUIInputEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    function GUIInputEvent() {
    }

    GObject.inherit(GUIInputEvent, GEvent);

    /** @override */
    GUIInputEvent.prototype.toString = function () {
        return "[Object GUIInputEvent(" + this._paramsToString() + ")]";
    };

    /** @private */
    GUIInputEvent.prototype._paramsToString = function () {
        return "";
    };

    _.GUIInputEvent = GUIInputEvent;
})(this);