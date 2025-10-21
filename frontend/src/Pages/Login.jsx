import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
var [email,setEmail]=useState("")
var [password,setPassword]=useState("")
var [role,setRole]=useState("")
const navigate=useNavigate();

// async function adlog (e) {
//   e.preventDefault();
//   const admin={email,password};
//   const response=await axios.post('http://localhost:8000/api/admin/log',admin);
{{ ... }}
//   }

// }


async function adlog(e) {
  e.preventDefault();
  const user = { email, password ,role};
  console.log(user);;

  // Clear any admin impersonation leakage before normal login
  try {
    if (localStorage.getItem('token') === 'admin-impersonation') {
      localStorage.removeItem('token');
    }
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('impersonateRole');
    localStorage.removeItem('impersonateBy');
    localStorage.removeItem('admin');
  } catch {}
    window.alert("please select role")
  }
}

  return (

    <div className="row">
        <div className="col-md-8 mx-auto p-5 my-5">
            <form onSubmit={adlog} className='p-5 rounded-4 shadow-lg w-75 mx-auto'>
                <h4>Login</h4>
                <br />
                <label htmlFor="">Enter Email:</label>
                <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Password:</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" />
                <br />

                <label htmlFor="">Select Role</label>
                <select value={role} onChange={(e)=>setRole(e.target.value)} className="form-control">
                    <option value="">--Select Role--</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                </select>
                <input type="submit" value="Login" className='btn btn-primary form-control'/>
            </form>
        </div>
    </div>
  )
}

export default Login