(function (_) {

    /**
     * Action for grouping the selection together
     * @class GGroupAction
     * @extends GAction
     * @constructor
     */
    function GGroupAction() {
    };
    IFObject.inherit(GGroupAction, GAction);

    GGroupAction.ID = 'modify.group';
    GGroupAction.TITLE = new IFLocale.Key(GGroupAction, "title");

    /**
     * @override
     */
    GGroupAction.prototype.getId = function () {
        return GGroupAction.ID;
    };

    /**
     * @override
     */
    GGroupAction.prototype.getTitle = function () {
        return GGroupAction.TITLE;
    };

    /**
     * @override
     */
    GGroupAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GGroupAction.prototype.getGroup = function () {
        return "structure-group";
    };

    /**
     * @override
     */
    GGroupAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'G'];
    };

    /**
     * @override
     */
    GGroupAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            return selection && selection.length > 1;
        }
        return false;
    };

    /** @override */
    GGroupAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        var selection = editor.getSelection();

        editor.beginTransaction();
        try {
            // Create our group (= shapeSet)
            var group = new IFShapeSet();

            // Collect all items to be added to the group
            var itemsToGroup = [];
            for (var i = 0; i < selection.length; ++i) {
                var item = selection[i];
                if (item.validateInsertion(group)) {
                    itemsToGroup.push(item);
                }
            }

            if (itemsToGroup.length > 0) {
                // Add items to group
                for (var i = 0; i < itemsToGroup.length; ++i) {
                    var item = itemsToGroup[i];
                    item.getParent().removeChild(item);
                    group.appendChild(item);
                }

                // Insert group
                editor.insertElements([group], true, true);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Group');
        }
    };

    /** @override */
    GGroupAction.prototype.toString = function () {
        return "[Object GGroupAction]";
    };

    _.GGroupAction = GGroupAction;
})(this);