/**
 * 基本用例测试 
 */
const { sum ,testException} = require("../source/basic")

describe("basic test", ()=> {
  // beforeEach(()=> {
  //   console.log("before each")
  // })
  
  // afterEach(()=> {
  //   console.log("after each")
  // })
  
  test('adds 1 + 3 to equal 4', () => {
    const total = sum(1,3)
    expect(total).toBe(4);
    expect(total).toBeGreaterThan(3);
    expect(total).toBeGreaterThanOrEqual(3.5);
    expect(total).toBeLessThan(5);
    expect(total).toBeLessThanOrEqual(4.5);
  });

  test('object assignment', () => {
    const data = {name: "hyw"};
    data['age'] = 24;
    expect(data).toEqual({name: "hyw", age: 24});
  });

  // test('null test cases', () => {
  //   const n = null;
  //   expect(n).toBeNull();
  //   expect(n).toBeDefined();
  //   expect(n).not.toBeUndefined();
  //   expect(n).not.toBeTruthy();
  //   expect(n).toBeFalsy();
  // });

  // test('string matches ', () => {
  //   expect('Christoph').toMatch(/stop/);
  // })

  // const shoppingList = [
  //   'apple',
  //   'orange',
  //   'fish',
  //   'biscuit',
  //   'milk'
  // ];
  // test('the shopping list has apple on it', () => {
  //   expect(shoppingList).toContain('apple');
  // }); 

  // test('test exception', () => {
  //   expect(testException).toThrow('no cookies');
  // })
  
})
