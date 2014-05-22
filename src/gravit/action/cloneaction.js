(function (_) {

    /**
     * Action for cloning the selection from the current document
     * @class GCloneAction
     * @extends GUIAction
     * @constructor
     */
    function GCloneAction() {
    };
    IFObject.inherit(GCloneAction, GUIAction);

    GCloneAction.ID = 'edit.clone';
    GCloneAction.TITLE = new IFLocale.Key(GCloneAction, "title");

    /**
     * @override
     */
    GCloneAction.prototype.getId = function () {
        return GCloneAction.ID;
    };

    /**
     * @override
     */
    GCloneAction.prototype.getTitle = function () {
        return GCloneAction.TITLE;
    };

    /**
     * @override
     */
    GCloneAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GCloneAction.prototype.getGroup = function () {
        return "selection";
    };

    /**
     * @override
     */
    GCloneAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'D'];
    };

    /**
     * @override
     */
    GCloneAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && document.getEditor().getSelection() != null;
    };

    /**
     * @override
     */
    GCloneAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().cloneSelection();
    };

    /** @override */
    GCloneAction.prototype.toString = function () {
        return "[Object GCloneAction]";
    };

    _.GCloneAction = GCloneAction;
})(this);