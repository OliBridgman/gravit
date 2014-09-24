(function (_) {
    /**
     * An element represent an elementary node within a scene, something like a layer,
     * a shape, a group of shapes and more
     * @class IFElement
     * @extends IFNode
     * @constructor
     */
    function IFElement() {
        if (this.hasMixin(IFElement.Stylable)) {
            this._setStyleDefaultProperties();
        }
    }

    IFObject.inherit(IFElement, IFNode);

    /**
     * Known flags for a geometry
     * @version 1.0
     */
    IFElement.Flag = {
        /**
         * Defines a flag for being hidden
         * @type {Number}
         */
        Hidden: 1 << 21,

        /**
         * Defines a flag for being locked
         * @type {Number}
         */
        Locked: 1 << 22,

        /**
         * Defines a flag for no painting which
         * is different to hidden as this will
         * behave as being visible just contents
         * won't be painted at all
         */
        NoPaint: 1 << 23
    };

    /**
     * Known flags for a collision check
     * @version 1.0
     */
    IFElement.CollisionFlag = {
        /**
         * Flag that specifies partial collision matching, means
         * that elements that are not fully enclosed by a collision
         * area will still be added
         * @type {Number}
         * @version 1.0
         */
        Partial: 1 << 0,

        /**
         * Flag that specifies to test collision against element's
         * geometry bounding box, only
         * @type {Number}
         * @version 1.0
         */
        GeometryBBox: 1 << 10,

        /**
         * Flag that specifies to test collision against element's
         * paint bounding box, only
         * @type {Number}
         * @version 1.0
         */
        PaintBBox: 1 << 11
    };

    /**
     * @enum
     * @private
     */
    IFElement._Change = {
        /**
         * A child's geometry has been updated. This change gets populated up in hierarchy.
         * args = the child which' geometry has been updated
         * @type {Number}
         */
        ChildGeometryUpdate: 200,

        /**
         * A geometry update is prepared
         * args = none
         * @type {Number}
         */
        PrepareGeometryUpdate: 220,

        /**
         * A geometry update is finished
         * args = If not provided or set to zero, invalidates all geometry. If set
         * to 1 (one) then invalidates only the paint-bbox and if set to -1 then
         * does not invalidate any geometry at all
         * @type {Number}
         */
        FinishGeometryUpdate: 221,

        /**
         * An invalidation is requested
         * args = none
         * @type {Number}
         */
        InvalidationRequest: 230,

        /**
         * An invalidation was requested. This change gets populated up in hierarchy.
         * args = the requested invalidation area rect
         * @type {Number}
         */
        InvalidationRequested: 231
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.GeometryChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event on geometrical changes of an element sent via a scene
     * @param {IFElement} element the affected element
     * @param {IFElement.GeometryChangeEvent.Type} type the geometrical change type
     * @class IFElement.GeometryChangeEvent
     * @extends IFEvent
     * @constructor
     */
    IFElement.GeometryChangeEvent = function (element, type) {
        this.element = element;
        this.type = type;
    };
    IFObject.inherit(IFElement.GeometryChangeEvent, IFEvent);

    /**
     * The type of a geometrical change
     */
    IFElement.GeometryChangeEvent.Type = {
        /** Before the element's geometry gets changed */
        Before: 0,
        /** After the element's geometry has been changed */
        After: 1,
        /** After any of the element's child geometry has been changed */
        Child: 2
    };

    /**
     * The affected element
     * @type IFElement
     */
    IFElement.GeometryChangeEvent.prototype.element = null;

    /**
     * The type of the geometrical change
     * @type {IFElement.GeometryChangeEvent.Type}
     */
    IFElement.GeometryChangeEvent.prototype.type = null;

    /** @override */
    IFElement.GeometryChangeEvent.prototype.toString = function () {
        return "[Event IFElement.GeometryChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.HitResultInfo Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on an element
     * @param {IFElement} element the element that was hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class IFElement.HitResultInfo
     */
    IFElement.HitResultInfo = function (element, args) {
        this.element = element;
        this.data = args;
    };

    /**
     * The element that was hit
     * @type {IFElement}
     * @version 1.0
     */
    IFElement.HitResultInfo.prototype.element = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    IFElement.HitResultInfo.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.Transform Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to be transformable
     * @class IFElement.Transform
     * @constructor
     * @mixin
     */
    IFElement.Transform = function () {
    };

    /**
     * Returns the actual transformation the element has
     * @return {IFTransform}
     */
    IFElement.Transform.prototype.getTransform = function () {
        return null;
    };

    /**
     * Assigns the actual transformation the element has
     * @return {IFTransform}
     */
    IFElement.Transform.prototype.setTransform = function (transform) {
        throw new Error("Not Supported.");
    };

    /**
     * Transforms this element with another given transformation
     * including multiplication with the existing transformation
     * the element may already have. This will by default simply
     * apply the transformation to all direct children of the element if any
     * @param {IFTransform} transform the transformation to be applied
     */
    IFElement.Transform.prototype.transform = function (transform) {
        this._transformChildren(transform);
    };

    /**
     * @param {IFTransform} transform the transformation to be applied
     * @private
     */
    IFElement.Transform.prototype._transformChildren = function (transform) {
        if (this.hasMixin(IFNode.Container)) {
            for (var child = this.getFirstChild(true); child != null; child = child.getNext(true)) {
                if (child instanceof IFElement && child.hasMixin(IFElement.Transform)) {
                    child.transform(transform);
                }
            }
        }
    };

    /** @override */
    IFElement.Transform.prototype.toString = function () {
        return "[Mixin IFElement.Transform]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.Stylable Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Mixin to mark an element being stylable
     * @class IFElement.Stylable
     * @extends IFStylable
     * @constructor
     * @mixin
     */
    IFElement.Stylable = function () {
    };
    IFObject.inherit(IFElement.Stylable, IFStylable);

    /**
     * Geometry properties
     */
    IFElement.Stylable.GeometryProperties = {
        // The linked style reference id if any
        sref: null
    };

    /**
     * Return the referenced style if any
     * @returns {IFStyle}
     */
    IFElement.Stylable.prototype.getReferencedStyle = function () {
        return this.isAttached() && this.$sref ? this.getScene().getReference(this.$sref) : null;
    };

    /**
     * Called to paint with style
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFRect} contentPaintBBox the paint bbox used for drawing this stylable
     */
    IFElement.Stylable.prototype._paintStyle = function (context, contentPaintBBox) {
        if (context.configuration.isOutline(context)) {
            this._paintStyleFillLayer(context, contentPaintBBox);
        } else if (this.$_stop > 0.0) {
            var orderedEffects = this._effects ? this._effects.getLayersEffects(true) : null;

            // If we have any pre- or post-effect then we'll be creating an effect canvas here
            // to be re-used by every effect renderer
            var effectCanvas = null;
            if (orderedEffects) {
                for (var i = 0; i < orderedEffects.length; ++i) {
                    if (orderedEffects[i]) {
                        for (var j = 0; j < orderedEffects[i].length; ++j) {
                            var effectType = orderedEffects[i][j].getEffectType();
                            if (effectType === IFEffect.Type.PreEffect || effectType === IFEffect.Type.PostEffect) {
                                effectCanvas = this._createStyleCanvas(context, contentPaintBBox);
                            }
                        }
                    }
                }
            }

            if (this.$_stop !== 1.0 || this.$_sbl !== IFPaintCanvas.BlendMode.Normal) {
                // We need to paint on a separate canvas here
                var sourceCanvas = context.canvas;
                var styleCanvas = this._createStyleCanvas(context, contentPaintBBox);
                context.canvas = styleCanvas;
                try {
                    this._paintStyleFillLayer(context, contentPaintBBox, orderedEffects, effectCanvas);

                    if (this.$_sbl === 'mask') {
                        var area = this._getStyleMaskClipArea();
                        if (area) {
                            sourceCanvas.clipRect(area.getX(), area.getY(), area.getWidth(), area.getHeight());
                        }
                        try {
                            sourceCanvas.drawCanvas(styleCanvas, 0, 0, this.$_stop, IFPaintCanvas.CompositeOperator.DestinationIn);
                        } finally {
                            if (area) {
                                sourceCanvas.resetClip();
                            }
                        }
                    } else {
                        sourceCanvas.drawCanvas(styleCanvas, 0, 0, this.$_stop, this.$_sbl);
                    }

                    styleCanvas.finish();
                } finally {
                    context.canvas = sourceCanvas;
                }
            } else {
                this._paintStyleFillLayer(context, contentPaintBBox, orderedEffects, effectCanvas);
            }
        }
    };

    /**
     * Called to paint the fill layer
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFRect} contentPaintBBox the source bbox used for drawing
     * @param {Array} orderedEffects the ordered effects for all layers
     * @param {IFPaintCanvas} effectCanvas an effect canvas if there're any pre/post effects
     */
    IFElement.Stylable.prototype._paintStyleFillLayer = function (context, contentPaintBBox, orderedEffects, effectCanvas) {
        if (context.configuration.isOutline(context)) {
            this._paintStyleContentLayers(context, contentPaintBBox, orderedEffects, effectCanvas);
        } else {
            var fillEffects = orderedEffects ? orderedEffects[IFStylable.LAYER_ORDER.length] : null;
            if (this.$_sfop !== 1.0 || fillEffects) {
                // We need to paint on a separate canvas here
                var sourceCanvas = context.canvas;
                var fillCanvas = this._createStyleCanvas(context, contentPaintBBox);
                context.canvas = fillCanvas;
                try {
                    this._paintStyleContentLayers(context, contentPaintBBox, orderedEffects, effectCanvas);

                    if (fillEffects) {
                        this._paintWithEffects(fillCanvas, sourceCanvas, this.$_sfop, fillEffects, effectCanvas);
                    } else {
                        sourceCanvas.drawCanvas(fillCanvas, 0, 0, this.$_sfop);
                    }

                    fillCanvas.finish();
                } finally {
                    context.canvas = sourceCanvas;
                }
            } else if (this.$_sfop > 0.0) {
                this._paintStyleContentLayers(context, contentPaintBBox, orderedEffects, effectCanvas);
            }
        }
    };

    /**
     * Called to paint the content layers
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFRect} contentPaintBBox the source bbox used for drawing
     * @param {Array} orderedEffects the ordered effects for all layers
     * @param {IFPaintCanvas} effectCanvas an effect canvas if there're any pre/post effects
     */
    IFElement.Stylable.prototype._paintStyleContentLayers = function (context, contentPaintBBox, orderedEffects, effectCanvas) {
        var outlined = context.configuration.isOutline(context);
        for (var i = 0; i < IFStylable.LAYER_ORDER.length; ++i) {
            var layer = IFStylable.LAYER_ORDER[i];

            if (outlined) {
                this._paintStyleLayer(context, layer);
            } else {
                var effects = orderedEffects ? orderedEffects[IFStylable.LAYER_ORDER.indexOf(layer)] : null;

                if (effects || this._isSeparateStylePaintLayer(context, layer)) {
                    var sourceCanvas = context.canvas;
                    var layerCanvas = this._createStyleCanvas(context, contentPaintBBox);
                    context.canvas = layerCanvas;
                    try {
                        this._paintStyleLayer(context, layer);

                        if (effects) {
                            this._paintWithEffects(layerCanvas, sourceCanvas, 1, effects, effectCanvas);
                        } else {
                            sourceCanvas.drawCanvas(layerCanvas);
                        }

                        layerCanvas.finish();
                    } finally {
                        context.canvas = sourceCanvas;
                    }
                } else {
                    this._paintStyleLayer(context, layer);
                }
            }
        }
    };

    /**
     * Called to paint and composite effects and contents onto a target
     * @param {IFPaintCanvas} contents the canvas holding the contents
     * @param {IFPaintCanvas} target the target canvas for compositing everything
     * @param {Number} targetOpacity the opacity for painting the contents onto the target
     * @param {Array<IFEffect>} effects the effects to paint
     * @param {IFPaintCanvas} effectCanvas the effect canvas if there're any pre/post-effects
     * @private
     */
    IFElement.Stylable.prototype._paintWithEffects = function (contents, target, targetOpacity, effects, effectCanvas) {
        var filterContents = contents;
        var paintedContents = false;

        for (var i = 0; i < effects.length; ++i) {
            var effect = effects[i];
            var effectType = effect.getEffectType();

            if (effectType === IFEffect.Type.Filter) {
                effect.render(filterContents, null, filterContents.getScale());
            } else if (effectType === IFEffect.Type.PreEffect || effectType === IFEffect.Type.PostEffect) {
                if (effectType === IFEffect.Type.PostEffect && !paintedContents && targetOpacity > 0.0) {
                    target.drawCanvas(contents, 0, 0, targetOpacity);
                    paintedContents = true;
                }

                // Clear previous effect contents
                effectCanvas.clear();

                // Render effect on effects canvas
                var effectResult = effect.render(contents, effectCanvas, effectCanvas.getScale());
                var effectBlendType = IFPaintCanvas.BlendMode.Normal;

                // Post effects may return a custom blend mode
                if (effectType === IFEffect.Type.PostEffect && effectResult) {
                    effectBlendType = effectResult;
                }

                // Render effects canvas on target
                target.drawCanvas(effectCanvas, 0, 0, effectBlendType);

                // Make target new filter contents
                filterContents = target;
            }
        }

        if (!paintedContents && targetOpacity > 0.0) {
            target.drawCanvas(contents, 0, 0, targetOpacity);
        }
    };

    /**
     * Called whenever this should paint a specific style layer
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFStylable.Layer} layer the actual layer to be painted
     */
    IFElement.Stylable.prototype._paintStyleLayer = function (context, layer) {
        // NO-OP
    };

    /**
     * Called to test whether a given style layer requires a separate canvas or not
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFStylable.Layer} layer the actual layer to be painted
     * @return {Boolean} true if layer is separated, false if not
     */
    IFElement.Stylable.prototype._isSeparateStylePaintLayer = function (context, layer) {
        return false;
    };

    /**
     * Should return the clip-area for masked styles
     * @param {IFPaintContext} context
     * @return {IFRect}
     * @private
     */
    IFElement.Stylable.prototype._getStyleMaskClipArea = function (context) {
        return null;
    };

    /**
     * Create and return the fill paint pattern used for painting
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFElement.Stylable.prototype._createFillPaint = function (canvas, bbox) {
        if (this.$_fpt) {
            return this._createPatternPaint(canvas, this.$_fpt, bbox, this.$_ftx, this.$_fty, this.$_fsx, this.$_fsy, this.$_frt);
        }
        return null;
    };

    /**
     * Create and return the border paint pattern used for painting
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFElement.Stylable.prototype._createBorderPaint = function (canvas, bbox) {
        if (this.$_bpt) {
            return this._createPatternPaint(canvas, this.$_bpt, bbox, this.$_btx, this.$_bty, this.$_bsx, this.$_bsy, this.$_brt);
        }
        return null;
    };

    /**
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFElement.Stylable.prototype._createPatternPaint = function (canvas, pattern, bbox, tx, ty, sx, sy, rt) {
        var result = {
            paint: null,
            transform: null
        };

        if (pattern instanceof IFColor) {
            result.paint = pattern;
        } else if (pattern instanceof IFGradient) {
            var gradient = null;

            if (pattern.getType() === IFGradient.Type.Linear) {
                result.paint = canvas.createLinearGradient(-0.5, 0, 0.5, 0, pattern);
            } else if (pattern.getType() === IFGradient.Type.Radial) {
                result.paint = canvas.createRadialGradient(0, 0, 0.5, pattern);
            }

            var left = bbox.getX();
            var top = bbox.getY();
            var width = bbox.getWidth();
            var height = bbox.getHeight();

            result.transform = IFTransform()
                .scaled(sx, sy)
                .rotated(rt)
                .translated(tx, ty)
                .scaled(width, height)
                .translated(left, top);
        }

        return result;
    };

    /**
     * Creates a temporary canvas for style drawing. This function will actually
     * honor the Fast-Paint-Mode and if set, will return a canvas that paints at
     * 100% instead.
     * @param {IFPaintContext} context the paint context in use
     * @param {IFRect} extents the extents for the temporary canvas
     * @return {IFPaintCanvas}
     * @private
     */
    IFElement.Stylable.prototype._createStyleCanvas = function (context, extents) {
        if (context.configuration.paintMode === IFScenePaintConfiguration.PaintMode.Fast) {
            var result = new IFPaintCanvas();
            result.resize(extents.getWidth(), extents.getHeight());
            result.prepare();

            var topLeft = extents.getSide(IFRect.Side.TOP_LEFT);
            result.setOrigin(topLeft);
            result.setOffset(topLeft);

            // TODO : Support clipping dirty areas

            return result;
        } else {
            return context.canvas.createCanvas(extents, true);
        }
    };

    /** @override */
    IFElement.Stylable.prototype._stylePrepareGeometryChange = function () {
        this._notifyChange(IFElement._Change.PrepareGeometryUpdate);
    };

    /** @override */
    IFElement.Stylable.prototype._styleFinishGeometryChange = function () {
        this._notifyChange(IFElement._Change.FinishGeometryUpdate, 1 /* invalidate only paint bbox */);
    };

    /** @override */
    IFElement.Stylable.prototype._styleRepaint = function () {
        this._notifyChange(IFElement._Change.InvalidationRequest);
    };

    /** @override */
    IFElement.Stylable.prototype._handleStyleChange = function (change, args) {
        if (this.isAttached()) {
            if (((change === IFNode._Change.BeforePropertiesChange || change === IFNode._Change.AfterPropertiesChange) && args.properties.indexOf('sref') >= 0) ||
                change === IFNode._Change.Attached || change === IFNode._Change.Detach) {
                var scene = this.getScene();
                var referencedStyle = this.getReferencedStyle();
                if (referencedStyle) {
                    switch (change) {
                        case IFNode._Change.BeforePropertiesChange:
                        case IFNode._Change.Detach:
                            scene.unlink(referencedStyle, this);
                            break;
                        case IFNode._Change.AfterPropertiesChange:
                        case IFNode._Change.Attached:
                            scene.link(referencedStyle, this);
                            break;
                    }
                }
            }


            if (change === IFNode._Change.AfterPropertiesChange) {
                var styleBlendModeIdx = args.properties.indexOf('_sbl');
                if (styleBlendModeIdx >= 0 && args.values[styleBlendModeIdx] === 'mask' || this.$_sbl === 'mask') {
                    var myPage = this.getPage();
                    if (myPage) {
                        myPage._requestInvalidation();
                    }
                }
            }
        }

        if (change === IFNode._Change.Store) {
            if (this.$sref) {
                args.sref = this.$sref;
            }
        } else if (change === IFNode._Change.Restore) {
            this.$sref = args.sref;
        }

        IFStylable.prototype._handleStyleChange.call(this, change, args);
    };

    /** @override */
    IFElement.Stylable.prototype._getStyleMaskClipArea = function (context) {
        var myPage = this.getPage();
        if (myPage) {
            return myPage.getPageClipBBox();
        }
    };

    /** @override */
    IFElement.Stylable.prototype.toString = function () {
        return "[Mixin IFElement.Stylable]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type IFRect
     * @private
     */
    IFElement.prototype._geometryBBbox = null;

    /**
     * @type IFRect
     * @private
     */
    IFElement.prototype._paintBBox = null;

    /**
     * Called to get the geometry bbox which usually is the bbox of the underlying shape
     * @return {IFRect} the geometry bbox, may never be null
     * @version 1.0
     */
    IFElement.prototype.getGeometryBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this._geometryBBbox == null) {
            this._geometryBBbox = this._calculateGeometryBBox();
        }
        return this._geometryBBbox;
    };

    /**
     * Calculates the united geometry bbox of the array of elements
     * @param {Array<*>} group - an array of elements for calculating geometry bbox.
     * Only IFElement members are taken into account.
     * @returns {IFRect} the geometry bbox of the group
     */
    IFElement.prototype.getGroupGeometryBBox = function (group) {
        var groupBBox = null;
        if (group && group.length) {
            for (var i = 0; i < group.length; ++i) {
                if (group[i] instanceof IFElement) {
                    var bbox = group[i].getGeometryBBox();
                    if (bbox && !bbox.isEmpty()) {
                        groupBBox = groupBBox ? groupBBox.united(bbox) : bbox;
                    }
                }
            }
        }

        return groupBBox;
    };

    /**
     * Called to get the united geometry bbox of all children of this node if this node is a container
     * @return {IFRect} the united geometry bbox of all children or empty rect if this node does not have
     * any children with valid geometry bboxes
     * @version 1.0
     */
    IFElement.prototype.getChildrenGeometryBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(IFNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof IFElement) {
                    var childBBox = node.getGeometryBBox();
                    if (childBBox && !childBBox.isEmpty()) {
                        result = result ? result.united(childBBox) : childBBox;
                    }
                }
            }
            return result ? result : null;
        }
        return null;
    };

    /**
     * Called to get the paint bbox for this node including all possible
     * artifacts like effects and the such
     * @return {IFRect} the paint bbox, may never be null
     * @version 1.0
     */
    IFElement.prototype.getPaintBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this._paintBBox == null) {
            this._paintBBox = this._calculatePaintBBox();
        }

        return this._paintBBox;
    };

    /**
     * Called to get the united paint bbox of all children of this node if this node is a container
     * @return {IFRect} the united paint bbox of all children or empty rect if this node does not have
     * any children with valid paint bboxes
     * @version 1.0
     */
    IFElement.prototype.getChildrenPaintBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(IFNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof IFElement) {
                    var childBBox = node.getPaintBBox();
                    if (childBBox && !childBBox.isEmpty()) {
                        result = result ? result.united(childBBox) : childBBox;
                    }
                }
            }
            return result ? result : new IFRect(0, 0, 0, 0);
        }
        return null;
    };

    /**
     * Returns whether this geometry is actually visible. Note that even if this
     * function returns true, it does not mean that the node is paintable after all
     * as this doesn't include any specific checking for visibility.
     * To check whether this geometry is really paintable, use the isPaintable function.
     * Note that this will also return false even this geometry would be visible
     * but one of it's parents is hidden.
     * @see isPaintable
     * @version 1.0
     */
    IFElement.prototype.isVisible = function () {
        return (this._flags & IFElement.Flag.Hidden) == 0;
    };

    /**
     * Called whenever a hit-test should be made on this element. Note that
     * this should hit-test against it's sub-elements (bottom-up), first
     * @param {IFPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {IFTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Function} [acceptor] optional callback function getting called
     * for a hit and receiving the currently hit element as it's only parameter.
     * The function should return true to accept the element or false for not.
     * @param {Boolean} [stacked] if true, returns all hits (from top to bottom) on the given
     * location, otherwise returns the topmost one, only. Defaults to false
     * @param {Number} [level] the level of deepness. A value of zero or less ignores
     * all children, a negative value iterates to deepest level. Defaults to -1
     * @param {Number} [tolerance] a tolerance value for hit testing in view coordinates,
     * defaults to zero if not provided.
     * @param {Boolean} [force] if true, enforce hitting even if something is not visible
     * or has no area etc. Defaults to false.
     * @returns {Array<IFElement.HitResultInfo>} either null for no hit or
     * a certain hit result depending on the element type
     */
    IFElement.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force) {
        if (typeof level !== 'number') level = -1; // unlimited deepness
        tolerance = tolerance || 0;

        // Quick-Test -> if location doesn't fall into our bounding-area
        // or we don't have a bounding area, then we can certainly not
        // have any hit at all. We'll however extend our paint bbox by
        // the pick distance to provide better pick-up of objects
        var paintBBox = this.getPaintBBox();
        if (!paintBBox || paintBBox.isEmpty()) {
            return null;
        }
        if (transform) {
            paintBBox = transform.mapRect(paintBBox);
        }

        if (!paintBBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return null;
        }

        var result = null;

        // We might have a possible hit so iterate our children if any
        if (level !== 0 && this.hasMixin(IFNode.Container)) {
            for (var child = this.getLastChild(); child != null; child = child.getPrevious()) {
                if (child instanceof IFElement) {
                    var subResult = child.hitTest(location, transform, acceptor, stacked, level - 1, tolerance, force);
                    if (subResult) {
                        if (stacked) {
                            if (result) {
                                Array.prototype.push.apply(result, subResult);
                            } else {
                                result = subResult;
                            }
                        } else {
                            return subResult;
                        }
                    }
                }
            }
        }

        if ((acceptor && acceptor.call(null, this) == true) || !acceptor) {
            // No hit so far so try to hit ourself
            var myResult = this._detailHitTest(location, transform, tolerance, force);
            if (myResult) {
                if (stacked && result) {
                    result.push(myResult);
                } else {
                    result = [myResult];
                }
            }
        }

        return result;
    };

    /**
     * Gets a list of all coliiding elements including this element and
     * all potential children if it if any
     * @param {IFVertexSource} area the area to get colissions within
     * @param {Number} flags one or more flags to use for collision testing
     * @param {Function} [acceptor] optional callback function getting called
     * for a hit and receiving the currently hit element as it's only parameter.
     * @return {Array<IFElement>} an array including all coliding elements or
     * an empty array for no collisions
     * @see IFElement.CollisionFlag
     */
    IFElement.prototype.getCollisions = function (area, flags, acceptor) {
        var result = [];

        var _addToResult = function (element) {
            if ((acceptor && acceptor.call(null, element) == true) || !acceptor) {
                result.push(element);
            }
        };

        // Handle the basic collision modes here
        if ((flags & IFElement.CollisionFlag.GeometryBBox) != 0 || (flags & IFElement.CollisionFlag.PaintBBox) != 0) {

            // Test ourself, first
            var bbox = this.getPaintBBox();
            if (bbox && !bbox.isEmpty()) {
                // TODO : How to check bbox intersection with area vertex source including partial param?
                // --> area.intersects(..)

                var areaBounds = ifVertexInfo.calculateBounds(area, true);

                if ((flags & IFElement.CollisionFlag.Partial) != 0) {
                    if (areaBounds.intersectsRect(bbox)) {
                        _addToResult(this);
                    }
                } else {
                    if (areaBounds.containsRect(bbox)) {
                        _addToResult(this);
                    }
                }
            }
        }

        // Test children now
        if (this.hasMixin(IFNode.Container)) {
            for (var child = this.getFirstChild(); child != null; child = child.getNext()) {
                if (child instanceof IFElement) {
                    var subResult = child.getCollisions(area, flags);
                    if (subResult && subResult.length) {
                        for (var i = 0; i < subResult.length; ++i) {
                            _addToResult(subResult[i]);
                        }
                    }
                }
            }
        }

        return result;
    };

    /**
     * Tests if the collision area contains the full element.
     * Element's children are not tested here.
     * @param {IFVertexSource} area the area to get collisions within
     */
    IFElement.prototype.isFullUnderCollision = function (area) {
        var res = false;
        var bbox = this.getPaintBBox();
        if (bbox && !bbox.isEmpty()) {
            var areaBounds = ifVertexInfo.calculateBounds(area, true);
            // TODO: after path boolean operations will be ready, improve this to compare areas itself instead of bboxes
            res = areaBounds.containsRect(bbox);
        }

        return res;
    };

    /**
     * Prepare an update on this node. This will delay all update notifications
     * until the corresponding endUpdate call was made. This helps in speeding up
     * heavy operations that may result in multiple modifications. This function
     * is recursive, i.e. multiple calls to this functions need to be finished
     * with the corresponding numbers of endUpdate calls.
     */
    IFElement.prototype.beginUpdate = function () {
        if (!this._updateCounter) {
            this._updateCounter = 1;
            this._notifyChange(IFElement._Change.PrepareGeometryUpdate);
            this._blockUpdateChanges();
        } else {
            this._updateCounter++;
        }
    };

    /**
     * Finish an update on this node and update it now. If there've been multiple
     * beginUpdate calls before, this will not update before the last,
     * corresponding endUpdate call has taken place.
     * @param {Boolean} [noGeometryInvalidation] if set then does not invalidate the geometry,
     * otherwise this will ensure to invalidate the geometry. Defaults to false.
     */
    IFElement.prototype.endUpdate = function (noGeometryInvalidation) {
        if (this._updateCounter != null && --this._updateCounter == 0) {
            this._releaseUpdateChanges();
            this._notifyChange(IFElement._Change.FinishGeometryUpdate, noGeometryInvalidation ? -1 : 0);
            delete this._updateCounter;
        }
    };

    /**
     * Function to check whether a node is actually rednerable, this includes
     * for example checking for display flag, checking for dirty regions,
     * empty bounding box, visibility and more.
     * @param {IFPaintContext} [context] the current paint context, if null,
     * no check against a context will be made
     * @return {Boolean} true if the node is paintable, false if not
     * @private
     */
    IFElement.prototype.isPaintable = function (context) {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return false;
        }

        if (!context) {
            // If there's no context we can only paint when attached and having a parent
            // or when we are the scene by ourself
            return (this.isAttached() && this.getParent()) || (this instanceof IFScene);
        }

        var paintBBox = this.getPaintBBox();
        if (paintBBox == null || paintBBox.isEmpty()) {
            return false;
        }

        if (context) {
            if (context.dirtyMatcher && !context.dirtyMatcher.isDirty(paintBBox)) {
                return false;
            }

            if (context.configuration && context.configuration.clipArea && !context.configuration.clipArea.intersectsRect(paintBBox)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Called to paint this element
     * @param {IFPaintContext} context the context to be used for drawing
     */
    IFElement.prototype.paint = function (context) {
        // Prepare paint
        if (!this._preparePaint(context)) {
            return;
        }

        this._paint(context);

        this._finishPaint(context);
    };

    IFElement.PaintLayer = {
        Outline: 'O',
        Background: 'B',
        Content: 'C',
        Foreground: 'F'
    }

    /**
     * Called to paint this element into a new bitmap
     * @param {Number|IFLength} [width] the width of the bitmap, set to 0|null
     * to use the element's bbox as width. Defaults to null. If the value is
     * a number, it reflects the scale factor, otherwise if it is an IFLength,
     * it defines an absolute width.
     * @param {Number|IFLength} [height] the height of the bitmap, set to 0|null
     * to use the element's bbox as height. Defaults to null. If the value is
     * a number, it reflects the scale factor, otherwise if it is an IFLength,
     * it defines an absolute width.
     * @param {Number} [ratio] the ratio mode to be used whereas 0|null
     * means to keep minimum aspect ratio thus eventually adjusting width
     * or height and making one smaller, 1 means to keep maximum aspect ratio
     * thus eventually adjusting  width or height and making one larger and
     * 2 means to keep the width/height but center the element on bitmap
     * if it's bbox ratio doesn't match the one of width / height
     * @return {IFBitmap}
     */
    IFElement.prototype.toBitmap = function (width, height, ratio) {
        var paintArea = this._getBitmapPaintArea();

        // Calculate scale & delta offsets
        ratio = ratio || 0;
        var scaleX = 1;
        var scaleY = 1;
        var scale = 1;
        var deltaX = 0;
        var deltaY = 0;

        if (width) {
            if (typeof width === 'number') {
                scaleX = width;
            } else if (width instanceof IFLength) {
                scaleX = width.toPoint() / paintArea.getWidth();
            }
        }

        if (height) {
            if (typeof height === 'number') {
                scaleY = height;
            } else if (height instanceof IFLength) {
                scaleY = height.toPoint() / paintArea.getHeight();
            }
        }

        var canvasWidth = Math.round(paintArea.getWidth() * scaleX);
        var canvasHeight = Math.round(paintArea.getHeight() * scaleY);

        // Handle ratio
        if (scaleX !== scaleY) {
            switch (ratio) {
                case 0:
                    // minimum aspect ratio
                    if (scaleX < scaleY) {
                        scale = scaleX;
                        canvasHeight = canvasWidth;
                    } else {
                        scale = scaleY;
                        canvasWidth = canvasHeight;
                    }
                    break;

                case 1:
                    // maximum aspect ratio
                    if (scaleX > scaleY) {
                        canvasHeight = scaleX;
                        scaleY = canvasWidth;
                    } else {
                        scale = scaleY;
                        canvasWidth = canvasHeight;
                    }
                    break;

                case 2:
                    // centered aspect ratio
                    if (scaleX < scaleY) {
                        // center vertically
                        scale = scaleX;
                        deltaY = (canvasHeight - (paintArea.getHeight() * scale)) / 2;
                        //deltaY = paintArea.getHeight() * (scaleY / scaleX) / 2;
                    } else {
                        // center horizontally
                        //deltaX = paintArea.getWidth() * (scaleX / scaleY) / 2;
                        scale = scaleY;
                        deltaX = (canvasWidth - (paintArea.getWidth() * scale)) / 2;
                    }
                    break;
            }
        } else {
            scale = scaleX;
        }

        // Create + Setup Paint-Canvas
        var paintCanvas = new IFPaintCanvas();
        paintCanvas.resize(canvasWidth, canvasHeight);

        // Create + Setup Paint Context & Configuration
        var paintContext = new IFPaintContext();
        paintContext.canvas = paintCanvas;
        var paintConfig = new IFScenePaintConfiguration();
        paintConfig.paintMode = IFScenePaintConfiguration.PaintMode.Full;
        paintConfig.annotations = false;
        paintContext.configuration = paintConfig;
        paintConfig.clipArea = paintArea;

        paintCanvas.prepare();
        paintCanvas.setOrigin(new IFPoint(paintArea.getX() * scale - deltaX, paintArea.getY() * scale - deltaY));
        paintCanvas.setScale(scale);
        try {
            return this._paintToBitmap(paintContext);
        } finally {
            paintCanvas.finish();
        }
    };

    /** @override */
    IFElement.prototype.assignFrom = function (other) {
        IFNode.prototype.assignFrom.call(this, other);
        if (this.hasMixin(IFStylable) && other.hasMixin(IFStylable)) {
            this.assignStyleFrom(other);
        }

        if (this.hasMixin(IFElement.Stylable) && other.hasMixin(IFElement.Stylable)) {
            this.$sref = other.$sref;
        }
    };

    /**
     * Called to return the area for this element for painting into bitmap
     * @returns {IFRect}
     * @private
     */
    IFElement.prototype._getBitmapPaintArea = function () {
        return this.getPaintBBox();
    };

    /**
     * Called to paint this element into a bitmap
     * @param {IFPaintContext} context
     * @returns {IFBitmap}
     * @private
     */
    IFElement.prototype._paintToBitmap = function (context) {
        this.paint(context);
        return context.canvas.getBitmap();
    };

    /**
     * Called whenever this should paint itself
     * @param {IFPaintContext} context the context to be used for drawing
     */
    IFElement.prototype._paint = function (context) {
        if (this.hasMixin(IFElement.Stylable)) {
            this._paintStyle(context, this.getPaintBBox());
        } else {
            this._paintChildren(context);
        }
    };

    /**
     * Called for preparing a paint
     * @param {IFPaintContext} context the current paint context
     * @return {Boolean} false if painting should be canceled, true otherwise
     * @private
     */
    IFElement.prototype._preparePaint = function (context) {
        if (this.hasFlag(IFElement.Flag.NoPaint)) {
            return false;
        }

        return this.isPaintable(context);
    };

    /**
     * Called for finishing a paint
     * @param {IFPaintContext} context the current paint context
     * @private
     */
    IFElement.prototype._finishPaint = function (context) {
        // NO-OP
    };

    /**
     * Called for painting all children if this element is a container
     * @param {IFPaintContext} context the current paint context
     * @private
     */
    IFElement.prototype._paintChildren = function (context) {
        // default paint handling if node is a container
        if (this.hasMixin(IFNode.Container)) {
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof IFElement) {
                    node.paint(context);
                }
            }
        }
    };

    /**
     * Called whenever the underliny geometry bbox needs to be calculated
     * @return {IFRect} the calculated geometry bbox, may never be null
     * @private
     */
    IFElement.prototype._calculateGeometryBBox = function () {
        // Default action unites all children geometry bboxes if this is a container
        return this.getChildrenGeometryBBox();
    };

    /**
     * Called whenever the underlying paint bbox needs to be calculated
     * @return {IFRect} the calculated paint bbox, may never be null
     * @private
     */
    IFElement.prototype._calculatePaintBBox = function () {
        var childPaintBBox = this.getChildrenPaintBBox();

        if (this.hasMixin(IFElement.Stylable) && childPaintBBox) {
            childPaintBBox = this.getStyleBBox(childPaintBBox, true);
        }

        return childPaintBBox;
    };

    /**
     * Called whenever a detail hit-test should be made on this element.
     * Detail means that the caller has already checked against a valid
     * bounding area of this element as well as that the given location
     * falls within the bounding area.
     * @param {IFPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {IFTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance used for hit-testing
     * @param {Boolean} force if true, enforce hitting even if something is not visible
     * or has no area etc.
     * @returns {IFElement.HitResultInfo} either null for no hit or
     * a certain hit result depending on the element type
     */
    IFElement.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return null;
    };

    /**
     * Blocks all update changes like geometry update, invalidation etc.
     * @private
     */
    IFElement.prototype._blockUpdateChanges = function () {
        this._beginBlockChanges([
            IFElement._Change.InvalidationRequest,
            IFElement._Change.PrepareGeometryUpdate,
            IFElement._Change.FinishGeometryUpdate,
            IFElement._Change.ChildGeometryUpdate
        ]);
    };

    /**
     * Releases all update changes like geometry update, invalidation etc.
     * @private
     */
    IFElement.prototype._releaseUpdateChanges = function () {
        this._endBlockChanges([
            IFElement._Change.InvalidationRequest,
            IFElement._Change.PrepareGeometryUpdate,
            IFElement._Change.FinishGeometryUpdate,
            IFElement._Change.ChildGeometryUpdate
        ]);
    };

    /**
     * Called to to request a invalidation for a given node
     * @param {IFElement} node the node to request an invalidation for
     * @private
     */
    IFElement.prototype._requestInvalidateNode = function (node) {
        if (node.isPaintable()) {
            var repaintArea = node.getPaintBBox();
            if (repaintArea) {
                // Expand repaint area a bit to accreditate for any aa-pixels
                this._requestInvalidationArea(repaintArea.expanded(2, 2, 2, 2));
            }
        }
    };

    /**
     * Called to request a invalidation for a given area
     * @param {IFRect} area the area of invalidation
     * @private
     */
    IFElement.prototype._requestInvalidationArea = function (area) {
        if (this.isAttached()) {
            this._scene._invalidateArea(area);
            this._handleChange(IFElement._Change.InvalidationRequested, area);
        }
    };

    /**
     * Called to request an invalidation for this node
     * @private
     */
    IFElement.prototype._requestInvalidation = function () {
        this._requestInvalidateNode(this);
    };

    /** @override */
    IFElement.prototype._handleChange = function (change, args) {
        if (change == IFElement._Change.InvalidationRequest) {
            if (this.isPaintable()) {
                this._requestInvalidation();
            }
        } else if (change === IFElement._Change.InvalidationRequested) {
            // Deliver invalidation requested up to parent
            if (this.getParent()) {
                this.getParent()._notifyChange(IFElement._Change.InvalidationRequested, args);
            }
        } else if (change == IFElement._Change.PrepareGeometryUpdate) {
            if (this.isVisible()) {
                if (this._canEventBeSend(IFElement.GeometryChangeEvent)) {
                    this._scene.trigger(new IFElement.GeometryChangeEvent(this, IFElement.GeometryChangeEvent.Type.Before));
                }
            }
        } else if (change == IFElement._Change.FinishGeometryUpdate) {
            if (this.isVisible()) {
                var savedPaintBBox = null;
                if (this.isPaintable()) {
                    var paintBBox = this.getPaintBBox();
                    if (paintBBox && !paintBBox.isEmpty()) {
                        savedPaintBBox = paintBBox;
                    }
                }

                var invalidateArgs = 0;
                if (typeof args === 'number') {
                    invalidateArgs = args;
                }

                if (invalidateArgs === 1) {
                    this._paintBBox = null;
                } else if (invalidateArgs === 0) {
                    this._geometryBBbox = null;
                    this._paintBBox = null;
                }

                if (this.isPaintable()) {
                    var newPaintBBox = this.getPaintBBox();
                    if (!IFRect.equals(newPaintBBox, savedPaintBBox)) {

                        // Deliver child geometry update to parent
                        if (this.getParent()) {
                            this.getParent()._notifyChange(IFElement._Change.ChildGeometryUpdate, this);
                        }

                        // Request repaint of old paint bbox if there was any
                        if (savedPaintBBox) {
                            this._requestInvalidationArea(savedPaintBBox);
                        }

                        // Request a repaint of our new geometry
                        this._handleChange(IFElement._Change.InvalidationRequest);
                    } else {
                        // Paintboxes are equal then do a simple invalidation request
                        this._requestInvalidation();
                    }
                }

                if (this._canEventBeSend(IFElement.GeometryChangeEvent)) {
                    this._scene.trigger(new IFElement.GeometryChangeEvent(this, IFElement.GeometryChangeEvent.Type.After));
                }
            }
        } else if (change == IFElement._Change.ChildGeometryUpdate) {
            if (this.isVisible()) {
                this._invalidateGeometryForChildUpdate();

                if (this._canEventBeSend(IFElement.GeometryChangeEvent)) {
                    this._scene.trigger(new IFElement.GeometryChangeEvent(this, IFElement.GeometryChangeEvent.Type.Child));
                }

                // Forward to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(change, args);
                }
            }
        } else if (change == IFNode._Change.AfterChildInsert) {
            // If child is an element, notify about the change
            if (args instanceof IFElement) {
                this._notifyChange(IFElement._Change.ChildGeometryUpdate, args);
                args._handleChange(IFElement._Change.InvalidationRequest);
            }
        } else if (change == IFNode._Change.BeforeChildRemove) {

            // If child is an element, request repaint for it's area
            if (args instanceof IFElement) {
                this._requestInvalidateNode(args);
            }
        } else if (change == IFNode._Change.AfterChildRemove) {

            // If child is an element, notify about the change
            if (args instanceof IFElement) {
                this._notifyChange(IFElement._Change.ChildGeometryUpdate, args);
            }
        } else if (change == IFNode._Change.AfterFlagChange) {
            switch (args.flag) {
                case IFElement.Flag.NoPaint:
                    this._requestInvalidation();
                    break;
                default:
                    break;

            }
        }

        if (this.hasMixin(IFElement.Stylable)) {
            this._handleStyleChange(change, args);
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Called whenever this element's geometry should be invalidated
     * because any of it's child's geometry has been changed
     * @private
     */
    IFElement.prototype._invalidateGeometryForChildUpdate = function () {
        if (this.hasMixin(IFNode.Container)) {
            this._geometryBBbox = null;
            this._paintBBox = null;
        }
    };

    /**
     * This will fire a change event for geometry updates whenever a given
     * geometry property has been changed. This is usually called from the
     * _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * geometrical changes
     * @return {Boolean} true if there was a property change that affected a
     * change of the geometry
     * @private
     */
    IFElement.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.BeforePropertiesChange || change == IFNode._Change.AfterPropertiesChange) {
            if (ifUtil.containsObjectKey(args.properties, properties)) {
                switch (change) {
                    case IFNode._Change.BeforePropertiesChange:
                        this._notifyChange(IFElement._Change.PrepareGeometryUpdate);
                        break;
                    case IFNode._Change.AfterPropertiesChange:
                        this._notifyChange(IFElement._Change.FinishGeometryUpdate);
                        break;
                }
                return true;
            }
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates whenever a given
     * visual property has been changed. This is usually called from the
     * _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * visual changes
     * @return {Boolean} true if there was a property change that affected a
     * visual change
     * @private
     */
    IFElement.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == IFNode._Change.AfterPropertiesChange) {
            if (ifUtil.containsObjectKey(args.properties, properties)) {
                this._notifyChange(IFElement._Change.InvalidationRequest);
                return true;
            }
        }
        return false;
    };

    _.IFElement = IFElement;
})
    (this);