export var msg = "msg from moduleA";

var obj = {
  name: "hyw",
  age: 23
};

export { obj as person };

export default name = "module-A";

if (true) {
  import("./moduleB.js").then(res => {
    console.log(res.obj.name + ", module name:" + res.default);
  });
}

Promise.all([import("./moduleB.js"), import("./moduleC.js")]).then(
  ([moduleB, moduleC]) => {
    console.log(
      moduleB.obj.name +
        ", module name:" +
        moduleB.default +
        ", another module is :" +
        moduleC.default
    );
  }
);
