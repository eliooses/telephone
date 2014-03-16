/*---------- REQUEST ANIMATION FRAME ----------*/
var request;
window.requestAnimFrame = (function(callback) {
  return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
          function(callback) {
              return window.setTimeout(callback, 1000 / 60);
          };
})();
/*---------------------------------------------*/


/*-------------- CANVAS VARIABLES -------------*/
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var canvasPosition;
var margin;


/*---------------- IMAGE OBJECTS --------------*/
var canvasImages;
var arrowSize;


/*------------------ INTERACTION --------------*/
var mousePos;
var isDown;
var draggedObj;

/*------------ SETUP | UPDATE | DRAW ----------*/
function setup(){
  canvasResize();
  canvasImages = [];
  margin = 100; 
  arrowSize = 30;
  isDown = false;
  isDragging = false;
  for(var i = 0; i < allImages.length; i++){
    var imgObj = new Object();  //creating object
    initImage(imgObj, i, allResults[i], allImages[i]);      //initializing
    canvasImages.push(imgObj);
  }
  mousePos = {x: 0, y: 0};

  canvas.addEventListener('mousemove',
                          function(evt){
                            getMousePos(evt);
                          },
                          false);

    canvas.addEventListener('mousedown',
                          function(){
                            isDown = true;
                          },
                          false);
    canvas.addEventListener('mouseup',
                          function(){
                            isDown = false;
                            isDragging = false;
                            for(var i = 0; i < canvasImages.length; i++){
                              var obj = canvasImages[i];
                              obj.isDragged = false;
                            }
                          },
                          false);    
  update();
}

function update(){
  for(var i = 0; i < canvasImages.length; i++){
    canvasImages[i].updateImage();
  }

  // console.log('down: ' + isDown);
  // console.log('drag: ' + isDragging);

  draw();
}

function draw(){
  // console.log('called draw');
  //Erasing the background
  ctx.clearRect(0, 0, canvas.width, canvas.height); 

    //Draw images
    for(var i = 0; i < canvasImages.length; i++){
      var obj = canvasImages[i];
      if(i < canvasImages.length - 1){
        var next = canvasImages[i + 1];
        drawConnection(obj, next);
      }

      // console.log(obj.isHovered);
      if(obj.isHovered){
        ctx.fillStyle = parseHslaColor(0, 0, 0, 0.5);
        ctx.fillRect(obj.pos.x - obj.img.width/2, obj.pos.y - obj.img.height/2,
                     obj.img.width, obj.img.height);        
        ctx.drawImage(obj.img, obj.pos.x - obj.img.width/2 - 10, obj.pos.y - obj.img.height/2 - 10);
      }else{
        ctx.drawImage(obj.img, obj.pos.x - obj.img.width/2, obj.pos.y - obj.img.height/2);  
      }
    }

    //Draw description
    for(var i = 0; i < canvasImages.length; i++){
      var obj = canvasImages[i];
      if(obj.isHovered){
        drawDescription(obj);
      }
    }

  // request = requestAnimFrame(update);   
}

function drawConnection(obj, next){
  var start = { x: obj.pos.x,
                y: obj.pos.y };
  var end = { x: next.pos.x,
              y: next.pos.y };
  var dist = calculateDistance(start.x, start.y, end.x, end.y);
  dist -= 80;
  var angle = Math.atan2(end.y - start.y, end.x - start.x) - Math.PI/2;

    ctx.save();
      ctx.translate(start.x, start.y);
      ctx.rotate(angle);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, dist);
        ctx.stroke();
        
        ctx.translate(0, dist);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(- arrowSize/2, - arrowSize/2);
        ctx.lineTo(arrowSize/2, - arrowSize/2);
        ctx.fill();
      ctx.restore();
}

function drawDescription(obj){
  ctx.font="12px Arial";
  var txt = obj.result.titleNoFormatting;
  var textWidth = ctx.measureText(txt).width;
  var descPos = {x: obj.pos.x - textWidth/2,
                 y: obj.pos.y + obj.img.height/2 }
  // console.log(textWidth);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.fillRect(descPos.x, descPos.y, textWidth + 10, 20);
  ctx.strokeRect(descPos.x, descPos.y, textWidth + 10, 20);

  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';
  ctx.fillText(txt, descPos.x + 4, descPos.y + 4);
}

/*---------------- IMAGE OBJECTS --------------*/
function initImage(obj, _index, _result, _img){
  var index = _index;
  var result = _result;
  var img = _img;
  var pos = new Object();

  pos = {x: margin + Math.floor(index / 3) * 200,
         y: 0}
         if(Math.floor(index / 3) % 2 == 0){
          pos.y = margin + ((index % 3) * 200);
         }else{
          pos.y = margin + ((2 * 200) - ((index % 3) * 200));
         }

  //Vars
  obj.index = index;
  obj.result = result;
  obj.img = img;
  obj.pos = pos;
  obj.isHovered = false;
  obj.isDragged = false;  
  
  //Functions
  obj.updateImage = updateImage;
}

function updateImage(){
  //Check Hover
  //If the mouse is not dragging any object...
  if(!isDragging){
    if(mousePos.x > this.pos.x - this.img.width/2 && mousePos.x < this.pos.x + this.img.width/2 &&
       mousePos.y > this.pos.y - this.img.height/2 && mousePos.y < this.pos.y + this.img.height/2 ){
      // console.log(this.img.src);
      this.isHovered = true;
      // console.log(isHovered);

      //Check click
      if(isDown){
        this.isDragged = true;
        isDragging = true;
      }

    }else{
      this.isHovered = false;
    }
  }

  //Drag
  if(this.isDragged){
    var x, y;
    x = mousePos.x;
    y = mousePos.y;
    this.pos.x = x;
    this.pos.y = y;
  }  
}

var calculateDistance = function(x1, y1, x2, y2){
  var angle = Math.atan2(y1 - y2, x1 - x2);
  var dist;
  if( (y1 - y2) == 0 ){
    dist = (x1 - x2) / Math.cos( angle );
  }else{
    dist = (y1 - y2) / Math.sin( angle );
  }
  return dist;
} 

function canvasResize(){
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  marginTop = $('#title').height();
  // console.log('margin top: ' + marginTop);

  canvasPosition = canvas.getBoundingClientRect(); // Gets the canvas position
  canvas.width = screenWidth - 10;
  canvas.height = screenHeight - marginTop - 10;
  canvasPosition = canvas.getBoundingClientRect(); // Gets the canvas position again!
  // console.log(canvasPosition);
} 

var parseHslaColor = function(h, s, l, a){
  var myHslColor = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a +')';
  //console.log('called calculateAngle function');
  return myHslColor;
}

function getMousePos(evt){
  mousePos.x = evt.clientX - canvasPosition.left;
  mousePos.y = evt.clientY - canvasPosition.top;
  //You have to use clientX! .x doesn't work with Firefox!
  // console.log(mousePos);
  update();
}