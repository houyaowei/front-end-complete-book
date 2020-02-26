import Shape from "./Shape";

/**
 * 装饰抽象类
 */
export default class ShapeDecorator implements Shape {
  protected shape: Shape;
  constructor(s: Shape) {
    this.shape = s;
  }
  /**
   * draw
   */
  public draw() {
    this.shape.draw();
  }
}
