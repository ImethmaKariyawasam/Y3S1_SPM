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
  HiCheckCircle,
  HiXCircle,
  HiClock,
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
import { FaBox, FaUsers } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { HiAnnotation, HiArrowNarrowUp } from "react-icons/hi";
import { HiCalendarDays } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import { FaClipboardList } from "react-icons/fa";
import { AiOutlineReload } from "react-icons/ai";
import {
  User,
  IdCard,
  Mail,
  Phone,
  MapPin,
  Building,
  CheckCircle,
  QrCode,
  Package,
} from "lucide-react";
import { set } from "mongoose";
export default function DashSupplier() {
  const [productCategories, setProductCategories] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addSupplierModel, setAddSupplierModel] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState([]);
  const [updateModel, setUpdateModal] = useState(false);
  const [searchTerm3, setSearchTerm3] = useState("");
  const [viewMoreModal, setViewMoreModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [totalActiveSuppliers, setTotalActiveSuppliers] = useState(0);
  const [totalInactiveSuppliers, setTotalInactiveSuppliers] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [updateSupplierModal, setUpdateSupplierModal] = useState(false);
  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm3]);
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
  const getStatusText = (status) => {
    switch (status) {
      case "Active":
        return "Active";
      case "Deactive":
        return "Deactive";
      default:
        return status;
    }
  };

  const handleSupplierDelete = async (supplier) => {
    setDeleteModal(true);
    setSelectedSupplier(supplier);
  };

  const handleViewMore = (supplier) => {
    setSelectedSupplier(supplier);
    setViewMoreModal(true);
  };

  const handleUpdateSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setUpdateSupplierModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <HiCheckCircle className="text-green-500" />; // Green for completed
      case "Deactive":
        return <HiXCircle className="text-red-500" />; // Red for cancelled
      default:
        return null;
    }
  };

  const [pageNumber, setPageNumber] = useState(0);
  const suppliersPerPage = 5;

  const pageCount = Math.ceil(productSuppliers.length / suppliersPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displaySuppliers = productSuppliers
    .slice(pageNumber * suppliersPerPage, (pageNumber + 1) * suppliersPerPage)
    .map((supplier) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={supplier._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{supplier.supplierName}</Table.Cell>
          <Table.Cell>
            <Badge
              color={
                supplier.status === "Active"
                  ? "success"
                  : supplier.status === "Deactive"
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
              {getStatusIcon(supplier.status)}
            </Badge>
          </Table.Cell>
          <Table.Cell>{supplier.supplierEmail}</Table.Cell>
          <Table.Cell>{supplier.supplierPhone}</Table.Cell>
          <Table.Cell>{supplier.supplierCity}</Table.Cell>
          <Table.Cell>
            <Button color="blue" type="submit" outline disabled>
              <FaBox className="mr-2 h-5 w-5" />
              {supplier.products.length}
            </Button>
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                onClick={() => handleViewMore(supplier)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="blue"
                type="submit"
                outline
                onClick={() => handleUpdateSupplier(supplier)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button
                size="sm"
                color="failure"
                disabled={isDeleting}
                outline
                onClick={() => handleSupplierDelete(supplier)}
              >
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const [downloadSupplier, setDownloadSupplier] = useState(null);
  const [downloadSupplierID, setDownloadSupplierID] = useState(null);
  const handleSupplierChange = (selectedOption) => {
    setDownloadSupplier(selectedOption);
    setDownloadSupplierID(selectedOption?.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSupplierAdd = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    if (
      formData.supplierName === "" ||
      formData.supplierEmail === "" ||
      formData.supplierPhone === "" ||
      formData.supplierAddress === "" ||
      formData.supplierCity === ""
    ) {
      toast.error("All fields are required");
      setIsAdding(false);
      return;
    }
    if (formData.supplierCity === "Select City") {
      toast.error("Select a City");
      setIsAdding(false);
      return;
    }
    if (
      formData.supplierName !== "" &&
      formData.supplierEmail !== "" &&
      formData.supplierPhone !== "" &&
      formData.supplierAddress !== "" &&
      formData.supplierCity !== ""
    ) {
      try {
        const response = await fetch("/api/supplier/create-supplier", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        toast.success("Supplier Added Successfully");
        fetchSuppliers();
        setIsAdding(false);
        setAddSupplierModel(false);
        setFormData([]);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
        setIsAdding(false);
      }
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/supplier/delete-supplier/${selectedSupplier._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast.success("Supplier Deleted Successfully");
      fetchSuppliers();
      setIsDeleting(false);
      setDeleteModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setIsDeleting(false);
    }
  };

  const confirmUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `/api/supplier/update-supplier/${selectedSupplier._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast.success("Supplier Updated Successfully");
      fetchSuppliers();
      setFormData([]);
      setIsUpdating(false);
      setUpdateSupplierModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      setFormData([]);
      console.log(error);
      toast.error(error.message);
      setIsUpdating(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const generateSupplierReport = async () => {
    setIsDownloading(true);
    if (downloadSupplier !== null) {
      try {
        const res = await fetch("/api/supplier/generate-supplier-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ supplierID: downloadSupplierID }),
        });
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Supplier_Report_${downloadSupplier.label}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
        setDownloadSupplier(null);
      } catch (error) {
        isDownloading(false);
        console.log(error);
        toast.error(error.message);
      }
    }
    if(selectStatus !== null){
      try {
        const res = await fetch("/api/supplier/generate-supplier-status-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectStatus.value }),
        });
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Supplier_Report_${selectStatus.value}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
        setSelectStatus(null);
      } catch (error) {
        isDownloading(false);
        console.log(error);
        toast.error(error.message);
      }
    }
  };
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = async () => {
    setIsResetting(true);
    setSearchTerm3("");
    fetchSuppliers();
    setIsResetting(false);
  };
  const handleFilter = async (e) => {
    const filterValue = e.target.value;
    if (filterValue === "Active") {
      const activeSuppliers = productSuppliers.filter(
        (supplier) => supplier.status === "Active"
      );
      setProductSuppliers(activeSuppliers);
    } else if (filterValue === "Deactive") {
      const deactiveSuppliers = productSuppliers.filter(
        (supplier) => supplier.status === "Deactive"
      );
      setProductSuppliers(deactiveSuppliers);
    } else if (filterValue === "all") {
      fetchSuppliers();
    }
  };
  const [selectStatus, setSelectStatus] = useState(null);
  const handleStatusChange = (selectedOption) => {
    setSelectStatus(selectedOption);
  };
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderColor: "#d1d5db",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: "#bfdbfe",
        color: "black",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
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
                      Total Suppliers
                    </h3>
                    <p className="text-2xl">{totalSuppliers}</p>
                  </div>
                  <FaUsers className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  <FaUsers className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  <FaUsers className="bg-red-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                <option value="Active">Active</option>
                <option value="Deactive">Deactive</option>
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
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4 mr-5"
                onClick={() => {
                  setAddSupplierModel(true);
                }}
              >
                Add New Supplier
              </Button>
              <TextInput
                type="text"
                value={searchTerm3}
                onChange={(e) => setSearchTerm3(e.target.value)}
                placeholder="Search by Supplier Name and City"
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                className="ml-4"
                placeholder="Select a Supplier"
                isSearchable
                onChange={handleSupplierChange}
                isClearable
                value={downloadSupplier}
                options={suppliers}
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
                onChange={handleStatusChange}
                value={selectStatus}
                options={["Active", "Deactive"].map((option) => ({
                  value: option,
                  label: option,
                }))}
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
                  (!downloadSupplier && !selectStatus) ||
                  (downloadSupplier && selectStatus)
                }
                onClick={() => generateSupplierReport()}
              >
                {isDownloading ? (
                  <Spinner className="animate-spin" color="white" size="sm" />
                ) : (
                  "Download Supplier Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {productSuppliers.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Supplier</Table.HeadCell>
                  <Table.HeadCell>Supplier Status</Table.HeadCell>
                  <Table.HeadCell>Supplier Email</Table.HeadCell>
                  <Table.HeadCell>Suppliers Phone</Table.HeadCell>
                  <Table.HeadCell>Supplier City</Table.HeadCell>
                  <Table.HeadCell>Products</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displaySuppliers}
              </Table>
            ) : (
              <p>No Suppliers Available</p>
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

          {/** Add Supplier */}
          <Modal
            show={addSupplierModel}
            onClose={() => {
              setAddSupplierModel(false);
              setFormData([]);
            }}
            size="4xl"
          >
            <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Supplier
              </h3>
            </Modal.Header>
            <Modal.Body className="!p-6">
              <form onSubmit={handleSupplierAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName" value="Supplier Name" />
                    <TextInput
                      id="supplierName"
                      type="text"
                      placeholder="Enter supplier name"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierEmail" value="Supplier Email" />
                    <TextInput
                      id="supplierEmail"
                      type="email"
                      placeholder="Enter supplier email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierPhone" value="Supplier Phone" />
                    <TextInput
                      id="supplierPhone"
                      type="tel"
                      placeholder="Enter contact phone"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personIncharge" value="Person In Charge" />
                    <TextInput
                      id="personIncharge"
                      type="text"
                      placeholder="Enter person in charge"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="personInchargeIdentification"
                      value="Identification"
                    />
                    <TextInput
                      id="personInchargeIdentification"
                      type="text"
                      placeholder="Enter ID card number"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierCity" value="City" />
                    <select
                      id="supplierCity"
                      onChange={handleChange}
                      className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select City</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Negombo">Negombo</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="supplierAddress" value="Address" />
                    <TextInput
                      id="supplierAddress"
                      type="text"
                      placeholder="Enter full address"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    color="gray"
                    onClick={() => {
                      setAddSupplierModel(false);
                      setFormData([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button color="blue" type="submit" disabled={isAdding}>
                    {isAdding ? (
                      <>
                        <Spinner size="sm" light={true} />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      "Add Supplier"
                    )}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          {/** Delete Supplier */}
          <Modal
            show={deleteModal}
            onClose={() => {
              setDeleteModal(false), setSelectedSupplier(null);
            }}
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to delete the supplier?
              </h3>
            </Modal.Header>
            <Modal.Footer>
              <Button
                color="gray"
                onClose={() => {
                  setDeleteModal(false), setSelectedSupplier(null);
                }}
              >
                Close
              </Button>
              <Button
                color="failure"
                onClick={() => confirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : (
                  "Delete Supplier"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** View More Supplier */}
          <Modal
            show={viewMoreModal}
            onClose={() => {
              setViewMoreModal(false);
              setSelectedSupplier(null);
            }}
            size="xl"
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Supplier Details
              </h3>
            </Modal.Header>
            <Modal.Body>
              {selectedSupplier && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<User size={20} />}
                      label="Supplier Name"
                      value={selectedSupplier.supplierName}
                    />
                    <InfoItem
                      icon={<User size={20} />}
                      label="Person In-Charge"
                      value={selectedSupplier.personIncharge}
                    />
                    <InfoItem
                      icon={<IdCard size={20} />}
                      label="Identification"
                      value={selectedSupplier.personInchargeIdentification}
                    />
                    <InfoItem
                      icon={<Mail size={20} />}
                      label="Email"
                      value={selectedSupplier.supplierEmail}
                    />
                    <InfoItem
                      icon={<Phone size={20} />}
                      label="Phone"
                      value={selectedSupplier.supplierPhone}
                    />
                    <InfoItem
                      icon={<MapPin size={20} />}
                      label="Address"
                      value={selectedSupplier.supplierAddress}
                    />
                    <InfoItem
                      icon={<Building size={20} />}
                      label="City"
                      value={selectedSupplier.supplierCity}
                    />
                    <InfoItem
                      icon={<CheckCircle size={20} />}
                      label="Status"
                      value={
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedSupplier.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedSupplier.status}
                        </span>
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                      <QrCode className="mr-2" size={20} /> QR Code
                    </h4>
                    {selectedSupplier.supplierQrCode ? (
                      <img
                        src={selectedSupplier.supplierQrCode}
                        alt="Supplier QR Code"
                        className="w-40 h-40 object-contain bg-white p-2 rounded-lg shadow-md"
                      />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No QR Code available
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                      <Package className="mr-2" size={20} /> Products
                    </h4>
                    {selectedSupplier.products &&
                    selectedSupplier.products.length > 0 ? (
                      <ul className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedSupplier.products.map((product, index) => (
                          <li
                            key={index}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ease-in-out"
                          >
                            <p className="text-gray-800 dark:text-gray-200">
                              {product.name}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        No products associated with this supplier.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setViewMoreModal(false);
                  setSelectedSupplier(null);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Update Supplier */}
          <Modal
            show={updateSupplierModal}
            onClose={() => {
              setUpdateSupplierModal(false);
              setFormData([]);
              setSelectedSupplier(null);
            }}
            size="4xl"
          >
            <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Update Supplier
              </h3>
            </Modal.Header>
            <Modal.Body className="!p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" value="Activation Status" />
                  <Select
                    placeholder={selectedSupplier?.status || "Select status"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.value })
                    }
                    options={["Active", "Deactive"].map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    styles={customSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierName" value="Supplier Name" />
                  <TextInput
                    id="supplierName"
                    type="text"
                    placeholder={selectedSupplier?.supplierName}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierEmail" value="Supplier Email" />
                  <TextInput
                    id="supplierEmail"
                    type="email"
                    placeholder={selectedSupplier?.supplierEmail}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierPhone" value="Supplier Phone" />
                  <TextInput
                    id="supplierPhone"
                    type="tel"
                    placeholder={selectedSupplier?.supplierPhone}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personIncharge" value="Person In Charge" />
                  <TextInput
                    id="personIncharge"
                    type="text"
                    placeholder={selectedSupplier?.personIncharge}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="personInchargeIdentification"
                    value="Identification"
                  />
                  <TextInput
                    id="personInchargeIdentification"
                    type="text"
                    placeholder={selectedSupplier?.personInchargeIdentification}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierCity" value="City" />
                  <select
                    id="supplierCity"
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    defaultValue={selectedSupplier?.supplierCity || ""}
                  >
                    <option value="">Select City</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Negombo">Negombo</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="supplierAddress" value="Address" />
                  <TextInput
                    id="supplierAddress"
                    type="text"
                    placeholder={selectedSupplier?.supplierAddress}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-end space-x-2">
              <Button
                color="gray"
                onClick={() => {
                  setUpdateSupplierModal(false);
                  setFormData([]);
                  setSelectedSupplier(null);
                }}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={confirmUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Spinner size="sm" light={true} />
                    <span className="ml-2">Updating...</span>
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
