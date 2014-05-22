(function (_) {

    /**
     * Action for ungrouping the selection
     * @class GUngroupAction
     * @extends GUIAction
     * @constructor
     */
    function GUngroupAction() {
    };
    GObject.inherit(GUngroupAction, GUIAction);

    GUngroupAction.ID = 'modify.ungroup';
    GUngroupAction.TITLE = new GLocale.Key(GUngroupAction, "title");

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
        return EXApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getGroup = function () {
        return "structure";
    };

    /**
     * @override
     */
    GUngroupAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.META, 'G'];
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
                    if (selection[i] instanceof IFGroup) {
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
                if (item instanceof IFGroup) {
                    var groupParent = item.getParent();

                    // Move all sub-items of group before the group
                    for (var child = item.getFirstChild(); child !== null; child = child.getNext()) {
                        item.removeChild(child);
                        groupParent.insertChild(child, item);
                        newSelection.push(child);
                    }

                    // Now remove the group
                    groupParent.removeChild(item);
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