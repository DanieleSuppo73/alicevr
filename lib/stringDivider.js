////////////////// divide string if it's too long
/// parameter
/// @string
/// @maximum width
/// @space replacer

export function stringDivider(str, width, spaceReplacer = "\n") {
    if (str.length > width) {
        var p = width
        for (; p > 0 && str[p] != ' '; p--) {}
        if (p > 0) {
            var left = str.substring(0, p);
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
}