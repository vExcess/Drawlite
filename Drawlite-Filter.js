/*

    filter.js addon for Drawlite.js
    
    Credits:
        Guassian Blur - https://github.com/nodeca/glur/blob/master/index.js
        - All other code is written Vexcess and is available under the MIT license (https://opensource.org/license/mit/)
*/
(() => {
    function convolveRGBA(src, out, line, coeff, width, height) {
        // for guassian blur
        // takes src image and writes the blurred and transposed result into out
        var rgba;
        var prev_src_r, prev_src_g, prev_src_b, prev_src_a;
        var curr_src_r, curr_src_g, curr_src_b, curr_src_a;
        var curr_out_r, curr_out_g, curr_out_b, curr_out_a;
        var prev_out_r, prev_out_g, prev_out_b, prev_out_a;
        var prev_prev_out_r, prev_prev_out_g, prev_prev_out_b, prev_prev_out_a;
    
        var src_index, out_index, line_index;
        var i, j;
        var coeff_a0, coeff_a1, coeff_b1, coeff_b2;
    
        for (i = 0; i < height; i++) {
            src_index = i * width;
            out_index = i;
            line_index = 0;
    
            // left to right
            rgba = src[src_index];
    
            prev_src_r = rgba & 0xff;
            prev_src_g = (rgba >> 8) & 0xff;
            prev_src_b = (rgba >> 16) & 0xff;
            prev_src_a = (rgba >> 24) & 0xff;
    
            prev_prev_out_r = prev_src_r * coeff[6];
            prev_prev_out_g = prev_src_g * coeff[6];
            prev_prev_out_b = prev_src_b * coeff[6];
            prev_prev_out_a = prev_src_a * coeff[6];
    
            prev_out_r = prev_prev_out_r;
            prev_out_g = prev_prev_out_g;
            prev_out_b = prev_prev_out_b;
            prev_out_a = prev_prev_out_a;
    
            coeff_a0 = coeff[0];
            coeff_a1 = coeff[1];
            coeff_b1 = coeff[4];
            coeff_b2 = coeff[5];
    
            for (j = 0; j < width; j++) {
                rgba = src[src_index];
                curr_src_r = rgba & 0xff;
                curr_src_g = (rgba >> 8) & 0xff;
                curr_src_b = (rgba >> 16) & 0xff;
                curr_src_a = (rgba >> 24) & 0xff;
    
                curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
                curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
                curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
                curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;
    
                prev_prev_out_r = prev_out_r;
                prev_prev_out_g = prev_out_g;
                prev_prev_out_b = prev_out_b;
                prev_prev_out_a = prev_out_a;
    
                prev_out_r = curr_out_r;
                prev_out_g = curr_out_g;
                prev_out_b = curr_out_b;
                prev_out_a = curr_out_a;
    
                prev_src_r = curr_src_r;
                prev_src_g = curr_src_g;
                prev_src_b = curr_src_b;
                prev_src_a = curr_src_a;
    
                line[line_index] = prev_out_r;
                line[line_index + 1] = prev_out_g;
                line[line_index + 2] = prev_out_b;
                line[line_index + 3] = prev_out_a;
                line_index += 4;
                src_index++;
            }
    
            src_index--;
            line_index -= 4;
            out_index += height * (width - 1);
    
            // right to left
            rgba = src[src_index];
    
            prev_src_r = rgba & 0xff;
            prev_src_g = (rgba >> 8) & 0xff;
            prev_src_b = (rgba >> 16) & 0xff;
            prev_src_a = (rgba >> 24) & 0xff;
    
            prev_prev_out_r = prev_src_r * coeff[7];
            prev_prev_out_g = prev_src_g * coeff[7];
            prev_prev_out_b = prev_src_b * coeff[7];
            prev_prev_out_a = prev_src_a * coeff[7];
    
            prev_out_r = prev_prev_out_r;
            prev_out_g = prev_prev_out_g;
            prev_out_b = prev_prev_out_b;
            prev_out_a = prev_prev_out_a;
    
            curr_src_r = prev_src_r;
            curr_src_g = prev_src_g;
            curr_src_b = prev_src_b;
            curr_src_a = prev_src_a;
    
            coeff_a0 = coeff[2];
            coeff_a1 = coeff[3];
    
            for (j = width - 1; j >= 0; j--) {
                curr_out_r = curr_src_r * coeff_a0 + prev_src_r * coeff_a1 + prev_out_r * coeff_b1 + prev_prev_out_r * coeff_b2;
                curr_out_g = curr_src_g * coeff_a0 + prev_src_g * coeff_a1 + prev_out_g * coeff_b1 + prev_prev_out_g * coeff_b2;
                curr_out_b = curr_src_b * coeff_a0 + prev_src_b * coeff_a1 + prev_out_b * coeff_b1 + prev_prev_out_b * coeff_b2;
                curr_out_a = curr_src_a * coeff_a0 + prev_src_a * coeff_a1 + prev_out_a * coeff_b1 + prev_prev_out_a * coeff_b2;
    
                prev_prev_out_r = prev_out_r;
                prev_prev_out_g = prev_out_g;
                prev_prev_out_b = prev_out_b;
                prev_prev_out_a = prev_out_a;
    
                prev_out_r = curr_out_r;
                prev_out_g = curr_out_g;
                prev_out_b = curr_out_b;
                prev_out_a = curr_out_a;
    
                prev_src_r = curr_src_r;
                prev_src_g = curr_src_g;
                prev_src_b = curr_src_b;
                prev_src_a = curr_src_a;
    
                rgba = src[src_index];
                curr_src_r = rgba & 0xff;
                curr_src_g = (rgba >> 8) & 0xff;
                curr_src_b = (rgba >> 16) & 0xff;
                curr_src_a = (rgba >> 24) & 0xff;
    
                rgba = ((line[line_index] + prev_out_r) << 0) +
                    ((line[line_index + 1] + prev_out_g) << 8) +
                    ((line[line_index + 2] + prev_out_b) << 16) +
                    ((line[line_index + 3] + prev_out_a) << 24);
    
                out[out_index] = rgba;
    
                src_index--;
                line_index -= 4;
                out_index -= height;
            }
        }
    };
    
    // constants
    let THRESHOLD = 1, 
        GRAYSCALE = 2, 
        OPACITY = 3, 
        INVERT = 4, 
        POSTERIZE = 5, 
        BLUR = 6, 
        ERODE = 7, 
        DILATE = 8,
        MEDIAN_CUT = 9,
        BRIGHTNESS = 10,
        HUE_ROTATE = 11,
        SATURATE = 12,
        CONTRAST = 13,
        SEPIA = 14;
    
    function filter(D, kind, x, y, w, h, param) {
        if (y === undefined) {
            param = x;
            x = 0;
            y = 0;
            w = D.width;
            h = D.height;
        }
        
        var Color = D.Color;
        var imageData = D.ctx.getImageData(x, y, w, h);
        var p = imageData.data;
        
        switch (kind) {
            case THRESHOLD:
                param = (param === undefined ? 0.5 : param) * 255;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        if ((p[i] + p[i+1] + p[i+2]) / 3 < param) {
                            p[i] = 0;
                            p[i + 1] = 0;
                            p[i + 2] = 0;
                        } else {
                            p[i] = 255;
                            p[i + 1] = 255;
                            p[i + 2] = 255;
                        }
                    }
                }
            break;
            
            case GRAYSCALE:
                param = D.constrain(param ?? 1, 0, 1);
                var inv = 1 - param;
                if (inv === 0) {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            var gy = (p[i] + p[i+1] + p[i+2]) / 3;
                            p[i  ] = gy;
                            p[i+1] = gy;
                            p[i+2] = gy;
                        }
                    }
                } else {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            var gy = (p[i] + p[i+1] + p[i+2]) / 3 * param;
                            p[i  ] = p[i  ] * inv + gy;
                            p[i+1] = p[i+1] * inv + gy;
                            p[i+2] = p[i+2] * inv + gy;
                        }
                    }
                }
            break;
            
            case OPACITY:
                param = (param ?? 1) * 255;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        p[i+3] = param;
                    }
                }
            break;
            
            case INVERT:
                param = D.constrain(param ?? 1, 0, 1);
                var inv = 1 - param;
                if (inv === 0) {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            p[i  ] = 255 - p[i  ];
                            p[i+1] = 255 - p[i+1];
                            p[i+2] = 255 - p[i+2];
                        }
                    }
                } else {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            p[i  ] = p[i  ] * inv + (255 - p[i  ]) * param;
                            p[i+1] = p[i+1] * inv + (255 - p[i+1]) * param;
                            p[i+2] = p[i+2] * inv + (255 - p[i+2]) * param;
                        }
                    }
                }
            break;
            
            case POSTERIZE:
                var l = D.constrain(param, 2, 255);
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        p[i  ] = ((p[i  ] * l) >> 8) * 255 / l;
                        p[i+1] = ((p[i+1] * l) >> 8) * 255 / l;
                        p[i+2] = ((p[i+2] * l) >> 8) * 255 / l;
                    }
                }
            break;
            
            case BLUR:
                var a0, a1, a2, a3, b1, b2, left_corner, right_corner;
            
                // Unify input data type, to keep convolver calls isomorphic
                var src32 = new Uint32Array(p.buffer);
            
                var out = new Uint32Array(src32.length);
                var tmp_line = new Float32Array(Math.max(w, h) * 4);
            
                // gaussCoef
                var sigma = param ?? 1;
                if (sigma < 0.5) {
                    sigma = 0.5;
                }
                
                var a = Math.exp(0.726 * 0.726) / sigma,
                    g1 = Math.exp(-a),
                    g2 = Math.exp(-2 * a),
                    k = (1 - g1) * (1 - g1) / (1 + 2 * a * g1 - g2);
                
                a0 = k;
                a1 = k * (a - 1) * g1;
                a2 = k * (a + 1) * g1;
                a3 = -k * g2;
                b1 = 2 * g1;
                b2 = -g2;
                left_corner = (a0 + a1) / (1 - b1 - b2);
                right_corner = (a2 + a3) / (1 - b1 - b2);
              
                var coeff = new Float32Array([a0, a1, a2, a3, b1, b2, left_corner, right_corner]);
            
                convolveRGBA(src32, out, tmp_line, coeff, w, h, sigma);
                convolveRGBA(out, src32, tmp_line, coeff, h, w, sigma);
            break;
            
            case ERODE:
                // ---
            break;
            
            case DILATE:
                // ---
            break;
            
            case MEDIAN_CUT:
                param = param ?? 128;
                
                var buckets = [[]],
                    minR = 255, maxR = 0,
                    minG = 255, maxG = 0,
                    minB = 255, maxB = 0,
                    rangeR = maxR - minR,
                    rangeG = maxG - minG,
                    rangeB = maxB - minB,
                    maxRange = -1,
                    colors = [];
    
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        if (p[i  ] < minR) minR = p[i  ];
                        if (p[i  ] > maxR) maxR = p[i  ];
                        if (p[i+1] < minG) minG = p[i+1];
                        if (p[i+1] > maxG) maxG = p[i+1];
                        if (p[i+2] < minB) minB = p[i+2];
                        if (p[i+2] > maxB) maxB = p[i+2];
                        buckets[0].push([p[i], p[i+1], p[i+2]]);
                    }
                }
                
                if (rangeR > rangeG)
                    maxRange = rangeR > rangeB ? 0 : 2;
                else
                    maxRange = rangeG > rangeB ? 1 : 2;
                
                buckets[0].sort((a, b) => a[maxRange] - b[maxRange]);
                
                while (buckets.length < param) {
                    for (var i = 0, len = buckets.length; i < len; i++) {
                        buckets.push(buckets[i].slice(buckets[i].length / 2));
                        buckets[i] = buckets[i].slice(0, buckets[i].length / 2);
                    }
                }
                
                for (var i = 0; i < buckets.length; i++) {
                    colors.push(buckets[i][Math.round(buckets[i].length / 2)]);
                }
                
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2,
                            closestDist = Infinity,
                            closestIdx = 0;
                        
                        for (var c = 0; c < colors.length; c++) {
                            var rd = p[i  ] - colors[c][0],
                                gd = p[i+1] - colors[c][1],
                                bd = p[i+2] - colors[c][2],
                                d = rd*rd + gd*gd + bd*bd;
                            
                            if (d < closestDist) {
                                closestDist = d;
                                closestIdx = c;
                            }
                        }
                        
                        p[i  ] = colors[closestIdx][0];
                        p[i+1] = colors[closestIdx][1];
                        p[i+2] = colors[closestIdx][2];
                        p[i+3] = 255;
                    }
                }
            break;
            
            case BRIGHTNESS:
                param = param ?? 1;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        p[i  ] = p[i  ] * param;
                        p[i+1] = p[i+1] * param;
                        p[i+2] = p[i+2] * param;
                    }
                }
            break;
            
            case HUE_ROTATE:
                param = param ?? 0;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        var c = Color.RGBtoHSB(p[i], p[i+1], p[i+2]);
                        c[0] = (c[0] + param) % 360;
                        c = Color.HSBtoRGB(c[0], c[1], c[2]);
                        p[i  ] = c[0];
                        p[i+1] = c[1];
                        p[i+2] = c[2];
                    }
                }
            break;
            
            case SATURATE:
                param = param ?? 1;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        var c = Color.RGBtoHSB(p[i], p[i+1], p[i+2]);
                        c = Color.HSBtoRGB(c[0], c[1] * param, c[2]);
                        p[i  ] = c[0];
                        p[i+1] = c[1];
                        p[i+2] = c[2];
                    }
                }
            break;
            
            case CONTRAST:
                param = param ?? 1;
                for (var xx = 0; xx < w; xx++) {
                    for (var yy = 0; yy < h; yy++) {
                        var i = (xx + yy * w) << 2;
                        p[i  ] = param * (p[i  ] - 128) + 128;
                        p[i+1] = param * (p[i+1] - 128) + 128;
                        p[i+2] = param * (p[i+2] - 128) + 128;
                    }
                }
            break;
            
            case SEPIA:
                param = D.constrain(param ?? 1, 0, 1);
                var inv = 1 - param;
                if (inv === 0) {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            var r = p[i], g = p[i+1], b = p[i+2];
                            p[i  ] = (r * .393) + (g *.769) + (b * .189);
                            p[i+1] = (r * .349) + (g *.686) + (b * .168);
                            p[i+2] = (r * .272) + (g *.534) + (b * .131);
                        }
                    }
                } else {
                    for (var xx = 0; xx < w; xx++) {
                        for (var yy = 0; yy < h; yy++) {
                            var i = (xx + yy * w) << 2;
                            var r = p[i], g = p[i+1], b = p[i+2];
                            p[i  ] = p[i  ] * inv + ((r * .393) + (g *.769) + (b * .189)) * param;
                            p[i+1] = p[i  ] * inv + ((r * .349) + (g *.686) + (b * .168)) * param;
                            p[i+2] = p[i  ] * inv + ((r * .272) + (g *.534) + (b * .131)) * param;
                        }
                    }
                }
            break;
        }
        
        D.ctx.putImageData(imageData, x, y);
    }
    
    let addon = {
        static: {
            THRESHOLD, 
            GRAYSCALE, 
            OPACITY, 
            INVERT, 
            POSTERIZE, 
            BLUR, 
            ERODE, 
            DILATE,
            MEDIAN_CUT,
            BRIGHTNESS,
            HUE_ROTATE,
            SATURATE,
            CONTRAST,
            SEPIA
        },
        methods: {
            filter
        }
    };
    
    if (typeof Drawlite === "undefined") {
        window.filterAddon = addon;
    } else {
        Drawlite.addons.push(addon);
    }
})();
