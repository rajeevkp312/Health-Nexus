import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Dsidenav from '../../Component/Dsidenav';
import axios from 'axios';

function Dappointment() {
    const navigate=useNavigate();
    const[appointment,setAppointment]=useState([]);

     async function getapp() {

        console.log("Doctor ID used:", localStorage.getItem("doctor"));

        const response=await axios.get(`http://localhost:8000/api/app/d/${localStorage.getItem("doctor")}`);
        if(response.data.msg=="Success"){
            const alldata=response.data.value;
             const newdata=alldata.filter((d)=>{
                return d.status=="pending";
             })
             setAppointment(newdata);
        }
        
    }

    async function cancelapp(id) {
        const response=await axios.put(`http://localhost:8000/api/app/${id}`,{"status":"cancelled"})
        if(response.data.msg=="Success"){
            window.alert("Appointment Cancelled");
        }
        else{
            window.alert("Something went wrong");
        }
    }

    async function acceptapp(id) {
        const response=await axios.put(`http://localhost:8000/api/app/${id}`,{"status":"confirmed"})
        if(response.data.msg=="Success"){
            window.alert("Appointment Accepted");
        }
        else{
            window.alert("Something went wrong");
        }
    }
    function validation (){
        const data = localStorage.getItem('doctor');
        if(data==null){
            navigate('/login')
        }
    }

    useEffect(()=>{
        validation();
        getapp();
    },[])

    useEffect(() => {
  console.log("Appointments:", appointment);
}, [appointment]);

  return (
    <>
    <div className="row" style={{height:"8vh" ,background:"lightgrey"}}>
        <div className="col-4">
            <h4>Doctor Dashboard</h4>
        </div>
        <div className="col-2 pe-3 my-auto ms-auto text-end">
            <button onClick={()=>{
                localStorage.removeItem("doctor");
                validation();
            }} className="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    </div>

    <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
        <Dsidenav/>
        <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
            <h4 className='my-5 text-center'>Pending Appointments</h4>

            
            <div className="row ">
            <div className="col-md-8 p-5 rounded shadow-lg mx-auto table-responsive">
                <table className='table table-dark'>
                 <thead>
                        <tr>
                            <th>S.no</th>
                            <th>Patient Name</th>
                            <th>Slot</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Status</th>
<th colSpan={2}>Action</th>
{/* <th>Add</th>
<th>Remove</th> */}
                        </tr>
                    </thead>


                <tbody>
  {appointment.map((app,i) => (
    <tr key={app._id}>
      <td>{i + 1}</td>
      <td>{app.pid.name}</td>
      <td>{app.slot}</td>
      <td>{app.date}</td>
      <td>{app.description}</td>
      <td>{app.status}</td>
      <td><button onClick={()=>{
        acceptapp(app._id);
      }} className='btn btn-danger btn-sm'>Accept</button></td>
      <td><button onClick={()=>{
        cancelapp(app._id);
      }} className='btn btn-danger btn-sm'>Cancel</button></td>
    </tr>
  ))}
</tbody>


                </table>
            </div>
            </div>

        </div>
    </div>
    </>
  )
}

export default Dappointment;