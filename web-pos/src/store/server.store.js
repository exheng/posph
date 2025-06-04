export const setServerSatus = (status) => {
    localStorage.setItem("server_status", status);
};

export const getServerSatus = () => {
    return localStorage.getItem("server_status");
};