// set api url to "http://virtual.fn11.bmstu.ru:3006" for production and "http://127.0.0.1:8000" otherwise

// export const api_url = process.env.NODE_ENV === "production" ? "http://virtual.fn11.bmstu.ru:3006" : "http://127.0.0.1:8000";
export const api_url = process.env.NODE_ENV === "production" ? "http://localhost:8080" : "http://127.0.0.1:8000";

console.log(process.env.NODE_ENV, process.env.API_URL, api_url)
console.log(process.env)
