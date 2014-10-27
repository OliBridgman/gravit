(function () {
    gDevelopment.tests.push({
        title: 'Place SVG',
        test: function () {
            vex.dialog.prompt({
                message: 'Enter SVG String',
                callback: function (value) {
                    if (value) {
                        var doc = gApp.getActiveDocument();
                        var page = doc.getScene().getActivePage();
                        var editor = doc.getEditor();
                        GIO.read('test.svg', value, function (node) {
                            if (node) {
                                if (node instanceof GElement) {
                                    editor.insertElements([node], true, true);
                                } else {
                                    doc.getScene().getActiveLayer().appendChild(node);
                                }
                            }
                        }, {
                            baseWidth: page.getProperty('w'),
                            baseHeight: page.getProperty('h')
                        });
                    }
                }
            });
        }
    });
})();
