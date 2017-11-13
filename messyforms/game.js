var GameManager = function() {

	this.currentLevel;

	this.renderer;
	this.stage;

	this.startForm;
	this.finalForm;
	this.line;
	this.modifiers;
	this.container;
	this.levelName;
	this.levelStep;
	this.isInLevelTransition;

	this.init = (startLevel)=>{
		this.currentLevel=startLevel||0;
		var width = Constants.canvasWidth ||window.innerWidth-2*Constants.lineThickness;
		var height =Constants.canvasHeight || window.innerHeight-2*Constants.lineThickness;
		this.renderer = PIXI.autoDetectRenderer(width,height);
		this.renderer.view.style.border=Constants.lineThickness+"px solid #FDFE0C";
		this.renderer.view.style.position="absolute";
		this.renderer.view.style.top=0;
		this.renderer.view.style.left=0;

		document.body.appendChild(this.renderer.view);

		this.container=new PIXI.Container();

		this.createCurrentLevelRenderer();
		this.gameLoop();
	};

	this.getCurrentLevel = ()=>{
		return levels[this.currentLevel%levels.length];
	}

	this.createCurrentLevelRenderer=()=>{
		new PIXI.Graphics().clear();
		this.container=new PIXI.Container();
		this.container.x=this.getPadding();
		this.container.y=this.getPadding();
		this.container.maxWidth=this.renderer.width-(2*this.getPadding());
		this.container.maxHeight=this.renderer.height-(2*this.getPadding());

		var currentLevel = this.getCurrentLevel();

		this.levelName=Utils.createText(currentLevel.name);
		this.levelName.position.set(this.container.maxWidth/2,0);
		//this.levelName.style={align: "center"};

		this.line = Utils.createLine(this.container.maxWidth,3);
		this.line.x=0;
		this.line.y=this.container.maxHeight/2;

		this.finalForm=Utils.createRectangle(1,currentLevel.final.size,currentLevel.final.color);
		this.finalForm.x=this.container.maxWidth;
		this.finalForm.y=this.container.maxHeight/2;


		this.startForm=Utils.createRectangle(1,1,"#FFFFFF");
		this.startForm.tint=currentLevel.initial.color;
		this.startForm.color=currentLevel.initial.color;
		this.startForm.targetColor=Utils.getColor(currentLevel.initial.color);
		this.startForm.x=0;
		this.startForm.y=this.container.maxHeight/2;
		this.startForm.scale.y=currentLevel.initial.size;
		var func = this.moveToEndPosition;
		this.startForm.on('pointerdown', func);
		this.startForm.interactive = true;
		this.startForm.buttonMode = true;
		

		this.modifiers = Utils.createModifiers(currentLevel.modifiers,this.startForm);
		this.levelStep = this.container.maxWidth/(1+this.modifiers.length);
		this.container.addChild(this.line);
		for(var i=0;i<this.modifiers.length;i++){
			this.modifiers[i].x=(i+1)*this.levelStep;
			this.modifiers[i].y=this.container.maxHeight/2;
			this.container.addChild(this.modifiers[i]);
		}
		this.container.addChild(this.finalForm);		
		this.container.addChild(this.startForm);
		this.container.addChild(this.levelName);

		var newRenderer = new PIXI.Container();
		newRenderer.addChild(this.container);
		this.stage = newRenderer;
	}

	this.moveToEndPosition=()=>{
		var startX = this.startForm.x;
		var stepSize = this.container.maxWidth/(this.modifiers.length+1);
		
		this.startForm.interactive=false;
		var func = (pos,time)=>{
			Utils.moveTo(this.startForm,{x:pos});
		};
		for(var i=0;i<=this.modifiers.length;i++){
			var time = (Constants.movementTransitionTime+Constants.modifierTransitionTime)*i*1000;
			var newX = startX+(i+1)*stepSize;
			setTimeout(func,time,newX,time);
		}
		
	}

	this.gameLoop=()=>{
		requestAnimationFrame(this.gameLoop);
		this.modifiers.forEach(m=>{
			if(Utils.hitTestRectangle(m,this.startForm)) {
				if(!m.triggered){
					m.triggered=true;
					m.action(this.startForm);
				}
			};
		});

		if(Utils.hitTestRectangle(this.finalForm,this.startForm)) {
			if(!this.isInLevelTransition){
				var completed = this.startForm.targetColor==this.finalForm.targetColor &&
				this.startForm.targetSize==this.finalForm.targetSize;
				this.isInLevelTransition=true;

				setTimeout(()=>{
					if(completed){
						this.currentLevel++;
					}
					this.isInLevelTransition=false;
					this.createCurrentLevelRenderer();
				},Constants.endLevelTime*1000);
			}
		}
		this.update();
	}

	this.getPadding=()=>{
		return Math.min(Constants.padding,this.renderer.width/2,this.renderer.height/2);
	}

	this.update=()=>{
		this.startForm.tint=Utils.getColor(this.startForm.color||"#FFFFFF");
		this.renderer.render(this.stage);
	}

	this.init();

}

var gm =new GameManager();