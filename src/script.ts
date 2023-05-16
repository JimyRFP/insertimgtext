import { Image } from "canvas";
import { TextAlignMode } from "./types";
import { CanvasImageTransform } from "./insert";
import sharp = require("sharp");
import { getCanvasFontName } from "./utils";
interface RangeFontSizeInfo{
    fontName:string,
    texts:Array<string>,
    lines:number,
    sizePerChar:number,
    measure:Array<{width:number,height:number}>,
    totalHeight:number,
    fontSize:number,
}
export interface InsertTextOverImageConfig{
    alignMode:TextAlignMode,
    xs:number,
    ys:number,
    maxWidth:number,
    maxHeight:number,
    centerHeight?:boolean,
    text:string,
    maxLines?:number,
    font:{
        path?:string,
        family:string,
        style?:string,
        size?:number,
        adjust_size?:boolean,
        breakLineSpacing?:number,
    },
    rotate?:number,

}
export async function insertTextOverImage(image:string|Buffer|Image,width:number,height:number){
   const canvas=new CanvasImageTransform(width,height,image);
   return {
      canvas,
      insert,
      findBetterFontSize,
   }
   async function insert(config:InsertTextOverImageConfig){
    try{
        const {betterFontSize,breakLineSpacing}=await findBetterFontSize(config);
        await canvas.drawImage(0,0,width,height);
        if(config.font.path){
           canvas.registerFont({
              path:config.font.path,
              family:config.font.family,
           });
        }
        
        let addx=0;
        if(config.alignMode===TextAlignMode.center){
           addx=config.maxWidth/2;
        }
        let startY=config.ys;
        if(config.centerHeight){
            let addy=(config.maxHeight-betterFontSize.totalHeight)/2;
            if(addy>0){
               startY+=addy;
            }
        }
        for(let index=0;index<betterFontSize.texts.length;index++){
            let iText=betterFontSize.texts[index].trim();
            await canvas.insertText({
                text:iText,
                font:betterFontSize.fontName,
                rotate:config.rotate,
                style:config.font.style,
                mode:config.alignMode,
                coord:{
                  y:startY+(index*(betterFontSize.fontSize+breakLineSpacing)),
                  xs:config.xs+addx,
                  
                }
            });
        }
        return canvas;
     }catch(e){
         throw e;
     }
   }
   function findBetterFontSize(config:InsertTextOverImageConfig){
    const centralValue=config.font.size||getFontCentralRecomendedValue(canvas,config.text,config.font.family,config.maxWidth,config.maxHeight);
    const breakLineSpacing=Math.floor(config.font.breakLineSpacing||(centralValue*0.1));
    let betterFontSize:false|RangeFontSizeInfo=false;
    if(!config.font.adjust_size){
        betterFontSize=getFontWithTextInfo(canvas,config.text,centralValue,{
            maxWidth:config.maxWidth,
            font:{
              size:centralValue,
              family:config.font.family
            },
            breakLineSpacing,
          })
    }else{
        const fontRanges=getRangeFontSize(canvas,config.text,{
            maxWidth:config.maxWidth,
            font:{
                size:centralValue,
                family:config.font.family
            },
            breakLineSpacing:breakLineSpacing,
        });
        betterFontSize=getBetterFontSize(fontRanges,{maxWidth:config.maxWidth,maxHeight:config.maxHeight,maxLines:config.maxLines});
        if(!betterFontSize){
            if(fontRanges.length<3){
                betterFontSize=fontRanges[0];
            }else{
                betterFontSize=fontRanges[Math.floor((fontRanges.length-1)/2)];
            }
       }
    }
    return {
        betterFontSize,
        breakLineSpacing,
    };
   } 
   
}

export function getFontCentralRecomendedValue(canva:CanvasImageTransform,text:string,fontFamily:string,maxWidth:number,maxHeight:number){
        const dW=getWidthConst();
        const dH=getHeightConst();
        const totalv=(maxWidth*maxHeight*dW*dH)/text.length;
        const fSize=Math.floor(Math.pow(totalv,1/2))/2;
        if(fSize>0)
          return fSize;
        return 1;  
    function getWidthConst(){
        const baseValues=[90];
        let total=0;
        for(let i=0;i<baseValues.length;i++){
            let msr=canva.measureText(text,getCanvasFontName({family:fontFamily},baseValues[i]));
            total+=baseValues[i]/(msr.width/text.length);
        }
        return total/baseValues.length;
    }
    function getHeightConst(){
        const baseValues=[46];
        let total=0;
        for(let i=0;i<baseValues.length;i++){
            let msr=canva.measureText(text,getCanvasFontName({family:fontFamily},baseValues[i]));
            total+=baseValues[i]/(msr.actualBoundingBoxAscent+msr.actualBoundingBoxDescent);
        }
        return total/baseValues.length;
    }
}

function separeTextIfMaxWidth(sizePerChar:number,maxWidth:number,text:string){
    let maxCharsPerLine=Math.floor(maxWidth/sizePerChar);
    let texts:Array<string>=[];
    const words=sliptMulti(text,[' ','  ','\n']);
    let tempText="";
    for(let i=0;i<words.length;i++){
        if(tempText==""){
            tempText=words[i];
        }else{
           if((tempText.length+1+words[i].length)<=maxCharsPerLine){
               tempText+=` ${words[i]}`;
           }else{
               texts.push(tempText);
               tempText=words[i];
           }
        }   
        if(tempText.length<maxCharsPerLine&&i<words.length-1){
            continue;
        }else{
            texts.push(tempText);
            tempText="";
        }
    }
    return texts;
    
} 

