import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function ReceptionistAppointments() {

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState(null);

  const [filters, setFilters] = useState({ email: "", status: "", date: "" });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [staffList, setStaffList] = useState([]);

  /* ================= BILL STATES ================= */

  const [showBillModal,setShowBillModal] = useState(false);
  const [billData,setBillData] = useState(null);
  const [paidAmount,setPaidAmount] = useState("");

  const limit = 10;

  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  /* ================= FETCH APPOINTMENTS ================= */

  const fetchAppointments = async (pageToFetch = 1) => {
    setLoading(true);

    try {

      const { data } = await axios.get(
        `${API_BASE_URL}/api/appointment/receptionist`,
        {
          ...getAuthConfig(),
          params:{
            page:pageToFetch,
            limit,
            status:filters.status || undefined,
            date:filters.date || undefined,
            search:filters.email || undefined
          }
        }
      );

      const appts = data.appointments || [];

      setAppointments(appts);
      setPage(Number(data.currentPage) || pageToFetch);
      setTotalPages(Number(data.totalPages) || 1);

      setStats({
        total:data.total || appts.length,
        pending:appts.filter(a=>a.status==="pending").length,
        confirmed:appts.filter(a=>a.status==="confirmed").length,
        completed:appts.filter(a=>a.status==="completed").length,
        cancelled:appts.filter(a=>a.status==="cancelled").length
      });

    } catch(err){

      setError(err.response?.data?.message || err.message);

    } finally {

      setLoading(false);

    }
  };

  /* ================= GENERATE BILL ================= */

  const generateBill = async(appointment)=>{

    try{

      const {data} = await axios.post(

        `${API_BASE_URL}/api/bill/generate`,

        { appointmentId: appointment._id },

        getAuthConfig()

      );

      setBillData(data.bill);
      setShowBillModal(true);

      setMessage({
        type:"success",
        text:"Bill generated successfully"
      });

    }catch(err){

      const errMsg = err.response?.data?.message || "Bill generation failed";

      setMessage({
        type:"error",
        text:errMsg
      });

    }

  };

  /* ================= CONFIRM PAYMENT ================= */

  const confirmPayment = async()=>{

    if(!paidAmount){
      setMessage({type:"error",text:"Enter paid amount"});
      return;
    }

    try{

      const {data} = await axios.post(

        `${API_BASE_URL}/api/bill/confirm-payment/${billData._id}`,

        { paidAmount },

        getAuthConfig()

      );

      setBillData(data.bill);

      setMessage({
        type:"success",
        text:"Payment successful"
      });

    }catch(err){

      setMessage({
        type:"error",
        text:"Payment failed"
      });

    }

  };

  /* ================= RECEIPT PRINT ================= */

  const printReceipt = ()=>{

    const receiptWindow = window.open("", "_blank");

    receiptWindow.document.write(`
      <h2>Diamond Trim Beauty Studio</h2>
      <p>Bill Number: ${billData.billNumber}</p>
      <p>Customer: ${billData.customerName}</p>
      <p>Service: ${billData.serviceName}</p>
      <p>Total Amount: ${billData.totalAmount}</p>
      <p>Paid Amount: ${billData.paidAmount}</p>
      <p>Date: ${new Date().toLocaleString()}</p>
      <h3>Thank you for visiting!</h3>
    `);

    receiptWindow.print();

  };

  useEffect(()=>{
    fetchAppointments(1);
  },[filters]);

  /* ================= LOADING ================= */

  if(loading)
    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-b-2 border-[#BB8C4B] rounded-full"/>
      </div>
    );

  if(error)
    return(
      <div className="text-center text-red-600">{error}</div>
    );

  /* ================= UI ================= */

  return (

    <div className="max-w-7xl mx-auto p-6 bg-white">

      <h1 className="text-3xl font-bold text-[#BB8C4B] mb-6">
        Receptionist Appointments
      </h1>

      {message && (
        <div className={`p-2 mb-4 rounded text-center ${message.type==="success"?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* APPOINTMENT CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {appointments.map((appt)=>{

          const item = appt.package || appt.service || {};
          const price = item.price || item.pricing || 0;

          return(

            <div key={appt._id} className="bg-white shadow rounded-xl p-4 border">

              <h2 className="font-semibold">{appt.customerName}</h2>

              <p className="text-sm">{item.name}</p>

              <p className="text-sm">
                {new Date(appt.appointmentDate).toLocaleDateString()}
              </p>

              <p className="text-sm">
                Price: {price}
              </p>

              {/* ACTION BUTTONS */}

              <div className="mt-3 flex gap-2">

                <button
                  onClick={()=>generateBill(appt)}
                  className="flex items-center gap-2 bg-[#BB8C4B] text-white px-3 py-1 rounded"
                >
                  <FileText size={16}/>
                  Generate Bill
                </button>

              </div>

            </div>

          );

        })}

      </div>

      {/* ================= BILL MODAL ================= */}

      {showBillModal && billData && (

        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-xl font-bold mb-4">
              Bill Details
            </h2>

            <p>Bill Number: {billData.billNumber}</p>
            <p>Customer: {billData.customerName}</p>
            <p>Service: {billData.serviceName}</p>
            <p>Total: {billData.totalAmount}</p>
            <p>Status: {billData.paymentStatus}</p>

            {billData.paymentStatus === "Unpaid" && (

              <>
                <input
                  type="number"
                  placeholder="Paid Amount"
                  value={paidAmount}
                  onChange={(e)=>setPaidAmount(e.target.value)}
                  className="border p-2 rounded w-full mt-3"
                />

                <button
                  onClick={confirmPayment}
                  className="mt-3 bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirm Payment
                </button>
              </>

            )}

            {billData.paymentStatus === "Paid" && (

              <button
                onClick={printReceipt}
                className="mt-3 bg-[#BB8C4B] text-white px-4 py-2 rounded"
              >
                Print Receipt
              </button>

            )}

            <button
              onClick={()=>setShowBillModal(false)}
              className="mt-3 ml-2 px-4 py-2 bg-gray-300 rounded"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}