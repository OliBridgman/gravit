(function (_) {

    /**
     * Action for pasting clipboard contents as style
     * @class GPasteStyleAction
     * @extends GUIAction
     * @constructor
     */
    function GPasteStyleAction() {
    };
    GObject.inherit(GPasteStyleAction, GUIAction);

    GPasteStyleAction.ID = 'edit.paste-style';
    GPasteStyleAction.TITLE = new GLocale.Key(GPasteStyleAction, "title");

    /**
     * @override
     */
    GPasteStyleAction.prototype.getId = function () {
        return GPasteStyleAction.ID;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getTitle = function () {
        return GPasteStyleAction.TITLE;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getGroup = function () {
        return "ccp_special";
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.F4];
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.isEnabled = function () {
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(GXStyle.MIME_TYPE) >= 0) {
            var document = gApp.getActiveDocument();
            if (document) {
                var selection = document.getEditor().getSelection();
                if (selection) {
                    for (var i = 0; i < selection.length; ++i) {
                        if (selection[i].hasMixin(GXElement.Style)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    /**
     * @override
     */
    GPasteStyleAction.prototype.execute = function () {
        var style = GXNode.deserialize(gShell.getClipboarContent(GXStyle.MIME_TYPE));
        if (style) {
            var editor = gApp.getActiveDocument().getEditor();
            var selection = editor.getSelection();

            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var target = selection[i];
                    if (!target.hasMixin(GXElement.Style)) {
                        continue;
                    }

                    var targetStyle = target.getStyle(true);

                    // Remove all children of style and append the new cloned ones
                    targetStyle.clearChildren();
                    for (var child = style.getFirstChild(); child !== null; child = child.getNext()) {
                        targetStyle.appendChild(child.clone());
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Paste Style');
            }
        }
    };

    /** @override */
    GPasteStyleAction.prototype.toString = function () {
        return "[Object GPasteStyleAction]";
    };

    _.GPasteStyleAction = GPasteStyleAction;
})(this);