(function (_) {

    /**
     * Action for showing the shortcut map
     * @class EXShortcutMapAction
     * @extends GUIAction
     * @constructor
     */
    function EXShortcutMapAction() {
    };
    GObject.inherit(EXShortcutMapAction, GUIAction);

    EXShortcutMapAction.ID = 'help.shortcutmap';
    EXShortcutMapAction.TITLE = new GLocale.Key(EXShortcutMapAction, "title");

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getId = function () {
        return EXShortcutMapAction.ID;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getTitle = function () {
        return EXShortcutMapAction.TITLE;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_HELP;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getGroup = function () {
        return "help";
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.execute = function () {
        gApp.getShortcutMap().open();
    };

    /** @override */
    EXShortcutMapAction.prototype.toString = function () {
        return "[Object EXShortcutMapAction]";
    };

    _.EXShortcutMapAction = EXShortcutMapAction;
})(this);