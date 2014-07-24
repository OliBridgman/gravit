(function (_) {

    /**
     * Action for aligning
     * @class GAlignAction
     * @extends GAction
     * @constructor
     */
    function GAlignAction(type, pageAlign) {
        this._type = type;
        this._pageAlign = pageAlign;
        this._title = new IFLocale.Key(GAlignAction, 'title.' + type);
    };
    IFObject.inherit(GAlignAction, GAction);

    /** @enum */
    GAlignAction.Type = {
        Left: 'left',
        Center: 'center',
        Right: 'right',
        Top: 'top',
        Middle: 'middle',
        Bottom: 'bottom'
    };

    GAlignAction.ID = 'arrange.align';

    /** @type {GAlignAction.Type} */
    GAlignAction.prototype._type = null;

    /** @type {Boolean} */
    GAlignAction.prototype._pageAlign = null;

    /** @type {IFLocale.Key} */
    GAlignAction.prototype._title = null;

    /**
     * @override
     */
    GAlignAction.prototype.getId = function () {
        return GAlignAction.ID + '.' + (this._pageAlign ? 'page.' : '') + this._type;
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
            case GAlignAction.Type.Left:
            case GAlignAction.Type.Center:
            case GAlignAction.Type.Right:
                return 'align_horizontal';
            case GAlignAction.Type.Top:
            case GAlignAction.Type.Middle:
            case GAlignAction.Type.Bottom:
                return 'align_vertical';
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
     * @override
     */
    GAlignAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        if (elements) {
            return this._pageAlign ? elements.length > 0 : elements.length > 1;
        }
        return false;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @param {IFPage} [page] if page-aligned specifies the reference page,
     * if not given, uses the active one
     * @override
     */
    GAlignAction.prototype.execute = function (elements, page) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        if (!elements) {
            elements = document.getEditor().getSelection();
        }

        var alignBBox = null;

        if (this._pageAlign) {
            page = page || scene.getActivePage();
            if (!page) {
                return;
            }

            alignBBox = page.getPaintBBox();
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
                var bbox = element.getPaintBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                switch (this._type) {
                    case GAlignAction.Type.Left:
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