(function (_) {

    /**
     * Action for ordering
     * @class GArrangeAction
     * @extends GAction
     * @constructor
     */
    function GArrangeAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GArrangeAction, 'title.' + type);
    };
    IFObject.inherit(GArrangeAction, GAction);

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

    /** @type {IFLocale.Key} */
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
                return [IFKey.Constant.SHIFT, IFKey.Constant.META, IFKey.Constant.UP];
            case GArrangeAction.Type.BringForward:
                return [IFKey.Constant.META, IFKey.Constant.UP];
            case GArrangeAction.Type.SendBackward:
                return [IFKey.Constant.META, IFKey.Constant.DOWN];
            case GArrangeAction.Type.SendToBack:
                return [IFKey.Constant.SHIFT, IFKey.Constant.META, IFKey.Constant.DOWN];
        }
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GArrangeAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
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

        elements = IFNode.order(elements, true/*reverse*/);

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
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
                        if (element.getNext() !== null) {
                            parent.removeChild(element);
                            parent.insertBefore(element.getNext().getNext());
                        }
                        break;
                    case GArrangeAction.Type.SendBackward:
                        if (element.getPrevious() !== null) {
                            parent.removeChild(element);
                            parent.insertBefore(element, parent.getFirstChild());
                        }
                        break;
                    case GArrangeAction.Type.SendToBack:
                        if (element.getPrevious() !== null) {
                            parent.removeChild(element);
                            parent.insertBefore(element.getPrevious().getPrevious());
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