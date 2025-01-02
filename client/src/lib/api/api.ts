// import history from "../history";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

const mainUrl = import.meta.env.VITE_APP_API_URL;

interface User {
  token: string;
}

type RequestType =
  | "post"
  | "get"
  | "patch"
  | "delete"
  | "postWithoutToken"
  | "postFile";

export const api = async (
  endpoint: string,
  data: object = {},
  type: RequestType
): Promise<any> => {
  const user: User | null = JSON.parse(
    localStorage.getItem("_session") || "null"
  );
  const token = user ? user.token : "";
  const url = mainUrl + endpoint;

  const config: AxiosRequestConfig = {
    method: type === "postWithoutToken" || type === "postFile" ? "post" : type,
    url,
    data,
    headers: {
      ...(type === "postFile"
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" }),
      ...(type !== "postWithoutToken" && { "x-auth": token }),
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if ([400, 422, 500].includes(error.response.status)) {
          return Promise.reject(error.response.data);
        } else if ([401, 403, 503].includes(error.response.status)) {
          localStorage.removeItem("_session");
          if (typeof window !== "undefined") {
            history.push("/");
          }
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject({
            error: "Something went wrong. Please try again.",
          });
        }
      } else {
        return Promise.reject({
          error: "Network error. Please check your internet connection.",
        });
      }
    } else {
      return Promise.reject({
        error: "An unexpected error occurred.",
      });
    }
  }
};

export const checkData = (data: any): boolean => {
  return true; // You can customize this function as needed
};
