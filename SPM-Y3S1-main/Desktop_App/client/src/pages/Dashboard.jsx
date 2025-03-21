import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../components/DashSideBar";
import DashProfile from "../components/DashProfile";
import DashUserProfiles from "../components/DashUserProfiles";
import DashProductCategory from "../components/DashProductCategory";
import DashSupplier from "../components/DashSupplier";
import DashNewInventory from "../components/DashNewInventory";
import DashSupplierOrders from "../components/DashSupplierOrders";
import DashCustomerOrders from "../components/DashCustomerOrders";
import DashInventoryDashBoard from "../components/DashInventoryDashBoard";
export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* <DashSideBar /> */}
      <div className=" md:w-56">
        <DashSideBar />
      </div>
      {/* <DashProfile /> */}
      {tab === "profile" && <DashProfile />}
      {tab === "users" && <DashUserProfiles/>}
      {/** Product Catagory Section */}
      {tab === "product_category" && <DashProductCategory/>}
      {/** Supplier Section */}
      {tab === "product_supplier" && <DashSupplier/>}
      {/** Product Inventory */}
      {tab === "product_inventory" && <DashNewInventory/>}
      {/** Supplier Orders */}
      {tab === "supplier_orders" && <DashSupplierOrders/>}
      {/** Customer Orders */}
      {tab === "customer_orders" && <DashCustomerOrders/>}
      {/** Inventory DashBoard */}
      {tab === "dash" && <DashInventoryDashBoard/>}
    </div>
  );
}
