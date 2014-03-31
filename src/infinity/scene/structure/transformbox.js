(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
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
    GXNode.inherit("transformbox", GXTransformBox, GXItem);

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

    GXTransformBox.ANNOT_SIZE = 8;
    GXTransformBox.TRANSFORM_MARGIN = 10;

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

    GXTransformBox.prototype.paint = function (context, transform) {
        if (!this._preparePaint(context)) {
            return;
        }

        // Outline is painted with non-transformed stroke
        // so we reset transform, transform the vertices
        // ourself and then re-apply the transformation
        var canvasTransform = context.canvas.resetTransform();
        var targetTransform = canvasTransform.multiplied(transform);

        if (!this._centerOnly) {
            if (!this.rewindVertices(0)) {
                return;
            }

            var transformer = new GXVertexTransformer(this, targetTransform);
            //context.canvas.setLineDash([5]);
            // TODO: draw dashed line
            context.canvas.putVertices(new GXVertexPixelAligner(transformer));
            context.canvas.strokeVertices(context.selectionOutlineColor, 1);
            for (var side = 0; side < 8 ; ++side) {
                var pt = this._getPoint(side);
                gAnnotation.paintAnnotation(context, targetTransform, pt, gAnnotation.AnnotType.Rectangle,
                    true, GXTransformBox.ANNOT_SIZE);
            }
        }
        gAnnotation.paintAnnotation(context, targetTransform, this._getPoint(GXTransformBox.Handles.ROTATION_CENTER),
            gAnnotation.AnnotType.Circle, true, GXTransformBox.ANNOT_SIZE);
        context.canvas.setTransform(canvasTransform);

        this._finishPaint(context);
    };

    GXTransformBox.prototype.hide = function () {
        this._centerOnly = true;
    };

    GXTransformBox.prototype.show = function () {
        this._centerOnly = false;
    };

    GXTransformBox.prototype.rewindVertices = function (index) {
        if (this._vertices == null || this._verticesDirty || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();
            this._generateVertices();
            this._verticesDirty = false;
        }
        return this._vertices.rewindVertices(index);
    };

    GXTransformBox.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
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

        // test handles and center
        for (var side = 0; side < 9; ++side) {
            var handle = this._getPoint(side);
            if (gAnnotation.getAnnotationBBox(transform, handle, GXTransformBox.ANNOT_SIZE)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                result = new GXElementEditor.PartInfo(null, side, handle);
                break;
            }
        }

        // test outline and inside
        if (!result) {
            var hitRes = new GXVertexInfo.HitResult();
            if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform),
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

    GXTransformBox.prototype.calculateTransform = function (partInfo, startPt, endPt, guides,
            viewToWorldTransform, worldToViewTransform, option, ratio) {
        if (partInfo.id < 8) {
            var pt = null;
            var stPtTr = viewToWorldTransform.mapPoint(startPt);
            var endPtTr = viewToWorldTransform.mapPoint(endPt);
            var deltaTr = endPtTr.subtract(stPtTr);
            var dx = deltaTr.getX();
            var dy = deltaTr.getY();

            var transform1 = null;
            var transform3 = null;
            var width = this.$brx - this.$tlx;
            var height = this.$bry - this.$tly;

            switch (partInfo.id) {
                case GXTransformBox.Handles.TOP_LEFT:
                    width = this.$brx - this.$tlx - dx;
                    height = this.$bry - this.$tly - dy;
                    if (!option) {
                        var tlxNew = this.$tlx + dx;
                        var tlyNew = this.$tly + dy;
                        // TODO: snap if needed
                        transform1 = new GTransform(1, 0, 0, 1, -this.$brx, -this.$bry);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew + width, tlyNew + height);
                    }
                    break;
                case GXTransformBox.Handles.TOP_CENTER:
                    height = this.$bry - this.$tly - dy;
                    if (!option) {
                        var tlyNew = this.$tly + dy;
                        var botCenter = new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -botCenter.getX(), -botCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1, botCenter.getX(), tlyNew + height);
                    }
                    break;
                case GXTransformBox.Handles.TOP_RIGHT:
                    width = width + dx;
                    height = height - dy;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var tlyNew = this.$tly + dy;
                        // TODO: snap if needed
                        transform1 = new GTransform(1, 0, 0, 1, -this.$blx, -this.$bly);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew, tlyNew + height);
                    }
                    break;
                case GXTransformBox.Handles.RIGHT_CENTER:
                    width = width + dx;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var leftCenter = new GPoint((this.$blx + this.$tlx) / 2, (this.$bly + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -leftCenter.getX(), -leftCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  tlxNew, leftCenter.getY());
                    }
                    break;
                case GXTransformBox.Handles.BOTTOM_RIGHT:
                    width = width + dx;
                    height = height + dy;
                    if (!option) {
                        var tlxNew = this.$tlx;
                        var tlyNew = this.$tly;
                        // TODO: snap if needed
                        transform1 = new GTransform(1, 0, 0, 1, -this.$tlx, -this.$tly);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew, tlyNew);
                    }
                    break;
                case GXTransformBox.Handles.BOTTOM_CENTER:
                    height = height + dy;
                    if (!option) {
                        var tlyNew = this.$tly;
                        var topCenter = new GPoint((this.$trx + this.$tlx) / 2, (this.$try + this.$tly) / 2);
                        transform1 = new GTransform(1, 0, 0, 1, -topCenter.getX(), -topCenter.getY());
                        transform3 = new GTransform(1, 0, 0, 1,  topCenter.getX(), tlyNew);
                    }
                    break;
                case GXTransformBox.Handles.BOTTOM_LEFT:
                    width = width - dx;
                    height = height + dy;
                    if (!option) {
                        var tlxNew = this.$tlx + dx;
                        var tlyNew = this.$tly;
                        // TODO: snap if needed
                        transform1 = new GTransform(1, 0, 0, 1, -this.$trx, -this.$try);
                        transform3 = new GTransform(1, 0, 0, 1, tlxNew + width, tlyNew);
                    }
                    break;
                case GXTransformBox.Handles.LEFT_CENTER:
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
            var stPtTr = viewToWorldTransform.mapPoint(startPt);
            var endPtTr = viewToWorldTransform.mapPoint(endPt);
            var deltaTr = endPtTr.subtract(stPtTr);
            var transform = new GTransform(1, 0, 0, 1, deltaTr.getX(), deltaTr.getY());
            var tlOrig = new GPoint(this.$tlx, this.$tly);
            var tl = transform.mapPoint(tlOrig);
            tl = guides.mapPoint(tl);
            deltaTr = tl.subtract(tlOrig);
            return new GTransform(1, 0, 0, 1, deltaTr.getX(), deltaTr.getY());
            // TODO: support rotation when OUTSIDE, move center when center, skew when outline
        }
    };

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

    GXTransformBox.prototype._generateVertices = function () {
        if (!this._vertices || this._vertices.getCount() != 5) {
            this._vertices = new GXVertexContainer(5);
        } else {
            this._vertices.rewindVertices(0);
        }

        var tl = this._getPoint(GXTransformBox.Handles.TOP_LEFT);
        var tr = this._getPoint(GXTransformBox.Handles.TOP_RIGHT);
        var br = this._getPoint(GXTransformBox.Handles.BOTTOM_RIGHT);
        var bl = this._getPoint(GXTransformBox.Handles.BOTTOM_LEFT);

        this._vertices.writeVertex(GXVertex.Command.Move, tl.getX(), tl.getY());
        this._vertices.writeVertex(GXVertex.Command.Line, tr.getX(), tr.getY());
        this._vertices.writeVertex(GXVertex.Command.Line, br.getX(), br.getY());
        this._vertices.writeVertex(GXVertex.Command.Line, bl.getX(), bl.getY());
        this._vertices.writeVertex(GXVertex.Command.Close);
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

    GXTransformBox.prototype._getPoint = function (side, noTransform) {
        var pt = null;
        switch (side) {
            case GXTransformBox.Handles.TOP_LEFT:
                pt = new GPoint(this.$tlx - GXTransformBox.TRANSFORM_MARGIN, this.$tly - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.TOP_CENTER:
                pt = new GPoint((this.$tlx + this.$trx) / 2, (this.$tly + this.$try) / 2 - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.TOP_RIGHT:
                pt = new GPoint(this.$trx + GXTransformBox.TRANSFORM_MARGIN, this.$try - GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.RIGHT_CENTER:
                pt = new GPoint((this.$trx + this.$brx) / 2 + GXTransformBox.TRANSFORM_MARGIN, (this.$try + this.$bry) / 2);
                break;
            case GXTransformBox.Handles.BOTTOM_RIGHT:
                pt = new GPoint(this.$brx + GXTransformBox.TRANSFORM_MARGIN, this.$bry + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.BOTTOM_CENTER:
                pt = new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2 + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.BOTTOM_LEFT:
                pt = new GPoint(this.$blx - GXTransformBox.TRANSFORM_MARGIN, this.$bly + GXTransformBox.TRANSFORM_MARGIN);
                break;
            case GXTransformBox.Handles.LEFT_CENTER:
                pt = new GPoint((this.$tlx + this.$blx) / 2 - GXTransformBox.TRANSFORM_MARGIN, (this.$tly + this.$bly) / 2);
                break;
            case GXTransformBox.Handles.ROTATION_CENTER:
                pt = new GPoint(this.$cx, this.$cy);
                break;
        }

        if (this.$trf && pt && !noTransform) {
            pt = this.$trf.mapPoint(pt);
        }

        return pt;
    };

    /** @override */
    GXTransformBox.prototype.toString = function () {
        return "[GXTransformBox]";
    };

    _.GXTransformBox = GXTransformBox;
})(this);
