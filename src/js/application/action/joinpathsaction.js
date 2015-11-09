(function (_) {

    /**
     * Action for open paths joining
     * @class GJoinPathsAction
     * @extends GAction
     * @constructor
     */
    function GJoinPathsAction() {
    };
    GObject.inherit(GJoinPathsAction, GAction);

    GJoinPathsAction.ID = 'modify.join-paths';
    GJoinPathsAction.TITLE = new GLocale.Key(GJoinPathsAction, "title");

    /**
     * @override
     */
    GJoinPathsAction.prototype.getId = function () {
        return GJoinPathsAction.ID;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getTitle = function () {
        return GJoinPathsAction.TITLE;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATH;
    };

    /**
     * @override
     */
    GJoinPathsAction.prototype.getGroup = function () {
        return "structure/path";
    };

     /** @override */
    GJoinPathsAction.prototype.isEnabled = function () {
        var selection = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null;
        var enabled = false;
        if (selection) {
            for (var i = 0; !enabled && i < selection.length; ++i) {
                if (selection[i] instanceof GPath && !selection[i].getProperty('closed')) {
                    enabled = true;
                }
            }
        }

        return enabled;
    };

    /** @override */
    GJoinPathsAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        var selection = editor ? editor.getSelection() : null;
        var scene = document.getScene();
        var elementsForJoin = [];
        var parent = null;
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element instanceof GPath && !element.getProperty('closed')) {
                    if (!parent) {
                        parent = element.getParent();
                        if (parent) {
                            elementsForJoin.push(element);
                        }
                    } else {
                        if (parent === element.getParent()) {
                            elementsForJoin.push(element);
                        }
                    }

                }
            }
        }

        if (elementsForJoin.length) {
            editor.beginTransaction();
            try {
                if (elementsForJoin.length == 1) {
                    // Make the only selected path closed
                    elementsForJoin[0].setProperty('closed', true);
                } else { // elementsForJoin.length > 1
                    // Join all the open paths into one in the order like they goes in parent, and apply the style of the last path
                    elementsForJoin = GNode.order(elementsForJoin);
                    var lastPath = elementsForJoin[elementsForJoin.length - 1];
                    var trf = lastPath.getProperty('trf');
                    var invTrf = trf ? trf.inverted() : null;
                    var next = lastPath.getNext();
                    var stream = [];
                    var path;
                    for (var i = 0; i < elementsForJoin.length -1; ++i) {
                        path = elementsForJoin[i];
                        path.removeFlag(GNode.Flag.Selected);
                        parent.removeChild(path);
                        // We need to preserve the position of anchor points of all pathes,
                        // so do the following transformations
                        trf = path.getProperty('trf');
                        trf = trf ? (invTrf ? trf.multiplied(invTrf) : trf) : invTrf;
                        stream = stream.concat(path.getAnchorPoints().serialize(trf));
                    }
                    lastPath.removeFlag(GNode.Flag.Selected);
                    parent.removeChild(lastPath);
                    stream = stream.concat(lastPath.getAnchorPoints().serialize());
                    var newPath = new GPath();
                    newPath.getAnchorPoints().deserialize(stream);
                    newPath.assignFrom(lastPath);
                    parent.insertChild(newPath, next);
                    editor.updateSelection(false, [newPath]);
                }
            } finally {
                editor.commitTransaction(ifLocale.get(this.getTitle()));
            }
        }
    };

    /** @override */
    GJoinPathsAction.prototype.toString = function () {
        return "[Object GJoinPathsAction]";
    };

    _.GJoinPathsAction = GJoinPathsAction;
})(this);
