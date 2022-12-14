# Drawlite
A lightweight yet powerful library for drawing graphics inspired by Processing.js

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
These are meant to be used in place of literal values. The actual values behind these don't matter for the most part.
CORNERS  
CENTER  
RADIUS  
DEGREES  
RADIANS  
PI - (Float) ~3.14  
TWO_PI - (Float) ~6.28  
EPSILON  

## Static Variables
These variables never change therefore it is safe to use them as local variables without accessing them from the Drawlite instance
canvas - the canvas element  

ctx - the Drawlite instance's 2d context  

size - sets the size of the canvas  
@params
  (Integer width, Integer height)

angleMode - sets the whether to use radians or degrees
@params
  (typeof this.RADIANS mode)
  (typeof this.DEGREES mode)

frameRate - sets the framerate of the draw loop
@params
  (Number fps)

min - returns the minimum of inputted numbers
max
floor
round
sqrt
sin
cos
random
dist
color
fill
stroke
strokeWeight
noStroke
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
These variables are constantly changing. Therefore to access them you must use them from the DrawliteInstance or read them using the `get` object  
frameCount - (Integer) the number of frames that have been rendered since the program began  
FPS - (Float) the current frames per second the program is running at  
pmouseX - (Integer) the previous x coordinate of the mouse cursor  
pmouseY - (Integer) the previous y coordinate of the mouse cursor  
mouseX - (Integer) the x coordinate of the mouse cursor  
mouseY - (Integer) the y coordinate of the mouse cursor  
mouseIsPressed - (Boolean) whether the mouse is pressed down  
keyIsPressed - (Boolean) whether any keys are pressed or not  
width - (Integer) the width of the canvas  
height - (Integer) the height of the canvas  
