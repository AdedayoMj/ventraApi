/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/hono/dist/compose.js":
/*!*******************************************!*\
  !*** ./node_modules/hono/dist/compose.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compose = void 0;
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/hono/dist/context.js");
// Based on the code in the MIT licensed `koa-compose` package.
const compose = (middleware, onError, onNotFound) => {
    return async (context, next) => {
        let index = -1;
        return dispatch(0);
        async function dispatch(i) {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }
            let handler = middleware[i];
            index = i;
            if (i === middleware.length && next)
                handler = next;
            if (!handler) {
                if (context instanceof context_1.Context && context.finalized === false && onNotFound) {
                    context.res = onNotFound(context);
                }
                return Promise.resolve(context);
            }
            return Promise.resolve(handler(context, () => dispatch(i + 1)))
                .then(async (res) => {
                // If handler return Response like `return c.text('foo')`
                if (res && context instanceof context_1.Context) {
                    context.res = res;
                }
                return context;
            })
                .catch((err) => {
                if (context instanceof context_1.Context && onError) {
                    if (err instanceof Error) {
                        context.res = onError(err, context);
                    }
                    return context;
                }
                else {
                    throw err;
                }
            });
        }
    };
};
exports.compose = compose;


/***/ }),

/***/ "./node_modules/hono/dist/context.js":
/*!*******************************************!*\
  !*** ./node_modules/hono/dist/context.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = void 0;
const url_1 = __webpack_require__(/*! ./utils/url */ "./node_modules/hono/dist/utils/url.js");
class Context {
    constructor(req, env = undefined, event = undefined, notFoundHandler = () => new Response()) {
        this._status = 200;
        this._pretty = false;
        this._prettySpace = 2;
        this.req = req;
        if (env) {
            this.env = env;
        }
        this.event = event;
        this.notFoundHandler = notFoundHandler;
        this.finalized = false;
    }
    get res() {
        return (this._res || (this._res = new Response()));
    }
    set res(_res) {
        this._res = _res;
        this.finalized = true;
    }
    header(name, value) {
        this._headers || (this._headers = {});
        this._headers[name] = value;
        if (this.finalized) {
            this.res.headers.set(name, value);
        }
    }
    status(status) {
        this._status = status;
    }
    set(key, value) {
        this._map || (this._map = {});
        this._map[key] = value;
    }
    get(key) {
        if (!this._map) {
            return undefined;
        }
        return this._map[key];
    }
    pretty(prettyJSON, space = 2) {
        this._pretty = prettyJSON;
        this._prettySpace = space;
    }
    newResponse(data, status, headers = {}) {
        const _headers = { ...this._headers, ...headers };
        if (this._res) {
            this._res.headers.forEach((v, k) => {
                _headers[k] = v;
            });
        }
        return new Response(data, {
            status: status || this._status || 200,
            headers: _headers,
        });
    }
    body(data, status = this._status, headers = {}) {
        return this.newResponse(data, status, headers);
    }
    text(text, status = this._status, headers = {}) {
        headers['Content-Type'] || (headers['Content-Type'] = 'text/plain; charset=UTF-8');
        return this.body(text, status, headers);
    }
    json(object, status = this._status, headers = {}) {
        const body = this._pretty
            ? JSON.stringify(object, null, this._prettySpace)
            : JSON.stringify(object);
        headers['Content-Type'] || (headers['Content-Type'] = 'application/json; charset=UTF-8');
        return this.body(body, status, headers);
    }
    html(html, status = this._status, headers = {}) {
        headers['Content-Type'] || (headers['Content-Type'] = 'text/html; charset=UTF-8');
        return this.body(html, status, headers);
    }
    redirect(location, status = 302) {
        if (!(0, url_1.isAbsoluteURL)(location)) {
            const url = new URL(this.req.url);
            url.pathname = location;
            location = url.toString();
        }
        return this.newResponse(null, status, {
            Location: location,
        });
    }
    notFound() {
        return this.notFoundHandler(this);
    }
}
exports.Context = Context;


/***/ }),

