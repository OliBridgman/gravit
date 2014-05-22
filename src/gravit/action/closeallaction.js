(function (_) {

    /**
     * Action closing all documents
     * @class EXCloseAllAction
     * @extends GUIAction
     * @constructor
     */
    function EXCloseAllAction() {
    };
    IFObject.inherit(EXCloseAllAction, GUIAction);

    EXCloseAllAction.ID = 'file.close-all';
    EXCloseAllAction.TITLE = new IFLocale.Key(EXCloseAllAction, "title");

    /**
     * @override
     */
    EXCloseAllAction.prototype.getId = function () {
        return EXCloseAllAction.ID;
    };

    /**
     * @override
     */
    EXCloseAllAction.prototype.getTitle = function () {
        return EXCloseAllAction.TITLE;
    };

    /**
     * @override
     */
    EXCloseAllAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    EXCloseAllAction.prototype.getGroup = function () {
        return "close";
    };

    /**
     * @override
     */
    EXCloseAllAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    EXCloseAllAction.prototype.execute = function () {
        while (!!gApp.getActiveDocument()) {
            gApp.closeDocument(gApp.getActiveDocument());
        }
    };

    /** @override */
    EXCloseAllAction.prototype.toString = function () {
        return "[Object EXCloseAllAction]";
    };

    _.EXCloseAllAction = EXCloseAllAction;
})(this);