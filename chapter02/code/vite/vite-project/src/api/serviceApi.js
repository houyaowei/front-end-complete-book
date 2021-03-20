import URL from "./urlConfig";
import request from "./request";

export const login = (payload) => {
  const data = {
    username: payload.name,
    pwd: payload.password,
    equipmenttype: payload.equipmenttype,
  };
  return request({
    url: URL.login,
    method: "POST",
    data,
  });
};