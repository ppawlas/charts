var generateRandomDatasetBasic = function(n, k) {

    dataset = [];
    for (var i = 0; i < n; i++) {
        dataset.push({ key: i, value: Math.floor(Math.random() * k) });
    }
    return dataset;
}

var generateRandomDataset = function() {
    dataset = [];
    var setSize = 10 + Math.floor(Math.random() * 10);
    var setMaxValue = Math.floor(Math.random() * 10000);
    for (var i = 0; i < setSize; i++) {
    	var keyLength = Math.floor(Math.random() * 7);
    	var currentKey = i + "_" + Math.random().toString(36).substring(3, keyLength);
    	var currentValue = Math.floor(Math.random() * setMaxValue);
        dataset.push({ key: currentKey, value: currentValue });
    }
    return dataset;
}