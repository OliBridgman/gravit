(function (_) {

    /**
     * Action for ordering
     * @class GArrangeAction
     * @extends GAction
     * @constructor
     */
    function GArrangeAction(type) {
        this._type = type;
        this._title = new GLocale.Key(GArrangeAction, 'title.' + type);
    };
    GObject.inherit(GArrangeAction, GAction);

    /** @enum */
    GArrangeAction.Type = {
        SendToFront: 'send-front',
        BringForward: 'bring-forward',
        SendBackward: 'send-backward',
        SendToBack: 'send-back'
    };

    GArrangeAction.ID = 'arrange.order';

    /** @type {GArrangeAction.Type} */
    GArrangeAction.prototype._type = null;

    /** @type {GLocale.Key} */
    GArrangeAction.prototype._title = null;

    /**
     * @override
     */
    GArrangeAction.prototype.getId = function () {
        return GArrangeAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GArrangeAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GArrangeAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_ARRANGE;
    };

    /**
     * @override
     */
    GArrangeAction.prototype.getGroup = function () {
        return "arrange/arrange";
    };

    /**
     * @override
     */
    GArrangeAction.prototype.getShortcut = function () {
        switch (this._type) {
            case GArrangeAction.Type.SendToFront:
                return [GKey.Constant.SHIFT, GKey.Constant.META, GKey.Constant.UP];
            case GArrangeAction.Type.BringForward:
                return [GKey.Constant.META, GKey.Constant.UP];
            case GArrangeAction.Type.SendBackward:
                return [GKey.Constant.META, GKey.Constant.DOWN];
            case GArrangeAction.Type.SendToBack:
                return [GKey.Constant.SHIFT, GKey.Constant.META, GKey.Constant.DOWN];
        }
        return null;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GArrangeAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GArrangeAction.prototype.execute = function (elements) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var selection = null;

        if (!elements) {
            selection = document.getEditor().getSelection().slice();
            elements = selection;
        }

        if (this._type == GArrangeAction.Type.SendToFront ||
            this._type == GArrangeAction.Type.SendBackward) {

            elements = GNode.order(elements);
        } else { // BringForward || SendToBack
            elements = GNode.order(elements, true/*reverse*/);
        }

        // TODO : I18N
        GEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                var parent = element.getParent();

                switch (this._type) {
                    case GArrangeAction.Type.SendToFront:
                        if (element.getNext() !== null) {
                            parent.removeChild(element);
                            parent.appendChild(element);
                        }
                        break;
                    case GArrangeAction.Type.BringForward:
                        var next = element.getNext();
                        if (next !== null) {
                            var nextUnselected = null;
                            while (!nextUnselected && next) {
                                if (!next.hasFlag(GNode.Flag.Selected)) {
                                    nextUnselected = next;
                                }
                                next = next.getNext();
                            }

                            if (nextUnselected !== null) {
                                var posElement = nextUnselected.getNext();
                                parent.removeChild(element);
                                parent.insertChild(element, posElement);
                            }
                        }
                        break;
                    case GArrangeAction.Type.SendBackward:
                        var previous = element.getPrevious();
                        if (previous !== null) {
                            var prevUnselected = null;
                            while (!prevUnselected && previous) {
                                if (!previous.hasFlag(GNode.Flag.Selected)) {
                                    prevUnselected = previous;
                                }
                                previous = previous.getPrevious();
                            }
                            if (prevUnselected !== null) {
                                parent.removeChild(element);
                                parent.insertChild(element, prevUnselected);
                            }
                        }
                        break;
                    case GArrangeAction.Type.SendToBack:
                        if (element.getPrevious() !== null) {
                            parent.removeChild(element);
                            parent.insertChild(element, parent.getFirstChild());
                        }
                        break;
                }
            }
        }.bind(this), ifLocale.get(this.getTitle()));

        if (selection) {
            document.getEditor().updateSelection(false, selection);
        }
    };

    /** @override */
    GArrangeAction.prototype.toString = function () {
        return "[Object GArrangeAction]";
    };

    _.GArrangeAction = GArrangeAction;
})(this);