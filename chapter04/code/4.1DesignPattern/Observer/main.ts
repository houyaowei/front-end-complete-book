import Customer from "./CustomerModal";
import Observer from "./Observer";

let customer1 = new Customer(1101, "lihua", "shanxi", "12900000");
let os = new Observer();
os.register(customer1);
