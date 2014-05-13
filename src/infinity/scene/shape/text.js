(function (_) {

    var _fontArray = null;

    var request = new XMLHttpRequest();
    request.open('get', '../bower_components/opentype/fonts/Arial.ttf', true);
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
        /** Formatted text */
        tx: "",
        /** Character spacing */
        cs: 0,
        /** Word spacing */
        ws: 0,
        /** Line spacing */
        ls: 0,
        /** Paragraph spacing */
        ps: 0,
        /** Use kerning or not */
        kr: true,


        /** Fixed width or not */
        fw: false,
        /** Fixed height or not */
        fh: false
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
            this.storeProperties(blob, GXText.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.restore = function (blob) {
        if (GXShape.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXText.GeometryProperties);
            this._verticesDirty = true;
            return true;
        }
        return false;
    };

    /** @override */
    GXText.prototype.rewindVertices = function (index) {
        if (this._verticesDirty || this._vertices == null || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();

            var box = GRect.fromPoints(new GPoint(-1, -1), new GPoint(1, 1));
            if (this.$trf) {
                box = this.$trf.mapRect(box);
            }

            //var __text = "Hello, World from Gravit :-)\nThis is just some test paragraphs to check whether everything works as expected!";
            //var __text = "In olden times when wishing still helped one, there lived a king whose daughters were all beautiful; and the youngest was so beautiful that the sun itself, which has seen so much, was astonished whenever it shone in her face. Close by the king's castle lay a great dark forest, and under an old lime-tree in the forest was a well, and when the day was very warm, the king's child went out to the forest and sat down by the fountain; and when she was bored she took a golden ball, and threw it up on high and caught it; and this ball was her favorite plaything."
            //var __text = "1\n2";

            var doc = new DOMParser().parseFromString(this.$tx, 'text/html');

            var __text = this.$tx ? this.$tx : "<No Text>";

            var __size = 14;


            var cv = document.createElement('canvas');
            var context = cv.getContext('2d');
            context.textBaseline = 'top';
            context.font = __size + "px Arial";

            var format = Typeset.formatter(function (str) {
                return context.measureText(str).width;
            });


            var paragraphs = __text.split('\n');

            var blocks = [];

            var lineLengths = [box.getWidth() > 1 ? box.getWidth() : -1];

            var y = box.getY();
            for (var p = 0; p < paragraphs.length; ++p) {
                var nodes = format['left'](paragraphs[p]);


                var tolerance = 1;
                //var breaks = Typeset.linebreak(nodes, lineLengths, {tolerance: tolerance});


                // Perform the line breaking
                var breaks = [];
                while (breaks.length === 0) {
                    breaks = Typeset.linebreak(nodes, lineLengths, {tolerance: tolerance++});
                }


                var i = 0, lines = [], point, j, r, lineStart = 0, maxLength = Math.max.apply(null, lineLengths);

                var center = false;

                // Iterate through the line breaks, and split the nodes at the
                // correct point.
                for (i = 1; i < breaks.length; i += 1) {
                    point = breaks[i].position,
                        r = breaks[i].ratio;

                    for (var j = lineStart; j < nodes.length; j += 1) {
                        // After a line break, we skip any nodes unless they are boxes or forced breaks.
                        if (nodes[j].type === 'box' || (nodes[j].type === 'penalty' && nodes[j].penalty === -Typeset.linebreak.infinity)) {
                            lineStart = j;
                            break;
                        }
                    }
                    lines.push({ratio: r, nodes: nodes.slice(lineStart, point + 1), position: point});
                    lineStart = point;
                }

                lines.forEach(function (line, lineIndex) {
                    var x = box.getX(), lineLength = lineIndex < lineLengths.length ? lineLengths[lineIndex] : lineLengths[lineLengths.length - 1];

                    if (center) {
                        var lineWidth = 0;

                        line.nodes.forEach(function (node, index, array) {
                            if (node.type === 'box') {
                                lineWidth += node.width;
                            } else if (node.type === 'glue') {
                                lineWidth += node.width;// + line.ratio * (line.ratio < 0 ? node.shrink : node.stretch);
                            } else if (node.type === 'penalty' && node.penalty === 100 && index === array.length - 1) {
                                lineWidth += 10; // ???
                            }
                        });

                        x += (maxLength - lineWidth) / 2;
                    }

                    line.nodes.forEach(function (node, index, array) {
                        if (node.type === 'box') {
                            //context.fillText(node.value, x, y);
                            blocks.push({
                                x: x,
                                y: y,
                                t: node.value
                            });
                            x += node.width;
                        } else if (node.type === 'glue') {
                            x += node.width + line.ratio * (line.ratio < 0 ? node.shrink : node.stretch);
                        } else if (node.type === 'penalty' && node.penalty === 100 && index === array.length - 1) {
                            //context.fillText('-', x, y);
                            blocks.push({
                                x: x,
                                y: y,
                                t: '-'
                            });
                        }
                    });

                    // move lower to draw the next line
                    y += __size;
                });

                //y += __size;
            }


            // TODO : FIX THIS
            var font = opentype.parse(_fontArray);
            if (!font.supported) {
                return callback('Font is not supported (is this a Postscript font?)');
            }


            //var ctx = document.getElementById('canvas').getContext('2d');
            // Construct a Path object containing the letter shapes of the given text.
            // The other parameters are x, y and fontSize.
            // Note that y is the position of the baseline.
            for (var b = 0; b < blocks.length; ++b) {
                var block = blocks[b];
                var path = font.getPath(block.t, block.x, block.y, __size);
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
            }

            this._verticesDirty = false;

            //this._verticesReader = this.$trf ? new GXVertexTransformer(this._vertices, this.$trf) : this._vertices;
            this._verticesReader = this._vertices;
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