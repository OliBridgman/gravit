(function (_) {

    var _fontArray = null;

    var request = new XMLHttpRequest();
    request.open('get', '../bower_components/opentype/fonts/Roboto-Black.ttf', true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        if (request.status !== 200) {
            //return callback('Font could not be loaded: ' + request.statusText);
        }
        _fontArray = request.response;
    };
    request.send();


    /**
     * A text shape
     * @class GXText
     * @extends GXShape
     * @constructor
     */
    function GXText() {
        GXShape.call(this);
        this._vertices = new GXVertexContainer();
        this._verticesDirty = false;
    }

    GXNode.inherit("text", GXText, GXShape);

    /**
     * The geometry properties of text with their default values
     */
    GXText.GeometryProperties = {
        /** The start angle */
        sa: Math.PI,
        /** The end angle */
        ea: Math.PI,
        /** The ellipse-type */
        etp: GXEllipse.Type.Pie
    };

    /**
     * @type {GXVertexContainer}
     * @private
     */
    GXText.prototype._vertices = null;

    /**
     * @type {boolean}
     * @private
     */
    GXText.prototype._verticesDirty = false;

    /** @override */
    GXText.prototype.store = function (blob) {
        if (GXShape.prototype.store.call(this, blob)) {
            //this.storeProperties(blob, GXText.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.restore = function (blob) {
        if (GXShape.prototype.restore.call(this, blob)) {
            //this.restoreProperties(blob, GXText.GeometryProperties);
            this._verticesDirty = true;
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.rewindVertices = function (index) {
        if (this._verticesDirty || this._vertices == null || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();

            // Generate our text vertices now
            var font = opentype.parse(_fontArray);
            if (!font.supported) {
                return callback('Font is not supported (is this a Postscript font?)');
            }


            //var ctx = document.getElementById('canvas').getContext('2d');
            // Construct a Path object containing the letter shapes of the given text.
            // The other parameters are x, y and fontSize.
            // Note that y is the position of the baseline.
            var path = font.getPath('Hello, World from Gravit :-)', 0, 0, 36);
            // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).

            for (var i = 0; i < path.commands.length; i += 1) {
                var cmd = path.commands[i];
                if (cmd.type === 'M') {
                    this._vertices.addVertex(GXVertex.Command.Move, cmd.x, cmd.y);
                } else if (cmd.type === 'L') {
                    this._vertices.addVertex(GXVertex.Command.Line, cmd.x, cmd.y);
                } else if (cmd.type === 'C') {
                    this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x, cmd.y);
                    this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x1, cmd.y1);
                    this._vertices.addVertex(GXVertex.Command.Curve2, cmd.x2, cmd.y2);
                } else if (cmd.type === 'Q') {
                    this._vertices.addVertex(GXVertex.Command.Curve, cmd.x, cmd.y);
                    this._vertices.addVertex(GXVertex.Command.Curve, cmd.x1, cmd.y1);
                } else if (cmd.type === 'Z') {
                    this._vertices.addVertex(GXVertex.Command.Close);
                }
            }

            this._verticesDirty = false;

            this._verticesReader = this.$trf ? new GXVertexTransformer(this._vertices, this.$trf) : this._vertices;
        }
        return this._verticesReader.rewindVertices(index);
    };

    /** @override */
    GXText.prototype.readVertex = function (vertex) {
        return this._verticesReader.readVertex(vertex);
    };

    /** @override */
    GXText.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, GXText.GeometryProperties) && change == GXNode._Change.AfterPropertiesChange) {
            this._verticesDirty = true;
        }

        if (change === GXNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('trf') >= 0) {
                this._verticesDirty = true;
            }
        }

        GXShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXText.prototype.toString = function () {
        return "[GXText]";
    };

    _.GXText = GXText;
})(this);