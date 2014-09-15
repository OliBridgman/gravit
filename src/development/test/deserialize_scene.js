(function () {
    gDevelopment.tests.push({
        title: 'Deserialize Scene',
        test: function () {
            var str = prompt('Enter JSON String');
            if (str && str !== '') {
                var blob = JSON.parse(str);
                var scene = IFNode.restore(blob);
                gApp.addDocument(scene, 'From-String');
            }
        }
    });
})();
