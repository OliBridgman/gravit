(function (_) {
    /**
     * An instance of an opened project
     * @class GProject
     * @extends GEventTarget
     * @constructor
     */
    function GProject(directory, name) {
        this._directory = directory;
        this._name = name;
        this._swatches = new GSwatches();
    };
    GObject.inherit(GProject, GEventTarget);

    /**
     * The underlying directory
     * @type {*}
     * @private
     */
    GProject.prototype._directory = null;

    /**
     * The name of the project
     * @type {String}
     * @private
     */
    GProject.prototype._name = null;

    /**
     * The swatches of the project
     * @type {GSwatches}
     * @private
     */
    GProject.prototype._swatches = null;

    /**
     * Returns the directory of the project
     * @returns {*}
     */
    GProject.prototype.getDirectory = function () {
        return this._directory;
    };

    /**
     * Returns the name for the project
     * @return {String}
     */
    GProject.prototype.getName = function () {
        return this._name;
    };

    /**
     * Returns the swatches for the project
     * @return {String}
     */
    GProject.prototype.getSwatches = function () {
        return this._swatches;
    };

    /**
     * Opens the project
     */
    GProject.prototype.open = function (done) {
        gHost.openDirectoryFile(this._directory, 'project.gravit', false, false, function (file) {
            alert('ready_to_read_project_file');
            this.syncSwatches(function () {
                if (done) {
                    done();
                }
            });
        }.bind(this));
    };

    GProject.prototype.syncSwatches = function (done) {
        gHost.openDirectoryFile(this._directory, 'swatches.gravit-swatches', false, false, function (file) {
            gHost.getFileContents(file, false, function (buffer) {
                var blob = JSON.parse(buffer);
                if (blob) {
                    GNode.restoreInstance(blob, this._swatches);

                    if (done) {
                        done();
                    }
                }
            }.bind(this));
        }.bind(this));
    };

    /**
     * Saves the project
     */
    GProject.prototype.save = function (done) {
        gHost.openDirectoryFile(this._directory, 'project.gravit', true, true, function (file) {
            alert('ready_to_write_project_file');
            gHost.putFileContents(file, JSON.stringify({
                test: 'bla',
                moreStuff: 123
            }), false, function () {
                gHost.openDirectoryFile(this._directory, 'swatches.gravit-swatches', true, true, function (file) {
                    /*
                     var input = GNode.serialize(this._scene);
                     var output = pako.gzip(input, {level: 9});
                     this._storage.save(this._url, output.buffer, true, function (name) {
                     this._title = name;
                     }.bind(this));
                     */
                    gHost.putFileContents(file, GNode.serialize(this._swatches), false, function () {
                        if (done) {
                            done();
                        }
                    });
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    /**
     * Called before this project gets activated
     */
    GProject.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called before this project gets deactivated
     */
    GProject.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this project gets released
     */
    GProject.prototype.release = function () {
        // NO-OP
    };

    _.GProject = GProject;
})(this);
