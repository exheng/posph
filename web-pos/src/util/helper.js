import axios from "axios";
import { Config } from "./config";
import { setServerSatus } from "../store/server.store";
import { getAccessToken } from "../store/profile.store";

export const request = async (url ="", method ="get",data ={}) =>{
    var access_token = getAccessToken();
    var headers = { "Content-Type": "application/json"};
    if (data instanceof FormData) {
      headers = {"Content-Type": "multipart/form-data"}
    }
    return axios({ 
        url : Config.base_url + url,
        method : method,
        data : data,
        headers: {
          ...headers,
          Authorization: `Bearer ${access_token}`,
        },

    })
      .then ((res)=>{
        setServerSatus(200);
        return res.data;
      })
   
      .catch((err)=>{
        var response = err.response;
        if (response){
          var status = response.status;
          if (status =="401"){
            status = 403;
          }
          setServerSatus(status);
          console.error(`API Error: Status ${status}, URL: ${err.config.url}, Method: ${err.config.method}`, response.data);
          return { error: true, details: response.data };
        }
        else if(err.code =="ERR_NETWORK"){
          setServerSatus("error");
          console.error(`Network Error: URL: ${err.config.url}, Method: ${err.config.method}`, err.message);
          return { error: true, details: err.message };
        }
        console.log(">>>",err);
        return { error: true, details: "An unknown error occurred" };
      });
    
 };

export const getStoreLogoUrl = (logo) => {
    if (!logo) return null;
    return `http://localhost:8081/pos_img/${logo}`;
};