var generateRandomDataset = function(n, k) {
    dataset = [];
    for (var i = 0; i < n; i++) {
        dataset.push({ key: i, value: Math.floor(Math.random() * k) });
    }
    return dataset;
}