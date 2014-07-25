(function (_) {

    /**
     * Action for snapping to units
     * @class GSnapUnitAction
     * @extends GAction
     * @constructor
     */
    function GSnapUnitAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GSnapUnitAction, 'title.' + type);
    };
    IFObject.inherit(GSnapUnitAction, GAction);

    /** @enum */
    GSnapUnitAction.Type = {
        FullUnit: 'full',
        HalfUnit: 'half'
    };

    GSnapUnitAction.ID = 'arrange.snap-unit';

    /** @type {GSnapUnitAction.Type} */
    GSnapUnitAction.prototype._type = null;

    /** @type {IFLocale.Key} */
    GSnapUnitAction.prototype._title = null;

    /**
     * @override
     */
    GSnapUnitAction.prototype.getId = function () {
        return GSnapUnitAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE;
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getGroup = function () {
        return 'snap-unit';
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GSnapUnitAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
        return false;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GSnapUnitAction.prototype.execute = function (elements) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        if (!elements) {
            elements = document.getEditor().getSelection();
        }

        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                if (!element.hasMixin(IFElement.Transform)) {
                    continue;
                }

                var bbox = element.getGeometryBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                var x = ifMath.round(bbox.getX(), true);
                var y = ifMath.round(bbox.getY(), true);
                var w = ifMath.round(bbox.getWidth(), true);
                var h = ifMath.round(bbox.getHeight(), true);

                if (this._type === GSnapUnitAction.Type.HalfUnit) {
                    x += 0.5;
                    y += 0.5;
                    w += 0.5;
                    h += 0.5;
                }

                var transform = new IFTransform()
                    .translated(-bbox.getX(), -bbox.getY())
                    .scaled(w / bbox.getWidth(), h / bbox.getHeight())
                    .translated(bbox.getX(), bbox.getY())
                    .translated(x - bbox.getX(), y - bbox.getY());

                element.transform(transform);
            }
        }.bind(this), ifLocale.get(this.getTitle()));
    };

    /** @override */
    GSnapUnitAction.prototype.toString = function () {
        return "[Object GSnapUnitAction]";
    };

    _.GSnapUnitAction = GSnapUnitAction;
})(this);