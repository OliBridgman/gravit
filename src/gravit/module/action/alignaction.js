(function (_) {

    /**
     * Action for aligning
     * @class GAlignAction
     * @extends GAction
     * @constructor
     */
    function GAlignAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GAlignAction, 'title.' + type);
    };
    IFObject.inherit(GAlignAction, GAction);

    /** @enum */
    GAlignAction.Type = {
        AlignLeft: 'align-left',
        AlignCenter: 'align-center',
        AlignRight: 'align-right',
        AlignTop: 'align-top',
        AlignMiddle: 'align-middle',
        AlignBottom: 'align-bottom',
        DistributeHorizontal: 'distribute-horizontal',
        DistributeVertical: 'distribute-vertical'
    };

    GAlignAction.ID = 'arrange.align';

    /** @type {GAlignAction.Type} */
    GAlignAction.prototype._type = null;

    /** @type {IFLocale.Key} */
    GAlignAction.prototype._title = null;

    /**
     * @override
     */
    GAlignAction.prototype.getId = function () {
        return GAlignAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GAlignAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GAlignAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE;
    };

    /**
     * @override
     */
    GAlignAction.prototype.getGroup = function () {
        switch (this._type) {
            case GAlignAction.Type.AlignLeft:
            case GAlignAction.Type.AlignCenter:
            case GAlignAction.Type.AlignRight:
                return 'align_horizontal';
            case GAlignAction.Type.AlignTop:
            case GAlignAction.Type.AlignMiddle:
            case GAlignAction.Type.AlignBottom:
                return 'align_vertical';
            case GAlignAction.Type.DistributeHorizontal:
            case GAlignAction.Type.DistributeVertical:
                return 'distribute';
        }
    };

    /**
     * @override
     */
    GAlignAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for alignment, otherwise use paint box. Defaults
     * to false.
     * @param {IFRect} [referenceBox] a reference box to align to, if not
     * given uses the element's total bbox
     * @override
     */
    GAlignAction.prototype.isEnabled = function (elements, geometry, referenceBox) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        if (elements) {
            return referenceBox ? elements.length > 0 : elements.length > 1;
        }
        return false;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for alignment, otherwise use paint box. Defaults
     * to false.
     * @param {IFRect} [referenceBox] a reference box to align to, if not
     * given uses the element's total bbox
     * @override
     */
    GAlignAction.prototype.execute = function (elements, geometry, referenceBox) {
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

        IFEditor.tryRunTransaction(scene, function () {
            if (this._type === GAlignAction.Type.DistributeHorizontal ||
                this._type === GAlignAction.Type.DistributeVertical) {

                var elementsWidth = 0;
                var elementsHeight = 0;

                for (var i = 0; i < elements.length; ++i) {
                    var bbox = elements[i].bbox;

                    elementsWidth += bbox.getWidth();
                    elementsHeight += bbox.getHeight();
                }

                var spacingX = (referenceBox.getWidth() - elementsWidth) / (elements.length - 1);
                var spacingY = (referenceBox.getHeight() - elementsHeight) / (elements.length - 1);

                var xPosition = referenceBox.getX();
                var yPosition = referenceBox.getY();

                for (var i = 0; i < elements.length; ++i) {
                    var bbox = elements[i].bbox;
                    var element = elements[i].element;

                    switch (this._type) {
                        case GAlignAction.Type.DistributeHorizontal:
                            if (xPosition !== bbox.getX()) {
                                element.transform(new IFTransform(1, 0, 0, 1, xPosition - bbox.getX(), 0));
                            }
                            break;

                        case GAlignAction.Type.DistributeVertical:
                            if (yPosition !== bbox.getY()) {
                                element.transform(new IFTransform(1, 0, 0, 1, 0, yPosition - bbox.getY()));
                            }
                            break;
                    }

                    xPosition += bbox.getWidth() + spacingX;
                    yPosition += bbox.getHeight() + spacingY;
                }

            } else {
                for (var i = 0; i < elements.length; ++i) {
                    var bbox = elements[i].bbox;
                    var element = elements[i].element;

                    switch (this._type) {
                        case GAlignAction.Type.AlignLeft:
                            if (referenceBox.getX() !== bbox.getX()) {
                                element.transform(new IFTransform(1, 0, 0, 1, referenceBox.getX() - bbox.getX(), 0));
                            }
                            break;

                        case GAlignAction.Type.AlignCenter:
                            var center = referenceBox.getX() + referenceBox.getWidth() / 2;
                            if (center !== bbox.getX() + bbox.getWidth() / 2) {
                                element.transform(new IFTransform(1, 0, 0, 1, center - bbox.getX() - bbox.getWidth() / 2, 0));
                            }
                            break;

                        case GAlignAction.Type.AlignRight:
                            var right = referenceBox.getX() + referenceBox.getWidth();
                            if (right !== bbox.getX() + bbox.getWidth()) {
                                element.transform(new IFTransform(1, 0, 0, 1, right - bbox.getWidth() - bbox.getX(), 0));
                            }
                            break;

                        case GAlignAction.Type.AlignTop:
                            if (referenceBox.getY() !== bbox.getY()) {
                                element.transform(new IFTransform(1, 0, 0, 1, 0, referenceBox.getY() - bbox.getY()));
                            }
                            break;

                        case GAlignAction.Type.AlignMiddle:
                            var center = referenceBox.getY() + referenceBox.getHeight() / 2;
                            if (center !== bbox.getY() + bbox.getHeight() / 2) {
                                element.transform(new IFTransform(1, 0, 0, 1, 0, center - bbox.getY() - bbox.getHeight() / 2));
                            }
                            break;

                        case GAlignAction.Type.AlignBottom:
                            var bottom = referenceBox.getY() + referenceBox.getHeight();
                            if (bottom !== bbox.getY() + bbox.getHeight()) {
                                element.transform(new IFTransform(1, 0, 0, 1, 0, bottom - bbox.getHeight() - bbox.getY()));
                            }
                            break;
                    }
                }
            }
        }.bind(this), ifLocale.get(this.getTitle()));
    };

    /** @override */
    GAlignAction.prototype.toString = function () {
        return "[Object GAlignAction]";
    };

    _.GAlignAction = GAlignAction;
})(this);