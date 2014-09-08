(function (_) {
    /**
     * An object representing an event.
     * @class IFEvent
     * @extends IFObject
     * @constructor
     * @version 1.0
     */
    function IFEvent() {
    }

    IFObject.inherit(IFEvent, IFObject);

    /** @private */
    IFEvent.prototype._paramsToString = function () {
        return "";
    }

    _.IFEvent = IFEvent;
})(this);