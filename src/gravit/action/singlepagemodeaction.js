(function (_) {

    /**
     * Action for switching between single- and multi-page mode
     * @class EXSinglePageModeAction
     * @extends GUIAction
     * @constructor
     */
    function EXSinglePageModeAction() {
    };
    GObject.inherit(EXSinglePageModeAction, GUIAction);

    EXSinglePageModeAction.ID = 'view.mode.singlepage';
    EXSinglePageModeAction.TITLE = new GLocale.Key(EXSinglePageModeAction, 'title');

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.getId = function () {
        return EXSinglePageModeAction.ID;
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.getTitle = function () {
        return EXSinglePageModeAction.TITLE;
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.getGroup = function () {
        return "view-page";
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.isChecked = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (window) {
            return window.getView().getViewConfiguration().singlePageMode;
        }
        return false;
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXSinglePageModeAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        view.getViewConfiguration().singlePageMode = !view.getViewConfiguration().singlePageMode;
        view.invalidate();
    };

    /** @override */
    EXSinglePageModeAction.prototype.toString = function () {
        return "[Object EXSinglePageModeAction]";
    };

    _.EXSinglePageModeAction = EXSinglePageModeAction;
})(this);