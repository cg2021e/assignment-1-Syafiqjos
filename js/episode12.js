class WebGLObject {
    constructor(gl, model, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        this.model = model;

        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this.vertexShader = null;
        this.fragmentShader = null;

        this.shaderProgram = null;
        this.shaderVar = {};

        this._initialize();
    }

    _initialize() {
        this._createVertexBuffer();
        this._createFragmentBuffer();
        this._createShader();
        this._compileShader();
        
        this._createShaderProgram();
        this._linkShaderProgram();
        this._runShaderProgram();
        
        this._registerShaderAttribute();
        this._registerShaderVar();
    }

    _createVertexBuffer() {
        let vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), this.gl.STATIC_DRAW);
    }

    _createFragmentBuffer() {
        let indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model.indices), this.gl.STATIC_DRAW);
    }

    _createShader() {
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertexShader, this.vertexShaderSource);
        
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
    }

    _compileShader() {
        this.gl.compileShader(this.vertexShader);
        this.gl.compileShader(this.fragmentShader);
    }

    _createShaderProgram() {
        this.shaderProgram = this.gl.createProgram();
    }

    _linkShaderProgram() {
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);

        this.gl.linkProgram(this.shaderProgram);
    }

    _runShaderProgram() {
        this.gl.useProgram(this.shaderProgram);
    }

    _registerShaderAttribute() {
        this.shaderVar.aPosition = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.gl.vertexAttribPointer(this.shaderVar.aPosition, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.enableVertexAttribArray(this.shaderVar.aPosition);
        
        this.shaderVar.aNormal = this.gl.getAttribLocation(this.shaderProgram, "aNormal");
        this.gl.vertexAttribPointer(this.shaderVar.aNormal, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(this.shaderVar.aNormal);

        this.shaderVar.aColor = this.gl.getAttribLocation(this.shaderProgram, "aColor");
        this.gl.vertexAttribPointer(this.shaderVar.aColor, 3, this.gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(this.shaderVar.aColor);
    }

    _registerShaderVar() {
        this.shaderVar.uModel = this.gl.getUniformLocation(this.shaderProgram, "uModel");
        this.shaderVar.uView = this.gl.getUniformLocation(this.shaderProgram, "uView");
        this.shaderVar.uProjection = this.gl.getUniformLocation(this.shaderProgram, "uProjection");

        let projection = glMatrix.mat4.create();
        glMatrix.mat4.perspective(projection, Math.PI / 3, 1, 0.5, 10);
        this.gl.uniformMatrix4fv(this.shaderVar.uProjection, false, projection);

        let view = glMatrix.mat4.create();
        let camera = [0, 0, 3];
        glMatrix.mat4.lookAt(view, camera, [0, 0, 0], [0, 1, 0]);
        this.gl.uniformMatrix4fv(this.shaderVar.uView, false, view);

        this.shaderVar.uLightConstant = this.gl.getUniformLocation(this.shaderProgram, "uLightConstant");
        this.shaderVar.uAmbientIntensity = this.gl.getUniformLocation(this.shaderProgram, "uAmbientIntensity");
        
        this.gl.uniform3fv(this.shaderVar.uLightConstant, [1.0, 0.5, 1.0]);   // orange light
        this.gl.uniform1f(this.shaderVar.uAmbientIntensity, 0.4) // light intensity: 40%
        
        this.shaderVar.uLightPosition = this.gl.getUniformLocation(this.shaderProgram, "uLightPosition");
        this.gl.uniform3fv(this.shaderVar.uLightPosition, [1.0, 1.0, 1.0]);
        let uNormalModel = this.gl.getUniformLocation(this.shaderProgram, "uNormalModel");
        let uViewerPosition = this.gl.getUniformLocation(this.shaderProgram, "uViewerPosition");
        this.gl.uniform3fv(this.shaderVar.uViewerPosition, camera);
    }
}

var vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute vec3 aNormal;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    void main() {
        gl_Position = uProjection * uView * uModel * (vec4(aPosition * 2. / 3., 1.));
        vColor = aColor;
        vNormal = aNormal;
        vPosition = (uModel * (vec4(aPosition * 2. / 3., 1.))).xyz;
    }
`;

var fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform vec3 uLightConstant;        // It represents the light color
    uniform float uAmbientIntensity;    // It represents the light intensity
    // uniform vec3 uLightDirection;
    uniform vec3 uLightPosition;
    uniform mat3 uNormalModel;
    uniform vec3 uViewerPosition;
    void main() {
        vec3 ambient = uLightConstant * uAmbientIntensity;
        // vec3 lightDirection = uLightDirection;
        vec3 lightDirection = uLightPosition - vPosition;
        vec3 normalizedLight = normalize(lightDirection);  // [2., 0., 0.] becomes a unit vector [1., 0., 0.]
        vec3 normalizedNormal = normalize(uNormalModel * vNormal);
        float cosTheta = dot(normalizedNormal, normalizedLight);
        vec3 diffuse = vec3(0., 0., 0.);
        if (cosTheta > 0.) {
            float diffuseIntensity = cosTheta;
            diffuse = uLightConstant * diffuseIntensity;
        }
        vec3 reflector = reflect(-lightDirection, normalizedNormal);
        vec3 normalizedReflector = normalize(reflector);
        vec3 normalizedViewer = normalize(uViewerPosition - vPosition);
        float cosPhi = dot(normalizedReflector, normalizedViewer);
        vec3 specular = vec3(0., 0., 0.);
        if (cosPhi > 0.) {
            float shininessConstant = 100.0; 
            float specularIntensity = pow(cosPhi, shininessConstant); 
            specular = uLightConstant * specularIntensity;
        }
        vec3 phong = ambient + diffuse + specular;
        gl_FragColor = vec4(phong * vColor, 1.);
    }
`;

function main() {
    //Access the canvas through DOM: Document Object Model
    var canvas = document.getElementById('previewCanvas');   // The paper
    var gl = canvas.getContext('webgl');                // The brush and the paints

    gl.viewport(0, 0, 640, 640);

    var cubeModel = makeCube(cubeModel);
    var cubeObject = new WebGLObject(gl, cubeModel, vertexShaderSource, fragmentShaderSource);

    function render() {
        let change = [0, 0, 0];
        if (true) { // If it is not freezing, then animate the rectangle
            // Init the model matrix
            var model = glMatrix.mat4.create();
            // Define a rotation matrix about x axis and store it to the model matrix
            glMatrix.mat4.rotate(model, model, change[0], [1, 0, 0]);
            // Define a rotation matrix about y axis and store it to the model matrix
            glMatrix.mat4.rotate(model, model, change[1], [0, 1, 0]);
            // Define a translation matrix and store it to the model matrix
            glMatrix.mat4.translate(model, model, change);
            // Set the model matrix in the vertex shader
            gl.uniformMatrix4fv(cubeObject.shaderVar.uModel, false, model);
            // Set the model matrix for normal vector
            var normalModel = glMatrix.mat3.create();
            glMatrix.mat3.normalFromMat4(normalModel, model);
            gl.uniformMatrix3fv(cubeObject.shaderVar.uNormalModel, false, normalModel);
            // Reset the frame buffer
            gl.enable(gl.DEPTH_TEST);
            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, cubeObject.model.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();