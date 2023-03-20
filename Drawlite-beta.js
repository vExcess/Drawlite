/**
    Drawlite.js - a lightweight yet powerful graphics library based on Processing and p5
    
    Credits:
        - Perlin Noise functionality is from p5.js (https://github.com/processing/p5.js) and is available under the GNU Lesser General Public License (https://www.gnu.org/licenses/lgpl-3.0.en.html)
        - All other code is written Vexcess and is available under the MIT license (https://opensource.org/license/mit/)
        - This project was heavily based on Processing.js (https://github.com/processing-js/processing-js) and small snippets of code were occasionally taken and modified from it

    Processing.js is nearly 755 KB, outdated, and poorly coded resulted in inefficiency
    p5.js is better than Processing, but it is a whopping 3,695 KB
    Drawlite can do almost everything the former two can do, but it's only a tiny 30 KB meaning your browser will download it over 123 times faster than p5!!!
    
    Some functionalities from Processing and p5 aren't implemented in Drawlite. This isn't because Drawlite is incomplete but rather because the functionalities were considered to niche and people probably wouldn't ever use them if added.
    
**/
var Drawlite = function (canvas, callback) {
    let P = {};

    if (typeof canvas !== "object") throw "Must input a canvas for Drawlite to draw to";
    
    // Drawlite CONSTANTS
    const 
    PI = Math.PI,
    TWO_PI = PI * 2,
    EPSILON = 0.0000000000000001,
    CORNERS = 0,
    LEFT = 1,
    RIGHT = 2,
    TOP = 3,
    CENTER = 4,
    BOTTOM = 5,
    BASELINE = 6,
    DEGREES = 8,
    RADIANS = 9,
    POINTS = 10,
    LINES = 11,
    TRIANGLES = 12,
    TRIANGLE_STRIP = 13,
    TRIANGLE_FAN = 14,
    QUADS = 15,
    QUAD_STRIP = 16,
    CLOSE = 17,
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
            var bytes = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b).slice(1).match(/.{2}/g);
            for (var i = 0; i < bytes.length; i++) {
                bytes[i] = parseInt(bytes[i], 16);
            }
            return new Color(bytes[0], bytes[1], bytes[2], bytes[3]);
        }
        static fromString(str) {
            var bytes = str.slice(str.indexOf("(")+1, str.length-1).split(",");
            return new Color(bytes[0], bytes[1], bytes[2], bytes[3]);
        }
        static RGBtoHSB(r, g, b) {
            // https://www.30secondsofcode.org/js/s/rgb-to-hsb
            r = r / 255 | 0;
            g = g / 255 | 0;
            b = b / 255 | 0;
            var v = Math.max(r, g, b),
            n = v - Math.min(r, g, b);
            var h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
            return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
        }
        static HSBtoRGB(h, s, b) {
            // https://www.30secondsofcode.org/js/s/hsb-to-rgb
            var f = (h, s, b, n) => {
                var k = (n + h / 60) % 6;
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
            var hex = "#" + (1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1);
            if (this.a < 255) {
                var ah = (this.a|0).toString(16);
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
    
    // MORE LOCAL VARIABLES
    let 
    undef = undefined,
    drawIntervalId = 0,
    targetFPS = 60,
    FPS_Counter = 0,
    lastFPSCheck = Date.now(),
    curAngleMode = DEGREES,
    curRectMode = 0,
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
    PERLIN_YWRAPB = 4,
    PERLIN_YWRAP = 1 << PERLIN_YWRAPB,
    PERLIN_ZWRAPB = 8,
    PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB,
    PERLIN_SIZE = 4095,
    perlin_octaves = 4,
    perlin_amp_falloff = 0.5,
    scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI)),
    perlin,
    ctxMenuEnabled = false;
        
    // MORE STATIC VARIABLES
    let 
    ctx = canvas.getContext("2d"),
    
    size = (w, h) => {
        P.width = canvas.width = w;
        P.height = canvas.height = h;
        font(curFontName, curFontSize);
        P.imageData = ctx.getImageData(0, 0, P.width, P.height);
        if (updateDynamics !== null) updateDynamics();
    },
    
    angleMode = m => {
        curAngleMode = m;
    },
    
    noloop = () => {
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
        if (r === undef) return P.FPS;
        targetFPS = r;
        noloop();
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
    
    random = (a, b) => {
        if (a === undef) {
            return Math.random();
        } else if (b === undef) {
            return Math.random() * a;
        } else {
            return a + Math.random() * (b - a);
        }
    },
    
    dist = (a, b, c, d, e, f) => e === undef ? sqrt((a - c) ** 2 + (b - d) ** 2) : sqrt((a - d) ** 2 + (b - e) ** 2 + (c - f) ** 2),
    
    map = (v, istart, istop, ostart, ostop) => ostart + (ostop - ostart) * ((v - istart) / (istop - istart)),
    
    lerp = (a, b, amt) => (b - a) * amt + a,
    
    radians = d => d*PI/180,
    
    degrees = r => r*180/PI,
    
    color = (r, g, b, a) => new Color(r, g, b, a),
    
    fill = (r, g, b, a) => {
        curFill = typeof r !== "number" ? r : (g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a)));
    },
    
    stroke = (r, g, b, a) => {
        curStroke = typeof r !== "number" ? r : (g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a)));
    },
    
    strokeWeight = w => {
        curStrokeWeight = w;
        ctx.lineWidth = w;
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
    
    splineVertex = (x, y) => {
        shapePath.push([SPLINE_VERTEX_NODE, [x, y]]);
    },
    
    endShape = mode => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        let i;
        switch (shapePathType) {
            case undef:
                ctx.beginPath();
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
    
    snip = (x, y, w, h) => {
        if (x === undef) {
            x = 0;
            y = 0;
            w = P.width;
            h = P.height;
        } else if (w === undef) {
            w = 1;
            h = 1;
        }
        
        let snipImgData = ctx.getImageData(x, y, w, h);
        if (w === 1 && h === 1) {
            let d = snipImgData.data;
            return new Color(d[0], d[1], d[2], d[3]);
        }
        
        let snipCanv = document.createElement("canvas");
        let snipCtx = snipCanv.getContext("2d");
        snipCanv.width = w;
        snipCanv.height = h;
        snipCtx.putImageData(snipImgData, x, y);
        
        return {
            width: w,
            height: h,
            sourceImage: snipCanv,
            imageData: snipImgData,
            updatePixels: () => {
                snipCtx.putImageData(snipImgData, x, y);
            }
        };
    },
    
    image = (img, x, y, w, h) => {
        if (w === undef) {
            ctx.drawImage(img.sourceImage, x, y);
        } else {
            ctx.drawImage(img.sourceImage, x, y, w, h);
        }
    },

    font = (f, sz = curFontSize) => {
        ctx.font = sz + 'px \"' + f + '\", sans-serif';
        curFontName = f;
        curFontSize = sz;
        curTxtLeading = sz * 1.2;
        curTxtAscent = ctx.measureText('|').fontBoundingBoxAscent;
        curTxtDescent = ctx.measureText('|').fontBoundingBoxDescent;
    },
    
    textSize = sz => {
        ctx.font = sz + 'px \"' + curFontName + '\", sans-serif';
        curFontSize = sz;
        curTxtLeading = sz * 1.2;
        curTxtAscent = ctx.measureText('|').fontBoundingBoxAscent;
        curTxtDescent = ctx.measureText('|').fontBoundingBoxDescent;
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
        
        if (t === null) {
            t = "null";
        } else if (t === undefined) {
            t = "undefined";
        } else {
            t = t.toString();
        }
        
        function textLine (str, x, y, align) {
            let txtWidth = 0, xOffset = 0;
            
            // horizontal offset/alignment
            if (align === RIGHT || align === CENTER) {
                txtWidth = textWidth(str);
                
                if (align === RIGHT) {
                    xOffset = -txtWidth;
                } else { // if (align === CENTER)
                    xOffset = -txtWidth / 2;
                }
            }
  
            ctx.fillText(str, x + xOffset, y - 1);
        }
        
        // if (w === undef) {
            let lines, linesCount;
            if (t.indexOf('\n') < 0) {
                lines = [t];
                linesCount = 1;
            } else {
                // handle both carriage returns and line feeds
                lines = t.split(/\r?\n/g);
                linesCount = lines.length;
            }
      
            let yOffset = 0;
            if (verTxtAlign === TOP) {
                yOffset = curTxtAscent + curTxtDescent;
            } else if (verTxtAlign === CENTER) {
                yOffset = curTxtAscent / 2 - (linesCount - 1) * curTxtLeading / 2;
            } else if (verTxtAlign === BOTTOM) {
                yOffset = -(curTxtDescent + (linesCount - 1) * curTxtLeading);
            }
      
            for (let i = 0; i < linesCount; ++i) {
                var line = lines[i];
                textLine(line, x, y + yOffset, horTxtAlign);
                yOffset += curTxtLeading;
            }
        // } else {
        //     text$6(toP5String(t), x, y, w, h);
        // } 
        
    },
    
    background = (r, g, b, a) => {
        if (a !== undef) {
            ctx.clearRect(0, 0, P.width, P.height);
        }
        ctx.fillStyle = color(r, g, b, a).toString();
        ctx.fillRect(0, 0, P.width, P.height);
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
    
    rect = (x, y, w, h, r1, r2, r3, r4) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        if (r1 === undef) {
            curFill && ctx.fillRect(x, y, w, h);
            curStroke && ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        } else {
            ctx.beginPath();
            let corners = [r1];
            if (r3 === undef) {
                corners = [r1, r2, 0, 0];
            } else if (r4 === undef) {
                corners = [r1, r2, r3, 0];
            } else {
                corners = [r1, r2, r3, r4];
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
    
    ellipse = (x, y, w, h) => {
        curFill && (ctx.fillStyle = curFill.toString());
        curStroke && (ctx.strokeStyle = curStroke.toString());
        
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TWO_PI);
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
                P.get.width = P.width;
                P.get.height = P.height;
                P.get.frameCount = P.frameCount;
                P.get.FPS = P.FPS;
                P.get.pmouseX = P.pmouseX;
                P.get.pmouseY = P.pmouseY;
                P.get.mouseX = P.mouseX;
                P.get.mouseY = P.mouseY;
                P.get.mouseIsPressed = P.mouseIsPressed;
                P.get.mouseButton = P.mouseButton;
                P.get.keyIsPressed = P.keyIsPressed;
                P.get.keyCode = P.keyCode;
                P.get.imageData = P.imageData;
                P.get.focused = P.focused;
            };
            updateDynamics();
        } else {
            updateDynamics = null;
            P.get.width = () => P.width;
            P.get.height = () => P.height;
            P.get.frameCount = () => P.frameCount;
            P.get.FPS = () => P.FPS;
            P.get.pmouseX = () => P.pmouseX;
            P.get.pmouseY = () => P.pmouseY;
            P.get.mouseX = () => P.mouseX;
            P.get.mouseY = () => P.mouseY;
            P.get.mouseIsPressed = () => P.mouseIsPressed;
            P.get.mouseButton = () => P.mouseButton;
            P.get.keyIsPressed = () => P.keyIsPressed;
            P.get.keyCode = () => P.keyCode;
            P.get.imageData = () => P.imageData;
            P.get.focused = () => P.focused;
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

    noise = (x, y = 0, z = 0) => {
        if (perlin == null) {
            perlin = new Array(PERLIN_SIZE + 1);
            for (let i = 0; i < PERLIN_SIZE + 1; i++) {
                perlin[i] = Math.random();
            }
        }
    
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
    },
    
    noiseDetail = (lod, falloff) => {
        if (lod > 0) perlin_octaves = lod;
        if (falloff > 0) perlin_amp_falloff = falloff;
    },
    
    seedNoise = (seed) => {
        const lcg = (() => {
            const m = 4294967296;
            const a = 1664525;
            const c = 1013904223;
            let seed, z;
            return {
                setSeed(val) {
                    z = seed = (val == null ? Math.random() * m : val) >>> 0;
                },
                getSeed() {
                    return seed;
                },
                rand() {
                    z = (a * z + c) % m;
                    return z / m;
                }
            };
        })();
    
        lcg.setSeed(seed);
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = lcg.rand();
        }
    },
    
    loadPixels = () => {
        P.imageData.data.set(ctx.getImageData(0, 0, width, height).data);
    },
    
    updatePixels = () => {
        ctx.putImageData(P.imageData, 0, 0);
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
    };
    
    // Drawlite CONSTANTS
    Object.assign(P, {
        PI,
        TWO_PI,
        EPSILON,
        CORNERS,
        LEFT,
        RIGHT,
        TOP,
        CENTER,
        BOTTOM,
        BASELINE,
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
        RGB,
        HSB,
        NATIVE
    });
    
    // STATIC VARIABLES
    Object.assign(P, {
        canvas,
        Color,
        ctx,
        size,
        angleMode,
        noloop,
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
        fill,
        stroke,
        strokeWeight,
        noStroke,
        noFill,
        beginShape,
        vertex,
        curveVertex,
        bezierVertex,
        splineVertex,
        endShape,
        snip,
        image,
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
        rect,
        triangle,
        quad,
        arc,
        circle,
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
        noise,
        noiseDetail,
        seedNoise,
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
    });
        
    // DYNAMIC VARIABLES
    Object.assign(P, {
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
    
    enableContextMenu(false);
    autoUpdateDynamics(false);
    font(curFontName, curFontSize);

    function DrawliteUpdate () {
        if (P.draw) {
            P.draw();
            
            P.frameCount++;
            FPS_Counter++;
            
            let time = Date.now();
            if (time - lastFPSCheck >= 1000) {
                lastFPSCheck = time;
                P.FPS = FPS_Counter;
                FPS_Counter = 0;
            }
            
            if (updateDynamics !== null) updateDynamics();
        }
    }
    
    drawIntervalId = setInterval(DrawliteUpdate, 1000 / targetFPS);
    
    canvas.addEventListener("focus", () => {
        P.focused = true;
    });
    canvas.addEventListener("blur", () => {
        P.focused = false;
    });
    
    canvas.addEventListener("mousedown", e => {
        P.mouseButton = [LEFT, CENTER, RIGHT][e.which - 1];
        P.mouseIsPressed = true;
        if (P.mousePressed) P.mousePressed();
    });
    canvas.addEventListener("mouseup", e => {
        P.mouseIsPressed = false;
        if (P.mouseReleased) P.mouseReleased();
    });
    canvas.addEventListener("mousemove", e => {
        P.pmouseX = P.mouseX;
        P.pmouseY = P.mouseY;
        P.mouseX = e.clientX;
        P.mouseY = e.clientY;

        if (P.mouseMoved) P.mouseMoved(e);
        if (P.mouseIsPressed && P.mouseDragged) P.mouseDragged();
    });
    
    if (typeof document !== "undefined") {
        document.body.addEventListener("keydown", e => {
            e.preventDefault();
            P.keyIsPressed = true;
            if (P.keyPressed) P.keyPressed(e);
        });
        document.body.addEventListener("keyup", e => {
            P.keyIsPressed = false;
            if (P.keyReleased) P.keyReleased(e);
        });
    }

    if (callback) callback(P);
    
    return P;
};