/***/ "./node_modules/hono/dist/hono.js":
/*!****************************************!*\
  !*** ./node_modules/hono/dist/hono.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Hono = void 0;
const compose_1 = __webpack_require__(/*! ./compose */ "./node_modules/hono/dist/compose.js");
const context_1 = __webpack_require__(/*! ./context */ "./node_modules/hono/dist/context.js");
const request_1 = __webpack_require__(/*! ./request */ "./node_modules/hono/dist/request.js");
const router_1 = __webpack_require__(/*! ./router */ "./node_modules/hono/dist/router.js");
const trie_router_1 = __webpack_require__(/*! ./router/trie-router */ "./node_modules/hono/dist/router/trie-router/index.js"); // Default Router
const url_1 = __webpack_require__(/*! ./utils/url */ "./node_modules/hono/dist/utils/url.js");
const methods = ['get', 'post', 'put', 'delete', 'head', 'options', 'patch'];
function defineDynamicClass() {
    return class {
    };
}
class Hono extends defineDynamicClass() {
    constructor(init = {}) {
        super();
        this.router = new trie_router_1.TrieRouter();
        this.strict = true; // strict routing - default is true
        this._tempPath = '';
        this.path = '/';
        this.routes = [];
        this.notFoundHandler = (c) => {
            const message = '404 Not Found';
            return c.text(message, 404);
        };
        this.errorHandler = (err, c) => {
            console.error(`${err.stack || err.message}`);
            const message = 'Internal Server Error';
            return c.text(message, 500);
        };
        (0, request_1.extendRequestPrototype)(); // FIXME: should be executed at a better timing
        const allMethods = [...methods, router_1.METHOD_NAME_ALL_LOWERCASE];
        allMethods.map((method) => {
            this[method] = (args1, ...args) => {
                if (typeof args1 === 'string') {
                    this.path = args1;
                }
                else {
                    this.addRoute(method, this.path, args1);
                }
                args.map((handler) => {
                    if (typeof handler !== 'string') {
                        this.addRoute(method, this.path, handler);
                    }
                });
                return this;
            };
        });
        Object.assign(this, init);
    }
    route(path, app) {
        this._tempPath = path;
        if (app) {
            app.routes.map((r) => {
                this.addRoute(r.method, r.path, r.handler);
            });
            this._tempPath = '';
        }
        return this;
    }
    use(arg1, ...handlers) {
        if (typeof arg1 === 'string') {
            this.path = arg1;
        }
        else {
            handlers.unshift(arg1);
        }
        handlers.map((handler) => {
            this.addRoute(router_1.METHOD_NAME_ALL, this.path, handler);
        });
        return this;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    addRoute(method, path, handler) {
        method = method.toUpperCase();
        if (this._tempPath) {
            path = (0, url_1.mergePath)(this._tempPath, path);
        }
        this.router.add(method, path, handler);
        const r = { path: path, method: method, handler: handler };
        this.routes.push(r);
    }
    matchRoute(method, path) {
        return this.router.match(method, path);
    }
    async dispatch(request, event, env) {
        const path = (0, url_1.getPathFromURL)(request.url, this.strict);
        const method = request.method;
        const result = this.matchRoute(method, path);
        request.paramData = result?.params;
        const handlers = result ? result.handlers : [this.notFoundHandler];
        const c = new context_1.Context(request, env, event, this.notFoundHandler);
        const composed = (0, compose_1.compose)(handlers, this.errorHandler, this.notFoundHandler);
        let context;
        try {
            context = await composed(c);
        }
        catch (err) {
            if (err instanceof Error) {
                return this.errorHandler(err, c);
            }
            throw err;
        }
        return context.res;
    }
    async handleEvent(event) {
        return this.dispatch(event.request, event);
    }
    async fetch(request, env, event) {
        return this.dispatch(request, event, env);
    }
    request(input, requestInit) {
        const req = input instanceof Request ? input : new Request(input, requestInit);
        return this.dispatch(req);
    }
    fire() {
        addEventListener('fetch', (event) => {
            event.respondWith(this.handleEvent(event));
        });
    }
}
exports.Hono = Hono;


/***/ }),

