(function (_) {

    /**
     * Base class for an action
     * @class GUIAction
     * @extends GObject
     * @constructor
     */
    function GUIAction() {
    };
    GObject.inherit(GUIAction, GObject);

    /**
     * Get the id of the action
     * @return {String}
     * @version 1.0
     */
    GUIAction.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the action
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GUIAction.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the category of the action,
     * returns null by default
     * @return {GLocale.Key|String}
     * @version 1.0
     */
    GUIAction.prototype.getCategory = function () {
        return null;
    };

    /**
     * Get the group of the action
     * @return {String}
     * @version 1.0
     */
    GUIAction.prototype.getGroup = function () {
        return null;
    };

    /**
     * Get the default shortcut of the action
     * @return {Array<Number>}
     * @version 1.0
     */
    GUIAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * Get the enabled status of the action
     * @return {Boolean} true if enabled, false if not
     * @version 1.0
     */
    GUIAction.prototype.isEnabled = function () {
        // Enabled by default
        return true;
    };

    /**
     * Get the checked status of the action
     * @return {Boolean} true if checked, false if not
     * @version 1.0
     */
    GUIAction.prototype.isChecked = function () {
        // Not checked by default
        return false;
    };

    /**
     * Called to check if the action is available or not
     * @return {Boolean} true if available, false if not
     */
    GUIAction.prototype.isAvailable = function () {
        // Available by default
        return true;
    };

    /**
     * Execute the action
     * @version 1.0
     */
    GUIAction.prototype.execute = function () {
        throw new Error("Not Supported");
    };

    /** @override */
    GUIAction.prototype.toString = function () {
        return "[Object GUIAction]";
    };

    _.GUIAction = GUIAction;
})(this);