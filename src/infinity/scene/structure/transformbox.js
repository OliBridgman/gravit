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
    function GXTransformBox(bbox, elements) {
        GXItemCompound.call(this);
        this._setDefaultProperties(GXTransformBox.GeometryProperties);
        this._elements = elements;
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
    GXNode.inherit("transformbox", GXTransformBox, GXItemCompound);
    //GObject.inheritAndMix(GXTransformBox, GXElementEditor);
    //GObject.inheritAndMix(GXTransformBox, GXItemCompound, [GXElement.Transform, GXElement.Pivot, GXVertexSource]);


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

    GXTransformBox.Handles = {
        TOP_LEFT: 0,
        TOP_CENTER: 1,
        TOP_RIGHT: 2,
        RIGHT_CENTER: 3,
        BOTTOM_RIGHT: 4,
        BOTTOM_CENTER: 5,
        BOTTOM_LEFT: 6,
        LEFT_CENTER: 7
    };

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
        if (!this.rewindVertices(0)) {
            return;
        }

        if (!this._preparePaint(context)) {
            return;
        }

        // Outline is painted with non-transformed stroke
        // so we reset transform, transform the vertices
        // ourself and then re-apply the transformation
        var canvasTransform = context.canvas.resetTransform();
        var targetTransform = canvasTransform.multiplied(transform);
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
        gAnnotation.paintAnnotation(context, targetTransform, new GPoint(this.$cx, this.$cy), gAnnotation.AnnotType.Circle,
            true, GXTransformBox.ANNOT_SIZE);
        context.canvas.setTransform(canvasTransform);

        this._finishPaint(context);
    };

    GXTransformBox.prototype.rewindVertices = function (index) {
        if (this._vertices == null || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();
            this._generateVertices();
        }
        return this._vertices.rewindVertices(index);
    };

    GXTransformBox.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };

    GXTransformBox.prototype._generateVertices = function () {
        if (!this._vertices || this._vertices.getCount() != 5) {
            this._vertices = new GXVertexContainer(5);
        } else {
            this._vertices.rewindVertices(0);
        }

        this._vertices.writeVertex(GXVertex.Command.Move, this.$tlx, this.$tly);
        this._vertices.writeVertex(GXVertex.Command.Line, this.$trx, this.$try);
        this._vertices.writeVertex(GXVertex.Command.Line, this.$brx, this.$bry);
        this._vertices.writeVertex(GXVertex.Command.Line, this.$blx, this.$bly);
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
        GXItemCompound.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXTransformBox.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return null;
    };

    GXTransformBox.prototype._paintAnnotation = function (context, transform, center, type) {
        if (transform) {
            center = transform.mapPoint(center);
        }
        var vertices = new GXVertexContainer(5);
        vertices.writeVertex(GXVertex.Command.Move, -1, -1);
        vertices.writeVertex(GXVertex.Command.Line, 1, -1);
        vertices.writeVertex(GXVertex.Command.Line, 1, 1);
        vertices.writeVertex(GXVertex.Command.Line, -1, 1);
        vertices.writeVertex(GXVertex.Command.Close);

        var transformer = new GXVertexTransformer(vertices, new GTransform(
            GXTransformBox.ANNOT_SIZE / 2, 0, 0, GXTransformBox.ANNOT_SIZE / 2, center.getX(), center.getY()));
        context.canvas.putVertices(new GXVertexPixelAligner(transformer));
        var fillColor = gColor.build(255, 255, 255);
        context.canvas.fillVertices(fillColor);
        context.canvas.strokeVertices(context.selectionOutlineColor, 1);
    };

    GXTransformBox.prototype._getPoint = function (side) {
        switch (side) {
            case GXTransformBox.Handles.TOP_LEFT:
                return new GPoint(this.$tlx, this.$tly);
            case GXTransformBox.Handles.TOP_CENTER:
                return new GPoint((this.$tlx + this.$trx) / 2, (this.$tly + this.$try) / 2);
            case GXTransformBox.Handles.TOP_RIGHT:
                return new GPoint(this.$trx, this.$try);
            case GXTransformBox.Handles.RIGHT_CENTER:
                return new GPoint((this.$trx + this.$brx) / 2, (this.$try + this.$bry) / 2);
            case GXTransformBox.Handles.BOTTOM_RIGHT:
                return new GPoint(this.$brx, this.$bry);
            case GXTransformBox.Handles.BOTTOM_CENTER:
                return new GPoint((this.$blx + this.$brx) / 2, (this.$bly + this.$bry) / 2);
            case GXTransformBox.Handles.BOTTOM_LEFT:
                return new GPoint(this.$blx, this.$bly);
            case GXTransformBox.Handles.LEFT_CENTER:
                return new GPoint((this.$tlx + this.$blx) / 2, (this.$tly + this.$bly) / 2);
        }
    };

    /** @override */
    GXTransformBox.prototype.toString = function () {
        return "[GXTransformBox]";
    };

    _.GXTransformBox = GXTransformBox;
})(this);