/***/ "./node_modules/hono/dist/index.js":
/*!*****************************************!*\
  !*** ./node_modules/hono/dist/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./request.ts" /> Import "declare global" for the Request interface.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = exports.Hono = void 0;
var hono_1 = __webpack_require__(/*! ./hono */ "./node_modules/hono/dist/hono.js");
Object.defineProperty(exports, "Hono", ({ enumerable: true, get: function () { return hono_1.Hono; } }));
var context_1 = __webpack_require__(/*! ./context */ "./node_modules/hono/dist/context.js");
Object.defineProperty(exports, "Context", ({ enumerable: true, get: function () { return context_1.Context; } }));


/***/ }),

/***/ "./node_modules/hono/dist/middleware/body-parse/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/hono/dist/middleware/body-parse/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bodyParse = void 0;
const body_1 = __webpack_require__(/*! ../../utils/body */ "./node_modules/hono/dist/utils/body.js");
const bodyParse = () => {
    return async (ctx, next) => {
        ctx.req.parsedBody = await (0, body_1.parseBody)(ctx.req);
        await next();
    };
};
exports.bodyParse = bodyParse;


/***/ }),

/***/ "./node_modules/hono/dist/middleware/cors/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/hono/dist/middleware/cors/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cors = void 0;
const cors = (options) => {
    const defaults = {
        origin: '*',
        allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
        allowHeaders: [],
        exposeHeaders: [],
    };
    const opts = {
        ...defaults,
        ...options,
    };
    return async (c, next) => {
        await next();
        function set(key, value) {
            c.res.headers.append(key, value);
        }
        set('Access-Control-Allow-Origin', opts.origin);
        // Suppose the server sends a response with an Access-Control-Allow-Origin value with an explicit origin (rather than the "*" wildcard).
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
        if (opts.origin !== '*') {
            set('Vary', 'Origin');
        }
        if (opts.credentials) {
            set('Access-Control-Allow-Credentials', 'true');
        }
        if (opts.exposeHeaders?.length) {
            set('Access-Control-Expose-Headers', opts.exposeHeaders.join(','));
        }
        if (c.req.method === 'OPTIONS') {
            // Preflight
            if (opts.maxAge != null) {
                set('Access-Control-Max-Age', opts.maxAge.toString());
            }
            if (opts.allowMethods?.length) {
                set('Access-Control-Allow-Methods', opts.allowMethods.join(','));
            }
            let headers = opts.allowHeaders;
            if (!headers?.length) {
                const requestHeaders = c.req.headers.get('Access-Control-Request-Headers');
                if (requestHeaders) {
                    headers = requestHeaders.split(/\s*,\s*/);
                }
            }
            if (headers?.length) {
                set('Access-Control-Allow-Headers', headers.join(','));
                set('Vary', 'Access-Control-Request-Headers');
            }
            c.res.headers.delete('Content-Length');
            c.res.headers.delete('Content-Type');
            c.res = new Response(null, {
                headers: c.res.headers,
                status: 204,
                statusText: c.res.statusText,
            });
        }
    };
};
exports.cors = cors;


/***/ }),

/***/ "./node_modules/hono/dist/middleware/pretty-json/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/hono/dist/middleware/pretty-json/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prettyJSON = void 0;
const prettyJSON = (options = { space: 2 }) => {
    return async (c, next) => {
        const pretty = c.req.query('pretty') || c.req.query('pretty') === '' ? true : false;
        c.pretty(pretty, options.space);
        await next();
    };
};
exports.prettyJSON = prettyJSON;


/***/ }),

