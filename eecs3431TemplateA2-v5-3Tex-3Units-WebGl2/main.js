// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE

var canvas;
var gl;

var program ;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


// For the lantern light
var lightPosition2 = vec4(1000.0, 2000.0, 1000.0, 1.0); // Example position, adjust as

// For the sunlight
var lightPosition = vec4(1000.0, 10000.0, 1000.0, 1.0); // Example position, adjust as needed


var lightAmbient2 = vec4(0.8, 0.5, 0.2, 1.0); // Warm ambient color
var lightDiffuse2 = vec4(0.8, 0.5, 0.2, 1.0); // Warm diffuse color
var lightSpecular2 = vec4(1.0, 0.8, 0.5, 1.0); // Warm specular color


var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;
var materialShininess2 = 100.0;


var ambientColor, diffuseColor, specularColor;
var ambientColor2, diffuseColor2, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ;

// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"silver.jpg") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"lava.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"images.jpg") ;

    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"steel.jpg") ;

    textureArray.push({}) ;
    loadImageTexture(textureArray[textureArray.length-1],image2) ;
    
    
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess2 );

}

function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program,
                                         "useTextures"), useTextures );
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"), flatten(lightPosition2));
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct2"), flatten(mult(lightAmbient2, materialAmbient)));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"), flatten(mult(lightDiffuse2, materialDiffuse)));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"), flatten(mult(lightSpecular2, materialSpecular)));

 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;
    
  
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

///////////////////////////////////////////////////////////////////////////////////////
var frameCount = 0;
var lastTime = 0;
var fpsDisplayInterval = 2000; //  the FPS every second
var forwardSpeed = 1.0;
var angleInRadians = 45 * (Math.PI / 180);
var audio = new Audio('HEROs.mp3');
var audioStarted = false;
var orbitRadius = 30.0; //  the orbit radius
var orbitSpeed = 20.0;  //  the orbit speed
function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(50,7,20);
    eye[1] = eye[1] + 0 ;
   
    var orbitCenter = vec3(-15.0, 1.0, 3.0);
    // set the projection matrix
    // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    projectionMatrix = perspective(75, 1, near, far);
    audio.play();
    // the camera matrix
    var orbitAngle = radians(orbitSpeed * TIME); // Adjust TIME for speed
    var cameraPosition = vec3(
        orbitCenter[0] + orbitRadius * Math.cos(orbitAngle),
        orbitCenter[1],
        orbitCenter[2] + orbitRadius * -Math.sin(orbitAngle)
    );
    //eye = vec3(0, 45 * Math.sin(Math.PI / 4), 30 * Math.cos(Math.PI / 4));
    //  viewMatrix = lookAt(eye, at , up);
    viewMatrix = lookAt(cameraPosition, orbitCenter, up);


    if (TIME >= 16 && TIME <= 19) {
        viewMatrix = lookAt(eye, at, up);
    }


    
    if (TIME > 19) {
        eye = vec3(20,10,-50);
        viewMatrix = lookAt(eye, at, up);
    }
    if (TIME > 20) {
        eye = vec3(40,10,-30);
        viewMatrix = lookAt(eye, at, up);
    }
    if (TIME > 21) {
        eye = vec3(20,10,-50);
        viewMatrix = lookAt(eye, at, up);
    }
    if (TIME > 22) {
        eye = vec3(10,10,-60);
        viewMatrix = lookAt(eye, at, up);
    }
    if (TIME > 23) {
        eye = vec3(20,10,-50);
        viewMatrix = lookAt(eye, at, up);
    }

    frameCount++;

    // Calculate the time elapsed since the last FPS update
    var currentTime = performance.now();
    var elapsed = currentTime - lastTime;

    // Check if it's time to update the FPS display
    if (elapsed > fpsDisplayInterval) {
        // Calculate the frames per second
        var fps = Math.round((frameCount * 1000) / elapsed);

        // Display the FPS in the console
        console.log("FPS: " + fps);

        // Reset frame count and update time
        frameCount = 0;
        lastTime = currentTime;
    }

    
    if (TIME >= 30) {
        //  fade-out progress 
        fadeOutProgress = Math.min(1.0, (TIME - 30) / 2.5);

        //  the fade-out progress to control the brightness or alpha value
        gl.clearColor(0.7 - fadeOutProgress, 0.0, 0.0, 1.0);
        audio.pause();
        // To completely stop rendering after fade-out      
        if (fadeOutProgress >= 1.0) {
            return;

        }
    }
   
   

    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;
    
    // get real time
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
  
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);

    
   
