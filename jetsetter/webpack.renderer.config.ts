import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
    test: /\.scss$/,
    use: [
        { loader: "style-loader" },
        { loader: "css-loader" },
        { loader: "sass-loader" },
    ],
});

rules.push({
    test: /\.pug$/,
    use: [
        { loader: "pug-loader" },
    ],
});

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".pug"],
    },
};
