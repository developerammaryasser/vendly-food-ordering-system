const API_URL = "http://localhost:5000/api";
export const UPLOAD_URL = "http://localhost:5000/uploads/";
export const client = async (url, body, method = "GET") => {
  const options = {
    method,
    headers: {},
  };
  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      options.headers["Content-Type"] = "application/json";
    }
  }
  const token = localStorage.getItem("token");
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(API_URL + url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
};
