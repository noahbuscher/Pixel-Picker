# Pixel Picker

`v0.1.1`

Create cool pixel art. Used on Designer News.

![](https://dl.dropboxusercontent.com/s/yvsi1tuq86m9vww/GifPixelTree.gif)

## Installation

* Include jQuery
* Include the plugin JS
* Create a canvas on the document. It should look similar to this:

    ```
    <canvas width="300" height="300" id="pixel-picker"></canvas>
    ```
* Finally, fire up the plugin using `pixelPicker` on the canvas.

    ```
    $('#pixel-picker').pixelPicker();
    ```

## Options

#### palette

`Array` | The colors that can be used to fill cells.

Can be CSS hex strings:

```
palette: [ '#ff0000', '#0000ff', '#ffff00', '#008000' ]
```

Or CSS RGB strings (sorry, RGBA is not supported):

```
palette: [ 'rgb(249, 210, 48)', 'rgb(95, 105, 121)', 'rgb(38, 174, 144)', 'rgb(144, 153, 167)' ]
```

Or arrays of RGB values:

```
palette: [ [255,255,255], [95,105,121], [144,153,167], [38,174,144] ]
```

Default:

```
[ '#ffffff', '#000000',
'#ff0000', '#0000ff',
'#ffff00', '#008000' ]
```

### borderColor

`String` | The color used for the cell borders

Can be any valid HEX code.

Default: `#878787`

### size

`Int` | The size of each cell in pixels

Pixel Picker calclates how many cells can fit in the current canvas layout for you.

Default: `20`

#### eraserColor

`String` | The color used for the eraser

Can be any of the values used for `palette`.

If set the color will be prepended to the palette. If left as `null` the eraser will default to the first color in your palette.

Default: `null`

#### update

`Function` or jQuery object | What to do when the color map (cells) gets updated

Can be a function (with the color map as an argument):

```
update: function(map) {
  console.log(map);
}
```

Or it can be a jQuery object that has a `value` attribute, which will be updated:

```
update: $('.pixel-values-hidden-input')
```

Default: `null`

## Usage

Once installed, you can click within a cell to do things:

* Click to fill a cell with the next color in your palette
* Right click to do the same, but in reverse
* CMD (or CTRL) click to erase the cell's color
* Click and drag around to fill surrounding cells with that same color

## License

MIT

## Contribute

If you find a bug or want to improve the plugin, just submit a pull request. Take care to maintain existing code style.
