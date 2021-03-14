var VSHADER_SOURCE = 
    'precision mediump float;\n'+
    'attribute vec4 a_Position;\n'+
    'uniform mat4 u_Matrix;\n'+
    'attribute vec4 a_Color;\n'+ 
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
        '   v_Color = a_Color;\n'+
        '   gl_Position = u_Matrix * a_Position;\n'+
        '}\n';
    
var FSHADER_SOURCE = 
    'precision mediump float;\n'+
      'varying vec4 v_Color;\n' +
    'void main() {\n' +
        '   gl_FragColor= v_Color;\n'+
        '}\n';
 
const DISH_SCALE = 0.90;
const SCALE_STEP = 0.03;  

    //Variable Declaration
var currentSizeAcc = 0.01;
var bacAlive=[]
var bacteriaColors = [
    [0.0,0.0,1.0],  //BLUE
    [1.0,0.0,0.0],  //RED
    [0.0,1.0,0.0],  //GREEN
    [1.0,1.0,0.0],  //YELLOW
    [0.0,1.0,1.0],  //NEON
    [1.0,0.0,1.0],  //PINK
    [0.0,0.5,0.5],  //TEAL
    [1.0,0.5,0.0],  //ORANGE
    [0.0,0.0,0.5],  //NAVY
    [0.5,0.0,0.5]   //PURPLE
]
var currentBacteriaSize = 0.0;
var gameOver=false

function main(){
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
    return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
      }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Get storage location of u_ModelMatrix
    var u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix');
    if (!u_Matrix) { 
        console.log('Failed to get the storage location of u_Matrix');
    return;
    }

    // Model matrix
    var modelMatrix = new Matrix4();

    // BACTERIA GENERATION AND COLORING
    var bacCenters = initialBacteriaLocation();
    var bacColor= colorGenBac();
    //console.log(bacColor);
    //KILLING AND ALIVE PROCESS
    for (var i = 0; i < bacCenters.length; i+=2){
        bacAlive[i/2] = true;
    }
    //TICK FUNCTION LOOP
    function tick(){
        if(true){
            currentSizeAcc = animate(currentSizeAcc);
            draw(gl,currentSizeAcc, modelMatrix, u_Matrix, bacCenters,bacColor);
        }

        checkWinStatus();                          // Check if the player has won
        checkLossStatus();                         // Check if the player has lost
        //CheckGameStatus();
        if(!gameOver)
            requestAnimationFrame(tick,canvas);
        else
            gl.clear(gl.COLOR_BUFFER_BIT);
    }
    tick();
}

// Last time that this function was called
var g_last = Date.now();

// Utility function which is called each tick to animate the growth of the bacteria
function animate(size){
    var now=Date.now();
    var elapsed= now- g_last;
    g_last=now;
    var newSize= size +(SCALE_STEP* elapsed) /1000.0;
    return (newSize%=360);
}
/** Main draw function
* @param gl                  The WebGL context
* @param currentSize         The current scale of the bacteria.
* @param modelMatrix         The WebGL program's model matrix (currently unused)
* @param u_ModelMatrix       The Vertex Shader's Uniform Model Matrix attribute (currently unused)
* @param bacteriaLocations   An Array containing bacteria vertex locations
*/

function draw(gl, currentSizeAcc, modelMatrix, u_Matrix, bacCenters,bacColor){
    var temp= currentSizeAcc;
    gl.uniformMatrix4fv(u_Matrix, false, modelMatrix.elements);
    
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    //draw the Main Dish
    drawpetriDish(gl);
    for (var i =0; i<bacCenters.length;i+=2){
        if(bacAlive[i/2]==true)
            drawBacteria(gl,bacCenters[i],bacCenters[i+1],currentSizeAcc,bacColor[i/2]);
    }
}

function drawpetriDish(gl){
    var DishVertices=VertexGen(0, 0, 0.9, false);
    console.log(DishVertices.length);
    var Dishcolors = circleColorGen(1,1,1);
    let x = initVertexBuffers(gl,DishVertices,DishVertices.length/2);
    let y = initColorBuffers(gl,Dishcolors,Dishcolors.length/3);
    if (x <= 0 || y <= 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, DishVertices.length / 2);
}
/**
 * 
 * @param gl                The WebGL context
 * @param centerx           The center X position of the bacteria being drawn (this should be on the circumference of the back dish)
 * @param centery           The center y position of the bacteria being drawn (this should also be on the circumference of the dish)
 * @param currSizeAcc       The current size acceleration and how fast is the bacteria growing. The ratio is in form of float
 * @param bacteriaColor     The color for the bacteria
 * @returns 
 */

