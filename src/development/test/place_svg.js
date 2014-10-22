(function () {
    gDevelopment.tests.push({
        title: 'Place SVG',
        test: function () {
            vex.dialog.prompt({
                message: 'Enter SVG String',
                callback: function (value) {
                    if (value) {
                        IFIO.read('test.svg', value, function (node) {
                            if (node) {
                                var doc = gApp.getActiveDocument();
                                doc.getScene().getActiveLayer().appendChild(node);
                            }
                        });
                    }
                }
            });
        }
    });
})();
