(function (_) {

    /**
     * Action closing a document
     * @class EXCloseAction
     * @extends GUIAction
     * @constructor
     */
    function EXCloseAction() {
    };
    IFObject.inherit(EXCloseAction, GUIAction);

    EXCloseAction.ID = "file.close";
    EXCloseAction.TITLE = new IFLocale.Key(EXCloseAction, "title");

    /**
     * @override
     */
    EXCloseAction.prototype.getId = function () {
        return EXCloseAction.ID;
    };

    /**
     * @override
     */
    EXCloseAction.prototype.getTitle = function () {
        return EXCloseAction.TITLE;
    };

    /**
     * @override
     */
    EXCloseAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXCloseAction.prototype.getGroup = function () {
        return "close";
    };

    /**
     * @override
     */
    EXCloseAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'Q'];
    };

    /**
     * @override
     */
    EXCloseAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXCloseAction.prototype.execute = function () {
        gApp.getWindows().closeWindow(gApp.getWindows().getActiveWindow());
    };

    /** @override */
    EXCloseAction.prototype.toString = function () {
        return "[Object EXCloseAction]";
    };

    _.EXCloseAction = EXCloseAction;
})(this);