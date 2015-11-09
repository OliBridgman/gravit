(function (_) {

    /**
     * Action for aligning
     * @class GAlignAction
     * @extends GAction
     * @constructor
     */
    function GAlignAction(type) {
        this._type = type;
        this._title = new GLocale.Key(GAlignAction, 'title.' + type);
    };
    GObject.inherit(GAlignAction, GAction);

    /** @enum */
    GAlignAction.Type = {
        AlignLeft: 'align-left',
        AlignCenter: 'align-center',
        AlignRight: 'align-right',
        AlignTop: 'align-top',
        AlignMiddle: 'align-middle',
        AlignBottom: 'align-bottom',
        AlignJustifyHorizontal: 'align-justify-horizontal',
        AlignJustifyVertical: 'align-justify-vertical'
    };

    GAlignAction.ID = 'arrange.align';

    /** @type {GAlignAction.Type} */
    GAlignAction.prototype._type = null;

    /** @type {GLocale.Key} */
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
        return GApplication.CATEGORY_MODIFY_ALIGN;
    };

    /**
     * @override
     */
    GAlignAction.prototype.getGroup = function () {
        var result = '';

        switch (this._type) {
            case GAlignAction.Type.AlignLeft:
            case GAlignAction.Type.AlignCenter:
            case GAlignAction.Type.AlignRight:
            case GAlignAction.Type.AlignJustifyHorizontal:
                result = 'horizontal';
                break;
            case GAlignAction.Type.AlignTop:
            case GAlignAction.Type.AlignMiddle:
            case GAlignAction.Type.AlignBottom:
            case GAlignAction.Type.AlignJustifyVertical:
                result = 'vertical';
                break;
        }

        return 'arrange/align-' + result;
    };

    /**
     * @override
     */
    GAlignAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [compound] if provided, aligns the whole element's bbox,
     * otherwise if false (default), aligns each element individually
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for alignment, otherwise use paint box. Defaults
     * to false.
     * @param {GRect} [referenceBox] a reference box to align to, if not
     * given uses the element's total bbox
     * @override
     */
    GAlignAction.prototype.isEnabled = function (elements, compound, geometry, referenceBox) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        if (elements) {
            return referenceBox ? elements.length > 0 : elements.length > 1;
        }
        return false;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {Boolean} [compound] if provided, aligns the whole element's bbox,
     * otherwise if false (default), aligns each element individually
     * @param {Boolean} [geometry] if provided, specifies whether to
     * use geometry box for alignment, otherwise use paint box. Defaults
     * to false.
     * @param {GRect} [referenceBox] a reference box to align to, if not
     * given uses the element's total bbox
     * @override
     */
    GAlignAction.prototype.execute = function (elements, compound, geometry, referenceBox) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        if (!elements) {
            elements = document.getEditor().getSelection();
        }

        var tmpElements = elements;
        var elements = [];

        var elementsBBox = null;
        for (var i = 0; i < tmpElements.length; ++i) {
            var element = tmpElements[i];
            if (element.hasMixin(GElement.Transform)) {
                var bbox = geometry ? element.getGeometryBBox() : element.getPaintBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                elementsBBox = !elementsBBox ? bbox : elementsBBox.united(bbox);

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

        GEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var bbox = compound ? elementsBBox : elements[i].bbox;
                var element = elements[i].element;
                var elemEditor = GElementEditor.getEditor(element);

                switch (this._type) {
                    case GAlignAction.Type.AlignLeft:
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (referenceBox.getX() !== bbox.getX()) {
                                element.transform(new GTransform(1, 0, 0, 1, referenceBox.getX() - bbox.getX(), 0));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignLeft, referenceBox.getX(), null);
                        }
                        break;

                    case GAlignAction.Type.AlignCenter:
                        var center = referenceBox.getX() + referenceBox.getWidth() / 2;
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (center !== bbox.getX() + bbox.getWidth() / 2) {
                                element.transform(new GTransform(1, 0, 0, 1, center - bbox.getX() - bbox.getWidth() / 2, 0));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignCenter, center, null);
                        }
                        break;

                    case GAlignAction.Type.AlignRight:
                        var right = referenceBox.getX() + referenceBox.getWidth();
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (right !== bbox.getX() + bbox.getWidth()) {
                                element.transform(new GTransform(1, 0, 0, 1, right - bbox.getWidth() - bbox.getX(), 0));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignRight, right, null);
                        }
                        break;

                    case GAlignAction.Type.AlignTop:
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (referenceBox.getY() !== bbox.getY()) {
                                element.transform(new GTransform(1, 0, 0, 1, 0, referenceBox.getY() - bbox.getY()));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignTop, null, referenceBox.getY());
                        }
                        break;

                    case GAlignAction.Type.AlignMiddle:
                        var center = referenceBox.getY() + referenceBox.getHeight() / 2;
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (center !== bbox.getY() + bbox.getHeight() / 2) {
                                element.transform(new GTransform(1, 0, 0, 1, 0, center - bbox.getY() - bbox.getHeight() / 2));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignMiddle, null, center);
                        }
                        break;

                    case GAlignAction.Type.AlignBottom:
                        var bottom = referenceBox.getY() + referenceBox.getHeight();
                        if (!elemEditor || !elemEditor.isAlignPartsAllowed()) {
                            if (bottom !== bbox.getY() + bbox.getHeight()) {
                                element.transform(new GTransform(1, 0, 0, 1, 0, bottom - bbox.getHeight() - bbox.getY()));
                            }
                        } else {
                            elemEditor.alignParts(GAlignAction.Type.AlignBottom, null, bottom);
                        }
                        break;

                    case GAlignAction.Type.AlignJustifyHorizontal:
                        if (referenceBox.getX() !== bbox.getX() || bbox.getWidth() !== referenceBox.getWidth()) {
                            element.transform(
                                new GTransform(1, 0, 0, 1, 0, 0)
                                    .translated(-bbox.getX(), -bbox.getY())
                                    .scaled(referenceBox.getWidth() / bbox.getWidth(), 1)
                                    .translated(bbox.getX(), bbox.getY())
                                    .translated(referenceBox.getX() - bbox.getX(), 0));
                        }
                        break;

                    case GAlignAction.Type.AlignJustifyVertical:
                        if (referenceBox.getY() !== bbox.getY() || bbox.getHeight() !== referenceBox.getHeight()) {
                            element.transform(
                                new GTransform(1, 0, 0, 1, 0, 0)
                                    .translated(-bbox.getX(), -bbox.getY())
                                    .scaled(1, referenceBox.getHeight() / bbox.getHeight())
                                    .translated(bbox.getX(), bbox.getY())
                                    .translated(0, referenceBox.getY() - bbox.getY()));
                        }
                        break;
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