/*
  * NAME:   Giovanni Briggs 
  * DATE:   10/27/15 
  * CLASS:  COEN 290
  * ASSIGN: Homework 2
  *
  * This code was created by following an example from:
  *   https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
  *
  * The glUtils.js and sylverster.js files came form that tutorial.
  * These files provide some useful utilities for matrix manipulation similar to the GLUT files for OpenGL
  *
  * Instructions:
  *   Load index.html in a web browser.
  *   By default, the face rotates around the y-axis just to demonstrate the rotation effect.
  *   Move the mouse UP to push the object further away
  *   Move the mouse DOWN to bring the object closer
  *   CLICK and DRAG on the screen to create a vector around which to rotate the face.
  *   If you click and drag horizontally across the screen, it will rotate the face around the x-axis
  *   If you click and drag vertically across the screen, it will rotate the face around the y-axis.
  */

// initialize globals for canvas and web-gl
var canvas;
var gl;

// initialize globals for 
var shaderProgram;
var vertexPositionAttribute;
var vertexColorAttribute;

// initalize globals for holding the point cloud
// and definining where the cube is located on the screen
var cubeVerticesBuffer;
var cubeVerticesColorBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var cubeXOffset = 0.0;
var cubeYOffset = 0.0;
var cubeZOffset = 0.0;

// matrix to use to manipulate the point cloud
var mvMatrix;

// define matrix and other globals used to draw the face at different zoom levels
var perspectiveMatrix;
var num_points;
var zoomFactor = -20.0

// use to detect mouse drag and move events
var mouseDragFlag = 0;
var mouseDragPoints = [];
var vectorRotation = {"x":0,"y":1,"z":0};

function handleZoom(mouseEvent) {
  /**
    * Modify the zoomFactor based on the direction and amount of wheel movement
    *
    * @param mouseEvent   the event triggered by the mouse wheel
    */
  var move = event.wheelDelta/240;
  zoomFactor -= move;      
  console.log(zoomFactor);
  return false;   // Don't scroll the page as well
}


function start() {
  /**
    * Do initialization of canvas, webgl, and shaders.  At the end, set the scene to draw at fixed intervals to create animation.
    *
    */
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);      // Initialize the GL context

  // Only continue if WebGL is available and working
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    initShaders();

    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    initBuffers();

    // Set up to draw the scene periodically.
    setInterval(drawScene, 15);
  }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;

  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }

  // If we don't have a GL context, give up now

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  canvas.onmousewheel   = handleZoom;
  canvas.onmousedown    = mouseDown;
  canvas.onmouseup      = mouseUp;

}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional cube.
//
function initBuffers() {

  // Create a buffer for the cube's vertices.

  cubeVerticesBuffer = gl.createBuffer();

  // Select the cubeVerticesBuffer as the one to apply vertex
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);

  // Now create an array of vertices for the cube.

  var vertices = verts;
  num_points = vertices.length;
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  var colors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var generatedColors = [];
  //loop through and create a list of colors for each vertex
  for (j=0; j<verts.length; j+=200) {
    var r = Math.floor(Math.random() * (colors.length));
    var c = colors[r];
    for(h = 0; h < 200; h++) {
      generatedColors = generatedColors.concat(c);
    }

  }

  cubeVerticesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var cubeVertexIndices = indices;

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

function mouseDown(mouseEvent) {
  mouseDragFlag = 1;
  console.log(mouseEvent);  
  mouseDragPoints['xDown'] = mouseEvent.x;
  mouseDragPoints['yDown'] = mouseEvent.y;

}

function mouseUp(mouseEvent) {
  if (mouseDragFlag === 0) {
    return false;
  }
  mouseDragPoints['xUp'] = mouseEvent.x;
  mouseDragPoints['yUp'] = mouseEvent.y;
  console.log(mouseDragPoints);
  calculateVector(mouseDragPoints['xDown'], mouseDragPoints['yDown'], mouseDragPoints['xUp'], mouseDragPoints['yUp']);

}

function calculateVector(x1,y1,x2,y2) {
  /**
   * Calculate a vector between two points and the angle between them
   *
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   */
  v = [((x2-x1)/canvas.width), ((y2-y1)/canvas.height)];
  angle = Math.atan(v[1]/v[0]) * (180/Math.PI);
  if (isNaN(angle)) {
    angle = 0;
  }
  vector = {"vector":v, "angle":angle};
  console.log(vector);
  vectorRotation['x'] = v[0];
  vectorRotation['y'] = v[1];
  cubeRotation = angle;
  return vector;
}

function drawScene() { 
  /**
   * Draw the point cloud.
   * This function should be called in a loop in order to facilitate the rotation animation
   * It accesses a lot of different global variables in order to work.
   */
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Establish the perspective with which we want to view the.
  perspectiveMatrix = makePerspective(20.0, 640.0/480.0, 0.1, 100);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  loadIdentity();

  // Now move the drawing position a bit to where we want to start
  // drawing the cube.  The zoomFactor establishes how far in or out of the screen the face is drawn.
  mvTranslate([0.0, 0.0, zoomFactor]);

  // Save the current matrix, then rotate before we draw.
  mvPushMatrix();

  // rotate the cube around the vector that the user made with their mouse
  mvRotate(cubeRotation, [vectorRotation.x, vectorRotation.y, vectorRotation.z]);

  //on each iteration of the loop, increase the rotation angle by 3 degrees.
  cubeRotation += 3

  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  // Set the colors attribute for the vertices.
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

  // Draw the cube as a series of triangles between points.
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, num_points, gl.UNSIGNED_SHORT, 0);

  // Restore the original matrix
  mvPopMatrix();
}


function initShaders() {
  /**
    * Initialize the shaders, so WebGL knows how to set the scene
    */
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // Create the shader program
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }

  //tell web-gl to use our shader program
  gl.useProgram(shaderProgram);

  //set the global attributes so that we can easily access them when drawing the scene
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(vertexColorAttribute);
}


function getShader(gl, id) {
  /**
   * Loads a shader program by scouring the current document,
   * looking for a script with the specified ID.
   * 
   * @param gl  the global web-gl object
   * @param id  the name of the shader.  This name is the id of a *div* that holds the shader's information
   */
  var shaderScript = document.getElementById(id);

  // return nothing if we can't find this shader
  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.
  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its type.
  var shader;

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object
  gl.shaderSource(shader, theSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

//
// Matrix utility functions
//
// These functions where taken from:
//    https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
//
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

// hold the original matrix so that we can get back to it after doing manipulations
var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;

  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}
