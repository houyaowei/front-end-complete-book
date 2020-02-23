/**
 * 主文件
 **/

import Context from "./Context";
import SlightLight from "./SlighLightClass";

const context = new Context(new SlightLight());
context.setSlighLight();
context.setHightLight();
context.close();
