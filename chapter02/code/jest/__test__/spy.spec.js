const utils = require("../source/mockUtil")
test("calls math.add", () => {
    // obj, func
    const getNameMock = jest.spyOn(utils, "getName");

    // override the implementation
    getNameMock.mockImplementation(() => "mock");
    expect(getNameMock ()).toEqual("mock");
  
    // restore the original implementation
    getNameMock.mockRestore();
    expect(getNameMock()).toBeUndefined()
  });