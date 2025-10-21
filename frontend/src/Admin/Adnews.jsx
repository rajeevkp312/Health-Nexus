// import React from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import Adsidenav from '../Component/Adsidenav'
// import { useEffect } from 'react';
// import { useState } from 'react';
// import axios from 'axios'

// function Adnews() {
//     const navigate=useNavigate();
//     const[title,setTitle]=useState("")
//     const [desc,setDesc]=useState("")
//     const[news,setNews]=useState([])


//     async function addnews(e) {
//        e.preventDefault()
//        const news={title,desc};
//        const response=await axios.post('http://localhost:8000/api/news',news)
//        if(response.data.msg=="Success"){
//         window.alert("News added Success");
//         setTitle("");
//         setDesc("");
//         getnews();
//        }
//     }

//     async function getnews() {
       
//        const response=await axios.post('http://localhost:8000/api/news');
//        if(response.data.msg=="Success"){
//         setNews(response.data.value||[])
//        }
//     };
//     function validation (){
//         const data = localStorage.getItem('admin');
//         if(data!="admin@gmail.com"){
//             navigate('/admin')
//         }
//     }
//     useEffect(()=>{
//         validation();
//         getnews();
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
//             <h4 className='my-5 text-center'>Add News</h4>

//             <div className="row my-4">
//                         <div className="col-md-8 mx-auto p-5">
//                             <form onSubmit={addnews} className="form shadow-lg p-5 rounded-4">
//                                 <h5>Add News</h5>
//                                 <br />
//                                 <label>Enter Title:</label>
//                                 <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className='form-control rounded-pill px-3' />
//                                 <br />
                            
//                                 <label>Description:</label>
//                                 <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className='form-control rounded-pill px-3' />
//                                 <br />
//                                 <input type="submit" value="Add News" className="form-control btn btn-primary" />
//                             </form>
//                         </div>
//             </div>
//             <div className="row">
//                 <div className="col-md-10 mx-auto my-5 py-5 shadow-lg">
//                     <h5>View News</h5>
//                     <br />

//                     <div className="accordion accordion-flush" id="accordionFlushExample">
//                         {
//                             news.map((n)=>(
//                                 <div className="accordion-item">
//                                     <h2 className="accordion-header" id="flush-headingThree">
//                                     <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
//                                         {n.title}
//                                     </button>
//                                     </h2>
//                                     <div id="flush-collapseThree" className="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
//                                     <div className="accordion-body">{n.desc}</div>
//                                     </div>
//                                 </div>
//                             ))
//                         }
//                     </div>
//                     {/* <div class="accordion accordion-flush" id="accordionFlushExample">
//                     <div class="accordion-item">
//                         <h2 class="accordion-header" id="flush-headingThree">
//                         <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">
//                             Accordion Item #3
//                         </button>
//                         </h2>
//                         <div id="flush-collapseThree" class="accordion-collapse collapse" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
//                         <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the third item's accordion body. Nothing more exciting happening here in terms of content, but just filling up the space to make it look, at least at first glance, a bit more representative of how this would look in a real-world application.</div>
//                         </div>
//                     </div>
//                     </div> */}

//                 </div>
//             </div>
//         </div>
//     </div>
//     </>
//   )
// }

// export default Adnews



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Adsidenav from '../Component/Adsidenav';
import axios from 'axios';

function Adnews() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [news, setNews] = useState([]);

    // Add news handler
    async function addnews(e) {
        e.preventDefault();
        const newsData = { title, desc };

        try {
            const response = await axios.post('http://localhost:8000/api/news', newsData);
            if (response.data.msg === "Success") {
                window.alert("News added successfully");
                setTitle("");
                setDesc("");
                getnews();
            }
        } catch (error) {
            console.error("Error adding news:", error);
            alert("Failed to add news. Try again later.");
        }
    }

    // Fetch news from backend
    async function getnews() {
        try {
            const response = await axios.post('http://localhost:8000/api/news');
            if (response.data.msg === "Success") {
                setNews(response.data.value || []);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    }

    // Admin validation
    function validation() {
        const data = localStorage.getItem('admin');
        if (data !== "admin@gmail.com") {
            navigate('/admin');
        }
    }

    // Load on component mount
    useEffect(() => {
        validation();
        getnews();
    }, []);

    return (
        <>
            {/* Header */}
            <div className="row" style={{ height: "8vh", background: "lightgrey" }}>
                <div className="col-4">
                    <h4>Admin Dashboard</h4>
                </div>
                <div className="col-2 pe-3 my-auto ms-auto text-end">
                    <button
                        onClick={() => {
                            localStorage.removeItem("admin");
                            validation();
                        }}
                        className="btn btn-sm btn-outline-danger"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="row p-4" style={{ height: "92vh", background: "grey" }}>
                <Adsidenav />
                <div className="col-10 h-100 ms-auto bg-light rounded-4 shadow-lg" style={{ overflow: "auto" }}>
                    <h4 className='my-5 text-center'>Add News</h4>

                    {/* Add News Form */}
                    <div className="row my-4">
                        <div className="col-md-8 mx-auto p-5">
                            <form onSubmit={addnews} className="form shadow-lg p-5 rounded-4">
                                <h5>Add News</h5>
                                <br />
                                <label>Enter Title:</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className='form-control rounded-pill px-3'
                                    required
                                />
                                <br />

                                <label>Description:</label>
                                <textarea
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className='form-control px-3'
                                    rows="4"
                                    required
                                />
                                <br />
                                <input type="submit" value="Add News" className="form-control btn btn-primary" />
                            </form>
                        </div>
                    </div>

                    {/* View News Section */}
                    <div className="row">
                        <div className="col-md-10 mx-auto my-5 py-5 shadow-lg">
                            <h5>View News</h5>
                            <br />

                            <div className="accordion accordion-flush" id="accordionFlushExample">
                                {news.map((n, index) => {
                                    const headingId = `flush-heading-${index}`;
                                    const collapseId = `flush-collapse-${index}`;

                                    return (
                                        <div className="accordion-item" key={index}>
                                            <h2 className="accordion-header" id={headingId}>
                                                <button
                                                    className="accordion-button collapsed"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#${collapseId}`}
                                                    aria-expanded="false"
                                                    aria-controls={collapseId}
                                                >
                                                    {n.title}
                                                </button>
                                            </h2>
                                            <div
                                                id={collapseId}
                                                className="accordion-collapse collapse"
                                                aria-labelledby={headingId}
                                                data-bs-parent="#accordionFlushExample"
                                            >
                                                <div className="accordion-body">{n.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Adnews;
