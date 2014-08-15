(function () {
    gDevelopment.tests.push({
        title: 'Deserialize Scene',
        test: function () {
            var str = prompt('Enter JSON String');
            if (str && str !== '') {
                var blob = JSON.parse(str);
                var scene = new IFScene();
                if (!scene.restore(blob)) {
                    throw new Error('Failure.');
                }

                gApp.addDocument(scene, 'From-String');
            }
        }
    });
})();
