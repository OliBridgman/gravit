(function (_) {

    /**
     * Action for pasting clipboard contents onto the positions relative to the active page top left
     * @class GPasteInPlaceAction
     * @extends GPasteAction
     * @constructor
     */
    function GPasteInPlaceAction() {
    };
    GObject.inherit(GPasteInPlaceAction, GPasteAction);

    GPasteInPlaceAction.ID = 'edit.paste.in-place';
    GPasteInPlaceAction.TITLE = new GLocale.Key(GPasteInPlaceAction, "title");

    /**
     * @override
     */
    GPasteInPlaceAction.prototype.getId = function () {
        return GPasteInPlaceAction.ID;
    };

    /**
     * @override
     */
    GPasteInPlaceAction.prototype.getTitle = function () {
        return GPasteInPlaceAction.TITLE;
    };

    /**
     * @override
     */
    GPasteInPlaceAction.prototype.getGroup = function () {
        return "paste";
    };

    /**
     * @override
     */
    GPasteInPlaceAction.prototype.execute = function () {
        if (document.activeElement && $(document.activeElement).is(":editable")) {
            document.execCommand('paste');
        } else {
            // TODO : Support pasting other formats like raster images
            var nodes = GNode.deserialize(gShell.getClipboardContent(GNode.MIME_TYPE));
            if (nodes && nodes.length > 0) {
                var elements = [];
                var page = gApp.getActiveDocument().getScene().querySingle('page:active');
                for (var i = 0; i < nodes.length; ++i) {
                    if (nodes[i] instanceof GElement) {
                        var element = nodes[i];
                        element.transform(
                            new GTransform(1, 0, 0, 1, page.getProperty('x'), page.getProperty('y')));
                        elements.push(element);
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
        }
    };

    /** @override */
    GPasteInPlaceAction.prototype.toString = function () {
        return "[Object GPasteInPlaceAction]";
    };

    _.GPasteInPlaceAction = GPasteInPlaceAction;
})(this);
