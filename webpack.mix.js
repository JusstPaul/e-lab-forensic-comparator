const mix = require("laravel-mix");
const path = require("path");
const tailwindcss = require("tailwindcss");
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.alias({
    "@": path.resolve("resources/ts"),
})
    .react()
    .ts("resources/ts/App.tsx", "public/js/app.js")
    .sass("resources/sass/app.scss", "public/css")
    .webpackConfig({
        output: {
            chunkFilename: "js/[name].js?id=[chunkhash]",
        },
        module: {
            rules: [],
        },
    })
    .options({
        postCss: [tailwindcss("./tailwind.config.js")],
    });

if (mix.inProduction()) {
    mix.version();
}

mix.disableNotifications();
