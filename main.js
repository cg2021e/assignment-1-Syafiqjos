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

    function makeCord2(x, y){
        return [x, y, 0.0]
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

    eraserObj.vertices = [
        ...makeCord2(-0.65, 0.25), ...colorSoPink, // C0
        ...makeCord2(-0.56, 0.28) , ...colorSoPink,
        ...makeCord2(-0.49, 0.26), ...colorSoPink,
        ...makeCord2(-0.4, 0.27), ...colorSoPink,
        ...makeCord2(-0.3, 0.26), ...colorSoPink,
        ...makeCord2(-0.2, 0.27), ...colorSoPink,
        ...makeCord2(-0.11, 0.26), ...colorSoPink,
        ...makeCord2(0.0, 0.27), ...colorSoPink,
        ...makeCord2(0.09, 0.25), ...colorSoPink,
        ...makeCord2(0.22, 0.26), ...colorSoPink,
        ...makeCord2(0.31, 0.24), ...colorSoPink,
        ...makeCord2(0.45, 0.25), ...colorSoPink,
        ...makeCord2(0.52, 0.24), ...colorSoPink,
        ...makeCord2(0.6, 0.25), ...colorSoPink,
        ...makeCord2(0.65, 0.23), ...colorSoPink, // C14,
        
        ...makeCord2(-0.7, 0.1), ...colorSoPink, // C15
        ...makeCord2(-0.6, 0.1), ...colorSoPink,
        ...makeCord2(-0.5, 0.1), ...colorSoPink,
        ...makeCord2(-0.4, 0.1), ...colorSoPink,
        ...makeCord2(-0.3, 0.1), ...colorSoPink,
        ...makeCord2(-0.2, 0.1), ...colorSoPink,
        ...makeCord2(-0.1, 0.1), ...colorSoPink,
        ...makeCord2(0, 0.1), ...colorSoPink,
        ...makeCord2(0.1, 0.1), ...colorSoPink,
        ...makeCord2(0.2, 0.1), ...colorSoPink,
        ...makeCord2(0.3, 0.1), ...colorSoPink,
        ...makeCord2(0.4, 0.1), ...colorSoPink,
        ...makeCord2(0.51, 0.1), ...colorSoPink,
        ...makeCord2(0.6, 0.1), ...colorSoPink,
        ...makeCord2(0.7, 0.08), ...colorSoPink, // C29

        ...makeCord2(-0.73575, -0.07319), ...colorSoPink, // C30
        ...makeCord2(-0.67462, -0.13431), ...colorSoPink,
        ...makeCord2(-0.55892, -0.12995), ...colorSoPink,
        ...makeCord2(-0.38645, -0.1365), ...colorSoPink,
        ...makeCord2(-0.25547, -0.14741), ...colorSoPink,
        ...makeCord2(-0.11357, -0.14086), ...colorSoPink,
        ...makeCord2(-0.00223, -0.15614), ...colorSoPink,
        ...makeCord2(0.10038, -0.14523), ...colorSoPink,
        ...makeCord2(0.22481, -0.16051), ...colorSoPink,
        ...makeCord2(0.3558, -0.13868), ...colorSoPink,
        ...makeCord2(0.46713, -0.15396), ...colorSoPink,
        ...makeCord2(0.59375, -0.1365), ...colorSoPink,
        ...makeCord2(0.67234, -0.15178), ...colorSoPink,
        ...makeCord2(0.73347, -0.11685), ...colorSoPink,
        ...makeCord2(0.74875, -0.06227), ...colorSoPink, // C44
        
        ...makeCord2(-0.72701, -0.12558), ...colorRatherPink, // C45
        ...makeCord2(-0.69427, -0.16706), ...colorRatherPink,
        ...makeCord2(-0.55892, -0.16488), ...colorRatherPink,
        ...makeCord2(-0.39301, -0.16981), ...colorRatherPink,
        ...makeCord2(-0.26398, -0.17561), ...colorRatherPink,
        ...makeCord2(-0.11322, -0.16981), ...colorRatherPink,
        ...makeCord2(-0.00594, -0.18286), ...colorRatherPink,
        ...makeCord2(0.10424, -0.16836), ...colorRatherPink,
        ...makeCord2(0.22166, -0.18576), ...colorRatherPink,
        ...makeCord2(0.36083, -0.16111), ...colorRatherPink,
        ...makeCord2(0.46521, -0.17851), ...colorRatherPink,
        ...makeCord2(0.59713, -0.15966), ...colorRatherPink,
        ...makeCord2(0.66961, -0.17851), ...colorRatherPink,
        ...makeCord2(0.74355, -0.13647), ...colorRatherPink, //C58

        ...makeCord2(-0.71629, -0.24229), ...colorRatherPink, // C59
        ...makeCord2(-0.66555, -0.27999), ...colorRatherPink,
        ...makeCord2(-0.55682, -0.27129), ...colorRatherPink,
        ...makeCord2(-0.44809, -0.29303), ...colorRatherPink,
        ...makeCord2(-0.33502, -0.27709), ...colorRatherPink,
        ...makeCord2(-0.22339, -0.30028), ...colorRatherPink,
        ...makeCord2(-0.09727, -0.28578), ...colorRatherPink,
        ...makeCord2(0, -0.3), ...colorRatherPink,
        ...makeCord2(0.15207, -0.28723), ...colorRatherPink,
        ...makeCord2(0.255, -0.30318), ...colorRatherPink,
        ...makeCord2(0.36808, -0.28433), ...colorRatherPink,
        ...makeCord2(0.4739, -0.30318), ...colorRatherPink,
        ...makeCord2(0.56523, -0.28578), ...colorRatherPink,
        ...makeCord2(0.67686, -0.29448), ...colorRatherPink,
        ...makeCord2(0.73195, -0.26114), ...colorRatherPink, // C73
        
        ...makeCord2(-0.71569, -0.28338), ...colorNotPink, // C74
        ...makeCord2(-0.67483, -0.30919), ...colorNotPink,
        ...makeCord2(-0.55972, -0.29738), ...colorNotPink,
        ...makeCord2(-0.45051, -0.31804), ...colorNotPink,
        ...makeCord2(-0.33393, -0.30033), ...colorNotPink,
        ...makeCord2(-0.22915, -0.32542), ...colorNotPink,
        ...makeCord2(-0.09928, -0.31362), ...colorNotPink,
        ...makeCord2(-0.00336, -0.32542), ...colorNotPink,
        ...makeCord2(0.15455, -0.31066), ...colorNotPink,
        ...makeCord2(0.25047, -0.3269), ...colorNotPink,
        ...makeCord2(0.36558, -0.31657), ...colorNotPink,
        ...makeCord2(0.47036, -0.32837), ...colorNotPink,
        ...makeCord2(0.56923, -0.30919), ...colorNotPink,
        ...makeCord2(0.67401, -0.31804), ...colorNotPink,
        ...makeCord2(0.71091, -0.31362), ...colorNotPink, // C88

        ...makeCord2(-0.68516, -0.3387), ...colorNotPink, // C89
        ...makeCord2(-0.63794, -0.36232), ...colorNotPink,
        ...makeCord2(-0.55234, -0.34608), ...colorNotPink,
        ...makeCord2(-0.44756, -0.36674), ...colorNotPink,
        ...makeCord2(-0.32508, -0.34756), ...colorNotPink,
        ...makeCord2(-0.21734, -0.37265), ...colorNotPink,
        ...makeCord2(-0.09338, -0.35789), ...colorNotPink,
        ...makeCord2(-0.00041, -0.37855), ...colorNotPink,
        ...makeCord2(0.1206, -0.35936), ...colorNotPink,
        ...makeCord2(0.23571, -0.38002), ...colorNotPink,
        ...makeCord2(0.32721, -0.36379), ...colorNotPink,
        ...makeCord2(0.42904, -0.38002), ...colorNotPink,
        ...makeCord2(0.51611, -0.36084), ...colorNotPink,
        ...makeCord2(0.6563, -0.36527), ...colorNotPink, // C102
    ];
    eraserObj.indices = [
        ...makeBatchIndices(0, 15, 15),
        ...makeBatchIndices(15, 30, 15),
        ...makeBatchIndices(30, 45, 14),
        43, 44, 58,
        ...makeBatchIndices(45, 59, 15),
        58, 73, 72,
        ...makeBatchIndices(59, 74, 15),
        ...makeBatchIndices(74, 89, 15),
        87, 88, 102
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