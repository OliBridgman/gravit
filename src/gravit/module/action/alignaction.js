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
     * @param {IFRect} [referenceBox] a reference box to align to, if not
     * given uses the element's total bbox
     * @override
     */
    GAlignAction.prototype.isEnabled = function (elements, referenceBox) {
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

        var alignBBox = null;

        if (referenceBox) {
            alignBBox = referenceBox;
        } else {
            for (var i = 0; i < elements.length; ++i) {
                var bbox = elements[i].getPaintBBox();
                if (bbox && !bbox.isEmpty()) {
                    alignBBox = alignBBox ? alignBBox.united(bbox) : bbox;
                }
            }
        }

        if (!alignBBox || alignBBox.isEmpty()) {
            return;
        }

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                if (!element.hasMixin(IFElement.Transform)) {
                    continue;
                }
                var bbox = geometry ? element.getGeometryBBox() : element.getPaintBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                switch (this._type) {
                    case GAlignAction.Type.AlignLeft:
                        if (alignBBox.getX() !== bbox.getX()) {
                            element.transform(new IFTransform(1, 0, 0, 1, alignBBox.getX() - bbox.getX(), 0));
                        }
                        break;
                    // TODO:
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