/***/ "./node_modules/hono/dist/request.js":
/*!*******************************************!*\
  !*** ./node_modules/hono/dist/request.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extendRequestPrototype = void 0;
function extendRequestPrototype() {
    if (!!Request.prototype.param) {
        // already extended
        return;
    }
    Request.prototype.param = function (key) {
        if (this.paramData) {
            if (key) {
                return this.paramData[key];
            }
            else {
                return this.paramData;
            }
        }
        return null;
    };
    Request.prototype.header = function (name) {
        if (name) {
            return this.headers.get(name);
        }
        else {
            const result = {};
            for (const [key, value] of this.headers) {
                result[key] = value;
            }
            return result;
        }
    };
    Request.prototype.query = function (key) {
        const url = new URL(this.url);
        if (key) {
            return url.searchParams.get(key);
        }
        else {
            const result = {};
            for (const key of url.searchParams.keys()) {
                result[key] = url.searchParams.get(key) || '';
            }
            return result;
        }
    };
    Request.prototype.queries = function (key) {
        const url = new URL(this.url);
        if (key) {
            return url.searchParams.getAll(key);
        }
        else {
            const result = {};
            for (const key of url.searchParams.keys()) {
                result[key] = url.searchParams.getAll(key);
            }
            return result;
        }
    };
}
exports.extendRequestPrototype = extendRequestPrototype;


/***/ }),

/***/ "./node_modules/hono/dist/router.js":
/*!******************************************!*\
  !*** ./node_modules/hono/dist/router.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METHOD_NAME_ALL_LOWERCASE = exports.METHOD_NAME_ALL = void 0;
exports.METHOD_NAME_ALL = 'ALL';
exports.METHOD_NAME_ALL_LOWERCASE = 'all';


/***/ }),

/***/ "./node_modules/hono/dist/router/trie-router/index.js":
/*!************************************************************!*\
  !*** ./node_modules/hono/dist/router/trie-router/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrieRouter = void 0;
var router_1 = __webpack_require__(/*! ./router */ "./node_modules/hono/dist/router/trie-router/router.js");
Object.defineProperty(exports, "TrieRouter", ({ enumerable: true, get: function () { return router_1.TrieRouter; } }));


/***/ }),

