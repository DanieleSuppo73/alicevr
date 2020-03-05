// Obtient une valeur comprise dans un interval
Math.clamp = function (value, min, max) {

    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    }

    return value;
};

// Obtient une interpolation linéaire entre 2 valeurs
Math.lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return (1 - amount) * value1 + amount * value2;
};


// Clamp angle
Math.wrap = function (inValue, inMin, inMax) {
    valueRange = inMax - inMin;
    return (inMin + ((((inValue - inMin) % valueRange) + valueRange) % valueRange));
}


Math.inverseLerp = function( a, b, v ) {
    return ( v - a ) / ( b - a );
};


Math.radToDeg = function (radians) {
    return radians * (180 / Math.PI);
}



Math.degToRad = function (angle) {
    return angle * (Math.PI / 180);
}

