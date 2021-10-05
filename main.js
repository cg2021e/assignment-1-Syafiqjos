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
            gl_Position = vec4(aPosition, 1.0);
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

    eraserObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource)
    eraserObj.vertices = [
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,     // Point A
         0.5, -0.5, 0.0, 0.0, 0.0, 1.0,     // Point B
         0.0,  0.5, 0.0, 1.0, 0.0, 0.0      // Point C
    ];
    eraserObj.indices = [
        0, 1, 2
    ];
    
    otherObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource)
    otherObj.vertices = [
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,     // Point A
         0.5, -0.5, 0.0, 0.0, 0.0, 1.0,     // Point B
         1.0,  0.5, 0.0, 1.0, 0.0, 0.0      // Point C
    ];
    otherObj.indices = [
        0, 1, 2
    ];

    world = WebGLWorld(gl);
    world.AddObject(eraserObj);
    world.AddObject(otherObj);
    
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
        shaderProgram: null
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
        AddObject(webGLObject){
            this.objects.push(webGLObject);
        },
        Deploy(){
            console.log("DEPLOY")

            this.objects.forEach((item)=>{
                let shaderProgram = this.gl.createProgram();

                // Vertex Shader
                let vertexBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(item.vertices), this.gl.STATIC_DRAW);
                let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
                this.gl.shaderSource(vertexShader, item.vertexShaderSource);
                this.gl.compileShader(vertexShader);
                this.gl.attachShader(shaderProgram, vertexShader);

                // Fragment Buffer
                let fragmentBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, fragmentBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(item.indices), this.gl.STATIC_DRAW);
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
            });

            isDeployed = true;
            isRendering = true;
        },
        Render(){
            if (isDeployed) {
                if (isRendering){
                    this.clearBackgroundRender();
                    this.objectsRender();
                }
                requestAnimationFrame(() => { this.Render() });
            } else {
                console.log('World not deployed yet.');
            }
        },
        clearBackgroundRender(){
            this.gl.clearColor(0.5, 0.5, 0.5, 0.7);
            this.gl.clear(gl.COLOR_BUFFER_BIT);
        },
        objectsRender(){
            this.objects.forEach((item)=>{
                vertexBuffer = item.buffers.vertexBuffer;
                fragmentBuffer = item.buffers.fragmentBuffer;
                shaderProgram = item.shaderProgram;

                if (vertexBuffer) this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
                if (fragmentBuffer) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, fragmentBuffer);

                if (shaderProgram) {
                    // Position Uniform
                    let uPosition = this.gl.getUniformLocation(shaderProgram, "uPosition");
                    this.gl.uniform3fv(uPosition, [item.pos.x, item.pos.y, item.pos.z]);
                }

                this.gl.drawElements(this.gl.TRIANGLES, item.indices.length, this.gl.UNSIGNED_SHORT, 0);

                if (vertexBuffer) this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
                if (fragmentBuffer) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            });
        }
    }
}