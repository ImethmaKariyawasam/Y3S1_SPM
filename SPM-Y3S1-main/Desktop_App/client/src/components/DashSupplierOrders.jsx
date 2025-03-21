import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TextInput,
  Card,
  Badge,
  Modal,
  Spinner,
  Toast,
  Label,
  Textarea,
} from "flowbite-react";
import {
  HiPrinter,
  HiCalendar,
  HiDocumentText,
  HiClipboardCheck,
  HiOutlineX,
  HiOutlineTag,
  HiSearch,
  HiFilter,
  HiEye,
  HiDocumentReport,
} from "react-icons/hi";
import { app } from "../firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FaBox, FaUsers, FaTruck } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiClock,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import { AiOutlineReload } from "react-icons/ai";
import { HiCalendarDays } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { FaClipboardList } from "react-icons/fa";
import { set } from "mongoose";
import {
  User,
  Mail,
  Phone,
  Package,
  Calendar,
  ShoppingCart,
} from "lucide-react";
export default function DashSupplierOrders() {
  const [productCategories, setProductCategories] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectorSuppliers, setSelectorSuppliers] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState([]);
  const [searchTerm3, setSearchTerm3] = useState("");
  const [totalSupplierOrders, setTotalSupplierOrders] = useState(0);
  const [filterOption, setFilterOption] = useState("all");
  const [totalPendingSupplierOrders, setTotalPendingSupplierOrders] =
    useState(0);
  const [totalComplettedSupplierOrders, setTotalComplettedSupplierOrders] =
    useState(0);
  const [totalRejectedSupplierOrders, setTotalRejectedSupplierOrders] =
    useState(0);
  const [supplierOrders, setSupplierOrders] = useState([]);
  useEffect(() => {
    fetchSupplierOrders();
  }, [searchTerm3]);

  const fetchSupplierOrders = async (e) => {
    try {
      const response = await fetch("/api/supplierOrder/get-supplier-orders");
      const data = await response.json();
      if (response.ok) {
        const filteredData = data.supplierOrders.filter((supplierOrder) => {
          if (
            supplierOrder?.supplier?.supplierName
              .toLowerCase()
              .includes(searchTerm3.toLowerCase()) ||
            supplierOrder?.product?.name
              .toLowerCase()
              .includes(searchTerm3.toLowerCase())
          ) {
            return supplierOrder;
          }
        });
        const uniqueSuppliers = filteredData.map(
          (supplierOrder) => supplierOrder.supplier
        );
        const uniqueSuppliersSet = new Set(uniqueSuppliers);
        const uniqueSuppliersArray = [...uniqueSuppliersSet];
        const suppliers = uniqueSuppliersArray.map((supplier) => ({
          value: supplier._id,
          label: supplier.supplierName,
        }));
        setSelectorSuppliers(suppliers);
        setSupplierOrders(filteredData);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <HiClock className="text-yellow-500" />; // Yellow for pending
      case "Completed":
        return <HiCheckCircle className="text-green-500" />; // Green for completed
      case "Cancelled":
        return <HiXCircle className="text-red-500" />; // Red for cancelled
      default:
        return null;
    }
  };

  const [fullFillModal, setFullFillModal] = useState(false);
  const [supplierOrder, setSupplierOrder] = useState(null);

  const handleFullFillOrderModal = (order) => {
    setFullFillModal(true);
    setSupplierOrder(order);
  };

  const [orderViewModal, setOrderViewModal] = useState(false);
  const handleViewMore = (order) => {
    setOrderViewModal(true);
    setSupplierOrder(order);
  };

  const [cancelModal, setCancelModal] = useState(false);
  const handleCancelOrder = (order) => {
    setCancelModal(true);
    setSupplierOrder(order);
  };

  const confirmCancel = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/supplierOrder/cancel-supplier-order/${supplierOrder._id}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setCancelModal(false);
        setIsDeleting(false);
        setSupplierOrder(null);
        fetchSupplierOrders();
      } else {
        setSupplierOrder(null);
        setIsDeleting(false);
        throw new Error(data.message);
      }
    } catch (error) {
      setSupplierOrder(null);
      setIsDeleting(false);
      toast.error(error.message);
    }
  };

  const [pageNumber, setPageNumber] = useState(0);
  const supplierOrdersPerPage = 5;

  const pageCount = Math.ceil(supplierOrders.length / supplierOrdersPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displaySupplierOrders = supplierOrders
    .slice(
      pageNumber * supplierOrdersPerPage,
      (pageNumber + 1) * supplierOrdersPerPage
    )
    .map((supplierOrder) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={supplierOrder._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>
            {" "}
            {supplierOrder?.orderDate
              ? new Date(supplierOrder.orderDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {supplierOrder?.product?.name ||
              supplierOrder?.productName ||
              "Product Deleted"}
          </Table.Cell>
          <Table.Cell>{supplierOrder?.supplier?.supplierName}</Table.Cell>
          <Table.Cell>{supplierOrder?.supplier?.supplierPhone}</Table.Cell>
          <Table.Cell>
            <Badge
              color={
                supplierOrder?.status === "Completed"
                  ? "success"
                  : supplierOrder?.status === "Pending"
                  ? "yellow"
                  : supplierOrder?.status === "Cancelled"
                  ? "failure"
                  : "gray"
              }
              style={{
                fontSize: "1.2rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                display: "flex", // Use flexbox
                alignItems: "center", // Center vertically
                justifyContent: "center", // Center horizontally
              }}
            >
              {React.cloneElement(getStatusIcon(supplierOrder?.status), {
                size: 24,
                style: {
                  marginRight: "0rem",
                  alignItems: "center", // Center vertically
                  justifyContent: "center",
                },
              })}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                onClick={() => handleViewMore(supplierOrder)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="blue"
                type="submit"
                outline
                disabled={
                  supplierOrder?.status === "Completed" ||
                  supplierOrder?.status === "Cancelled"
                }
                onClick={() => handleFullFillOrderModal(supplierOrder)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update Order
              </Button>
              <Button
                size="sm"
                color="failure"
                outline
                disabled={
                  supplierOrder?.status === "Completed" ||
                  supplierOrder?.status === "Cancelled"
                }
                onClick={() => handleCancelOrder(supplierOrder)}
              >
                <HiOutlineX className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const [imageFile, setImageFile] = useState(null);
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  useEffect(() => {
    if (imageFile) {
      uploadProductImage();
    }
  }, [imageFile]);
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const uploadProductImage = async () => {
    const storage = getStorage(app);
    const filename = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
        setFileUploadSuccess("File Uploaded Successfully");
      },
      (error) => {
        imageFileUploadingError(
          "Could not upload image(File must be less than 2MB)"
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, productImage: downloadURL });
        });
      }
    );
  };

  const [downloadSupplier, setDownloadSupplier] = useState(null);
  const [downloadSupplierID, setDownloadSupplierID] = useState(null);
  const handleSupplierChange = (selectedOption) => {
    setDownloadSupplier(selectedOption);
    setDownloadSupplierID(selectedOption?.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFullfillSupplierOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/supplierOrder/full-fill-supplier-order/${supplierOrder._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData, supplierOrder }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setFullFillModal(false);
        setFormData({});
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setSupplierOrder(null);
        setIsLoading(false);
        fetchSupplierOrders();
      } else {
        setIsLoading(false);
        throw new Error(data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  const [selectedDownloadSupplier, setSelectedDownloadSupplier] =
    useState(null);
  const handleSelectorSupplier = (selectedOption) => {
    setSelectedDownloadSupplier(selectedOption);
  };

  const [selectedStatus, setSelectedStatus] = useState(null);
  const handleStatusSelector = (selectedOption) => {
    setSelectedStatus(selectedOption);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadSupplierReport = async () => {
    if (selectedDownloadSupplier != null) {
      setIsDownloading(true);
      try {
        const res = await fetch(
          "/api/supplierOrder/generate-supplier-order-report",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              selectedSupplierID: selectedDownloadSupplier.value,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Supplier_${selectedDownloadSupplier.label}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSelectedDownloadSupplier(null);
        setIsDownloading(false);
      } catch (error) {
        setIsDownloading(false);
        console.log(error);
        toast.error(error.message);
      }
    }
    if (selectedStatus != null) {
      setIsDownloading(true);
      try {
        const res = await fetch(
          "/api/supplierOrder/generate-supplier-order-status-report",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: selectedStatus.value,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Supplier_Order_${selectedStatus.value}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSelectedStatus(null);
        setIsDownloading(false);
      } catch (error) {
        setIsDownloading(false);
        console.log(error);
        toast.error(error.message);
      }
    }
  };
  const handleFilter = (e) => {
    setFilterOption(e.target.value);
    if (e.target.value === "all") {
      fetchSupplierOrders();
    } else {
      const filteredData = supplierOrders.filter(
        (supplierOrder) => supplierOrder.status === e.target.value
      );
      setSupplierOrders(filteredData);
    }
  };
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = () => {
    setIsLoading(true);
    setIsResetting(true);
    fetchSupplierOrders();
    setIsResetting(false);
    setSelectedDownloadSupplier(null);
    setSelectedStatus(null);
    setIsLoading(false);
  };
  const resetForm = () => {
    setFullFillModal(false);
    setFormData({});
    setImageFile(null);
    setImageFileUploadingError(false);
    setFileUploadSuccess(false);
    setImageFileUploadingProgress(false);
    setSupplierOrder(null);
  };
  const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start mb-4">
      <div className="text-blue-500 mr-3 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      <ToastContainer />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="p-3 md:mx-auto">
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
                    <p className="text-2xl">{totalComplettedSupplierOrders}</p>
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
          <div>
            <div className="flex items-center mb-3">
              <select
                id="filter"
                onChange={handleFilter}
                className="ml-4 mr-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="defaultvalue" disabled selected>
                  Choose a filter option
                </option>
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className=" ml-2"
                onClick={() => handleReset()}
              >
                {isResetting ? (
                  <Spinner className="animate-spin" color="white" size="sm" />
                ) : (
                  <AiOutlineReload className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className=" flex items-center mb-2">
              <TextInput
                type="text"
                value={searchTerm3}
                onChange={(e) => setSearchTerm3(e.target.value)}
                placeholder="Search by Supplier Name and Product Name"
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                className="ml-4"
                placeholder="Select a Supplier"
                isSearchable
                isClearable
                options={selectorSuppliers}
                value={selectedDownloadSupplier}
                onChange={handleSelectorSupplier}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "200px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
              />
              <Select
                className="ml-4"
                placeholder="Select Status"
                isSearchable
                isClearable
                options={["Pending", "Completed", "Cancelled"].map(
                  (option) => ({
                    value: option,
                    label: option,
                  })
                )}
                value={selectedStatus}
                onChange={handleStatusSelector}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "250px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                }}
              />
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className=" ml-4"
                disabled={
                  (!selectedDownloadSupplier && !selectedStatus) ||
                  (selectedDownloadSupplier && selectedStatus)
                }
                onClick={() => handleDownloadSupplierReport()}
              >
                {isDownloading ? (
                  <Spinner
                    disabled
                    className="animate-spin"
                    color="white"
                    size="sm"
                  />
                ) : (
                  "Download Supplier Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {supplierOrders.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Order Date</Table.HeadCell>
                  <Table.HeadCell>Product</Table.HeadCell>
                  <Table.HeadCell>Supplier</Table.HeadCell>
                  <Table.HeadCell>Suppliers Phone</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displaySupplierOrders}
              </Table>
            ) : (
              <p>No Supplier Orders Available</p>
            )}
            <div className="mt-9 center">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"pagination flex justify-center"}
                previousLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                nextLinkClassName={
                  "inline-flex items-center px-4 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
                disabledClassName={"opacity-50 cursor-not-allowed"}
                activeClassName={"bg-indigo-500 text-white"}
              />
            </div>
          </div>

          {/** Delete Supplier Order*/}
          <Modal show={cancelModal} onClose={() => setCancelModal(false)}>
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to cancel this order?
              </h3>
            </Modal.Header>
            <Modal.Footer>
              <Button color="gray" onClick={() => setCancelModal(false)}>
                Close
              </Button>
              <Button
                color="failure"
                onClick={() => confirmCancel()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Cancel Order"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** View More Supplier Order */}
          <Modal
            show={orderViewModal}
            onClose={() => {
              setOrderViewModal(false);
              setSupplierOrder(null);
            }}
            size="xl"
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Supplier Order Details
              </h3>
            </Modal.Header>
            <Modal.Body>
              {supplierOrder && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">
                      Supplier Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<User size={20} />}
                        label="Supplier Name"
                        value={supplierOrder.supplier?.supplierName}
                      />
                      <InfoItem
                        icon={<Mail size={20} />}
                        label="Email"
                        value={supplierOrder.supplier?.supplierEmail}
                      />
                      <InfoItem
                        icon={<Phone size={20} />}
                        label="Phone"
                        value={supplierOrder.supplier?.supplierPhone}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-200">
                      Order Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<Package size={20} />}
                        label="Product"
                        value={
                          supplierOrder.product?.name ||
                          supplierOrder.productName
                        }
                      />
                      <InfoItem
                        icon={<ShoppingCart size={20} />}
                        label="Quantity"
                        value={`${supplierOrder.quantity} Units`}
                      />
                      <InfoItem
                        icon={<Calendar size={20} />}
                        label="Order Date"
                        value={formatDate(supplierOrder.orderDate)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setOrderViewModal(false);
                  setSupplierOrder(null);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Full Fill Supplier Order */}
          <Modal show={fullFillModal} onClose={resetForm} size="5xl">
            <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Fulfill Supplier Order
              </h3>
            </Modal.Header>
            <Modal.Body className="!p-6">
              <form
                onSubmit={handleFullfillSupplierOrder}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" value="Item Name" />
                    <TextInput
                      id="name"
                      type="text"
                      placeholder={supplierOrder?.product?.name}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" value="Item Quantity" />
                    <TextInput
                      id="quantity"
                      type="number"
                      placeholder={supplierOrder?.quantity}
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" value="Item Price" />
                    <TextInput
                      id="price"
                      type="number"
                      placeholder="Enter Item Price"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="itemMinimumQTY"
                      value="Item Minimum Quantity"
                    />
                    <TextInput
                      id="itemMinimumQTY"
                      type="number"
                      placeholder="Enter Item Minimum Quantity"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiaryDate" value="Item Expiry Date" />
                    <TextInput
                      id="expiaryDate"
                      type="date"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber" value="Batch No" />
                    <TextInput
                      id="batchNumber"
                      type="text"
                      placeholder="Enter Batch Number"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier" value="Supplier Name" />
                    <Select
                      isDisabled
                      placeholder={supplierOrder?.supplier?.supplierName}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="description" value="Item Description" />
                    <Textarea
                      id="description"
                      placeholder={supplierOrder?.product?.description}
                      required
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="itemImage" value="Item Image" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    {imageFileUploadingProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
                          style={{ width: `${imageFileUploadingProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {imageFileUploadingError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {imageFileUploadingError}
                      </p>
                    )}
                    {fileUploadSuccess && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                        {fileUploadSuccess}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button color="gray" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    gradientDuoTone="purpleToPink"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" light={true} />
                        <span className="ml-2">Fulfilling...</span>
                      </>
                    ) : (
                      "Fulfill Order"
                    )}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}
