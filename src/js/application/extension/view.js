(function (_) {

    /**
     * Base class for a view
     * @class GView
     * @extends GEventTarget
     * @constructor
     */
    function GView() {
    };
    GObject.inherit(GView, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // GView.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the view requires an update like changed
     * title or enabled status
     * @class GView.UpdateEvent
     * @extends GEvent
     * @constructor
     */
    GView.UpdateEvent = function () {
    };
    GObject.inherit(GView.UpdateEvent, GEvent);

    /** @override */
    GView.UpdateEvent.prototype.toString = function () {
        return "[Object GView.UpdateEvent]";
    };

    GView.UPDATE_EVENT = new GView.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GView Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Get the unique id of the view.
     */
    GView.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the view
     * @return {String|GLocale.Key}
     */
    GView.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Whether the view is enabled or not.
     * @return {Boolean}
     */
    GView.prototype.isEnabled = function () {
        return true;
    };

    /** @override */
    GView.prototype.toString = function () {
        return "[Object GView]";
    };

    _.GView = GView;
})(this);