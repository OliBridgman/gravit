(function (_) {

    /**
     * Action for deleting the selection from the current document
     * @class GDeleteAction
     * @extends GUIAction
     * @constructor
     */
    function GDeleteAction() {
    };
    IFObject.inherit(GDeleteAction, GUIAction);

    GDeleteAction.ID = 'edit.delete';
    GDeleteAction.TITLE = new IFLocale.Key(GDeleteAction, "title");

    /**
     * @override
     */
    GDeleteAction.prototype.getId = function () {
        return GDeleteAction.ID;
    };

    /**
     * @override
     */
    GDeleteAction.prototype.getTitle = function () {
        return GDeleteAction.TITLE;
    };

    /**
     * @override
     */
    GDeleteAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GDeleteAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GDeleteAction.prototype.getShortcut = function () {
        return [IFKey.Constant.REMOVE];
    };

    /**
     * @override
     */
    GDeleteAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return document && !!document.getEditor().getSelection();
    };

    /**
     * @override
     */
    GDeleteAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        editor.deleteSelection();
    };

    /** @override */
    GDeleteAction.prototype.toString = function () {
        return "[Object GDeleteAction]";
    };

    _.GDeleteAction = GDeleteAction;
})(this);