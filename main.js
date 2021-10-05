function main(){
    console.log("MAIN")

    const previewCanvas = document.getElementById('previewCanvas')
    const gl = previewCanvas.getContext('webgl')

    let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;

        uniform vec3 uPosition;

        void main(){
            gl_PointSize = 10.0;
            gl_Position = vec4(aPosition + uPosition, 1.0);
            vColor = aColor;
        }
    `;

    let fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        
        void main(){
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    colorSoPink = [181/255, 94/255, 129/255];
    colorRatherPink = [117/255, 55/255, 66/255];
    colorNotPink = [79/255, 55/255, 63/255];
    colorSeemsBlack = [23/255, 19/255, 22/255];

    eraserObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource)
    // eraserObj.vertices = [
    //     -0.61, 0.26, 0.0, ...colorSoPink,     // 0
    //      0.62, 0.26, 0.0, ...colorSoPink,     // 1
    //      0.75, -0.14, 0.0, ...colorSoPink,    // 2
    //      -0.75, -0.1, 0.0, ...colorSoPink,    // 3
    //      -0.71, -0.25, 0.0, ...colorNotPink,   // 4
    //      0.72, -0.28, 0.0, ...colorNotPink,    // 5
    //      -0.65, -0.36, 0.0, ...colorSeemsBlack,   // 6
    //      0.66, -0.36, 0.0, ...colorSeemsBlack,    // 7
    // ];
    // eraserObj.indices = [
    //     0, 1, 2,
    //     2, 3, 0,
    //     3, 2, 5,
    //     3, 5, 4,
    //     4, 5, 7,
    //     4, 7, 6
    // ];

    eraserObj.vertices = [
        -0.61, 0.26, 0.0, ...colorSoPink,     // 0
         0.62, 0.26, 0.0, ...colorSoPink,     // 1
         0.75, -0.14, 0.0, ...colorSoPink,    // 2
         -0.75, -0.1, 0.0, ...colorSoPink,    // 3
         -0.71, -0.25, 0.0, ...colorNotPink,   // 4
         0.72, -0.28, 0.0, ...colorNotPink,    // 5
         -0.65, -0.36, 0.0, ...colorSeemsBlack,   // 6
         0.66, -0.36, 0.0, ...colorSeemsBlack,    // 7
    ];
    eraserObj.indices = [
        0, 1, 2,
        2, 3, 0,
        3, 2, 5,
        3, 5, 4,
        4, 5, 7,
        4, 7, 6
    ];

    eraserObj.vertices = eraserObj.vertices.map((x, i) => {
        if (i % 6 >= 3) {
            return x;
        }
        return x * 0.5
    });
    eraserObj.pos.y = -0.5
    // eraserObj.animateFunc = function(pos){  
    //     pos.x += 0.0089
    //     return pos
    // }
    
    // otherObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource)
    // otherObj.vertices = [
    //     -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,     // Point A
    //      0.5, -0.5, 0.0, 0.0, 0.0, 1.0,     // Point B
    //      1.0,  0.5, 0.0, 1.0, 0.0, 0.0      // Point C
    // ];
    // otherObj.indices = [
    //     0, 1, 2
    // ];

    world = WebGLWorld(gl);
    world.clearColor = [0.8, 0.8, 0.8, 1.0];

    world.AddObject(eraserObj);
    // world.AddObject(otherObj);
    
    world.Deploy();
    world.Render();
}

main();

// Objects Class

function WebGLObject(gl, vertexShaderSource, fragmentShaderSource) {
    return {
        gl: gl,
        pos: {
            x: 0,
            y: 0,
            z: 0
        },
        vertices: [],
        indices: [],
        vertexShaderSource: vertexShaderSource,
        fragmentShaderSource: fragmentShaderSource,
        buffers: {
            vertexBuffer: null,
            fragmentBuffer: null
        },
        shaderProgram: null,
        animateFunc: null,
        customProperties: {}
    }
}

function WebGLWorld(gl){    
    return {
        gl : gl,
        objects: [],
        buffers: [],
        options: {
            isDeployed: false,
            isRendering: false,
        },
        clearColor: [1.0, 1.0, 1.0, 1.0],
        AddObject(webGLObject){
            this.objects.push(webGLObject);
        },
        Deploy(){
            console.log("DEPLOY")

            this.clearBackgroundRender();

            this.objects.forEach((item)=>{
                let shaderProgram = this.gl.createProgram();

                // Vertex Shader
                let vertexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(item.vertices), this.gl.STATIC_DRAW);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
                let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
                this.gl.shaderSource(vertexShader, item.vertexShaderSource);
                this.gl.compileShader(vertexShader);
                this.gl.attachShader(shaderProgram, vertexShader);

                // Fragment Buffer
                let fragmentBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, fragmentBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(item.indices), this.gl.STATIC_DRAW);
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
                let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                this.gl.shaderSource(fragmentShader, item.fragmentShaderSource);
                this.gl.compileShader(fragmentShader);
                this.gl.attachShader(shaderProgram, fragmentShader);

                // Use Program
                this.gl.linkProgram(shaderProgram);
                this.gl.useProgram(shaderProgram);

                // Register variable to item object
                item.buffers = { vertexBuffer, fragmentBuffer };
                item.shaderProgram = shaderProgram;

                this.renderObject(item);
            });

            this.options.isDeployed = true;
            this.options.isRendering = true;
        },
        Render(){
            if (this.options.isDeployed) {
                if (this.options.isRendering){
                    this.clearBackgroundRender();
                    this.animateObjects();
                    this.renderObjects();
                    this.normalizeCanvasSize();
                }
                requestAnimationFrame(() => { this.Render() });
            } else {
                console.log('World not deployed yet.');
            }
        },
        clearBackgroundRender(){
            this.gl.clearColor(...this.clearColor);
            this.gl.enable(gl.DEPTH_TEST);
            this.gl.clear(gl.COLOR_BUFFER_BIT);
        },
        normalizeCanvasSize(){
            this.gl.viewport(0, 0, 640, 640);
        },
        renderObjects(){
            this.objects.forEach((item)=>{
                this.renderObject(item);
            });
        },
        renderObject(item) {            
            vertexBuffer = item.buffers.vertexBuffer;
            fragmentBuffer = item.buffers.fragmentBuffer;
            shaderProgram = item.shaderProgram;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, fragmentBuffer);

            this.gl.useProgram(shaderProgram);

            // Position Attribute
            let aPosition = this.gl.getAttribLocation(shaderProgram, "aPosition");
            this.gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
            this.gl.enableVertexAttribArray(aPosition);

            // Color Attribute
            let aColor = this.gl.getAttribLocation(shaderProgram, "aColor");
            this.gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
            this.gl.enableVertexAttribArray(aColor);
            
            // Position Uniform
            let uPosition = this.gl.getUniformLocation(shaderProgram, "uPosition");
            this.gl.uniform3fv(uPosition, [item.pos.x, item.pos.y, item.pos.z]);

            this.gl.drawElements(this.gl.TRIANGLES, item.indices.length, this.gl.UNSIGNED_SHORT, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        },
        animateObjects(){
            this.objects.forEach((item)=>{
                this.animateObject(item);
            });
        },
        animateObject(item){
            if (item && item.animateFunc != null) {
                item.pos = item.animateFunc(item.pos);
            }
        }
    }
}