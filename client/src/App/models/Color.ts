import { ColorName, CssColor } from 'src/Shared/SharedTypings';

export type RGB = [r: number, g: number, b: number];
export type RGBA = [r: number, g: number, b: number, a: number];

const COLOR_MAP: { [key in ColorName]: RGB } = {
    [ColorName.Aliceblue]: [240, 248, 255],
    [ColorName.Antiquewhite]: [250, 235, 215],
    [ColorName.Aqua]: [0, 255, 255],
    [ColorName.Aquamarine]: [127, 255, 212],
    [ColorName.Azure]: [240, 255, 255],
    [ColorName.Beige]: [245, 245, 220],
    [ColorName.Bisque]: [255, 228, 196],
    [ColorName.Black]: [0, 0, 0],
    [ColorName.Blanchedalmond]: [255, 235, 205],
    [ColorName.Blue]: [0, 0, 255],
    [ColorName.Blueviolet]: [138, 43, 226],
    [ColorName.Brown]: [165, 42, 42],
    [ColorName.Burlywood]: [222, 184, 135],
    [ColorName.Cadetblue]: [95, 158, 160],
    [ColorName.Chartreuse]: [127, 255, 0],
    [ColorName.Chocolate]: [210, 105, 30],
    [ColorName.Coral]: [255, 127, 80],
    [ColorName.Cornflowerblue]: [100, 149, 237],
    [ColorName.Cornsilk]: [255, 248, 220],
    [ColorName.Crimson]: [220, 20, 60],
    [ColorName.Cyan]: [0, 255, 255],
    [ColorName.Darkblue]: [0, 0, 139],
    [ColorName.Darkcyan]: [0, 139, 139],
    [ColorName.Darkgoldenrod]: [184, 134, 11],
    [ColorName.Darkgray]: [169, 169, 169],
    [ColorName.Darkgreen]: [0, 100, 0],
    [ColorName.Darkkhaki]: [189, 183, 107],
    [ColorName.Darkmagenta]: [139, 0, 139],
    [ColorName.Darkolivegreen]: [85, 107, 47],
    [ColorName.Darkorange]: [255, 140, 0],
    [ColorName.Darkorchid]: [153, 50, 204],
    [ColorName.Darkred]: [139, 0, 0],
    [ColorName.Darksalmon]: [233, 150, 122],
    [ColorName.Darkseagreen]: [143, 188, 143],
    [ColorName.Darkslateblue]: [72, 61, 139],
    [ColorName.Darkslategray]: [47, 79, 79],
    [ColorName.Darkturquoise]: [0, 206, 209],
    [ColorName.Darkviolet]: [148, 0, 211],
    [ColorName.Deeppink]: [255, 20, 147],
    [ColorName.Deepskyblue]: [0, 191, 255],
    [ColorName.Dimgray]: [105, 105, 105],
    [ColorName.Dodgerblue]: [30, 144, 255],
    [ColorName.Firebrick]: [178, 34, 34],
    [ColorName.Floralwhite]: [255, 250, 240],
    [ColorName.Forestgreen]: [34, 139, 34],
    [ColorName.Fuchsia]: [255, 0, 255],
    [ColorName.Gainsboro]: [220, 220, 220],
    [ColorName.Ghostwhite]: [248, 248, 255],
    [ColorName.Gold]: [255, 215, 0],
    [ColorName.Goldenrod]: [218, 165, 32],
    [ColorName.Gray]: [128, 128, 128],
    [ColorName.Green]: [0, 128, 0],
    [ColorName.Greenyellow]: [173, 255, 47],
    [ColorName.Honeydew]: [240, 255, 240],
    [ColorName.Hotpink]: [255, 105, 180],
    [ColorName.Indianred]: [205, 92, 92],
    [ColorName.Indigo]: [75, 0, 130],
    [ColorName.Ivory]: [255, 255, 240],
    [ColorName.Khaki]: [240, 230, 140],
    [ColorName.Lavender]: [230, 230, 250],
    [ColorName.Lavenderblush]: [255, 240, 245],
    [ColorName.Lawngreen]: [124, 252, 0],
    [ColorName.Lemonchiffon]: [255, 250, 205],
    [ColorName.Lightblue]: [173, 216, 230],
    [ColorName.Lightcoral]: [240, 128, 128],
    [ColorName.Lightcyan]: [224, 255, 255],
    [ColorName.Lightgoldenrodyellow]: [250, 250, 210],
    [ColorName.Lightgrey]: [211, 211, 211],
    [ColorName.Lightgreen]: [144, 238, 144],
    [ColorName.Lightpink]: [255, 182, 193],
    [ColorName.Lightsalmon]: [255, 160, 122],
    [ColorName.Lightseagreen]: [32, 178, 170],
    [ColorName.Lightskyblue]: [135, 206, 250],
    [ColorName.Lightslategray]: [119, 136, 153],
    [ColorName.Lightsteelblue]: [176, 196, 222],
    [ColorName.Lightyellow]: [255, 255, 224],
    [ColorName.Lime]: [0, 255, 0],
    [ColorName.Limegreen]: [50, 205, 50],
    [ColorName.Linen]: [250, 240, 230],
    [ColorName.Magenta]: [255, 0, 255],
    [ColorName.Maroon]: [128, 0, 0],
    [ColorName.Mediumaquamarine]: [102, 205, 170],
    [ColorName.Mediumblue]: [0, 0, 205],
    [ColorName.Mediumorchid]: [186, 85, 211],
    [ColorName.Mediumpurple]: [147, 112, 216],
    [ColorName.Mediumseagreen]: [60, 179, 113],
    [ColorName.Mediumslateblue]: [123, 104, 238],
    [ColorName.Mediumspringgreen]: [0, 250, 154],
    [ColorName.Mediumturquoise]: [72, 209, 204],
    [ColorName.Mediumvioletred]: [199, 21, 133],
    [ColorName.Midnightblue]: [25, 25, 112],
    [ColorName.Mintcream]: [245, 255, 250],
    [ColorName.Mistyrose]: [255, 228, 225],
    [ColorName.Moccasin]: [255, 228, 181],
    [ColorName.Navajowhite]: [255, 222, 173],
    [ColorName.Navy]: [0, 0, 128],
    [ColorName.Oldlace]: [253, 245, 230],
    [ColorName.Olive]: [128, 128, 0],
    [ColorName.Olivedrab]: [107, 142, 35],
    [ColorName.Orange]: [255, 165, 0],
    [ColorName.Orangered]: [255, 69, 0],
    [ColorName.Orchid]: [218, 112, 214],
    [ColorName.Palegoldenrod]: [238, 232, 170],
    [ColorName.Palegreen]: [152, 251, 152],
    [ColorName.Paleturquoise]: [175, 238, 238],
    [ColorName.Palevioletred]: [216, 112, 147],
    [ColorName.Papayawhip]: [255, 239, 213],
    [ColorName.Peachpuff]: [255, 218, 185],
    [ColorName.Peru]: [205, 133, 63],
    [ColorName.Pink]: [255, 192, 203],
    [ColorName.Plum]: [221, 160, 221],
    [ColorName.Powderblue]: [176, 224, 230],
    [ColorName.Purple]: [128, 0, 128],
    [ColorName.Rebeccapurple]: [102, 51, 153],
    [ColorName.Red]: [255, 0, 0],
    [ColorName.Rosybrown]: [188, 143, 143],
    [ColorName.Royalblue]: [65, 105, 225],
    [ColorName.Saddlebrown]: [139, 69, 19],
    [ColorName.Salmon]: [250, 128, 114],
    [ColorName.Sandybrown]: [244, 164, 96],
    [ColorName.Seagreen]: [46, 139, 87],
    [ColorName.Seashell]: [255, 245, 238],
    [ColorName.Sienna]: [160, 82, 45],
    [ColorName.Silver]: [192, 192, 192],
    [ColorName.Skyblue]: [135, 206, 235],
    [ColorName.Slateblue]: [106, 90, 205],
    [ColorName.Slategray]: [112, 128, 144],
    [ColorName.Snow]: [255, 250, 250],
    [ColorName.Springgreen]: [0, 255, 127],
    [ColorName.Steelblue]: [70, 130, 180],
    [ColorName.Tan]: [210, 180, 140],
    [ColorName.Teal]: [0, 128, 128],
    [ColorName.Thistle]: [216, 191, 216],
    [ColorName.Tomato]: [255, 99, 71],
    [ColorName.Turquoise]: [64, 224, 208],
    [ColorName.Violet]: [238, 130, 238],
    [ColorName.Wheat]: [245, 222, 179],
    [ColorName.White]: [255, 255, 255],
    [ColorName.Whitesmoke]: [245, 245, 245],
    [ColorName.Yellow]: [255, 255, 0],
    [ColorName.Yellowgreen]: [154, 205, 50],
};

