(function (_) {

    /**
     * Base class for an action
     * @class GAction
     * @extends GObject
     * @constructor
     */
    function GAction() {
    };
    GObject.inherit(GAction, GObject);

    /**
     * Get the id of the action
     * @return {String}
     * @version 1.0
     */
    GAction.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the action
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GAction.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the category of the action,
     * returns null by default
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GAction.prototype.getCategory = function () {
        return null;
    };

    /**
     * Get the group of the action
     * @return {String}
     * @version 1.0
     */
    GAction.prototype.getGroup = function () {
        return null;
    };

    /**
     * Get the default shortcut of the action
     * @return {Array<Number>}
     * @version 1.0
     */
    GAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * Get the enabled status of the action
     * @return {Boolean} true if enabled, false if not
     * @version 1.0
     */
    GAction.prototype.isEnabled = function () {
        // Enabled by default
        return true;
    };

    /**
     * Whether this action is checkable or not
     * @return {Boolean} true if checkable, false if not
     */
    GAction.prototype.isCheckable = function () {
        // Not checkable by default
        return false;
    };

    /**
     * Get the checked status of the action
     * @return {Boolean} true if checked, false if not
     * @version 1.0
     */
    GAction.prototype.isChecked = function () {
        // Not checked by default
        return false;
    };

    /**
     * Called to check if the action is available or not
     * @return {Boolean} true if available, false if not
     */
    GAction.prototype.isAvailable = function () {
        // Available by default
        return true;
    };

    /**
     * Execute the action
     * @version 1.0
     */
    GAction.prototype.execute = function () {
        throw new Error("Not Supported");
    };

    /** @override */
    GAction.prototype.toString = function () {
        return "[Object GAction]";
    };

    _.GAction = GAction;
})(this);