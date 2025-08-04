import axios from "axios";

// const baseURL = process.env.REACT_APP_BASE_URL;
const baseURL = process.env.REACT_APP_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true
});

const checkIfLogin = async (code) => {
    try {
        const response = await axiosInstance.post("/typingbliss/user/me", { code });
        return response.data;
    } catch (e) {
        throw new Error({"message": e.error});
    }
};

export { checkIfLogin };