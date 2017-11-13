var Utils = {
	createRectangle:(width,height,color,useBorder)=>{
		width*=Constants.rectanglesWidth;
		height*=Constants.rectanglesWidth;
		var rectangle = new PIXI.Graphics();
 		if(useBorder){
 			rectangle.lineStyle(Constants.lineThickness, 0xF0F0F0);
			rectangle.lineColor=0xFFFFFF;
		}
		rectangle.pivot.x=width/2;
		rectangle.pivot.y=height/2;
	
		rectangle.beginFill(Utils.getColor(color));	
		rectangle.drawRect(0,0,width,height);
		rectangle.endFill();
		rectangle.targetColor=Utils.getColor(color);
		rectangle.targetSize=height;
		return rectangle;
	},createTriangle:(size,color)=>{
		var triangle = new PIXI.Graphics();
		triangle.beginFill(Utils.getColor(color));
		var proporcaoAltura = 1;
		triangle.drawPolygon([
			-size, proporcaoAltura*size,             //First point
			size, proporcaoAltura*size,              //Second point
			0, 0                 //Third point
		]);
		triangle.pivot.x=0;
		triangle.pivot.y=size*proporcaoAltura/2;
		triangle.endFill();
		return triangle;
	},
	createLine : (width,thickness)=>{
		var line = new PIXI.Graphics();
		line.beginFill(0xF0F0F0);
		line.drawRect(0,0,width,thickness);
		line.pivot.y=thickness/2;
		line.endFill();
		return line;
	},
	createModifiers:(list,startForm)=>{
		return list.map(l=>{
			var icon = Utils.createModifier(l,startForm);
			icon.triggered=false;
			return icon;
		});
	},
	createModifier(l,startForm){
		var action;
		var icon;
		switch(l.type){
				case "resize":
					icon = Utils.createRectangle(1,1,"#000000",true);
					var topRectangle =Utils.createTriangle(Constants.rectanglesWidth/5,"#FFFFFF");
					var downRectangle =Utils.createTriangle(Constants.rectanglesWidth/5,"#FFFFFF");
					topRectangle.x+=Constants.rectanglesWidth/2;
					topRectangle.y+=Constants.rectanglesWidth*0.3;
					downRectangle.x+=Constants.rectanglesWidth/2;
					downRectangle.y+=Constants.rectanglesWidth*0.7;
					var rotated = l.size>1?downRectangle:topRectangle;
					rotated.rotation=Math.PI;
					action= Utils.getActionByType(l);
					icon.addChild(topRectangle);
					icon.addChild(downRectangle);
				break;
				case "colorize":
					icon = Utils.createRectangle(1,1,l.color,true);					
					action= Utils.getActionByType(l);
				break;
				case "select":
					icon =new PIXI.Container();
					var child= Utils.createRectangle(1,1,"#000000",true);
					var questionMark = Utils.createText("?",Constants.rectanglesWidth);
					questionMark.tint=Utils.getColor("#FFFFFF");
					questionMark.x+=Constants.rectanglesWidth/2;
					questionMark.y+=Constants.rectanglesWidth/2;
					icon.interactive=true;
					child.addChild(questionMark);	
					icon.addChild(child);	
					icon.modifierIndex;		
					icon.options=l.options;

					icon.on('pointerdown', (obj)=>{
						var icon = obj.target;
						icon.children=[];
						if(icon.modifierIndex==undefined || icon.modifierIndex==icon.options.length-1){
							icon.modifierIndex=0;
						}else{
							icon.modifierIndex++;
						}

						var child = Utils.createModifier(icon.options[icon.modifierIndex]); ;
						icon.addChild(child);
						icon.action=Utils.getActionByType(icon.options[icon.modifierIndex]);


					});
					action=(f)=>{};
				break;
			}
			icon.name=l.type;
			icon.action=action;
			return icon;
	},
	getActionByType(l){
		switch(l.type){
			case "resize":
				return (f)=>Utils.resize(f,l.size);
			break;
			case "colorize":
				return (f)=>Utils.colorize(f,l.color);
			break;
		}
	},
	createText(value,size){
		var text =  new PIXI.Text(
		  value,
		  {fontFamily: "Arial", fontSize: size||Constants.fontSize, fill: "#FFFFFF"}
		);
		text.pivot.x=text.width/2;
		text.pivot.y=text.height/2;
		return text;
	},
	colorize:(element,color)=>{
		element.targetColor=Utils.getColor(color);
		TweenLite.to(element, Constants.modifierTransitionTime, {color:color, ease: Constants.easeColorize});
	},
	resize:(element,size)=>{
		var newHeight = Constants.rectanglesWidth*size;
		element.targetSize=newHeight;
		TweenLite.to(element, Constants.modifierTransitionTime, {height:newHeight, ease: Constants.easeResize});
	},
	moveTo(element,options){
		options["ease"]=Constants.easeMovement;
		TweenLite.to(element, Constants.movementTransitionTime, options);	
	},
	getColor:(rgb)=>{
		var color;
		if(rgb.toString().includes("rgb")){
			 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			 color= (rgb && rgb.length === 4) ? "#" +
			  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
			  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
			  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
		}else{
			color= rgb;
		}
		return parseInt(color.substring(1),16);
	},
	hitTestRectangle:(r1, r2)=> {
	  //Define the variables we'll need to calculate
	  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

	  //hit will determine whether there's a collision
	  hit = false;

	  //Find the center points of each sprite
	  r1.centerX = r1.x + r1.width / 2;
	  r1.centerY = r1.y + r1.height / 2;
	  r2.centerX = r2.x + r2.width / 2;
	  r2.centerY = r2.y + r2.height / 2;

	  //Find the half-widths and half-heights of each sprite
	  r1.halfWidth = r1.width / 2;
	  r1.halfHeight = r1.height / 2;
	  r2.halfWidth = r2.width / 2;
	  r2.halfHeight = r2.height / 2;

	  //Calculate the distance vector between the sprites
	  vx = r1.centerX - r2.centerX;
	  vy = r1.centerY - r2.centerY;

	  //Figure out the combined half-widths and half-heights
	  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

	  //Check for a collision on the x axis
	  if (Math.abs(vx) < combinedHalfWidths) {

		//A collision might be occuring. Check for a collision on the y axis
		if (Math.abs(vy) < combinedHalfHeights) {

		  //There's definitely a collision happening
		  hit = true;
		} else {

		  //There's no collision on the y axis
		  hit = false;
		}
	  } else {

		//There's no collision on the x axis
		hit = false;
	  }

	  //`hit` will be either `true` or `false`
	  return hit;
}
}
