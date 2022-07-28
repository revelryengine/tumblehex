const shim = document.createElement('script');
shim.async = true;
shim.src = 'https://ga.jspm.io/npm:es-module-shims@1.5.6/dist/es-module-shims.js';

const element = document.createElement('script');
element.type = 'importmap';
element.textContent = JSON.stringify({
    imports: {
        'revelryengine/' : "https://cdn.jsdelivr.net/gh/revelryengine/",
        'lit'            : "https://cdn.skypack.dev/lit@2.0.2",
        'lit/'           : "https://cdn.skypack.dev/lit@2.0.2/",
    }
});

document.currentScript.after(shim);
document.currentScript.after(element);