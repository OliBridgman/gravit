(function (_) {

    /**
     * Action for ordering
     * @class GOrderAction
     * @extends GAction
     * @constructor
     */
    function GOrderAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GOrderAction, 'title.' + type);
    };
    IFObject.inherit(GOrderAction, GAction);

    /** @enum */
    GOrderAction.Type = {
        SendToFront: 'send-front',
        BringForward: 'bring-forward',
        SendBackward: 'send-backward',
        SendToBack: 'send-back'
    };

    GOrderAction.ID = 'arrange.order';

    /** @type {GOrderAction.Type} */
    GOrderAction.prototype._type = null;

    /** @type {IFLocale.Key} */
    GOrderAction.prototype._title = null;

    /**
     * @override
     */
    GOrderAction.prototype.getId = function () {
        return GOrderAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GOrderAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GOrderAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE;
    };

    /**
     * @override
     */
    GOrderAction.prototype.getGroup = function () {
        return "order";
    };

    /**
     * @override
     */
    GOrderAction.prototype.getShortcut = function () {
        switch (this._type) {
            case GOrderAction.Type.SendToFront:
                return [IFKey.Constant.SHIFT, IFKey.Constant.META, IFKey.Constant.UP];
            case GOrderAction.Type.BringForward:
                return [IFKey.Constant.META, IFKey.Constant.UP];
            case GOrderAction.Type.SendBackward:
                return [IFKey.Constant.META, IFKey.Constant.DOWN];
            case GOrderAction.Type.SendToBack:
                return [IFKey.Constant.SHIFT, IFKey.Constant.META, IFKey.Constant.DOWN];
        }
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GOrderAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GOrderAction.prototype.execute = function (elements) {
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
                    case GOrderAction.Type.SendToFront:
                        if (element.getNext() !== null) {
                            parent.removeChild(element);
                            parent.appendChild(element);
                        }
                        break;
                    case GOrderAction.Type.BringForward:
                        if (element.getNext() !== null) {
                            parent.removeChild(element);
                            parent.insertBefore(element.getNext().getNext());
                        }
                        break;
                    case GOrderAction.Type.SendBackward:
                        if (element.getPrevious() !== null) {
                            parent.removeChild(element);
                            parent.insertBefore(element, parent.getFirstChild());
                        }
                        break;
                    case GOrderAction.Type.SendToBack:
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
    GOrderAction.prototype.toString = function () {
        return "[Object GOrderAction]";
    };

    _.GOrderAction = GOrderAction;
})(this);