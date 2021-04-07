/**
 * 函数测试
 */
const axios = require("axios")
const { getApplist} = require("../source/funcList")
jest.mock('axios');

describe("function test cases", ()=> { 
  expect.assertions(1); 
  test('getApplist  should return value ', async ()=> {
    const apps = [{
      appId: '1',
      appName: 'android'
    },{
      appId: '2',
      appName: 'ios'
    }]
    //模拟返回数据
    const resData = {
      status: 0,
      data: apps
    }
    axios.get.mockResolvedValue(resData);
    const data = await getApplist();
    // getApplist().then(data => {
    //   expect(data).toEqual(apps)
    // })
    expect(data).toEqual(apps)
  })
  
})