/***/ "./node_modules/hono/dist/router/trie-router/node.js":
/*!***********************************************************!*\
  !*** ./node_modules/hono/dist/router/trie-router/node.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Node = void 0;
const router_1 = __webpack_require__(/*! ../../router */ "./node_modules/hono/dist/router.js");
const url_1 = __webpack_require__(/*! ../../utils/url */ "./node_modules/hono/dist/utils/url.js");
function findParam(node, name) {
    for (let i = 0, len = node.patterns.length; i < len; i++) {
        if (typeof node.patterns[i] === 'object' && node.patterns[i][1] === name) {
            return true;
        }
    }
    const nodes = Object.values(node.children);
    for (let i = 0, len = nodes.length; i < len; i++) {
        if (findParam(nodes[i], name)) {
            return true;
        }
    }
    return false;
}
class Node {
    constructor(method, handler, children) {
        this.order = 0;
        this.children = children || {};
        this.methods = [];
        if (method && handler) {
            const m = {};
            m[method] = { handler: handler, score: 0, name: this.name };
            this.methods = [m];
        }
        this.patterns = [];
        this.handlerSetCache = {};
    }
    insert(method, path, handler) {
        this.name = `${method} ${path}`;
        this.order = ++this.order;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curNode = this;
        const parts = (0, url_1.splitPath)(path);
        const parentPatterns = [];
        const errorMessage = (name) => {
            return `Duplicate param name, use another name instead of '${name}' - ${method} ${path} <--- '${name}'`;
        };
        for (let i = 0, len = parts.length; i < len; i++) {
            const p = parts[i];
            if (Object.keys(curNode.children).includes(p)) {
                parentPatterns.push(...curNode.patterns);
                curNode = curNode.children[p];
                continue;
            }
            curNode.children[p] = new Node();
            const pattern = (0, url_1.getPattern)(p);
            if (pattern) {
                if (typeof pattern === 'object') {
                    for (let j = 0, len = parentPatterns.length; j < len; j++) {
                        if (typeof parentPatterns[j] === 'object' && parentPatterns[j][1] === pattern[1]) {
                            throw new Error(errorMessage(pattern[1]));
                        }
                    }
                    if (Object.values(curNode.children).some((n) => findParam(n, pattern[1]))) {
                        throw new Error(errorMessage(pattern[1]));
                    }
                }
                curNode.patterns.push(pattern);
                parentPatterns.push(...curNode.patterns);
            }
            parentPatterns.push(...curNode.patterns);
            curNode = curNode.children[p];
        }
        let score = 1;
        if (path === '*') {
            score = score + this.order * 0.01;
        }
        else {
            score = parts.length + this.order * 0.01;
        }
        if (!curNode.methods.length) {
            curNode.methods = [];
        }
        const m = {};
        const handlerSet = { handler: handler, name: this.name, score: score };
        m[method] = handlerSet;
        curNode.methods.push(m);
        return curNode;
    }
    getHandlerSets(node, method, wildcard) {
        var _a, _b;
        return ((_a = node.handlerSetCache)[_b = `${method}:${wildcard ? '1' : '0'}`] || (_a[_b] = (() => {
            const handlerSets = [];
            node.methods.map((m) => {
                const handlerSet = m[method] || m[router_1.METHOD_NAME_ALL];
                if (handlerSet !== undefined) {
                    const hs = { ...handlerSet };
                    if (wildcard) {
                        hs.score = handlerSet.score - 1;
                    }
                    handlerSets.push(hs);
                    return;
                }
            });
            return handlerSets;
        })()));
    }
    search(method, path) {
        const handlerSets = [];
        const params = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const curNode = this;
        let curNodes = [curNode];
        const parts = (0, url_1.splitPath)(path);
        for (let i = 0, len = parts.length; i < len; i++) {
            const part = parts[i];
            const isLast = i === len - 1;
            const tempNodes = [];
            for (let j = 0, len2 = curNodes.length; j < len2; j++) {
                const node = curNodes[j];
                for (let k = 0, len3 = node.patterns.length; k < len3; k++) {
                    const pattern = node.patterns[k];
                    // Wildcard
                    // '/hello/*/foo' => match /hello/bar/foo
                    if (pattern === '*') {
                        const astNode = node.children['*'];
                        if (astNode) {
                            handlerSets.push(...this.getHandlerSets(astNode, method));
                            tempNodes.push(astNode);
                        }
                        continue;
                    }
                    if (part === '')
                        continue;
                    // Named match
                    // `/posts/:id` => match /posts/123
                    const [key, name, matcher] = pattern;
                    if (matcher === true || (matcher instanceof RegExp && matcher.test(part))) {
                        if (typeof key === 'string') {
                            if (isLast === true) {
                                handlerSets.push(...this.getHandlerSets(node.children[key], method));
                            }
                            tempNodes.push(node.children[key]);
                        }
                        if (typeof name === 'string') {
                            params[name] = part;
                        }
                    }
                }
                const nextNode = node.children[part];
                if (nextNode) {
                    if (isLast === true) {
                        // '/hello/*' => match '/hello'
                        if (nextNode.children['*']) {
                            handlerSets.push(...this.getHandlerSets(nextNode.children['*'], method, true));
                        }
                        handlerSets.push(...this.getHandlerSets(nextNode, method));
                    }
                    tempNodes.push(nextNode);
                }
            }
            curNodes = tempNodes;
        }
        if (handlerSets.length <= 0)
            return null;
        const handlers = handlerSets
            .sort((a, b) => {
            return a.score - b.score;
        })
            .map((s) => {
            return s.handler;
        });
        return { handlers, params };
    }
}
exports.Node = Node;


/***/ }),

/***/ "./node_modules/hono/dist/router/trie-router/router.js":
/*!*************************************************************!*\
  !*** ./node_modules/hono/dist/router/trie-router/router.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrieRouter = void 0;
const node_1 = __webpack_require__(/*! ./node */ "./node_modules/hono/dist/router/trie-router/node.js");
class TrieRouter {
    constructor() {
        this.node = new node_1.Node();
    }
    add(method, path, handler) {
        this.node.insert(method, path, handler);
    }
    match(method, path) {
        return this.node.search(method, path);
    }
}
exports.TrieRouter = TrieRouter;


/***/ }),

