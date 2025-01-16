import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AxiosInstance = (params, options) => {
    const instance = axios.create({
        baseURL : BASE_URL
        , ...options
    })
    return instance;
}
  
export default AxiosInstance;