var VSHADER_SOURCE = 
    'precision mediump float;\n'+
    'attribute vec4 a_Position;\n'+
    'uniform mat4 u_Matrix;\n'+
    'attribute vec4 a_Color\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
        'v_Color = a_Color;\n'+
        'gl_position = u_Matrix * a_Position;\n'+
        '}\n';
    
var FSHADER_SOURCE = 
    'precision mediump float;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
        'gl_FragColor= v_Color\n'+
        '}\n';
 
    //Variable Declaration
var currentSizeAcc = 0.01;
    
    
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

    //KILLING AND ALIVE PROCESS

    //TICK FUNCTION LOOP
    function tick(){
        if(true){
            currentSizeAcc = animate(currentSizeAcc);
            draw(gl,currentSizeAcc, modelMatrix, u_Matrix, bacCenterGenerator(), bacColorGenerator());
        }
        CheckGameStatus();
        if(!gameOver)
            requestAnimationFrame(tick,canvas);
        else
            gl.clear(gl.COLOR_BUFFER_BIT);
    }
    tick();
}

function draw(gl, currentSizeAcc, modelMatrix, u_Matrix, bacCenters, bacColors){
    var temp= currentSizeAcc;
    gl.uniformMatrix4fv(u_Matrix, false, modelMatrix.elements);
    
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //draw the Main Dish
    drawpetriDish(gl);

}

