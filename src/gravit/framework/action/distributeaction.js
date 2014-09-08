(function (_) {

    /**
     * Action for distributing
     * @class GDistributeAction
     * @extends GAction
     * @constructor
     */
    function GDistributeAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GDistributeAction, 'title.' + type);
    };
    IFObject.inherit(GDistributeAction, GAction);

    /** @enum */
    GDistributeAction.Type = {
        Horizontal: 'horizontal',
        Vertical: 'vertical'
    };

    GDistributeAction.ID = 'arrange.distribute';

    /** @type {GDistributeAction.Type} */
    GDistributeAction.prototype._type = null;

    /** @type {IFLocale.Key} */
    GDistributeAction.prototype._title = null;

    /**
     * @override
     */
    GDistributeAction.prototype.getId = function () {
        return GDistributeAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GDistributeAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GDistributeAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_ALIGN;
    };

    /**
     * @override
     */
    GDistributeAction.prototype.getGroup = function () {
        return 'arrange/align-distribute';
    };

    /**
     * @override
     */
    GDistributeAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for distributing, otherwise use paint box. Defaults
     * to false.
     * @param {IFRect} [referenceBox] a reference box to dstribute within, if not
     * given uses the element's total bbox
     * @param {Number} [spacing] a fixed spacing value. If not provided or zero then
     * spacing will be calculated automatically using the given box
     * @override
     */
    GDistributeAction.prototype.isEnabled = function (elements, geometry, referenceBox, spacing) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        if (elements) {
            return referenceBox ? elements.length > 1 : elements.length > 2;
        }
        return false;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for distributing, otherwise use paint box. Defaults
     * to false.
     * @param {IFRect} [referenceBox] a reference box to dstribute within, if not
     * given uses the element's total bbox
     * @param {Number} [spacing] a fixed spacing value. If not provided or zero then
     * spacing will be calculated automatically using the given box
     * @override
     */
    GDistributeAction.prototype.execute = function (elements, geometry, referenceBox, spacing) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        if (!elements) {
            elements = document.getEditor().getSelection();
        }

        var tmpElements = elements;
        var elements = [];

        for (var i = 0; i < tmpElements.length; ++i) {
            var element = tmpElements[i];
            if (element.hasMixin(IFElement.Transform)) {
                var bbox = geometry ? element.getGeometryBBox() : element.getPaintBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                elements.push({
                    bbox: bbox,
                    element: element
                });
            }
        }

        if (!referenceBox) {
            for (var i = 0; i < elements.length; ++i) {
                var bbox = elements[i].element.getPaintBBox();
                if (bbox && !bbox.isEmpty()) {
                    referenceBox = referenceBox ? referenceBox.united(bbox) : bbox;
                }
            }
        }

        if (!referenceBox || referenceBox.isEmpty()) {
            return;
        }

        if (this._type === GDistributeAction.Type.Horizontal) {
            elements.sort(function (e1, e2) {
                return e1.bbox.getX() > e2.bbox.getX();
            });

            if (!spacing) {
                var elementsTotal = 0;
                for (var i = 0; i < elements.length; ++i) {
                    elementsTotal += elements[i].bbox.getWidth();
                }
                spacing = (referenceBox.getWidth() - elementsTotal) / (elements.length - 1);
            }

            IFEditor.tryRunTransaction(scene, function () {
                var position = referenceBox.getX();

                for (var i = 0; i < elements.length; ++i) {
                    if (position !== elements[i].bbox.getX()) {
                        elements[i].element.transform(new IFTransform(1, 0, 0, 1, position - elements[i].bbox.getX(), 0));
                    }
                    position += elements[i].bbox.getWidth() + spacing;
                }
            }.bind(this), ifLocale.get(this.getTitle()));
        } else if (this._type === GDistributeAction.Type.Vertical) {
            elements.sort(function (e1, e2) {
                return e1.bbox.getY() > e2.bbox.getY();
            });

            if (!spacing) {
                var elementsTotal = 0;
                for (var i = 0; i < elements.length; ++i) {
                    elementsTotal += elements[i].bbox.getHeight();
                }
                spacing = (referenceBox.getHeight() - elementsTotal) / (elements.length - 1);
            }

            IFEditor.tryRunTransaction(scene, function () {
                var position = referenceBox.getY();

                for (var i = 0; i < elements.length; ++i) {
                    if (position !== elements[i].bbox.getY()) {
                        elements[i].element.transform(new IFTransform(1, 0, 0, 1, 0, position - elements[i].bbox.getY()));
                    }
                    position += elements[i].bbox.getHeight() + spacing;
                }
            }.bind(this), ifLocale.get(this.getTitle()));
        }
    };

    /** @override */
    GDistributeAction.prototype.toString = function () {
        return "[Object GDistributeAction]";
    };

    _.GDistributeAction = GDistributeAction;
})(this);