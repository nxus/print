'use strict'

import {application, NxusModule} from 'nxus-core'
import {templater} from 'nxus-templater'

import mkdirp from 'mkdirp-promise'
import path from 'path'
import url from 'url'
import webshot from 'webshot'
import Promise from 'bluebird'

/** Module to print web pages to output files.
 */
class Print extends NxusModule {
  constructor() {
    super()

    templater.replace().templateDir(__dirname+'/partials')
  }

  _defaultConfig() {
    return {
      assetFolder: '.tmp/print',
    }
  }

  /** Renders a printable version of a web page.
   * @param {string} relativeUrl - root-relative URL of the page to be
   *   printed (the path and query string components, but not the
   *   protocol or host components)
   * @param {Object} options - rendering options:
   * *   `type` - rendered format, one of `pdf`, `png` or `jpg`
   *         (default `png`); also used as the file type of the rendered
   *         output file
   * *   `secure` - if true, use https
   * *   `webshot` - webshot settings (default renderDelay 5000,
   *         shotSize (width all, height all), phantomConfig
   *         (ssl-protocol any, ignore-ssl-errors true)).
   * @return {Promise} promise that resolves to the path to the rendered
   *     output file
   */
  renderPage(relativeUrl, options={}) {
    options = Object.assign({type: 'png'}, options)

    let urlObj = url.parse(relativeUrl, true)
    urlObj.protocol = options.secure ? 'https:' : 'http:'
    urlObj.host = application.config.baseUrl
    urlObj.query['print'] = 'true'
    let shotUrl = url.format(urlObj)

    let stamp = Date.now(),
        dstPath = path.resolve(this.config.assetFolder, stamp+'.'+options.type),
        dirPath = path.dirname(dstPath)

    let settings = {
          renderDelay: 15000,
          shotSize: {width: 'all', height: 'all'},
          phantomConfig: {'ssl-protocol': 'any', 'ignore-ssl-errors': 'true'}}
    if (application.config.node_env == 'production') settings.phantomPath = '/app/vendor/phantomjs/bin/phantomjs'
    settings = Object.assign(settings, options.webshot)

    return mkdirp(dirPath).then(() => {
      this.log.info('Rendering web page', shotUrl)
      return new Promise((resolve, reject) => {
        webshot(shotUrl, dstPath, settings, (err) => {
          if (err) { reject(err); return }
          resolve(dstPath)
        })
      })
    })
  }
}

let print = Print.getProxy()

export {Print as default, print}
