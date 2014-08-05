(function (_) {

    /**
     * Action for selecting everything
     * @class GSelectAllAction
     * @extends GAction
     * @constructor
     */
    function GSelectAllAction() {
    };
    IFObject.inherit(GSelectAllAction, GAction);

    GSelectAllAction.ID = 'edit.select-all';
    GSelectAllAction.TITLE = new IFLocale.Key(GSelectAllAction, "title");

    /**
     * @override
     */
    GSelectAllAction.prototype.getId = function () {
        return GSelectAllAction.ID;
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.getTitle = function () {
        return GSelectAllAction.TITLE;
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.getGroup = function () {
        return "select";
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'A'];
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.isEnabled = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            return true;
        }

        if (gApp.getActiveDocument()) {
            return true;
        }

        return false;
    };

    /**
     * @override
     */
    GSelectAllAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('selectAll');
        } else {
            var editor = gApp.getActiveDocument().getEditor();
            var scene = gApp.getActiveDocument().getScene();

            var source = null;
            if (scene.getProperty('singlePage')) {
                source = scene.getActivePage();
            } else {
                source = scene;
            }

            var selection = [];
            source.accept(function (node) {
                if (node instanceof IFItem && node.getParent() instanceof IFLayer) {
                    selection.push(node);
                }
            });

            editor.updateSelection(false, selection);
        }
    };

    /** @override */
    GSelectAllAction.prototype.toString = function () {
        return "[Object GSelectAllAction]";
    };

    _.GSelectAllAction = GSelectAllAction;
})(this);