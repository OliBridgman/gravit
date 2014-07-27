(function (_) {
    /**
     * Guides for managing guides like grid, smart guides etc.
     * @param {IFScene} scene
     * @class IFGuides
     * @extend GEventTarget
     * @constructor
     */
    function IFGuides(scene) {
        this._scene = scene;
    }

    IFObject.inherit(IFGuides, GEventTarget);

    /**
     * @type {IFScene}
     * @private
     */
    IFGuides.prototype._scene = null;

    /**
     * Call this if you want to start mapping. This needs
     * to be followed by a closing call to finishMap. If
     * you just want to map without any visual guides,
     * you don't need to call this.
     */
    IFGuides.prototype.beginMap = function () {
        // TODO
    };

    /**
     * Finish mapping. See beginMap description.
     */
    IFGuides.prototype.finishMap = function () {
        // TODO
    };

    /**
     * Map a point to the current snapping options
     * @param {IFPoint} point the point to map
     * @returns {IFPoint} a mapped point
     */
    IFGuides.prototype.mapPoint = function (point) {
        var result = point;

        var snapDistance = this._scene.getProperty('snapDist');

        // Snap to grid
        if (this._scene.getProperty('gridActive')) {
            var gsx = this._scene.getProperty('gridSizeX');
            var gsy = this._scene.getProperty('gridSizeY');
            result = new IFPoint(Math.round(result.getX() / gsx) * gsx, Math.round(result.getY() / gsy) * gsy);
        } else {
            // TODO : Get order etc. right
            // Snap to units if desired
            switch (this._scene.getProperty('unitSnap')) {
                case IFScene.UnitSnap.Full:
                    result = new IFPoint(ifMath.round(result.getX(), true), ifMath.round(result.getY(), true));
                    break;
                case IFScene.UnitSnap.Half:
                    result = new IFPoint(ifMath.round(result.getX(), true) + 0.5, ifMath.round(result.getY(), true) + 0.5);
                    break;
            }
        }

        /** TODO :
        // Snap to pages
        for (var child = this._scene.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFPage) {
                var pageBBox = child.getGeometryBBox();
                if (pageBBox && !pageBBox.isEmpty()) {
                    var x = result.getX();
                    var y = result.getY();

                    if (Math.abs(x - pageBBox.getX()) <= snapDistance) {
                        x = pageBBox.getX();
                    }
                    if (Math.abs(y - pageBBox.getY()) <= snapDistance) {
                        y = pageBBox.getY();
                    }

                    result = new IFPoint(x, y);
                }
            }
        }*/

        return result;
    };

    IFGuides.prototype.mapRect = function (rect) {
        // TODO
    };

    /**
     * Called whenever the guides should paint itself
     * @param {IFTransform} transform the transformation of the scene
     * @param {IFPaintContext} context
     */
    IFGuides.prototype.paint = function (transform, context) {
        var fillRect = context.canvas.getTransform(false).inverted().mapRect(new IFRect(0, 150.5, context.canvas.getWidth(), context.canvas.getHeight()));
        context.canvas.strokeLine(fillRect.getX(), fillRect.getY(), fillRect.getX() + fillRect.getWidth(), fillRect.getY(), 1, context.guideOutlineColor);
    };

    /** @override */
    IFGuides.prototype.toString = function () {
        return "[Object IFGuides]";
    };

    _.IFGuides = IFGuides;
})(this);