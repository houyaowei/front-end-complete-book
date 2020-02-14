import Seller from "./Seller";
import Customer from "./CustomerModal";

export default class Observer {
  private seller: Seller;

  register(customer: Customer): void {
    console.log("");
    this.seller.register(customer);
  }
  fire(): void {
    this.seller.notifyAll();
  }
  remove(customerId: number): void {
    this.seller.
  }
}
