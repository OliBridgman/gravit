(function (_) {

    /**
     * Action for selecting everything
     * @class GSelectAllAction
     * @extends GAction
     * @constructor
     */
    function GSelectAllAction() {
    };
    GObject.inherit(GSelectAllAction, GAction);

    GSelectAllAction.ID = 'edit.select-all';
    GSelectAllAction.TITLE = new GLocale.Key(GSelectAllAction, "title");

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
        return [GKey.Constant.META, 'A'];
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

            var selection = [];
            scene.accept(function (node) {
                if (node instanceof GItem && node.getParent() instanceof GLayer) {
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