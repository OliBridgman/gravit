(function (_) {
    /**
     * An object representing an event.
     * @class GEvent
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GEvent() {
    }

    GObject.inherit(GEvent, GObject);

    /** @private */
    GEvent.prototype._paramsToString = function () {
        return "";
    }

    _.GEvent = GEvent;
})(this);