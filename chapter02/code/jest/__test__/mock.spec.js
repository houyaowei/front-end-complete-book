/**
 * function mock
 */

 function forEach(arr, callback) {
  for (let index = 0,iLen=arr.length; index < iLen; index++) {
    callback(arr[index]);
  }
}

describe("mock function test",()=> {
  test('jest.fn should be invoked ', () => {
      let mockFn = jest.fn();
      let result = mockFn('houyw', 2, false);
      // 断言mockFn的执行后返回undefined
      expect(result).toBeUndefined();
      // 断言mockFn被调用
      expect(mockFn).toBeCalled();
      // 断言mockFn被调用了一次
      expect(mockFn).toBeCalledTimes(1);
      // 断言mockFn传入的参数为1, 2, 3
      expect(mockFn).toHaveBeenCalledWith('houyw', 2, false);
  })
  test('test jest.fn with default value', () => {
    let mockFn = jest.fn().mockReturnValue('houyw');
    // 断言mockFn执行后返回值为default
    expect(mockFn()).toBe('houyw');
  })
  test('test jest.fn with implement', () => {
    let mockFn = jest.fn((num1, num2) => {
      return num1 / num2;
    })
    // 断言mockFn执行后返回100
    expect(mockFn(10, 10)).toBe(1);
  })
  test('mock calls test cases ', () => {
      const mockCallback = jest.fn();
      forEach([0, 1], mockCallback);

      //调用两次
      expect(mockCallback.mock.calls.length).toBe(2);
      // 第一次调用函数时的第一个参数是 0
      expect(mockCallback.mock.calls[0][0]).toBe(0);
  })
  test('mock Object', () => {
      const myMock = jest.fn();
      const a = new myMock();
      const b = {};
      const bound = myMock.bind(b);
      bound();
      
      console.log(myMock.mock.instances);
  })
  
})
