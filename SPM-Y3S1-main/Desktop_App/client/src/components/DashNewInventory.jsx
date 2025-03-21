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
import {
  Tag,
  DollarSign,
  Package,
  Calendar,
  Hash,
  Image as ImageIcon,
  QrCode,
  Barcode,
  FileText,
} from "lucide-react";

export default function DashNewInventory() {
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

  useEffect(() => {
    fetchSuppliers();
    fetchInventory();
    fetchCategories();
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

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`/api/supplier/get-suppliers`);
      const data = await res.json();

      setSuppliers(
        data.suppliers
          .filter((supplier) => supplier.status.toLowerCase() === "active") // Filter for active suppliers
          .map((supplier) => ({
            value: supplier._id,
            label: supplier.supplierName,
            email: supplier.supplierEmail,
            phone: supplier.supplierPhone,
          }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/productCategory/get-categories`);
      const data = await res.json();
      setCategories(
        data.productCategories
          .filter((category) => category.status.toLowerCase() === "active") // Filter for active categories
          .map((category) => ({
            value: category._id,
            label: category.name,
          }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const renderCell = (item) => {
    const expirationDate = new Date(item.expiaryDate);
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() + 1);

    let className = "";
    if (expirationDate < new Date()) {
      className = "expired";
    } else if (expirationDate < oneMonthBefore) {
      className = "one-month-away";
    }
    // Format the date to show month name, day, and year
    const formattedDate = expirationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", // Use "short" for abbreviated month names (e.g., "Aug")
      day: "numeric",
    });

    return (
      <Table.Cell
        style={{
          backgroundColor:
            className === "expired"
              ? "red"
              : className === "one-month-away"
              ? "yellow"
              : "green",
          color: "black",
        }}
      >
        {formattedDate}
      </Table.Cell>
    );
  };

  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const handViewMore = (item) => {
    setViewModal(true);
    setSelectedItem(item);
  };

  const handleUpdateItem = (item) => {
    setSelectedItem(item);
    setUpdateModal(true);
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const handleDeleteItem = (item) => {
    setDeleteModal(true);
    setItemIdToDelete(item._id);
  };

  const [orderShowModal, setOrderShowModal] = useState(false);
  const [orderSelected, setOrderSelected] = useState(null);
  const handleViewOrderModal = (item) => {
    setOrderShowModal(true);
    setOrderSelected(item);
  };

  const [pageNumber, setPageNumber] = useState(0);
  const productsPerPage = 5;

  const pageCount = Math.ceil(inventory.length / productsPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayProducts = inventory
    .slice(pageNumber * productsPerPage, (pageNumber + 1) * productsPerPage)
    .map((item) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={item._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{item.name}</Table.Cell>
          <Table.Cell>{item.price}</Table.Cell>
          <Table.Cell>{item.supplier.supplierName}</Table.Cell>
          <Table.Cell>{item.category.name}</Table.Cell>
          <Table.Cell>{renderCell(item)}</Table.Cell>
          <Table.Cell>
            <Badge
              color={
                item.quantity > item.itemMinimumQTY
                  ? "success"
                  : item.quantity === 0
                  ? "failure"
                  : "yellow"
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
              {item.quantity > item.itemMinimumQTY ? (
                <>
                  <HiCheckCircle className="text-green-500" size={24} />
                </>
              ) : item.quantity === 0 ? (
                <>
                  <HiXCircle className="text-red-500" size={24} />
                </>
              ) : (
                <>
                  <HiExclamationCircle className="text-yellow-500" size={24} />
                </>
              )}
            </Badge>
          </Table.Cell>

          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button size="sm" color="gray" onClick={() => handViewMore(item)}>
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="blue"
                type="submit"
                outline
                onClick={() => handleUpdateItem(item)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              {(item.quantity === 0 ||
                new Date(item.expiaryDate) < new Date()) && (
                <Button
                  color="yellow"
                  type="submit"
                  outline
                  disabled={item?.isOrder}
                  onClick={() => handleViewOrderModal(item)}
                >
                  <FaCartPlus className="mr-2 h-5 w-5" />
                  Order
                </Button>
              )}
              <Button
                size="sm"
                color="failure"
                onClick={() => handleDeleteItem(item)}
                outline
              >
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

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

  const [supplierId, setSupplierId] = useState("");
  const handleSupplierChange = (selectedOption) => {
    setSupplierName(selectedOption);
    if (selectedOption) {
      setSupplierName(selectedOption);
      setSupplierId(selectedOption.value);
      setFormData({
        ...formData,
        supplier: selectedOption.value,
      });
    }
  };
  const [categoryName, setCategoryName] = useState("");
  const handleCategoryChange = (selectedOption) => {
    setCategoryName(selectedOption);
    if (selectedOption) {
      setFormData({
        ...formData,
        category: selectedOption.value,
      });
    }
  };

  const handleInventoryItemSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch(`/api/inventory/create-inventory-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Item Added Successfully");
        setAddInventoryModel(false);
        setFormData({});
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setCategoryName("");
        setSupplierName("");
        setIsAdding(false);
        fetchInventory();
      } else {
        setIsAdding(false);
        toast.error(data.message);
      }
    } catch (error) {
      setIsAdding(false);
      console.log(error);
    }
    setIsAdding(false);
  };

  const handleInventoryUpdateItem = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch(
        `/api/inventory/update-inventory-item/${selectedItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Item Updated Successfully");
        setUpdateModal(false);
        setFormData({});
        setImageFile(null);
        setImageFileUploadingError(false);
        setFileUploadSuccess(false);
        setFileUploadSuccess(false);
        setImageFileUploadingError(false);
        setImageFileUploadingProgress(false);
        setSelectedItem(null);
        setIsAdding(false);
        setCategoryName("");
        setSupplierName("");
        fetchInventory();
      } else {
        setIsAdding(false);
        toast.error(data.message);
      }
    } catch (error) {
      setSelectedItem(null);
      console.log(error);
    }
    setIsAdding(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/inventory/delete-inventory-item/${itemIdToDelete}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setDeleteModal(false);
        fetchInventory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    }
    setIsDeleting(false);
  };

  const [selectedCriteria, setSelectedCriteria] = useState("");
  const [showSelectedCriteria, setShowSelectedCriteria] = useState("");
  const handleSelectedCriteria = (selectedOption) => {
    setSelectedCriteria(selectedOption);
    setShowSelectedCriteria(selectedOption.label);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    if (selectedCriteria !== null) {
      try {
        const res = await fetch("/api/inventory/download-inventory-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedCriteria: selectedCriteria }),
        });
        if (!res.ok) {
          throw new Error("Failed to generate PD");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Inventory_${showSelectedCriteria}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSelectedCriteria(false);
        setIsDownloading(false);
      } catch (error) {
        setIsDownloading(false);
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const [isOrdering, setIsOrdering] = useState(false);
  const handleOrderRequest = async (e) => {
    e.preventDefault();
    setIsOrdering(true);
    try {
      const res = await fetch("/api/inventory/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: orderSelected._id,
          quantity: formData.itemQuantity,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setOrderShowModal(false);
        setOrderSelected(null);
        setIsOrdering(false);
        setFormData({});
        fetchCategories();
        fetchInventory();
        fetchSuppliers();
      } else {
        toast.error(data.message);
        setOrderSelected(null);
        setIsOrdering(false);
        setFormData({});
      }
    } catch (error) {
      setIsOrdering(false);
      setOrderSelected(null);
      setFormData({});
      console.log(error);
    }
  };
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = async () => {
    setIsLoading(true);
    setIsResetting(true);
    setSearchTerm3("");
    setSelectedCriteria(null);
    setShowSelectedCriteria("");
    fetchSuppliers();
    fetchInventory();
    fetchCategories();
    setIsResetting(false);
    setIsLoading(false);
  };
  const handleFilter = (e) => {
    const filterValue = e.target.value;
    if (filterValue === "outOfStock") {
      const filteredData = inventory.filter((item) => item.quantity === 0);
      setInventory(filteredData);
    } else if (filterValue === "lowStock") {
      const filteredData = inventory.filter(
        (item) => item.quantity < item.itemMinimumQTY
      );
      setInventory(filteredData);
    } else if (filterValue === "inStock") {
      const filteredData = inventory.filter((item) => item.quantity > 0);
      setInventory(filteredData);
    } else if (filterValue === "expireProducts") {
      const filteredData = inventory.filter(
        (item) => new Date(item.expiaryDate) < new Date()
      );
      setInventory(filteredData);
    } else {
      fetchInventory();
    }
  };
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
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
  };
  const resetForm = () => {
    setOrderShowModal(false);
    setFormData({});
    setOrderSelected(null);
  };
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const calculateSalePercentage = () => {
    if (selectedItem?.price && selectedItem?.salePrice) {
      return (
        ((selectedItem.price - selectedItem.salePrice) / selectedItem.price) *
        100
      ).toFixed(2);
    }
    return "N/A";
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
                <option value="outOfStock">Out Of Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="inStock">In Stock</option>
                <option value="expireProducts">Expired</option>
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
                onClick={() => setAddInventoryModel(true)}
              >
                Add New Inventory Item
              </Button>
              <TextInput
                type="text"
                value={searchTerm3}
                onChange={(e) => setSearchTerm3(e.target.value)}
                placeholder="Search by Supplier, Category and Item Name"
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <ReactSelect
                className="ml-4"
                placeholder="Select Criteria"
                options={[
                  { value: "outOfStock", label: "Out Of Stock" },
                  { value: "lowStock", label: "Low Stock" },
                  { value: "inStock", label: "In Stock" },
                  { value: "expireProducts", label: "Expired" },
                ]}
                isSearchable
                isClearable
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
                value={selectedCriteria}
                onChange={handleSelectedCriteria}
              />
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className=" ml-4"
                disabled={!selectedCriteria || isDownloading}
                onClick={handleDownloadReport}
              >
                {isDownloading ? (
                  <Spinner className="animate-spin" color="white" size="sm" />
                ) : (
                  "Download Inventory Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {inventory.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Item Name</Table.HeadCell>
                  <Table.HeadCell>Price</Table.HeadCell>
                  <Table.HeadCell>Suppplier</Table.HeadCell>
                  <Table.HeadCell>Category</Table.HeadCell>
                  <Table.HeadCell>Expire Date</Table.HeadCell>
                  <Table.HeadCell>Stock Level</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayProducts}
              </Table>
            ) : (
              <p>No Products Available</p>
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

          {/** Add Inventory item */}
          <Modal
            show={addInventoryModel}
            onClose={() => {
              setAddInventoryModel(false),
                setFormData({}),
                setImageFile(null),
                setImageFileUploadingError(false),
                setFileUploadSuccess(false),
                setFileUploadSuccess(false),
                setImageFileUploadingError(false),
                setImageFileUploadingProgress(false);
              setCategoryName("");
              setSupplierName("");
            }}
            popup
            size="xlg"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                  Add New Inventory Item
                </h3>
              </div>
              <form onSubmit={handleInventoryItemSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="mb-4">
                    <Label htmlFor="itemName">Item Name</Label>
                    <TextInput
                      type="text"
                      id="name"
                      placeholder="Enter Item Name"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemQuantity">Item Quantity</Label>
                    <TextInput
                      type="number"
                      id="quantity"
                      placeholder="Enter Item Quantity"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemPrice">Item Price</Label>
                    <TextInput
                      type="number"
                      id="price"
                      placeholder="Enter Item price"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemMinValue">Item Minimum Quantity</Label>
                    <TextInput
                      type="number"
                      id="itemMinimumQTY"
                      placeholder="Enter Item Minimum Quantity"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemExpireDate">Item Expire Date</Label>
                    <TextInput
                      type="date"
                      id="expiaryDate"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="batchNo">Batch No</Label>
                    <TextInput
                      type="text"
                      id="batchNumber"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Supplier Name</Label>
                    <ReactSelect
                      options={suppliers}
                      value={supplierName}
                      onChange={handleSupplierChange}
                      id="supplier"
                      required
                      isClearable
                      isSearchable
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Category</Label>
                    <ReactSelect
                      options={categories}
                      value={categoryName}
                      onChange={handleCategoryChange}
                      id="supplier"
                      required
                      isClearable
                      isSearchable
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemDescription">Item Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter Item Description"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemImage">Item Image</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                      className="input-field ml-5"
                    />
                    {imageFileUploadingProgress && (
                      <div className="mt-4">
                        <progress
                          value={imageFileUploadingProgress}
                          max="100"
                        />
                      </div>
                    )}
                    {}
                    {imageFileUploadingError && (
                      <div className="mt-4">
                        <p className="text-red-500">
                          {imageFileUploadingError}
                        </p>
                      </div>
                    )}
                    {fileUploadSuccess && (
                      <div className="mt-4">
                        <p className="text-green-500">{fileUploadSuccess}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    type="submit"
                    gradientDuoTone="pinkToPurple"
                    color="red"
                    outline
                  >
                    {isAdding ? (
                      <Spinner
                        className="animate-spin"
                        color="black"
                        size="sm"
                      />
                    ) : (
                      "Add Item"
                    )}
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => {
                      setAddInventoryModel(false),
                        setFormData({}),
                        setImageFile(null),
                        setImageFileUploadingError(false),
                        setFileUploadSuccess(false),
                        setFileUploadSuccess(false),
                        setImageFileUploadingError(false),
                        setImageFileUploadingProgress(false);
                      setCategoryName("");
                      setSupplierName(" ");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          {/** Item Details Modal */}
          <Modal
            show={viewModal}
            onClose={() => {
              setViewModal(false);
              setSelectedItem(null);
            }}
            size="7xl"
          >
            <Modal.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Item Details
              </h3>
            </Modal.Header>
            <Modal.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoSection
                  icon={<Tag />}
                  label="Item Name"
                  value={selectedItem?.name}
                />
                <InfoSection
                  icon={<Package />}
                  label="Supplier Name"
                  value={selectedItem?.supplier?.supplierName}
                />
                <InfoSection
                  icon={<Package />}
                  label="Supplier Phone"
                  value={selectedItem?.supplier?.supplierPhone}
                />
                <InfoSection
                  icon={<Tag />}
                  label="Category"
                  value={selectedItem?.category?.name}
                />
                <InfoSection
                  icon={<DollarSign />}
                  label="Price"
                  value={`LKR ${selectedItem?.price}`}
                />
                <InfoSection
                  icon={<Tag />}
                  label="Sale Status"
                  value={selectedItem?.isSale ? "On Sale" : "Not on Sale"}
                  valueClassName={
                    selectedItem?.isSale
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                />
                <InfoSection
                  icon={<Tag />}
                  label="Sale Percentage"
                  value={`${calculateSalePercentage()}%`}
                />
                <InfoSection
                  icon={<DollarSign />}
                  label="Sale Price"
                  value={
                    selectedItem?.salePrice
                      ? `LKR ${selectedItem?.salePrice}`
                      : "N/A"
                  }
                />
                <InfoSection
                  icon={<Package />}
                  label="Quantity"
                  value={selectedItem?.quantity}
                />
                <InfoSection
                  icon={<Package />}
                  label="Minimum Quantity"
                  value={selectedItem?.itemMinimumQTY}
                />
                <InfoSection
                  icon={<Calendar />}
                  label="Expiry Date"
                  value={formatDate(selectedItem?.expiaryDate)}
                />
                <InfoSection
                  icon={<Hash />}
                  label="Batch Number"
                  value={selectedItem?.batchNumber}
                />
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <ImageIcon className="mr-2" /> Images and Codes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImageSection
                    label="Product Image"
                    src={selectedItem?.productImage}
                  />
                  <ImageSection
                    label="QR Code"
                    src={selectedItem?.ProductQrCode}
                    icon={<QrCode />}
                  />
                  <ImageSection
                    label="Barcode"
                    src={selectedItem?.productBarcode}
                    icon={<Barcode />}
                  />
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <FileText className="mr-2" /> Description
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedItem?.description}
                </p>
              </div>
            </Modal.Body>
          </Modal>

          {/** Update Inventory Item */}
          <Modal
            show={updateModal}
            onClose={() => {
              setUpdateModal(false),
                setFormData({}),
                setImageFile(null),
                setImageFileUploadingError(false),
                setFileUploadSuccess(false),
                setFileUploadSuccess(false),
                setImageFileUploadingError(false),
                setImageFileUploadingProgress(false);
              setCategoryName("");
              setSupplierName("");
            }}
            popup
            size="xlg"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                  Update Inventory Item
                </h3>
              </div>
              <form onSubmit={handleInventoryUpdateItem}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="mb-4">
                    <Label htmlFor="itemName">Item Name</Label>
                    <TextInput
                      type="text"
                      id="name"
                      placeholder={selectedItem?.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemQuantity">Item Quantity</Label>
                    <TextInput
                      type="number"
                      id="quantity"
                      placeholder={selectedItem?.quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemPrice">Item Price</Label>
                    <TextInput
                      type="number"
                      id="price"
                      placeholder={selectedItem?.price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="isSale">Item Sale:</Label>
                    <select id="isSale" onChange={handleChange}>
                      <option value="false">Select a option</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemPrice">Sale Price:</Label>
                    <TextInput
                      type="number"
                      id="salePrice"
                      placeholder={selectedItem?.salePrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemMinValue">Item Minimum Quantity</Label>
                    <TextInput
                      type="number"
                      id="itemMinimumQTY"
                      placeholder={selectedItem?.itemMinimumQTY}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemExpireDate">Item Expire Date</Label>
                    <TextInput
                      placeholder={selectedItem?.expiaryDate}
                      type="date"
                      id="expiaryDate"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemExpireDate">Batch Number</Label>
                    <TextInput
                      placeholder={selectedItem?.batchNumber}
                      type="text"
                      id="batchNumber"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Supplier Name</Label>
                    <ReactSelect
                      options={suppliers.filter(
                        (supplier) =>
                          supplier.value !== selectedItem?.supplier?._id
                      )}
                      value={supplierName}
                      placeholder={selectedItem?.supplier?.supplierName}
                      onChange={handleSupplierChange}
                      id="supplier"
                      isClearable
                      isSearchable
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemName">Category</Label>
                    <ReactSelect
                      options={categories.filter(
                        (category) =>
                          category.value !== selectedItem?.category?._id
                      )}
                      value={categoryName}
                      placeholder={selectedItem?.category?.name}
                      onChange={handleCategoryChange}
                      id="supplier"
                      isClearable
                      isSearchable
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemDescription">Item Description</Label>
                    <Textarea
                      id="description"
                      placeholder={selectedItem?.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <Label htmlFor="itemImage">Item Image</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="input-field ml-5"
                    />
                    {imageFileUploadingProgress && (
                      <div className="mt-4">
                        <progress
                          value={imageFileUploadingProgress}
                          max="100"
                        />
                      </div>
                    )}
                    {}
                    {imageFileUploadingError && (
                      <div className="mt-4">
                        <p className="text-red-500">
                          {imageFileUploadingError}
                        </p>
                      </div>
                    )}
                    {fileUploadSuccess && (
                      <div className="mt-4">
                        <p className="text-green-500">{fileUploadSuccess}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    type="submit"
                    gradientDuoTone="pinkToPurple"
                    color="red"
                    outline
                  >
                    {isAdding ? (
                      <Spinner
                        className="animate-spin"
                        color="black"
                        size="sm"
                      />
                    ) : (
                      "Update Item"
                    )}
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => {
                      setUpdateModal(false),
                        setFormData({}),
                        setImageFile(null),
                        setImageFileUploadingError(false),
                        setFileUploadSuccess(false),
                        setFileUploadSuccess(false),
                        setImageFileUploadingError(false),
                        setImageFileUploadingProgress(false);
                      setCategoryName("");
                      setSupplierName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          {/** Delete Inventory Item Modal */}
          <Modal show={deleteModal} onClose={() => setDeleteModal(false)}>
            <Modal.Header>
              <h3 className="text-xl font-semibold">
                Are you sure you want to delete the product?
              </h3>
            </Modal.Header>
            <Modal.Footer>
              <Button color="gray" onClick={() => setDeleteModal(false)}>
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
                  "Delete Item"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Order Inventory Item Modal */}
          <Modal show={orderShowModal} onClose={resetForm} size="xl">
            <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Inventory Item
              </h3>
            </Modal.Header>
            <Modal.Body className="!p-6">
              <form onSubmit={handleOrderRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="itemName" value="Item Name" />
                    <TextInput
                      id="itemName"
                      type="text"
                      value={orderSelected?.name}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier" value="Supplier Name" />
                    <TextInput
                      id="supplier"
                      readOnly
                      isDisabled
                      placeholder={orderSelected?.supplier?.supplierName}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierEmail" value="Supplier Email" />
                    <TextInput
                      id="supplierEmail"
                      type="email"
                      value={orderSelected?.supplier?.supplierEmail}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="supplierPhone"
                      value="Supplier Phone Number"
                    />
                    <TextInput
                      id="supplierPhone"
                      type="tel"
                      value={orderSelected?.supplier?.supplierPhone}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="itemQuantity" value="Order Quantity" />
                    <TextInput
                      id="itemQuantity"
                      type="number"
                      min="100"
                      placeholder="Enter order quantity"
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button color="gray" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    gradientDuoTone="cyanToBlue"
                    disabled={isOrdering}
                  >
                    {isOrdering ? (
                      <>
                        <Spinner size="sm" light={true} />
                        <span className="ml-2">Ordering...</span>
                      </>
                    ) : (
                      "Place Order"
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

const InfoSection = ({
  icon,
  label,
  value,
  valueClassName = "text-gray-900 dark:text-gray-100 font-medium",
}) => (
  <div className="flex items-start">
    <div className="text-gray-500 dark:text-gray-400 mr-3 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  </div>
);

const ImageSection = ({ label, src, icon }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </p>
    <img
      src={src}
      alt={label}
      className="w-full h-48 object-contain bg-white dark:bg-gray-800 rounded"
    />
  </div>
);
