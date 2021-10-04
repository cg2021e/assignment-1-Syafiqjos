function main(){
    console.log("MAIN")

    const previewCanvas = document.getElementById('previewCanvas')
    const gl = previewCanvas.getContext('webgl')

    let vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;

        void main(){
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

    world = WebGLWorld(gl)
    world.AddObject(eraserObj)
    world.AddObject(otherObj)
    
    world.Deploy()
}

main()

// Objects Class

function WebGLObject(gl, vertexShaderSource, fragmentShaderSource) {
    return {
        gl: gl,
        vertices: [],
        indices: [],
        vertexShaderSource: vertexShaderSource,
        fragmentShaderSource: fragmentShaderSource
    }
}

function WebGLWorld(gl){    
    return {
        gl : gl,
        objects: [],
        AddObject(webGLObject){
            this.objects.push(webGLObject);
        },
        Deploy(){
            console.log("DEPLOY")

            this.gl.clearColor(0.5, 0.5, 0.5, 0.7);
            this.gl.clear(gl.COLOR_BUFFER_BIT);

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

                this.gl.linkProgram(shaderProgram);
                this.gl.useProgram(shaderProgram);

                let aPosition = this.gl.getAttribLocation(shaderProgram, "aPosition");
                this.gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
                this.gl.enableVertexAttribArray(aPosition);

                let aColor = this.gl.getAttribLocation(shaderProgram, "aColor");
                this.gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
                this.gl.enableVertexAttribArray(aColor);
                
                this.gl.drawElements(this.gl.TRIANGLES, item.indices.length, this.gl.UNSIGNED_SHORT, 0);

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
            });
        }
    }
}