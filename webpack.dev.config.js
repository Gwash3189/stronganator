module.exports = {
    entry: './src/stronganator.js',
    output: {
        path: './dist/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
    },
    {
        devtool: "#inline-source-map"
    }
};
