import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import jsPDF from "jspdf"; // Import jsPDF
import html2canvas from "html2canvas"; // Import html2canvas
import { Link } from "react-router-dom"; // Import Link for navigation

export default function DashCustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        console.log("Fetched orders:", response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("There was an error fetching the orders!", error);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    const isConfirmed = newStatus === "Confirmed";

    try {
      const response = await axios.put(`/api/orders/update/${orderId}`, { Status: isConfirmed });
      console.log("Status updated:", response.data);

      // Show success alert
      Swal.fire({
        icon: "success",
        title: isConfirmed ? "Successfully Confirmed!" : "Successfully Rejected!",
        text: `Order ${orderId} has been ${isConfirmed ? "confirmed" : "rejected"}.`,
        confirmButtonText: "OK",
      });

      // Generate PDF if confirmed
      if (isConfirmed) {
        generatePDF(orderId);
      }

      // Update the local state
      const updatedOrders = orders.map((order) => {
        if (order._id === orderId) {
          return { ...order, Status: isConfirmed };
        }
        return order;
      });
      setOrders(updatedOrders);
    } catch (error) {
      console.error("There was an error updating the status!", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error updating the order status. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const generatePDF = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    const pdfDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", putOnlyUsedFonts: true });
  
    // Set the font and colors for the PDF
    pdfDoc.setFont("Helvetica", "bold");
    pdfDoc.setTextColor(0, 128, 0); // Green color for the title
    pdfDoc.setFontSize(22);
    pdfDoc.text("Order Confirmation", 20, 30); // Title
  
    pdfDoc.setFont("Helvetica", "normal");
    pdfDoc.setTextColor(0, 0, 0); // Reset to black for the rest of the text
    pdfDoc.setFontSize(16);
    pdfDoc.text("Thank you for your order!", 20, 50); // Subtitle
  
    // Adding order details
    pdfDoc.setFontSize(12);
    pdfDoc.text(`Order ID: ${order._id}`, 20, 70);
    pdfDoc.text(`Customer ID: ${order.CustomerID}`, 20, 80);
    pdfDoc.text(`Date: ${order.Date}`, 20, 90);
    pdfDoc.text(`Location: ${order.Location || "N/A"}`, 20, 100);
    pdfDoc.text(`Products: ${typeof order.ProductArrays === "string" ? JSON.parse(order.ProductArrays).join(", ") : "N/A"}`, 20, 110);
    pdfDoc.text(`Status: ${order.Status ? "Completed" : "Pending"}`, 20, 120);
  
    // Save the PDF
    pdfDoc.save(`Order_${orderId}.pdf`);
  };
  

  if (loading) return <div>Loading...</div>; // Show loading indicator
  if (error) return <div style={{ color: 'red' }}>{error}</div>; // Show error message

  return (
    <div className="Container" style={{ width: "100vw", height: "100vh" }}>
      <div className="row1" style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#d009d3", marginTop: "1rem" }}>
          Online Ordering
        </h1>
        <Link to="/OrderAnalysis" style={{ textDecoration: "none" }}>
          <button 
            className="hoverZoom" 
            style={{ 
              padding: "1rem", 
              border: "1px solid white", 
              borderRadius: "10px", 
              background: "linear-gradient(90deg, #9514F8 20%, #2555F2 100%)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }} 
          >
            Analysis
          </button>
        </Link>
      </div>
      <div className="table" style={{ marginTop: "2rem", padding: "0 2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Customer ID</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Location</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Product Arrays</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Confirm</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Reject</th>
              <th style={{ padding: "10px 30px", border: "1px solid #ddd" }}>Send</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>{order.CustomerID}</td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>{order.Date}</td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>{order.Location}</td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>
                    {typeof order.ProductArrays === "string"
                      ? JSON.parse(order.ProductArrays).join(", ")
                      : "N/A"}
                  </td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>
                    {order.Status ? "Completed" : "Pending"}
                  </td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>
                    <button className="hoverZoom confirmButton" onClick={() => updateOrderStatus(order._id, "Confirmed")}>
                      Confirm
                    </button>
                  </td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>
                    <button className="hoverZoom rejectButton" onClick={() => updateOrderStatus(order._id, "Rejected")}>
                      Reject
                    </button>
                  </td>
                  <td style={{ padding: "10px 30px", border: "1px solid #ddd" }}>
                    <button className="hoverZoom sendButton" onClick={() => updateOrderStatus(order._id, "Send")}>
                      Send
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "10px", border: "1px solid #ddd" }}>
                  No orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add this CSS in your CSS file or inline styles
const styles = `
.hoverZoom {
  transition: transform 0.3s ease; /* Smooth transition */
}

.hoverZoom:hover {
  transform: scale(1.1); /* Zoom effect */
}

/* Gradient for Confirm Button */
.confirmButton {
  background: linear-gradient(90deg, #00c6ff, #0072ff); /* Light to Dark Blue */
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

/* Gradient for Reject Button */
.rejectButton {
  background: linear-gradient(90deg, #ff512f, #dd2476); /* Red to Pink */
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

/* Gradient for Send Button */
.sendButton {
  background: linear-gradient(90deg, #0fd850, #f9f047); /* Green to Yellow */
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
