import { Image,loadImage,createCanvas, Canvas } from "canvas";
import { InsertTextConfig, TextAlignMode, TextCoordinates } from "./types";
import { CanvasRenderingContext2D } from "canvas";


export class CanvasImageTransform{
    declare _image:Image;
    declare _paramImage:Image|string|Buffer;
    declare _canvas:Canvas;
    declare createCanvas:Function;
    constructor(width:number,height:number,image:string|Buffer|Image){
        this._paramImage=image;
        this.createCanvas=()=>{this._canvas=createCanvas(width,height)};
    }

    async loadImage(){
      try{

        if(typeof window!=='undefined'||this._paramImage instanceof Image){
           //@ts-ignore
           this._image=this._paramImage;
        }else{
          this._image=await loadImage(this._paramImage)
        }
      }catch(e){
         throw e;
      }
    }
    async drawImage(dx:number,dy:number,dw:number,dh:number){
       try{
          await this.loadImage();
          let context=await this.get2dContext();
          await context.drawImage(this._image,dx,dy,dw,dh);
       }catch(e){
          throw e;
       }
    }
    measureText(text:string,font?:string){
      let context=this.get2dContext();
      if(font)
        context.font=font;
      return context.measureText(text);
    }
    get2dContext():CanvasRenderingContext2D{
      if(!this._canvas)
         this.createCanvas();
       return this._canvas.getContext('2d');
    }
    
    async insertText(config:InsertTextConfig){
         try{
            let context=this.get2dContext();
            context.textBaseline='top';
            context.textDrawingMode='path';
            const textCoordinates=getTextCoordinates(this._canvas.width,this._canvas.height);
            if(config.font)
               context.font=config.font;
            if(config.rotate)
               context.rotate(config.rotate);
            switch(config.mode){
               case TextAlignMode.center:
                  textCenterMode(context,textCoordinates);
                  break;
               case TextAlignMode.left:
                  textLeftMode(context,textCoordinates); 
                  break  
               default:
                  textCenterMode(context,textCoordinates);   
                  break;
            }      
            if(config.rotate)
              context.rotate(-config.rotate);
         }catch(e){
            throw e;
         }
         function textCenterMode(context:CanvasRenderingContext2D,coord:TextCoordinates){
          context.textAlign='center';
          const maxWidth=coord.xe?(coord.xe-coord.xs):undefined;
          const setcenter=maxWidth?maxWidth/2:0;
          fillText(config,context,coord.xs,coord.y,maxWidth);
         }
         function textLeftMode(context:CanvasRenderingContext2D,coord:TextCoordinates){
           context.textAlign='left';
           fillText(config,context,coord.xs,coord.y);
         }
         function getTextCoordinates(width:number,height:number):TextCoordinates{
            let xs=config.coord.xs;
            let xe=config.coord.xe;
            let y=config.coord.y;
            if(xs>0&&xs<1){
              xs=Math.floor(width*xs);
            }
            if(xe&&xe>0&&xe<1){
              xe=Math.floor(width*xe);
            }
            if(y>0&&y<1){
              y=Math.floor(height*y);
            }
            return {
              xs,xe,y
            }
         }
         
    }
    
    

    
}

function fillText(config:InsertTextConfig,context:CanvasRenderingContext2D,xs:number,y:number,maxWidth?:number){
  if(!config.style){
     context.fillStyle=`#000`;
  }else{
     context.fillStyle=`${config.style}`;
  }
  context.fillText(config.text,xs,y,maxWidth);
}