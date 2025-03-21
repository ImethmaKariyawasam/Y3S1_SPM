import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiDocument,
  HiDocumentText,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiAnnotation,
  HiChartPie,
} from "react-icons/hi";
import { FaUsers, FaBox, FaTruck, FaReceipt } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOutSuccess } from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
export default function DashSideBar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {currentUser && currentUser.isAdmin && (
            <Link to="/dashboard?tab=dash">
              <Sidebar.Item
                active={tab === "dash"}
                icon={HiChartPie}
                labelColor="dark"
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser.isAdmin && (
            <>
              <Link to="/dashboard?tab=product_category">
                <Sidebar.Item
                  active={tab === "product_category"}
                  icon={HiOutlineTag}
                  as="div"
                >
                  Product Categories
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=product_inventory">
                <Sidebar.Item
                  active={tab === "product_inventory"}
                  icon={FaBox}
                  as="div"
                >
                  Inventory
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=product_supplier">
                <Sidebar.Item
                  active={tab === "product_supplier"}
                  icon={FaUsers}
                  as="div"
                >
                  Supplier
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=supplier_orders">
                <Sidebar.Item
                  active={tab === "supplier_orders"}
                  icon={FaTruck} // Change to your preferred icon
                  as="div"
                >
                  Supplier Orders
                </Sidebar.Item>
              </Link>

              <Link to="/dashboard?tab=customer_orders">
                <Sidebar.Item
                  active={tab === "customer_orders"}
                  icon={FaReceipt} // Change to your preferred icon
                  as="div"
                >
                  Customer Orders
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  Users
                </Sidebar.Item>
              </Link>
              <Link to="#">
                <Sidebar.Item
                  active={tab === "comments"}
                  icon={HiAnnotation}
                  as="div"
                >
                  Inquiries
                </Sidebar.Item>
              </Link>
            </>
          )}

          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