function sliptMulti(text:string,separators:Array<string>){
    let temp=separators[0];
    let rText=text;
    for(let i=1;i<separators.length;i++){
       rText=rText.split(separators[i]).join(temp);
    }
    return rText.split(temp);
}


export function getRangeFontSize(canva:CanvasImageTransform,text:string,config:{maxWidth:number,font:{size:number,family:string,path?:string},breakLineSpacing?:number}){
   try{
      let texts:Array<RangeFontSizeInfo>=[];
      const {font,maxWidth}=config;
      const factor=font.size*0.03;
      const range=10;
      for(let i=-range;i<=3*range;i++){
           let cFontSize=Math.floor(font.size+(i*factor));
           if(cFontSize==0)
              continue;
           texts.push(getFontWithTextInfo(canva,text,cFontSize,config))
      }
      return texts;
   }catch(e){
       throw e;
   }
}
export function getFontWithTextInfo(canva:CanvasImageTransform,text:string,fontSize:number,config:{maxWidth:number,font:{size:number,family:string,path?:string},breakLineSpacing?:number}){
    try{
           const {font,maxWidth}=config;
           let fontName=getCanvasFontName({family:font.family},fontSize);
           const measure=canva.measureText(text,fontName);
           const sizePerChar=measure.width/text.length;
           let tempTexts=separeTextIfMaxWidth(sizePerChar,maxWidth,text);
           let totalHeight=tempTexts.length*(fontSize+(config.breakLineSpacing||0));
           let ret={
             fontName,
             lines:tempTexts.length,
             fontSize:fontSize,
             sizePerChar:sizePerChar,
             texts:tempTexts,
             totalHeight:0,
             measure:tempTexts.map((text:string)=>{
                 let msr=canva.measureText(text,fontName);
                 return {
                    width:msr.width,
                    height:msr.actualBoundingBoxAscent+msr.actualBoundingBoxDescent,
                 }
             })
           };
           totalHeight=(ret.lines-1)*(config.breakLineSpacing||0);
           ret.measure.map((msr:any)=>{
                totalHeight+=msr.height;
           })
           ret.totalHeight=totalHeight;
           return ret;
    }catch(e){
        throw e;
    }

}

export function getBetterFontSize(datas:Array<RangeFontSizeInfo>,config:{maxHeight?:number,maxWidth:number,maxLines?:number,passMaxWidthTolerance?:number}){
   try{
     let filteredData:Array<RangeFontSizeInfo>=[];
     const passMaxWidthTolerance=config.passMaxWidthTolerance||0;
     const {maxWidth}=config;
     for(let data of datas){
        if(config.maxHeight){
            if(data.totalHeight>config.maxHeight)
              continue;
        }
        filteredData.push(data);
     }
     let widthInfo=getMaxWidthDiference(filteredData,maxWidth);
     let lowerIndex=-1;
     let lowerMaxDistance=+Infinity;
     for(let i=0;i<widthInfo.length;i++){
        let info=widthInfo[i];
        if(info.lower<0&&-info.lower>passMaxWidthTolerance)
           continue;   
        if(config.maxLines&&info.lines>config.maxLines)
           continue;   
        let uselower=info.lines===1?info.lower:info.greaterWithoutLast;   
        if(uselower<lowerMaxDistance){
            lowerMaxDistance=uselower;
            lowerIndex=i;
        }   
     }
     if(lowerIndex<0)
        return false;
     return filteredData[lowerIndex];   
   }catch(e){
       throw e;
   }

   function getMaxWidthDiference(datas:Array<RangeFontSizeInfo>,maxWidth:number){
       let ret:Array<{
        difs:Array<number>
        greaterWithoutLast:number,
        greater:number,
        lower:number,
        lines:number,
       }>=[];
       for(let data of datas){
          let difs:Array<number>=[];
          let greater=-Infinity;
          let greaterWithoutLast=-Infinity;
          let lower=+Infinity
          const lastIndex=data.measure.length-1;
          for(let index=0;index<data.measure.length;index++){
              let textMe=data.measure[index];
              let dif=maxWidth-textMe.width;
              difs.push(dif);
              if(dif>greater){
                greater=dif;
              }
              if(index<lastIndex&&dif>greaterWithoutLast){
                greaterWithoutLast=dif;
              }
              if(dif<lower){
                lower=dif;
              }

          }
          ret.push({
            difs,
            greater,
            greaterWithoutLast,
            lower,
            lines:data.lines,
          });
       }
       return ret;
   }
}


export async function getInsertTextOverImageObject(img:Buffer){
   try{
    const baseImage=sharp(img);
    const metaData=await baseImage.metadata();
    if(!metaData.width||!metaData.height)
       throw "error to get metadata";
    const insertTextOverImageObj=await insertTextOverImage(img,metaData.width,metaData.height);
    return {
        baseImage,
        metaData,
        insert,
        insertTextOverImageObj,
    }

    async function insert(config:InsertTextOverImageConfig){
        try{ 
          let imageResult=await insertTextOverImageObj.insert(config);
          return imageResult;
        }catch(e){
            throw e;
        }
        
    }
    
   }catch(e){
      throw e;
   }
   
}

