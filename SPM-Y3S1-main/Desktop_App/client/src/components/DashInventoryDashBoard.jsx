import {
  Badge,
  Button,
  ButtonGroup,
  FileInput,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { app } from "../firebase";
import React, { useEffect, useState } from "react";
import {
  HiOutlineExclamationCircle,
  HiEye,
  HiOutlineX,
  HiArrowNarrowUp,
  HiOutlineTag,
} from "react-icons/hi";
import { AiOutlineReload } from "react-icons/ai";
import { useSelector } from "react-redux";
import { FaBox, FaCheck, FaTimes, FaClipboardList } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { Link, json } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FaExclamationTriangle, FaCartPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import ReactSelect from "react-select";
import LoadingSpinner from "./LoadingSpinner";
import { HiCheckCircle, HiXCircle, HiExclamationCircle } from "react-icons/hi";
import { FaUsers, FaTruck } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function DashInventoryDashBoard() {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalInventoryItems, setTotalInventoryItems] = useState(0);
  const [inventoryItemsInStock, setInventoryItemsInStock] = useState(0);
  const [inventoryItemsOutOfStock, setInventoryItemsOutOfStock] = useState(0);
  const [inventoryItemsExpired, setInventoryItemsExpired] = useState(0);
  const [currentUser, setCurrentUser] = useState({});
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm3, setSearchTerm3] = useState("");
  const [addInventoryModel, setAddInventoryModel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [totalCatgories, setTotalCatgories] = useState(0);
  const [totalActiveCategories, setTotalActiveCategories] = useState(0);
  const [totalInactiveCategories, setTotalInactiveCategories] = useState(0);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [totalNoPromotions, setTotalNoPromotions] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalActiveSuppliers, setTotalActiveSuppliers] = useState(0);
  const [totalInactiveSuppliers, setTotalInactiveSuppliers] = useState(0);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [totalSupplierOrders, setTotalSupplierOrders] = useState(0);
  const [filterOption, setFilterOption] = useState("all");
  const [totalPendingSupplierOrders, setTotalPendingSupplierOrders] =
    useState(0);
  const [totalComplettedSupplierOrders, setTotalComplettedSupplierOrders] =
    useState(0);
  const [totalRejectedSupplierOrders, setTotalRejectedSupplierOrders] =
    useState(0);
  useEffect(() => {
    fetchSuppliers();
    fetchInventory();
    fetchProductCategories();
    fetchSupplierOrders();
  }, [searchTerm3]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory/get-inventory-items`);
      const data = await res.json();
      const filteredData = data.products.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm3.toLowerCase()) ||
          item.supplier.supplierName
            .toLowerCase()
            .includes(searchTerm3.toLowerCase()) ||
          item.category.name.toLowerCase().includes(searchTerm3.toLowerCase())
      );
      setInventory(filteredData);
      setTotalInventoryItems(data.totalProducts);
      setInventoryItemsInStock(data.totalProductsInStock);
      setInventoryItemsOutOfStock(data.totalOutOfStockProducts);
      setInventoryItemsExpired(data.totalExpireProducts);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const fetchSuppliers = async (e) => {
    try {
      const response = await fetch("/api/supplier/get-suppliers");
      const data = await response.json();
      const filteredData = data.suppliers.filter(
        (supplier) =>
          supplier.supplierName
            .toLowerCase()
            .includes(searchTerm3.toLowerCase()) ||
          supplier.supplierCity
            .toLowerCase()
            .includes(searchTerm3.toLowerCase())
      );
      const uniqueSuppliers = data.suppliers.map((supplier) => ({
        value: supplier._id,
        label: supplier.supplierName,
      }));
      setProductSuppliers(filteredData);
      setSuppliers(uniqueSuppliers);
      setTotalSuppliers(data.totalSuppliers);
      setTotalActiveSuppliers(data.activeSuppliers);
      setTotalInactiveSuppliers(data.inactiveSuppliers);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const fetchProductCategories = async (e) => {
    try {
      const response = await fetch("/api/productCategory/get-categories");
      const data = await response.json();
      const filteredData = data.productCategories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm3.toLowerCase())
      );
      const uniqueCategories = data.productCategories.map((category) => ({
        value: category._id,
        label: category.name,
      }));
      setCategories(uniqueCategories);
      setProductCategories(filteredData);
      setTotalCatgories(data.totalCategories);
      setTotalActiveCategories(data.activeCategories);
      setTotalInactiveCategories(data.inactiveCategories);
      setTotalPromotions(data.promotions);
      setTotalNoPromotions(data.noPromotions);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const fetchSupplierOrders = async (e) => {
    try {
      const response = await fetch("/api/supplierOrder/get-supplier-orders");
      const data = await response.json();
      if (response.ok) {
        setTotalSupplierOrders(data.totalSupplierOrders);
        setTotalPendingSupplierOrders(data.pendingSupplierOrders);
        setTotalComplettedSupplierOrders(data.completedSupplierOrders);
        setTotalRejectedSupplierOrders(data.cancelledSupplierOrders);
        setIsLoading(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const inventoryPieData = {
    labels: ["In Stock", "Out of Stock", "Expired"],
    datasets: [
      {
        label: "Inventory",
        data: [
          inventoryItemsInStock,
          inventoryItemsOutOfStock,
          inventoryItemsExpired,
        ],
        backgroundColor: ["#34d399", "#f87171", "#fbbf24"],
        hoverBackgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
      },
    ],
  };

  const categoriesPieData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Categories",
        data: [totalActiveCategories, totalInactiveCategories],
        backgroundColor: ["#34d399", "#f87171"],
        hoverBackgroundColor: ["#10b981", "#ef4444"],
      },
    ],
  };

  const suppliersPieData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Suppliers",
        data: [totalActiveSuppliers, totalInactiveSuppliers],
        backgroundColor: ["#34d399", "#f87171"],
        hoverBackgroundColor: ["#10b981", "#ef4444"],
      },
    ],
  };

  const supplierOrdersBarData = {
    labels: ["Total Orders", "Completed", "Pending", "Cancelled"],
    datasets: [
      {
        label: "Supplier Orders",
        data: [
          totalSupplierOrders,
          totalComplettedSupplierOrders,
          totalPendingSupplierOrders,
          totalRejectedSupplierOrders,
        ],
        backgroundColor: ["#34d399", "#60a5fa", "#fbbf24", "#f87171"],
      },
    ],
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="p-3 md:mx-auto">
            {/* Inventory Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
                Inventory Summary
              </h3>
              <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Inventory Items
                      </h3>
                      <p className="text-2xl">{totalInventoryItems}</p>
                    </div>
                    <FaBox className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Items In Stock
                      </h3>
                      <p className="text-2xl">{inventoryItemsInStock}</p>
                    </div>
                    <FaBox className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Items Out of Stock
                      </h3>
                      <p className="text-2xl">{inventoryItemsOutOfStock}</p>
                    </div>
                    <FaBox className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Expired Items
                      </h3>
                      <p className="text-2xl">{inventoryItemsExpired}</p>
                    </div>
                    <FaBox className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
                Category Summary
              </h3>
              <div className="flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Categories
                      </h3>
                      <p className="text-2xl">{totalCatgories}</p>
                    </div>
                    <HiOutlineTag className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Activated Categories
                      </h3>
                      <p className="text-2xl">{totalActiveCategories}</p>
                    </div>
                    <HiOutlineTag className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Deactivated Categories
                      </h3>
                      <p className="text-2xl">{totalInactiveCategories}</p>
                    </div>
                    <HiOutlineTag className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Categories Promotion
                      </h3>
                      <p className="text-2xl">{totalPromotions}</p>
                    </div>
                    <HiOutlineTag className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Categories Not on Promotion
                      </h3>
                      <p className="text-2xl">{totalNoPromotions}</p>
                    </div>
                    <HiOutlineTag className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
                Supplier Summary
              </h3>
              <div className=" flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Suppliers
                      </h3>
                      <p className="text-2xl">{totalSuppliers}</p>
                    </div>
                    <FaUsers className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Active Suppliers
                      </h3>
                      <p className="text-2xl">{totalActiveSuppliers}</p>
                    </div>
                    <FaUsers className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Deactive Suppliers
                      </h3>
                      <p className="text-2xl">{totalInactiveSuppliers}</p>
                    </div>
                    <FaUsers className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/** Supplier Order Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
                Supplier Order Summary
              </h3>
              <div className=" flex-wrap flex gap-4 justify-center">
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Supplier Orders
                      </h3>
                      <p className="text-2xl">{totalSupplierOrders}</p>
                    </div>
                    <FaTruck className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Completed Orders
                      </h3>
                      <p className="text-2xl">
                        {totalComplettedSupplierOrders}
                      </p>
                    </div>
                    <FaTruck className="bg-green-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Pending Orders
                      </h3>
                      <p className="text-2xl">{totalPendingSupplierOrders}</p>
                    </div>
                    <FaTruck className="bg-yellow-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Cancelled Orders
                      </h3>
                      <p className="text-2xl">{totalRejectedSupplierOrders}</p>
                    </div>
                    <FaTruck className="bg-red-500 text-white rounded text-5xl p-3 shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-left text-gray-700 mb-6 dark:text-white uppercase">
                Analytics Charts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Chart */}
                <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                    Inventory Chart
                  </h3>
                  <div className="flex justify-center h-[300px]">
                    <Pie
                      data={inventoryPieData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>

                {/* Categories Chart */}
                <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                    Categories Chart
                  </h3>
                  <div className="flex justify-center h-[300px]">
                    <Pie
                      data={categoriesPieData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>

                {/* Suppliers Chart */}
                <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                    Suppliers Chart
                  </h3>
                  <div className="flex justify-center h-[300px]">
                    <Pie
                      data={suppliersPieData}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                </div>

                {/* Supplier Orders Chart */}
                <div className="flex flex-col p-6 dark:bg-slate-800 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 dark:text-white uppercase">
                    Supplier Orders Chart
                  </h3>
                  <div className="flex justify-center h-[300px]">
                    <Bar
                      data={supplierOrdersBarData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
