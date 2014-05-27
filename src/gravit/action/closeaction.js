(function (_) {

    /**
     * Action closing a document
     * @class GCloseAction
     * @extends GUIAction
     * @constructor
     */
    function GCloseAction() {
    };
    IFObject.inherit(GCloseAction, GUIAction);

    GCloseAction.ID = "file.close";
    GCloseAction.TITLE = new IFLocale.Key(GCloseAction, "title");

    /**
     * @override
     */
    GCloseAction.prototype.getId = function () {
        return GCloseAction.ID;
    };

    /**
     * @override
     */
    GCloseAction.prototype.getTitle = function () {
        return GCloseAction.TITLE;
    };

    /**
     * @override
     */
    GCloseAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GCloseAction.prototype.getGroup = function () {
        return "close";
    };

    /**
     * @override
     */
    GCloseAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'Q'];
    };

    /**
     * @override
     */
    GCloseAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    GCloseAction.prototype.execute = function () {
        gApp.getWindows().closeWindow(gApp.getWindows().getActiveWindow());
    };

    /** @override */
    GCloseAction.prototype.toString = function () {
        return "[Object GCloseAction]";
    };

    _.GCloseAction = GCloseAction;
})(this);