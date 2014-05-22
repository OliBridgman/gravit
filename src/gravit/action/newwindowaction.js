(function (_) {

    /**
     * Action for cloning the current view
     * @class EXNewWindowAction
     * @extends GUIAction
     * @constructor
     */
    function EXNewWindowAction() {
    };
    IFObject.inherit(EXNewWindowAction, GUIAction);

    EXNewWindowAction.ID = 'view.clone';
    EXNewWindowAction.TITLE = new IFLocale.Key(EXNewWindowAction, "title");

    /**
     * @override
     */
    EXNewWindowAction.prototype.getId = function () {
        return EXNewWindowAction.ID;
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.getTitle = function () {
        return EXNewWindowAction.TITLE;
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.getGroup = function () {
        return "view";
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, IFKey.Constant.OPTION, 'N'];
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXNewWindowAction.prototype.execute = function () {
        gApp.getWindows().addWindow(gApp.getWindows().getActiveWindow());
    };

    /** @override */
    EXNewWindowAction.prototype.toString = function () {
        return "[Object EXNewWindowAction]";
    };

    _.EXNewWindowAction = EXNewWindowAction;
})(this);