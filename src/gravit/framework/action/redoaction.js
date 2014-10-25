(function (_) {

    /**
     * Action for redo on the current document
     * @class GRedoAction
     * @extends GAction
     * @constructor
     */
    function GRedoAction() {
    };
    GObject.inherit(GRedoAction, GAction);

    GRedoAction.ID = 'edit.redo';
    GRedoAction.TITLE = new GLocale.Key(GRedoAction, "title");

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
        return [GKey.Constant.SHIFT, GKey.Constant.META, 'z'];
    };

    /**
     * @override
     */
    GRedoAction.prototype.isEnabled = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            return true;
        }

        if (gApp.getActiveDocument() && gApp.getActiveDocument().getEditor().hasRedoState()) {
            return true;
        }

        return false;
    };

    /**
     * @override
     */
    GRedoAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('redo');
        } else {
            gApp.getActiveDocument().getEditor().redoState();
        }
    };

    /** @override */
    GRedoAction.prototype.toString = function () {
        return "[Object GRedoAction]";
    };

    _.GRedoAction = GRedoAction;
})(this);