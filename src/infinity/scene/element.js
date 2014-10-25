(function (_) {
    /**
     * An element represent an elementary node within a scene, something like a layer,
     * a shape, a group of shapes and more
     * @class GElement
     * @extends GNode
     * @constructor
     */
    function GElement() {
        if (this.hasMixin(GElement.Stylable)) {
            this._setStyleDefaultProperties();
        }
    }

    GObject.inherit(GElement, GNode);

    /**
     * Known flags for a geometry
     * @version 1.0
     */
    GElement.Flag = {
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
    GElement.CollisionFlag = {
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
    GElement._Change = {
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
    // GElement.GeometryChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event on geometrical changes of an element sent via a scene
     * @param {GElement} element the affected element
     * @param {GElement.GeometryChangeEvent.Type} type the geometrical change type
     * @class GElement.GeometryChangeEvent
     * @extends GEvent
     * @constructor
     */
    GElement.GeometryChangeEvent = function (element, type) {
        this.element = element;
        this.type = type;
    };
    GObject.inherit(GElement.GeometryChangeEvent, GEvent);

    /**
     * The type of a geometrical change
     */
    GElement.GeometryChangeEvent.Type = {
        /** Before the element's geometry gets changed */
        Before: 0,
        /** After the element's geometry has been changed */
        After: 1,
        /** After any of the element's child geometry has been changed */
        Child: 2
    };

    /**
     * The affected element
     * @type GElement
     */
    GElement.GeometryChangeEvent.prototype.element = null;

    /**
     * The type of the geometrical change
     * @type {GElement.GeometryChangeEvent.Type}
     */
    GElement.GeometryChangeEvent.prototype.type = null;

    /** @override */
    GElement.GeometryChangeEvent.prototype.toString = function () {
        return "[Event GElement.GeometryChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GElement.HitResultInfo Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on an element
     * @param {GElement} element the element that was hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class GElement.HitResultInfo
     */
    GElement.HitResultInfo = function (element, args) {
        this.element = element;
        this.data = args;
    };

    /**
     * The element that was hit
     * @type {GElement}
     * @version 1.0
     */
    GElement.HitResultInfo.prototype.element = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    GElement.HitResultInfo.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GElement.Transform Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to be transformable
     * @class GElement.Transform
     * @constructor
     * @mixin
     */
    GElement.Transform = function () {
    };

    /**
     * Returns the actual transformation the element has
     * @return {GTransform}
     */
    GElement.Transform.prototype.getTransform = function () {
        return null;
    };

    /**
     * Assigns the actual transformation the element has
     * @return {GTransform}
     */
    GElement.Transform.prototype.setTransform = function (transform) {
        throw new Error("Not Supported.");
    };

    /**
     * Transforms this element with another given transformation
     * including multiplication with the existing transformation
     * the element may already have. This will by default simply
     * apply the transformation to all direct children of the element if any
     * @param {GTransform} transform the transformation to be applied
     */
    GElement.Transform.prototype.transform = function (transform) {
        this._transformChildren(transform);
    };

    /**
     * @param {GTransform} transform the transformation to be applied
     * @private
     */
    GElement.Transform.prototype._transformChildren = function (transform) {
        if (this.hasMixin(GNode.Container)) {
            for (var child = this.getFirstChild(true); child != null; child = child.getNext(true)) {
                if (child instanceof GElement && child.hasMixin(GElement.Transform)) {
                    child.transform(transform);
                }
            }
        }
    };

    /** @override */
    GElement.Transform.prototype.toString = function () {
        return "[Mixin GElement.Transform]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GElement.Stylable Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Mixin to mark an element being stylable
     * @class GElement.Stylable
     * @extends GStylable
     * @constructor
     * @mixin
     */
    GElement.Stylable = function () {
    };
    GObject.inherit(GElement.Stylable, GStylable);

    /**
     * Geometry properties
     */
    GElement.Stylable.GeometryProperties = {
        // The linked style reference id if any
        sref: null
    };

    /** @override */
    GElement.Stylable.prototype.assignStyleFrom = function (source, compare) {
        this.beginUpdate();
        try {
            GStylable.prototype.assignStyleFrom.call(this, source, compare);
        } finally {
            this.endUpdate();
        }
    };

    /**
     * Return the referenced style if any
     * @returns {GStyle}
     */
    GElement.Stylable.prototype.getReferencedStyle = function () {
        return this.isAttached() && this.$sref ? this.getScene().getReference(this.$sref) : null;
    };

    /**
     * Return the ordered style layers for the element
     * @returns {Array<String>}
     */
    GElement.Stylable.prototype.getStyleLayers = function () {
        var propertySets = this.getStylePropertySets();
        var styleLayers = null;

        for (var i = 0; i < propertySets.length; ++i) {
            var propertySet = propertySets[i];
            var styleLayer = null;

            switch (propertySet) {
                case GStylable.PropertySet.Fill:
                    styleLayer = GStylable.StyleLayer.Fill;
                    break;
                case GStylable.PropertySet.Border:
                    styleLayer = GStylable.StyleLayer.Border;
                    break;
                default:
                    break;
            }

            if (styleLayer) {
                if (!styleLayers) {
                    styleLayers = [styleLayer];
                } else {
                    styleLayers.push(styleLayer);
                }
            }
        }

        return styleLayers;
    };

    /**
     * Called to paint with style
     * @param {GPaintContext} context the context to be used for drawing
     * @param {GRect} contentPaintBBox the paint bbox used for drawing this stylable
     */
    GElement.Stylable.prototype._paintStyle = function (context, contentPaintBBox) {
        var styleLayers = this.getStyleLayers();
        if (context.configuration.isOutline(context)) {
            this._paintStyleFillLayer(context, contentPaintBBox, styleLayers);
        } else if (this.$_stop > 0.0) {
            var orderedEffects = this._effects ? this._effects.getLayersEffects(styleLayers, true) : null;

            // If we have any pre- or post-effect then we'll be creating an effect canvas here
            // to be re-used by every effect renderer
            var effectCanvas = null;
            if (orderedEffects) {
                for (var i = 0; i < orderedEffects.length; ++i) {
                    if (orderedEffects[i]) {
                        for (var j = 0; j < orderedEffects[i].length; ++j) {
                            var effectType = orderedEffects[i][j].getEffectType();
                            if (effectType === GEffect.Type.PreEffect || effectType === GEffect.Type.PostEffect) {
                                effectCanvas = this._createStyleCanvas(context, contentPaintBBox);
                            }
                        }
                    }
                }
            }

            if (this.$_stop !== 1.0 || this.$_sbl !== GPaintCanvas.BlendMode.Normal) {
                // We need to paint on a separate canvas here
                var styleCanvas = this._createStyleCanvas(context, contentPaintBBox);
                var sourceCanvas = context.pushCanvas(styleCanvas);
                try {
                    this._paintStyleFillLayer(context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas);

                    if (this.$_sbl === 'mask') {
                        var area = this._getStyleMaskClipArea();
                        if (area) {
                            sourceCanvas.clipRect(area.getX(), area.getY(), area.getWidth(), area.getHeight());
                        }
                        try {
                            sourceCanvas.drawCanvas(styleCanvas, 0, 0, this.$_stop, GPaintCanvas.CompositeOperator.DestinationIn);
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
                    context.popCanvas();
                }
            } else {
                this._paintStyleFillLayer(context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas);
            }
        }

        if (effectCanvas) {
            effectCanvas.finish();
        }
    };

    /**
     * Called to paint the fill layer
     * @param {GPaintContext} context the context to be used for drawing
     * @param {GRect} contentPaintBBox the source bbox used for drawing
     * @param {Array<String>} the style layers
     * @param {Array} orderedEffects the ordered effects for all layers
     * @param {GPaintCanvas} effectCanvas an effect canvas if there're any pre/post effects
     */
    GElement.Stylable.prototype._paintStyleFillLayer = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        if (context.configuration.isOutline(context)) {
            this._paintStyleContent(context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas);
        } else {
            var fillEffects = orderedEffects ? orderedEffects[styleLayers && styleLayers.length ? styleLayers.length : 0] : null;
            if (this.$_sfop !== 1.0 || fillEffects) {
                // We need to paint on a separate canvas here
                var fillCanvas = this._createStyleCanvas(context, contentPaintBBox);
                var sourceCanvas = context.pushCanvas(fillCanvas);
                try {
                    this._paintStyleContent(context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas);

                    if (fillEffects) {
                        this._paintWithEffects(fillCanvas, context.getRootCanvas(), sourceCanvas, this.$_sfop, fillEffects, effectCanvas);
                    } else {
                        sourceCanvas.drawCanvas(fillCanvas, 0, 0, this.$_sfop);
                    }

                    fillCanvas.finish();
                } finally {
                    context.popCanvas();
                }
            } else if (this.$_sfop > 0.0) {
                this._paintStyleContent(context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas);
            }
        }
    };

    /**
     * Called to paint the actual style content
     * @param {GPaintContext} context the context to be used for drawing
     * @param {GRect} contentPaintBBox the source bbox used for drawing
     * @param {Array<String>} the style layers
     * @param {Array} orderedEffects the ordered effects for all layers
     * @param {GPaintCanvas} effectCanvas an effect canvas if there're any pre/post effects
     */
    GElement.Stylable.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        // By default we'll paint the style layers if there're any
        if (styleLayers && styleLayers.length) {
            var outlined = context.configuration.isOutline(context);
            var layerCanvas = null;

            for (var i = 0; i < styleLayers.length; ++i) {
                var layer = styleLayers[i];

                if (outlined) {
                    this._paintStyleLayer(context, layer);
                } else {
                    var effects = orderedEffects ? orderedEffects[i] : null;

                    if (effects || this._isSeparateStylePaintLayer(context, layer)) {
                        if (layerCanvas) {
                            layerCanvas.clear();
                        } else {
                            layerCanvas = this._createStyleCanvas(context, contentPaintBBox);
                        }

                        var sourceCanvas = context.pushCanvas(layerCanvas);
                        try {
                            this._paintStyleLayer(context, layer);

                            if (effects) {
                                this._paintWithEffects(layerCanvas, context.getRootCanvas(), sourceCanvas, 1, effects, effectCanvas);
                            } else {
                                sourceCanvas.drawCanvas(layerCanvas);
                            }
                        } finally {
                            context.popCanvas();
                        }
                    } else {
                        this._paintStyleLayer(context, layer);
                    }
                }
            }

            if (layerCanvas) {
                layerCanvas.finish();
            }
        }
    };

    /**
     * Called to paint and composite effects and contents onto a target
     * @param {GPaintCanvas} contents the canvas holding the contents
     * @param {GPaintCanvas} background the background canvas
     * @param {GPaintCanvas} target the target canvas for compositing everything
     * @param {Number} targetOpacity the opacity for painting the contents onto the target
     * @param {Array<GEffect>} effects the effects to paint
     * @param {GPaintCanvas} effectCanvas the effect canvas if there're any pre/post-effects
     * @private
     */
    GElement.Stylable.prototype._paintWithEffects = function (contents, background, target, targetOpacity, effects, effectCanvas) {
        var paintedContents = false;

        for (var i = 0; i < effects.length; ++i) {
            var effect = effects[i];
            var effectType = effect.getEffectType();

            if (effectType === GEffect.Type.Filter) {
                effect.render(contents, null, background, contents.getScale());
            } else if (effectType === GEffect.Type.PreEffect || effectType === GEffect.Type.PostEffect) {
                if (effectType === GEffect.Type.PostEffect && !paintedContents && targetOpacity > 0.0) {
                    target.drawCanvas(contents, 0, 0, targetOpacity);
                    paintedContents = true;
                }

                // Clear previous effect contents
                effectCanvas.clear();

                // Render effect on effects canvas
                var effectResult = effect.render(contents, effectCanvas, background, effectCanvas.getScale());
                var effectBlendType = GPaintCanvas.BlendMode.Normal;

                // Post effects may return a custom blend mode
                if (effectType === GEffect.Type.PostEffect && effectResult) {
                    effectBlendType = effectResult;
                }

                // Render effects canvas on target
                target.drawCanvas(effectCanvas, 0, 0, 1, effectBlendType);
            }
        }

        if (!paintedContents && targetOpacity > 0.0) {
            target.drawCanvas(contents, 0, 0, targetOpacity);
        }
    };

    /**
     * Called whenever this should paint a specific style layer
     * @param {GPaintContext} context the context to be used for drawing
     * @param {String} layer the actual layer to be painted
     */
    GElement.Stylable.prototype._paintStyleLayer = function (context, layer) {
        // NO-OP
    };

    /**
     * Called to test whether a given style layer requires a separate canvas or not
     * @param {GPaintContext} context the context to be used for drawing
     * @param {String} layer the actual layer to be painted
     * @return {Boolean} true if layer is separated, false if not
     */
    GElement.Stylable.prototype._isSeparateStylePaintLayer = function (context, layer) {
        return false;
    };

    /**
     * Should return the clip-area for masked styles
     * @param {GPaintContext} context
     * @return {GRect}
     * @private
     */
    GElement.Stylable.prototype._getStyleMaskClipArea = function (context) {
        return null;
    };

    /**
     * Creates a temporary canvas for style drawing. This function will actually
     * honor the Fast-Paint-Mode and if set, will return a canvas that paints at
     * 100% instead.
     * @param {GPaintContext} context the paint context in use
     * @param {GRect} extents the extents for the temporary canvas
     * @return {GPaintCanvas}
     * @private
     */
    GElement.Stylable.prototype._createStyleCanvas = function (context, extents) {
        if (context.configuration.paintMode === GScenePaintConfiguration.PaintMode.Fast) {
            var result = new GPaintCanvas();
            result.resize(extents.getWidth(), extents.getHeight());
            result.prepare();

            var topLeft = extents.getSide(GRect.Side.TOP_LEFT);
            result.setOrigin(topLeft);
            result.setOffset(topLeft);

            // TODO : Support clipping dirty areas

            return result;
        } else {
            return context.canvas.createCanvas(extents, true);
        }
    };

    /** @override */
    GElement.Stylable.prototype._stylePrepareGeometryChange = function (effect) {
        this._notifyChange(GElement._Change.PrepareGeometryUpdate);

        if (effect && this.hasMixin(GNode.Container)) {
            // Invalidate children that may be affected by our effects
            for (var node = this.getFirstChild(); node !== null; node = node.getNext()) {
                if (node instanceof GElement && node.hasMixin(GElement.Stylable)) {
                    node._stylePrepareGeometryChange(true);
                }
            }
        }
    };

    /** @override */
    GElement.Stylable.prototype._styleFinishGeometryChange = function (effect) {
        this._notifyChange(GElement._Change.FinishGeometryUpdate, 1 /* invalidate only paint bbox */);

        if (effect && this.hasMixin(GNode.Container)) {
            // Invalidate children that may be affected by our effects
            for (var node = this.getFirstChild(); node !== null; node = node.getNext()) {
                if (node instanceof GElement && node.hasMixin(GElement.Stylable)) {
                    node._styleFinishGeometryChange(true);
                }
            }
        }
    };

    /** @override */
    GElement.Stylable.prototype._styleRepaint = function () {
        this._notifyChange(GElement._Change.InvalidationRequest);
    };

    /** @override */
    GElement.Stylable.prototype._handleStyleChange = function (change, args) {
        if (this.isAttached()) {
            if (((change === GNode._Change.BeforePropertiesChange || change === GNode._Change.AfterPropertiesChange) && args.properties.indexOf('sref') >= 0) ||
                change === GNode._Change.Attached || change === GNode._Change.Detach) {
                var scene = this.getScene();
                var referencedStyle = this.getReferencedStyle();
                if (referencedStyle) {
                    switch (change) {
                        case GNode._Change.BeforePropertiesChange:
                        case GNode._Change.Detach:
                            scene.unlink(referencedStyle, this);
                            break;
                        case GNode._Change.AfterPropertiesChange:
                        case GNode._Change.Attached:
                            scene.link(referencedStyle, this);
                            break;
                    }
                }
            }


            if (change === GNode._Change.AfterPropertiesChange) {
                var styleBlendModeIdx = args.properties.indexOf('_sbl');
                if (styleBlendModeIdx >= 0 && args.values[styleBlendModeIdx] === 'mask' || this.$_sbl === 'mask') {
                    var myPage = this.getPage();
                    if (myPage) {
                        myPage._requestInvalidation();
                    }
                }
            }
        }

        if (change === GNode._Change.Store) {
            if (this.$sref) {
                args.sref = this.$sref;
            }
        } else if (change === GNode._Change.Restore) {
            this.$sref = args.sref;
        }

        GStylable.prototype._handleStyleChange.call(this, change, args);
    };

    /** @override */
    GElement.Stylable.prototype._getStyleMaskClipArea = function (context) {
        var myPage = this.getPage();
        if (myPage) {
            return myPage.getPageClipBBox();
        }
    };

    /** @override */
    GElement.Stylable.prototype.toString = function () {
        return "[Mixin GElement.Stylable]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GElement
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type GRect
     * @private
     */
    GElement.prototype._geometryBBbox = null;

    /**
     * @type GRect
     * @private
     */
    GElement.prototype._paintBBox = null;

    /**
     * Called to get the geometry bbox which usually is the bbox of the underlying shape
     * @return {GRect} the geometry bbox, may never be null
     * @version 1.0
     */
    GElement.prototype.getGeometryBBox = function () {
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
     * Only GElement members are taken into account.
     * @returns {GRect} the geometry bbox of the group
     */
    GElement.prototype.getGroupGeometryBBox = function (group) {
        var groupBBox = null;
        if (group && group.length) {
            for (var i = 0; i < group.length; ++i) {
                if (group[i] instanceof GElement) {
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
     * @return {GRect} the united geometry bbox of all children or empty rect if this node does not have
     * any children with valid geometry bboxes
     * @version 1.0
     */
    GElement.prototype.getChildrenGeometryBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(GNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GElement) {
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
     * @return {GRect} the paint bbox, may never be null
     * @version 1.0
     */
    GElement.prototype.getPaintBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this._paintBBox == null) {
            this._paintBBox = this._calculatePaintBBox();

            if (this._paintBBox) {
                // Expand paint bbox if not pixel aligned
                // to compensate for Antialiasing half-pixel artifacts
                var aaPadding = [0, 0, 0, 0];

                var x1 = this._paintBBox.getX();
                var y1 = this._paintBBox.getY();
                var x2 = x1 + this._paintBBox.getWidth();
                var y2 = y1 + this._paintBBox.getHeight();

                if (x1 != Math.floor(x1)) {
                    aaPadding[0] = 0.5;
                }

                if (y1 != Math.floor(y1)) {
                    aaPadding[1] = 0.5;
                }

                if (x2 !== Math.ceil(x2)) {
                    aaPadding[2] = 0.5;
                }

                if (y2 !== Math.ceil(y2)) {
                    aaPadding[3] = 0.5;
                }

                this._paintBBox = this._paintBBox.expanded(aaPadding[0], aaPadding[1], aaPadding[2], aaPadding[3]);
            }
        }

        return this._paintBBox;
    };

    /**
     * Called to get the united paint bbox of all children of this node if this node is a container
     * @return {GRect} the united paint bbox of all children or empty rect if this node does not have
     * any children with valid paint bboxes
     * @version 1.0
     */
    GElement.prototype.getChildrenPaintBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(GNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GElement) {
                    var childBBox = node.getPaintBBox();
                    if (childBBox && !childBBox.isEmpty()) {
                        result = result ? result.united(childBBox) : childBBox;
                    }
                }
            }
            return result ? result : new GRect(0, 0, 0, 0);
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
    GElement.prototype.isVisible = function () {
        return (this._flags & GElement.Flag.Hidden) == 0;
    };

    /**
     * Called whenever a hit-test should be made on this element. Note that
     * this should hit-test against it's sub-elements (bottom-up), first
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
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
     * @param {Function} [filter] optional callback function getting called for *every* element
     * that is tested for hitting even if not hit. Should return false to immediately stop testing
     * on this and any element underneath and go on with the testing chain.
     * @returns {Array<GElement.HitResultInfo>} either null for no hit or
     * a certain hit result depending on the element type
     */
    GElement.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force, filter) {
        if (typeof level !== 'number') level = -1; // unlimited deepness
        tolerance = tolerance || 0;

        // First test against our filter if any for fastest sort-out of non-hitting elements
        if (filter && filter.call(null, this) === false) {
            return null;
        }

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
        if (level !== 0 && this.hasMixin(GNode.Container)) {
            for (var child = this.getLastChild(); child != null; child = child.getPrevious()) {
                if (child instanceof GElement) {
                    var subResult = child.hitTest(location, transform, acceptor, stacked, level - 1, tolerance, force, filter);
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
     * @param {GVertexSource} area the area to get colissions within
     * @param {Number} flags one or more flags to use for collision testing
     * @param {Function} [acceptor] optional callback function getting called
     * for a hit and receiving the currently hit element as it's only parameter.
     * @param {Function} [filter] optional callback function getting called for *every* element
     * that is tested for hitting even if not hit. Should return false to immediately stop testing
     * on this and any element underneath and go on with the testing chain.
     * @return {Array<GElement>} an array including all coliding elements or
     * an empty array for no collisions
     * @see GElement.CollisionFlag
     */
    GElement.prototype.getCollisions = function (area, flags, acceptor, filter) {
        var result = [];

        var _addToResult = function (element) {
            if ((acceptor && acceptor.call(null, element) == true) || !acceptor) {
                result.push(element);
            }
        };

        // Handle the basic collision modes here
        if ((flags & GElement.CollisionFlag.GeometryBBox) != 0 || (flags & GElement.CollisionFlag.PaintBBox) != 0) {
            // First test against our filter if any for fastest sort-out of non-hitting elements
            if (filter && filter.call(null, this) === false) {
                // done here
                return result;
            }

            // Test ourself, first
            var bbox = this.getPaintBBox();
            if (bbox && !bbox.isEmpty()) {
                // TODO : How to check bbox intersection with area vertex source including partial param?
                // --> area.intersects(..)

                var areaBounds = ifVertexInfo.calculateBounds(area, true);

                if ((flags & GElement.CollisionFlag.Partial) != 0) {
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
        if (this.hasMixin(GNode.Container)) {
            for (var child = this.getFirstChild(); child != null; child = child.getNext()) {
                if (child instanceof GElement) {
                    var subResult = child.getCollisions(area, flags, acceptor, filter);
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
     * @param {GVertexSource} area the area to get collisions within
     */
    GElement.prototype.isFullUnderCollision = function (area) {
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
    GElement.prototype.beginUpdate = function () {
        if (!this._updateCounter) {
            this._updateCounter = 1;
            this._notifyChange(GElement._Change.PrepareGeometryUpdate);
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
    GElement.prototype.endUpdate = function (noGeometryInvalidation) {
        if (this._updateCounter != null && --this._updateCounter == 0) {
            this._releaseUpdateChanges();
            this._notifyChange(GElement._Change.FinishGeometryUpdate, noGeometryInvalidation ? -1 : 0);
            delete this._updateCounter;
        }
    };

    /**
     * Function to check whether a node is actually rednerable, this includes
     * for example checking for display flag, checking for dirty regions,
     * empty bounding box, visibility and more.
     * @param {GPaintContext} [context] the current paint context, if null,
     * no check against a context will be made
     * @return {Boolean} true if the node is paintable, false if not
     * @private
     */
    GElement.prototype.isPaintable = function (context) {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return false;
        }

        if (!context) {
            // If there's no context we can only paint when attached and having a parent
            // or when we are the scene by ourself
            return (this.isAttached() && this.getParent()) || (this instanceof GScene);
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
     * @param {GPaintContext} context the context to be used for drawing
     */
    GElement.prototype.paint = function (context) {
        // Prepare paint
        if (!this._preparePaint(context)) {
            return;
        }

        this._paint(context);

        this._finishPaint(context);
    };

    GElement.PaintLayer = {
        Outline: 'O',
        Background: 'B',
        Content: 'C',
        Foreground: 'F'
    }

    /**
     * Called to paint this element into a new bitmap
     * @param {Number|GLength} [width] the width of the bitmap, set to 0|null
     * to use the element's bbox as width. Defaults to null. If the value is
     * a number, it reflects the scale factor, otherwise if it is an GLength,
     * it defines an absolute width.
     * @param {Number|GLength} [height] the height of the bitmap, set to 0|null
     * to use the element's bbox as height. Defaults to null. If the value is
     * a number, it reflects the scale factor, otherwise if it is an GLength,
     * it defines an absolute width.
     * @param {Number} [ratio] the ratio mode to be used whereas 0|null
     * means to keep minimum aspect ratio thus eventually adjusting width
     * or height and making one smaller, 1 means to keep maximum aspect ratio
     * thus eventually adjusting  width or height and making one larger and
     * 2 means to keep the width/height but center the element on bitmap
     * if it's bbox ratio doesn't match the one of width / height
     * @return {GBitmap}
     */
    GElement.prototype.toBitmap = function (width, height, ratio) {
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
            } else if (width instanceof GLength) {
                scaleX = width.toPoint() / paintArea.getWidth();
            }
        }

        if (height) {
            if (typeof height === 'number') {
                scaleY = height;
            } else if (height instanceof GLength) {
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
        var paintCanvas = new GPaintCanvas();
        paintCanvas.resize(canvasWidth, canvasHeight);

        // Create + Setup Paint Context & Configuration
        var paintContext = new GPaintContext();
        paintContext.canvas = paintCanvas;
        var paintConfig = new GScenePaintConfiguration();
        paintConfig.paintMode = GScenePaintConfiguration.PaintMode.Full;
        paintConfig.annotations = false;
        paintContext.configuration = paintConfig;
        paintConfig.clipArea = paintArea;

        paintCanvas.prepare();
        paintCanvas.setOrigin(new GPoint(paintArea.getX() * scale - deltaX, paintArea.getY() * scale - deltaY));
        paintCanvas.setScale(scale);
        try {
            return this._paintToBitmap(paintContext);
        } finally {
            paintCanvas.finish();
        }
    };

    /** @override */
    GElement.prototype.assignFrom = function (other) {
        GNode.prototype.assignFrom.call(this, other);
        if (this.hasMixin(GStylable) && other.hasMixin(GStylable)) {
            this.assignStyleFrom(other);
        }

        if (this.hasMixin(GElement.Stylable) && other.hasMixin(GElement.Stylable)) {
            this.$sref = other.$sref;
        }
    };

    /**
     * Called to return the area for this element for painting into bitmap
     * @returns {GRect}
     * @private
     */
    GElement.prototype._getBitmapPaintArea = function () {
        return this.getPaintBBox();
    };

    /**
     * Called to paint this element into a bitmap
     * @param {GPaintContext} context
     * @returns {GBitmap}
     * @private
     */
    GElement.prototype._paintToBitmap = function (context) {
        this.paint(context);
        return context.canvas.getBitmap();
    };

    /**
     * Called whenever this should paint itself
     * @param {GPaintContext} context the context to be used for drawing
     */
    GElement.prototype._paint = function (context) {
        if (this.hasMixin(GElement.Stylable)) {
            this._paintStyle(context, this.getPaintBBox());
        } else {
            this._paintChildren(context);
        }
    };

    /**
     * Called for preparing a paint
     * @param {GPaintContext} context the current paint context
     * @return {Boolean} false if painting should be canceled, true otherwise
     * @private
     */
    GElement.prototype._preparePaint = function (context) {
        if (this.hasFlag(GElement.Flag.NoPaint)) {
            return false;
        }

        return this.isPaintable(context);
    };

    /**
     * Called for finishing a paint
     * @param {GPaintContext} context the current paint context
     * @private
     */
    GElement.prototype._finishPaint = function (context) {
        // NO-OP
    };

    /**
     * Called for painting all children if this element is a container
     * @param {GPaintContext} context the current paint context
     * @private
     */
    GElement.prototype._paintChildren = function (context) {
        // default paint handling if node is a container
        if (this.hasMixin(GNode.Container)) {
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GElement) {
                    node.paint(context);
                }
            }
        }
    };

    /**
     * Called whenever the underliny geometry bbox needs to be calculated
     * @return {GRect} the calculated geometry bbox, may never be null
     * @private
     */
    GElement.prototype._calculateGeometryBBox = function () {
        // Default action unites all children geometry bboxes if this is a container
        return this.getChildrenGeometryBBox();
    };

    /**
     * Called whenever the underlying paint bbox needs to be calculated
     * @return {GRect} the calculated paint bbox, may never be null
     * @private
     */
    GElement.prototype._calculatePaintBBox = function () {
        return this.getChildrenPaintBBox();
    };

    /**
     * Called whenever a detail hit-test should be made on this element.
     * Detail means that the caller has already checked against a valid
     * bounding area of this element as well as that the given location
     * falls within the bounding area.
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance used for hit-testing
     * @param {Boolean} force if true, enforce hitting even if something is not visible
     * or has no area etc.
     * @returns {GElement.HitResultInfo} either null for no hit or
     * a certain hit result depending on the element type
     */
    GElement.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return null;
    };

    /**
     * Blocks all update changes like geometry update, invalidation etc.
     * @private
     */
    GElement.prototype._blockUpdateChanges = function () {
        this._beginBlockChanges([
            GElement._Change.InvalidationRequest,
            GElement._Change.PrepareGeometryUpdate,
            GElement._Change.FinishGeometryUpdate,
            GElement._Change.ChildGeometryUpdate
        ]);
    };

    /**
     * Releases all update changes like geometry update, invalidation etc.
     * @private
     */
    GElement.prototype._releaseUpdateChanges = function () {
        this._endBlockChanges([
            GElement._Change.InvalidationRequest,
            GElement._Change.PrepareGeometryUpdate,
            GElement._Change.FinishGeometryUpdate,
            GElement._Change.ChildGeometryUpdate
        ]);
    };

    /**
     * Called to to request a invalidation for a given node
     * @param {GElement} node the node to request an invalidation for
     * @private
     */
    GElement.prototype._requestInvalidateNode = function (node) {
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
     * @param {GRect} area the area of invalidation
     * @private
     */
    GElement.prototype._requestInvalidationArea = function (area) {
        if (this.isAttached()) {
            this._scene._invalidateArea(area);
            this._handleChange(GElement._Change.InvalidationRequested, area);
        }
    };

    /**
     * Called to request an invalidation for this node
     * @private
     */
    GElement.prototype._requestInvalidation = function () {
        this._requestInvalidateNode(this);
    };

    /** @override */
    GElement.prototype._handleChange = function (change, args) {
        if (change == GElement._Change.InvalidationRequest) {
            if (this.isPaintable()) {
                this._requestInvalidation();
            }
        } else if (change === GElement._Change.InvalidationRequested) {
            // Deliver invalidation requested up to parent
            if (this.getParent()) {
                this.getParent()._notifyChange(GElement._Change.InvalidationRequested, args);
            }
        } else if (change == GElement._Change.PrepareGeometryUpdate) {
            if (this.isVisible()) {
                if (this._canEventBeSend(GElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GElement.GeometryChangeEvent(this, GElement.GeometryChangeEvent.Type.Before));
                }
            }
        } else if (change == GElement._Change.FinishGeometryUpdate) {
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
                    if (!GRect.equals(newPaintBBox, savedPaintBBox)) {

                        // Deliver child geometry update to parent
                        if (this.getParent()) {
                            this.getParent()._notifyChange(GElement._Change.ChildGeometryUpdate, this);
                        }

                        // Request repaint of old paint bbox if there was any
                        if (savedPaintBBox) {
                            this._requestInvalidationArea(savedPaintBBox);
                        }

                        // Request a repaint of our new geometry
                        this._handleChange(GElement._Change.InvalidationRequest);
                    } else {
                        // Paintboxes are equal then do a simple invalidation request
                        this._requestInvalidation();
                    }
                }

                if (this._canEventBeSend(GElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GElement.GeometryChangeEvent(this, GElement.GeometryChangeEvent.Type.After));
                }
            }
        } else if (change == GElement._Change.ChildGeometryUpdate) {
            if (this.isVisible()) {
                this._invalidateGeometryForChildUpdate();

                if (this._canEventBeSend(GElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GElement.GeometryChangeEvent(this, GElement.GeometryChangeEvent.Type.Child));
                }

                // Forward to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(change, args);
                }
            }
        } else if (change == GNode._Change.AfterChildInsert) {
            // If child is an element, notify about the change
            if (args instanceof GElement) {
                this._notifyChange(GElement._Change.ChildGeometryUpdate, args);
                args._handleChange(GElement._Change.InvalidationRequest);
            }
        } else if (change == GNode._Change.BeforeChildRemove) {

            // If child is an element, request repaint for it's area
            if (args instanceof GElement) {
                this._requestInvalidateNode(args);
            }
        } else if (change == GNode._Change.AfterChildRemove) {

            // If child is an element, notify about the change
            if (args instanceof GElement) {
                this._notifyChange(GElement._Change.ChildGeometryUpdate, args);
            }
        } else if (change == GNode._Change.AfterFlagChange) {
            switch (args.flag) {
                case GElement.Flag.NoPaint:
                    this._requestInvalidation();
                    break;
                default:
                    break;

            }
        }

        if (this.hasMixin(GElement.Stylable)) {
            this._handleStyleChange(change, args);
        }

        GNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Called whenever this element's geometry should be invalidated
     * because any of it's child's geometry has been changed
     * @private
     */
    GElement.prototype._invalidateGeometryForChildUpdate = function () {
        if (this.hasMixin(GNode.Container)) {
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
    GElement.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == GNode._Change.BeforePropertiesChange || change == GNode._Change.AfterPropertiesChange) {
            if (GUtil.containsObjectKey(args.properties, properties)) {
                switch (change) {
                    case GNode._Change.BeforePropertiesChange:
                        this._notifyChange(GElement._Change.PrepareGeometryUpdate);
                        break;
                    case GNode._Change.AfterPropertiesChange:
                        this._notifyChange(GElement._Change.FinishGeometryUpdate);
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
    GElement.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == GNode._Change.AfterPropertiesChange) {
            if (GUtil.containsObjectKey(args.properties, properties)) {
                this._notifyChange(GElement._Change.InvalidationRequest);
                return true;
            }
        }
        return false;
    };

    _.GElement = GElement;
})
(this);