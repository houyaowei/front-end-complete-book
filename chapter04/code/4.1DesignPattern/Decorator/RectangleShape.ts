/**
 *
 */
import Shape from "./Shape";

export default class RectangleShape implements Shape {
  public draw(): void {
    console.log("the drow method in class RectangleShape");
  }
}
