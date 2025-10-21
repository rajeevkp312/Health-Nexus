import React from 'react'
import { useState } from 'react'
import axios from 'axios';

function Reg() {
    const [name,setName]=useState("")
    const [number,setNumber]=useState("")
    const [altnumber,setAltnumber]=useState("")
    const [gender,setGender]=useState("")
    const [age,setAge]=useState("")
    const [bloodgrp,setBloodgrp]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [address,setAddress]=useState("")

// async function regcode(e) {
//     e.preventDefault();
//     const patient={name,email,number,password,altnumber,age,gender,bloodgrp,address}
//     const response=await axios.post('http://localhost:8000/api/patient',patient);

//      if (response.data.msg == "Success") {
//             window.alert("Registration success");
//             setName("")
//             setEmail("")
//             setPassword("")
//             setNumber("")
//             setAltnumber("")
//             setGender("")
//             setAge("")
//             setGender("")
//             setBloodgrp("")
//             setAddress("")
//         } else {
//             window.alert("something went wrong");
//             setPassword("")
//         }
    
// }
async function regcode(e) {
  e.preventDefault();
  const patient = {name, email, number, password, altnumber, age, gender, bloodgrp, address};

  try {
    const response = await axios.post('http://localhost:8000/api/patient', patient);

    if (response.data.msg === "Success") {
      window.alert("Registration success");
      setName("");
      setEmail("");
      setPassword("");
      setNumber("");
      setAltnumber("");
      setGender("");
      setAge("");
      setBloodgrp("");
      setAddress("");
    } else {
      window.alert("Something went wrong: " + response.data.msg);
      setPassword("");
    }
  } catch(error) {
    window.alert("Error occurred: " + error.message);
    setPassword("");
  }
}


  return (
     <div className="row">
        <div className="col-md-8 mx-auto p-5 my-5">
            <form onSubmit={regcode} className='p-5 rounded-4 shadow-lg w-75 mx-auto'>
                <h4>Patient Registration Form</h4>
                <br />
                <label htmlFor="">Enter Name:</label>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Number:</label>
                <input type="number" value={number} onChange={(e)=>setNumber(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Alternate Number:</label>
                <input type="number" value={altnumber} onChange={(e)=>setAltnumber(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Email:</label>
                <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" />
                <br />
                <label htmlFor="">Enter Password:</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" />
                <br />

                <label htmlFor="">Enter Age:</label>
                <input type="text" value={age} onChange={(e)=>setAge(e.target.value)} className="form-control" />
                <br />

                <label>Select Gender:</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className='form-control rounded-pill px-4'>
                                    <option value="">--Select Gender--</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="LGBTQ">LGBTQ</option>    
                                </select>
                <br />
                

                <label>Select Blood Group:</label>
                                <select value={bloodgrp} onChange={(e) => setBloodgrp(e.target.value)} className='form-control rounded-pill px-4'>
                                    <option value="">--Select Group--</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>

                <br />
                <label>Address:</label>
                                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className='form-control rounded-pill px-3' />
                                <br />                
                <input type="submit" value="Register" className='btn btn-primary form-control'/>
            </form>
        </div>
    </div>
  )
}

export default Reg