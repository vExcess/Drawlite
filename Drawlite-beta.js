/**
    Drawlite.js - a lightweight yet powerful graphics library
    All code is written by Vexcess except where specified otherwise and is availiable under the MIT License
**/
window.Drawlite = function (canvas, callback) {
    let P = {};
    
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
            c[3] === undefined ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`
        ),
        autoUpdate = false,
        updateDynamics = null,
        // https://unpkg.com/perlin-noise-3d@0.5.4/dist/perlin-noise-3d.min.js
        PerlinNoise3d = function(){for(var r=Math.floor(720),n=new Array(r),t=new Array(r),i=Math.PI/180,e=0;e<r;e++)n[e]=Math.sin(e*i*.5),t[e]=Math.cos(e*i*.5);var o=r;o>>=1;var l=function(){this.perlin_octaves=4,this.perlin_amp_falloff=.5,this.perlin=null};return l.prototype={noiseSeed:function(r){var n=function(){var r,n,t=4294967296;return{setSeed:function(i){n=r=(null==i?Math.random()*t:i)>>>0},getSeed:function(){return r},rand:function(){return(n=(1664525*n+1013904223)%t)/t}}}();n.setSeed(r),this.perlin=new Array(4096);for(var t=0;t<4096;t++)this.perlin[t]=n.rand();return this},get:function(n,i,e){if(i=i||0,e=e||0,null==this.perlin){this.perlin=new Array(4096);for(var l=0;l<4096;l++)this.perlin[l]=Math.random()}n<0&&(n=-n),i<0&&(i=-i),e<0&&(e=-e);for(var a,h,s,f,p,u=Math.floor(n),c=Math.floor(i),v=Math.floor(e),d=n-u,M=i-c,_=e-v,m=0,y=.5,w=function(n){return.5*(1-t[Math.floor(n*o)%r])},A=0;A<this.perlin_octaves;A++){var S=u+(c<<4)+(v<<8);a=w(d),h=w(M),s=this.perlin[4095&S],s+=a*(this.perlin[S+1&4095]-s),f=this.perlin[S+16&4095],s+=h*((f+=a*(this.perlin[S+16+1&4095]-f))-s),f=this.perlin[4095&(S+=256)],f+=a*(this.perlin[S+1&4095]-f),p=this.perlin[S+16&4095],f+=h*((p+=a*(this.perlin[S+16+1&4095]-p))-f),m+=(s+=w(_)*(f-s))*y,y*=this.perlin_amp_falloff,u<<=1,c<<=1,v<<=1,(d*=2)>=1&&(u++,d--),(M*=2)>=1&&(c++,M--),(_*=2)>=1&&(v++,_--)}return m}},l}(),
        pNoise = new PerlinNoise3d();
    
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
            updateInterval = setInterval(mainLoop, 1000 / targetFPS);
        },
        
        min = Math.min,
        max = Math.max,
        floor = Math.floor,
        round = Math.round,
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
        
        color = (r, g, b, a) => (
            a === undefined ? [r, g, b] : [r, g, b, a]
        ),
        
        fill = (r, g, b, a) => {
            curFill = color(r, g, b, a);
        },
        
        stroke = (r, g, b, a) => {
            curStroke = color(r, g, b, a);
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

        seedNoise = pNoise.noiseSeed,

        noise = (x, y, z) => pNoise.get(x, y, z)
        
        
    // Drawlite CONSTANTS
    Object.assign(P, {
        CORNERS: CORNERS,
        CENTER: CENTER,
        RADIUS: RADIUS,
        DEGREES: DEGREES,
        RADIANS: RADIANS,
        PI: PI,
        TWO_PI: TWO_PI,
        EPSILON: EPSILON
    });
    
    // STATIC VARIABLES
    Object.assign(P, {
        canvas: canvas,
        ctx: ctx,
        size: size,
        CORNERS: CORNERS,
        CENTER: CENTER,
        RADIUS: RADIUS,
        DEGREES: DEGREES,
        RADIANS: RADIANS,
        angleMode: angleMode,
        frameRate: frameRate,
        min: min,
        max: max,
        floor: floor,
        round: round,
        sqrt: sqrt,
        sin: sin,
        cos: cos,
        random: random,
        dist: dist,
        color: color,
        fill: fill,
        stroke: stroke,
        strokeWeight: strokeWeight,
        noStroke: noStroke,
        noFill: noFill,
        beginShape: beginShape,
        vertex: vertex,
        curveVertex: curveVertex,
        bezierVertex: bezierVertex,
        endShape: endShape,
        snip: snip,
        image: image,
        text: text,
        background: background,
        rect: rect,
        triangle: triangle,
        circle: circle,
        ellipse: ellipse,
        get: get,
        autoUpdateDynamics: autoUpdateDynamics,
        pushMatrix: pushMatrix,
        popMatrix: popMatrix,
        scale: scale,
        translate: translate,
        seedNoise: seedNoise,
        noise: noise
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

    function mainLoop () {
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
    
    updateInterval = setInterval(mainLoop, 1000 / targetFPS);
    
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
        
        if (P.mouseIsPressed && P.mouseDragged) P.mouseDragged();
    });
    document.body.addEventListener("keydown", e => {
        P.keyIsPressed = true;
        if (P.keyDown) P.keyDown(e);
    });
    document.body.addEventListener("keyup", e => {
        P.keyIsPressed = false;
        if (P.keyUp) P.keyUp(e);
    });

    if (callback) callback(P);
    
    return P;
};
