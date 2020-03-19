module.exports = function(num) {
  if (typeof num != "number") {
    return 0;
  } else {
    return num * num;
  }
};
