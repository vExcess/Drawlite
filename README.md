# Drawlite
A lightweight yet powerful library for drawing graphics inspired by Processing.js  

## Usage
```js
let DL = Drawlite(canvas);
let { size, autoUpdateDynamics, fill, rect } = DL;

autoUpdateDynamics();
size(200, 200);

DL.draw = function () {
  fill(255, 0, 0);
  rect(get.mouseX, get.mouseY, 100, 100);
};
```

## Constants
*These are meant to be used in place of literal values. The actual values behind these don't matter for the most part.*
**PI** - (Float) ~3.14  
**TWO_PI** - (Float) ~6.28  
**EPSILON** - (Float) ~0.0000000000000001  
**CORNER**  
**CORNERS**  
**LEFT**  
**RIGHT**  
**TOP**  
**CENTER**  
**BOTTOM**  
**BASELINE**  
**RADIUS**  
**DEGREES**  
**RADIANS**  
**POINTS**  
**LINES**  
**TRIANGLES**  
**TRIANGLE_STRIP**  
**TRIANGLE_FAN**  
**QUADS**  
**QUAD_STRIP**  
**CLOSE**  
**ROUND**  
**SQUARE**  
**PROJECT**  
**BEVEL**  
**MITER**  
**RGB**  
**HSB**  
**NATIVE**  

## Static Variables
*These variables never change therefore it is safe to use them as local variables without accessing them from the Drawlite instance*  
**canvas** - the HTML canvas element  

**Color** - The Color class
*RGBA values are from 0-255 inclusive*
*HSB values have the ranges (0-360, 0-100, 0-100) inclusive*
```
static fromInt - unpacks an integer into a color
@params Integer
@return Color

static fromHex - unpacks a hex string into a color
@params Number
@return Color

static fromString - converts a rgb/rgba CSS string into a color
@params Number
@return Color

static RGBtoHSB - converts RGB values into an array of HSB values
@params (Number r, Number g, Number b)
@return Array

constructor - create new color
@params (Number n) - gray
@params (Number n, Number a) - transparent gray
@params (Number r, Number g, Number b) - RGB color
@params (Number h, Number s, Number b) - HSB color (resulting Color instance is still in RGB format)
@params (Number r, Number g, Number b, Number a) - RGBA color
@return Color

equals - check if color equals another color
@params Color
@return Boolean

toInt - converts color to an integer
@return Integer

toHex - converts color to a hex string
@return String

toString - converts color to RGB/RGBA CSS string
@return String

toHSB - converts color to an Array of HSB values
@return Array
```

**ctx** - the canvas's 2D rendering context

**size** - sets the size of the canvas  
```
@params (Integer width, Integer height)
```

**angleMode** - sets the whether to use radians or degrees  
```
@params this.RADIANS/this.DEGREES
```

**noloop** - pauses the draw loop

**loop** continues the draw loop

**frameRate** - sets the framerate of the draw loop if given an argument. Returns the current frames per second of the draw loop otherwise.
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

**ceil** - rounds the number up
```
@params (Number n)  
@return Integer
```

**abs** - absolute value of number
```
@params (Number n)  
@return Number
```

**constrain** - constains a number between a min and max (inclusive)
```
@params (Number n, Number min, Number max)  
@return Number
```

**sq** - returns the square of a number  
```
@params (Number n)  
@return Number
```

**sqrt** - returns the square root of a number  
```
@params (Number n)  
@return Number
```

**pow** - returns a number raised to a given power
```
@params (Number num, Number exp)  
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

**tan** - returns the tangent of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**asin** - returns the inverse sine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**acos** - returns the inverse cosine of a number. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**atan** - returns the inverse tangent of a number between 0 and 180. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number n)
@return Number
```

**atan2** - returns the inverse tangent of a number between 0 and 360. Uses degrees by default, this can be changed using `angleMode`.
```
@params (Number y, Number x)
@return Number
```

**log** - returns the natural log of a number
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

**dist** - returns the distance between two points
```
@params (Number x1, Number y1, Number x2, Number y2)
@params (Number x1, Number y1, Number z1, Number x2, Number y2, Number z2)
@return Number
```

**map** - maps a number from one range to another. Numbers outside the range are not clamped to 0 and 1
```
@params (Number n, Number low1, Number high1, Number low2, Number high2)
@return Number
```

**lerp** - Calculates a number between two numbers at a specific increment. The 3rd parameter is a number between 0 and 1
```
@params (Number n1, Number n2, Number t)
@return Number
```

**radians** - converts a number from degrees to radians
```
@params (Number deg)
@return Number
```

**degrees** - converts a number from radians to degrees
```
@params (Number rad)
@return Number
```

**color** - Alias for Color constructor. See documentation for Color constructor.

**lerpColor** - calculates a color inbetween two other colors at a specified interval. The 3rd parameter is a number between 0 and 1
```
@params (Color c1, Color c2, Number t)
@params Color
```

**fill** - sets the fill color for the following shapes. Parameters are same as Color constructor.

**stroke** - sets the outline color for the following shapes. Parameters are same as Color constructor.

**strokeWeight** - sets the outline thickness for the following shapes
```
@params (Number thickness)
```

**strokeCap** - sets the style for rendering line endings
```
@params this.SQUARE/this.PROJECT/this.ROUND
```

**strokeJoin** - sets the style of the joints which connect line segments
```
@params this.MITER/this.BEVEL/this.ROUND
```

**noStroke** - sets the following shapes to not have an outline

**noFill** - sets the following shapes to not have an filling color

**beginShape** - starts the path of a generic shape

**vertex** - adds a vertex to the current shape path
```
@params (Number x, Number y)
```

**curveVertex** - adds a quadratic curve to the current shape path
```
@params (Number cx, Number cy, Number x, Number y)
```

**bezierVertex** - adds a bezier vertex to the current shape path
```
@params (Number cx, Number cy, Number cX, Number cY, Number x, Number y)
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
