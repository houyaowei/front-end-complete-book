
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

  constructor(_id:number,_name:string,_address:string, _telNum:string){
    this.id = _id;
    this.name = _name;
    this.address = _address;
    this.telNum = _telNum;
  }

  dealOrder():void {
    //make a order
    let order1 = new Order("20191221001","macbook pro is coming",21199);
    this.orders.push(order1);
  }
}