import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user.isAvatarImageSet || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };
    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => setFrequency(e.target.value);
  const handleSetType = (e) => setType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, amount, description, category, date, transactionType } =
      values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }
    setLoading(true);

    const { data } = await axios.post(addTransaction, {
      ...values,
      userId: cUser._id,
    });

    if (data.success) {
      toast.success(data.message, toastOptions);
      handleClose();
      setRefresh(!refresh);
    } else {
      toast.error(data.message, toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });
        setTransactions(data.transactions);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    if (cUser) fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  return (
    <>
      <Header />

      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-7xl mx-auto mt-6 px-4">
          {/* Filters Row */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-900 text-white p-4 rounded-lg">
            {/* Frequency */}
            <div>
              <label className="block mb-1 text-sm font-semibold">
                Select Frequency
              </label>
              <select
                name="frequency"
                value={frequency}
                onChange={handleChangeFrequency}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700"
              >
                <option value="7">Last Week</option>
                <option value="30">Last Month</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block mb-1 text-sm font-semibold">Type</label>
              <select
                name="type"
                value={type}
                onChange={handleSetType}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700"
              >
                <option value="all">All</option>
                <option value="expense">Expense</option>
                <option value="credit">Earned</option>
              </select>
            </div>

            {/* Icons */}
            <div className="flex gap-3">
              <FormatListBulletedIcon
                className={`cursor-pointer ${
                  view === "table" ? "text-yellow-400" : "text-gray-400"
                }`}
                onClick={() => setView("table")}
              />
              <BarChartIcon
                className={`cursor-pointer ${
                  view === "chart" ? "text-yellow-400" : "text-gray-400"
                }`}
                onClick={() => setView("chart")}
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleShow}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
            >
              Add New
            </button>
          </div>

          {/* Custom Date */}
          {frequency === "custom" && (
            <div className="flex gap-4 mt-4">
              <div>
                <label className="block mb-1 text-white">Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartChange}
                  className="p-2 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-white">End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndChange}
                  className="p-2 rounded"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={handleReset}
              className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
            >
              Reset Filter
            </button>
          </div>

          {/* Data Section */}
          <div className="mt-6">
            {view === "table" ? (
              <TableData data={transactions} user={cUser} />
            ) : (
              <Analytics transactions={transactions} user={cUser} />
            )}
          </div>

          <ToastContainer />

          {/* Modal */}
          {show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">
                  Add Transaction Details
                </h2>
                <form className="space-y-4">
                  <input
                    name="title"
                    type="text"
                    placeholder="Enter Transaction Name"
                    value={values.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={values.amount}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Choose Category...</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Tip">Tip</option>
                    <option value="Food">Food</option>
                    <option value="Medical">Medical</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter Description"
                    value={values.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="transactionType"
                    value={values.transactionType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Choose Transaction Type...</option>
                    <option value="credit">Credit</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input
                    type="date"
                    name="date"
                    value={values.date}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </form>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-400 rounded text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 rounded text-white"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
