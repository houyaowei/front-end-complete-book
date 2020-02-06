import Seller from "./Seller";
import Customer from "./CustomerModal";

class Observer {
  private seller: Seller;

  register(customer: Customer): void {
    this.seller.register(customer);
  }
  fire(): void {
    this.seller.notifyAll();
  }
  remove(customerId: number): void {
    this.seller.
  }
}
