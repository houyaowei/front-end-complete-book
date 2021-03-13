/**
 * 测试异步代码
 */

const { fetchData ,fetchDataWithAwait } = require("../utils/basic")

describe("ajax functions test cases", ()=> {
  test('should ', () => {
    
  })
  
  // test('should return data when fetchData request success', () => {
  //   //在当前的测试中至少有一个断言是被调用的，否则判定为失败
  //   // expect.assertions(1);

  //   fetchData().then(data => {
  //     expect(data).toEqual({
  //       "userId": 1,
  //       "id": 1,
  //       "title": "delectus aut autem",
  //       "completed": false
  //     })
  //     expect(data.completed).toBeFalsy();
  //   });
  // })

  // test("test fetchData function with async/await ", async ()=> {
  //   const res = await fetchData()
  //   expect(res.completed).toBeFalsy()
  // })
  // test("test fetchDataWithAwait function", async ()=> {
  //   const res = fetchDataWithAwait()
  //   expect(res.completed).toBeFalsy()
  // })
})