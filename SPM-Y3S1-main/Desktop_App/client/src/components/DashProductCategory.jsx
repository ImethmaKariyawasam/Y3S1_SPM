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
  HiOutlinePlusCircle,
  HiOutlineStar,
  HiOutlinePencil,
} from "react-icons/hi";
import { FaBox } from "react-icons/fa";
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
import { set } from "mongoose";
import { FileText, CheckCircle, Package } from "lucide-react";
export default function DashProductCategory() {
  const [productCategories, setProductCategories] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState([]);
  const [totalCategories, setTotalCatgories] = useState(null);
  const [updateModel, setUpdateModal] = useState(false);
  const [updateCategory, setUpdateCategory] = useState(null);
  const [promotionShowModal, setPromotionShowModal] = useState(false);
  const [totalInactiveCategories, setTotalInactiveCategories] = useState(null);
  const [totalActiveCategories, setTotalActiveCategories] = useState(null);
  const [totalPromotions, setTotalPromotions] = useState(null);
  const [totalNoPromotions, setTotalNoPromotions] = useState(null);
  const [searchTerm3, setSearchTerm3] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [downloadCategory, setDownloadCategory] = useState([]);
  const [downloadCategoryID, setDownloadCategoryID] = useState(null);
  useEffect(() => {
    fetchProductCategories();
  }, [searchTerm3]);
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
  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <HiCheckCircle className="text-green-500" />;
      case "Deactive":
        return <HiXCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusPromotionIcon = (status) => {
    switch (status) {
      case true:
        return <HiCheckCircle className="text-green-500" />;
      case false:
        return <HiXCircle className="text-red-500" />;
      default:
        return null;
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

  const getStatusPromotionText = (status) => {
    switch (status) {
      case true:
        return "Promotions Available";
      case false:
        return "No Promotions";
      default:
        return status;
    }
  };

  const viewCategoryDescription = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const viewPromotionDescription = (category) => {
    setSelectedCategory(category);
    setPromotionShowModal(true);
  };

  const handleDeleteCategory = async (category) => {
    if (category.products.length > 0) {
      toast.error("Category has products, cannot delete");
      return;
    } else {
      setSelectedCategory(category);
      setDeleteModal(true);
    }
  };
  const [pageNumber, setPageNumber] = useState(0);
  const categoriesPerPage = 5;

  const pageCount = Math.ceil(productCategories.length / categoriesPerPage);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const displayCategories = productCategories
    .slice(pageNumber * categoriesPerPage, (pageNumber + 1) * categoriesPerPage)
    .map((category) => (
      <Table.Body className="divide-y">
        <Table.Row
          key={category._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell>{category.name}</Table.Cell>
          <Table.Cell>
            <Badge
              color={
                category.status === "Active"
                  ? "success"
                  : category.status === "Deactive"
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
              {getStatusIcon(category.status)}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <Badge
              color={
                category.isPromotions
                  ? "success"
                  : !category.isPromotions
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
              {getStatusPromotionIcon(category.isPromotions)}
            </Badge>
          </Table.Cell>
          <Table.Cell>
            <Button
              size="sm"
              color="gray"
              disabled={!category.isPromotions}
              onClick={() => viewPromotionDescription(category)}
            >
              <HiEye className="mr-2 h-5 w-5" />
              View
            </Button>
          </Table.Cell>
          <Table.Cell>
            <Button color="blue" type="submit" outline disabled>
              <FaBox className="mr-2 h-5 w-5" />
              {category.products.length}
            </Button>
          </Table.Cell>
          <Table.Cell>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                color="gray"
                onClick={() => viewCategoryDescription(category)}
              >
                <HiEye className="mr-2 h-5 w-5" />
                View
              </Button>
              <Button
                color="blue"
                type="submit"
                outline
                onClick={() => handleUpdateCategory(category)}
              >
                <FaClipboardList className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button
                size="sm"
                color="failure"
                disabled={isDeleting}
                onClick={() => handleDeleteCategory(category)}
              >
                <HiOutlineX className="mr-2 h-5 w-5" />
                Delete
              </Button>
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    ));

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/productCategory/delete-category/${selectedCategory._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      fetchProductCategories();
      setIsDeleting(false);
      setDeleteModal(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setIsDeleting(false);
    }
  };

  const AddCategory = async () => {
    setIsAdding(true);
    if (!formData.name || !formData.status || !formData.description) {
      toast.error("Please fill all the fields");
      setIsAdding(false);
      return;
    }
    if (formData.name.length < 3) {
      toast.error("Category name should be atleast 3 characters");
      setIsAdding(false);
      return;
    }
    try {
      const response = await fetch("/api/productCategory/publish-category", {
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
      toast.success("Category Added Successfully");
      fetchProductCategories();
      setFormData([]);
      setIsAdding(false);
      setAddModal(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setAddModal(false);
      setFormData([]);
      setIsAdding(false);
    }
  };

  const handleUpdateCategory = (category) => {
    setUpdateModal(true);
    setUpdateCategory(category);
  };

  const handleUpdateCategorySubmit = async (e) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/productCategory/update-category/${updateCategory._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setUpdateCategory(null);
        throw new Error(data.message);
      }
      toast.success("Category Updated Successfully");
      fetchProductCategories();
      setUpdateCategory(null);
      setUpdateModal(false);
      setFormData([]);
      setIsUpdating(false);
    } catch (error) {
      setIsUpdating(false);
      setUpdateCategory(null);
      toast.error(error.message);
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setDownloadCategory(selectedOption);
    setDownloadCategoryID(selectedOption?.value);
  };

  const [promotionStatus, setPromotionStatus] = useState(null);
  const handlePromotionStatus = (status) => {
    setPromotionStatus(status);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadCategoryReport = async () => {
    setIsDownloading(true);
    if (downloadCategory !== null) {
      try {
        const res = await fetch(
          `/api/productCategory/download-category/${downloadCategoryID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ categoryID: downloadCategoryID }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Category-${downloadCategory.label}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsDownloading(false);
        setDownloadCategory(null);
      } catch (error) {
        setIsDownloading(false);
        setDownloadCategory(null);
        toast.error(error.message);
        console.log(error);
      }
    }

    if (promotionStatus !== null) {
      try {
        const res = await fetch(`/api/productCategory/download-promo-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promoStatus: promotionStatus.value }),
        });
        if (!res.ok) {
          throw new Error("Failed to generate PDF");
        }
        const pdfBlob = await res.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `Category.pdf`;
        document.body.appendChild(a);
        a.click();
        setIsDownloading(false);
        document.body.removeChild(a);
        setPromotionStatus(null);
      } catch (error) {
        setIsDownloading(false);
        setPromotionStatus(null);
        console.log(error);
      }
    }
  };
  const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start mb-4">
      <div className="text-blue-500 mr-3 mt-1">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div className="font-medium text-gray-900 dark:text-white">{value}</div>
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
                      Total Categories
                    </h3>
                    <p className="text-2xl">{totalCategories}</p>
                  </div>
                  <HiOutlineTag className="bg-yellow-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  <HiOutlineTag className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
              </div>
              <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                <div className="flex justify-between">
                  <div className="">
                    <h3 className="text-gray-500 text-md uppercase">
                      DeActivated Categories
                    </h3>
                    <p className="text-2xl">{totalInactiveCategories}</p>
                  </div>
                  <HiOutlineTag className="bg-red-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  <HiOutlineTag className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
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
                  <HiOutlineTag className="bg-green-500 text-white rounded-full text-5xl p-3 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className=" flex items-center mb-2">
              <Button
                outline
                gradientDuoTone="greenToBlue"
                className="ml-4 mr-5"
                onClick={() => {
                  setAddModal(true);
                }}
              >
                Add New Category
              </Button>
              <TextInput
                type="text"
                value={searchTerm3}
                onChange={(e) => setSearchTerm3(e.target.value)}
                placeholder="Search by Category Name"
                rightIcon={AiOutlineSearch}
                className="ml-1 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb"
              />
              <Select
                className="ml-4"
                placeholder="Select a category"
                isSearchable
                onChange={handleCategoryChange}
                isClearable
                value={downloadCategory}
                options={categories}
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
                placeholder="Select Promotion Status"
                isSearchable
                onChange={handlePromotionStatus}
                isClearable
                value={promotionStatus}
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
                  (!downloadCategoryID && !promotionStatus) ||
                  (promotionStatus && downloadCategoryID) ||
                  isDownloading
                }
                onClick={handleDownloadCategoryReport}
              >
                {isDownloading ? (
                  <Spinner className="animate-spin" color="white" size="sm" />
                ) : (
                  "Download Category Report"
                )}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {productCategories.length > 0 ? (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Category</Table.HeadCell>
                  <Table.HeadCell>Category Status</Table.HeadCell>
                  <Table.HeadCell>Promotion Status</Table.HeadCell>
                  <Table.HeadCell>Promotions</Table.HeadCell>
                  <Table.HeadCell>Number of Products</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {displayCategories}
              </Table>
            ) : (
              <p>No Categories Available</p>
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

          {/** Category Modal */}
          <Modal show={showModal} onClose={() => {setShowModal(false),setSelectedCategory(null)}} size="xl">
            <Modal.Header>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Category Description
              </h3>
            </Modal.Header>
            <Modal.Body>
              {selectedCategory && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <InfoItem
                      icon={<FileText size={20} />}
                      label="Description"
                      value={selectedCategory.description}
                    />
                    <InfoItem
                      icon={<CheckCircle size={20} />}
                      label="Status"
                      value={
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCategory.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedCategory.status}
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                      <Package className="mr-2" size={20} /> Products
                    </h4>
                    {selectedCategory.products &&
                    selectedCategory.products.length > 0 ? (
                      <ul className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedCategory.products.map((product, index) => (
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
                        No products associated with this Category.
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
                  setShowModal(false);
                  setSelectedCategory(null);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Promotion Modal */}
          <Modal
            show={promotionShowModal}
            onClose={() => setPromotionShowModal(false)}
            size="xl"
          >
            <Modal.Header>Promotion Description</Modal.Header>
            <Modal.Body>
              {selectedCategory && (
                <div>
                  <p>
                    <strong>Description: </strong>{" "}
                    {selectedCategory.description}
                  </p>
                  <p>
                    <strong>Status: </strong>
                    {selectedCategory.status}
                  </p>
                  <p>
                    <strong>Promotional Description: </strong>
                    {selectedCategory.promotions}
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                color="gray"
                onClick={() => {
                  setPromotionShowModal(false);
                  setSelectedCategory(null);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Delete Modal */}
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
                  "Delete Category"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Add Modal */}
          <Modal
            show={addModal}
            onClose={() => {
              setAddModal(false);
              setFormData([]);
            }}
            className="dark:bg-gray-800"
          >
            <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <HiOutlinePlusCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Category
                </h3>
              </div>
            </Modal.Header>
            <Modal.Body className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Category Name
                  </Label>
                  <TextInput
                    id="name"
                    type="text"
                    placeholder="Enter category name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full"
                    icon={HiOutlinePlusCircle}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Status
                  </Label>
                  <Select
                    id="status"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Deactive", label: "Deactive" },
                    ]}
                    placeholder="Select status"
                    onChange={(selectedOption) =>
                      setFormData({ ...formData, status: selectedOption.value })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a detailed description of the category"
                    rows={4}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button
                color="gray"
                onClick={() => {
                  setAddModal(false);
                  setFormData([]);
                }}
              >
                Cancel
              </Button>
              <Button color="success" onClick={AddCategory} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Category"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/** Update Modal */}
          <Modal
            show={updateModel}
            onClose={() => {
              setUpdateModal(false);
              setFormData([]);
              setUpdateCategory(null);
            }}
            className="dark:bg-gray-800"
          >
            <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <HiOutlinePencil className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Update Category
                </h3>
              </div>
            </Modal.Header>

            <Modal.Body className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Category Name
                  </Label>
                  <TextInput
                    id="name"
                    type="text"
                    placeholder={updateCategory?.name}
                    disabled
                    icon={HiOutlineTag}
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Status
                  </Label>
                  <Select
                    id="status"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Deactive", label: "Deactive" },
                    ]}
                    placeholder={updateCategory?.status}
                    onChange={(selectedOption) =>
                      setFormData({
                        ...formData,
                        status: selectedOption.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={updateCategory?.description}
                    rows={3}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label
                    htmlFor="promotionalStatus"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"
                  >
                    <HiOutlineStar className="w-4 h-4 mr-1 text-yellow-500" />
                    Promotional Status
                  </Label>
                  <Select
                    id="promotionalStatus"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Deactive", label: "Deactive" },
                    ]}
                    placeholder={
                      updateCategory?.isPromotions ? "Active" : "Deactive"
                    }
                    onChange={(selectedOption) =>
                      setFormData({
                        ...formData,
                        isPromotions: selectedOption.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label
                    htmlFor="promotions"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Promotion Details
                  </Label>
                  <Textarea
                    id="promotions"
                    placeholder={
                      updateCategory?.promotions || "Enter promotion details"
                    }
                    rows={3}
                    onChange={(e) =>
                      setFormData({ ...formData, promotions: e.target.value })
                    }
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button
                color="gray"
                onClick={() => {
                  setUpdateModal(false);
                  setFormData([]);
                  setUpdateCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                color="info"
                onClick={handleUpdateCategorySubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
