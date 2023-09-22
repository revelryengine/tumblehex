const element = document.createElement('script');
element.type = 'importmap';
element.textContent = JSON.stringify({
    imports: {
        'revelryengine/ecs/'      : 'https://cdn.jsdelivr.net/gh/revelryengine/ecs@v0.2.0-alpha/',
        'revelryengine/core/'     : 'https://cdn.jsdelivr.net/gh/revelryengine/core@v0.2.0-alpha/',
        'revelryengine/gltf/'     : 'https://cdn.jsdelivr.net/gh/revelryengine/gltf@v0.1.3-alpha/',
        'revelryengine/renderer/' : 'https://cdn.jsdelivr.net/gh/revelryengine/renderer@v0.2.0-alpha/',
        "gl-matrix"               : "https://cdn.jsdelivr.net/gh/toji/gl-matrix@v3.4.1/src/index.js",
        'lit'                     : 'https://cdn.skypack.dev/lit@2.0.2',
        'lit/'                    : 'https://cdn.skypack.dev/lit@2.0.2/',
        
    }
});
document.currentScript.after(element);
