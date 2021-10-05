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

    eraserObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    makeEraser(eraserObj);
    resizeObj(eraserObj, 0.5);
    eraserObj.pos.y = -0.5;
    eraserObj.pos.x = 0.5;
    eraserObj.customProperties = {
        isAnimateFloating : false,
        
        translationSpeed : 0.0089, // My NRP ^_^
        translationPos : 0,
        translationInitPos : -0.41,
        
        sinSpeedFactor : 1.5,
        sinHeightFactor: 0.4,
    }
    eraserObj.animateFunc = function(pos){  
        this.customProperties.translationPos += this.customProperties.translationSpeed;
        
        if (this.customProperties.isAnimateFloating){
            pos.y = Math.sin(this.customProperties.translationPos * this.customProperties.sinSpeedFactor) 
                    * this.customProperties.sinHeightFactor + this.customProperties.translationInitPos;
        } else {
            pos.y = Math.sin(this.customProperties.translationPos * this.customProperties.sinSpeedFactor) 
                    * this.customProperties.sinHeightFactor + this.customProperties.translationInitPos;
        }

        return pos;
    }
    
    otherObj = WebGLObject(gl, vertexShaderSource, fragmentShaderSource);
    makeOtherEraser(otherObj);
    resizeObj(otherObj, 0.5);
    otherObj.pos.y = -0.5;
    otherObj.pos.x = -0.5;

    world = WebGLWorld(gl);
    world.clearColor = [0.8, 0.8, 0.8, 1.0];

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

