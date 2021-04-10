/**
 * 测试异步代码,主要测试Promise
 */

const { fetchData ,fetchDataWithAwait } = require("../source/basic")

describe("ajax functions test cases", ()=> {
  // test('should return data when fetchData with request ', () => {
  //     return expect(fetchData()).resolves.toEqual({
  //       "userId": 1,
  //       "id": 1,
  //       "title": "delectus aut autem",
  //       "completed": false
  //   }) 
  // })
  // test('fetchData fails with an error', () => {
  //   expect.assertions(1);
  //   return expect(fetchData()).rejects.toMatch('error');
  // });
  // test('should return data when fetchData request success', () => {
  //   //是否调用了一点数量的断言
  //   expect.assertions(1);
  //   return fetchData().then(data => {
  //     expect(data).toEqual({
  //       "userId": 1,
  //       "id": 1,
  //       "title": "delectus aut autem",
  //       "completed": false
  //     })
  //     expect(data.completed).toBeFalsy();
  //   });
  // })

  test("test fetchData function with async/await ", async ()=> {
    const res = await fetchData()
    expect(res.completed).toBeFalsy()
  })
  // test("test fetchDataWithAwait function", async ()=> {
  //   const res = fetchDataWithAwait()
  //   expect(res.completed).toBeFalsy()
  // })
})