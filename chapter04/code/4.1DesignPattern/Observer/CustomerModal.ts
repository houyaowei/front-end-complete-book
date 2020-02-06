/**
 * @Date 2019-12-21
 * @Author houyw
 */
import Order from "./OrderModal";

export default class Customer {
  private id: number;
  private name: string;
  private address: string;
  private telNum: string;
  private orders: Order[];

  constructor(_id: number, _name: string, _address: string, _telNum: string) {
    this.id = _id;
    this.name = _name;
    this.address = _address;
    this.telNum = _telNum;
  }
  getId(): number {
    return this.id;
  }
  dealOrder(): void {
    //make a order
    console.log(`I am  + ${this.name} I have got message from seller`);
  }
}
