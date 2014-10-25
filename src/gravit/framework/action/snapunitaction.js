(function (_) {

    /**
     * Action for snapping to units
     * @class GSnapUnitAction
     * @extends GAction
     * @constructor
     */
    function GSnapUnitAction(type) {
        this._type = type;
        this._title = new GLocale.Key(GSnapUnitAction, 'title.' + type);
    };
    GObject.inherit(GSnapUnitAction, GAction);

    /** @enum */
    GSnapUnitAction.Type = {
        FullUnit: 'full',
        HalfUnit: 'half'
    };

    GSnapUnitAction.ID = 'arrange.snap-unit';

    /** @type {GSnapUnitAction.Type} */
    GSnapUnitAction.prototype._type = null;

    /** @type {GLocale.Key} */
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
        return GApplication.CATEGORY_MODIFY_ALIGN;
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getGroup = function () {
        return 'arrange/snap-unit';
    };

    /**
     * @override
     */
    GSnapUnitAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GSnapUnitAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
        return false;
    };

    /**
     * @param {Array<GElement>} [elements] optional elements, if not given
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
        GEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                if (!element.hasMixin(GElement.Transform)) {
                    continue;
                }

                var bbox = element.getGeometryBBox();
                if (!bbox || bbox.isEmpty()) {
                    continue;
                }

                var x = GMath.round(bbox.getX(), true);
                var y = GMath.round(bbox.getY(), true);
                var w = GMath.round(bbox.getWidth(), true);
                var h = GMath.round(bbox.getHeight(), true);

                if (this._type === GSnapUnitAction.Type.HalfUnit) {
                    x += 0.5;
                    y += 0.5;
                    w += 0.5;
                    h += 0.5;
                }

                var transform = new GTransform()
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