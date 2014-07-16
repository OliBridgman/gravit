(function (_) {

    /**
     * The transform box to transform multiple elements
     * @param {GRect} bbox - selection bounding box
     * @param {Number} cx - the x coordinate of the transform bbox center (optional)
     * @param {Number} cy - the y coordinate of the transform bbox center (optional)
     * @class IFTransformBox
     * @extends IFElement
     * @mixes IFElement.Transform
     * @mixes IFElement.Pivot
     * @mixes IFVertexSource
     * @constructor
     */
    function IFTransformBox(bbox, cx, cy) {
        IFItem.call(this);
        this._setDefaultProperties(IFTransformBox.GeometryProperties);
        var tl = bbox.getSide(GRect.Side.TOP_LEFT);
        this.$tlx = tl.getX();
        this.$tly = tl.getY();
        var tr = bbox.getSide(GRect.Side.TOP_RIGHT);
        this.$trx = tr.getX();
        this.$try = tr.getY();
        var br = bbox.getSide(GRect.Side.BOTTOM_RIGHT);
        this.$brx = br.getX();
        this.$bry = br.getY();
        var bl = bbox.getSide(GRect.Side.BOTTOM_LEFT);
        this.$blx = bl.getX();
        this.$bly = bl.getY();
        this._vertices = new IFVertexContainer();
        this.$cx = cx ? cx : (this.$tlx + this.$brx) / 2;
        this.$cy = cy ? cy : (this.$tly + this.$bry) / 2;
    }
    IFObject.inherit(IFTransformBox, IFItem);

    /**
     * The geometry properties of a shape with their default values
     */
    IFTransformBox.GeometryProperties = {
        trf: null,
        tlx: null,
        tly: null,
        trx: null,
        try: null,
        brx: null,
        bry: null,
        blx: null,
        bly: null,
        cx: null,
        cy: null,
        cTrf: null
    };

    /**
     * The size of the transform box annotation
     * @type {Number}
     */
    IFTransformBox.ANNOT_SIZE = 8;

    /**
     * The margin at which the painted box located from exact transform box around selection
     * @type {Number}
     */
    IFTransformBox.TRANSFORM_MARGIN = 10;

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
    IFTransformBox.OUTLINE = ifUtil.uuid();
    IFTransformBox.INSIDE = ifUtil.uuid();
    IFTransformBox.OUTSIDE = ifUtil.uuid();

    // -----------------------------------------------------------------------------------------------------------------
    // IFTransformBox Class
    // -----------------------------------------------------------------------------------------------------------------

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

    /** @override */
    IFTransformBox.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    IFTransformBox.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    IFTransformBox.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
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
        return ifVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    IFTransformBox.prototype._calculatePaintBBox = function () {
        var bbox = this._calculateGeometryBBox();
        if (bbox) {
            bbox = bbox.expanded(IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE,
                IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE);

            var annotBBox = ifAnnotation.getAnnotationBBox(null, this._getPoint(IFTransformBox.Handles.ROTATION_CENTER),
                IFTransformBox.ANNOT_SIZE);
            if (annotBBox) {
                bbox = bbox.united(annotBBox);
            }

            return bbox;
        }

        return null;
    };

    /** @override */
    IFTransformBox.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFTransformBox.GeometryProperties);
        if (change == IFNode._Change.AfterPropertiesChange) {
            this._verticesDirty = true;
        }
        IFItem.prototype._handleChange.call(this, change, args);
    };

    /**
     * Paints the transform box and it's handles
     * @param context
     * @param {GTransform} transform
     */
    IFTransformBox.prototype.paint = function (context, transform) {
        // Outline is painted with non-transformed stroke
        // so we reset transform, transform the vertices
        // ourself and then re-apply the transformation
        var canvasTransform = context.canvas.resetTransform();
        this._extTransform = canvasTransform.multiplied(transform);
        this._verticesDirty = true;

        if (!this._preparePaint(context)) {
            return;
        }


        if (!this._centerOnly) {
            if (!this.rewindVertices(0)) {
                return;
            }

            //context.canvas.setLineDash([5]);
            // TODO: draw dashed line
            context.canvas.putVertices(new IFVertexPixelAligner(this));
            context.canvas.strokeVertices(context.selectionOutlineColor, 1);
            for (var side = 0; side < 8 ; ++side) {
                var pt = this._getPoint(side);
                ifAnnotation.paintAnnotation(context, null, pt, ifAnnotation.AnnotType.Rectangle,
                    true, IFTransformBox.ANNOT_SIZE);
            }
        }
        ifAnnotation.paintAnnotation(context, null, this._getPoint(IFTransformBox.Handles.ROTATION_CENTER),
            ifAnnotation.AnnotType.Circle, true, IFTransformBox.ANNOT_SIZE);
        context.canvas.setTransform(canvasTransform);

        this._finishPaint(context);
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
     * @param {GTransform} transform
     */
    IFTransformBox.prototype.setCenterTransform = function (transform) {
        this.setProperty('cTrf', transform);
    };

    /**
     * Called whenever information about a part at a given location shall be returned
     * @param {GPoint} location the location to get a part for in view coordinates
     * @param {GTransform} transform the current transformation of the view
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
        for (var side = 0; side < 9; ++side) {
            var handle = this._getPoint(side);
            if (ifAnnotation.getAnnotationBBox(null, handle, IFTransformBox.ANNOT_SIZE)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                result = new IFElementEditor.PartInfo(null, side, handle);
                break;
            }
        }

        // test outline and inside
        if (!result) {
            var hitRes = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), this,
                    tolerance, true, hitRes)) {

                if (hitRes.outline) {
                    result = new IFElementEditor.PartInfo(null, IFTransformBox.OUTLINE, null);
                } else {
                    result = new IFElementEditor.PartInfo(null, IFTransformBox.INSIDE, null);
                }
            } else {
                // TODO: return sector for proper cursor
                result = new IFElementEditor.PartInfo(null, IFTransformBox.OUTSIDE, null);
            }
        }

        return result;
    };

    /**
     * Calculate the transformation, which should be applied to the selection
     * based on the movement of transform box or it's handles
     * @param {IFElementEditor.PartInfo} partInfo - transform box part information, which is moved
     * @param {GPoint} startPtTr - movement start point
     * @param {GPoint} endPtTr - movement end point
     * @param {IFGuides} guides to be used for snapping
     * @param {Boolean} option - if true and one of resize handles is moved,
     * update transform box symmetrically to center
     * @param {Boolean} ratio - if true and one of resize handles is moved, make equal scaling for width and height
     * @returns {GTransform}
     */
    IFTransformBox.prototype.calculateTransformation = function (partInfo, startPtTr, endPtTr, guides, option, ratio) {
        var deltaTr = endPtTr.subtract(startPtTr);
        var dx = deltaTr.getX();
        var dy = deltaTr.getY();

        var _snap = function (x, y, snapX, snapY) {
            var pt = guides.mapPoint(new GPoint(x + dx, y + dy));
            if (snapX) {
                dx = pt.getX() - x;
            }
            if (snapY) {
                dy = pt.getY() - y;
            }
        }.bind(this);

        if (partInfo.id < 8) {
            var transform1 = null;
            var transform3 = null;
            var width = this.$brx - this.$tlx;
            var height = this.$bry - this.$tly;

            switch (partInfo.id) {
                case IFTransformBox.Handles.TOP_LEFT:
                    _snap(this.$tlx, this.$tly, true, true);
                    width = this.$brx - this.$tlx - dx;
                    height = this.$bry - this.$tly - dy;
                    if (!option) {
                        var tlxNew = this.$tlx + dx;
                        var tlyNew = this.$tly + dy;

                        transform1 = new GTransform(1, 0, 0, 1, -this.$brx, -this.$bry);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew + width, tlyNew + height);
                    }
                    break;
                case IFTransformBox.Handles.TOP_CENTER:
                    _snap(this.$tlx, this.$tly, false, true);
                    height = this.$bry - this.$tly - dy;
                    if (!option) {
                        var tlyNew = this.$tly + dy;
                        var botCenter = new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -botCenter.getX(), -botCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1, botCenter.getX(), tlyNew + height);
                    }
                    break;
                case IFTransformBox.Handles.TOP_RIGHT:
                    _snap(this.$trx, this.$try, true, true);
                    width = width + dx;
                    height = height - dy;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var tlyNew = this.$tly + dy;
                        transform1 = new GTransform(1, 0, 0, 1, -this.$blx, -this.$bly);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew, tlyNew + height);
                    }
                    break;
                case IFTransformBox.Handles.RIGHT_CENTER:
                    _snap(this.$trx, this.$try, true, false);
                    width = width + dx;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var leftCenter = new GPoint((this.$blx + this.$tlx) / 2, (this.$bly + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -leftCenter.getX(), -leftCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  tlxNew, leftCenter.getY());
                    }
                    break;
                case IFTransformBox.Handles.BOTTOM_RIGHT:
                    _snap(this.$brx, this.$bry, true, true);
                    width = width + dx;
                    height = height + dy;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var tlyNew = this.$tly;
                        transform1 = new GTransform(1, 0, 0, 1, -this.$tlx, -this.$tly);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew, tlyNew);
                    }
                    break;
                case IFTransformBox.Handles.BOTTOM_CENTER:
                    _snap(this.$brx, this.$bry, false, true);
                    height = height + dy;
                    if (!option) {
                        var tlyNew = this.$tly;
                        var topCenter = new GPoint((this.$trx + this.$tlx) / 2, (this.$try + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -topCenter.getX(), -topCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  topCenter.getX(), tlyNew);
                    }
                    break;
                case IFTransformBox.Handles.BOTTOM_LEFT:
                    _snap(this.$blx, this.$bly, true, true);
                    width = width - dx;
                    height = height + dy;
                    if (!option) {
                        var tlxNew = this.$tlx + dx;
                        var tlyNew = this.$tly;
                        transform1 = new GTransform(1, 0, 0, 1, -this.$trx, -this.$try);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew + width, tlyNew);
                    }
                    break;
                case IFTransformBox.Handles.LEFT_CENTER:
                    _snap(this.$blx, this.$bly, true, false);
                    width = width - dx;
                    if (!option) {
                        var dxNew = dx;
                        var tlxNew = this.$tlx + dxNew;
                        var rightCenter = new GPoint((this.$trx + this.$brx) / 2, (this.$try + this.$bry) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -rightCenter.getX(), -rightCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew + width, rightCenter.getY());
                    }
                    break;
            }

            var scaleX = width / (this.$brx - this.$tlx);
            var scaleY = height / (this.$bry - this.$tly);
            if (option) {
                scaleX += scaleX - 1;
                scaleY += scaleY - 1;
                var cnt = new GPoint((this.$tlx + this.$brx) / 2, (this.$tly + this.$bry) / 2);
                transform1 = new GTransform(1, 0, 0, 1, -cnt.getX(), -cnt.getY());
                transform3 = new GTransform(1, 0, 0, 1, cnt.getX(), cnt.getY());
            }
            if (ratio){
                switch (partInfo.id) {
                    case IFTransformBox.Handles.TOP_CENTER:
                    case IFTransformBox.Handles.BOTTOM_CENTER:
                        // Make equal delta for center resize
                        scaleX = Math.abs(scaleY);
                        break;
                    case IFTransformBox.Handles.LEFT_CENTER:
                    case IFTransformBox.Handles.RIGHT_CENTER:
                        // Make equal delta for center resize
                        scaleY = Math.abs(scaleX);
                        break;
                    default:
                        if (Math.abs(scaleX) > Math.abs(scaleY)) {
                            if (ifMath.isEqualEps(scaleY, 0)) {
                                scaleY = scaleX;
                            } else {
                                scaleY = scaleY * Math.abs(scaleX) / Math.abs(scaleY);
                            }
                        } else {
                            if (ifMath.isEqualEps(scaleX, 0)) {
                                scaleX = scaleY;
                            } else {
                                scaleX = scaleX * Math.abs(scaleY) / Math.abs(scaleX);
                            }
                        }
                        break;
                }
            }
            var transform2 = new GTransform(scaleX, 0, 0, scaleY, 0, 0);

            return transform1.multiplied(transform2).multiplied(transform3);
        } else if (partInfo.id == IFTransformBox.Handles.ROTATION_CENTER) {
            _snap(this.$cx, this.$cy, true, true);
            return new GTransform(1, 0, 0, 1, dx, dy);
        } else {
            _snap(this.$tlx, this.$tly, true, true);
            return new GTransform(1, 0, 0, 1, dx, dy);
            // TODO: support rotation when OUTSIDE, skew when outline
        }
    };

    /**
     * Permanently applies transform from $trf or $cTrf property to the transform box center
     */
    IFTransformBox.prototype.applyTransform = function () {
        // Transform is applied to center only, as transform box itself should always stay rectangular.
        // So the transform box itself should be recalculated after transformation is applied to the selection
        if (this.$trf || this.$cTrf) {
            var trf = this.$trf ? this.$trf : this.$cTrf;
            var cntr = trf.mapPoint(new GPoint(this.$cx, this.$cy));
            this.setProperties(['cTrf', 'trf', 'cx', 'cy'], [null, null, cntr.getX(), cntr.getY()]);
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
     * @returns {GPoint} - a center point of the needed transform box handle
     * @private
     */
    IFTransformBox.prototype._getPoint = function (side, noTransform) {
        var pt = null;

        var _transform = function (pt, trans) {
            var objTrans = trans ? trans : this.$trf;
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
                pt = _transform(new GPoint(this.$tlx, this.$tly));
                pt = new GPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.TOP_CENTER:
                pt = _transform(new GPoint((this.$tlx + this.$trx) / 2, (this.$tly + this.$try) / 2));
                pt = new GPoint(pt.getX(), pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.TOP_RIGHT:
                pt = _transform(new GPoint(this.$trx, this.$try));
                pt = new GPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY() - IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.RIGHT_CENTER:
                pt = _transform(new GPoint((this.$trx + this.$brx) / 2, (this.$try + this.$bry) / 2));
                pt = new GPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case IFTransformBox.Handles.BOTTOM_RIGHT:
                pt = _transform(new GPoint(this.$brx, this.$bry));
                pt = new GPoint(pt.getX() + IFTransformBox.TRANSFORM_MARGIN, pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.BOTTOM_CENTER:
                pt = _transform(new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2));
                pt = new GPoint(pt.getX(), pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.BOTTOM_LEFT:
                pt = _transform(new GPoint(this.$blx, this.$bly));
                pt = new GPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY() + IFTransformBox.TRANSFORM_MARGIN);
                break;
            case IFTransformBox.Handles.LEFT_CENTER:
                pt = _transform(new GPoint((this.$tlx + this.$blx) / 2, (this.$tly + this.$bly) / 2));
                pt = new GPoint(pt.getX() - IFTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case IFTransformBox.Handles.ROTATION_CENTER:
                pt = _transform(new GPoint(this.$cx, this.$cy), this.$cTrf);
                break;
        }

        return pt;
    };

    /** @override */
    IFTransformBox.prototype.toString = function () {
        return "[IFTransformBox]";
    };

    _.IFTransformBox = IFTransformBox;
})(this);
