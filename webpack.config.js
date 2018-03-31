module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        path: require('path').resolve(__dirname, 'dist/frontend'),
        filename: 'geomodels.js',
        library: 'geomodels'
    }
};
