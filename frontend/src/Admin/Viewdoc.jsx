// import React from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import Adsidenav from '../Component/Adsidenav'
// import { useEffect } from 'react';
// import { useState } from 'react';

// function Viewdoc() {
//     const [doc,setDoc]=useState([]);
//     const getdoc=async()=>{
//         const response=await axios.get('http//:localhost:8000/')
//     }
//     const navigate=useNavigate();
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
//             <h4 className='my-5 text-center'>View Doctor</h4>

//             <div className="row">
//                 <div className="col-md-8 p-5 rounded shadow-lg mx-auto table-responsive">
//                     <table className='table table-dark'>
//                         <thead>
//                             <tr>
//                                 <th>Sno.</th>
//                                 <th>Name</th>
//                                 <th>Email</th>
//                                 <th>Mobile</th>
//                                 <th>Qualification</th>
//                                 <th>Experience</th>
//                                 <th>Speciality</th>
//                                 <th colSpan={2}>Action</th>
//                             </tr>
//                         </thead>
//                     </table>
//                 </div>
//             </div>

//         </div>
//     </div>
//     </>
//   )
// }

// export default Viewdoc




import React, { useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function ViewDoctor() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);

    async function fetchDoctors() {
        const response = await axios.get('http://localhost:8000/api/doctor');
        setDoctors(response.data.value);
    }

    async function delDoctor(id) {
        const response = await axios.delete(`http://localhost:8000/api/doctor/${id}`);
        if (response.data.msg === "Success") {
            window.alert("Deleted");
            fetchDoctors();
        } else {
            window.alert("Something went wrong");
            fetchDoctors();
        }
    }

    function editDoctor(id) {
        localStorage.setItem('edit', id);
        navigate('/editdoc');
    }

    useEffect(() => {
        fetchDoctors();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-10 mx-auto p-5 my-5 bg-light shadow-lg rounded-4">
                    <h4>View Doctors</h4>
                    <table className="table table-dark">
                        <thead>
                            <tr>
                                <th>S No.</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Gender</th>
                                <th>Qualification</th>
                                <th>Experience</th>
                                <th>Speciality</th>
                                <th>Address</th>
                                <th colSpan={2}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doc, i) => (
                                <tr key={doc._id}>
                                    <td>{i + 1}</td>
                                    <td>{doc.name}</td>
                                    <td>{doc.number}</td>
                                    <td>{doc.email}</td>
                                    <td>{doc.gender}</td>
                                    <td>{doc.qua}</td>
                                    <td>{doc.exp}</td>
                                    <td>{doc.spe}</td>
                                    <td>{doc.address}</td>
                                    <td>
                                        <button
                                            onClick={() => delDoctor(doc._id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => editDoctor(doc._id)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default ViewDoctor;
