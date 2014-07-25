(function (_) {

    /**
     * Action for redo on the current document
     * @class GRedoAction
     * @extends GAction
     * @constructor
     */
    function GRedoAction() {
    };
    IFObject.inherit(GRedoAction, GAction);

    GRedoAction.ID = 'edit.redo';
    GRedoAction.TITLE = new IFLocale.Key(GRedoAction, "title");

    /**
     * @override
     */
    GRedoAction.prototype.getId = function () {
        return GRedoAction.ID;
    };

    /**
     * @override
     */
    GRedoAction.prototype.getTitle = function () {
        var result = ifLocale.get(GRedoAction.TITLE);
        var document = gApp.getActiveDocument();
        if (document && document.getEditor().hasRedoState()) {
            result += " " + document.getEditor().getRedoStateName();
        }
        return result;
    };

    /**
     * @override
     */
    GRedoAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GRedoAction.prototype.getGroup = function () {
        return "undo_redo";
    };

    /**
     * @override
     */
    GRedoAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'z'];
    };

    /**
     * @override
     */
    GRedoAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return (document && document.getEditor().hasRedoState());
    };

    /**
     * @override
     */
    GRedoAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().redoState();
    };

    /** @override */
    GRedoAction.prototype.toString = function () {
        return "[Object GRedoAction]";
    };

    _.GRedoAction = GRedoAction;
})(this);