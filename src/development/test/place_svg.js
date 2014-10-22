(function () {
    gDevelopment.tests.push({
        title: 'Place SVG',
        test: function () {
            vex.dialog.prompt({
                message: 'Enter SVG String',
                callback: function (value) {
                    if (value) {
                        IFIO.read('test.svg', value, function (node) {
                            alert('RESULT: ' + node ? 'YES' : 'NO');
                        })
                        //var blob = JSON.parse(value);
                        //var scene = IFNode.restore(blob);
                        //gApp.addDocument(scene, 'From-String');
                    }
                }
            });
        }
    });
})();
