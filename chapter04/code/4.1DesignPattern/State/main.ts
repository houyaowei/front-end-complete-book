/**
 * 主文件
 **/

import Context from "./Context";
import SlightLight from "./SlightLightClass";
import CloseLight from "./CloseClass";

const context = new Context(new SlightLight());
// const context = new Context(new CloseLight());
context.setSlighLight();
context.setHightLight();
context.close();
