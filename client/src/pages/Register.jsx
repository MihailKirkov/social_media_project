import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios'
import './login_register.scss';

const Register = () => {
    const [inputs, setInputs] = useState({
        username:"",
        email:"",
        first_name:"",
        last_name:"",
        password:"",
    });
    const [err, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = e => {
        setInputs(prev=>({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async e => { // async because we are making an api request
        e.preventDefault();
        try {
            await axios.post("http://localhost:8800/api/auth/register", inputs);
            navigate("/login");
        }
        catch(err) {
            setError(err.response.data);
        }
    }

    return (
        <div className='auth'>
            <h1>Register</h1>
            <form>
                <input required type="text" placeholder='username' name='username' onChange={handleChange}/>
                <input required type="email" placeholder='email' name='email' onChange={handleChange}/>
                <input required type="first_name" placeholder='first_name' name='first_name' onChange={handleChange}/>
                <input required type="last_name" placeholder='last_name' name='last_name' onChange={handleChange}/>
                <input required type="password" placeholder='password' name='password' onChange={handleChange}/>
                <button onClick={handleSubmit}>Register</button>
                {err && <p>{err}</p>}
                <span>Already have an account? <Link to="/login" style={{color:'var(--green)'}}>Sign In Now</Link></span>
            </form>
        </div>
    )
}

export default Register