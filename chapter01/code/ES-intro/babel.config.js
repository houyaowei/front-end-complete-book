module.exports = function (api) {
  api.cache(true);

  const presets = [ ["@babel/preset-env", {
    "useBuiltIns": "usage",
    "corejs": {
      "version": "3.8",
      "proposals": true
      } 
    }
   ]
  ];
  const plugins = [];

  return {presets, plugins};
}