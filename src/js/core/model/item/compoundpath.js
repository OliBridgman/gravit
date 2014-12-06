(function (_) {

    /**
     * A polygon shape
     * @class GCompoundPath
     * @extends GShape
     * @constructor
     */
    function GCompoundPath(evenOdd) {
        GShape.call(this);

        this._setDefaultProperties(GCompoundPath.VisualProperties);
        if (!!evenOdd) {
            this.$evenodd = evenOdd;
        }

        // Add paths
        this._paths = new GCompoundPath.Paths();
        this.appendChild(this._paths);
        this._paths._removalAllowed = false;
    }

    GNode.inherit("compoundpath", GCompoundPath, GShape);

    /**
     * The visual properties of a compound path with their default values
     */
    GCompoundPath.VisualProperties = {
        /** Even-Odd fill */
        evenodd: false
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GCompoundPath.Paths Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GCompoundPath.Paths
     * @extends GNode
     * @mixes GNode.Container
     * @constructor
     */
    GCompoundPath.Paths = function () {
    };
    GObject.inheritAndMix(GCompoundPath.Paths, GNode, [GNode.Container]);

    /**
     * Used to disallow paths removal
     * @type {Boolean}
     * @private
     */
    GCompoundPath.Paths.prototype._removalAllowed = false;

    /** @override */
    GCompoundPath.Paths.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GCompoundPath;
    };

    /** @override */
    GCompoundPath.Paths.prototype.validateRemoval = function () {
        return this._removalAllowed ? this._removalAllowed : false;
    };

    /**
     * Serializes all points into a stream array
     * @return {Array<*>}
     */
    GCompoundPath.Paths.prototype.serialize = function () {
        var stream = [];
        for (var pt = this.getFirstChild(); pt !== null; pt = pt.getNext()) {
            stream.push(GNode.serialize(pt));
        }
        return stream;
    };

    /**
     * Deserializes all points from a stream array
     * @param {Array<*>} stream
     */
    GCompoundPath.Paths.prototype.deserialize = function (stream) {
        for (var i = 0; i < stream.length; ++i) {
            //var pt = new GPath();
            var pt = GNode.deserialize(stream[i]);
            this.appendChild(pt);
        }
    };

    GCompoundPath.Paths.prototype._handleChange = function (change, args) {
        var compoundPath = this._parent;

        if (compoundPath) {
            switch (change) {
                case GNode._Change.BeforeChildRemove:
                case GNode._Change.BeforeChildInsert:
                    compoundPath._notifyChange(GElement._Change.PrepareGeometryUpdate);
                    break;

                case GNode._Change.AfterChildRemove:
                case GNode._Change.AfterChildInsert:
                    compoundPath.rewindVertices(0);
                    compoundPath._notifyChange(GElement._Change.FinishGeometryUpdate);
                    break;

                case GElement._Change.ChildGeometryUpdate:
                    compoundPath._notifyChange(GElement._Change.PrepareGeometryUpdate);
                    compoundPath.rewindVertices(0);
                    compoundPath._notifyChange(GElement._Change.FinishGeometryUpdate);
                    break;
            }
        }

        GNode.prototype._handleChange.call(this, change, args);
    };


    /** @override */
    GCompoundPath.Paths.prototype.toString = function () {
        return "[Object GCompoundPath.Paths]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GCompoundPath Class
    // -----------------------------------------------------------------------------------------------------------------

    GCompoundPath.prototype._paths = null;
    GCompoundPath.prototype._currentPath = null;

    /** @override */
    GCompoundPath.prototype.rewindVertices = function (index) {
        this._currentPath = this._paths.getFirstChild();
        if (index === 0 && this._currentPath) {
            for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                pt.rewindVertices(0);
            }
            return true;
        }

        return false;
    };

    /** @override */
    GCompoundPath.prototype.readVertex = function (vertex) {
        if (this._currentPath) {
            if (this._currentPath.readVertex(vertex)) {
                return true;
            } else {
                this._currentPath = this._currentPath.getNext();
                return this._currentPath && this._currentPath.readVertex(vertex);
            }
        }
        return false;
    };

    /**
     * Return the paths of the compound path
     * @returns {GCompoundPath.Paths}
     */
    GCompoundPath.prototype.getPaths = function () {
        return this._paths;
    };

    /** @override */
    GCompoundPath.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, GCompoundPath.VisualProperties);
        if (change == GNode._Change.AfterFlagChange) {
            var flagArgs = args;
            this._currentPath = this._paths.getFirstChild();
            if (flagArgs.set == true) {
                for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                    pt.setFlag(flagArgs.flag);
                }
            } else {
                for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                    pt.removeFlag(flagArgs.flag);
                }
            }
        }
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GCompoundPath.VisualProperties);
            args.paths = this._paths.serialize();
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GCompoundPath.VisualProperties);
            if (args.hasOwnProperty('paths')) {
                this._paths.deserialize(args.paths);
            }
        } else if (change === GNode._Change.ParentAttached || change === GNode._Change.ParentDetach) {
            if (this._paths) {
                this._paths._detachFromParent(this);
                if (change === GNode._Change.ParentAttached) {
                    this._paths._attachToParent(this);
                }
            }
        }

        GShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GCompoundPath.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
        for (var pt = this._paths.getFirstChild(); pt != null; pt = pt.getNext()) {
            pt.setTransform(transform);
        }
    };

    /** @override */
    GCompoundPath.prototype.transform = function (transform) {
        this.beginUpdate();
        try {
            GShape.prototype.transform.call(this, transform);
            if (transform && !transform.isIdentity()) {
                for (var pt = this._paths.getFirstChild(); pt != null; pt = pt.getNext()) {
                    pt.transform(transform);
                }
            }
        } finally {
            this.endUpdate();
        }
    };

    /** @override */
    GCompoundPath.prototype._calculateGeometryBBox = function () {
        // Sum up our pathes
        var result = null;
        for (var node = this._paths.getFirstChild(); node != null; node = node.getNext()) {
            var childBBox = node.getGeometryBBox();
            if (childBBox && !childBBox.isEmpty()) {
                result = result ? result.united(childBBox) : childBBox;
            }
        }
        return result ? result : null;
    };

    /** @override */
    GCompoundPath.prototype._isEvenOddFill = function () {
        return !!this.$evenodd;
    };

    /** @override */
    GCompoundPath.prototype.toString = function () {
        return "[GCompoundPath]";
    };

    _.GCompoundPath = GCompoundPath;
})(this);