/***/ "./node_modules/hono/dist/utils/body.js":
/*!**********************************************!*\
  !*** ./node_modules/hono/dist/utils/body.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseBody = void 0;
const parseBody = async (r) => {
    const contentType = r.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return await r.json();
    }
    else if (contentType.includes('application/text')) {
        return await r.text();
    }
    else if (contentType.startsWith('text')) {
        return await r.text();
    }
    else if (contentType.includes('form')) {
        const form = {};
        const data = [...(await r.formData())].reduce((acc, cur) => {
            acc[cur[0]] = cur[1];
            return acc;
        }, form);
        return data;
    }
    return r.arrayBuffer();
};
exports.parseBody = parseBody;


/***/ }),

/***/ "./node_modules/hono/dist/utils/url.js":
/*!*********************************************!*\
  !*** ./node_modules/hono/dist/utils/url.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mergePath = exports.isAbsoluteURL = exports.getPathFromURL = exports.getPattern = exports.splitPath = void 0;
const URL_REGEXP = /^https?:\/\/[a-zA-Z0-9\-\.:]+(\/?[^?#]*)/;
const splitPath = (path) => {
    const paths = path.split(/\//); // faster than path.split('/')
    if (paths[0] === '') {
        paths.shift();
    }
    return paths;
};
exports.splitPath = splitPath;
const patternCache = {};
const getPattern = (label) => {
    // *            => wildcard
    // :id{[0-9]+}  => ([0-9]+)
    // :id          => (.+)
    //const name = ''
    if (label === '*') {
        return '*';
    }
    const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match) {
        if (!patternCache[label]) {
            if (match[2]) {
                patternCache[label] = [label, match[1], new RegExp('^' + match[2] + '$')];
            }
            else {
                patternCache[label] = [label, match[1], true];
            }
        }
        return patternCache[label];
    }
    return null;
};
exports.getPattern = getPattern;
const getPathFromURL = (url, strict = true) => {
    const queryIndex = url.indexOf('?');
    const result = url.substring(url.indexOf('/', 8), queryIndex === -1 ? url.length : queryIndex);
    // if strict routing is false => `/hello/hey/` and `/hello/hey` are treated the same
    // default is true
    if (strict === false && result.endsWith('/')) {
        return result.slice(0, -1);
    }
    return result;
};
exports.getPathFromURL = getPathFromURL;
const isAbsoluteURL = (url) => {
    const match = url.match(URL_REGEXP);
    if (match) {
        return true;
    }
    return false;
};
exports.isAbsoluteURL = isAbsoluteURL;
const mergePath = (...paths) => {
    let p = '';
    let endsWithSlash = false;
    for (let path of paths) {
        /* ['/hey/','/say'] => ['/hey', '/say'] */
        if (p.endsWith('/')) {
            p = p.slice(0, -1);
            endsWithSlash = true;
        }
        /* ['/hey','say'] => ['/hey', '/say'] */
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        /* ['/hey/', '/'] => `/hey/` */
        if (path === '/' && endsWithSlash) {
            p = `${p}/`;
        }
        else if (path !== '/') {
            p = `${p}${path}`;
        }
        /* ['/', '/'] => `/` */
        if (path === '/' && p === '') {
            p = '/';
        }
    }
    return p;
};
exports.mergePath = mergePath;


