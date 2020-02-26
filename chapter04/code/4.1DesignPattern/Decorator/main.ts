import Shape from "./Shape";
import CircleShape from "./CircleShape";
import BlueShapeDecorator from "./BlueShapeDecorator";
import RectangleShape from "./RectangleShape";
import GreenShapeDecorator from "./GreenShapeDecorator";

let shape: Shape = new CircleShape();
let shape2: Shape = new RectangleShape();

const decorator1 = new BlueShapeDecorator(shape);
const decorator2 = new GreenShapeDecorator(shape2);

decorator1.draw();
console.log("---------------------");
decorator2.draw();
