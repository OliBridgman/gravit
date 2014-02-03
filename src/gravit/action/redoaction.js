(function (_) {

    /**
     * Action for redo on the current document
     * @class EXRedoAction
     * @extends GUIAction
     * @constructor
     */
    function EXRedoAction() {
    };
    GObject.inherit(EXRedoAction, GUIAction);

    EXRedoAction.ID = 'edit.redo';
    EXRedoAction.TITLE = new GLocale.Key(EXRedoAction, "title");

    /**
     * @override
     */
    EXRedoAction.prototype.getId = function () {
        return EXRedoAction.ID;
    };

    /**
     * @override
     */
    EXRedoAction.prototype.getTitle = function () {
        var result = gLocale.get(EXRedoAction.TITLE);
        var document = gApp.getActiveDocument();
        if (document && document.getEditor().hasRedoState()) {
            result += " " + document.getEditor().getRedoStateName();
        }
        return result;
    };

    /**
     * @override
     */
    EXRedoAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    EXRedoAction.prototype.getGroup = function () {
        return "undo_redo";
    };

    /**
     * @override
     */
    EXRedoAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.META, 'z'];
    };

    /**
     * @override
     */
    EXRedoAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        return (document && document.getEditor().hasRedoState());
    };

    /**
     * @override
     */
    EXRedoAction.prototype.execute = function () {
        gApp.getActiveDocument().getEditor().redoState();
    };

    /** @override */
    EXRedoAction.prototype.toString = function () {
        return "[Object EXRedoAction]";
    };

    _.EXRedoAction = EXRedoAction;
})(this);