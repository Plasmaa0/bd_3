export function hashCode(str: string) {
    var hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function UniqueColorFromString(str: string) {
    return '#7575d3';
    const color = (Math.round(hashCode(str)) % (255 * 255 * 255))
    return '#' + color.toString(16)
}