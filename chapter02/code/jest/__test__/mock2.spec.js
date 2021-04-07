
jest.mock("../source/mockUtil.js")

const { getName } = require("../source/mockUtil")

describe("mock functions continued",()=> {
  test('add function test case ', () => {
    // getName.mockResolvedValue({name: "123"}) //如果是promise函数就用这个
    getName.mockReturnValueOnce({name: "123"})
    expect(getName()).toEqual({name: "123"})
  })
  
})