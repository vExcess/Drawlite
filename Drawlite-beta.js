/**

    Drawlite.js - a lightweight yet powerful graphics library similiar to Processing and p5

    Big thanks to Processing.js and p5.js because I studied their source code to Drawlite.
    Perlin Noise functionality is from p5.js (https://github.com/processing/p5.js)
    All other code written by Vexcess
    Library is available under the MIT License
    
**/
var Drawlite = function (canvas, callback) {
    let P = {};

    canvas = canvas ?? {
        getContext: () => {},
        addEventListener: () => {}
    };
    
    // Drawlite CONSTANTS
    const PI = Math.PI,
        TWO_PI = PI * 2,
        EPSILON = 0.0000000000000001,
        CORNERS = 0,
        LEFT = 1,
        RIGHT = 2,
        TOP = 3,
        CENTER = 4,
        BOTTOM = 5,
        BASELINE = 6,
        RADIUS = 7,
        DEGREES = 8,
        RADIANS = 9,
        POINTS = 10,
        LINES = 11,
        TRIANGLES = 12,
        TRIANGLE_STRIP = 13,
        TRIANGLE_FAN = 14,
        QUADS = 15,
        QUAD_STRIP = 16,
        CLOSE = 17;
    
    // LOCAL VARIABLES
    let undef = undefined,
        updateInterval = null,
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
        curStroke = [0, 0, 0],
        curStrokeWeight = 1,
        curFill = [255, 255, 255],
        shapePath = [],
        shapePathType = undef,
        VERTEX_NODE = 3,
        CURVE_VERTEX_NODE = 4,
        BEZIER_VERTEX_NODE = 5,
        clrToStr = c => (
            c[3] === undef ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`
        ),
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
        perlin;
    
    // STATIC VARIABLES
    let ctx = canvas.getContext("2d"),
        
        size = (w, h) => {
            P.width = canvas.width = w;
            P.height = canvas.height = h;
            font(curFontName, curFontSize);
        },
        
        angleMode = m => (curAngleMode = m),
        frameRate = r => {
            if (!r) return P.FPS;
            clearInterval(updateInterval);
            targetFPS = r;
            updateInterval = setInterval(DrawliteUpdate, 1000 / targetFPS);
        },
        
        min = Math.min,
        max = Math.max,
        floor = Math.floor,
        abs = Math.abs,
        round = Math.round,
        constrain = (n, min, max) => (n > max ? max : n < min ? min : n),
        sqrt = Math.sqrt,
        sin = a => {
            if (curAngleMode === DEGREES) return Math.sin(a / 180 * PI);
            if (curAngleMode === RADIANS) return Math.sin(a);
        },
        cos = a => {
            if (curAngleMode === DEGREES) return Math.cos(a / 180 * PI);
            if (curAngleMode === RADIANS) return Math.cos(a);
        },
        random = (a, b) => {
            if (a === undef) {
                return Math.random();
            } else if (b === undef) {
                return Math.random() * a;
            } else {
                return a + Math.random() * (b - a);
            }
        },
        dist = (a, b, c, d, e, f) => (
            e === undef ? sqrt((a - c) ** 2 + (b - d) ** 2) : sqrt((a - d) ** 2 + (b - e) ** 2 + (c - f) ** 2)
        ),
        map = (v, istart, istop, ostart, ostop) => (
            ostart + (ostop - ostart) * ((v - istart) / (istop - istart))
        ),
        radians = d => (d * PI / 180),
        degrees = r => (r * 180 / PI),
        
        color = (r, g, b, a) => {
            switch (undef) {
                case g: return [r, r, r];
                case b: return [r, r, r, g];
                case a: return [r, g, b];
            }
            return [r, g, b, a];
        },
        
        fill = (r, g, b, a) => {
            curFill = g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a));
        },
        
        stroke = (r, g, b, a) => {
            curStroke = g === undef ? color(r, r, r) : (b === undef ? color(r, r, r, g) : color(r, g, b, a));
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
        endShape = mode => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
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
            let snipImgData = ctx.getImageData(x, y, w, h);
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

        font = (f, sz) => {
            ctx.font = sz + "px " + f;
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
        }
        
        textAscent = () => ctx.measureText('|').fontBoundingBoxAscent * 0.78,
        
        textDescent = () => ctx.measureText('|').fontBoundingBoxDescent,
        
        textLeading = () => curTxtLeading,
        
        textWidth = str => ctx.measureText(str).width,
        
        text = (t, x, y, w, h) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            
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
                        xOffset = -txtWidth/2;
                    }
                }
      
                ctx.fillText(str, x + xOffset, y - 1);
            }
            
            curTxtAscent = textAscent();
            curTxtDescent = textDescent();
            curTxtLeading = textLeading();
            
            // if (w === undef) {
                let lines, linesCount;
                if (t.indexOf('\n') < 0) {
                    lines = [t];
                    linesCount = 1;
                } else {
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
            ctx.fillStyle = clrToStr(color(r, g, b, a));
            ctx.fillRect(0, 0, P.width, P.height);
        },
        
        point = (x, y) => {
            curStroke && (ctx.fillStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.arc(x, y, curStrokeWeight / 2, 0, TWO_PI);
            
            curFill && ctx.fill();
        },

        line = (ax, ay, bx, by) => {
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            
            ctx.stroke();
        },
        
        rect = (x, y, w, h, r1, r2, r3, r4) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
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
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            
            curFill && ctx.fill();
            curStroke && ctx.stroke();
        },
        
        quad = (x1, y1, x2, y2, x3, y3, x4, y4) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
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
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
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
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.arc(x, y, d / 2, 0, TWO_PI);
            curFill && ctx.fill();
            curStroke && ctx.stroke();
        },
        
        ellipse = (x, y, w, h) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TWO_PI);
            curFill && ctx.fill();
            curStroke && ctx.stroke();
        },
        
        bezier = (a, b, c, d, e, f, g, h) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            ctx.beginPath();
            ctx.moveTo(a, b);
            ctx.bezierCurveTo(c, d, e, f, g, h);
            curFill && ctx.fill();
            curStroke && ctx.stroke();
        },
        
        get = {
            width: () => P.width,
            height: () => P.height,
            frameCount: () => P.frameCount,
            FPS: () => P.FPS,
            pmouseX: () => P.pmouseX,
            pmouseY: () => P.pmouseY,
            mouseX: () => P.mouseX,
            mouseY: () => P.mouseY,
            mouseIsPressed: () => P.mouseIsPressed,
            mouseButton: () => P.mouseButton,
            keyIsPressed: () => P.keyIsPressed,
            keyCode: () => P.keyCode,
        },
        
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
            }
        },
        
        pushMatrix = () => {
            ctx.save();
        },
        
        popMatrix = () => {
            ctx.restore();
        },
        
        scale = (w, h) => {
            ctx.scale(w, h);
        },
        
        translate = (x, y) => {
            ctx.translate(x, y);
        },

        rotate = a => {
            if (curAngleMode === DEGREES) ctx.rotate(a / 180 * PI);
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
        };
        
        
    // Drawlite CONSTANTS
    Object.assign(P, {
        PI,
        TWO_PI,
        EPSILON,
        CORNERS,
        CENTER,
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
        CLOSE
    });
    
    // STATIC VARIABLES
    Object.assign(P, {
        canvas,
        ctx,
        size,
        CORNERS,
        CENTER,
        RADIUS,
        DEGREES,
        RADIANS,
        angleMode,
        frameRate,
        min,
        max,
        floor,
        abs,
        round,
        constrain,
        sqrt,
        sin,
        cos,
        random,
        dist,
        map,
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
        endShape,
        snip,
        image,
        font,
        textAlign,
        textWidth,
        textAscent,
        textDescent,
        textLeading,
        textWidth,
        text,
        background,
        point,
        line,
        rect,
        triangle,
        quad,
        circle,
        arc,
        ellipse,
        bezier,
        get,
        autoUpdateDynamics,
        pushMatrix,
        popMatrix,
        scale,
        translate,
        rotate,
        noise,
        noiseDetail,
        seedNoise
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
    });
    
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
            
            if (updateDynamics !== null) {
                updateDynamics();
            }
        }
    }
    
    updateInterval = setInterval(DrawliteUpdate, 1000 / targetFPS);
    
    canvas.addEventListener("mousedown", e => {
        p.mouseButton = [LEFT, CENTER, RIGHT][e.which - 1];
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
            if (P.keyDown) P.keyDown(e);
        });
        document.body.addEventListener("keyup", e => {
            P.keyIsPressed = false;
            if (P.keyUp) P.keyUp(e);
        });
    }

    if (callback) callback(P);
    
    return P;
};
