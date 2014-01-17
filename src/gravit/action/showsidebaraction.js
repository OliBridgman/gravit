(function (_) {

    /**
     * Action for showing / hiding the sidebar
     * @class EXShowSidebarAction
     * @extends GUIAction
     * @constructor
     */
    function EXShowSidebarAction() {
    };
    GObject.inherit(EXShowSidebarAction, GUIAction);

    EXShowSidebarAction.ID = 'window.sidebar';
    EXShowSidebarAction.TITLE = new GLocale.Key(EXShowSidebarAction, "title");

    /**
     * @override
     */
    EXShowSidebarAction.prototype.getId = function () {
        return EXShowSidebarAction.ID;
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.getTitle = function () {
        return EXShowSidebarAction.TITLE;
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.getCategory = function () {
        return GUIApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.getGroup = function () {
        return "parts";
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.getShortcut = function () {
        return ['F4'];
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.isChecked = function () {
        return gApp.isPartVisible(EXApplication.Part.Sidebar);
    };

    /**
     * @override
     */
    EXShowSidebarAction.prototype.execute = function () {
        gApp.setPartVisible(EXApplication.Part.Sidebar, !gApp.isPartVisible(EXApplication.Part.Sidebar));
    };

    /** @override */
    EXShowSidebarAction.prototype.toString = function () {
        return "[Object EXShowSidebarAction]";
    };

    _.EXShowSidebarAction = EXShowSidebarAction;
})(this);