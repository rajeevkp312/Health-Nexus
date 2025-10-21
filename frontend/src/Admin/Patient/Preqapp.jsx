import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Psidenav from '../../Component/Psidenav';
import axios from 'axios';

function Preqapp() {
    const [doctors,setDoctors]=useState("");
    const [spe,setSpe]=useState("");
    const [fdoc,setFdoc]=useState([]);
    const navigate=useNavigate();
    const [did,setDid]=useState("");
    const [pid,setPid]=useState("");
    const [date,setDate]=useState("");
    const [slot,setSlot]=useState("");
    const [description,setDescription]=useState("");

    async function reqapp(e){
        e.preventDefault();
        const data={pid,did,date,slot,description}
        const response=await axios.post('http://localhost:8000/api/app',data)
        if(response.data.msg=="Success"){
            window.alert("appointment req send")
            setSpe("")
            setDid("")
            setDate("")
            setSlot("")
            setDescription("")

        }
        else{
            window.alert("something wrong")
            setDate("")
            setSlot("")
            setDescription("")
        }
    }

    async function getdoc() {
        const response=await axios.get('http://localhost:8000/api/doctor')
        if(response.data.msg=="Success"){
            setDoctors(response.data.value)
            setFdoc(response.data.value)
        }
    }


    function filterdoc(e){
        setSpe(e.target.value)
        console.log(e.target.value)
       const doc= doctors.filter((d)=>
            d.spe==e.target.value
        )
        setFdoc(doc)
    }

    function validation (){
        const data = localStorage.getItem('patient');
        if(data==null){
            navigate('/login')
        }
        else{
            setPid(data);
        }
    }
    useEffect(()=>{
        validation();
        getdoc();
    },[])

  return (
    <>
    <div  className="row" style={{height:"8vh" ,background:"lightgrey"}}>
        <div className="col-4">
            <h4>Patient Dashboard</h4>
        </div>
        <div className="col-2 pe-3 my-auto ms-auto text-end">
            <button onClick={()=>{
                localStorage.removeItem("patient");
                validation();
            }} className="btn btn-sm btn-outline-danger">Logout</button>
        </div>
    </div>

    <div className="row p-4" style={{height:"92vh" ,background:"grey"}}>
        <Psidenav></Psidenav>
        <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{overflow:"auto"}}>
            <h4 className='my-5 text-center'>Request Appointment</h4>


              <div className="row my-4">
              <div className="col-md-8 mx-auto p-5">
               
              
             <form onSubmit={reqapp} className="shadow-lg p-5 rounded-4 ">
                  <h5>Appointment</h5>
                  <br />


                  <label htmlFor="" >Select Speciality:</label>
                  <select onChange={filterdoc} className="form-control rounded-pill px-3">
                    <option value="">--Select Speciality--</option>
                    <option value="Cardiologist"> Cardiologist</option>
                    <option value="Neuro">Neuro</option>
                    <option value="Orthologist">Orthologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                  </select>

                  <br />
                  <label htmlFor="" >Select Doctor:</label>
                  <select value={did} onChange={(e)=>setDid(e.target.value)}  className="form-control rounded-pill px-3">
                    <option value="" >--Select Doctor--</option>
                    {
                        fdoc.map((d,i)=>(
                            <option key={d._id} value={d._id}>Dr. {d.name}/{d.spe}</option>
                        ))
                    }
                    
                  </select>
                  <br />
                  <label htmlFor="">Enter Date: </label>
                  <input type="date" value={date} onChange={(e)=>setDate(e.target.value)}  className="form-control rounded-pill px-3" />
                  <br />

                 <label htmlFor="" >Select Slot:</label>
                  <select value={slot} onChange={(e)=>setSlot(e.target.value)} className="form-control rounded-pill px-3">
                    <option value="">--Select Slot--</option>
                    <option value="Morning">Morning (9am-12pm)</option>
                    <option value="Afternoon">Afternoon (1pm-04pm)</option>
                    <option value="Evening">Evening (04pm-08pm)</option>
                  </select>
            
                  <br />
                  <label htmlFor="">Describe Your Problem:</label>
                  <textarea  value={description} onChange={(e)=>setDescription(e.target.value)} className="form-control rounded-pill px-3"></textarea>
                  <br />
                  <input type="submit" value="Request Appointment" className="form-control btn btn-primary" />
                </form>
                </div>
            </div>
        </div>
    </div>
    </> 
  )
}

export default Preqapp