//head of the body

gTranslate(-15,-2,-15);

var kickAngle = 0;
var kickDirection = 1; 
kickAngle = Math.sin(TIME) * 20 * kickDirection;
var dx = forwardSpeed * Math.sin(angleInRadians);
var dz = forwardSpeed * Math.cos(angleInRadians);
gPush();{
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    gTranslate(-dx * TIME, 0, dz * TIME);
    gTranslate(8,3,0);
    setColor(vec4(0.0, 0.0, 1.0, 1.0));
    gRotate(45,0,1,0);
  
    gScale(0.8,1.8,1.3);
    drawSphere();
    gTranslate(0,1.5,0);
    gScale(0.5,0.5,0.5);
    setColor(vec4(0.8, 0.6, 0.4, 1.0)); 
    drawSphere();
    gTranslate(-0.8,0.3,0.5);
    setColor(vec4(0.0,0.0,0.0,1.0));
    gScale(0.2,0.2,0.2);
    drawSphere();
    gTranslate(0,0,-5);
    drawSphere();
  

   }
   gPop();


   // METEORITEEEEEEEEE !!!!!
   gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);
   gPush();
   {

    gTranslate(dx * TIME, -TIME, -dz * TIME); 
    gTranslate(-57,48,57);
    gScale(10,10,10);
    setColor(vec4(0.5, 0.0, 0.0, 1.0));
    drawSphere();

   }
   gPop();



