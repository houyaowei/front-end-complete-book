

import Customer from "./CustomerModal";

class Seller {
  customers: Customer[];

  register(customer):void {
    this.customers.push(customer);
  }

  remove(id: number):void {
    
  }

}