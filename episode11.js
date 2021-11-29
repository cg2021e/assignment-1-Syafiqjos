function main(){
    console.log("MAIN")

    const previewCanvas = document.getElementById('previewCanvas')
    const previewButton = document.getElementById('previewButton')
    const previewButtonDesc = document.getElementById('previewButtonDesc')
    const gl = previewCanvas.getContext('webgl')

    let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;

        uniform vec3 uPosition;

        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;

        void main(){
            gl_PointSize = 10.0;
            gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
            // gl_Position = uProjection * uView * vec4(aPosition + uPosition, 1.0);
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

    eraserObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    makeEraser(eraserObj);
    resizeObj(eraserObj, 0.5);
    
    eraserObj.pos.x = 0.5;
    eraserObj.pos.y = -0.75;
    eraserObj.pos.z = 3;

    eraserObj.rotation.x = -90;
    eraserObj.rotation.y = 0;
    eraserObj.rotation.z = 90;
    
    // otherObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    // makeOtherEraser(otherObj);
    // resizeObj(otherObj, 0.5);
    // otherObj.pos.y = -0.5;
    // otherObj.pos.x = -0.5;

    // Preview Button
    previewButton.addEventListener('click', () => {
        if (eraserObj.customProperties.isAnimateFloating) {
            eraserObj.customProperties.translationPos = -0.5;
            previewButtonDesc.innerText = "bouncing";
        } else {
            eraserObj.customProperties.translationPos = 0;
            previewButtonDesc.innerText = "floating";
        }
        eraserObj.customProperties.isAnimateFloating = !eraserObj.customProperties.isAnimateFloating;
    });

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
        rotation: {
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
        projection: null,
        view: null,
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

            // Create Projection

            this.projection = glMatrix.mat4.create();
            glMatrix.mat4.perspective(this.projection, Math.PI / 3, 1, 0.5, 10);

            this.view = glMatrix.mat4.create();
            glMatrix.mat4.lookAt(
                this.view,
                [0, 0, 5],
                [0, 0, 0],
                [0, 1, 0]
            );

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

            // Model Uniform
            let uModel = this.gl.getUniformLocation(shaderProgram, "uModel");
            let model = glMatrix.mat4.create();
            glMatrix.mat4.translate(model, model, [item.pos.x, item.pos.y, item.pos.z]);
            glMatrix.mat4.rotate(model, model, item.rotation.x / 180 * Math.PI, [1, 0, 0]);
            glMatrix.mat4.rotate(model, model, item.rotation.y / 180 * Math.PI, [0, 1, 0]);
            glMatrix.mat4.rotate(model, model, item.rotation.z / 180 * Math.PI, [0, 0, 1]);
            this.gl.uniformMatrix4fv(uModel, false, model);

            // Projection Uniform
            let uProjection = gl.getUniformLocation(shaderProgram, 'uProjection');
            gl.uniformMatrix4fv(uProjection, false, this.projection);

            // // View Uniform
            let uView = gl.getUniformLocation(shaderProgram, 'uView');
            gl.uniformMatrix4fv(uView, false, this.view);

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

function makeEraser(obj) {
    colorSoPink = [181/255, 94/255, 129/255];
    colorRatherPink = [117/255, 55/255, 66/255];
    colorNotPink = [79/255, 55/255, 63/255];
    colorSeemsBlack = [23/255, 19/255, 22/255];

    obj.vertices = [
        // ...makeCord3(0.32, -0.80722, 0.096621), ...colorSoPink,
        // ...makeCord3(0.295951, -0.746149, 0.138902), ...colorSoPink,
        // ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, -0.645776, 0.096621), ...colorSoPink,

        // ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,
        // ...makeCord3(0.295951, 0.661663, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, 0.66192, 0.096621), ...colorSoPink,
        // ...makeCord3(0.32, -0.645776, 0.096621), ...colorSoPink,

        // Section 2

        // ...makeCord3(0.295951, -0.746149, 0.138902), ...colorSoPink, // H0
        // ...makeCord3(0.32, -0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, -0.645776, 0.096621), ...colorSoPink,

        // ...makeCord3(0.295951, 0.661663, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, 0.66192, 0.096621), ...colorSoPink,

        // ...makeCord3(0.295951, 0.746555, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, 0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(0.242694, 0.746555, 0.138902), ...colorSoPink,
        // ...makeCord3(0.2624, 0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.236616, 0.746555, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.256, 0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.29579, 0.746555, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.32, 0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.29579, 0.661663, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.32, 0.66192, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.29579, -0.64633, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.32, -0.645776, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.29579, -0.746149, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.32, -0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(-0.236616, -0.746149, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.256, -0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(0.242694, -0.746149, 0.138902), ...colorSoPink,
        // ...makeCord3(0.2624, -0.80722, 0.096621), ...colorSoPink,

        // ...makeCord3(0.295951, -0.746149, 0.138902), ...colorSoPink,
        // ...makeCord3(0.32, -0.80722, 0.096621), ...colorSoPink, // H25

        // // Section 0
        // ...makeCord3(-0.256, -0.645776, 0.138902), ...colorSoPink, // H26
        // ...makeCord3(0.2624, -0.645776, 0.138902), ...colorSoPink,

        // ...makeCord3(-0.256, 0.66192, 0.138902), ...colorSoPink,
        // ...makeCord3(0.2624, 0.66192, 0.138902), ...colorSoPink, // H29

        // // Section 1

        // // Sisi depan full

        // ...makeCord3(0.2624, -0.645776, 0.138902), ...colorSoPink,
        // ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,

        // ...makeCord3(0.2624, 0.66192, 0.138902), ...colorSoPink,
        // ...makeCord3(0.295951, 0.661663, 0.138902), ...colorSoPink,

        // // sisi kanan
        // ...makeCord3(), ...colorSoPink, // H38
        // ...makeCord3(), ...colorSoPink,

        // ...makeCord3(-0.256, 0.66192, 0.138902), ...colorSoPink,
        // ...makeCord3(-0.236616, 0.746555, 0.138902), ...colorSoPink, // H41

        // sisi belakang full

        // sisi kiri

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,

        // ...makeCord3(, , ), ...colorSoPink,
        // ...makeCord3(, , ), ...colorSoPink,
    ];
    
    obj.indices = [
        // ...makeFaces(Math.floor(obj.vertices.length / 4 / 6))
        ...makeBatchIndicesSimultaneously(0, 1, 24), // Section 2
        ...makeBatchIndicesSimultaneously(26, 27, 2), // Section 0
        ...makeBatchIndicesSimultaneously(30, 31, 2), // Section 1 Depan
        ...makeBatchIndicesSimultaneously(34, 35, 3), // Section 1 Kanan
        // ...makeBatchIndicesSimultaneously(38, 39, 2),
    ];

    obj.vertices = [
        -0.320000, 0.661920, 0.096621, 255, 78, 118, 
-0.295790, 0.746555, 0.138902, 255, 78, 118, 
-0.320000, 0.807220, 0.096621, 255, 78, 118, 
0.262400, 0.807220, 0.096621, 255, 78, 118, 
0.295951, 0.746555, 0.138902, 255, 78, 118, 
0.320000, 0.807220, 0.096621, 255, 78, 118, 
0.320000, -0.645776, 0.096621, 255, 78, 118, 
0.295951, -0.746149, 0.138902, 255, 78, 118, 
0.320000, -0.807220, 0.096621, 255, 78, 118, 
-0.256000, -0.807220, 0.096621, 255, 78, 118, 
-0.295790, -0.746149, 0.138902, 255, 78, 118, 
-0.320000, -0.807220, 0.096621, 255, 78, 118, 
-0.256000, -0.807220, -0.138902, 255, 78, 118, 
-0.312263, -0.787702, -0.216586, 64, 20, 30, 
-0.256000, -0.807220, -0.221167, 64, 20, 30, 
-0.256000, -0.645776, 0.138902, 255, 78, 118, 
-0.236616, -0.746149, 0.138902, 255, 78, 118, 
0.262400, -0.645776, -0.221167, 89, 28, 42, 
0.312263, -0.787702, -0.216586, 64, 20, 30, 
0.262400, -0.807220, -0.221167, 64, 20, 30, 
0.262400, 0.807220, -0.138902, 210, 64, 97, 
0.312263, 0.787702, -0.216586, 64, 20, 30, 
0.262400, 0.807220, -0.221167, 64, 20, 30, 
-0.320000, 0.661920, -0.138902, 255, 78, 118, 
-0.312263, 0.787702, -0.216586, 64, 20, 30, 
-0.320000, 0.661920, -0.221167, 65, 20, 30, 
0.320000, -0.645776, -0.138902, 250, 76, 116, 
0.320000, -0.645776, -0.221167, 65, 21, 31, 
0.320000, 0.661920, -0.221167, 64, 20, 30, 
0.320000, 0.661920, -0.138902, 165, 50, 77, 
-0.320000, -0.645776, -0.138902, 255, 78, 118, 
-0.320000, -0.807220, -0.138902, 255, 78, 118, 
0.262400, -0.645776, -0.221167, 165, 50, 77, 
0.262400, 0.661920, -0.221167, 70, 22, 33, 
-0.295790, 0.661663, 0.138902, 255, 78, 118, 
-0.256000, 0.661920, 0.138902, 255, 78, 118, 
0.295951, 0.661663, 0.138902, 255, 78, 118, 
0.320000, 0.661920, 0.096621, 255, 78, 118, 
-0.320000, -0.645776, 0.096621, 255, 78, 118, 
-0.320000, -0.807220, 0.096621, 255, 114, 146, 
-0.236616, 0.746555, 0.138902, 255, 78, 118, 
0.312263, 0.787702, -0.216586, 74, 23, 34, 
0.262400, 0.661920, -0.221167, 64, 20, 30, 
0.262400, 0.807220, -0.221167, 65, 20, 31, 
0.320000, 0.807220, -0.138902, 195, 60, 90, 
-0.320000, -0.645776, -0.221167, 64, 20, 30, 
-0.295790, 0.661663, 0.138902, 255, 80, 120, 
-0.312263, 0.787702, -0.216586, 89, 28, 42, 
-0.256000, 0.661920, -0.221167, 132, 41, 61, 
-0.320000, 0.661920, -0.221167, 249, 76, 115, 
0.242694, 0.746555, 0.138902, 255, 78, 118, 
0.262400, 0.661920, 0.138902, 255, 78, 118, 
0.262400, -0.645776, 0.138902, 255, 78, 118, 
-0.320000, -0.645776, -0.221167, 255, 84, 122, 
-0.320000, 0.661920, -0.221167, 222, 68, 103, 
-0.256000, 0.807220, -0.138902, 255, 78, 118, 
-0.320000, 0.807220, -0.138902, 255, 78, 118, 
-0.256000, -0.645776, -0.221167, 65, 20, 31, 
0.242694, -0.746149, 0.138902, 255, 78, 118, 
0.262400, -0.807220, -0.138902, 255, 78, 118, 
0.262400, -0.807220, 0.096621, 255, 78, 118, 
-0.256000, 0.807220, 0.096621, 255, 78, 118, 
0.320000, -0.807220, -0.138902, 255, 78, 118, 
0.295951, -0.646330, 0.138902, 255, 78, 118, 
-0.256000, 0.807220, -0.221167, 217, 66, 100, 
0.262400, 0.661920, -0.221167, 129, 40, 60, 
-0.256000, -0.645776, -0.221167, 203, 62, 93, 
-0.256000, 0.661920, -0.221167, 64, 20, 30, 
0.262400, 0.807220, -0.138902, 212, 65, 97, 
-0.256000, 0.807220, -0.221167, 64, 20, 30, 
-0.256000, -0.645776, -0.221167, 64, 20, 30, 
-0.256000, 0.807220, -0.116580, 255, 78, 118, 
0.320000, -0.807220, -0.116580, 255, 78, 118, 
-0.320000, 0.807220, -0.116580, 255, 78, 118, 
0.262400, -0.807220, -0.116580, 255, 78, 118, 
-0.320000, -0.645776, -0.116580, 255, 78, 118, 
0.320000, 0.807220, -0.116580, 255, 78, 118, 
-0.320000, -0.807220, -0.116580, 255, 78, 118, 
0.320000, 0.661920, -0.116580, 253, 77, 117, 
0.320000, -0.645776, -0.138902, 255, 78, 118, 
-0.256000, -0.807220, -0.116580, 255, 78, 118, 
0.320000, -0.645776, -0.116580, 255, 78, 118, 
0.262400, 0.807220, -0.116580, 255, 78, 118, 
-0.320000, 0.661920, -0.116580, 255, 78, 118, 
-0.295790, -0.646330, 0.138902, 255, 78, 118, 
0.320000, 0.661920, -0.221167, 66, 21, 31, 
-0.256000, 0.661920, -0.221167, 86, 27, 40, 
-0.256000, -0.645776, -0.221167, 230, 70, 106, 
-0.256000, -0.807220, -0.221167, 119, 37, 56, 
-0.312263, -0.787702, -0.216586, 81, 25, 38, 
-0.256000, -0.807220, -0.221167, 116, 36, 55, 
-0.320000, -0.807220, 0.096621, 255, 82, 122, 
    ];

    obj.vertices = obj.vertices.map((v, i) => {
        if (i % 6 >= 3) {
            return v / 255;
        }
        return v;
    })

    obj.indices = [
        0, 1, 2, 
3, 4, 5, 
6, 7, 8, 
9, 10, 11, 
12, 13, 14, 
15, 10, 16, 
17, 18, 19, 
20, 21, 22, 
23, 24, 25, 
26, 18, 27, 
26, 28, 29, 
30, 13, 31, 
28, 32, 33, 
34, 15, 35, 
36, 6, 37, 
10, 38, 39, 
4, 37, 5, 
1, 35, 40, 
41, 42, 43, 
29, 21, 44, 
23, 45, 30, 
38, 46, 0, 
47, 48, 49, 
50, 35, 51, 
35, 52, 51, 
48, 53, 54, 
55, 24, 56, 
57, 13, 45, 
15, 58, 52, 
12, 19, 59, 
58, 9, 60, 
1, 61, 2, 
7, 60, 8, 
59, 18, 62, 
52, 7, 63, 
36, 52, 63, 
4, 51, 36, 
43, 48, 64, 
65, 66, 67, 
68, 69, 55, 
17, 14, 70, 
61, 50, 3, 
71, 68, 55, 
72, 59, 62, 
73, 55, 56, 
74, 12, 59, 
75, 23, 30, 
76, 29, 44, 
77, 30, 31, 
78, 79, 29, 
80, 31, 12, 
81, 62, 26, 
82, 44, 68, 
83, 56, 23, 
61, 82, 71, 
8, 74, 72, 
73, 61, 71, 
60, 80, 74, 
38, 83, 75, 
5, 78, 76, 
77, 38, 75, 
37, 81, 78, 
80, 11, 77, 
6, 72, 81, 
3, 76, 82, 
0, 73, 83, 
0, 46, 1, 
3, 50, 4, 
6, 63, 7, 
9, 16, 10, 
12, 31, 13, 
15, 84, 10, 
17, 27, 18, 
68, 44, 21, 
23, 56, 24, 
26, 62, 18, 
26, 27, 28, 
30, 45, 13, 
85, 27, 17, 
34, 84, 15, 
36, 63, 6, 
10, 84, 38, 
4, 36, 37, 
1, 34, 35, 
41, 28, 42, 
29, 28, 21, 
23, 25, 45, 
38, 84, 46, 
47, 64, 48, 
50, 40, 35, 
35, 15, 52, 
86, 70, 53, 
55, 69, 24, 
87, 88, 89, 
15, 16, 58, 
12, 14, 19, 
58, 16, 9, 
1, 40, 61, 
7, 58, 60, 
59, 19, 18, 
52, 58, 7, 
36, 51, 52, 
4, 50, 51, 
43, 65, 48, 
42, 17, 87, 
68, 22, 69, 
17, 19, 90, 
61, 40, 50, 
71, 82, 68, 
72, 74, 59, 
73, 71, 55, 
74, 80, 12, 
75, 83, 23, 
76, 78, 29, 
77, 75, 30, 
78, 81, 26, 
80, 77, 31, 
81, 72, 62, 
82, 76, 44, 
83, 73, 56, 
61, 3, 82, 
8, 60, 74, 
73, 2, 61, 
60, 9, 80, 
38, 0, 83, 
5, 37, 78, 
77, 91, 38, 
37, 6, 81, 
80, 9, 11, 
6, 8, 72, 
3, 5, 76, 
0, 2, 73, 
    ];
}

function makeCord2(x, y){
    return [x, y, 0.0]
}

function makeCord3(x, y, z){
    // return [x, y, z]
    return [y, z, x];
}

function makeBatchIndices(a, b, length){
    let temp = []
    for (let i = 0; i < length - 1; i++){
        temp.push(a + i);
        temp.push(a + i + 1);
        temp.push(b + i + 1);

        temp.push(a + i);
        temp.push(b + i + 1);
        temp.push(b + i);
    }
    return temp;
}

function makeBatchIndicesSimultaneously(a, b, length){
    let temp = []
    for (let i = 0; i < length - 1; i++){
        temp.push(a + i + 0);
        temp.push(a + i + 2);
        temp.push(b + i + 2);

        temp.push(b + i + 2);
        temp.push(b + i + 0);
        temp.push(a + i + 0);
    }
    return temp;
}

function makeFaces(numFaces) {
    let temp = [];
    for (let i = 0;i < numFaces;i++) {
        temp.push(i + 0);
        temp.push(i + 1);
        temp.push(i + 2);

        temp.push(i + 2);
        temp.push(i + 3);
        temp.push(i + 0);
    }
    return temp;
}

function resizeObj(obj, scale){
    obj.vertices = obj.vertices.map((x, i) => {
        if (i % 6 >= 3) {
            return x;
        }
        return x * scale;
    });
}