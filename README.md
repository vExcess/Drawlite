# Drawlite
A lightweight yet powerful library for drawing graphics inspired by Processing.js  
*Note: The library is still under development so features are constantly changing and may be unreliable.*

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
**CORNERS**  
**CENTER**  
**RADIUS**  
**DEGREES**  
**RADIANS**  
**PI** - (Float) ~3.14  
**TWO_PI** - (Float) ~6.28  
**EPSILON**  

## Static Variables
*These variables never change therefore it is safe to use them as local variables without accessing them from the Drawlite instance*  
**canvas** - the canvas element  

**ctx** - the Drawlite instance's 2d context  

**size** - sets the size of the canvas  
```
@params (Integer width, Integer height)
```

**angleMode** - sets the whether to use radians or degrees  
```
@params (typeof this.RADIANS mode)
@params (typeof this.DEGREES mode)
```

**frameRate** - sets the framerate of the draw loop if given an argument. Returns the current frames per second of the draw loop
```
@params ()
@params (Number fps)
@return Number
```

**min** - returns the minimum of inputted numbers  
```
@params (Number ...numbers)  
@return Number
```

**max** - returns the maximum of inputted numbers  
```
@params (Number ...numbers)  
@return Number
```

**floor** - rounds down to the lowest integer  
```
@params (Number n)  
@return Integer
```

**round** - rounds to the closest integer  
```
@params (Number n)  
@return Integer
```

**sqrt** - returns the square root of a number  
```
@params (Number n)  
@return Number
```

**sin** - returns the sine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**cos** - returns the cosine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**random** - returns a random number between \[min, max). Can take either 0, 1, or 2 arguments. If not specific the min is 0 and the max is 1 by default.
```
@params ()
@params (Number max)
@params (Number min, Number max)
@return Number
```

**dist** - returns the distance between two 2D points
```
@params (Number x1, Number y1, Number x2, Number y2)
@return Number
```

**color** - returns an array containing RGB or RGBA values. Each value is a byte between \[0, 255]
```
@params (Number n)
@return [n, n, n]

@params (Number n, Number a)
@return [n, n, n, a]

@params (Number r, Number g, Number b)
@return [r, g, b]

@params (Number r, Number g, Number b, Number a)
@return [r, g, b, a]
```

**fill** - sets the fill color for the following shapes
```
@params (Number n)
@params (Number n, Number a)
@params (Number r, Number g, Number b)
@params (Number r, Number g, Number b, Number a)
@params (Array[3] arr)
```

**stroke** - sets the outline color for the following shapes
```
@params (Number n)
@params (Number n, Number a)
@params (Number r, Number g, Number b)
@params (Number r, Number g, Number b, Number a)
@params (Array[3] arr)
```

**strokeWeight** - sets the outline thickness for the following shapes
```
@params (Number thickness)
```

**noStroke** - sets the following shapes to not have an outline
```
@params ()
```

**noFill** - sets the following shapes to not have an filling color
```
@params ()
```

**beginShape** - starts the path of a generic shape
```
@params ()
```

**vertex** - adds a vertex to the current shape path
```
@params (Number x, Number y)
```

**curveVertex** - adds a curved vertex to the current shape path
```
@params WIP
```

**bezierVertex** - adds a bezier vertex to the current shape path
```
@params WIP
```

**endShape** - draws the current shape path onto the canvas
```
@params ()
```

**snip** - takes a "screenshot" of a specific rectangle of the canvas. If no arguments given it will take a "screenshot" of the entire canvas
```
@params ()
@params (Number x, Number y, Number width, Number height)
@return HTMLCanvasElement
```

**image** - draws an image onto the screen
```
@params (Image image, Number x, Number y)
@params (Image image, Number x, Number y, Number width, Number height)
```

**text** - draws text onto the screen. If given a width and height it will cause the text to wrap around so as not to go outside of the specified box
```
@params (String txt, Number x, Number y)
@params (String txt, Number x, Number y, Number width, Number height)
```

**background** - fills the entire canvas with a solid color
```
@params (Number n)
@params (Number n, Number a)
@params (Number r, Number g, Number b)
@params (Number r, Number g, Number b, Number a)
@params (Array[3] arr)
```

**rect** - draws a rectangle. Radiuses can be specified to draw rectangles with rounded corners.
```
@params (Number x, Number, y, Number width, Number height)
@params (Number x, Number, y, Number width, Number height, Number radius)
@params (Number x, Number, y, Number width, Number height, Number radius1, Number radius2, Number radius3, Number radius4)
```

**triangle** - draws a triangle
```
@params (Number x1, Number, y1, Number x2, Number y2, Number x3, Number y3)
```

**circle** - draws a circle
```
@params (Number x, Number y, Number diameter)
```

**ellipse** - draws an ellipse
```
@params (Number x, Number y, Number width, Number height)
```

**get** - holds getters for dynamic properties of a Drawlite instance. If `autoUpdateDynamics` has been invoked then instead of holding getter functions, it will automatically fetch the values each frame and then store them as properties of `get`
```js
// Usage 1
console.log(get.frameCount());
```
```js
// Usage 2
autoUpdateDynamics();
console.log(get.frameCount);
```

**autoUpdateDynamics** - Changes whether `get` is automatically updated to hold the latest values of Drawlite's dynamic variables. If given no arguments then it will set `get` to be automatically updated. If given `false` as an argument then it will set `get` to NOT be automatically updated
```
@params ()
@params (Boolean shouldAutoUpdate)
```

**pushMatrix** - creates a new drawing matrix. Transformations done in a matrix will only have affect inside the matrix.
```
@params ()
```

**popMatrix** - ends the current drawing matrix.
```
@params ()
```

**scale** - scales all shapes drawn after it
```
@params (Number scl)
@params (Number xScale, yScale)
```

**translate** - translates all shapes drawn after it
```
@params (Number xScale, yScale)
```

**seedNoise** - seeds Drawlite's Perlin noise
```
@params (Number seed)
```

**noise** - returns the Perlin noise value at a given coordinate. Works for 1D, 2D, and 3D
```
@params (Number time)
@params (Number x, Number y)
@params (Number x, Number y, Number z)
@return Number
```

## Dynamic Variables
*These variables may change during program execution. Therefore to access them you must use them from the Drawlite instance or read them using the `get` object*  
**frameCount** - (Integer) the number of frames that have been rendered since the program began  
**FPS** - (Float) the current frames per second the program is running at  
**pmouseX** - (Integer) the previous x coordinate of the mouse cursor  
**pmouseY** - (Integer) the previous y coordinate of the mouse cursor  
**mouseX** - (Integer) the x coordinate of the mouse cursor  
**mouseY** - (Integer) the y coordinate of the mouse cursor  
**mouseIsPressed** - (Boolean) whether the mouse is pressed down  
**keyIsPressed** - (Boolean) whether any keys are pressed or not  
**width** - (Integer) the width of the canvas  
**height** - (Integer) the height of the canvas  
