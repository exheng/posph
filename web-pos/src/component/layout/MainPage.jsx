import { Button, message, Result, Spin } from "antd";
import React from "react";
import { getServerSatus } from "../../store/server.store";

const info ={
    404 :{
        message :"404-Route Not Found",
        sub : "404-Route Not Found. Please confirm route again.",
    },
    403 :{
        message :"403-Authorized",
        sub : "Sorry you are not authorized to access    this page.",
    },
    500 :{
        message :"500-Internal Error Server",
        sub : "Please contact adminstrator",
    },
    error :{
        message :"Can not connect to server",
        sub : "Please contact adminstrator",
    },
}

export default function MainPage({ children, loading}) {
    var server_status = getServerSatus() || "200";
    const isServerError = ["403", "404", "500", "error"].includes(server_status.toString());

if (isServerError) {
    return ( 
        <Result 
            status={server_status + ""} 
            title={info[server_status].message} 
            subTitle={info[server_status].sub}
            extra={<Button type="primary" onClick={() => window.location.href = "/"}>Back Home</Button>}
        />
    )
}
    return(
        <div>
            <Spin spinning={loading}>
            {children}
            </Spin>
        </div>
    );
};