// import React, { use, useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import Adsidenav from '../Component/Adsidenav'
// import { useEffect } from 'react';
// import axios from 'axios'

// function Addoc() {
//     const navigate=useNavigate();
//     const[name,setName]=useState("")
//     const [email,setEmail]=useState("")
//     const [mobile,setMobile]=useState("")
//     const [password,setPassword]=useState("")
//     const [gender,setGender]=useState("")
//     const[qua,setQua]=useState("")
//     const[exp,setExp]=useState("")
//     const [spe,setSpe]=useState("")
//     const [address,setAddress]=useState("")

//     async function docreg(e) {
//       e.preventDefault();
//       const doc={name,email,"number":mobile,password,gender,qua,exp,spe,address};
//       const response=await axios.post('http://localhost:8000/api/doctor',doc);
//       if (response.data.msg=="success"){
//         window.alert("doctor added success");
//         setName("")
//         setEmail("")
//         setMobile("")
//         setPassword("")
//         setGender("")
//         setQua("")
//         setExp("")
//         setSpe("")
//         setAddress("")
//       }
//       else{
//         window.alert("something went wrong");
//         setPassword("")
//       }
//     }

//     function validation (){
//         const data = localStorage.getItem('admin');
//         if(data!="admin@gmail.com"){
//             navigate('/admin')
//         }
//     }
//     useEffect(()=>{
//         validation();
//     },[])

//   return (
//     <>
//     <div className="row" style={{height:"8vh" ,background:"lightgrey"}}>
//         <div className="col-4">
//             <h4>Admin Dashboard</h4>
//         </div>
//         <div className="col-2 pe-3 my-auto ms-auto text-end">
//             <button onClick={()=>{
//                 localStorage.removeItem("admin");
//                 validation();
//             }} className="btn btn-sm btn-outline-danger">Logout</button>
//         </div>
//     </div>

//     <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
//         <Adsidenav></Adsidenav>
//         <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
//             <h4 className='my-5 text-center'>Add Doctor</h4>
//             <div className="row my-4">
//               <div className="col-md-8 mx-auto p-5">
//                 <form onSubmit={docreg} className="form shadow-lg p-5 rounded-4">
//                   <h5>Add Doctor</h5>
//                   <br />
//                   <label htmlFor="" >Enter Name:</label>
//                   <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className='form-control rounded-pill px-4' />
//                   <br />
//                   <label htmlFor="">Enter Mobile:</label>
//                    <input type="number" value={mobile} onChange={(e)=>setMobile(e.target.value)} className='form-control rounded-pill px-4' />

//                    <br />
//                    <label htmlFor="">Enter Email:</label>
//                     <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}className='form-control rounded-pill px-4' />
//                     <br />
//                     <label htmlFor="">Enter Password:</label>
//                     <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className='form-control rounded-pill px-4' />
//                     <br />
//                     <label htmlFor="">Select Gender:</label>
//                     <select className='form-control rounded-pill px-4'>
//                       <option value="">--Select Gender--</option>
//                       <option value="">Male</option>
//                       <option value="">Female</option>
//                     </select>
//                     <br />
//                     <label htmlFor="">Qualification:</label>
//                     <input type="text" value={qua} onChange={(e)=>setQua(e.target.value)} className='form-control rounded-pill px-3'/>
//                     <br />
//                     <label htmlFor="">Experience:</label>
//                     <input type="text" value={exp} onChange={(e)=>setExp(e.target.value)} className='form-control rounded-pill px-3'/>
//                     <br />
//                     <label htmlFor="">Speciality:</label>
//                     <input type="text" value={spe} onChange={(e)=>setSpe(e.target.value)} className='form-control rounded-pill px-3'/>
//                     <br />
//                     <label htmlFor="">Address:</label>
//                     <textarea className='form-control rounded-pill px-3'/>
//                     <br />
//                     <input type="submit" value="Add Doctor" className="form-control btn btn-primary" />
//                 </form>
//               </div>
//             </div>
//         </div>
//     </div>
//     </>
//   )
// }

// export default Addoc



import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Adsidenav from '../Component/Adsidenav'
import axios from 'axios'

function Addoc() {
    const navigate = useNavigate();
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [password, setPassword] = useState("")
    const [gender, setGender] = useState("")
    const [qua, setQua] = useState("")
    const [exp, setExp] = useState("")
    const [spe, setSpe] = useState("")
    const [address, setAddress] = useState("")

    async function docreg(e) {
        e.preventDefault();
        const doc = { name, email, number: mobile, password, gender, qua, exp, spe, address }
        const response = await axios.post('http://localhost:8000/api/doctor', doc)
        if (response.data.msg === "success") {
            window.alert("doctor added success");
            setName("")
            setEmail("")
            setMobile("")
            setPassword("")
            setGender("")
            setQua("")
            setExp("")
            setSpe("")
            setAddress("")
        } else {
            window.alert("something went wrong");
            setPassword("")
        }
    }

    function validation() {
        const data = localStorage.getItem('admin');
        if (data !== "admin@gmail.com") {
            navigate('/admin')
        }
    }
    useEffect(() => {
        validation();
    }, [])

    return (
        <>
            <div className="row" style={{ height: "8vh", background: "lightgrey" }}>
                <div className="col-4">
                    <h4>Admin Dashboard</h4>
                </div>
                <div className="col-2 pe-3 my-auto ms-auto text-end">
                    <button onClick={() => {
                        localStorage.removeItem("admin");
                        validation();
                    }} className="btn btn-sm btn-outline-danger">Logout</button>
                </div>
            </div>

            <div className="row p-4" style={{ height: "92vh", background: "grey" }}>
                <Adsidenav />
                <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{ overflow: "auto" }}>
                    <h4 className='my-5 text-center'>Add Doctor</h4>
                    <div className="row my-4">
                        <div className="col-md-8 mx-auto p-5">
                            <form onSubmit={docreg} className="form shadow-lg p-5 rounded-4">
                                <h5>Add Doctor</h5>
                                <br />
                                <label>Enter Name:</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='form-control rounded-pill px-4' />
                                <br />
                                <label>Enter Mobile:</label>
                                <input type="number" value={mobile} onChange={(e) => setMobile(e.target.value)} className='form-control rounded-pill px-4' />
                                <br />
                                <label>Enter Email:</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='form-control rounded-pill px-4' />
                                <br />
                                <label>Enter Password:</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className='form-control rounded-pill px-4' />
                                <br />
                                <label>Select Gender:</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className='form-control rounded-pill px-4'>
                                    <option value="">--Select Gender--</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <br />
                                <label>Qualification:</label>
                                <input type="text" value={qua} onChange={(e) => setQua(e.target.value)} className='form-control rounded-pill px-3' />
                                <br />
                                <label>Experience:</label>
                                <input type="text" value={exp} onChange={(e) => setExp(e.target.value)} className='form-control rounded-pill px-3' />
                                <br />
                                <label>Speciality:</label>
                                <input type="text" value={spe} onChange={(e) => setSpe(e.target.value)} className='form-control rounded-pill px-3' />
                                <br />
                                <label>Address:</label>
                                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className='form-control rounded-pill px-3' />
                                <br />
                                <input type="submit" value="Add Doctor" className="form-control btn btn-primary" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Addoc




