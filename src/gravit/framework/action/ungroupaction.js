(function (_) {

    /**
     * Action for ungrouping the selection
     * @class GUngroupAction
     * @extends GAction
     * @constructor
     */
    function GUngroupAction() {
    };
    IFObject.inherit(GUngroupAction, GAction);

    GUngroupAction.ID = 'modify.ungroup';
    GUngroupAction.TITLE = new IFLocale.Key(GUngroupAction, "title");

    /**
     * @override
     */
    GUngroupAction.prototype.getId = function () {
        return GUngroupAction.ID;
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getTitle = function () {
        return GUngroupAction.TITLE;
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getGroup = function () {
        return "structure-group";
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getShortcut = function () {
        return [IFKey.Constant.SHIFT, IFKey.Constant.META, 'G'];
    };

    /**
     * @override
     */
    GUngroupAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        if (document) {
            var selection = document.getEditor().getSelection();
            if (selection) {
                for (var i = 0; i < selection.length; ++i) {
                    if (selection[i] instanceof IFShapeSet) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    /** @override */
    GUngroupAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        var selection = editor.getSelection();

        editor.beginTransaction();
        try {
            var newSelection = [];

            for (var i = 0; i < selection.length; ++i) {
                var item = selection[i];
                if (item instanceof IFShapeSet) {
                    var groupParent = item.getParent();
                    var groupNext = item.getNext();
                    var groupChildren = item.getChildren();

                    // Remove the group, first
                    groupParent.removeChild(item);

                    // Now move all sub-items of group before the group
                    for (var j = 0; j < groupChildren.length; ++j) {
                        var child = groupChildren[j];
                        item.removeChild(child);
                        groupParent.insertChild(child, groupNext);
                        newSelection.push(child);
                    }
                }
            }

            // Update selection if any
            if (newSelection.length > 0) {
                editor.updateSelection(false, newSelection);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Ungroup');
        }
    };

    /** @override */
    GUngroupAction.prototype.toString = function () {
        return "[Object GUngroupAction]";
    };

    _.GUngroupAction = GUngroupAction;
})(this);