function makeEraser(obj) {
    colorSoPink = [181/255, 94/255, 129/255];
    colorRatherPink = [117/255, 55/255, 66/255];
    colorNotPink = [79/255, 55/255, 63/255];
    colorSeemsBlack = [23/255, 19/255, 22/255];

    obj.vertices = [
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
    obj.indices = [
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
}

function makeOtherEraser(obj) {
    colorSoPink = [181/255, 94/255, 129/255];
    colorRatherPink = [117/255, 55/255, 66/255];
    colorNotPink = [79/255, 55/255, 63/255];
    colorSeemsBlack = [23/255, 19/255, 22/255];

    obj.vertices = [
        ...makeCord2(0.11096, 0.66467), ...colorSoPink, // D0
        ...makeCord2(0.23079, 0.63229), ...colorSoPink,
        ...makeCord2(0.2567, 0.57399), ...colorSoPink,
        ...makeCord2(0.30851, 0.51246), ...colorSoPink,
        ...makeCord2(0.33118, 0.46712), ...colorSoPink,
        ...makeCord2(0.37328, 0.41531), ...colorSoPink,
        ...makeCord2(0.38948, 0.35701), ...colorSoPink,
        ...makeCord2(0.46396, 0.29872), ...colorSoPink,
        ...makeCord2(0.47368, 0.24043), ...colorSoPink,
        ...makeCord2(0.54816, 0.1627), ...colorSoPink,
        ...makeCord2(0.55464, 0.11412), ...colorSoPink,
        ...makeCord2(0.63236, 0.02344), ...colorSoPink,
        ...makeCord2(0.65827, -0.0478), ...colorSoPink,
        ...makeCord2(0.70685, -0.12229), ...colorSoPink,
        ...makeCord2(0.63884, -0.18058), ...colorSoPink, // D14

        ...makeCord2(-0.16107, 0.64524), ...colorSoPink, // D15
        ...makeCord2(-0.11319, 0.52165), ...colorSoPink,
        ...makeCord2(-0.05402, 0.4087), ...colorSoPink,
        ...makeCord2(0.00246, 0.27154), ...colorSoPink,
        ...makeCord2(0.04549, 0.15589), ...colorSoPink,
        ...makeCord2(0.10197, 0.03218), ...colorSoPink,
        ...makeCord2(0.16445, -0.08901), ...colorSoPink,
        ...makeCord2(0.20421, -0.23481), ...colorSoPink, // D22

        ...makeCord2(-0.47845, 0.6161), ...colorSoPink, // D23
        ...makeCord2(-0.55319, 0.56026), ...colorSoPink,
        ...makeCord2(-0.53998, 0.43798), ...colorSoPink,
        ...makeCord2(-0.49788, 0.32139), ...colorSoPink,
        ...makeCord2(-0.47845, 0.22747), ...colorSoPink,
        ...makeCord2(-0.43311, 0.14003), ...colorSoPink,
        ...makeCord2(-0.43311, 0.04935), ...colorSoPink,
        ...makeCord2(-0.39101, -0.064), ...colorSoPink,
        ...makeCord2(-0.33919, -0.17411), ...colorSoPink,
        ...makeCord2(-0.27442, -0.28098), ...colorSoPink,
        ...makeCord2(-0.14812, -0.30365), ...colorSoPink, // D33
        
        ...makeCord2(-0.2772, -0.34361), ...colorRatherPink, //D34
        ...makeCord2(-0.13873, -0.35679), ...colorRatherPink,
        ...makeCord2(0.23383, -0.30075), ...colorRatherPink,
        ...makeCord2(0.65584, -0.2381), ...colorRatherPink,
        ...makeCord2(0.73281, -0.19169), ...colorRatherPink, //D38

        ...makeCord2(-0.44001, -0.0892), ...colorRatherPink, //D39
        ...makeCord2(-0.42664, -0.17144), ...colorRatherPink,
        ...makeCord2(-0.3857, -0.25212), ...colorRatherPink,
        ...makeCord2(-0.37336, -0.36567), ...colorRatherPink,
        ...makeCord2(-0.31905, -0.45453), ...colorRatherPink,
        ...makeCord2(-0.28503, -0.53835), ...colorRatherPink,
        ...makeCord2(-0.14045, -0.55642), ...colorRatherPink,
        ...makeCord2(0.25454, -0.49446), ...colorRatherPink,
        ...makeCord2(0.66244, -0.43251), ...colorRatherPink,
        ...makeCord2(0.7373, -0.3912), ...colorRatherPink, //D48
        
        ...makeCord2(-0.54746, 0.35457), ...colorRatherPink, //D49
        ...makeCord2(-0.54368, 0.26133), ...colorRatherPink,
        ...makeCord2(-0.51653, 0.19962), ...colorRatherPink,
        ...makeCord2(-0.50912, 0.12309), ...colorRatherPink,
        ...makeCord2(-0.48197, 0.06879), ...colorRatherPink, //D53
        
        ...makeCord2(-0.4795, -0.02008), ...colorNotPink, //D54
        ...makeCord2(-0.47349, -0.09431), ...colorNotPink,
        ...makeCord2(-0.45415, -0.22517), ...colorNotPink,
        ...makeCord2(-0.4, -0.4), ...colorNotPink,
        ...makeCord2(-0.35473, -0.51512), ...colorNotPink,
        ...makeCord2(-0.30052, -0.58224), ...colorNotPink,
        ...makeCord2(-0.14045, -0.60031), ...colorNotPink,
        ...makeCord2(0.26228, -0.53319), ...colorNotPink,
        ...makeCord2(0.67276, -0.47123), ...colorNotPink,
        ...makeCord2(0.73214, -0.44283), ...colorNotPink, //D63

        ...makeCord2(-0.31859, -0.63129), ...colorNotPink, //D64
        ...makeCord2(-0.19983, -0.69067), ...colorNotPink,
        ...makeCord2(0.28294, -0.61322), ...colorNotPink,
        ...makeCord2(0.67793, -0.55384), ...colorNotPink, //D67
    ];
    
    obj.indices = [
        ...makeBatchIndices(0, 15, 5),
        4, 6, 19,
        5, 6, 19,
        6, 7, 19,
        7, 8, 19,
        ...makeBatchIndices(8, 19, 4),
        11, 12, 22,
        12, 13, 22,
        13, 14, 22,
        ...makeBatchIndices(23, 15, 8),
        30, 22, 31,
        31, 22, 32,
        32, 22, 33,
        14, 13, 38,
        14, 38, 37,
        22, 14, 37,
        22, 37, 36,
        33, 22, 36,
        33, 36, 35,
        32, 33, 35,
        32, 35, 34,

        34, 45, 44,
        34, 35, 45,
        35, 46, 45,
        35, 36, 46,
        36, 47, 46,
        36, 37, 47,
        37, 48, 47,
        37, 38, 48,

        ...makeBatchIndices(44, 59, 5),
        ...makeBatchIndices(59, 64, 4),

        62, 63, 67,

        ...makeBatchIndices(25, 49, 5),

        53, 29, 54,
        29, 30, 54,
        54, 30, 39,
        54, 39, 55,

        ...makeBatchIndices(42, 57, 3),
        58, 59, 64,

        34, 44, 43,
        32, 34, 43,
        32, 43, 42,
        41, 32, 42,
        31, 32, 41,
        
        ...makeBatchIndices(39, 55, 5),
        ...makeBatchIndices(30, 39, 2),

        40, 31, 41
    ];
}

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

function resizeObj(obj, scale){
    obj.vertices = obj.vertices.map((x, i) => {
        if (i % 6 >= 3) {
            return x;
        }
        return x * scale;
    });
}