/***/ }),

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.api = void 0;
const hono_1 = __webpack_require__(/*! hono */ "./node_modules/hono/dist/index.js");
const model = __importStar(__webpack_require__(/*! ./models/model */ "./src/models/model.ts"));
const body_parse_1 = __webpack_require__(/*! hono/body-parse */ "./node_modules/hono/dist/middleware/body-parse/index.js");
const cors_1 = __webpack_require__(/*! hono/cors */ "./node_modules/hono/dist/middleware/cors/index.js");
const api = new hono_1.Hono();
exports.api = api;
api.use('/products/*', (0, cors_1.cors)(), (0, body_parse_1.bodyParse)());
api.get('/', (c) => {
    return c.json({ message: 'Hello' });
});
api.get('/products', async (c) => {
    const products = await model.getProducts(c.env.VENTRATA);
    return c.json({ products: products, ok: true });
});
api.post('/products', async (c) => {
    const param = c.req.parsedBody;
    if (!param)
        return c.json({ error: "Field required", ok: false }, 422);
    const newPost = await model.createProduct(c.env.VENTRATA, param);
    if (!newPost) {
        return c.json({ error: 'Can not create new Product', ok: false }, 422);
    }
    return c.json({ post: newPost, ok: true }, 201);
});
api.get('/products/:id', async (c) => {
    const id = c.req.param('id');
    const post = await model.getProduct(c.env.VENTRATA, id);
    if (!post) {
        return c.json({ error: 'Not Found', ok: false }, 404);
    }
    return c.json({ post: post, ok: true });
});
api.put('/products/:id', async (c) => {
    const id = c.req.param('id');
    const post = await model.getProduct(c.env.VENTRATA, id);
    if (!post) {
        // 204 No Content
        return new Response(null, { status: 204 });
    }
    const param = c.req.parsedBody;
    const success = await model.updateProduct(c.env.VENTRATA, id, param);
    return c.json({ ok: success });
});
api.delete('/products/:id', async (c) => {
    const id = c.req.param('id');
    const post = await model.getProduct(c.env.VENTRATA, id);
    if (!post) {
        // 204 No Content
        return new Response(null, { status: 204 });
    }
    const success = await model.deletePost(c.env.VENTRATA, id);
    return c.json({ ok: success });
});


/***/ }),

/***/ "./src/models/model.ts":
/*!*****************************!*\
  !*** ./src/models/model.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deletePost = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const PREFIX = 'v1:post:';
const generateID = (key) => {
    return `${PREFIX}${key}`;
};
const getProducts = async (KV) => {
    const list = await KV.list({ prefix: PREFIX });
    const keys = list.keys;
    const products = [];
    const len = keys.length;
    for (let i = 0; i < len; i++) {
        const value = await KV.get(keys[i].name);
        if (value) {
            const product = JSON.parse(value);
            products.push(product);
        }
    }
    return products;
};
exports.getProducts = getProducts;
const getProduct = async (KV, id) => {
    const value = await KV.get(generateID(id));
    if (!value)
        return;
    const post = JSON.parse(value);
    return post;
};
exports.getProduct = getProduct;
const createProduct = async (KV, param) => {
    if (!(param && param.name && param.options && param.availableCurrencies && param.defaultCurrency))
        return;
    const id = crypto.randomUUID();
    const newPost = { id: id, name: param.name, options: param.options, defaultCurrency: param.defaultCurrency, availableCurrencies: param.availableCurrencies };
    await KV.put(generateID(id), JSON.stringify(newPost));
    return newPost;
};
exports.createProduct = createProduct;
const updateProduct = async (KV, id, param) => {
    if (!(param && param.name && param.options))
        return false;
    const post = await (0, exports.getProduct)(KV, id);
    if (!post)
        return false;
    post.name = param.name;
    post.options = param.options;
    await KV.put(generateID(id), JSON.stringify(post));
    return true;
};
exports.updateProduct = updateProduct;
const deletePost = async (KV, id) => {
    const post = await (0, exports.getProduct)(KV, id);
    if (!post)
        return false;
    await KV.delete(generateID(id));
    return true;
};
exports.deletePost = deletePost;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const hono_1 = __webpack_require__(/*! hono */ "./node_modules/hono/dist/index.js");
// import { basicAuth } from 'hono/basic-auth'
const pretty_json_1 = __webpack_require__(/*! hono/pretty-json */ "./node_modules/hono/dist/middleware/pretty-json/index.js");
const app_1 = __webpack_require__(/*! ./app */ "./src/app.ts");
const app = new hono_1.Hono();
app.get('/', (c) => c.text('Booking API'));
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));
const middleware = new hono_1.Hono();
middleware.use('*', (0, pretty_json_1.prettyJSON)());
middleware.use('/products/*', async (_c, next) => {
    await next();
});
app.route('/api', middleware);
app.route('/api', app_1.api);
exports["default"] = app;

})();

/******/ })()
;
//# sourceMappingURL=worker.js.map