(function (_) {

    /**
     * The transform box to transform multiple elements
     * @param {IFRect} bbox - selection bounding box
     * @param {Number} cx - the x coordinate of the transform bbox center (optional)
     * @param {Number} cy - the y coordinate of the transform bbox center (optional)
     * @class IFTransformBox
     * @extends IFElement
     * @mixes IFElement.Transform
     * @mixes IFVertexSource
     * @constructor
     */
    function IFTransformBox(bbox, cx, cy) {
        var tl = bbox.getSide(IFRect.Side.TOP_LEFT);
        this.tlx = tl.getX();
        this.tly = tl.getY();
        var tr = bbox.getSide(IFRect.Side.TOP_RIGHT);
        this.trx = tr.getX();
        this.try = tr.getY();
        var br = bbox.getSide(IFRect.Side.BOTTOM_RIGHT);
        this.brx = br.getX();
        this.bry = br.getY();
        var bl = bbox.getSide(IFRect.Side.BOTTOM_LEFT);
        this.blx = bl.getX();
        this.bly = bl.getY();
        this._vertices = new IFVertexContainer();
        this.cx = cx ? cx : (this.tlx + this.brx) / 2;
        this.cy = cy ? cy : (this.tly + this.bry) / 2;
    }

    /**
     * The size of the transform box annotation
     * @type {Number}
     */
    IFTransformBox.ANNOT_SIZE = 6;

    /**
     * The margin at which the painted box located from exact transform box around selection
     * @type {Number}
     */
    IFTransformBox.TRANSFORM_MARGIN = 0;

    /**
     * The identifiers of transform box handles
     * @enum
     */
    IFTransformBox.Handles = {
        TOP_LEFT: 0,
        TOP_CENTER: 1,
        TOP_RIGHT: 2,
        RIGHT_CENTER: 3,
        BOTTOM_RIGHT: 4,
        BOTTOM_CENTER: 5,
        BOTTOM_LEFT: 6,
        LEFT_CENTER: 7,
        ROTATION_CENTER: 8
    };

    /**
     * The identifiers of the locations relatively to transform box
     */
    IFTransformBox.OUTLINE = IFUtil.uuid();
    IFTransformBox.INSIDE = IFUtil.uuid();
    IFTransformBox.OUTSIDE = IFUtil.uuid();

    // -----------------------------------------------------------------------------------------------------------------
    // IFTransformBox Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The geometry properties of a shape with their default values
     */
    IFTransformBox.prototype.tlx = null;
    IFTransformBox.prototype.tly = null;
    IFTransformBox.prototype.trx = null;
    IFTransformBox.prototype.try = null;
    IFTransformBox.prototype.brx = null;
    IFTransformBox.prototype.bry = null;
    IFTransformBox.prototype.blx = null;
    IFTransformBox.prototype.bly = null;
    IFTransformBox.prototype.cx = null;
    IFTransformBox.prototype.cy = null;
    IFTransformBox.prototype.trf = null;
    IFTransformBox.prototype.cTrf = null;

    /**
     * @type {IFVertexContainer}
     * @private
     */
    IFTransformBox.prototype._vertices = null;

    /**
     * Contains transform, which should be applied to transform box vertices before expanding it to TRANSFORM_MARGIN
     * and vertices generation
     * @type {IFTransform}
     * @private
     */
    IFTransformBox.prototype._extTransform = null;

    IFTransformBox.prototype.getTransform = function () {
        return this.trf;
    };

    IFTransformBox.prototype.setTransform = function (transform) {
        this.trf = transform;
    };

    IFTransformBox.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.trf = this.trf ? this.trf.multiplied(transform) : transform;
        }
    };

    /** override */
    IFTransformBox.prototype.rewindVertices = function (index) {
        if (this._vertices == null || this._verticesDirty || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();
            this._generateVertices();
            this._verticesDirty = false;
        }
        return this._vertices.rewindVertices(index);
    };

    /** override */
    IFTransformBox.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };

    /** @override */
    IFTransformBox.prototype._calculateGeometryBBox = function () {
        var ct = this._getPoint(IFTransformBox.Handles.ROTATION_CENTER);
        var xMin = ct.getX();
        var xMax = xMin;
        var yMin = ct.getY();
        var yMax = yMin;
        var edges = [IFTransformBox.Handles.TOP_LEFT, IFTransformBox.Handles.TOP_RIGHT,
            IFTransformBox.Handles.BOTTOM_RIGHT, IFTransformBox.Handles.BOTTOM_LEFT];
        for (var i = 0; i < edges.length; ++i) {
            var pt = this._getPoint(edges[i]);
            if (xMin > pt.getX()) {
                xMin = pt.getX();
            }
            if (xMax < pt.getX()) {
                xMax = pt.getX();
            }
            if (yMin > pt.getY()) {
                yMin = pt.getY();
            }
            if (yMax < pt.getY()) {
                yMax = pt.getY();
            }
        }
        return new IFRect(xMin, yMin, xMax - xMin, yMax - yMin);
    };

    /** @override */
    IFTransformBox.prototype._calculatePaintBBox = function () {
        var bbox = this._calculateGeometryBBox();
        if (bbox) {
            bbox = bbox.expanded(IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE,
                IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE);

            /*var annotBBox = ifAnnotation.getAnnotationBBox(null, this._getPoint(IFTransformBox.Handles.ROTATION_CENTER),
                IFTransformBox.ANNOT_SIZE);
            if (annotBBox) {
                bbox = bbox.united(annotBBox);
            }   */

            return bbox;
        }

        return null;
    };

    /**
     * Paints the transform box and it's handles
     * @param {IFTransform} transform
     * @param context
     */
    IFTransformBox.prototype.paint = function (transform, context) {
        // Outline is painted with non-transformed stroke
        // so we reset transform, transform the vertices
        // ourself and then re-apply the transformation
        var canvasTransform = context.canvas.resetTransform();
        this._extTransform = transform ? canvasTransform.multiplied(transform) : canvasTransform;
        this._verticesDirty = true;

        if (!this._centerOnly) {
            if (!this.rewindVertices(0)) {
                return;
            }

            //context.canvas.setLineDash([5]);
            // TODO: draw dashed line
            context.canvas.putVertices(new IFVertexPixelAligner(this));
            context.canvas.strokeVertices(IFRGBColor.BLACK, 1);

            var sides = this._collectResizeHandles(transform);
            for (var i = 0; i < sides.length; ++i) {
                var pt = this._getPoint(sides[i]);
                ifAnnotation.paintAnnotation(context, null, pt, ifAnnotation.AnnotType.Rectangle,
                    false, IFTransformBox.ANNOT_SIZE, IFRGBColor.WHITE, IFRGBColor.BLACK);
            }
        }
        ifAnnotation.paintAnnotation(context, null, this._getPoint(IFTransformBox.Handles.ROTATION_CENTER),
            ifAnnotation.AnnotType.Circle, false, IFTransformBox.ANNOT_SIZE, IFRGBColor.WHITE, IFRGBColor.BLACK);
        context.canvas.setTransform(canvasTransform);

        this._extTransform = null;
    };

    /**
     * Sets options to not paint the full transform box, just it's center during painting
     */
    IFTransformBox.prototype.hide = function () {
        this._centerOnly = true;
    };

    /**
     * Sets options to paint the full transform box if it was hided before
     */
    IFTransformBox.prototype.show = function () {
        this._centerOnly = false;
    };

    /**
     * Sets the transformation for transform box center only
     * @param {IFTransform} transform
     */
    IFTransformBox.prototype.setCenterTransform = function (transform) {
        this.cTrf = transform;
    };

    /**
     * Called whenever information about a part at a given location shall be returned
     * @param {IFPoint} location the location to get a part for in view coordinates
     * @param {IFTransform} transform the current transformation of the view
     * @param {Number} [tolerance] optional tolerance for testing the location.
     * If not provided defaults to zero.
     * @returns {IFElementEditor.PartInfo} null if no part is available or a valid part info
     */
    IFTransformBox.prototype.getPartInfoAt = function (location, transform, tolerance) {
        var result = null;

        if (transform) {
            this._extTransform = transform;
            this._verticesDirty = true;
        }

        // test handles and center
        var sides = this._collectResizeHandles(transform);
        sides.push(IFTransformBox.Handles.ROTATION_CENTER);
        for (var i = 0; i < sides.length; ++i) {
            var handle = this._getPoint(sides[i]);
            if (ifAnnotation.getAnnotationBBox(null, handle, IFTransformBox.ANNOT_SIZE)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                result = new IFElementEditor.PartInfo(null, sides[i], handle);
                break;
            }
        }

        // test outline and inside
        if (!result) {
            var hitRes = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), this,
                    tolerance, true, hitRes)) {

                if (hitRes.outline) {
                    var edgeType = hitRes.segment % 2;
                    result = new IFElementEditor.PartInfo(null, IFTransformBox.OUTLINE, edgeType);
                } else {
                    result = new IFElementEditor.PartInfo(null, IFTransformBox.INSIDE, null);
                }
            } else {
                var rotSegm = this.getRotationSegment(location, transform);
                result = new IFElementEditor.PartInfo(null, IFTransformBox.OUTSIDE, rotSegm);
            }
        }

        this._extTransform = null;
        return result;
    };

    /**
     * Called whenever information about a circle sector at a given location shall be returned
     * @param {IFPoint} location the location to get a sector for in view coordinates
     * @param {IFTransform} transform the current transformation of the view
     * @returns {Number} the number of the rotation sector from 8 equal sectors, starting from top left
     */
    IFTransformBox.prototype.getRotationSegment = function (location, transform) {
        var rotSegm = 0;
        var cntr = transform.mapPoint(new IFPoint(this.cx, this.cy));
        var angle = Math.atan2(location.getY() - cntr.getY(), location.getX() - cntr.getX()) + Math.PI * 7 / 8;
        if (angle < 0) {
            angle += IFMath.PI2;
        }
        rotSegm = Math.floor(angle / (Math.PI / 4));
        if (rotSegm < 0 || rotSegm > 7) {
            rotSegm = 7;
        }
        return rotSegm;
    };

    /**
     * Calculate the transformation, which should be applied to the selection
     * based on the movement of transform box or it's handles
     * @param {IFElementEditor.PartInfo} partInfo - transform box part information, which is moved
     * @param {IFPoint} startPtTr - movement start point
     * @param {IFPoint} endPtTr - movement end point
     * @param {IFGuides} guides to be used for snapping
     * @param {Boolean} option - if true and one of resize handles is moved,
     * update transform box symmetrically to center
     * @param {Boolean} ratio - if true and one of resize handles is moved, make equal scaling for width and height
     * @param {Number} ratioStep
     * @returns {IFTransform}
     */
    IFTransformBox.prototype.calculateTransformation = function (partInfo, startPtTr, endPtTr, guides, option, ratio,
                                                                 ratioStep) {
        var deltaTr = endPtTr.subtract(startPtTr);
        var dx = deltaTr.getX();
        var dy = deltaTr.getY();

        var _snap = function (x, y, snapX, snapY) {
            var pt = guides.mapPoint(new IFPoint(x + dx, y + dy));
            if (snapX) {
                dx = pt.getX() - x;
            }
            if (snapY) {
                dy = pt.getY() - y;
            }
        }.bind(this);

        if (partInfo.id < 8) {
            var sides = [IFRect.Side.TOP_LEFT, IFRect.Side.TOP_CENTER, IFRect.Side.TOP_RIGHT, IFRect.Side.RIGHT_CENTER,
                IFRect.Side.BOTTOM_RIGHT, IFRect.Side.BOTTOM_CENTER, IFRect.Side.BOTTOM_LEFT, IFRect.Side.LEFT_CENTER];

            var tBoxRect = new IFRect(this.tlx, this.tly, this.brx - this.tlx, this.bry - this.tly);
            var rectSide = sides[partInfo.id];
            var handlePt = tBoxRect.getSide(rectSide);
            _snap(handlePt.getX(), handlePt.getY(), true, true);

            return tBoxRect.getResizeTransform(rectSide, dx, dy, ratio, option);
        } else if (partInfo.id == IFTransformBox.Handles.ROTATION_CENTER) {
            _snap(this.cx, this.cy, true, true);
            return new IFTransform(1, 0, 0, 1, dx, dy);
        } else if (partInfo.id == IFTransformBox.OUTSIDE) {
            transform1 = new IFTransform(1, 0, 0, 1, -this.cx, -this.cy);
            transform3 = new IFTransform(1, 0, 0, 1, this.cx, this.cy);
            var angle1 = Math.atan2(startPtTr.getY() - this.cy, startPtTr.getX() - this.cx);
            var angle2 = Math.atan2(endPtTr.getY() - this.cy, endPtTr.getX() - this.cx);
            var angleDelta = angle1 - angle2;
            // Lock angle to 15° if desired
            if (ratio) {
                var step = ratioStep ? ratioStep : Math.PI / 12;
                angleDelta = Math.round(angleDelta / step) * step;
            }
            var cosA = Math.cos(angleDelta);
            var sinA = Math.sin(angleDelta);
            var transform2 = new IFTransform(cosA, -sinA, sinA, cosA, 0, 0);
            return transform1.multiplied(transform2).multiplied(transform3);
        } else if (partInfo.id == IFTransformBox.OUTLINE) {
            transform1 = new IFTransform(1, 0, 0, 1, -this.cx, -this.cy);
            transform3 = new IFTransform(1, 0, 0, 1, this.cx, this.cy);

            if (ratio && ratioStep) {
                var step = ratioStep ? ratioStep : 20;
                dx = Math.round(dx / step) * step;
                dy = Math.round(dy / step) * step;
            }

            var transform2 = new IFTransform(
                1, dy * 2 / (this.brx - this.tlx), -dx * 2 / (this.bry - this.tly), 1, 0, 0);

            return transform1.multiplied(transform2).multiplied(transform3);
        } else {
            var width3 = (this.brx - this.tlx) / 3.0;
            var height3 = (this.bry - this.tly) / 3.0;
            var handleX = this.cx;
            var handleY = this.cy;

            if (startPtTr.getX() <= this.tlx + width3) {
                handleX = this.tlx;
            } else if (startPtTr.getX() >= this.tlx + width3 * 2) {
                handleX = this.brx;
            }
            if (startPtTr.getY() <= this.tly + height3) {
                handleY = this.tly;
            } else if (startPtTr.getY() >= this.tly + height3 * 2) {
                handleY = this.bry;
            }

            _snap(handleX, handleY, true, true);
            return new IFTransform(1, 0, 0, 1, dx, dy);
        }
    };

    /**
     * Permanently applies transform from trf or cTrf property to the transform box center
     */
    IFTransformBox.prototype.applyCenterTransform = function () {
        // Transform is applied to center only, as transform box itself should always stay rectangular.
        // So the transform box itself should be recalculated after transformation is applied to the selection
        if (this.trf || this.cTrf) {
            var trf = this.trf ? this.trf : this.cTrf;
            var cntr = trf.mapPoint(new IFPoint(this.cx, this.cy));
            this.cTrf = null;
            this.trf = null;
            this.cx = cntr.getX();
            this.cy = cntr.getY();
        }
    };

    /**
     * Generates vertices of the transform box rectangle
     * @private
     */
    IFTransformBox.prototype._generateVertices = function () {
        if (!this._vertices || this._vertices.getCount() != 5) {
            this._vertices = new IFVertexContainer();
        } else {
            this._vertices.rewindVertices(0);
        }

        var tl = this._getPoint(IFTransformBox.Handles.TOP_LEFT);
        var tr = this._getPoint(IFTransformBox.Handles.TOP_RIGHT);
        var br = this._getPoint(IFTransformBox.Handles.BOTTOM_RIGHT);
        var bl = this._getPoint(IFTransformBox.Handles.BOTTOM_LEFT);

        this._vertices.addVertex(IFVertex.Command.Move, tl.getX(), tl.getY());
        this._vertices.addVertex(IFVertex.Command.Line, tr.getX(), tr.getY());
        this._vertices.addVertex(IFVertex.Command.Line, br.getX(), br.getY());
        this._vertices.addVertex(IFVertex.Command.Line, bl.getX(), bl.getY());
        this._vertices.addVertex(IFVertex.Command.Close);
    };

    /**
     * Returns a center point of the needed transform box handle with all transformations applied (in view coordinates)
     * @param {IFTransformBox.Handles} side - the needed transform box handle center
     * @param {Boolean} noTransform - if true, do not apply internal transformation,
     * and return the original transform box point
     * @returns {IFPoint} - a center point of the needed transform box handle
     * @private
     */
    IFTransformBox.prototype._getPoint = function (side, noTransform) {
        var pt = null;

        var _transform = function (pt, trans) {
            var objTrans = trans ? trans : this.trf;
            var targTrans = this._extTransform;
            if (objTrans && !noTransform) {
                targTrans = targTrans ? objTrans.multiplied(targTrans) : objTrans;
            }

            if (targTrans && pt) {
                pt = targTrans.mapPoint(pt);
            }

            return pt;
        }.bind(this);

        switch (side) {
            case IFTransformBox.Handles.TOP_LEFT:
                pt = _transform(new IFPoint(this.tlx, this.tly));
                pt = new IFPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.TOP_CENTER:
                pt = _transform(new IFPoint((this.tlx + this.trx) / 2, (this.tly + this.try) / 2));
                pt = new IFPoint(pt.getX(), pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.TOP_RIGHT:
                pt = _transform(new IFPoint(this.trx, this.try));
                pt = new IFPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.RIGHT_CENTER:
                pt = _transform(new IFPoint((this.trx + this.brx) / 2, (this.try + this.bry) / 2));
                pt = new IFPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case IFTransformBox.Handles.BOTTOM_RIGHT:
                pt = _transform(new IFPoint(this.brx, this.bry));
                pt = new IFPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.BOTTOM_CENTER:
                pt = _transform(new IFPoint((this.blx + this.brx) / 2, (this.bly + this.bry) / 2));
                pt = new IFPoint(pt.getX(), pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.BOTTOM_LEFT:
                pt = _transform(new IFPoint(this.blx, this.bly));
                pt = new IFPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.LEFT_CENTER:
                pt = _transform(new IFPoint((this.tlx + this.blx) / 2, (this.tly + this.bly) / 2));
                pt = new IFPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case IFTransformBox.Handles.ROTATION_CENTER:
                pt = _transform(new IFPoint(this.cx, this.cy), this.cTrf);
                break;
        }

        return pt;
    };

    /**
     * Defines and return which resize handles should be painted and hit tested based on transform box size
     * @param {IFTransform} transform
     * @returns {Array<IFTransformBox.Handles>}
     * @private
     */
    IFTransformBox.prototype._collectResizeHandles = function (transform) {
        var bbox = new IFRect(this.tlx, this.tly, this.brx - this.tlx, this.bry - this.tly);
        bbox = this.trf ? this.trf.mapRect(bbox) : bbox;
        var transformedBBox = transform ? transform.mapRect(bbox) : bbox;
        var sides = [];
        if (transformedBBox.getHeight() > (IFTransformBox.ANNOT_SIZE + 2) * 2 &&
            transformedBBox.getWidth() > (IFTransformBox.ANNOT_SIZE + 2) * 2) {

            sides = sides.concat([IFTransformBox.Handles.TOP_LEFT, IFTransformBox.Handles.TOP_RIGHT,
                IFTransformBox.Handles.BOTTOM_LEFT, IFTransformBox.Handles.BOTTOM_RIGHT]);
        }
        if (transformedBBox.getHeight() > (IFTransformBox.ANNOT_SIZE + 2) * 3) {
            sides = sides.concat([IFTransformBox.Handles.RIGHT_CENTER, IFTransformBox.Handles.LEFT_CENTER]);
        }
        if (transformedBBox.getWidth() > (IFTransformBox.ANNOT_SIZE + 2) * 3) {
            sides = sides.concat([IFTransformBox.Handles.TOP_CENTER, IFTransformBox.Handles.BOTTOM_CENTER]);
        }
        return sides;
    };

    /** @override */
    IFTransformBox.prototype.toString = function () {
        return "[IFTransformBox]";
    };

    _.IFTransformBox = IFTransformBox;
})(this);
