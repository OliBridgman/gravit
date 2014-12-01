(function (_) {

    /**
     * Action for inverting the current selection
     * @class GInvertSelectionAction
     * @extends GAction
     * @constructor
     */
    function GInvertSelectionAction() {
    };
    GObject.inherit(GInvertSelectionAction, GAction);

    GInvertSelectionAction.ID = 'edit.invert-selection';
    GInvertSelectionAction.TITLE = new GLocale.Key(GInvertSelectionAction, "title");

    /**
     * @override
     */
    GInvertSelectionAction.prototype.getId = function () {
        return GInvertSelectionAction.ID;
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.getTitle = function () {
        return GInvertSelectionAction.TITLE;
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.getGroup = function () {
        return "select";
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.getShortcut = function () {
        return [GKey.Constant.SHIFT, GKey.Constant.META, 'A'];
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GInvertSelectionAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        var selection = [];
        scene.accept(function (node) {
            if (node instanceof GItem && node.getParent() instanceof GLayer && !node.hasFlag(GNode.Flag.Selected)) {
                selection.push(node);
            }
        });

        document.getEditor().updateSelection(false, selection);
    };

    /** @override */
    GInvertSelectionAction.prototype.toString = function () {
        return "[Object GInvertSelectionAction]";
    };

    _.GInvertSelectionAction = GInvertSelectionAction;
})(this);