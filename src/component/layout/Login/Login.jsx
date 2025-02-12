import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import "../../../assets/css/Login.css";
import Logo from "../../../assets/image/hitecheng_logo_default.png";
import { Axios } from "../../../utils/axios/Axios";
import { Storage } from "../../../utils/Storage";

function Login() {
    const navigate = useNavigate();
    const [isSave, setIsSave] = useState(false);
    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");

    const handleCheckbox = (e) => {
        e.preventDefault();
        setIsSave(!isSave);
    }

    const handleUser = (e) => {
        e.preventDefault();
        setUserId(e.target.value);
    }

    const handlePwd = (e) => {
        e.preventDefault();
        setPwd(e.target.value);
    }

    const login = async(e) => {
        e.preventDefault();
        const user = {
            user_id: userId,
            user_pwd: pwd
        }
        const res = await Axios.POST("/login", user);

        if(res?.data?.result === "Success"){
            return navigate("/temp");
        }
    }

    useEffect(() => {
        if(Storage.getSession("login")){
            return navigate("/temp");
        }
    }, [])

    return (
        <div>
            <section className="w3l-login">
                <div className="overlay">
                    <div className="wrapper">
                        <div className="form-section">
                            <img src={Logo} alt="hitech_logo" />
                            <h6>현 장 근 태 관 리 시 스 템</h6>
                            <form className="signin-form">
                                <div className="form-input">
                                    <input onChange={handleUser} type="text" name="userId" placeholder="아이디" required="" />
                                </div>
                                <div className="form-input">
                                    <input onChange={handlePwd} type="password" name="password" placeholder="패스워드" required="" />
                                </div>
                                <div className="save-checkbox">
                                    <FormCheckInput checked={isSave} onChange={handleCheckbox}/> 아이디 저장
                                </div>
                                <button onClick={login} className="btn btn-primary theme-button mt-4">Log in</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Login;
