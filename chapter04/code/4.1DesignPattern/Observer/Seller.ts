/**
 * @Date 2020-2-5
 * @author houyw
 */

import Customer from "./CustomerModal";

export default class Seller {
  customers: Customer[];
  constructor() {
    this.customers = new Array<Customer>();
  }
  register(customer): void {
    this.customers.push(customer);
  }
  remove(id: number): void {
    this.customers.forEach(c => {
      if (c.getId() === id) {
        console.log(`this id: ${id} should be removed`);
      }
    });
  }

  notifyAll(): void {
    this.customers.forEach(cus => {
      cus.dealOrder();
    });
  }
}