// sword in the ROCK 
gPush();{

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
    gTranslate(-20,-2,28);
    setColor(vec4(0.5, 0.5, 0.5, 1.0));
    gRotate(45,0,1,0);
    gScale(3,3,3);
    drawSphere();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[3].textureWebGL);
    setColor(vec4(0.5, 0.0, 0.0, 1.0));
    gScale(0.02,2,0.12);
    gTranslate(0,0.5,0)
    drawCube();
    gTranslate(0,1,0);
    setColor(vec4(0.7, 0.5, 0.3, 1.0));  // Light brown color 
    gScale(2.5,0.06,2.5);
    drawCube();
    setColor(vec4(0.2, 0.2, 0.2, 1.0));  // Dark grey color 
    gScale(0.3,2,0.3);
    gTranslate(0,1,0);
    drawCube();
    gTranslate(0,1,0);
    gScale(1.2,0.5,1.2);
    drawCube();


   }
   gPop();



   gl.activeTexture(gl.TEXTURE1);
   gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
   //platform 
   gPush();{



    setColor(vec4(0.6, 0.4, 0.2, 1.0));
    gTranslate(8,-2,0);
     gRotate(45,0,1,0);
    gScale(1000,0.5,20);
    drawCube();
    gTranslate(0,1,0.75);
    setColor(vec4(0.2, 0.8, 0.2, 1.0));
    gScale(1,0.05,0.3);
    drawCube();
    gTranslate(0,0,-5);
    drawCube();

   }
   gPop();

   
   
   //Tree left of the human
   gPush();{

    setColor(vec4(0.6, 0.4, 0.2, 1.0));
    gTranslate(8,3,0);
    gTranslate(10,0,10);
     gRotate(45,0,1,0);
    gScale(0.75,5,0.75);
    drawCube();
    gTranslate(0,1.5,0);
    gRotate(-90,1,0,0);
    gScale(6,6,1);
    setColor(vec4(0.2, 0.8, 0.2, 1.0));
    drawCone();
    gTranslate(0,0,0.75);
    gScale(0.75,0.75,0.75);
    drawCone();
    gTranslate(0,0,0.75);
    gScale(0.5,0.5,0.5);
    drawCone();

   }
   gPop();

     //Tree right of the human
     gPush();{

        setColor(vec4(0.6, 0.4, 0.2, 1.0));
        gTranslate(-10,3,20);
        gTranslate(-10,0,-10);
         gRotate(45,0,1,0);
        gScale(0.75,5,0.75);
        drawCube();
        gTranslate(0,1.5,0);
        gRotate(-90,1,0,0);
        gScale(6,6,1);
        setColor(vec4(0.2, 0.8, 0.2, 1.0));
        drawCone();
        gTranslate(0,0,0.75);
        gScale(0.75,0.75,0.75);
        drawCone();
        gTranslate(0,0,0.75);
        gScale(0.5,0.5,0.5);
        drawCone();
    
       }
       gPop();

       gl.uniform1i(gl.getUniformLocation(program, "texture2"), 0);

       //Hat
   gPush();{
    gTranslate(-dx * TIME, 0, dz * TIME);    
setColor(vec4(1.0, 1.0, 1.0, 1.0));
gTranslate(8,6.7,0);
 gRotate(45,0,1,0);
 
 gRotate(-90,1,0,0);
gScale(2,2,1);
drawCone();

}
gPop();



   //left arm
      gPush();{
            gTranslate(-dx * TIME, 0, dz * TIME);
        setColor(vec4(0.0, 0.0, 1.0, 1.0));
        gTranslate(8.5,4,0.7);
        gRotate(45,0,1,0);
        
        gRotate(kickAngle, 0, 0, 1); 
        gRotate(-45,1,0,0);
        gScale(1,1.5,1);
        gScale(0.5,0.6,0.35);
    
        drawSphere();
        gRotate(15,0,0,1);
        gTranslate(-0.3,-2,0);
        drawSphere();
       
       }
       gPop();

//right arm
   gPush();{
        gTranslate(-dx * TIME, 0, dz * TIME);
    setColor(vec4(0.0, 0.0, 1.0, 1.0));
    gTranslate(7.5,4,-0.7);
    gRotate(45,0,1,0);
   
    gRotate(45,1,0,0);
    gRotate(-kickAngle, 0, 0, 1); 
    gRotate(20,0,0,1);
    gScale(1,1.5,1);
    gScale(0.5,0.6,0.35);
 
    drawSphere();
    gRotate(15,0,0,1);
    gTranslate(-0.3,-2,0);
    drawSphere();
    
   }
   gPop();

   //left leg 
   gPush();{
        gTranslate(-dx * TIME, 0, dz * TIME);
    setColor(vec4(0.0, 0.0, 1.0, 1.0));
    gTranslate(8.5,1,0.7);
    gRotate(45,0,1,0);
    
    gRotate(-kickAngle, 0, 0, 1); 
    gScale(1,1.5,1);
    gScale(0.5,0.6,0.35);
   
    drawSphere();
    gRotate(15,0,0,1);
    gTranslate(-0.3,-2,0);
    drawSphere();
    
   }
   gPop();
   
   //right leg
   gPush();{
        gTranslate(-dx * TIME, 0, dz * TIME);
    setColor(vec4(0.0, 0.0, 1.0, 1.0));
    gTranslate(7.5,1,-0.7);
    gRotate(45,0,1,0);
    gRotate(kickAngle, 0, 0, 1); 
    gRotate(20,0,0,1);
    gScale(1,1.5,1);
    gScale(0.5,0.6,0.35);
  
    drawSphere();
    gRotate(15,0,0,1);
    gTranslate(-0.3,-2,0);
    drawSphere();
    
   }
   gPop();

    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.

function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
