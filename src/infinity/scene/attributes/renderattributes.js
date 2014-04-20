(function (_) {

    /**
     * A base attributes class that can be rendered
     * @class GXRenderAttributes
     * @extends GXAttributes
     * @constructor
     */
    function GXRenderAttributes() {
    }

    GObject.inherit(GXRenderAttributes, GXAttributes);

    // -----------------------------------------------------------------------------------------------------------------
    // GXRenderAttributes.Pattern Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin indicating support for pattern attributes. This is usually used
     * only on the root attributes to indicate support for patterns. Note that
     * this mixin requires the GXNode.Container mixin as well.
     *
     * @constructor
     * @class GXRenderAttributes.Pattern
     * @mixin
     */
    GXRenderAttributes.Pattern = function () {
    };

    /**
     * Get the color of the first fill pattern if any
     * @returns {GXColor}
     */
    GXRenderAttributes.Pattern.prototype.getFillColor = function () {
        return this._getFillColor(GXFillAttributes);
    };

    /**
     * Set the color of the first fill pattern if any,
     * automatically creating a new fill pattern if there's none
     * and automatically removing an fill if color is null
     * @param {GXColor} color
     */
    GXRenderAttributes.Pattern.prototype.setFillColor = function (color) {
        this._setFillColor(GXFillAttributes, color);
    };

    /**
     * Get the color of the first stroke pattern if any
     * @returns {GXColor}
     */
    GXRenderAttributes.Pattern.prototype.getStrokeColor = function () {
        return this._getFillColor(GXStrokeAttributes);
    };

    /**
     * Set the color of the first stroke pattern if any,
     * automatically creating a new stroke pattern if there's none
     * and automatically removing a stroke if color is null
     * @param {GXColor} color
     */
    GXRenderAttributes.Pattern.prototype.setStrokeColor = function (color) {
        return this._setFillColor(GXStrokeAttributes, color);
    };

    /**
     * @param {GXPatternAttributes} patternClass
     * @returns {GXColor}
     * @private
     */
    GXRenderAttributes.Pattern.prototype._getFillColor = function (patternClass) {
        var result = null;
        this.acceptChildren(function (node) {
            if (node.constructor == patternClass) {
                result = node.getColor();
                return false;
            }
        });

        return result;

        /*
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child.constructor == patternClass) {
                return child.getColor();
            }
        }
        return null;
        */
    };

    /**
     * @param {GXPatternAttributes} patternClass
     * @param {GXColor} color
     * @private
     */
    GXRenderAttributes.Pattern.prototype._setFillColor = function (patternClass, color) {
        if (this.acceptChildren(function (node) {
            if (node.constructor == patternClass) {
                // If there's no color, we'll remove instead
                if (!color) {
                    node.getParent().removeChild(node);
                } else {
                    node.setColor(color);
                }

                // return here as we're done
                return false;
            }
        }) === true) {
            if (color) {
                this.applySubAttrProperties(patternClass, ['val'], [color]);
            }
        }
/*
        return result;



        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child.constructor == patternClass) {
                // If there's no color, we'll remove instead
                if (!color) {
                    this.removeChild(child);
                } else {
                    child.setColor(color);
                }

                // return here as we're done
                return;
            }
        }

        // Coming here means nothing has happend and if we have a color,
        // we'll be assigning it now
        if (color) {
            this.applySubAttrProperties(patternClass, ['val'], [color]);
        }
        */
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXRenderAttributes.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A hit result on render attributes
     * @param {GXRenderAttributes} attributes the render attributes that had been hit
     * @param {*} args - other hit-test data
     * @constructor
     * @class GXRenderAttributes.HitResult
     */
    GXRenderAttributes.HitResult = function (attributes, args) {
        this.attributes = attributes;
        this.data = args;
    };

    /**
     * The attributes that had been hit
     * @type {GXRenderAttributes}
     */
    GXRenderAttributes.HitResult.prototype.attributes = null;

    /**
     * Additional hit-test data
     * @type {*}
     */
    GXRenderAttributes.HitResult.prototype.data = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GXRenderAttributes Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GXRenderAttributes.prototype.validateInsertion = function (parent, reference) {
        // Render attributes can be only appended to other render attributes
        return parent instanceof GXRenderAttributes;
    };

    /**
     * Called to render this attributes providing the painting
     * context and the vertex source used for painting and the bbox
     * @param {GXPaintContext} context the context used for painting
     * @parma {GXVertexSource} source the source vertices
     * @param {GRect} bbox the source geometry bbox
     */
    GXRenderAttributes.prototype.render = function (context, source, bbox) {
        // by default, simply render our children if we're a container
        if (this.hasMixin(GXNode.Container)) {
            this._renderChildren(context, source, bbox);
        }
    };

    /**
     * Returns the bounding box of the attributes
     * @param {GRect} source the source bbox
     * @returns {GRect}
     */
    GXRenderAttributes.prototype.getBBox = function (source) {
        // by default, either return children bbox for container or source
        if (this.hasMixin(GXNode.Container)) {
            return this._getChildrenBBox(source);
        } else {
            return source;
        }
    };

    /**
     * Called whenever a hit-test should be made on this attributes.
     * @parma {GXVertexSource} source the vertice source for the attributes
     * @param {GPoint} location the position to trigger the hit test at
     * in transformed view coordinates (see transform parameter)
     * @param {GTransform} transform the transformation of the scene
     * or null if there's none
     * @param {Number} tolerance a tolerance value for hit testing in view coordinates
     * @returns {GXRenderAttributes.HitResult} the attributes result or null for none
     */
    GXRenderAttributes.prototype.hitTest = function (source, location, transform, tolerance) {
        // by default, hit test children if this is a container
        if (this.hasMixin(GXNode.Container)) {
            return this._hitTestChildren(source, location, transform, tolerance);
        }
    };

    /** @private */
    GXRenderAttributes.prototype._renderChildren = function (context, source, bbox) {
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXRenderAttributes) {
                child.render(context, source, bbox);
            }
        }
    };

    /** @private */
    GXRenderAttributes.prototype._getChildrenBBox = function (source) {
        var result = source;
        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof GXRenderAttributes) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                }
            }
        }
        return result;
    };

    /** @private */
    GXRenderAttributes.prototype._hitTestChildren = function (source, location, transform, tolerance) {
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof GXRenderAttributes) {
                var result = child.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    /** @override */
    GXRenderAttributes.prototype._handleChange = function (change, args) {
        // Adding or removing render attributes need to notify parent
        if (change === GXNode._Change.BeforeChildInsert || change === GXNode._Change.BeforeChildRemove) {
            if (args instanceof GXRenderAttributes) {
                this._notifyOwnerElementChange(GXElement._Change.PrepareGeometryUpdate);
            }
        } else if (change === GXNode._Change.AfterChildInsert || change === GXNode._Change.AfterChildRemove) {
            if (args instanceof GXRenderAttributes) {
                this._notifyOwnerElementChange(GXElement._Change.FinishGeometryUpdate);
            }
        }

        // Call super by default and be done with it
        GXAttributes.prototype._handleChange.call(this, change, args);
    };

    /**
     * This will fire a change event for geometry updates on the owner element
     * whenever a given property has been changed that affected the geometry.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * geometrical changes
     * @return {Boolean} true if there was a property change that affected a
     * change of the geometry and was handled (false i.e. for no owner element)
     * @private
     */
    GXRenderAttributes.prototype._handleGeometryChangeForProperties = function (change, args, properties) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            return ownerElement._handleGeometryChangeForProperties(change, args, properties);
        }
        return false;
    };

    /**
     * This will fire an invalidation event for visual updates on the owner element
     * whenever a given property has been changed that affected the visual.
     * This is usually called from the _handleChange function.
     * @param {Number} change
     * @param {Object} args
     * @param {Object} properties a hashmap of properties that satisfy for
     * visual changes
     * @return {Boolean} true if there was a property change that affected a
     * visual change and was handled (false i.e. for no owner element)
     * @private
     */
    GXRenderAttributes.prototype._handleVisualChangeForProperties = function (change, args, properties) {
        var ownerElement = this.getOwnerElement();
        if (ownerElement) {
            return ownerElement._handleVisualChangeForProperties(change, args, properties);
        }
        return false;
    };

    /** @override */
    GXRenderAttributes.prototype.toString = function () {
        return "[GXRenderAttributes]";
    };

    _.GXRenderAttributes = GXRenderAttributes;
})(this);