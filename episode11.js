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

        // uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;

        void main(){
            gl_PointSize = 10.0;
            // gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
            gl_Position = uProjection * uView * vec4(aPosition + uPosition, 1.0);
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
    eraserObj.pos.y = -0.5;
    eraserObj.pos.x = 0;
    eraserObj.pos.z = 2;
    
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
                [0, 0, 3],
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
            // let uModel = this.gl.getUniformLocation(shaderProgram, "uPosition");
            // let model = glMatrix.mat4.create();
            // glMatrix.mat4.translate(model, model, [item.pos.x, item.pos.y, item.pos.z]);
            // this.gl.uniformMatrix4fv(uModel, false, model);

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

        ...makeCord3(0.295951, -0.746149, 0.138902), ...colorSoPink, // H0
        ...makeCord3(0.32, -0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,
        ...makeCord3(0.32, -0.645776, 0.096621), ...colorSoPink,

        ...makeCord3(0.295951, 0.661663, 0.138902), ...colorSoPink,
        ...makeCord3(0.32, 0.66192, 0.096621), ...colorSoPink,

        ...makeCord3(0.295951, 0.746555, 0.138902), ...colorSoPink,
        ...makeCord3(0.32, 0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(0.242694, 0.746555, 0.138902), ...colorSoPink,
        ...makeCord3(0.2624, 0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(-0.236616, 0.746555, 0.138902), ...colorSoPink,
        ...makeCord3(-0.256, 0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(-0.29579, 0.746555, 0.138902), ...colorSoPink,
        ...makeCord3(-0.32, 0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(-0.29579, 0.661663, 0.138902), ...colorSoPink,
        ...makeCord3(-0.32, 0.66192, 0.096621), ...colorSoPink,

        ...makeCord3(-0.29579, -0.64633, 0.138902), ...colorSoPink,
        ...makeCord3(-0.32, -0.645776, 0.096621), ...colorSoPink,

        ...makeCord3(-0.29579, -0.746149, 0.138902), ...colorSoPink,
        ...makeCord3(-0.32, -0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(-0.236616, -0.746149, 0.138902), ...colorSoPink,
        ...makeCord3(-0.256, -0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(0.242694, -0.746149, 0.138902), ...colorSoPink,
        ...makeCord3(0.2624, -0.80722, 0.096621), ...colorSoPink,

        ...makeCord3(0.295951, -0.746149, 0.138902), ...colorSoPink,
        ...makeCord3(0.32, -0.80722, 0.096621), ...colorSoPink, // H25

        // Section 0
        ...makeCord3(-0.256, -0.645776, 0.138902), ...colorSoPink, // H26
        ...makeCord3(0.2624, -0.645776, 0.138902), ...colorSoPink,

        ...makeCord3(-0.256, 0.66192, 0.138902), ...colorSoPink,
        ...makeCord3(0.2624, 0.66192, 0.138902), ...colorSoPink, // H29

        // Section 1

        // Sisi depan full

        ...makeCord3(0.2624, -0.645776, 0.138902), ...colorSoPink,
        ...makeCord3(0.295951, -0.64633, 0.138902), ...colorSoPink,

        ...makeCord3(0.2624, 0.66192, 0.138902), ...colorSoPink,
        ...makeCord3(0.295951, 0.661663, 0.138902), ...colorSoPink,

        // sisi kanan
        // ...makeCord3(0.2624, 0.66192, 0.138902), ...colorSoPink, // H38
        // ...makeCord3(0.242694, 0.746555, 0.138902), ...colorSoPink,

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
        // ...makeBatchIndicesSimultaneously(38, 39, 2),
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