/*

    touch.js addon for Drawlite.js
    
    Credits:
        VEXCESS  @vxs
        Mango  @collisions
        Liam K.  @liamk.ka
        Larry Serflaton  @LarrySerflaten
        Noah H.  @noahcoder11
        Cosmo  @Elisha0White
        Iron Programming  @ncochran2
        MDN  https://developer.mozilla.org
        Stack Overflow  https://stackoverflow.com
        GeeksforGeeks  https://www.geeksforgeeks.org
        - All other code is written Vexcess and is available under the MIT license (https://opensource.org/license/mit/)
*/
(() => {
    let TWO_PI = Math.PI * 2;
    let Touch = {};
    
    Touch.point_point = function(px, py, p2x, p2y) {
        return px === p2x && py === p2y;
    };
    Touch.point_line = function(x1, y1, x2, y2, px, py) {
        var a, b;
        
        a = x2 - x1;
        b = y2 - y1;
        var total = Math.sqrt(a * a + b * b);
        
        a = px - x1;
        b = py - y1;
        var seg1 = Math.sqrt(a * a + b * b);
        
        a = px - x2;
        b = py - y2;
        var seg2 = Math.sqrt(a * a + b * b);
        
        return Math.abs(total - seg1 - seg2) < 0.05;
    };
    Touch.point_triangle = function(px, py, x1, y1, x2, y2, x3, y3) {
        var minx = Math.min(x1, x2, x3);
        var maxx = Math.max(x1, x2, x3);
        var miny = Math.min(y1, y2, y3);
        var maxy = Math.max(y1, y2, y3);

        var w1 = (x1 * (y3 - y1) + (py - y1) * (x3 - x1) - px * (y3 - y1)) / ((y2 - y1) * (x3 - x1) - (x2 - x1) * (y3 - y1));
        var w2 = (x1 * (y2 - y1) + (py - y1) * (x2 - x1) - px * (y2 - y1)) / ((y3 - y1) * (x2 - x1) - (x3 - x1) * (y2 - y1));

        return w1 >= 0 && w2 >= 0 && w1 + w2 <= 1;
    };
    Touch.point_rect = function(px, py, rx, ry, rw, rh) {
        return (px > rx && px < rx + rw && py > ry && py < ry + rh);
    };
    Touch.point_circle = function(px, py, cx, cy, cs) {
        var r = cs / 2;
        
        var a = px - cx;
        var b = py - cy;
        return a * a + b * b < r * r;
    };
    Touch.point_ellipse = function(px, py, ex, ey, ew, eh) {
        var dx = px - ex;
        var dy = py - ey;

        ew /= 2;
        eh /= 2;

        return (dx * dx) / (ew * ew) + (dy * dy) / (eh * eh) <= 1;
    };
    Touch.point_arc = function(px, py, ax, ay, aw, ah, astart, astop) {
        var dx = px - ax;
        var dy = py - ay;

        aw /= 2;
        ah /= 2;

        astart = astart / 180 * Math.PI;
        astop = astop / 180 * Math.PI;

        var ang1 = Math.atan2(ay - py, ax - px) + Math.PI;

        var inverted = false;

        while (astart < 0) {
            astart += TWO_PI;
            astop += TWO_PI;
        }

        while (astop > TWO_PI) {
            astart -= TWO_PI;
            astop -= TWO_PI;
        }

        if (astop - astart > TWO_PI) {
            astart = 0;
            astop = TWO_PI;
        }

        if (astart < 0 && astart < astop) {
            var temp = astart;
            astart = astop;
            astop = temp;
            inverted = true;
        }

        var ang2 = Math.atan2(Math.sin(astart) * ah, Math.cos(astart) * aw);
        if (ang2 < 0) {
            ang2 += TWO_PI;
        }
        var ang3 = Math.atan2(Math.sin(astop) * ah, Math.cos(astop) * aw);
        if (ang3 < 0) {
            ang3 += TWO_PI;
        }

        var out = false;

        if ((dx * dx) / (aw * aw) + (dy * dy) / (ah * ah) <= 1) {
            var withinBounds = ang1 > ang2 && ang1 < ang3;
            out = inverted ? !withinBounds : withinBounds;
        }

        return out;
    };
    Touch.point_box = function(px, py, pz, bx, by, bz, bw, bh, bl) {
        return (px >= bx && px <= bx + bw) && (py >= by && py <= by + bh) && (pz >= bz && pz <= bz + bl);
    };
    Touch.point_sphere = function(px, py, pz, sx, sy, sz, sd) {
        var r = sd / 2;
        var a = px - sx;
        var b = py - sy;
        var c = pz - sz;
        
        return a * a + b * b + c * c < r * r;
    };

    

    Touch.line_point = function(px, py, x1, y1, x2, y2) {
        return Touch.point_line(x1, y1, x2, y2, px, py);
    };
    Touch.line_line = function line_line(a, b, c, d, p, q, r, s) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };
    // Touch.line_triangle = function() {};
    Touch.line_rect = function(lx1, ly1, lx2, ly2, rx, ry, rw, rh) {
        var lBX = Math.min(lx1, lx2),
            lBY = Math.min(ly1, ly2);

        if (rx + rw < lBX || rx > lBX + Math.abs(lx2 - lx1) || ry + rh < lBY || ry > lBY + Math.abs(ly2 - ly1)) {
            return false;
        } else {
            var sfX, sfy;

            if (ry + rh / 2 < ly1 + (ly2 - ly1) * (((rx + rw / 2) - lx1) / (lx2 - lx1))) {
                sfX = rx - lx1;
                sfy = ry + rh - ly1;
            } else {
                sfX = rx + rw - lx1;
                sfy = ry - ly1;
            }

            var finalX = lx1 + (lx2 - lx1) * (sfy / (ly2 - ly1)),
                finalY = ly1 + (ly2 - ly1) * (sfX / (lx2 - lx1));

            return (ry < finalY && ry + rh > finalY) || (rx < finalX && rx + rw > finalX);
        }
    };
    Touch.line_circle = function(x1, y1, x2, y2, cx, cy, cr) {
        var a, b;
        a = x2 - x1;
        b = y2 - y1;
        
        var length = Math.sqrt(a * a + b * b);
        var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(length, 2);
        var closestX = x1 + (dot * (x2 - x1));
        var closestY = y1 + (dot * (y2 - y1));
        
        a = cx - x1;
        b = cy - y1;
        if (Math.sqrt(a * a + b * b) < cr) {
            return true;
        }
        
        a = cx - x2;
        b = cy - y2;
        if (Math.sqrt(a * a + b * b) < cr) {
            return true;
        }
        
        a = cx - closestX;
        b = cy - closestY;
        if (Math.sqrt(a * a + b * b) < cr && cy > y1 && cy < y2) {
            return true;
        }
        
        return false;
    };
    // Touch.line_ellipse = function() {};
    // Touch.line_arc = function() {};
    // Touch.line_box = function() {};
    // Touch.line_sphere = function() {};

    Touch.triangle_point = function(x1, y1, x2, y2, x3, y3, px, py) {
        return Touch.point_triangle(px, py, x1, y1, x2, y2, x3, y3);
    };
    // Touch.triangle_line = function() {};
    // Touch.triangle_triangle = function() {};
    // Touch.triangle_rect = function() {};
    // Touch.triangle_circle = function() {};
    // Touch.triangle_ellipse = function() {};
    // Touch.triangle_arc = function() {};
    // Touch.triangle_box = function() {};
    // Touch.triangle_sphere = function() {};

    Touch.rect_point = function(rx, ry, rw, rh, px, py) {
        return Touch.point_rect(px, py, rx, ry, rw, rh);
    };
    Touch.rect_line = function(rx, ry, rw, rh, lx1, ly1, lx2, ly2) {
        return Touch.line_rect(lx1, ly1, lx2, ly2, rx, ry, rw, rh);
    };
    // Touch.rect_triangle = function() {};
    Touch.rect_rect = function(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
    };
    Touch.rect_circle = function(rx, ry, rw, rh, cx, cy, cd) {
        var testX = cx;
        var testY = cy;
        if (cx < rx) {
            testX = rx;
        } else if (cx > rx + rw) {
            testX = rx + rw;
        }
        if (cy < ry) {
            testY = ry;
        } else if (cy > ry + rh) {
            testY = ry + rh;
        }
        var d = cd / 2;
        
        var a = cx - testX;
        var b = cy - testY;
        return a * a + b * b <= d * d;
    };
    // Touch.rect_ellipse = function() {};
    // Touch.rect_arc = function() {};
    // Touch.rect_box = function() {};
    // Touch.rect_sphere = function() {};

    // Touch.circle_point = function() {};
    Touch.circle_line = function(cx, cy, cr, x1, y1, x2, y2) {
        return Touch.line_circle(x1, y1, x2, y2, cx, cy, cr);
    };
    // Touch.circle_triangle = function() {};
    Touch.circle_rect = function(cx, cy, cd, rx, ry, rw, rh) {
        return Touch.rect_circle(rx, ry, rw, rh, cx, cy, cd);
    };
    Touch.circle_circle = function(x1, y1, d1, x2, y2, d2) {
        var r = (d1 / 2 + d2 / 2);
        var a = x1 - x2;
        var b = y1 - y2;
        return a * a + b * b <= r * r;
    };
    // Touch.circle_ellipse = function() {};
    // Touch.circle_arc = function() {};
    // Touch.circle_box = function() {};
    // Touch.circle_sphere = function() {};

    Touch.ellipse_point = function(ex, ey, ew, eh, px, py) {
        return Touch.point_ellipse(px, py, ex, ey, ew, eh);
    };
    // Touch.ellipse_line = function() {};
    // Touch.ellipse_triangle = function() {};
    // Touch.ellipse_rect = function() {};
    // Touch.ellipse_circle = function() {};
    Touch.ellipse_ellipse = function(x1, y1, w1, h1, x2, y2, w2, h2) {
        return (Math.pow((x1 - x2) / (w1 + w2), 2) + Math.pow((y1 - y2) / (h1 + h2), 2)) * 4 <= 1;
    };
    // Touch.ellipse_arc = function() {};
    // Touch.ellipse_box = function() {};
    // Touch.ellipse_sphere = function() {};

    Touch.arc_point = function(ax, ay, aw, ah, astart, astop, px, py) {
        return Touch.point_arc(px, py, ax, ay, aw, ah, astart, astop);
    };
    // Touch.arc_line = function() {};
    // Touch.arc_triangle = function() {};
    // Touch.arc_rect = function() {};
    // Touch.arc_circle = function() {};
    // Touch.arc_ellipse = function() {};
    // Touch.arc_arc = function() {};
    // Touch.arc_box = function() {};
    // Touch.arc_sphere = function() {};

    Touch.box_point = function(bx, by, bz, bw, bh, bl, px, py, pz) {
        return Touch.point_box(px, py, pz, bx, by, bz, bw, bh, bl);
    };
    // Touch.box_line = function() {};
    // Touch.box_triangle = function() {};
    // Touch.box_rect = function() {};
    // Touch.box_circle = function() {};
    // Touch.box_ellipse = function() {};
    // Touch.box_arc = function() {};
    Touch.box_box = function(ax, ay, az, aw, ah, al, bx, by, bz, bw, bh, bl) {
        var a = {
            minX: ax - aw / 2,
            maxX: ax + aw / 2,
            minY: ay - ah / 2,
            maxY: ay + ah / 2,
            minZ: az - al / 2,
            maxZ: az + al / 2
        };

        var b = {
            minX: bx - bw / 2,
            maxX: bx + bw / 2,
            minY: by - bh / 2,
            maxY: by + bh / 2,
            minZ: bz - bl / 2,
            maxZ: bz + bl / 2
        };

        return (a.minX <= b.maxX && a.maxX >= b.minX) &&
            (a.minY <= b.maxY && a.maxY >= b.minY) &&
            (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
    };
    Touch.box_sphere = function(bX, bY, bZ, bW, bH, bL, sX, sY, sZ, sD) {
        var halfW = bW / 2;
        var halfH = bH / 2;
        var halfL = bL / 2;

        var x = Math.max(bX - halfW, Math.min(sX, bX + halfW));
        var y = Math.max(bY - halfH, Math.min(sY, bY + halfH));
        var z = Math.max(bZ - halfL, Math.min(sZ, bZ + halfL));
        
        var a = x - sX;
        var b = y - sY;
        var c = z - sZ;

        return a * a + b * b + c * c < sD * sD;
    };

    Touch.sphere_point = function(sx, sy, sz, sd, px, py, pz) {
        return Touch.point_sphere(px, py, pz, bx, by, bz, bw, bh, bl);
    };
    // Touch.sphere_line = function() {};
    // Touch.sphere_triangle = function() {};
    // Touch.sphere_rect = function() {};
    // Touch.sphere_circle = function() {};
    // Touch.sphere_ellipse = function() {};
    // Touch.sphere_arc = function() {};
    Touch.sphere_box = function(sX, sY, sZ, sD, bX, bY, bZ, bW, bH, bL) {
        var halfW = bW / 2;
        var halfH = bH / 2;
        var halfL = bL / 2;

        var x = Math.max(bX - halfW, Math.min(sX, bX + halfW));
        var y = Math.max(bY - halfH, Math.min(sY, bY + halfH));
        var z = Math.max(bZ - halfL, Math.min(sZ, bZ + halfL));
        
        var a = x - sX;
        var b = y - sY;
        var c = z - sZ;

        return a * a + b * b + c * c < sD * sD;
    };
    Touch.sphere_sphere = function(s1x, s1y, s1z, s1d, s2x, s2y, s2z, s2d) {
        var r = s1d / 2 + s2d / 2;
        
        var a = s1x - s2x;
        var b = s1y - s2y;
        var c = s1z - s2z;
        
        return a * a + b * b + c * c < r * r;
    };

    const min = Math.min,
          max = Math.max,
          sqrt = Math.sqrt;

    Touch.SDF = {
        ray_sphere(ray, sphere) {
            var l = {
                x: ray.x - sphere.x,
                y: ray.y - sphere.y,
                z: ray.z - sphere.z
            };
        
            var a = ray.xVel * ray.xVel + ray.yVel * ray.yVel + ray.zVel * ray.zVel;
            var b = 2 * (ray.xVel * l.x + ray.yVel * l.y + ray.zVel * l.z);
            var c = l.x * l.x + l.y * l.y + l.z * l.z - (sphere.d * sphere.d);
        
            var discr = b * b - 4 * a * c;
        
            if (discr < 0 || b > 0) {
                return false;
            } else {
                return (-b - sqrt(discr)) / (2 * a);
            }
        },
        ray_box(r, box) {
            var halfW = box.w / 2;
            var halfH = box.h / 2;
            var halfL = box.l / 2;
            var bx = {
              min: {
                x: box.x - halfW,
                y: box.y - halfH,
                z: box.z - halfL
              },
              max: {
                x: box.x + halfW,
                y: box.y + halfH,
                z: box.z + halfL
              }
            };
          
            var rayNormX = 1 / r.xVel;
            var rayNormY = 1 / r.yVel;
            var rayNormZ = 1 / r.zVel;
          
            var tx1 = (bx.min.x - r.x) * rayNormX;
            var tx2 = (bx.max.x - r.x) * rayNormX;
          
            var tmin = min(tx1, tx2);
            var tmax = max(tx1, tx2);
          
            var ty1 = (bx.min.y - r.y) * rayNormY;
            var ty2 = (bx.max.y - r.y) * rayNormY;
          
            tmin = max(tmin, min(ty1, ty2));
            tmax = min(tmax, max(ty1, ty2));
          
            var tz1 = (bx.min.z - r.z) * rayNormZ;
            var tz2 = (bx.max.z - r.z) * rayNormZ;
          
            tmin = max(tmin, min(tz1, tz2));
            tmax = min(tmax, max(tz1, tz2));
          
            if (tmax < tmin) {
              return false;
            } else {
              var d = tmin < 0 ? tmax : tmin;
              return d < 0 ? false : d;
            }
        },
        ray_plane(ray, plane) {
            var planeBox = {
                x: plane.x,
                y: plane.y,
                z: plane.z,
                w: 1000,
                h: 1000,
                l: 1000
            };
            
            if (plane.normal.z !== 0) {
                planeBox.l = EPSILON;
            }
            if (plane.normal.y !== 0) {
                planeBox.h = EPSILON;
            }
            if (plane.normal.x !== 0) {
                planeBox.w = EPSILON;
            }
            
            return Touch.SDF.ray_box(ray, planeBox);
        },
        ray_triangle(r, triangle) {
            var vertex1 = triangle.v1;
            var edge1 = {
                x: triangle.v2.x - vertex1.x,
                y: triangle.v2.y - vertex1.y,
                z: triangle.v2.z - vertex1.z
            };
            var edge2 = {
                x: triangle.v3.x - vertex1.x,
                y: triangle.v3.y - vertex1.y,
                z: triangle.v3.z - vertex1.z
            };
            var h = {
                x: r.yVel * edge2.z - r.zVel * edge2.y,
                y: r.zVel * edge2.x - r.xVel * edge2.z,
                z: r.xVel * edge2.y - r.yVel * edge2.x
            };
            var a = edge1.x * h.x + edge1.y * h.y + edge1.z * h.z;
            if (a > -EPSILON && a < EPSILON) {
                return false; // This ray is parallel to this triangle.
            }
            var f = 1.0 / a;
            var s = {
                x: r.x - vertex1.x,
                y: r.y - vertex1.y,
                z: r.z - vertex1.z
            };
            var u = f * (s.x * h.x + s.y * h.y + s.z * h.z);
            if (u < 0.0 || u > 1.0) {
                return false;
            }
            var q = {
                x: s.y * edge1.z - s.z * edge1.y,
                y: s.z * edge1.x - s.x * edge1.z,
                z: s.x * edge1.y - s.y * edge1.x
            }
            var v = f * (r.xVel * q.x + r.yVel * q.y + r.zVel * q.z);
            if (v < 0.0 || u + v > 1.0) {
                return false;
            }
            // At this stage we can compute t to find out where the intersection point is on the line.
            var t = f * (edge2.x * q.x + edge2.y * q.y + edge2.z * q.z);
            if (t > EPSILON) {
                return t; // ray intersection
            } else {
                return false; // This means that there is a line intersection but not a ray intersection
            }
        }
    };
    
    let addon = {
        static: {
            Touch
        }
    };
    
    if (typeof Drawlite === "undefined") {
        window.Touch = addon;
    } else {
        Drawlite.addons.push(addon);
    }
})();
