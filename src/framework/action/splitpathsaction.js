(function (_) {

    /**
     * Action for splitting paths onto several parts in selected anchor points
     * @class GSplitPathsAction
     * @extends GAction
     * @constructor
     */
    function GSplitPathsAction() {
    };
    GObject.inherit(GSplitPathsAction, GAction);

    GSplitPathsAction.ID = 'modify.split-paths';
    GSplitPathsAction.TITLE = new GLocale.Key(GSplitPathsAction, "title");

    /**
     * @override
     */
    GSplitPathsAction.prototype.getId = function () {
        return GSplitPathsAction.ID;
    };

    /**
     * @override
     */
    GSplitPathsAction.prototype.getTitle = function () {
        return GSplitPathsAction.TITLE;
    };

    /**
     * @override
     */
    GSplitPathsAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATHS;
    };

    /**
     * @override
     */
    GSplitPathsAction.prototype.getGroup = function () {
        return "structure/modify";
    };

    /** @override */
    GSplitPathsAction.prototype.isEnabled = function () {
        var selection = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null;
        var enabled = false;
        if (selection) {
            for (var i = 0; !enabled && i < selection.length; ++i) {
                if (selection[i] instanceof GPath) {
                    enabled = this._isPathSplittable(selection[i]);
                } // selection[i] instanceof GPath
            } // for i < selection.length
        } // if selection

        return enabled;
    };

    /** @override */
    GSplitPathsAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        var selection = editor ? editor.getSelection() : null;
        var elements = [];
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element instanceof GPath && this._isPathSplittable(element)) {
                    elements.push(element);
                }
            }
        }

        if (elements.length) {
            editor.beginTransaction();
            try {
                var newSelection = [];
                for (var i = 0; i < elements.length; ++i) {
                    var oldPath = elements[i];
                    var parent = oldPath.getParent();
                    var next = oldPath.getNext();
                    var oldAnchorPoints = oldPath.getAnchorPoints();
                    var ap;
                    var startHere = false;
                    if (oldPath.getProperty('closed')) {
                        for (ap = oldAnchorPoints.getFirstChild(); ap !== null && !ap.hasFlag(GNode.Flag.Selected);
                             ap = ap.getNext()) {
                        }
                    } else {
                        ap = oldAnchorPoints.getFirstChild();
                        if (!ap.hasFlag(GNode.Flag.Selected)) {
                            startHere = true;
                        }
                    }
                    var firstAp = ap;
                    var nextPt = firstAp ? firstAp.getNext() : null;
                    var duplicateFirst = false;
                    if (oldPath.getProperty('closed') && firstAp == oldAnchorPoints.getFirstChild()) {
                        duplicateFirst = true;
                    }
                    // TODO: preserve path shape by changing points type and auto-handles property if needed
                    while (firstAp !== null && (firstAp.hasFlag(GNode.Flag.Selected) || startHere) && nextPt !== null) {
                        startHere = false;
                        var newPath = new GPath();
                        var newApts = newPath.getAnchorPoints();
                        ap = firstAp.getNext();
                        if (duplicateFirst) {
                            var newPt = new GPathBase.AnchorPoint();
                            newPt.deserialize(firstAp.serialize());
                            firstAp = newPt;
                            duplicateFirst = false;
                        } else {
                            oldAnchorPoints.removeChild(firstAp);
                        }
                        newApts.appendChild(firstAp);
                        while (ap !== null && !ap.hasFlag(GNode.Flag.Selected)) {
                            nextPt = oldAnchorPoints.getNextPoint(ap);
                            oldAnchorPoints.removeChild(ap);
                            newApts.appendChild(ap);
                            ap = nextPt;
                        }
                        if (ap !== null && ap.hasFlag(GNode.Flag.Selected)) {
                            var newPt = new GPathBase.AnchorPoint();
                            newPt.deserialize(ap.serialize());
                            newApts.appendChild(newPt);
                            firstAp = ap;
                            if (ap != oldAnchorPoints.getFirstChild() || ap != oldAnchorPoints.getLastChild()) {
                                nextPt = oldAnchorPoints.getNextPoint(ap);
                            } else {
                                nextPt = null;
                            }
                        } else {
                            nextPt = null;
                        }

                        if (newApts.getFirstChild() !== null) {
                            newPath.assignFrom(oldPath);
                            parent.insertChild(newPath, next);
                            newSelection.push(newPath);
                        }
                    } // while firstAp

                    parent.removeChild(oldPath);
                } // for i < elements.length

                if (newSelection.length) {
                    editor.updateSelection(false, newSelection);
                }
            } finally {
                editor.commitTransaction(ifLocale.get(this.getTitle()));
            }
        }
    };

    /**
     * Checks if a path may be split onto several paths in selected anchor points
     * @param {GPath} path
     * @returns {Boolean}
     * @private
     */
    GSplitPathsAction.prototype._isPathSplittable = function (path) {
        var splittable = false;
        var pathEditor = GElementEditor.getEditor(path);
        var partSelection = pathEditor ? pathEditor.getPartSelection() : null;
        var numPtsSelected = 0;
        if (partSelection && partSelection.length) {
            for (var i = 0; !splittable && i < partSelection.length; ++i) {
                if (partSelection[i].type == GPathEditor.PartType.Point) {
                    if (path.getProperty('closed')) {
                        if (numPtsSelected > 0) {
                            splittable = true;
                        } else {
                            ++numPtsSelected;
                        }
                    } else if (partSelection[i].point != path.getAnchorPoints().getFirstChild() &&
                        partSelection[i].point != path.getAnchorPoints().getLastChild()) {
                        splittable = true;
                    }
                } // type == GPathEditor.PartType.Point
            } // for i < partSelection.length
        } // if partSelection

        return splittable;
    };

    /** @override */
    GSplitPathsAction.prototype.toString = function () {
        return "[Object GSplitPathsAction]";
    };

    _.GSplitPathsAction = GSplitPathsAction;
})(this);
