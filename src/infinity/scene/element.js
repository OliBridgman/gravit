(function (_) {
    /**
     * An element represent an elementary node within a scene, something like a layer,
     * a shape, a group of shapes and more
     * @class GXElement
     * @extends GXNode
     * @constructor
     * @version 1.0
     */
    function GXElement() {
    }

    GObject.inherit(GXElement, GXNode);

    /**
     * The visual properties of an element with their default values
     */
    GXElement.VisualProperties = {
        visible: true
    };

    /**
     * Known flags for a geometry
     * @version 1.0
     */
    GXElement.Flag = {
        /**
         * Defines a flag for being hidden
         * @type {Number}
         * @version 1.0
         */
        Hidden: 1 << 21
    };

    /**
     * Known flags for a collision check
     * @version 1.0
     */
    GXElement.CollisionFlag = {
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
    GXElement._Change = {
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
    // GXElement.GeometryChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event on geometrical changes of an element sent via a scene
     * @param {GXElement} element the affected element
     * @param {GXElement.GeometryChangeEvent.Type} type the geometrical change type
     * @class GXElement.GeometryChangeEvent
     * @extends GEvent
     * @constructor
     */
    GXElement.GeometryChangeEvent = function (element, type) {
        this.element = element;
        this.type = type;
    };
    GObject.inherit(GXElement.GeometryChangeEvent, GEvent);

    /**
     * The type of a geometrical change
     */
    GXElement.GeometryChangeEvent.Type = {
        /** Before the element's geometry gets changed */
        Before: 0,
        /** After the element's geometry has been changed */
        After: 1,
        /** After any of the element's child geometry has been changed */
        Child: 2
    };

    /**
     * The affected element
     * @type GXElement
     */
    GXElement.GeometryChangeEvent.prototype.element = null;

    /**
     * The type of the geometrical change
     * @type {GXElement.GeometryChangeEvent.Type}
     */
    GXElement.GeometryChangeEvent.prototype.type = null;

    /** @override */
    GXElement.GeometryChangeEvent.prototype.toString = function () {
        return "[Event GXElement.GeometryChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXElement.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on an element
     * @param {GXElement} element the element that was hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class GXElement.HitResult
     */
    GXElement.HitResult = function (element, args) {
        this.element = element;
        this.data = args;
    };

    /**
     * The element that was hit
     * @type {GXElement}
     * @version 1.0
     */
    GXElement.HitResult.prototype.element = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    GXElement.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GXElement.Pivot Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to contain a pivot point
     * @class GXElement.Pivot
     * @constructor
     * @mixin
     * @version 1.0
     */
    GXElement.Pivot = function () {
    };

    /**
     * @type {Object|GPoint}
     * @private
     */
    GXElement.Pivot.prototype._pivot = GRect.Side.CENTER;

    /**
     * @return {GPoint} the (absolute) pivot point
     * @version 1.0
     */
    GXElement.Pivot.prototype.getPivotPoint = function () {
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
    GXElement.Pivot.prototype.toString = function () {
        return "[Mixin GXElement.Pivot]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXElement.Transform Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to be transformable
     * @class GXElement.Transform
     * @constructor
     * @mixin
     */
    GXElement.Transform = function () {
    };

    /**
     * Returns the actual transformation the element has
     * @return {GTransform}
     */
    GXElement.Transform.prototype.getTransform = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Assigns the actual transformation the element has
     * @return {GTransform}
     */
    GXElement.Transform.prototype.setTransform = function (transform) {
        throw new Error("Not Supported.");
    };

    /**
     * Transforms this element with another given transformation
     * including multiplication with the existing transformation
     * the element may already have
     * @param {GTransform} transform the transformation to be applied
     */
    GXElement.Transform.prototype.transform = function (transform) {
        throw new Error("Not Supported.");
    };

    /** @override */
    GXElement.Transform.prototype.toString = function () {
        return "[Mixin GXElement.Transform]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXElement.Style Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Marks an element to be styleable
     * @class GXElement.Style
     * @constructor
     * @mixin
     */
    GXElement.Style = function () {
    };

    /**
     * @type {GXStyleSet}
     * @private
     */
    GXElement.Style._styleSet = null;

    /**
     * Returns the style for the element. If the element doesn't yet
     * have a style, one can be created when requested.
     *
     * @param {Boolean} [create] if set, creates a new styleset and appends
     * it if not yet existing. Defaults to false.
     * @returns {GXStyleSet}
     */
    GXElement.Style.prototype.getStyle = function (create) {
        if (!this._styleSet) {
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof GXStyleSet) {
                    this._styleSet = child;
                    break;
                }
            }

            if (!this._styleSet && create) {
                this._styleSet = new GXStyleSet();
                this.insertChild(this._styleSet, this.getFirstChild(), true);
            }
        }

        return this._styleSet;
    };

    /**
     * Returns a collection of all styles of this element including the
     * ones of any parents recursively in the appropriate order.
     *
     * @returns {Array<GXStyleSet>} the array of styles or null for none
     */
    GXElement.Style.prototype.getStyles = function () {
        var result = null;

        for (var el = this; el !== null; el = el.getParent()) {
            if (el.hasMixin(GXElement.Style)) {
                var style = el.getStyle();

                if (style) {
                    if (!result) {
                        result = []
                    }
                    result.unshift(style);
                }
            }
        }

        return result;
    };

    /** @override */
    GXElement.Style.prototype.toString = function () {
        return "[Mixin GXElement.Style]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXElement
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type GRect
     * @private
     */
    GXElement.prototype._geometryBBbox = null;

    /**
     * @type GRect
     * @private
     */
    GXElement.prototype._paintBBox = null;

    /**
     * Called to get the geometry bbox which usually is the bbox of the underlying shape
     * @return {GRect} the geometry bbox, may never be null
     * @version 1.0
     */
    GXElement.prototype.getGeometryBBox = function () {
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
    GXElement.prototype.getChildrenGeometryBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(GXNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GXElement) {
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
    GXElement.prototype.getPaintBBox = function () {
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
    GXElement.prototype.getChildrenPaintBBox = function () {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return null;
        }

        if (this.hasMixin(GXNode.Container)) {
            var result = null;
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GXElement) {
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
    GXElement.prototype.isVisible = function () {
        return (this._flags & GXElement.Flag.Hidden) == 0;
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
     * @returns {Array<GXElement.HitResult>} either null for no hit or
     * a certain hit result depending on the element type
     */
    GXElement.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force) {
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
        if (level !== 0 && this.hasMixin(GXNode.Container)) {
            for (var child = this.getLastChild(); child != null; child = child.getPrevious()) {
                if (child instanceof GXElement) {
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
     * @param {GXVertexSource} area the area to get colissions within
     * @param {Number} flags one or more flags to use for collision testing
     * @return {Array<GXElement>} an array including all coliding elements
     * @see GXElement.CollisionFlag
     * @version 1.0
     */
    GXElement.prototype.getCollisions = function (area, flags) {
        var result = [];

        // Handle the basic collision modes here
        //if (this.hasFlag(GXElement.Flag.COLLISION)) {
        if ((flags & GXElement.CollisionFlag.GeometryBBox) != 0 || (flags & GXElement.CollisionFlag.PaintBBox) != 0) {

            // Test ourself, first
            var bbox = this.getPaintBBox();
            if (bbox && !bbox.isEmpty()) {
                // TODO : How to check bbox intersection with area vertex source including partial param?
                // --> area.intersects(..)

                var areaBounds = gVertexInfo.calculateBounds(area, true);

                if ((flags & GXElement.CollisionFlag.Partial) != 0) {
                    if (areaBounds.intersectsRect(bbox)) {
                        result.push(this);
                    }
                } else {
                    if (areaBounds.containsRect(bbox)) {
                        result.push(this);
                    }
                }
            }
        }
        //}

        // Test children now
        if (this.hasMixin(GXNode.Container)) {
            for (var child = this.getFirstChild(); child != null; child = child.getNext()) {
                if (child instanceof GXElement) {
                    var subResult = child.getCollisions(area, flags);
                    if (subResult && subResult.length) {
                        for (var i = 0; i < subResult.length; ++i) {
                            result.push(subResult[i]);
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
     * @version 1.0
     */
    GXElement.prototype.beginUpdate = function () {
        if (!this._updateCounter) {
            this._updateCounter = 1;
            this._notifyChange(GXElement._Change.PrepareGeometryUpdate);
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
     * @version 1.0
     */
    GXElement.prototype.endUpdate = function (noGeometryInvalidation) {
        if (this._updateCounter != null && --this._updateCounter == 0) {
            this._releaseUpdateChanges();
            this._notifyChange(GXElement._Change.FinishGeometryUpdate, noGeometryInvalidation ? false : true);
            delete this._updateCounter;
        }
    };

    /**
     * Called whenever this should paint itself
     * @param {GXPaintContext} context the context to be used for drawing
     * @version 1.0
     */
    GXElement.prototype.paint = function (context) {
        if (!this._preparePaint(context)) {
            return;
        }

        this._paintChildren(context);

        this._finishPaint(context);
    };

    /**
     * Function to check whether a node is actually paintable, this includes
     * for example checking for display flag, checking for dirty regions,
     * empty bounding box, visibility and more.
     * @param {GXPaintContext} [context] the current paint context, if null,
     * no check against a context will be made
     * @return {Boolean} true if the node is paintable, false if not
     * @private
     */
    GXElement.prototype.isPaintable = function (context) {
        // Immediately return if not visible at all
        if (!this.isVisible()) {
            return false;
        }

        // If there's no parent and we're not the document then
        // we're not paintable at all except if we've been provided
        // an explicit context which enforces us to paint
        if (!context && !this.getParent() && !(this instanceof GXScene)) {
            return false;
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
     * Called for preparing a paint
     * @param {GXPaintContext} context the current paint context
     * @return {Boolean} false if painting should be canceled, true otherwise
     * @private
     */
    GXElement.prototype._preparePaint = function (context) {
        if (this.isPaintable(context)) {
            return true;
        }

        // TODO : If print mode then set clipping to page

        return false;
    };

    /**
     * Called for finishing a paint
     * @param {GXPaintContext} context the current paint context
     * @private
     */
    GXElement.prototype._finishPaint = function (context) {
        // NO-OP

        // TODO : If print mode then remove clipping to page
    };

    /**
     * Called for painting all children if this element is a container
     * @param {GXPaintContext} context the current paint context
     * @private
     */
    GXElement.prototype._paintChildren = function (context) {
        // default paint handling if node is a container
        if (this.hasMixin(GXNode.Container)) {
            for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
                if (node instanceof GXElement) {
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
    GXElement.prototype._calculateGeometryBBox = function () {
        // Default action unites all children geometry bboxes if this is a container
        return this.getChildrenGeometryBBox();
    };

    /**
     * Called whenever the underlying paint bbox needs to be calculated
     * @return {GRect} the calculated paint bbox, may never be null
     * @private
     */
    GXElement.prototype._calculatePaintBBox = function () {
        // Default action unites all children paint bboxes if this is a container
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
     * @returns {GXElement.HitResult} either null for no hit or
     * a certain hit result depending on the element type
     */
    GXElement.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return null;
    };

    /**
     * Blocks all update changes like geometry update, invalidation etc.
     * @private
     */
    GXElement.prototype._blockUpdateChanges = function () {
        this._beginBlockChanges(
            GXElement._Change.InvalidationRequest,
            GXElement._Change.PrepareGeometryUpdate,
            GXElement._Change.FinishGeometryUpdate,
            GXElement._Change.ChildGeometryUpdate
        );
    };

    /**
     * Releases all update changes like geometry update, invalidation etc.
     * @private
     */
    GXElement.prototype._releaseUpdateChanges = function () {
        this._endBlockChanges(
            GXElement._Change.InvalidationRequest,
            GXElement._Change.PrepareGeometryUpdate,
            GXElement._Change.FinishGeometryUpdate,
            GXElement._Change.ChildGeometryUpdate
        );
    };

    /**
     * Called to to request a invalidation for a given node
     * @param {GXElement} node the node to request an invalidation for
     * @private
     */
    GXElement.prototype._requestInvalidateNode = function (node) {
        if (this.isAttached() && node.isPaintable()) {
            var repaintArea = node.getPaintBBox();
            if (repaintArea) {
                this._scene._invalidateArea(repaintArea);
            }
        }
    };

    /**
     * Called to request a invalidation for a given area
     * @param {GRect} area the area of invalidation
     * @private
     */
    GXElement.prototype._requestInvalidationArea = function (area) {
        if (this.isAttached()) {
            this._scene._invalidateArea(area);
        }
    };

    /**
     * Called to request an invalidation for this node
     * @private
     */
    GXElement.prototype._requestInvalidation = function () {
        this._requestInvalidateNode(this);
    };

    /**
     * Invalidate the geometry to enforce a re-calculation
     * @private
     */
    GXElement.prototype._invalidateGeometry = function () {
        this._geometryBBbox = null;
        this._paintBBox = null;
    };

    /** @override */
    GXElement.prototype._handleChange = function (change, args) {
        if (change == GXElement._Change.InvalidationRequest) {
            if (this.isPaintable()) {
                this._requestInvalidation();
            }
        } else if (change == GXElement._Change.PrepareGeometryUpdate) {
            if (this.isPaintable()) {
                var paintBBox = this.getPaintBBox();
                if (paintBBox && !paintBBox.isEmpty()) {
                    this._savedPaintBBox = paintBBox;
                }
            }

            if (this.isVisible()) {
                if (this.isAttached() && this._scene.hasEventListeners(GXElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GXElement.GeometryChangeEvent(this, GXElement.GeometryChangeEvent.Type.Before));
                }
            }
        } else if (change == GXElement._Change.FinishGeometryUpdate) {
            if (this.isVisible()) {
                // Avoid invalidation only of args is explicitely set to false
                if (!(false === args)) {
                    this._invalidateGeometry();
                }

                if (this.isPaintable()) {
                    var newPaintBBox = this.getPaintBBox();
                    if (!GRect.equals(newPaintBBox, this._savedPaintBBox)) {

                        // Deliver child geometry update to parent
                        if (this.getParent()) {
                            this.getParent()._notifyChange(GXElement._Change.ChildGeometryUpdate, this);
                        }

                        // Request repaint of old paint bbox if there was any
                        if (this._savedPaintBBox) {
                            this._requestInvalidationArea(this._savedPaintBBox);
                        }

                        // Request a repaint of our new geometry
                        this._handleChange(GXElement._Change.InvalidationRequest);
                    } else {
                        // Paintboxes are equal then do a simple invalidation request
                        this._requestInvalidation();
                    }
                }

                if (this.isAttached() && this._scene.hasEventListeners(GXElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GXElement.GeometryChangeEvent(this, GXElement.GeometryChangeEvent.Type.After));
                }

                if (this._savedPaintBBox) {
                    delete this._savedPaintBBox;
                }
            }
        } else if (change == GXElement._Change.ChildGeometryUpdate) {
            if (this.isVisible()) {
                this._invalidateGeometry();

                if (this.isAttached() && this._scene.hasEventListeners(GXElement.GeometryChangeEvent)) {
                    this._scene.trigger(new GXElement.GeometryChangeEvent(this, GXElement.GeometryChangeEvent.Type.Child));
                }

                // Forward to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(change, args);
                }
            }
        } else if (change == GXNode._Change.AfterChildInsert) {
            // If child is an element, notify about the change
            if (args instanceof GXElement) {
                this._notifyChange(GXElement._Change.ChildGeometryUpdate, args);
                args._handleChange(GXElement._Change.InvalidationRequest);
            }

            // Call super and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
        } else if (change == GXNode._Change.BeforeChildRemove) {

            // If child is an element, request repaint for it's area
            if (args instanceof GXElement) {
                this._requestInvalidateNode(args);
            }

            // Call super and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
        } else if (change == GXNode._Change.AfterChildRemove) {

            // If child is an element, notify about the change
            if (args instanceof GXElement) {
                this._notifyChange(GXElement._Change.ChildGeometryUpdate, args);
            }

            // Call super and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
        } else if (change == GXNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;

            // React on various known property changes
            if (propertyArgs.properties.indexOf('visible') >= 0) {
                var isVisible = this.getProperty('visible');

                // Save our old paint bbox if we're getting hidden
                var oldPaintBBox = !isVisible ? this.getPaintBBox() : null;

                // Change hidden flag of this and all elemental children and invalidate their geometry
                this.accept(function (node) {
                    if (node instanceof GXElement) {
                        if (isVisible) {
                            node.removeFlag(GXElement.Flag.Hidden);
                        } else {
                            node.setFlag(GXElement.Flag.Hidden);
                        }
                        node._invalidateGeometry();
                    }
                });

                // Deliver child geometry update to parent
                if (this.getParent()) {
                    this.getParent()._notifyChange(GXElement._Change.ChildGeometryUpdate, this);
                }

                // Request a repaint of either old paint bbox if getting hidden or from
                // the current paint bbox if getting visible
                if (isVisible) {
                    this._handleChange(GXElement._Change.InvalidationRequest);
                } else {
                    this._requestInvalidationArea(oldPaintBBox);
                }
            }

            // Call super and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
        } else {
            // Call super by default and be done with it
            GXNode.prototype._handleChange.call(this, change, args);
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
    GXElement.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        if (change == GXNode._Change.BeforePropertiesChange || change == GXNode._Change.AfterPropertiesChange) {
            if (gUtil.containsObjectKey(args.properties, properties)) {
                switch (change) {
                    case GXNode._Change.BeforePropertiesChange:
                        this._notifyChange(GXElement._Change.PrepareGeometryUpdate);
                        break;
                    case GXNode._Change.AfterPropertiesChange:
                        this._notifyChange(GXElement._Change.FinishGeometryUpdate);
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
    GXElement.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            if (gUtil.containsObjectKey(args.properties, properties)) {
                this._notifyChange(GXElement._Change.InvalidationRequest);
                return true;
            }
        }
        return false;
    };

    _.GXElement = GXElement;
})
    (this);