(function (_) {

    /**
     * Action for transforming
     * @class GTransformAction
     * @extends GAction
     * @constructor
     */
    function GTransformAction(type) {
        this._type = type;
        this._title = new IFLocale.Key(GTransformAction, 'title.' + type);
    };
    IFObject.inherit(GTransformAction, GAction);

    /** @enum */
    GTransformAction.Type = {
        Rotate45Left: 'rotate-45-left',
        Rotate90Left: 'rotate-90-left',
        Rotate180Left: 'rotate-180-left',
        Rotate45Right: 'rotate-45-right',
        Rotate90Right: 'rotate-90-right',
        Rotate180Right: 'rotate-180-right',
        FlipVertical: 'flip-vertical',
        FlipHorizontal: 'flip-horizontal'
    };

    GTransformAction.ID = 'arrange.transform';

    /** @type {GTransformAction.Type} */
    GTransformAction.prototype._type = null;

    /** @type {IFLocale.Key} */
    GTransformAction.prototype._title = null;

    /**
     * @override
     */
    GTransformAction.prototype.getId = function () {
        return GTransformAction.ID + '.' + this._type;
    };

    /**
     * @override
     */
    GTransformAction.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * @override
     */
    GTransformAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_ARRANGE_TRANSFORM;
    };

    /**
     * @override
     */
    GTransformAction.prototype.getGroup = function () {
        var result = '';

        switch (this._type) {
            case GTransformAction.Type.Rotate45Left:
            case GTransformAction.Type.Rotate90Left:
            case GTransformAction.Type.Rotate180Left:
                result = 'rotate_left';
                break;
            case GTransformAction.Type.Rotate45Right:
            case GTransformAction.Type.Rotate90Right:
            case GTransformAction.Type.Rotate180Right:
                result = 'rotate_right';
                break;
            case GTransformAction.Type.FlipVertical:
            case GTransformAction.Type.FlipHorizontal:
                result = 'flip';
                break;
        }

        return 'transform/' + result;
    };

    /**
     * @override
     */
    GTransformAction.prototype.getShortcut = function () {
        return null;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GTransformAction.prototype.isEnabled = function (elements) {
        elements = elements || (gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getSelection() : null);
        return elements && elements.length > 0;
    };

    /**
     * @param {Array<IFElement>} [elements] optional elements, if not given
     * uses the selection
     * @override
     */
    GTransformAction.prototype.execute = function (elements) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();

        if (!elements) {
            elements = document.getEditor().getSelection();
        }

        IFEditor.tryRunTransaction(scene, function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                var bbox = element.getGeometryBBox();

                if (element.hasMixin(IFElement.Transform) && bbox && !bbox.isEmpty()) {
                    var center = bbox.getSide(IFRect.Side.CENTER);
                    var rotation = 0;
                    var scaleX = 1;
                    var scaleY = 1;

                    switch (this._type) {
                        case GTransformAction.Type.Rotate45Left:
                            rotation = -45;
                            break;

                        case GTransformAction.Type.Rotate90Left:
                            rotation = -90;
                            break;

                        case GTransformAction.Type.Rotate180Left:
                            rotation = -180;
                            break;

                        case GTransformAction.Type.Rotate45Right:
                            rotation = 45;
                            break;

                        case GTransformAction.Type.Rotate90Right:
                            rotation = 90;
                            break;

                        case GTransformAction.Type.Rotate180Right:
                            rotation = 180;
                            break;

                        case GTransformAction.Type.FlipVertical:
                            scaleY = -1;
                            break;

                        case GTransformAction.Type.FlipHorizontal:
                            scaleX = -1;
                            break;
                    }

                    var transform = new IFTransform()
                        .translated(-center.getX(), -center.getY())
                        .scaled(scaleX, scaleY)
                        .rotated(ifMath.toRadians(rotation))
                        .translated(center.getX(), center.getY());

                    element.transform(transform);
                }
            }
        }.bind(this), ifLocale.get(this.getTitle()));
    };

    /** @override */
    GTransformAction.prototype.toString = function () {
        return "[Object GTransformAction]";
    };

    _.GTransformAction = GTransformAction;
})(this);