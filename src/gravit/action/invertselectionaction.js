(function (_) {

    /**
     * Action for inverting the current selection
     * @class GInvertSelectionAction
     * @extends GAction
     * @constructor
     */
    function GInvertSelectionAction() {
    };
    IFObject.inherit(GInvertSelectionAction, GAction);

    GInvertSelectionAction.ID = 'edit.invert-selection';
    GInvertSelectionAction.TITLE = new IFLocale.Key(GInvertSelectionAction, "title");

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
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'A'];
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

        var source = null;
        if (scene.getProperty('singlePage')) {
            source = scene.getActivePage();
        } else {
            source = scene;
        }

        var selection = [];
        source.accept(function (node) {
            if (node instanceof IFItem && node.getParent() instanceof IFLayer && !node.hasFlag(IFNode.Flag.Selected)) {
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