import React from "react";
const dummyRooms = [
  {
    id: 1,
    type: "Standard Room",
    price: 1200,
    capacity: 2,
    description: "Comfortable and cozy room with basic amenities.",
  },
  {
    id: 2,
    type: "Deluxe Room",
    price: 1800,
    capacity: 3,
    description: "Spacious room with premium facilities and view.",
  },
  {
    id: 3,
    type: "Suite",
    price: 2500,
    capacity: 4,
    description: "Luxurious suite with living space and top-tier amenities.",
  },
];

const AvailableRooms = () => {
  const handleBook = (roomId) => {
    // Replace this with actual booking logic or navigation
    alert(`Booking initiated for Room ID: ${roomId}`);
  };
// After successful form submission in RoomAvailability.jsx
  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">Available Rooms</h2>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {dummyRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{room.type}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Capacity: {room.capacity} guests
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {room.description}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{room.price}/night
              </span>
              <button
                onClick={() => handleBook(room.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableRooms;
