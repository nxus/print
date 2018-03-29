<style>#toc .h5 { color: #1184CE; font-weight: normal; text-transform: none; letter-spacing: 0; }</style>

[![Build Status](https://travis-ci.org/nxus/storage.svg?branch=master)](https://travis-ci.org/nxus/storage)

The nxus print module "prints" web pages to produce output files in PDF,
PNG or JPG format. It uses WebShot to perform the rendering into the
output format, which in turn uses PhantomJS.

### Configuration options

    ```
    "print": {
      "assetFolder": ".tmp/print" // local dir to write rendered output
    }
    ```

### Page wrapper for printing

To perform web page printing, you typically define a page wrapper with
settings to initialize the PhantomJS environment. The `bare` wrapper is
a good starting point. You may want to remove or hide interactive
features (such as flash messages or control buttons).

### Print media settings

PhantomJS applies a `@media print` setting when generating PDF output,
but not for other formats such as PNG.
(PhantomJS doesn't provide any ability to set this -- see
[PhantomJS Issue #10374](https://github.com/ariya/phantomjs/issues/10374)).

The print module provides a `phantomjs-setup` partial that simulates the
`@media print` setting in PhantomJS (by modifying the CSS to change
`@media print` selectors to `@media all`). If you've defined CSS
`@media print` rules to adjust the formatting of printed output, you can
include the `phantomjs-setup` partial in your page wrapper to ensure
those rules apply to the rendered output regardless of format.

If you've inherited CSS definitions that apply unwanted formatting or
remove desired formatting when `@media print` is selected, you may need
to make adjustments to those definitions.

Here's a simple page wrapper, based on the `bare` wrapper, that uses the
`phantomjs-setup` partial:
    ```
    <!DOCTYPE html>
    <html lang="en">
    <%- include('../partials/head.ejs') %>
    <%- render('phantomjs-setup') %>
    <body>
        <%- content %>
        <%- include('../partials/scripts.ejs') %>
    </body>
    </html>
    ```

### Deployment to Heroku

When deployed to Heroku, this module requires the PhantomJS Buildpack:
    ```
    https://github.com/stomita/heroku-buildpack-phantomjs.git
    ```
Add it to the list of Buildpacks on the application Settings panel.

It also requires the following configuration variables:

*   `nxus_baseUrl` - The host component of URLs for printable pages.
    It is typically the host component of the domain configured for the
    Heroku application. When a page is printed, the full URL for the
    page is formed by combining this host component with a protocol
    component and a root-relative path component.

The module detects when it is being run in the Heroku environment by
examining the `application.config.node_env` setting. If this is set to
`production`, it configures itself for Heroku, in particular setting the
path to the PhantomJS executable. (This should all "just work".)

### Debugging

Well, debugging WebShot and PhantomJS is a pain.

To get additional error information, it can be useful to set
`errorIfJSException` to true in the `webshot` options when calling
`renderPage()`. (Unfortunately, you can't leave this set in most cases,
because it's common for pages to generate "normal" JavaScript exceptions
that don't interfere with page rendering.)

There doesn't seem to be any way to detect when PhantomJS has detected
syntax errors in JavaScript on the page being rendered.

As of this writing, PhantomJS supports only the JavaScript ES5.1
standard, so ES6 featues (such as arrow functions, let and const) are
not supported.
