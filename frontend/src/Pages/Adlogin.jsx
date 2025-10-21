import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Adlogin() {
var [email,setEmail]=useState("")
var [password,setPassword]=useState("")
const navigate=useNavigate();

// async function adlog (e) {
//   e.preventDefault();
//   const admin={email,password};
//   const response=await axios.post('http://localhost:8000/api/admin/log',admin);
//   console.log(response);

//   if (response.data.msg=="Success"){
//     localStorage.setItem("admin","admin@gmail.com");
//     setEmail("");
//     setPassword("");
//     navigate('/');
//   }
//   else{
//     window.alert("something wrong 😖");
//     setPassword("");
//   }

// }


async function adlog(e) {
  e.preventDefault();
  const admin = { email, password };
  try {
    const response = await axios.post('http://localhost:8000/api/admin/log', admin);
    console.log(response);

    if (response.data.msg === "Success") {
      localStorage.setItem("admin", "admin@gmail.com");
      setEmail("");
      setPassword("");
      navigate('/admindash');
    } else if (response.data.msg === "not found") {
      window.alert("Admin not found 😖");
      setPassword("");
    } else if (response.data.msg === "Something went wrong😥") {
      window.alert("Invalid password 😖");
      setPassword("");
    } else {
      window.alert("Something wrong 😖: " + response.data.msg);
      setPassword("");
    }
  } catch (error) {
    console.error("Login error:", error);
    window.alert("Network or server error 😖");
    setPassword("");
  }
}

  return (

    <div className="row">
        <div className="col-md-8 mx-auto p-5 my-5">
            <form onSubmit={adlog} className='p-5 rounded-4 shadow-lg w-75 mx-auto'>
                <h4>Admin login </h4>
                <br />
                <label htmlFor="">Enter Email:</label>
                <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Password:</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" />
                <br />
                <input type="submit" value="Login" className='btn btn-primary form-control'/>
            </form>
        </div>
    </div>
  )
}

export default Adlogin