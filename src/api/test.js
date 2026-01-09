import API from "./axios";

export const callProtected = async () => {
  const res = await API.post("/test");
  return res.data;
};
