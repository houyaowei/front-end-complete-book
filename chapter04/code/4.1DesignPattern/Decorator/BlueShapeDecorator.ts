import ShapeDecorator from "./ShapeDecorator";

/**
 *
 */
export default class BlueShapeDecorator extends ShapeDecorator {
  public draw(): void {
    super.draw();
    this.setBGImage();
  }
  public setBGImage(): void {
    console.log("set background Image im BlueShapeDecorator");
  }
}
