(function (_) {
    /**
     * An element represent an elementary node within a scene, something like a layer,
     * a shape, a group of shapes and more
     * @class IFElement
     * @extends IFNode
     * @constructor
     */
    function IFElement() {
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
         * A child's geometry has been updated
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
         * args = Boolean whether to invalidate geometry or not, defaults to true
         * @type {Number}
         */
        FinishGeometryUpdate: 221,

        /**
         * An invalidation is requested
         * args = none
         * @type {Number}
         */
        InvalidationRequest: 230
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.GeometryChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event on geometrical changes of an element sent via a scene
     * @param {IFElement} element the affected element
     * @param {IFElement.GeometryChangeEvent.Type} type the geometrical change type
     * @class IFElement.GeometryChangeEvent
     * @extends GEvent
     * @constructor
     */
    IFElement.GeometryChangeEvent = function (element, type) {
        this.element = element;
        this.type = type;
    };
    IFObject.inherit(IFElement.GeometryChangeEvent, GEvent);

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
    // IFElement.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on an element
     * @param {IFElement} element the element that was hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class IFElement.HitResult
     */
    IFElement.HitResult = function (element, args) {
        this.element = element;
        this.data = args;
    };

    /**
     * The element that was hit
     * @type {IFElement}
     * @version 1.0
     */
    IFElement.HitResult.prototype.element = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    IFElement.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement.Pivot Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to contain a pivot point
     * @class IFElement.Pivot
     * @constructor
     * @mixin
     * @version 1.0
     */
    IFElement.Pivot = function () {
    };

    /**
     * @type {Object|GPoint}
     * @private
     */
    IFElement.Pivot.prototype._pivot = GRect.Side.CENTER;

    /**
     * @return {GPoint} the (absolute) pivot point
     * @version 1.0
     */
    IFElement.Pivot.prototype.getPivotPoint = function () {
        var bbox = this.getGeometryBBox();
        if (bbox == null) {
            bbox = new GRect(0, 0, 0, 0);
        }

        if (this._pivot instanceof GPoint) {
            // a pivot point is always relative to our bbox
            return this._pivot.translated(bbox.getX(), bbox.getY());
        } else {
            return bbox.getSide(this._pivot);
        }
    };

    /** @override */
    IFElement.Pivot.prototype.toString = function () {
        return "[Mixin IFElement.Pivot]";
    };

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
     * @return {GTransform}
     */
    IFElement.Transform.prototype.getTransform = function () {
        return null;
    };

    /**
     * Assigns the actual transformation the element has
     * @return {GTransform}
     */
    IFElement.Transform.prototype.setTransform = function (transform) {
        throw new Error("Not Supported.");
    };

    /**
     * Transforms this element with another given transformation
     * including multiplication with the existing transformation
     * the element may already have. This will by default simply
     * apply the transformation to all direct children of the element if any
     * @param {GTransform} transform the transformation to be applied
     */
    IFElement.Transform.prototype.transform = function (transform) {
        this._transformChildren(transform);
    };

    /**
     * @param {GTransform} transform the transformation to be applied
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
    // IFElement.Style Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to be stylable
     * @class IFElement.Style
     * @constructor
     * @mixin
     */
    IFElement.Style = function () {
    };

    /**
     * @type {IFStyleSet}
     * @private
     */
    IFElement.Style._styleSet = null;

    /**
     * Returns the style-set for this element
     * @returns {IFStyleSet}
     */
    IFElement.Style.prototype.getStyleSet = function () {
        // If we have a _styleSet reference and it not
        // has ourself as a parent, then clear it, first
        if (this._styleSet && this._styleSet.getParent() !== this) {
            this._styleSet = null;
        }

        if (!this._styleSet) {
            // Find our style-set and save reference for faster access
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof IFStyleSet) {
                    this._styleSet = child;
                    break;
                }
            }
        }
        return this._styleSet;
    };

    /**
     * Render with a given Style. This will render with raster and filter
     * effects if there're any within the given style
     * @param {IFPaintContext} context
     * @param {IFStyle} style
     * @param {Number} [styleIndex] the style's index
     */
    IFElement.Style.prototype.renderStyle = function (context, style, styleIndex) {
        if (context.configuration.isRasterEffects(context)) {
            var styleAsMask = false;
            var styleOnBackground = false;
            var styleKnockout = false;
            var styleOpacity = 1.0;
            var styleBlendMode = IFPaintCanvas.BlendMode.Normal;

            if (style instanceof IFAppliedStyle) {
                var styleType = style.getProperty('tp');
                switch (styleType) {
                    case IFAppliedStyle.Type.Content:
                        break;
                    case IFAppliedStyle.Type.Mask:
                        styleAsMask = true;
                        break;
                    case IFAppliedStyle.Type.Knockout:
                        styleKnockout = true;
                        break;
                    case IFAppliedStyle.Type.Background:
                        styleOnBackground = true;
                        break;
                    default:
                        break;
                }

                styleOpacity = style.getProperty('opc');
                styleBlendMode = style.getProperty('blm');
            }

            var needContentsCanvas =
                styleOpacity !== 1.0 ||
                    styleBlendMode !== IFPaintCanvas.BlendMode.Normal ||
                    styleAsMask === true ||
                    styleOnBackground === true;

            // Collect filter and effects if desired
            var effects = [];
            var filters = [];

            for (var child = style.getActualStyle().getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFStyleEntry && child.getProperty('vs') === true) {
                    if (child instanceof IFEffectEntry) {
                        effects.push(child);
                        needContentsCanvas = true;
                    } else if (child instanceof IFFilterEntry) {
                        filters.push(child);
                        needContentsCanvas = true;
                    }
                }
            }

            if (needContentsCanvas) {
                // Create a temporary canvas for our actual contents
                var hasRenderedPaintCanvas = false;
                var paintBBox = style.getBBox(this.getGeometryBBox());
                var sourceCanvas = context.canvas;
                var contentsCanvas = sourceCanvas.createCanvas(paintBBox);
                var paintCanvas = contentsCanvas;
                var backgroundCanvas = null;

                // Paint our contents now
                context.canvas = contentsCanvas;
                try {
                    this._paint(context, style, styleIndex);
                } finally {
                    context.canvas = sourceCanvas;
                }

                // If style is a mask or on background, create a background canvas here that
                // keeps the contents of the background within ourself
                if (styleAsMask || styleOnBackground) {
                    backgroundCanvas = sourceCanvas.createCanvas(paintBBox, true/*copy contents*/);

                    // If style is on background, switch paintCanvas from contents
                    // to the background canvas as everything will be applied there instead
                    if (styleOnBackground) {
                        paintCanvas = backgroundCanvas;
                    }
                }

                var _tryRenderPaintCanvas = function () {
                    if (!hasRenderedPaintCanvas) {
                        if (styleAsMask) {
                            // For masking, we'll first clip our background canvas with the
                            // paint canvas, then clear our target area in our canvas and
                            // finally paint the background canvas
                            backgroundCanvas.drawCanvas(paintCanvas, 0, 0, 1.0, IFPaintCanvas.CompositeOperator.DestinationIn);
                            sourceCanvas.drawCanvas(backgroundCanvas, 0, 0, styleOpacity, styleBlendMode, true/*clear*/);
                        } else if (styleOnBackground) {
                            // For background style we'll clip the paint canvas which is our
                            // background canvas with applied effects with the contents canvas
                            // and finally paint it then
                            paintCanvas.drawCanvas(contentsCanvas, 0, 0, 1.0, IFPaintCanvas.CompositeOperator.DestinationIn);
                            sourceCanvas.drawCanvas(paintCanvas, 0, 0, styleOpacity, styleBlendMode);
                        } else {
                            // Regular painting
                            sourceCanvas.drawCanvas(paintCanvas, 0, 0, styleOpacity, styleBlendMode);
                        }
                        hasRenderedPaintCanvas = true;
                    }
                };

                // Apply filters on contents
                for (var i = 0; i < filters.length; ++i) {
                    filters[i].apply(paintCanvas);
                }

                // Apply effects if desired...
                if (effects.length > 0) {
                    // Order effects whether they're pre- or post-effects
                    effects.sort(function (a, b) {
                        return (a.isPost() === b.isPost()) ? 0 : b.isPost() ? -1 : 1;
                    });

                    // Initiate a temporary effect canvas
                    var effectCanvas = sourceCanvas.createCanvas(paintBBox);
                    for (var i = 0; i < effects.length; ++i) {
                        var effect = effects[i];

                        if (i > 0) {
                            // Clear previous effect contents
                            effectCanvas.fillRect(0, 0, paintBBox.getWidth(), paintBBox.getHeight());
                        }

                        // Paint contents before first post filter except if knocked out
                        if (!styleKnockout && effect.isPost()) {
                            _tryRenderPaintCanvas();
                        }

                        // Render effect and paint the effect canvas
                        effect.render(effectCanvas, paintCanvas);
                        sourceCanvas.drawCanvas(effectCanvas, 0, 0, styleOpacity, styleBlendMode);
                    }
                }

                _tryRenderPaintCanvas();
            } else {
                this._paint(context, style, styleIndex);
            }
        } else {
            this._paint(context, style, styleIndex);
        }
    };

    /** @override */
    IFElement.Style.prototype.toString = function () {
        return "[Mixin IFElement.Style]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFElement
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type GRect
     * @private
     */
    IFElement.prototype._geometryBBbox = null;

    /**
     * @type GRect
     * @private
     */
    IFElement.prototype._paintBBox = null;

    /**
     * Called to get the geometry bbox which usually is the bbox of the underlying shape
     * @return {GRect} the geometry bbox, may never be null
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
     * Called to get the united geometry bbox of all children of this node if this node is a container
     * @return {GRect} the united geometry bbox of all children or empty rect if this node does not have
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
     * @return {GRect} the paint bbox, may never be null
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
     * @return {GRect} the united paint bbox of all children or empty rect if this node does not have
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
            return result ? result : new GRect(0, 0, 0, 0);
        }
        return null;
    };

    /**
     * Returns whether this geometry is actually visible. Note that even if this
     * function returns true, it does not mean that the node is paintable after all
     * as this doesn't include any specific checking for visibility.
     * To check whether this geometry is really paintable, use the isRenderable function.
     * Note that this will also return false even this geometry would be visible
     * but one of it's parents is hidden.
     * @see isRenderable
     * @version 1.0
     */
    IFElement.prototype.isVisible = function () {
        return (this._flags & IFElement.Flag.Hidden) == 0;
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
     * @returns {Array<IFElement.HitResult>} either null for no hit or
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

                var areaBounds = gVertexInfo.calculateBounds(area, true);

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
            this._notifyChange(IFElement._Change.FinishGeometryUpdate, noGeometryInvalidation ? false : true);
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
    IFElement.prototype.isRenderable = function (context) {
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

        if (context && context.dirtyMatcher && !context.dirtyMatcher.isDirty(paintBBox)) {
            return false;
        }
        return true;
    };

    /**
     * Called to render this element
     * @param {IFPaintContext} context the context to be used for drawing
     */
    IFElement.prototype.render = function (context, style) {
        // Prepare paint
        if (!this._preparePaint(context)) {
            return;
        }

        var paintRegular = true;
        if (this.hasMixin(IFElement.Style)) {
            var styleSet = this.getStyleSet();
            var styleIndex = 0;
            for (var style = styleSet.getFirstChild(); style !== null; style = style.getNext()) {
                if (style instanceof IFStyle && style.getProperty('vs') === true) {
                    paintRegular = false;

                    this.renderStyle(context, style, styleIndex);

                    styleIndex++;
                }
            }
        }

        if (paintRegular) {
            this._paint(context, null, null);
        }

        this._finishPaint(context);
    };

    /**
     * Called whenever this should paint itself
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFStyle} [style] the current style used for painting, only
     * provided if this element has the IFElement.Style mixin
     * @param {Number} [styleIndex] the current style's index, only provided
     * if this element has the IFElement.Style mixin
     */
    IFElement.prototype._paint = function (context, style, styleIndex) {
        // Render children by default
        this._renderChildren(context);
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

        return this.isRenderable(context);
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
    IFElement.prototype._renderChildren = function (context) {
        // default paint handling if node is a container
        if (this.hasMixin(IFNode.Container)) {
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof IFElement) {
                    node.render(context);
                }
            }
        }
    };

    /**
     * Called whenever the underliny geometry bbox needs to be calculated
     * @return {GRect} the calculated geometry bbox, may never be null
     * @private
     */
    IFElement.prototype._calculateGeometryBBox = function () {
        // Default action unites all children geometry bboxes if this is a container
        return this.getChildrenGeometryBBox();
    };

    /**
     * Called whenever the underlying paint bbox needs to be calculated
     * @return {GRect} the calculated paint bbox, may never be null
     * @private
     */
    IFElement.prototype._calculatePaintBBox = function () {
        var result = this.getChildrenGeometryBBox();

        if (result && this.hasMixin(IFElement.Style)) {
            result = this.getStyleSet().getBBox(result);
        }

        return result;
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
     * @returns {IFElement.HitResult} either null for no hit or
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
        if (this.isAttached() && node.isRenderable()) {
            var repaintArea = node.getPaintBBox();
            if (repaintArea) {
                // Expand repaint area a bit to accreditate for any aa-pixels
                this._scene._invalidateArea(repaintArea.expanded(1.5, 1.5, 1.5, 1.5));
            }
        }
    };

    /**
     * Called to request a invalidation for a given area
     * @param {GRect} area the area of invalidation
     * @private
     */
    IFElement.prototype._requestInvalidationArea = function (area) {
        if (this.isAttached()) {
            this._scene._invalidateArea(area);
        }
    };

    /**
     * Called to request an invalidation for this node
     * @private
     */
    IFElement.prototype._requestInvalidation = function () {
        this._requestInvalidateNode(this);
    };

    /**
     * Invalidate the geometry to enforce a re-calculation
     * @private
     */
    IFElement.prototype._invalidateGeometry = function () {
        this._geometryBBbox = null;
        this._paintBBox = null;
    };

    /** @override */
    IFElement.prototype._handleChange = function (change, args) {
        if (change == IFElement._Change.InvalidationRequest) {
            if (this.isRenderable()) {
                this._requestInvalidation();
            }
        } else if (change == IFElement._Change.PrepareGeometryUpdate) {
            if (this.isRenderable()) {
                var paintBBox = this.getPaintBBox();
                if (paintBBox && !paintBBox.isEmpty()) {
                    this._savedPaintBBox = paintBBox;
                }
            }

            if (this.isVisible()) {
                if (this._canEventBeSend(IFElement.GeometryChangeEvent)) {
                    this._scene.trigger(new IFElement.GeometryChangeEvent(this, IFElement.GeometryChangeEvent.Type.Before));
                }
            }
        } else if (change == IFElement._Change.FinishGeometryUpdate) {
            if (this.isVisible()) {
                // Avoid invalidation only of args is explicitely set to false
                if (!(false === args)) {
                    this._invalidateGeometry();
                }

                if (this.isRenderable()) {
                    var newPaintBBox = this.getPaintBBox();
                    if (!GRect.equals(newPaintBBox, this._savedPaintBBox)) {

                        // Deliver child geometry update to parent
                        if (this.getParent()) {
                            this.getParent()._notifyChange(IFElement._Change.ChildGeometryUpdate, this);
                        }

                        // Request repaint of old paint bbox if there was any
                        if (this._savedPaintBBox) {
                            this._requestInvalidationArea(this._savedPaintBBox);
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

                if (this._savedPaintBBox) {
                    delete this._savedPaintBBox;
                }
            }
        } else if (change == IFElement._Change.ChildGeometryUpdate) {
            if (this.isVisible()) {
                this._invalidateGeometry();

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

            // Call super and be done with it
            IFNode.prototype._handleChange.call(this, change, args);
        } else if (change == IFNode._Change.BeforeChildRemove) {

            // If child is an element, request repaint for it's area
            if (args instanceof IFElement) {
                this._requestInvalidateNode(args);
            }

            // Call super and be done with it
            IFNode.prototype._handleChange.call(this, change, args);
        } else if (change == IFNode._Change.AfterChildRemove) {

            // If child is an element, notify about the change
            if (args instanceof IFElement) {
                this._notifyChange(IFElement._Change.ChildGeometryUpdate, args);
            }

            // Call super and be done with it
            IFNode.prototype._handleChange.call(this, change, args);
        } else if (change == IFNode._Change.AfterFlagChange) {
            switch (args.flag) {
                case IFElement.Flag.NoPaint:
                    this._requestInvalidation();
                    break;
                default:
                    break;
            }

            // Call super and be done with it
            IFNode.prototype._handleChange.call(this, change, args);
        } else {
            // Call super by default and be done with it
            IFNode.prototype._handleChange.call(this, change, args);
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