function drawBacteria(gl, centerx, centery, currSizeAcc,bacteriaColor){
    var bacVertices= VertexGen(centerx,centery,currSizeAcc, true);
    var bC=bacteriaColor;
    console.log(bC);
    let x = initVertexBuffers(gl,bacVertices, bacVertices.length/2);
    let y = initColorBuffers(gl,bC,bC.length/3);

    if (x <= 0 || y <= 0) {
        console.log('Failed to set the positions or colors of the vertices for the circle.');
        return;
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, bacVertices.length /2);
}
function colorGenBac(){
    var bColor=[];
    for (var i=0;i<10;i++){
        var temp=bacteriaColors[i];
        bColor[i]=circleColorGen(temp[0],temp[1],temp[2]);
    }
    return bColor;
}
/** a function which generates random bacteria locations on the petri dish
*   @returns a list of vertexs where the intial locations of bacteria would be
*/
function initialBacteriaLocation(){
    var bacVertexCenter=[]
    for (var i=0; i<10;i++){
        var randomradian=(Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
        var wx=Math.sin(randomradian).toFixed(2) * DISH_SCALE;
        var wy=Math.cos(randomradian).toFixed(2) * DISH_SCALE;
        bacVertexCenter= bacVertexCenter.concat(wx);
        bacVertexCenter= bacVertexCenter.concat(wy);
    }
    console.log(bacVertexCenter);
    return bacVertexCenter;
}

function VertexGen(centerX,centerY,scale,bacbool){
    var cVertex=[]
    for(var i=0.0; i<=360;i+=1){
        var j=i*Math.PI /180;
        var verta=[                
            Math.sin(j) * scale + centerX,
            Math.cos(j) * scale + centerY,
        ];
        if(bacbool == true){
            var vertb=[centerX,centerY];
        }
        else{
            var vertb=[Math.sin(j)*0.001,Math.cos(j) * 0.001];
        }
        cVertex = cVertex.concat(verta);
        cVertex = cVertex.concat(vertb);
    }

    if(bacbool == true){
        currentBacteriaSize = Math.abs(centerY - cVertex[1]);
    }
    return cVertex;
}

function circleColorGen(R,G,B){
    var cColors=[]
    for (var i=0;i<=360;i++){
        var verta=[R,G,B];
        cColors=cColors.concat(verta);
        cColors=cColors.concat(verta);
    }
    return cColors;
}

// Utility function to initialize th vertex buffers needed to draw any shapes.
function initVertexBuffers(gl, vertexArr, numVertices) {
    var vertices = new Float32Array(vertexArr);
    var n = numVertices;   // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target 
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Assign the buffer object to a_Position variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    return n;
}

// Utility function to initialize the colour buffers needed to define colours for vertices of shapes.
function initColorBuffers(gl, colorArr, numVertices){
    var colors = new Float32Array(colorArr);
    var n = numVertices;   // The number of vertices

    // Create a buffer object
    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    // Assign the buffer object to a_Color variable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Position or a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function OnclickHandler(e){
    let canvas = document.getElementById('gameCanvas');
    let recta = canvas.getBoundingClientRect();
    
    var wx = (e.clientX - recta.left) / canvas.clientWidth * 2 - 1;
    var wy = (e.clientY - recta.top) / canvas.clientHeight * (-2) + 1;
    console.log("Canvas clicked x = " + wx.toFixed(2) + " y = " + wy.toFixed(2));

   
    for (var i = 0; i < 20; i+=2){

        
        if (bacteria_centers[i].toFixed(1) === wx.toFixed(1)){
            if (bacteria_centers[i+1].toFixed(1) === wy.toFixed(1)){
                console.log("bacteria centers were hit");
                bacteriaVisibility[i/2] = false;
            }
        }

       
        if(Math.sqrt(Math.pow(Math.abs(wx - bacteria_centers[i]), 2) + Math.pow(Math.abs(wy - bacteria_centers[i+1]), 2)) < currentBacteriaSize){
            console.log("bacteria hit!!");
            bacteriaVisibility[i/2] = false;
        }

    }
}

// Function to check the win status. 
//This called every frame within the tick() function until the game is won or lost.
function checkWinStatus(){

    if ((bacteriaVisibility.includes(true))){
        
        return false;
    }else{
        console.log("game over you win! :-)");
        gameWon = true;
        document.getElementById('gameMessage').innerHTML = "<i style='color:red; font-size: 22pt'> You win </i> ";
        return true;
    }

}

// Function to check the loss status and update the message to the user if they have lost. 
//This is called every frame within the tick() function until the game is won or lost.
function checkLossStatus(){

    if (playerScore >= PLAYER_LOSS_SCORE){
        gameLost = true;
        alert("you lose and game over :-( ");
        document.getElementById('gameMessage').innerHTML = "<i style='color:yellow; font-size: 22pt'> You lose </i> "
    }

}


