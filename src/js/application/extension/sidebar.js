(function (_) {

    /**
     * Base class for an sidebar
     * @class GSidebar
     * @extends GView
     * @constructor
     */
    function GSidebar() {
        GView.call(this);
    };
    GObject.inherit(GSidebar, GView);

    /**
     * Get the icon code of the sidebar
     * @return {String|JQuery}
     */
    GSidebar.prototype.getIcon = function () {
        return null;
    };

    /**
     * Called to let the sidebar initialize on a given panel
     * @param {JQuery} htmlElement the panel to put the sidebar into
     */
    GSidebar.prototype.init = function (htmlElement) {
    };

    /**
     * Called whenever the sidebar gets activated
     */
    GSidebar.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called whenever the sidebar gets deactivated
     */
    GSidebar.prototype.deactivate = function () {
        // NO-OP
    };

    /** @override */
    GSidebar.prototype.toString = function () {
        return "[Object GSidebar]";
    };

    _.GSidebar = GSidebar;
})(this);