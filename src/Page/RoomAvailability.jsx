import React, { useState } from "react";

const RoomAvailability = () => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomType: "standard",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate checking availability (you can replace with API call)
    console.log("Checking availability with:", formData);
    alert("Checking room availability...");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-black shadow-md rounded-lg mt-10 dark:bg-white dark:text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">Check Room Availability</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Check-in Date</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-white dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Check-out Date</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-white dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Number of Guests</label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            min={1}
            max={10}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-white dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Room Type</label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-white dark:border-gray-600"
          >
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-black font-semibold py-2 px-4 rounded-md"
        >
          Check Availability
        </button>
      </form>
    </div>
  );
};

export default RoomAvailability;
