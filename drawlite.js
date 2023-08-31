/*
    drawlite.js - a lightweight yet powerful graphics library based on Processing and p5
    
    Credits:
        = PRNG is from https://github.com/davidbau/seedrandom under the MIT license (https://opensource.org/license/mit/)
        - Perlin Noise functionality is based on p5.js (https://github.com/processing/p5.js) and is available under the GNU Lesser General Public License (https://www.gnu.org/licenses/lgpl-3.0.en.html)
        - This project was heavily influenced by Processing.js (https://github.com/processing-js/processing-js) and small snippets of code were occasionally taken and modified from it
        - Color.RGBtoHSB and Color.HSBtoRGB algorithms from https://www.30secondsofcode.org/
        - All other code is written by Vexcess and is available under the MIT license (https://opensource.org/license/mit/)

    Processing.js is nearly 755 KB, outdated, and slow
    p5.js is better than Processing, but is a massive 3,695 KB
    Drawlite can do almost everything the former two can, but is a tiny 30 KB meaning your browser will download it over 123 times faster than p5!
    
    Some functionalities from Processing and p5 aren't implemented in Drawlite not because Drawlite is incomplete but rather because the functionalities were considered too niche and people probably wouldn't ever use them if added.
    
*/
var Drawlite = function (canvas, callback) {
    let D = {};

    const dummyCanvas = {
        width: 1,
        height: 1,
        getContext: ()=>({
            measureText: ()=>({})
        }),
        addEventListener: ()=>{}
    };

    if (typeof canvas !== "object") canvas = dummyCanvas;
    
    // Drawlite CONSTANTS
    const 
    PI = Math.PI,
    TWO_PI = PI * 2,
    EPSILON = 0.0000000000000001,
    CORNER = 0,
    CORNERS = 1,
    LEFT = 2,
    RIGHT = 3,
    TOP = 4,
    CENTER = 5,
    BOTTOM = 6,
    BASELINE = 7,
    RADIUS = 8,
    DEGREES = 9,
    RADIANS = 10,
    POINTS = 11,
    LINES = 12,
    TRIANGLES = 13,
    TRIANGLE_STRIP = 14,
    TRIANGLE_FAN = 15,
    QUADS = 16,
    QUAD_STRIP = 17,
    CLOSE = 18,
    ROUND = "round",
    SQUARE = "butt",
    PROJECT = "square",
    BEVEL = "bevel",
    MITER = "miter",
    RGB = 1,
    HSB = 2,
    NATIVE = 0;
    
    // LOCAL VARIABLE
    let curClrMode = RGB;
    
    // STATIC VARIABLE
    class Color {
        static fromInt(num) {
            return new Color(num & 255, num >> 8 & 255, num >> 16 & 255, num >> 24);
        }
        static fromHex(hex) {
            let bytes = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b).slice(1).match(/.{2}/g);
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] = parseInt(bytes[i], 16);
            }
            return new Color(bytes[0], bytes[1], bytes[2], bytes[3]);
        }
        static fromString(str) {
            let bytes = str.slice(str.indexOf("(")+1, str.length-1).split(",");
            return new Color(bytes[0], bytes[1], bytes[2], bytes[3]);
        }
        static RGBtoHSB(r, g, b) {
            // https://www.30secondsofcode.org/js/s/rgb-to-hsb
            r = r / 255;
            g = g / 255;
            b = b / 255;
            let v = Math.max(r, g, b),
            n = v - Math.min(r, g, b);
            let h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
            return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
        }
        static HSBtoRGB(h, s, b) {
            // https://www.30secondsofcode.org/js/s/hsb-to-rgb
            let f = (h, s, b, n) => {
                let k = (n + h / 60) % 6;
                return b * (1 - s * Math.max(0, Math.min(k, 4 - k, 1)));
            };
            s /= 100;
            b /= 100;
            return [f(h, s, b, 5) * 255 | 0, f(h, s, b, 3) * 255 | 0, f(h, s, b, 1) * 255 | 0];
        }
    
        r; g; b; a;
        constructor(r, g, b, a) {
            let t = this;
            if (curClrMode === RGB) {
                switch (undefined) {
                    case g:
                        t.r = r|0;
                        t.g = r|0;
                        t.b = r|0;
                        t.a = 255;
                        break;
                    case b:
                        t.r = r|0;
                        t.g = r|0;
                        t.b = r|0;
                        t.a = g|0;
                        break;
                    case a:
                        t.r = r|0;
                        t.g = g|0;
                        t.b = b|0;
                        t.a = 255;
                        break;
                    default:
                        t.r = r|0;
                        t.g = g|0;
                        t.b = b|0;
                        t.a = a|0;
                        break;
                }
            } else { // if (curClrMode === HSB)
                let c = Color.HSBtoRGB(r, g, b);
                t.r = c[0];
                t.g = c[1];
                t.b = c[2];
                t.a = a === undefined ? 255 : a|0;
            }
        }
        equals(c) {
            return this.r === c.r && this.g === c.g && this.b === c.b && this.a === c.a;
        }
        toInt() {
            return (this.a < 255 ? this.a : 0) << 24 | this.b << 16 | this.g << 8 | this.r;
        }
        toHex() {
            let hex = "#" + (1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1);
            if (this.a < 255) {
                let ah = (this.a|0).toString(16);
                hex += this.a|0 < 16 ? "0" + ah : ah;
            }
            return hex;
        }
        toString() {
            return this.a === 255 ? `rgb(${this.r|0},${this.g|0},${this.b|0})` : `rgba(${this.r|0},${this.g|0},${this.b|0},${this.a/255})`;
        }
        toHSB() {
            return Color.RGBtoHSB(this.r, this.g, this.b);
        }
    }

    class DLImage {
        #ctx;
        constructor(src) {
            this.width = src.width;
            this.height = src.height;
            this.imageData = src;
            this.sourceImage = document.createElement("canvas");

            this.sourceImage.width = this.width;
            this.sourceImage.height = this.height;
            this.#ctx = this.sourceImage.getContext("2d");
            
            if (src instanceof Image) {
                this.#ctx.drawImage(src, 0, 0, this.width, this.height);
            } else {
                this.#ctx.putImageData(src, 0, 0);
            }
        }
        updatePixels() {
            this.#ctx.putImageData(this.imageData, 0, 0);
        }
        mask(img) {
            let pixs = this.imageData.data,
                imgData = img instanceof DLImage ? img.imageData : img;

            if (imgData.width === this.width && imgData.height === this.height) {
                let shapePixs = imgData.data;
                for (var i = 3, len = pixs.length; i < len; i += 4) {
                    pixs[i] = shapePixs[i];
                }
            } else {
                throw "mask must have the same dimensions as image.";
            }
            
            this.updatePixels();
        }
    }

    let PERLIN_YWRAPB = 4,
        PERLIN_YWRAP = 1 << PERLIN_YWRAPB,
        PERLIN_ZWRAPB = 8,
        PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB,
        PERLIN_SIZE = 4095,
        scaled_cosine;
    {
        const cos = Math.cos;
        scaled_cosine = i => 0.5 * (1.0 - cos(i * Math.PI));
    }
    class PerlinNoise {
        #perlin;
        #perlin_octaves = 4;
        #perlin_amp_falloff = 0.5;
        seed;
        
        constructor(seed) {
            this.seed = seed ?? Math.random() << 2048;
            this.setSeed(this.seed);
        }
        
        setDetail(lod, falloff) {
            if (lod > 0) this.#perlin_octaves = lod;
            if (falloff > 0) this.#perlin_amp_falloff = falloff;
        }

        setSeed(seed) {
            this.seed = seed;

            const lcg = (() => {
                const m = 4294967296;
                const a = 1664525;
                const c = 1013904223;
                let seed, z;
                return {
                    setSeed(val) {
                        z = seed = (val == null ? Math.random() * m : val) >>> 0;
                    },
                    rand() {
                        z = (a * z + c) % m;
                        return z / m;
                    }
                };
            })();
        
            lcg.setSeed(seed);
            this.#perlin = new Array(PERLIN_SIZE + 1);
            for (let i = 0; i < PERLIN_SIZE + 1; i++) {
                this.#perlin[i] = lcg.rand();
            }
        }

        get(x, y = 0, z = 0) {        
            if (x < 0) x = -x;
            if (y < 0) y = -y;
            if (z < 0) z = -z;
        
            let xi = floor(x),
                yi = floor(y),
                zi = floor(z);
            let xf = x - xi;
            let yf = y - yi;
            let zf = z - zi;
            let rxf, ryf;
        
            let r = 0;
            let ampl = 0.5;
        
            let n1, n2, n3;

            let perlin = this.#perlin,
                perlin_octaves = this.#perlin_octaves,
                perlin_amp_falloff = this.#perlin_amp_falloff;
            for (let o = 0; o < perlin_octaves; o++) {
                let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
        
                rxf = scaled_cosine(xf);
                ryf = scaled_cosine(yf);
        
                n1 = perlin[of & PERLIN_SIZE];
                n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
                n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
                n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
                n1 += ryf * (n2 - n1);
        
                of += PERLIN_ZWRAP;
                n2 = perlin[of & PERLIN_SIZE];
                n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
                n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
                n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
                n2 += ryf * (n3 - n2);
        
                n1 += scaled_cosine(zf) * (n2 - n1);
        
                r += n1 * ampl;
                ampl *= perlin_amp_falloff;
                xi <<= 1;
                xf *= 2;
                yi <<= 1;
                yf *= 2;
                zi <<= 1;
                zf *= 2;
        
                if (xf >= 1.0) {
                    xi++;
                    xf--;
                }
                if (yf >= 1.0) {
                    yi++;
                    yf--;
                }
                if (zf >= 1.0) {
                    zi++;
                    zf--;
                }
            }
            return r;
        }
    }

    /*
        Copyright 2019 David Bau.
        
        Permission is hereby granted, free of charge, to any person obtaining
        a copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
        
        The above copyright notice and this permission notice shall be
        included in all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
        EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */
    const PRNG = (function(global, pool) {
        var width = 256, // each RC4 output is 0 <= x < 256
            chunks = 6, // at least six RC4 outputs for each double
            digits = 52, // there are 52 significant digits in a double
            rngname = 'random', // rngname: name for Math.random and Math.seedrandom
            startdenom = Math.pow(width, chunks),
            significance = Math.pow(2, digits),
            overflow = significance * 2,
            mask = width - 1,
            nodecrypto; // node.js crypto module, initialized at the bottom.
    
        function seedrandom(seed, options, callback) {
            var key = [];
            options = (options == true) ? {
                entropy: true
            } : (options || {});
    
            var shortseed = mixkey(flatten(
                options.entropy ? [seed, tostring(pool)] :
                (seed == null) ? autoseed() : seed, 3), key);
    
            var arc4 = new ARC4(key);
    
            var prng = function() {
                var n = arc4.g(chunks), // Start with a numerator n < 2 ^ 48
                    d = startdenom, //   and denominator d = 2 ^ 48.
                    x = 0; //   and no 'extra last byte'.
                while (n < significance) { // Fill up all significant digits by
                    n = (n + x) * width; //   shifting numerator and
                    d *= width; //   denominator and generating a
                    x = arc4.g(1); //   new least-significant-byte.
                }
                while (n >= overflow) { // To avoid rounding up, before adding
                    n /= 2; //   last byte, shift everything
                    d /= 2; //   right using integer math until
                    x >>>= 1; //   we have exactly the desired bits.
                }
                return (n + x) / d; // Form the number within [0, 1).
            };
    
            prng.int32 = function() {
                return arc4.g(4) | 0;
            }
            prng.quick = function() {
                return arc4.g(4) / 0x100000000;
            }
            prng.double = prng;
    
            // Mix the randomness into accumulated entropy.
            mixkey(tostring(arc4.S), pool);
    
            // Calling convention: what to return as a function of prng, seed, is_math.
            return (options.pass || callback || prng);
        }
        
        function ARC4(key) {
            var t, keylen = key.length,
                me = this,
                i = 0,
                j = me.i = me.j = 0,
                s = me.S = [];
    
            if (!keylen) {
                key = [keylen++];
            }
    
            while (i < width) {
                s[i] = i++;
            }
            for (i = 0; i < width; i++) {
                s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
                s[j] = t;
            }
    
            (me.g = function(count) {
                var t, r = 0,
                    i = me.i,
                    j = me.j,
                    s = me.S;
                while (count--) {
                    t = s[i = mask & (i + 1)];
                    r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
                }
                me.i = i;
                me.j = j;
                return r;
            })(width);
        }
    
        function copy(f, t) {
            t.i = f.i;
            t.j = f.j;
            t.S = f.S.slice();
            return t;
        };
    
        function flatten(obj, depth) {
            var result = [],
                typ = (typeof obj),
                prop;
            if (depth && typ == 'object') {
                for (prop in obj) {
                    try {
                        result.push(flatten(obj[prop], depth - 1));
                    } catch (e) {}
                }
            }
            return (result.length ? result : typ == 'string' ? obj : obj + '\0');
        }
    
        function mixkey(seed, key) {
            var stringseed = seed + '',
                smear, j = 0;
            while (j < stringseed.length) {
                key[mask & j] =
                    mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
            }
            return tostring(key);
        }
        
        function autoseed() {
            try {
                var out;
                if (nodecrypto && (out = nodecrypto.randomBytes)) {
                    // The use of 'out' to remember randomBytes makes tight minified code.
                    out = out(width);
                } else {
                    out = new Uint8Array(width);
                    (global.crypto || global.msCrypto).getRandomValues(out);
                }
                return tostring(out);
            } catch (e) {
                var browser = global.navigator,
                    plugins = browser && browser.plugins;
                return [+new Date, global, plugins, global.screen, tostring(pool)];
            }
        }
    
        function tostring(a) {
            return String.fromCharCode.apply(0, a);
        }
    
        mixkey(Math.random(), pool);
    
        return seedrandom;
    })(
        // global: `self` in browsers (including strict mode and web workers),
        // otherwise `this` in Node and other environments
        (typeof self !== 'undefined') ? self : this,
        [], // pool: entropy pool starts empty
    );

    // vec3
    let vec3;
    {
        const sqrt = Math.sqrt; // caching for faster lookup
        vec3 = function(x, y, z) {
            return {
                x: x,
                y: y,
                z: z ?? 0
            };
        };
        vec3.fromArr = arr => ({
            x: arr[0],
            y: arr[1],
            z: arr[2]
        });
        vec3.toArr = v => ([v.x, v.y, v.z]);
        vec3.clone = v => ({
            x: v.x,
            y: v.y,
            z: v.z
        });
        vec3.add = (v1, v2) => {
            return typeof v2 === 'number' ? {
                x: v1.x + v2,
                y: v1.y + v2,
                z: v1.z + v2
            } : {
                x: v1.x + v2.x,
                y: v1.y + v2.y,
                z: v1.z + v2.z
            };
        };
        vec3.sub = (v1, v2) => {
            return typeof v2 === 'number' ? {
                x: v1.x - v2,
                y: v1.y - v2,
                z: v1.z - v2
            } : {
                x: v1.x - v2.x,
                y: v1.y - v2.y,
                z: v1.z - v2.z
            };
        };
        vec3.mul = (v1, v2) => {
            return typeof v2 === 'number' ? {
                x: v1.x * v2,
                y: v1.y * v2,
                z: v1.z * v2
            } : {
                x: v1.x * v2.x,
                y: v1.y * v2.y,
                z: v1.z * v2.z
            };
        };
        vec3.div = (v1, v2) => {
            return typeof v2 === 'number' ? {
                x: v1.x / v2,
                y: v1.y / v2,
                z: v1.z / v2
            } : {
                x: v1.x / v2.x,
                y: v1.y / v2.y,
                z: v1.z / v2.z
            };
        };
        vec3.neg = v => ({
            x: -v.x,
            y: -v.y,
            z: -v.z
        });
        vec3.mag = v1 => {
            // benchmarks show that caching the values results in a 0.000008% performance boost
            let x = v1.x, y = v1.y, z = v1.z;
            return sqrt(x * x + y * y + z * z);
        };
        vec3.normalize = v1 => {
            let x = v1.x, y = v1.y, z = v1.z;
            let m = sqrt(x * x + y * y + z * z);
            return m > 0 ? {
                x: v1.x / m,
                y: v1.y / m,
                z: v1.z / m
            } : v1;
        };
        vec3.dot = (v1, v2) => (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
        vec3.cross = (v1, v2) => ({
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        });
    }
    
    // MORE LOCAL VARIABLES
    let 
    undef = undefined,
    drawIntervalId = 0,
    targetFPS = 60,
    FPS_Counter = 0,
    lastFPSCheck = Date.now(),
    curAngleMode = DEGREES,
    curRectMode = CORNER,
    curEllipseMode = CENTER,
    horTxtAlign = LEFT,
    verTxtAlign = CENTER,
    curFontName = "sans-serif",
    curFontSize = 12,
    curTxtAscent = 55,
    curTxtDescent = 2,
    curTxtLeading = 14,
    curStroke = new Color(0),
    curStrokeWeight = 1,
    curFill = new Color(255),
    shapePath = [],
    shapePathType = undef,
    VERTEX_NODE = 3,
    CURVE_VERTEX_NODE = 4,
    BEZIER_VERTEX_NODE = 5,
    SPLINE_VERTEX_NODE = 6,
    autoUpdate = false,
    updateDynamics = null,
    
    ctxMenuEnabled = false,
    curImgMode = CORNER,
    _splineTightness = 0,
    textLine = (str, x, y, align) => {
        let txtWidth = 0, xOffset = 0;
        
        // horizontal offset/alignment
        if (align === RIGHT || align === CENTER) {
            txtWidth = textWidth(str);
            xOffset = align === RIGHT ? -txtWidth : -txtWidth / 2; // if (align === CENTER)
        }

        ctx.fillText(str, x + xOffset, y);
    },
    calcFontString = (f, sz) => {
        let genericFonts = [
            "serif",
            "sans-serif",
            "monospace",
            "cursive",
            "fantasy",
            "system-ui",
            "ui-serif",
            "ui-sans-serif",
            "ui-monospace",
            "ui-rounded",
            "emoji",
            "math",
            "fangsong"
        ];
        
        if (genericFonts.includes(f)) {
            return `${sz}px ${f}`;
        } else {
            return `${sz}px "${f}", sans-serif`;
        }
    };
    
        
    // MORE STATIC VARIABLES
    let 
    ctx = canvas.getContext("2d"),
    
    size = (w, h) => {
        D.width = canvas.width = w;
        D.height = canvas.height = h;
        font(curFontName, curFontSize);
        D.imageData = ctx.getImageData(0, 0, D.width, D.height);
        if (updateDynamics !== null) updateDynamics();
    },
    
    angleMode = m => {
        curAngleMode = m;
    },
    
    noLoop = () => {
        clearInterval(drawIntervalId);
        cancelAnimationFrame(drawIntervalId);
    },
    
    loop = () => {
        if (targetFPS === NATIVE) {
            let updateFunc = () => {
                DrawliteUpdate();
                drawIntervalId = requestAnimationFrame(updateFunc);
            };
            drawIntervalId = requestAnimationFrame(updateFunc);
        } else {
            drawIntervalId = setInterval(DrawliteUpdate, 1000 / targetFPS);
        }
    },
    
    frameRate = r => {
        if (r === undef) return D.FPS;
        targetFPS = r;
        noLoop();
        loop();
    },
    
    min = Math.min,
    
    max = Math.max,
    
    floor = Math.floor,
    
    round = Math.round,
    
    ceil = Math.ceil,
    
    abs = Math.abs,
    
    constrain = (n, min, max) => n > max ? max : n < min ? min : n,
    
    sq = n => n**2,
    
    sqrt = Math.sqrt,
    
    pow = Math.pow,
    
    sin = a => Math.sin(curAngleMode === DEGREES ? a*PI/180 : a),
    
    cos = a => Math.cos(curAngleMode === DEGREES ? a*PI/180 : a),
    
    tan = a => Math.tan(curAngleMode === DEGREES ? a*PI/180 : a),
    
    asin = a => Math.asin(curAngleMode === DEGREES ? a*PI/180 : a),
    
    acos = a => Math.acos(curAngleMode === DEGREES ? a*PI/180 : a),
    
    atan = a => Math.atan(curAngleMode === DEGREES ? a*PI/180 : a),
    
    atan2 = (y, x) => curAngleMode === DEGREES ? Math.atan2(y, x)*180/PI : Math.atan2(y, x),
    
    log = Math.log,
    
    random = (a=1, b) => (
        b === undef ? Math.random() * a : a + Math.random() * (b - a)
    ),
    
    dist = (a, b, c, d, e, f) => e === undef ? sqrt((a - c) ** 2 + (b - d) ** 2) : sqrt((a - d) ** 2 + (b - e) ** 2 + (c - f) ** 2),
    
    map = (v, istart, istop, ostart, ostop) => ostart + (ostop - ostart) * ((v - istart) / (istop - istart)),
    
    lerp = (a, b, amt) => (b - a) * amt + a,
    
    radians = d => d*PI/180,
    
    degrees = r => r*180/PI,

    color = (r, g, b, a) => new Color(r, g, b, a),

    lerpColor = (c1, c2, amt) => new Color(
        lerp(c1.r, c2.r, amt),
        lerp(c1.g, c2.g, amt),
        lerp(c1.b, c2.b, amt),
        lerp(c1.a, c2.a, amt)
    ),
    
    fill = (r, g, b, a) => {
        if (typeof r === "object") {
            a = r.a;
            b = r.b;
            g = r.g;
            r = r.r;
        }
        curFill = typeof r !== "number" ? r : (g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a)));
    },
    
    stroke = (r, g, b, a) => {
        if (typeof r === "object") {
            a = r.a;
            b = r.b;
            g = r.g;
            r = r.r;
        }
        curStroke = typeof r !== "number" ? r : (g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a)));
    },
    
    strokeWeight = w => {
        curStrokeWeight = w;
        ctx.lineWidth = w;
    },

    strokeCap = m => {
        ctx.lineCap = m;
    },
    
    strokeJoin = m => {
        ctx.lineJoin = m;
    },
    
    noStroke = () => {
        curStroke = null;
    },
    
    noFill = () => {
        curFill = null;
    },
    
    beginShape = type => {
        shapePath = [];
        shapePathType = type;
    },
    
    vertex = (x, y) => {
        shapePath.push([VERTEX_NODE, [x, y]]);
    },
    
    curveVertex = (cx, cy, x, y) => {
        shapePath.push([CURVE_VERTEX_NODE, [cx, cy, x, y]]);
    },
    
    bezierVertex = (cx, cy, cX, cY, x, y) => {
        shapePath.push([BEZIER_VERTEX_NODE, [cx, cy, cX, cY, x, y]]);
    },
    
    bezierPoint = (a, b, c, d, t) => (
        (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d
    ),
    
    bezierTangent = (a, b, c, d, t) => (
        3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b)
    ),
    
    splineTightness = t => {
        _splineTightness = t;
    },
    
    splineVertex = (x, y) => {
        shapePath.push([SPLINE_VERTEX_NODE, [x, y]]);
    },
    
    splinePoint = (a, b, c, d, t) => (
        0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
    ),
    
    splineTangent = (a, b, c, d, t) => (
        0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t)
    ),
    
    lerpSpline = (pts, t) => {
        t = t % (pts.length - 3);
        let i = (t | 0);
        t = t - i;
        
        if (i === -1) {
            pts = [pts[i+1], pts[i+1], pts[i+2], pts[i+3]];
        } else if (i >= pts.length - 3) {
            pts = [pts[i], pts[i+1], pts[i+2], pts[i+2]];
        } else {
            pts = [pts[i], pts[i+1], pts[i+2], pts[i+3]];
        }
        
        return [
            splinePoint(pts[0][0], pts[1][0], pts[2][0], pts[3][0], t),
            splinePoint(pts[0][1], pts[1][1], pts[2][1], pts[3][1], t)
        ];
    },
    
    endShape = mode => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        let i;
        switch (shapePathType) {
            case undef:
                ctx.beginPath();
                let isSplineCurve = false;
                for (i = 0; i < shapePath.length; i++) {
                    if (shapePath[i][0] === SPLINE_VERTEX_NODE) {
                        isSplineCurve = true;
                        break;
                    }
                }
                if (isSplineCurve && shapePath.length > 3) {
                    // improved from Processing.js source
                    let s = 1 - _splineTightness;
                    ctx.moveTo(shapePath[1][1][0], shapePath[1][1][1]);
                    for (i = 1; i < shapePath.length - 2; i++) {
                        let cachedPrev = shapePath[i-1][1];
                        let cachedPt = shapePath[i][1];
                        let cachedNext = shapePath[i+1][1];
                        let cachedNextNext = shapePath[i+2][1];
                        ctx.bezierCurveTo(
                            cachedPt[0] + (s * cachedNext[0] - s * cachedPrev[0]) / 6,
                            cachedPt[1] + (s * cachedNext[1] - s * cachedPrev[1]) / 6,
                            cachedNext[0] + (s * cachedPt[0] - s * cachedNextNext[0]) / 6,
                            cachedNext[1] + (s * cachedPt[1] - s * cachedNextNext[1]) / 6,
                            cachedNext[0],
                            cachedNext[1]
                        );
                    }
                } else {
                    ctx.moveTo(...shapePath[0][1]);
                    for (i = 1; i < shapePath.length; i++) {
                        let node = shapePath[i];
                        switch (node[0]) {
                            case VERTEX_NODE:
                                ctx.lineTo(...node[1]);
                                break;
                            case CURVE_VERTEX_NODE:
                                ctx.quadraticCurveTo(...node[1]);
                                break;
                            case BEZIER_VERTEX_NODE:
                                ctx.bezierCurveTo(...node[1]);
                                break;
                        }
                    }
                }
                
                if (mode === CLOSE) ctx.closePath();
                
                curFill && ctx.fill();
                curStroke && ctx.stroke();
                break;
            case POINTS:
                for (i = 0; i < shapePath.length; i++) {
                    point(...shapePath[i][1]);
                }
                break;
            case LINES:
                for (i = 0; i < shapePath.length - 1; i += 2) {
                    let a = shapePath[i][1],
                        b = shapePath[i + 1][1];
                    line(a[0], a[1], b[0], b[1]);
                }
                break;
            case TRIANGLES:
                for (i = 0; i < shapePath.length - 2; i += 3) {
                    let a = shapePath[i][1],
                        b = shapePath[i + 1][1],
                        c = shapePath[i + 2][1];
                    triangle(a[0], a[1], b[0], b[1], c[0], c[1]);
                }
                break;
            case TRIANGLE_STRIP:
                for (i = 0; i < shapePath.length - 2; i++) {
                    let a = shapePath[i][1],
                        b = shapePath[i + 1][1],
                        c = shapePath[i + 2][1];
                    triangle(a[0], a[1], b[0], b[1], c[0], c[1]);
                }
                break;
            case TRIANGLE_FAN:
                for (i = 1; i < shapePath.length - 1; i++) {
                    let a = shapePath[0][1],
                        b = shapePath[i][1],
                        c = shapePath[i + 1][1];
                    triangle(a[0], a[1], b[0], b[1], c[0], c[1]);
                }
                break;
            case QUADS:
                for (i = 0; i < shapePath.length - 3; i += 4) {
                    let a = shapePath[i][1],
                        b = shapePath[i + 1][1],
                        c = shapePath[i + 2][1],
                        d = shapePath[i + 3][1];
                    quad(a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]);
                }
                break;
            case QUAD_STRIP:
                for (i = 0; i < shapePath.length - 3; i += 2) {
                    let a = shapePath[i][1],
                        b = shapePath[i + 1][1],
                        c = shapePath[i + 3][1],
                        d = shapePath[i + 2][1];
                    quad(a[0], a[1], b[0], b[1], c[0], c[1], d[0], d[1]);
                }
                break;
        }
    },
    
    spline = (a, b, c, d, e, f, g, h) => {
        beginShape();
        splineVertex(a, b);
        splineVertex(c, d);
        splineVertex(e, f);
        splineVertex(g, h);
        endShape();
    },
    
    snip = (x, y, w, h) => {
        if (x === undef) {
            x = 0;
            y = 0;
            w = D.width;
            h = D.height;
        } else if (w === undef) {
            w = 1;
            h = 1;
        }
        
        let snipImgData = ctx.getImageData(x, y, w, h);
        if (w === 1 && h === 1) {
            let d = snipImgData.data;
            return new Color(d[0], d[1], d[2], d[3]);
        }
        
        return new DLImage(snipImgData);
    },

    imageMode = mode => {
        curImgMode = mode;
    },
    
    image = (img, x, y, w, h) => {
        switch (curImgMode) {
            case CENTER:
                x -= w / 2;
                y -= h / 2;
                break;
            case CORNERS:
                w -= x;
                h -= y;
                break;
        }
        if (typeof img.sourceImage === "object") {
            img = img.sourceImage;
        } else if (typeof img.canvas === "object") {
            img = img.canvas;
        }
        if (w === undef) {
            ctx.drawImage(img, x, y);
        } else {
            ctx.drawImage(img, x, y, w, h);
        }
    },

    loadImage = (src, callback) => {
        let img = new Image();
        img.src = src;
        return new Promise(resolve => {
            img.onload = function () {
                let DLImg = new DLImage(img);
                if (callback) callback(DLImg);
                resolve(DLImg);
            };
        });
    },

    font = (f, sz = curFontSize) => {
        ctx.font = calcFontString(f, sz);
        curFontName = f;
        curFontSize = sz;
        curTxtLeading = sz * 1.2;
        curTxtAscent = ctx.measureText('|').actualBoundingBoxAscent;
        curTxtDescent = ctx.measureText('|').actualBoundingBoxDescent;
    },
    
    textSize = sz => {
        ctx.font = sz + 'px \"' + curFontName + '\", sans-serif';
        curFontSize = sz;
        curTxtLeading = sz * 1.2;
        curTxtAscent = ctx.measureText('|').actualBoundingBoxAscent;
        curTxtDescent = ctx.measureText('|').actualBoundingBoxDescent;
    },
    
    textAlign = (xAlign, yAlign) => {
        horTxtAlign = xAlign;
        verTxtAlign = yAlign ?? BASELINE;
    },
    
    textWidth = str => {
    	let width = 0, arr = str.split(/\r?\n/g);
    	for (var i = 0; i < arr.length; i++) {
    	    let w = ctx.measureText(arr[i]).width;
    	    if (w > width) width = w;
    	}
    	return width;
    },
    
    textAscent = () => curTxtAscent,
    
    textDescent = () => curTxtDescent,
    
    textLeading = n => {
        if (typeof n === "number")
            curTxtLeading = n;
        else
            return curTxtLeading;
    },
    
    text = (t, x, y, w, h) => {
        curFill && (ctx.fillStyle = curFill.toString());
        
        switch (t) {
            case null:
                t = "null";
                break;
            case undef:
                t = "undefined";
                break;
            default:
                t = t.toString();
                break;
        }
        
        let lines;        
        if (w !== undef) {
            lines = [];
            let words = t.split(" ");
            let i = 0;
            while (i < words.length) {
                let line = "";
                let j = i;
                while (textWidth(line + words[j]) < w && j < words.length) {
                    line += words[j++] + " ";
                }
                lines.push(line);
                i = j;
            }
        } else if (t.indexOf('\n') === -1) {
            lines = [t];
        } else {
            // handle both carriage returns and line feeds
            lines = t.split(/\r?\n/g);
        }
  
        let yOffset = 0;
        switch (verTxtAlign) {
            case TOP:
                yOffset = curTxtAscent + curTxtDescent;
                break;
            case CENTER:
                yOffset = curTxtAscent / 2 - (lines.length - 1) * curTxtLeading / 2;
                break;
            case BOTTOM:
                yOffset = -(curTxtDescent + (lines.length - 1) * curTxtLeading);
                break;
        }
  
        for (let i = 0, len = lines.length; i < len; ++i) {
            textLine(lines[i], x, y + yOffset, horTxtAlign);
            yOffset += curTxtLeading;
        }
    },
    
    background = (r, g, b, a) => {
        if (typeof r === "object") {
            a = r.a;
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (a !== undef) {
            ctx.clearRect(0, 0, D.width, D.height);
        }
        ctx.fillStyle = color(r, g, b, a).toString();
        ctx.fillRect(0, 0, D.width, D.height);
    },
    
    point = (x, y) => {
        curStroke && (ctx.fillStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.arc(x, y, curStrokeWeight / 2, 0, TWO_PI);
        
        curFill && ctx.fill();
    },

    line = (ax, ay, bx, by) => {
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        
        ctx.stroke();
    },
    
    rectMode = m => {
        curRectMode = m;
    },
    
    rect = (x, y, w, h, r1, r2, r3, r4) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        switch (curRectMode) {
            case CENTER:
                x -= w / 2;
                y -= h / 2;
                break;
            case CORNERS:
                w -= x;
                h -= y;
                break;
            case RADIUS:
                w *= 2;
                h *= 2;
                x -= w / 2;
                y -= h / 2;
                break;
        }
        
        if (r1 === undef) {
            curFill && ctx.fillRect(x, y, w, h);
            curStroke && ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        } else {
            ctx.beginPath();
            let corners;
            switch (undef) {
                case r2:
                    corners = [r1, r1, r1, r1];
                    break;
                case r3:
                    corners = [r1, r2, 0, 0];
                    break;
                case r4:
                    corners = [r1, r2, r3, 0];
                    break;
                default:
                    corners = [r1, r1, r1, r1];
                    break;
            }
            ctx.roundRect(x, y, w, h, corners);
            
            curFill && ctx.fill();
            curStroke && ctx.stroke();
        }
        
        
    },
    
    triangle = (x1, y1, x2, y2, x3, y3) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        
        curFill && ctx.fill();
        curStroke && ctx.stroke();
    },
    
    quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        
        curFill && ctx.fill();
        curStroke && ctx.stroke();
    },
    
    arc = (x, y, w, h, st, sp) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        w /= 2;
        h /= 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var i = st; i < sp; i++) {
            ctx.lineTo(x + cos(i) * w, y + sin(i) * h);
        }
        
        curFill && ctx.fill();
        
        
        ctx.beginPath();
        ctx.moveTo(x + cos(st) * w, y + sin(st) * h);
        for (var i = st; i < sp; i++) {
            ctx.lineTo(x + cos(i) * w, y + sin(i) * h);
        }
        
        curStroke && ctx.stroke();
    },
    
    circle = (x, y, d) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.arc(x, y, d / 2, 0, TWO_PI);
        curFill && ctx.fill();
        curStroke && ctx.stroke();
    },
    
    ellipseMode = m => {
        curEllipseMode = m;
    },
    
    ellipse = (x, y, w, h) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        
        switch (curEllipseMode) {
            case CENTER:
                ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TWO_PI);
                break;
            case RADIUS:
                ctx.ellipse(x, y, w, h, 0, 0, TWO_PI);
                break;
            case CORNER:
                w /= 2;
                h /= 2;
                ctx.ellipse(w + x, h + y, w, h, 0, 0, TWO_PI);
                break;
            case CORNERS:
                w = (w - x) / 2;
                h = (h - y) / 2;
                ctx.ellipse(w / 2 + x, h / 2 + y, w, h, 0, 0, TWO_PI);
                break;
            default: // defaults to CENTER
                ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TWO_PI);
                break;
        }
        
        
        curFill && ctx.fill();
        curStroke && ctx.stroke();
    },
    
    bezier = (a, b, c, d, e, f, g, h) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.moveTo(a, b);
        ctx.bezierCurveTo(c, d, e, f, g, h);
        curFill && ctx.fill();
        curStroke && ctx.stroke();
    },
    
    get = {},
    
    autoUpdateDynamics = a => {
        autoUpdate = a === false ? false : true;
        if (autoUpdate) {
            updateDynamics = () => {
                D.get.width = D.width;
                D.get.height = D.height;
                D.get.frameCount = D.frameCount;
                D.get.FPS = D.FPS;
                D.get.pmouseX = D.pmouseX;
                D.get.pmouseY = D.pmouseY;
                D.get.mouseX = D.mouseX;
                D.get.mouseY = D.mouseY;
                D.get.mouseIsPressed = D.mouseIsPressed;
                D.get.mouseButton = D.mouseButton;
                D.get.keyIsPressed = D.keyIsPressed;
                D.get.imageData = D.imageData;
                D.get.focused = D.focused;
            };
            updateDynamics();
        } else {
            updateDynamics = null;
            D.get.width = () => D.width;
            D.get.height = () => D.height;
            D.get.frameCount = () => D.frameCount;
            D.get.FPS = () => D.FPS;
            D.get.pmouseX = () => D.pmouseX;
            D.get.pmouseY = () => D.pmouseY;
            D.get.mouseX = () => D.mouseX;
            D.get.mouseY = () => D.mouseY;
            D.get.mouseIsPressed = () => D.mouseIsPressed;
            D.get.mouseButton = () => D.mouseButton;
            D.get.keyIsPressed = () => D.keyIsPressed;
            D.get.imageData = () => D.imageData;
            D.get.focused = () => D.focused;
        }
    },
    
    pushMatrix = () => {
        ctx.save();
    },
    
    popMatrix = () => {
        ctx.restore();
    },
    
    resetMatrix = () => {
        ctx.resetTransform();
    },
    
    scale = (w, h) => {
        if (h === undef) h = w;
        ctx.scale(w, h);
    },
    
    translate = (x, y) => {
        ctx.translate(x, y);
    },

    rotate = a => {
        if (curAngleMode === DEGREES) ctx.rotate(a*PI/180);
        if (curAngleMode === RADIANS) ctx.rotate(a);
    },    
    
    loadPixels = () => {
        D.imageData.data.set(ctx.getImageData(0, 0, D.width, D.height).data);
    },
    
    updatePixels = () => {
        ctx.putImageData(D.imageData, 0, 0);
    },
    
    colorMode = m => {
        curClrMode = m;
    },
    
    enableContextMenu = a => {
        canvas.oncontextmenu = a === false ? (e => e.preventDefault()) : (() => {});
    },
    
    millis = () => Date.now(),
    
    second = () => new Date().getSeconds(),
    
    minute = () => new Date().getMinutes(),
    
    hour = () => new Date().getHours(),
    
    day = () => new Date().getDate(),
    
    month = () => new Date().getMonth() + 1,
    
    year = () => new Date().getFullYear(),
    
    smooth = () => {
        ctx.imageSmoothingEnabled = true;
        canvas.style.setProperty("image-rendering", "optimizeQuality", "important");
    },
    
    nosmooth = () => {
        ctx.imageSmoothingEnabled = false;
        canvas.style.setProperty("image-rendering", "pixelated", "important");
    },

    createGraphics = (width, height, type) => {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return new Drawlite(canvas);
    };
    
    // Drawlite CONSTANTS
    Object.assign(D, {
        PI,
        TWO_PI,
        EPSILON,
        CORNER,
        CORNERS,
        LEFT,
        RIGHT,
        TOP,
        CENTER,
        BOTTOM,
        BASELINE,
        RADIUS,
        DEGREES,
        RADIANS,
        POINTS,
        LINES,
        TRIANGLES,
        TRIANGLE_STRIP,
        TRIANGLE_FAN,
        QUADS,
        QUAD_STRIP,
        CLOSE,
        ROUND,
        PROJECT,
        SQUARE,
        BEVEL,
        MITER,
        RGB,
        HSB,
        NATIVE
    });
    
    // STATIC VARIABLES
    Object.assign(D, {
        canvas,
        Color,
        PerlinNoise,
        PRNG,
        vec3,
        ctx,
        size,
        angleMode,
        noLoop,
        loop,
        frameRate,
        min,
        max,
        floor,
        round,
        ceil,
        abs,
        constrain,
        sq,
        sqrt,
        pow,
        sin,
        cos,
        tan,
        asin,
        acos,
        atan,
        atan2,
        log,
        random,
        dist,
        map,
        lerp,
        radians,
        degrees,
        color,
        lerpColor,
        fill,
        stroke,
        strokeWeight,
        strokeCap,
        strokeJoin,
        noStroke,
        noFill,
        beginShape,
        vertex,
        curveVertex,
        bezierVertex,
        bezierPoint,
        bezierTangent,
        splineTightness,
        splineVertex,
        splinePoint,
        splineTangent,
        lerpSpline,
        endShape,
        spline,
        snip,
        imageMode,
        image,
        loadImage,
        font,
        textSize,
        textAlign,
        textWidth,
        textAscent,
        textDescent,
        textLeading,
        text,
        background,
        point,
        line,
        rectMode,
        rect,
        triangle,
        quad,
        arc,
        circle,
        ellipseMode,
        ellipse,
        bezier,
        get,
        autoUpdateDynamics,
        pushMatrix,
        popMatrix,
        resetMatrix,
        scale,
        translate,
        rotate,
        loadPixels,
        updatePixels,
        colorMode,
        enableContextMenu,
        millis,
        second,
        minute,
        hour,
        day,
        month,
        year,
        smooth,
        nosmooth,
        createGraphics
    });
        
    // DYNAMIC VARIABLES
    Object.assign(D, {
        frameCount: 0,
        FPS: 0,
        pmouseX: 0,
        pmouseY: 0,
        mouseX: 0,
        mouseY: 0,
        mouseIsPressed: false,
        mouseButton: LEFT,
        keyIsPressed: false,
        width: canvas.width,
        height: canvas.height,
        focused: false,
        imageData: new ImageData(canvas.width, canvas.height)
    });
    
    D.getProperties = () => {
        let props = {
            dynamic: Object.keys(D.get)
        };
        props.static = Object.keys(D).filter(p => !props.dynamic.includes(p));
        return props;
    };
    
    enableContextMenu(false);
    autoUpdateDynamics();
    font(curFontName, curFontSize);

    function DrawliteUpdate () {
        if (typeof D.draw === "function") {
            try {
                D.draw();
            } catch (e) {
                throw e;
            } finally { // rare case where finally is useful
                D.frameCount++;
                FPS_Counter++;
                
                let time = Date.now();
                if (time - lastFPSCheck >= 1000) {
                    lastFPSCheck = time;
                    D.FPS = FPS_Counter;
                    FPS_Counter = 0;
                }
                
                if (updateDynamics !== null) updateDynamics();
            }
        }
    }
    
    drawIntervalId = setInterval(DrawliteUpdate, 1000 / targetFPS);

    // make canvas focusable
    canvas.setAttribute("tabindex", "-1");
    
    canvas.addEventListener("focus", () => {
        D.focused = true;
    });
    canvas.addEventListener("blur", () => {
        D.focused = false;
    });
    
    canvas.addEventListener("mousedown", e => {
        D.mouseButton = [LEFT, CENTER, RIGHT][e.which - 1];
        D.mouseIsPressed = true;
        if (D.mousePressed) D.mousePressed(e);
    });
    canvas.addEventListener("mouseup", e => {
        D.mouseIsPressed = false;
        if (D.mouseReleased) D.mouseReleased(e);
    });
    canvas.addEventListener("mousemove", e => {
        D.pmouseX = D.mouseX;
        D.pmouseY = D.mouseY;
        D.mouseX = e.clientX;
        D.mouseY = e.clientY;

        if (D.mouseMoved) D.mouseMoved(e);
        if (D.mouseIsPressed && D.mouseDragged) D.mouseDragged(e);
    });
    
    document.body.addEventListener("keydown", e => {
        if (e.target === canvas) e.preventDefault();
        D.keyIsPressed = true;
        if (D.keyPressed) D.keyPressed(e);
    });
    document.body.addEventListener("keyup", e => {
        if (e.target === canvas) e.preventDefault();
        D.keyIsPressed = false;
        if (D.keyReleased) D.keyReleased(e);
    });
    
    let ads = Drawlite.addons;
    for (let i = 0; i < ads.length; i++) {
        Object.assign(D, ads[i].static);
        if (typeof ads[i].methods === "object") {
            for (let meth in ads[i].methods) {
                D[meth] = (...args) => {
                    ads[i].methods[meth](D, ...args);
                };
            }
        }
    }

    if (callback) callback(D);
    
    Drawlite.instances.push(D);
    
    return D;
};
Drawlite.instances = [];
Drawlite.addons = [];
