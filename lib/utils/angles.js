const PI      = Math.PI;
const TWO_PI  = 2 * Math.PI;
const EPSILON = 0.000001;

export const normalize = (a) => (a + TWO_PI) % TWO_PI;

export const mod  = (n, m) => ((n % m) + m) % m;
export const lte  = (a, b) => a < b || Math.abs(a - b) < EPSILON;
export const diff = (a, b) => {
    const diff = mod(a - b + PI, TWO_PI) - PI;
    return diff < -PI ? diff + TWO_PI : diff;
}

export const between = (a, b, n) => {
    a = normalize(a);
    b = normalize(b);
    n = normalize(n);

    if(lte(a, b))
        return lte(a, n) && lte(n, b);
    return lte(a, n) || lte(n, b);
}