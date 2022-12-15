# Drawlite
A lightweight yet powerful library for drawing graphics inspired by Processing.js  
**Note: The library is still under development so features are constantly changing and may be unreliable.**

## Usage
```js
let drawliteInstance = Drawlite(canvas);
let { size, autoUpdateDynamics, fill, rect } = drawliteInstance;

autoUpdateDynamics();

drawlite.draw = function () {
  size(200, 200);
  fill(255, 0, 0);
  rect(get.mouseX, get.mouseY, 100, 100);
};
```

## Constants
*These are meant to be used in place of literal values. The actual values behind these don't matter for the most part.*  
`CORNERS`  
`CENTER`  
`RADIUS`  
`DEGREES`  
`RADIANS`  
`PI` - (Float) ~3.14  
`TWO_PI` - (Float) ~6.28  
`EPSILON`  

## Static Variables
*These variables never change therefore it is safe to use them as local variables without accessing them from the Drawlite instance*  
**canvas** - the canvas element  

**ctx** - the Drawlite instance's 2d context  

**size** - sets the size of the canvas  
```
@params
  (Integer width, Integer height)
```

**angleMode** - sets the whether to use radians or degrees  
```
@params  
  (typeof this.RADIANS mode)  
  (typeof this.DEGREES mode)  
```

**frameRate** - sets the framerate of the draw loop if given an argument. Returns the current frames per second of the draw loop
```
@params  
  (Number fps)
@return Number
```

**min** - returns the minimum of inputted numbers  
```
@params  
  (Number ...numbers)  
@return Number
```

**max** - returns the maximum of inputted numbers  
```
@params  
  (Number ...numbers)  
@return Number
```

**floor** - rounds down to the lowest integer  
```
@params  
  (Number n)  
@return Integer
```

**round** - rounds to the closest integer  
```
@params  
  (Number n)  
@return Integer
```

**sqrt** - returns the square root of a number  
```
@params  
  (Number n)  
@return Number
```

**sin** - returns the sine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params
  (Number n)
@return Number
```

**cos** - returns the cosine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params
  (Number n)
@return Number
```

**random** - returns a random number between \[min, max). Can take either 0, 1, or 2 arguments. If not specific the min is 0 and the max is 1 by default.
```
@params
  (Number max)
  (Number min, Number max)
@return Number
```

**dist** - returns the distance between two 2D points
```
@params
  (Number x1, Number y1, Number x2, Number y2)
@return Number
```

**color** - returns an array containing RGB or RGBA values. Each value is a byte between \[0, 255]
```
@params
  (Number n)
@return [n, n, n]

@params
  (Number n, Number a)
@return [n, n, n, a]

@params
  (Number r, Number g, Number b)
@return [r, g, b]

@params
  (Number r, Number g, Number b, Number a)
@return [r, g, b, a]
```

**fill**
**stroke**
**strokeWeight**
**noStroke**
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

## Dynamic Variables
*These variables are constantly changing. Therefore to access them you must use them from the DrawliteInstance or read them using the `get` object*  
`frameCount` - (Integer) the number of frames that have been rendered since the program began  
`FPS` - (Float) the current frames per second the program is running at  
`pmouseX` - (Integer) the previous x coordinate of the mouse cursor  
`pmouseY` - (Integer) the previous y coordinate of the mouse cursor  
`mouseX` - (Integer) the x coordinate of the mouse cursor  
`mouseY` - (Integer) the y coordinate of the mouse cursor  
`mouseIsPressed` - (Boolean) whether the mouse is pressed down  
`keyIsPressed` - (Boolean) whether any keys are pressed or not  
`width` - (Integer) the width of the canvas  
`height` - (Integer) the height of the canvas  
