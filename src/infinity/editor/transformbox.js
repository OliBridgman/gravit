(function (_) {

    /**
     * The transform box to transform multiple elements
     * @class GXTransformBox
     * @extends GXElement
     * @mixes GXElement.Transform
     * @mixes GXElement.Pivot
     * @mixes GXVertexSource
     * @constructor
     */
    function GXTransformBox(bbox) {
        GXItem.call(this);
        this._setDefaultProperties(GXTransformBox.GeometryProperties);
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
        this._vertices = new GXVertexContainer();
        this.$cx = (this.$tlx + this.$brx) / 2;
        this.$cy = (this.$tly + this.$bry) / 2;
    }
    GObject.inherit(GXTransformBox, GXItem);

    /**
     * The geometry properties of a shape with their default values
     */
    GXTransformBox.GeometryProperties = {
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
        cy: null
    };

    /**
     * The size of the transform box annotation
     * @type {Number}
     */
    GXTransformBox.ANNOT_SIZE = 8;

    /**
     * The margin at which the painted box located from exact transform box around selection
     * @type {Number}
     */
    GXTransformBox.TRANSFORM_MARGIN = 10;

    /**
     * The identifiers of transform box handles
     * @enum
     */
    GXTransformBox.Handles = {
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
    GXTransformBox.OUTLINE = gUtil.uuid();
    GXTransformBox.INSIDE = gUtil.uuid();
    GXTransformBox.OUTSIDE = gUtil.uuid();

    // -----------------------------------------------------------------------------------------------------------------
    // GXTransformBox Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GXVertexContainer}
     * @private
     */
    GXTransformBox.prototype._vertices = null;

    /**
     * Contains transform, which should be applied to transform box vertices before expanding it to TRANSFORM_MARGIN
     * and vertices generation
     * @type {GXTransform}
     * @private
     */
    GXTransformBox.prototype._extTransform = null;

    /** @override */
    GXTransformBox.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    GXTransformBox.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    GXTransformBox.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
        }
    };

    /** override */
    GXTransformBox.prototype.rewindVertices = function (index) {
        if (this._vertices == null || this._verticesDirty || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();
            this._generateVertices();
            this._verticesDirty = false;
        }
        return this._vertices.rewindVertices(index);
    };

    /** override */
    GXTransformBox.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };


    /** @override */
    GXTransformBox.prototype._calculateGeometryBBox = function () {
        return gVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    GXTransformBox.prototype._calculatePaintBBox = function () {
        var bbox = this._calculateGeometryBBox();
        if (bbox) {
            return bbox.expanded(GXTransformBox.ANNOT_SIZE, GXTransformBox.ANNOT_SIZE,
                GXTransformBox.ANNOT_SIZE, GXTransformBox.ANNOT_SIZE);
        }

        return null;
    };

    /** @override */
    GXTransformBox.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXTransformBox.GeometryProperties);
        if (change == GXNode._Change.AfterPropertiesChange) {
            this._verticesDirty = true;
        }
        GXItem.prototype._handleChange.call(this, change, args);
    };

    /**
     * Paints the transform box and it's handles
     * @param context
     * @param {GTransform} transform
     */
    GXTransformBox.prototype.paint = function (context, transform) {
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
            context.canvas.putVertices(new GXVertexPixelAligner(this));
            context.canvas.strokeVertices(context.selectionOutlineColor, 1);
            for (var side = 0; side < 8 ; ++side) {
                var pt = this._getPoint(side);
                gAnnotation.paintAnnotation(context, null, pt, gAnnotation.AnnotType.Rectangle,
                    true, GXTransformBox.ANNOT_SIZE);
            }
        }
        gAnnotation.paintAnnotation(context, null, this._getPoint(GXTransformBox.Handles.ROTATION_CENTER),
            gAnnotation.AnnotType.Circle, true, GXTransformBox.ANNOT_SIZE);
        context.canvas.setTransform(canvasTransform);

        this._finishPaint(context);
    };

    /**
     * Sets options to not paint the full transform box, just it's center during painting
     */
    GXTransformBox.prototype.hide = function () {
        this._centerOnly = true;
    };

    /**
     * Sets options to paint the full transform box if it was hided before
     */
    GXTransformBox.prototype.show = function () {
        this._centerOnly = false;
    };

    /**
     * Called whenever information about a part at a given location shall be returned
     * @param {GPoint} location the location to get a part for in view coordinates
     * @param {GTransform} transform the current transformation of the view
     * @param {Number} [tolerance] optional tolerance for testing the location.
     * If not provided defaults to zero.
     * @returns {GXElementEditor.PartInfo} null if no part is available or a valid part info
     */
    GXTransformBox.prototype.getPartInfoAt = function (location, transform, tolerance) {
        var result = null;

        if (transform) {
            this._extTransform = transform;
            this._verticesDirty = true;
        }

        // test handles and center
        for (var side = 0; side < 9; ++side) {
            var handle = this._getPoint(side);
            if (gAnnotation.getAnnotationBBox(null, handle, GXTransformBox.ANNOT_SIZE)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                result = new GXElementEditor.PartInfo(null, side, handle);
                break;
            }
        }

        // test outline and inside
        if (!result) {
            var hitRes = new GXVertexInfo.HitResult();
            if (gVertexInfo.hitTest(location.getX(), location.getY(), this,
                    tolerance, true, hitRes)) {

                if (hitRes.outline) {
                    result = new GXElementEditor.PartInfo(null, GXTransformBox.OUTLINE, null);
                } else {
                    result = new GXElementEditor.PartInfo(null, GXTransformBox.INSIDE, null);
                }
            } else {
                // TODO: return sector for proper cursor
                result = new GXElementEditor.PartInfo(null, GXTransformBox.OUTSIDE, null);
            }
        }

        return result;
    };

    /**
     * Calculate the transformation, which should be applied to the selection
     * based on the movement of transform box or it's handles
     * @param {GXElementEditor.PartInfo} partInfo - transform box part information, which is moved
     * @param {GPoint} startPtTr - movement start point
     * @param {GPoint} endPtTr - movement end point
     * @param {GXGuides} guides to be used for snapping
     * @param {Boolean} option - if true and one of resize handles is moved,
     * update transform box symmetrically to center
     * @param {Boolean} ratio - if true and one of resize handles is moved, make equal scaling for width and height
     * @returns {GTransform}
     */
    GXTransformBox.prototype.calculateTransformation = function (partInfo, startPtTr, endPtTr, guides, option, ratio) {
        if (partInfo.id < 8) {
            var pt = null;
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

            var transform1 = null;
            var transform3 = null;
            var width = this.$brx - this.$tlx;
            var height = this.$bry - this.$tly;

            switch (partInfo.id) {
                case GXTransformBox.Handles.TOP_LEFT:
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
                case GXTransformBox.Handles.TOP_CENTER:
                    _snap(this.$tlx, this.$tly, false, true);
                    height = this.$bry - this.$tly - dy;
                    if (!option) {
                        var tlyNew = this.$tly + dy;
                        var botCenter = new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -botCenter.getX(), -botCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1, botCenter.getX(), tlyNew + height);
                    }
                    break;
                case GXTransformBox.Handles.TOP_RIGHT:
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
                case GXTransformBox.Handles.RIGHT_CENTER:
                    _snap(this.$trx, this.$try, true, false);
                    width = width + dx;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var leftCenter = new GPoint((this.$blx + this.$tlx) / 2, (this.$bly + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -leftCenter.getX(), -leftCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  tlxNew, leftCenter.getY());
                    }
                    break;
                case GXTransformBox.Handles.BOTTOM_RIGHT:
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
                case GXTransformBox.Handles.BOTTOM_CENTER:
                    _snap(this.$brx, this.$bry, false, true);
                    height = height + dy;
                    if (!option) {
                        var tlyNew = this.$tly;
                        var topCenter = new GPoint((this.$trx + this.$tlx) / 2, (this.$try + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -topCenter.getX(), -topCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  topCenter.getX(), tlyNew);
                    }
                    break;
                case GXTransformBox.Handles.BOTTOM_LEFT:
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
                case GXTransformBox.Handles.LEFT_CENTER:
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
                    case GXTransformBox.Handles.TOP_CENTER:
                    case GXTransformBox.Handles.BOTTOM_CENTER:
                        // Make equal delta for center resize
                        scaleX = Math.abs(scaleY);
                        break;
                    case GXTransformBox.Handles.LEFT_CENTER:
                    case GXTransformBox.Handles.RIGHT_CENTER:
                        // Make equal delta for center resize
                        scaleY = Math.abs(scaleX);
                        break;
                    default:
                        if (Math.abs(scaleX) > Math.abs(scaleY)) {
                            if (gMath.isEqualEps(scaleY, 0)) {
                                scaleY = scaleX;
                            } else {
                                scaleY = scaleY * Math.abs(scaleX) / Math.abs(scaleY);
                            }
                        } else {
                            if (gMath.isEqualEps(scaleX, 0)) {
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
        } else {
            var deltaTr = endPtTr.subtract(startPtTr);
            var transform = new GTransform(1, 0, 0, 1, deltaTr.getX(), deltaTr.getY());
            var tlOrig = new GPoint(this.$tlx, this.$tly);
            var tl = transform.mapPoint(tlOrig);
            if (guides) {
                tl = guides.mapPoint(tl);
            }
            deltaTr = tl.subtract(tlOrig);
            return new GTransform(1, 0, 0, 1, deltaTr.getX(), deltaTr.getY());
            // TODO: support rotation when OUTSIDE, move center when center, skew when outline
        }
    };

    /**
     * Permanently applies transform from $trf property to the transform box
     */
    GXTransformBox.prototype.applyTransform = function () {
        if (this.$trf) {
            var tl = this.$trf.mapPoint(new GPoint(this.$tlx, this.$tly));
            var tr = this.$trf.mapPoint(new GPoint(this.$trx, this.$try));
            var br = this.$trf.mapPoint(new GPoint(this.$brx, this.$bry));
            var bl = this.$trf.mapPoint(new GPoint(this.$blx, this.$bly));
            var cntr = this.$trf.mapPoint(new GPoint(this.$cx, this.$cy));
            this.setProperties(['trf', 'tlx', 'tly', 'trx', 'try', 'brx', 'bry', 'blx', 'bly', 'cx', 'cy'],
                [null, tl.getX(), tl.getY(), tr.getX(), tr.getY(), br.getX(), br.getY(), bl.getX(), bl.getY(),
                cntr.getX(), cntr.getY()]);
        }
    };

    /**
     * Generates vertices of the transform box rectangle
     * @private
     */
    GXTransformBox.prototype._generateVertices = function () {
        if (!this._vertices || this._vertices.getCount() != 5) {
            this._vertices = new GXVertexContainer();
        } else {
            this._vertices.rewindVertices(0);
        }

        var tl = this._getPoint(GXTransformBox.Handles.TOP_LEFT);
        var tr = this._getPoint(GXTransformBox.Handles.TOP_RIGHT);
        var br = this._getPoint(GXTransformBox.Handles.BOTTOM_RIGHT);
        var bl = this._getPoint(GXTransformBox.Handles.BOTTOM_LEFT);

        this._vertices.addVertex(GXVertex.Command.Move, tl.getX(), tl.getY());
        this._vertices.addVertex(GXVertex.Command.Line, tr.getX(), tr.getY());
        this._vertices.addVertex(GXVertex.Command.Line, br.getX(), br.getY());
        this._vertices.addVertex(GXVertex.Command.Line, bl.getX(), bl.getY());
        this._vertices.addVertex(GXVertex.Command.Close);
    };

    /**
     * Returns a center point of the needed transform box handle with all transformations applied (in view coordinates)
     * @param {GXTransformBox.Handles} side - the needed transform box handle center
     * @param {Boolean} noTransform - if true, do not apply internal transformation,
     * and return the original transform box point
     * @returns {GPoint} - a center point of the needed transform box handle
     * @private
     */
    GXTransformBox.prototype._getPoint = function (side, noTransform) {
        var pt = null;

        var _transform = function (pt) {
            var targTrans = this._extTransform;
            if (this.$trf && !noTransform) {
                targTrans = targTrans ? this.$trf.multiplied(targTrans) : this.$trf;
            }

            if (targTrans && pt) {
                pt = targTrans.mapPoint(pt);
            }

            return pt;
        }.bind(this);

        switch (side) {
            case GXTransformBox.Handles.TOP_LEFT:
                pt = _transform(new GPoint(this.$tlx, this.$tly));
                pt = new GPoint(pt.getX() - GXTransformBox.TRANSFORM_MARGIN, pt.getY() - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.TOP_CENTER:
                pt = _transform(new GPoint((this.$tlx + this.$trx) / 2, (this.$tly + this.$try) / 2));
                pt = new GPoint(pt.getX(), pt.getY() - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.TOP_RIGHT:
                pt = _transform(new GPoint(this.$trx, this.$try));
                pt = new GPoint(pt.getX() + GXTransformBox.TRANSFORM_MARGIN, pt.getY() - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.RIGHT_CENTER:
                pt = _transform(new GPoint((this.$trx + this.$brx) / 2, (this.$try + this.$bry) / 2));
                pt = new GPoint(pt.getX() + GXTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case GXTransformBox.Handles.BOTTOM_RIGHT:
                pt = _transform(new GPoint(this.$brx, this.$bry));
                pt = new GPoint(pt.getX() + GXTransformBox.TRANSFORM_MARGIN, pt.getY() + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.BOTTOM_CENTER:
                pt = _transform(new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2));
                pt = new GPoint(pt.getX(), pt.getY() + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.BOTTOM_LEFT:
                pt = _transform(new GPoint(this.$blx, this.$bly));
                pt = new GPoint(pt.getX() - GXTransformBox.TRANSFORM_MARGIN, pt.getY() + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.LEFT_CENTER:
                pt = _transform(new GPoint((this.$tlx + this.$blx) / 2, (this.$tly + this.$bly) / 2));
                pt = new GPoint(pt.getX() - GXTransformBox.TRANSFORM_MARGIN, pt.getY());
                break;
            case GXTransformBox.Handles.ROTATION_CENTER:
                pt = _transform(new GPoint(this.$cx, this.$cy));
                break;
        }

        return pt;
    };

    /** @override */
    GXTransformBox.prototype.toString = function () {
        return "[GXTransformBox]";
    };

    _.GXTransformBox = GXTransformBox;
})(this);
