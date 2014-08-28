(function (_) {

    /**
     * Action for showing / hiding the grid
     * @class GShowGridAction
     * @extends GAction
     * @constructor
     */
    function GShowGridAction() {
    };
    IFObject.inherit(GShowGridAction, GAction);

    GShowGridAction.ID = 'view.show-grid';
    GShowGridAction.TITLE = new IFLocale.Key(GShowGridAction, "title");

    /**
     * @override
     */
    GShowGridAction.prototype.getId = function () {
        return GShowGridAction.ID;
    };

    /**
     * @override
     */
    GShowGridAction.prototype.getTitle = function () {
        return GShowGridAction.TITLE;
    };

    /**
     * @override
     */
    GShowGridAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GShowGridAction.prototype.getGroup = function () {
        return "show";
    };

    /**
     * @override
     */
    GShowGridAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, IFKey.Constant.OPTION, 'G'];
    };

    /**
     * @override
     */
    GShowGridAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /** @override */
    GShowGridAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GShowGridAction.prototype.isChecked = function () {
        var window = gApp.getWindows().getActiveWindow();
        if (window) {
            return window.getView().getViewConfiguration().gridVisible === true;
        }
        return false;
    };

    /**
     * @override
     */
    GShowGridAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        view.getViewConfiguration().gridVisible = !view.getViewConfiguration().gridVisible;
        view.invalidate();
    };

    /** @override */
    GShowGridAction.prototype.toString = function () {
        return "[Object GShowGridAction]";
    };

    _.GShowGridAction = GShowGridAction;
})(this);