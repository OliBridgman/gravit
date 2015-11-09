(function (_) {

    /**
     * Action for deleting the selection from the current document
     * @class GDeleteAction
     * @extends GAction
     * @constructor
     */
    function GDeleteAction() {
    };
    GObject.inherit(GDeleteAction, GAction);

    GDeleteAction.ID = 'edit.delete';
    GDeleteAction.TITLE = new GLocale.Key(GDeleteAction, "title");

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
        return [GKey.Constant.REMOVE];
    };

    /**
     * @override
     */
    GDeleteAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();

        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i] instanceof GItem) {
                        return true;
                    }
                }
            }
        }

        return false;
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