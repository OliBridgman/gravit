(function (_) {
    /**
     * An object representing an event.
     * @class GEvent
     * @extends IFObject
     * @constructor
     * @version 1.0
     */
    function GEvent() {
    }

    IFObject.inherit(GEvent, IFObject);

    /** @private */
    GEvent.prototype._paramsToString = function () {
        return "";
    }

    _.GEvent = GEvent;
})(this);