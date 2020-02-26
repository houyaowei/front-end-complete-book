import ShapeDecorator from "./ShapeDecorator";

/**
 *
 */

export default class GreenShapeDecorator extends ShapeDecorator {
  public draw(): void {
    super.draw();
    this.setBorder();
  }
  private setBorder(): void {
    console.log("set border in GreenShapeDecorator");
  }
}
