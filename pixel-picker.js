/*!
 * Pixel Picker - a jQuery plugin to create cool pixel art.
 *
 * Copyright (c) 2015 Designer News Ltd.
 *
 * Project home:
 *   https://github.com/DesignerNews/pixel-picker
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  0.1.1
 */

(function ($) {

  $.fn.pixelPicker = function(options) {
    var settings,
        rows,
        currentColor,
        isErasing = false,
        isDragging = false,
        palette = [],
        map = [];

    // Init canvas
    var c = $(this).get(0),
        ctx = c.getContext('2d');

    ctx.canvas.height = ctx.canvas.height + 1;
    ctx.canvas.width = ctx.canvas.width + 1;

    cycleColor = function(cell, reverse) {
      var cellColor = parseColor(cell.color);

      // If we're in eraser mode, return early
      if (isErasing) {
        return currentColor = parseColor(settings.eraserColor);
      };

      // Locate our position in the palette based on our
      // current cell's background color
      var currentIndex = (function() {
        var matchingIndex;

        palette.forEach(function(color, index) {
          if (arrayEqual(color, cellColor)) {
            matchingIndex = index;
          };
        });

        return matchingIndex;
      })();

      var nextIndex = (function() {
        if (reverse) {
          // Go back in the array, or to the end if we've reached the beginning
          return (currentIndex - 1) === -1 ? palette.length - 1 : (currentIndex - 1);
        } else {
          // Go forward in the array, or the beginning if we've reached the end
          return (currentIndex + 1) in palette ? (currentIndex + 1) : 0;
        };
      })();

      // Set the new global current color!
      return currentColor = palette[nextIndex];
    };

    // Determine if we need to parse a hex or rgb value
    parseColor = function(color) {
      // If the color is already an RGB array, return
      if (Object.prototype.toString.call(color) === '[object Array]') {
        return color;
      };

      return color.charAt(0) === '#' ? parseHex(color) : parseRgb(color);
    };

    // Parse a hex value to an RGB array (i.e. [255,255,255])
    parseHex = function(hexValue) {
      var rgb = parseInt(hexValue.substring(1), 16);
      return [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
    };

    // Parse an RGB value to an RGB array (i.e. [255,255,255])
    parseRgb = function(rgbValue) {
      return rgbValue.replace(/[^\d,]/g, '').split(',').map(function(value) {
        return parseInt(value, 10);
      });
    };

    arrayEqual = function(a, b) {
      return a.length === b.length && a.every(function(elem, i) {
        return elem === b[i];
      });
    };

    arrayToRgb = function(inArray) {
      return 'rgb(' + inArray[0] + ', ' + inArray[1] + ', ' + inArray[2] + ')';
    };

    updateHandler = function(index, dontHandle) {
      var handler = settings.update;
      var newColor = currentColor;

      map[index].color = newColor;

      if (dontHandle) return;

      if (typeof handler === 'function') {
        // We can either pass off the updated map to a function
        handler(map);
      } else if (handler instanceof jQuery) {
        // Or, we can update the value="" of a jQuery input
        handler.val(JSON.stringify(map));
      }
    };

    makeCell = function(x, y, width, height) {
      var cell = {};

      cell.x = x;
      cell.y = y;
      cell.width = width;
      cell.height = height;
      cell.color = currentColor;

      map.push(cell);

      ctx.strokeRect(x, y, width, height);
    }

    // Draw the cells
    drawCells = function() {
      var borderColor = '#878787',
          canvasWidth = c.width,
          canvasHeight = c.height;

      var colCount = Math.floor(canvasWidth / settings.size);
      var rowCount = Math.floor(canvasHeight / settings.size);

      ctx.strokeStyle = borderColor;

      for (i = 0; i <= colCount; i++) {
        var colPos = i * settings.size + 0.5;

        for (r = 0; r <= rowCount; r++) {
          var rowPos = r * settings.size + 0.5;

          makeCell(colPos, rowPos, settings.size, settings.size);
        }
      }
    };

    findCellIndex = function(x, y) {
      for (var i = 0; i < map.length; i++) {
        var left = map[i].x,
            right = map[i].x + map[i].width,
            top = map[i].y,
            bottom = map[i].y + map[i].height;

        if (right >= x && left <= x && bottom >= y && top <= y) {
          return i;
        }
      }
    }

    chooseColor = function(x, y, reverse) {
      var selectedCell = map[findCellIndex(x, y)];
      cycleColor(selectedCell, reverse);
    }

    colorCell = function(x, y) {
      var selectedCell = map[findCellIndex(x, y)];

      updateHandler(findCellIndex(x, y));

      ctx.fillStyle = arrayToRgb(currentColor);
      ctx.fillRect(selectedCell.x + 0.5, selectedCell.y + 0.5, selectedCell.width - 1, selectedCell.height - 1);
    }

    settings = $.extend({
      update: null,
      ready: null,
      eraserColor: null,
      size: 20,
      palette: [
        '#ffffff', '#000000',
        '#ff0000', '#0000ff',
        '#ffff00', '#008000'
      ]
    }, options);

    settings.palette.forEach(function(color) {
      palette.push(parseColor(color));
    });

    if (settings.eraserColor == null) {
      settings.eraserColor = settings.palette[0];
    } else {
      palette.unshift(parseColor(settings.eraserColor));
    }

    $(c)
      // Prevent context menu from showing up over top of cells
      .on('contextmenu', function(event) {
        return event.preventDefault();
      })
      // When CTRL (Mac) or CMD (Windows) key is down, eraser is active
      .on('keydown', function(event) {
        if (event.metaKey || event.ctrlKey) isErasing = true;
      })
      // When CTRL (Mac) or CMD (Windows) key is released, eraser is inactive
      .on('keyup', function(event) {
        if (!event.metaKey && !event.ctrlKey) isErasing = false;
      });

    currentColor = settings.palette[0];

    drawCells();

    $(c).on('mousedown', function(event) {
      var isRightClick = ('which' in event && event.which === 3) || ('button' in event && event.button === 2);

      isDragging = true;

      var x = Math.floor((event.pageX-$(c).offset().left));
      var y = Math.floor((event.pageY-$(c).offset().top));

      chooseColor(x, y, isRightClick);
      colorCell(x, y);
    });

    $(c).on('mousemove', function(event) {
      if (!isDragging) return;

      var x = Math.floor((event.pageX-$(c).offset().left));
      var y = Math.floor((event.pageY-$(c).offset().top));

      colorCell(x, y);
    });

    $(c).on('mouseup', function() {
      isDragging = false;
    });

    return this;
  };

}(jQuery));
