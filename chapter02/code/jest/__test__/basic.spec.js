/**
 * 基本用例测试 
 */
const { sum } = require("../utils/basic")

describe("basic test", ()=> {
  beforeEach(()=> {
    console.log("before each")
  })
  
  afterEach(()=> {
    console.log("after each")
  })
  
  test('adds 1 + 2 to equal 3', () => {
    const total = sum(1,2)
    expect(total).toBe(3);
  });
  
})
