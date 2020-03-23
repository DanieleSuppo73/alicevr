/* wait to resolve for a key-value of an object */
export const waitProperty = (object, key, value) => new Promise(resolve => setTimeout(() => {
    if (object[key] === value) resolve();
    else waitProperty(object, key, value);
}, 200));