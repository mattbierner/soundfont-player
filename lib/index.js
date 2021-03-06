'use strict'

var loadBank = require('./load-bank')
var oscillatorPlayer = require('./oscillator-player')
var buffersPlayer = require('./buffers-player')

/**
 * Create a Soundfont object
 *
 * @param {AudioContext} context - the [audio context](https://developer.mozilla.org/en/docs/Web/API/AudioContext)
 * @return {Soundfont} a soundfont object
 */
function Soundfont (ctx, nameToUrl) {
  if (!(this instanceof Soundfont)) return new Soundfont(ctx)

  this.nameToUrl = nameToUrl || Soundfont.nameToUrl || gleitzUrl
  this.ctx = ctx
  this.instruments = {}
  this.promises = []
}

Soundfont.prototype.instrument = function (name, options) {
  var ctx = this.ctx
  name = name || 'default'
  if (name in this.instruments) return this.instruments[name]
  var inst = { name: name, play: oscillatorPlayer(ctx, options) }
  this.instruments[name] = inst
  var promise = loadBank(ctx, this.nameToUrl(name)).then(function (buffers) {
    inst.play = buffersPlayer(ctx, buffers, options)
    return inst
  })
  this.promises.push(promise)
  inst.onready = function (cb) { promise.then(cb) }
  return inst
}

Soundfont.loadBuffers = function (ctx, name) {
  var nameToUrl = Soundfont.nameToUrl || gleitzUrl
  return loadBank(ctx, nameToUrl(name))
}

/*
 * Given an instrument name returns a URL to to the Benjamin Gleitzman's
 * package of [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts)
 *
 * @param {String} name - instrument name
 * @returns {String} the Soundfont file url
 */
function gleitzUrl (name) {
  return 'https://cdn.rawgit.com/gleitz/midi-js-Soundfonts/master/FluidR3_GM/' + name + '-ogg.js'
}

if (typeof module === 'object' && module.exports) module.exports = Soundfont
if (typeof window !== 'undefined') window.Soundfont = Soundfont
