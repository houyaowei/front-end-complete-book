import ShapeDecorator from "./ShapeDecorator";

/**
 *
 */
export default class BlueShapeDecorator extends ShapeDecorator {
  public draw(): void {
    super.draw();
    this.setBGImage();
  }
  private setBGImage(): void {
    console.log("set background Image im BlueShapeDecorator");
  }
}
