import Customer from "./CustomerModal";
import Observer from "./Observer";

let customer1 = new Customer(1101, "caozn", "shanxi", "12900000");
let os = new Observer();
os.register(customer1);
let customer2 = new Customer(1102, "houyw", "henan", "12900001");
os.register(customer2);

console.log("现在商家有", os.getAllCustomers().length, "个客户订阅");
os.fire();