export const colorToRgb = (color: string, defaultColor?: RGB): RGB | undefined => {
    const col = color.trim().toLowerCase();
    const namedColor = COLOR_MAP[col as ColorName];
    return namedColor ?? defaultColor;
};

/**
 * @param number [number] between 0 and 9, specifying the alpha of the given rgb baseColor
 *          * 0 -> transparent
 *          * 9 -> opaque (solid)
 * @param baseColor [RGB, ColorName]
 */
const numberToColor = (alpha: number, baseColor: ColorName | RGB = ColorName.Red): string => {
    let base: RGB;
    if (typeof baseColor === 'string') {
        base = colorToRgb(baseColor) ?? [255, 0, 0];
    } else {
        base = baseColor ?? [255, 0, 0];
    }
    let alphaLevel = alpha;
    if (alphaLevel > 9) {
        alphaLevel = 9;
    } else if (alphaLevel < 0 || !alphaLevel) {
        alphaLevel = 0;
    }
    return `rgba(${base[0]},${base[1]},${base[2]},${alphaLevel / 9})`;
};

export const toCssColor = (
    color?: CssColor,
    baseColor: ColorName | RGB = ColorName.Red
): string | undefined => {
    if (!color) {
        return;
    }
    switch (typeof color) {
        case 'string':
            if (color.length === 1) {
                const alpha = Number.parseInt(color, 10);
                return numberToColor(alpha, baseColor);
            }
            return color;
        case 'number':
            return numberToColor(color, baseColor);
    }
    if (color.length === 3) {
        return `rgb(${color[0]},${color[1]},${color[2]})`;
    }
    return `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
};
