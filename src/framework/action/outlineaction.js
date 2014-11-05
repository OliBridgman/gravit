(function (_) {

    /**
     * Action for creating outline paths
     * @class GOutlineAction
     * @extends GAction
     * @constructor
     */
    function GOutlineAction() {
    };
    GObject.inherit(GOutlineAction, GAction);

    GOutlineAction.ID = 'modify.ouline';
    GOutlineAction.TITLE = new GLocale.Key(GOutlineAction, "title");

    /**
     * @override
     */
    GOutlineAction.prototype.getId = function () {
        return GOutlineAction.ID;
    };

    /**
     * @override
     */
    GOutlineAction.prototype.getTitle = function () {
        return GOutlineAction.TITLE;
    };

    /**
     * @override
     */
    GOutlineAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_PATHS;
    };

    /**
     * @override
     */
    GOutlineAction.prototype.getGroup = function () {
        return "structure/modify";
    };

    /** @override */
    GOutlineAction.prototype.isEnabled = function () {
        var selection = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null;
        var enabled = false;
        if (selection) {
            for (var i = 0; !enabled && i < selection.length; ++i) {
                if (selection[i].hasMixin(GVertexSource)) {
                    enabled = true;
                } // selection[i].hasMixin(GVertexSource)
            } // for i < selection.length
        } // if selection

        return enabled;
    };

    /** @override */
    GOutlineAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var editor = document ? document.getEditor() : null;
        var selection = editor ? editor.getSelection() : null;
        var elements = [];
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element.hasMixin(GVertexSource)) {
                    elements.push(element);
                }
            }
        }

        if (elements.length) {
            vex.dialog.prompt({
                // TODO : I18N
                message: this._dialogPromptMessage(),
                callback: function (value) {
                    if (value) {
                        var valNum = parseFloat(value);
                        if (!isNaN(valNum) && isFinite(valNum) && !GMath.isEqualEps(valNum, 0)) {
                            editor.beginTransaction();
                            try {
                                var newSelection = [];
                                for (var i = 0; i < elements.length; ++i) {
                                    var oldElem = elements[i];
                                    var parent = oldElem.getParent();
                                    var next = oldElem.getNext();
                                    var offsetter = this._makeOffsetter(valNum, oldElem);
                                    var newPath = GPathBase.createPathFromVertexSource(offsetter);

                                    if (newPath) {
                                        GElement.prototype.assignFrom.call(newPath, oldElem);
                                        parent.insertChild(newPath, next);
                                        newSelection.push(newPath);
                                    }

                                    parent.removeChild(oldElem);
                                } // for i < elements.length

                                if (newSelection.length) {
                                    editor.updateSelection(false, newSelection);
                                }
                            } finally {
                                editor.commitTransaction(ifLocale.get(this.getTitle()));
                            }
                        } else {
                            // TODO : I18N
                            vex.dialog.alert(this._dialogAlertMessage());
                        }
                    }
                }.bind(this)
            });
        }
    };

    GOutlineAction.prototype._dialogPromptMessage = function () {
        return "Enter a positive value for outline:";
    };

    GOutlineAction.prototype._makeOffsetter = function (valNum, elem) {
        var offset = valNum > 0 ? valNum : -valNum;
        return new GVertexOffsetter(elem, offset, true, true);
    };

    GOutlineAction.prototype._dialogAlertMessage = function () {
        return "Entered invalid number for outline value.";
    };

    /** @override */
    GOutlineAction.prototype.toString = function () {
        return "[Object GOutlineAction]";
    };

    _.GOutlineAction = GOutlineAction;
})(this);
