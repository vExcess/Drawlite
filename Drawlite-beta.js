/**
    Drawlite.js - a lightweight yet powerful graphics library similiar to Processing and p5

    Perlin Noise functionality is from p5.js (https://github.com/processing/p5.js)
    All other code written by Vexcess
**/
var DrawLite = function (canvas, callback) {
    let P = {};

    canvas = canvas ?? {
        getContext: () => {},
        addEventListener: () => {}
    };
    
    // Drawlite CONSTANTS
    let CORNERS = 0,
        CENTER = 1,
        RADIUS = 2,
        DEGREES = 6,
        RADIANS = 7,
        PI = Math.PI,
        TWO_PI = Math.PI * 2,
        EPSILON = 0.0000000000000001;
    
    // LOCAL VARIABLES
    let updateInterval = null,
        targetFPS = 60,
        FPS_Counter = 0,
        lastFPSCheck = Date.now(),
        curAngleMode = DEGREES,
        curRectMode = 0,
        curStroke = [0, 0, 0],
        curStrokeWeight = 1,
        curFill = [255, 255, 255],
        shapePath = [],
        VERTEX_NODE = 3,
        CURVE_VERTEX_NODE = 4,
        BEZIER_VERTEX_NODE = 5,
        clrToStr = c => (
            c[3] === undefined ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`
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
        },
        
        angleMode = m => (curAngleMode = m),
        frameRate = r => {
            clearInterval(updateInterval);
            targetFPS = r;
            updateInterval = setInterval(DrawLiteUpdate, 1000 / targetFPS);
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
            if (a === undefined) {
                return Math.random();
            } else if (b === undefined) {
                return Math.random() * a;
            } else {
                return a + Math.random() * (b - a);
            }
        },
        dist = (a, b, c, d, e, f) => (
            e === undefined ? sqrt((a - c) ** 2 + (b - d) ** 2) : sqrt((a - d) ** 2 + (b - e) ** 2 + (c - f) ** 2)
        ),
        map = (v, istart, istop, ostart, ostop) => (
            ostart + (ostop - ostart) * ((v - istart) / (istop - istart))
        ),
        radians = d => (d * PI / 180),
        degrees = r => (r * 180 / PI),
        
        color = (r, g, b, a) => (
            a === undefined ? [r, g, b] : [r, g, b, a]
        ),
        
        fill = (r, g, b, a) => {
            curFill = g === undefined ? color(r, r, r) : (b === undefined ? color(r, r, r, g) : color(r, g, b, a));
        },
        
        stroke = (r, g, b, a) => {
            curStroke = g === undefined ? color(r, r, r) : (b === undefined ? color(r, r, r, g) : color(r, g, b, a));
        },
        
        strokeWeight = w => {
            ctx.lineWidth = w;
        },
        
        noStroke = () => {
            curStroke = null;
        },
        
        noFill = () => {
            curFill = null;
        },
        
        beginShape = () => shapePath = [],
        vertex = (x, y) => shapePath.push([VERTEX_NODE, [x, y]]),
        curveVertex = (cx, cy, x, y) => shapePath.push([CURVE_VERTEX_NODE, [cx, cy, x, y]]),
        bezierVertex = (cx, cy, cX, cY, x, y) => (
            shapePath.push([BEZIER_VERTEX_NODE, [cx, cy, cX, cY, x, y]])
        ),
        endShape = end => {
            console.log(shapePath)
            ctx.beginPath();
            ctx.moveTo(...shapePath[0][1]);
            let i = 1, len = shapePath.length;
            for (; i < len; i++) {
                let node = shapePath[i];
                console.log(shapePath[i + 1])
                switch (node[0]) {
                    case VERTEX_NODE:
                        ctx.lineTo(...node[1]);
                    case CURVE_VERTEX_NODE:
                        ctx.quadraticCurveTo(...node[1]);
                    case BEZIER_VERTEX_NODE:
                        ctx.bezierCurveTo(...node[1]);
                }
            }
            ctx.closePath();
            curStroke && ctx.stroke();
            curFill && ctx.fill();
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
            if (w === undefined) {
                ctx.drawImage(img.sourceImage, x, y);
            } else {
                ctx.drawImage(img.sourceImage, x, y, w, h);
            }
            
        },

        font = (f, sz) => {
            ctx.font = f + " " + sz + "px";
        },
        
        text = (t, x, y, w, h) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            ctx.fillText(t, x, y);
        },
        
        background = (r, g, b, a) => {
            if (a !== undefined) {
                ctx.clearRect(0, 0, P.width, P.height);
            }
            ctx.fillStyle = clrToStr(color(r, g, b, a));
            ctx.fillRect(0, 0, P.width, P.height);
        },
        
        rect = (x, y, w, h, r1, r2, r3, r4) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
            if (r1 === undefined) {
                ctx.fillRect(x, y, w, h);
            } else {
                if (curRectMode === CORNERS) {
                    w -= x;
                    h -= y;
                } else if (curRectMode === RADIUS) {
                    w *= 2;
                    h *= 2;
                    x -= w / 2;
                    y -= h / 2;
                } else if (curRectMode === CENTER) {
                    x -= w / 2;
                    y -= h / 2;
                }
                
                beginShape();
                vertex(x + r1, y)
                vertex(x + w - r2, y)
                curveVertex(x + w, y, x + w, y + r2)
                vertex(x + w, y + h - r3)
                curveVertex(x + w, y + h, x + w - r3, y + h)
                vertex(x + r4, y + h)
                curveVertex(x, y + h, x, y + h - r4)
                vertex(x, y + r1)
                curveVertex(x, y, x + r1, y)
                endShape()
            }
            
            curStroke && ctx.strokeRect(x + 0.5, y + 0.5, w, h);
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
        
        circle = (x, y, d) => {
            curFill && (ctx.fillStyle = clrToStr(curFill));
            curStroke && (ctx.strokeStyle = clrToStr(curStroke));
            
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
        CORNERS,
        CENTER,
        RADIUS,
        DEGREES,
        RADIANS,
        PI,
        TWO_PI,
        EPSILON
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
        text,
        background,
        rect,
        triangle,
        circle,
        ellipse,
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
        keyIsPressed: false,
        width: canvas.width,
        height: canvas.height,
    });

    function DrawLiteUpdate () {
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
    
    updateInterval = setInterval(DrawLiteUpdate, 1000 / targetFPS);
    
    canvas.addEventListener("mousedown", () => {
        P.mouseIsPressed = true;
        if (P.mousePressed) P.mousePressed();
    });
    canvas.addEventListener("mouseup", () => {
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
