(function (_) {

    /**
     * Action for pasting clipboard contents
     * @class GPasteAction
     * @extends GUIAction
     * @constructor
     */
    function GPasteAction() {
    };
    IFObject.inherit(GPasteAction, GUIAction);

    GPasteAction.ID = 'edit.paste';
    GPasteAction.TITLE = new IFLocale.Key(GPasteAction, "title");

    /**
     * @override
     */
    GPasteAction.prototype.getId = function () {
        return GPasteAction.ID;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getTitle = function () {
        return GPasteAction.TITLE;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GPasteAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'V'];
    };

    /**
     * @override
     */
    GPasteAction.prototype.isEnabled = function () {
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(IFNode.MIME_TYPE) >= 0) {
            return !!gApp.getActiveDocument();
        }
        return false;
    };

    /**
     * @override
     */
    GPasteAction.prototype.execute = function () {
        // TODO : Support pasting other formats like raster images
        var nodes = IFNode.deserialize(gShell.getClipboardContent(IFNode.MIME_TYPE));
        if (nodes && nodes.length > 0) {
            var elements = [];
            for (var i = 0; i < nodes.length; ++i) {
                if (nodes[i] instanceof IFElement) {
                    elements.push(nodes[i]);
                }
            }

            if (elements.length > 0) {
                var editor = gApp.getActiveDocument().getEditor();
                editor.beginTransaction();
                try {
                    editor.insertElements(elements, true, true);
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Paste');
                }
            }
        }
    };

    /** @override */
    GPasteAction.prototype.toString = function () {
        return "[Object GPasteAction]";
    };

    _.GPasteAction = GPasteAction;
})(this);