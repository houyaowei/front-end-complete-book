/**
 * 测试方法
 */
import Context from "./Context";
import StrategyA from "./StrategyAImpl";
import StrategyB from "./StrategyBImpl";

// const context = new Context(new StrategyA());
// context.executeStrategy();

const context = new Context(new StrategyB());
context.executeStrategy();
