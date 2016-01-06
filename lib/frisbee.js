'use strict';

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.frisbee = mod.exports;
  }
})(this, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  function _typeof(obj) {
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
  }

  var fetch = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' ? window.fetch : global.fetch;
  if (!fetch) throw new Error('A global `fetch` method is required as either `window.fetch` ' + 'for browsers or `global.fetch` for node runtime environments. ' + 'Please add `require(\'isomorphic-fetch\')` before importing `frisbee`. ' + 'You may optionally `require(\'es6-promise\').polyfill()` before you ' + 'require `isomorphic-fetch` if you want to support older browsers.' + '\n\nFor more info: https://github.com/niftylettuce/frisbee#usage');
  var methods = ['get', 'head', 'post', 'put', 'del', 'options', 'patch'];

  var Frisbee = (function () {
    function Frisbee(opts) {
      var _this = this;

      _classCallCheck(this, Frisbee);

      this.opts = opts || {};
      if (!this.opts.baseURI) throw new Error('baseURI option is required');
      this.headers = _extends({}, opts.headers);
      if (this.opts.auth) this.auth(this.opts.auth);
      methods.forEach(function (method) {
        return _this[method] = _this._setup(method);
      });
    }

    _createClass(Frisbee, [{
      key: '_setup',
      value: function _setup(method) {
        var _this2 = this;

        return function (path) {
          var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
          var callback = arguments[2];
          if (typeof path !== 'string') throw new Error('`path` must be a string');

          if (typeof options === 'function') {
            callback = options;
            options = {};
          }

          if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object' || Array.isArray(options)) throw new Error('`options` must be an object');
          if (callback && typeof callback !== 'function') throw new Error('`callback` must be a function');

          var opts = _extends({
            headers: _extends({}, _this2.headers)
          }, options, {
            method: method === 'del' ? 'DELETE' : method.toUpperCase()
          });

          if (typeof opts.body === 'undefined' && opts.method === 'POST') opts.body = '';
          var response = undefined;
          var request = fetch(_this2.opts.baseURI + path, opts).then(function (res) {
            response = res;
            return res;
          }).then(function (res) {
            var body = undefined;

            if (!res.ok) {
              var err = new Error(res.statusText);

              try {
                body = JSON.parse(res._bodyInit);

                if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' && _typeof(body.error) === 'object') {
                  err = new Error(body.error.message);
                  if (body.error.stack) err.stack = body.error.stack;
                  if (body.error.code) err.code = body.error.code;
                  if (body.error.param) err.param = body.error.param;
                }
              } catch (e) {} finally {
                throw err;
              }
            }

            if (opts.headers['Content-Type'] !== 'application/json' && opts.headers['Accept'] !== 'application/json') {
              body = res.text();
            } else {
              try {
                body = res.json();
              } catch (err) {
                var message = 'Failed to parse JSON body: ' + err.message;

                if (callback) {
                  return callback(message);
                }

                throw new Error(message);
              }
            }

            return body;
          }).then(function (body) {
            return callback ? callback(null, response, body) : {
              response: response,
              body: body
            };
          }).catch(function (err) {
            if (!response || !response.statusText) {
              if (callback) return callback(err, response || null);
              throw err;
            }

            if (callback) return callback(err, response, response.statusText);
            throw new Error(err);
          });
          return callback ? _this2 : request;
        };
      }
    }, {
      key: 'auth',
      value: function auth(creds) {
        if (typeof creds === 'string') {
          var index = creds.indexOf(':');

          if (index !== -1) {
            creds = [creds.substr(0, index), creds.substr(index + 1)];
          }
        }

        if (!Array.isArray(creds)) creds = [].slice.call(arguments);

        switch (creds.length) {
          case 0:
            creds = ['', ''];
            break;

          case 1:
            creds.push('');
            break;

          case 2:
            break;

          default:
            throw new Error('auth option can only have two keys `[user, pass]`');
        }

        if (typeof creds[0] !== 'string') throw new Error('auth option `user` must be a string');
        if (typeof creds[1] !== 'string') throw new Error('auth option `pass` must be a string');
        if (!creds[0] && !creds[1]) delete this.headers.Authorization;else this.headers.Authorization = 'Basic ' + new Buffer(creds.join(':')).toString('base64');
        return this;
      }
    }]);

    return Frisbee;
  })();

  exports.default = Frisbee;
});