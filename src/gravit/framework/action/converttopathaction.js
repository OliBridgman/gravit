(function (_) {

    /**
     * Action for converting selected PathBase descendant shapes into Path elements
     * @class GConvertToPathAction
     * @extends GAction
     * @constructor
     */
    function GConvertToPathAction() {
    };
    IFObject.inherit(GConvertToPathAction, GAction);

    GConvertToPathAction.ID = 'modify.converttopath';
    GConvertToPathAction.TITLE = new IFLocale.Key(GConvertToPathAction, "title");

    /**
     * @override
     */
    GConvertToPathAction.prototype.getId = function () {
        return GConvertToPathAction.ID;
    };

    /**
     * @override
     */
    GConvertToPathAction.prototype.getTitle = function () {
        return GConvertToPathAction.TITLE;
    };

    /**
     * @override
     */
    GConvertToPathAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATHS;
    };

    /**
     * @override
     */
    GConvertToPathAction.prototype.getGroup = function () {
        return "structure/modify";
    };

    /**
     * @override
     */
    GConvertToPathAction.prototype.getShortcut = function () {
        return [];
    };

    /**
     * @override
     */
    GConvertToPathAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();

        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i] instanceof IFPathBase && !(selection[i] instanceof IFPath) ||
                            selection[i].hasMixin(IFVertexSource)) {

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
    GConvertToPathAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        editor.convertSelectionToPaths();
    };

    /** @override */
    GConvertToPathAction.prototype.toString = function () {
        return "[Object GConvertToPathAction]";
    };

    _.GConvertToPathAction = GConvertToPathAction;
})(this);