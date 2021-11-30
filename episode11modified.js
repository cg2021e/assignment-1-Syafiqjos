function main(){
    console.log("MAIN")

    const previewCanvas = document.getElementById('previewCanvas')
    const previewButton = document.getElementById('previewButton')
    const previewButtonDesc = document.getElementById('previewButtonDesc')
    const gl = previewCanvas.getContext('webgl')

    let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        attribute vec3 aNormal;

        varying vec3 vColor;

        uniform vec3 uPosition;
        uniform vec3 uScale;

        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProjection;

        void main(){
            gl_PointSize = 10.0;
            gl_Position = uProjection * uView * uModel * vec4(aPosition.x * uScale.x, aPosition.y * uScale.y, aPosition.z * uScale.z, 1.0);
            vColor = aColor;
        }
    `;

    let fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        
        uniform vec3 uAmbientConstantGlobal;
        uniform vec3 uAmbientConstant;
        uniform float uAmbientIntensityGlobal;
        uniform float uAmbientIntensity;
        
        void main(){
            vec3 ambient = vec3(
                    max(uAmbientConstant.x, uAmbientConstantGlobal.x), 
                    max(uAmbientConstant.y, uAmbientConstantGlobal.y), 
                    max(uAmbientConstant.z, uAmbientConstantGlobal.z)
                ) * max(uAmbientIntensity, uAmbientIntensityGlobal);

            // vec3 diffuse =

            vec3 phong = ambient; //+ diffuse + specular;

            gl_FragColor = vec4(phong * vColor, 1.0);
        }
    `;

    // Make Right Eraser

    // let eraserObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    // makeEraser(eraserObj);
    // resizeObj(eraserObj, 0.5);
    
    // eraserObj.pos.x = 0.5;
    // eraserObj.pos.y = -0.5;
    // eraserObj.pos.z = 3;

    // eraserObj.rotation.x = -80;
    // eraserObj.rotation.y = 0;
    // eraserObj.rotation.z = 90;
    

    // Make Left Eraser

    // let otherObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    // makeEraser(otherObj);
    // resizeObj(otherObj, 0.5);

    // otherObj.pos.x = -0.6;
    // otherObj.pos.y = -0.5;
    // otherObj.pos.z = 3;

    // otherObj.rotation.x = -80;
    // otherObj.rotation.y = 0;
    // otherObj.rotation.z = 30;

    // Make Light Cube

    let cubeObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    makeCube(cubeObj);
    resizeObj(cubeObj, 0.5);

    cubeObj.pos.x = 0;
    cubeObj.pos.y = -0.5;
    cubeObj.pos.z = 3.5;

    cubeObj.rotation.x = 0;
    cubeObj.rotation.y = 0;
    cubeObj.rotation.z = 0;

    cubeObj.scale.x = 0.2;
    cubeObj.scale.y = 0.2;
    cubeObj.scale.z = 0.2;

    cubeObj.lightning.ambientIntensity = 1.0;

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

    world.lightning.ambientConstantGlobal = [1.0, 1.0, 1.0];
    world.lightning.ambientIntensityGlobal = 0.289;

    // world.AddObject(eraserObj);
    // world.AddObject(otherObj);
    world.AddObject(cubeObj);
    
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
        scale: {
            x: 1,
            y: 1,
            z: 1
        },
        vertices: [],
        indices: [],
        lightning: {
            ambientConstant: [ 0.0, 0.0, 0.0 ],
            ambientIntensity: 0.0
        },
        vertexShaderSource: vertexShaderSource,
        fragmentShaderSource: fragmentShaderSource,
        buffers: {
            vertexBuffer: null,
            fragmentBuffer: null
        },
        shaderProgram: null,
        shaderVar: {

        },
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
        lightning: {
            ambientConstantGlobal: [ 1.0, 1.0, 1.0 ],
            ambientIntensityGlobal: 1.0
        },
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
                var vertexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(item.vertices), gl.STATIC_DRAW);

                // Create a linked-list for storing the indices data
                var indexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(item.indices), gl.STATIC_DRAW);

                // Create .c in GPU
                var vertexShader = this.gl.createShader(gl.VERTEX_SHADER);
                this.gl.shaderSource(vertexShader, item.vertexShaderSource);
                var fragmentShader = this.gl.createShader(gl.FRAGMENT_SHADER);
                this.gl.shaderSource(fragmentShader, item.fragmentShaderSource);

                // Compile .c into .o
                this.gl.compileShader(vertexShader);
                this.gl.compileShader(fragmentShader);

                // Prepare a .exe shell (shader program)
                let shaderProgram = this.gl.createProgram();

                // Put the two .o files into the shell
                this.gl.attachShader(shaderProgram, vertexShader);
                this.gl.attachShader(shaderProgram, fragmentShader);

                // Link the two .o files, so together they can be a runnable program/context.
                this.gl.linkProgram(shaderProgram);

                // Start using the context (analogy: start using the paints and the brushes)
                this.gl.useProgram(shaderProgram);

                var aPosition = this.gl.getAttribLocation(shaderProgram, "aPosition");
                this.gl.vertexAttribPointer(
                    aPosition, 
                    3, 
                    this.gl.FLOAT, 
                    false, 
                    6 * Float32Array.BYTES_PER_ELEMENT, 
                    0
                );
                this.gl.enableVertexAttribArray(aPosition);
                var aColor = this.gl.getAttribLocation(shaderProgram, "aColor");
                this.gl.vertexAttribPointer(
                    aColor, 
                    3, 
                    this.gl.FLOAT, 
                    false, 
                    6 * Float32Array.BYTES_PER_ELEMENT, 
                    3 * Float32Array.BYTES_PER_ELEMENT
                );
                this.gl.enableVertexAttribArray(aColor);
                // var aNormal = this.gl.getAttribLocation(shaderProgram, "aNormal");
                // this.gl.vertexAttribPointer(
                //     aNormal, 
                //     3, 
                //     this.gl.FLOAT, 
                //     false, 
                //     9 * Float32Array.BYTES_PER_ELEMENT, 
                //     6 * Float32Array.BYTES_PER_ELEMENT
                // );
                // this.gl.enableVertexAttribArray(aNormal);

                // Shader Variable

                item.shaderVar.uPosition = this.gl.getUniformLocation(shaderProgram, "uPosition");
                item.shaderVar.uScale = this.gl.getUniformLocation(shaderProgram, "uScale");
                item.shaderVar.uModel = this.gl.getUniformLocation(shaderProgram, "uModel");
                item.shaderVar.uProjection = this.gl.getUniformLocation(shaderProgram, 'uProjection');
                item.shaderVar.uView = this.gl.getUniformLocation(shaderProgram, 'uView');
                item.shaderVar.uAmbientConstantGlobal = this.gl.getUniformLocation(shaderProgram, 'uAmbientConstantGlobal');
                item.shaderVar.uAmbientIntensityGlobal = this.gl.getUniformLocation(shaderProgram, 'uAmbientIntensityGlobal');
                item.shaderVar.uAmbientConstant = this.gl.getUniformLocation(shaderProgram, 'uAmbientConstant');
                item.shaderVar.uAmbientIntensity = this.gl.getUniformLocation(shaderProgram, 'uAmbientIntensity');

                // Register variable to item object
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
            let clearColor = 
                [ this.clearColor[0] * this.lightning.ambientConstantGlobal[0] * this.lightning.ambientIntensityGlobal,
                  this.clearColor[1] * this.lightning.ambientConstantGlobal[1] * this.lightning.ambientIntensityGlobal,
                  this.clearColor[2] * this.lightning.ambientConstantGlobal[2] * this.lightning.ambientIntensityGlobal,
                  1.0 ];
            this.gl.clearColor(...clearColor);
            this.gl.enable(gl.DEPTH_TEST);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
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
            // Position Uniform
            this.gl.uniform3fv(item.shaderVar.uPosition, [item.pos.x, item.pos.y, item.pos.z]);

            // Scale Uniform
            this.gl.uniform3fv(item.shaderVar.uScale, [item.scale.x, item.scale.y, item.scale.z]);

            // Model Uniform
            let model = glMatrix.mat4.create();
            glMatrix.mat4.translate(model, model, [item.pos.x, item.pos.y, item.pos.z]);
            glMatrix.mat4.rotate(model, model, item.rotation.x / 180 * Math.PI, [1, 0, 0]);
            glMatrix.mat4.rotate(model, model, item.rotation.y / 180 * Math.PI, [0, 1, 0]);
            glMatrix.mat4.rotate(model, model, item.rotation.z / 180 * Math.PI, [0, 0, 1]);
            this.gl.uniformMatrix4fv(item.shaderVar.uModel, false, model);

            // Projection Uniform
            this.gl.uniformMatrix4fv(item.shaderVar.uProjection, false, this.projection);

            // // View Uniform
            this.gl.uniformMatrix4fv(item.shaderVar.uView, false, this.view);

            // Ambient Lightning Global
            this.gl.uniform3fv(item.shaderVar.uAmbientConstantGlobal, this.lightning.ambientConstantGlobal);
            this.gl.uniform1f(item.shaderVar.uAmbientIntensityGlobal, this.lightning.ambientIntensityGlobal);
            
            // Ambient Lightning Local
            this.gl.uniform3fv(item.shaderVar.uAmbientConstant, item.lightning.ambientConstant);
            this.gl.uniform1f(item.shaderVar.uAmbientIntensity, item.lightning.ambientIntensity);

            this.gl.drawElements(this.gl.TRIANGLES, item.indices.length, this.gl.UNSIGNED_SHORT, 0);
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