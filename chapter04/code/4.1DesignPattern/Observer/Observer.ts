/**
 * @Date 2020-2-5
 * @author houyw
 */
import Seller from "./Seller";
import Customer from "./CustomerModal";

export default class Observer {
  constructor() {
    this.seller = new Seller();
  }
  private seller: Seller;

  register(customer: Customer): void {
    console.log("");
    this.seller.register(customer);
  }
  notifyAll(): void {
    this.seller.notifyAll();
  }
  getAllCustomers(): Customer[] {
    return this.seller.customers;
  }
  remove(customerId: number): void {
    this.seller.remove(customerId);
  }
}
