/**
 * @Date 2019-12-21
 * @author houyw
 */

export default class Order {
  id: string;
  description: string;
  date: number;
  price: number;

  constructor(_id:string, _description:string, _price:number){
    this.id = _id;
    this.description = _description;
    this.price = _price;
    this.date = new Date().getTime();
  }
}