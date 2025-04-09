import React from "react";

const BookingHistory = () => {
  // Sample booking data
  const bookings = [
    {
      id: 1,
      hotel: "Grand Palace Hotel",
      roomType: "Deluxe Room",
      checkIn: "2025-04-10",
      checkOut: "2025-04-14",
      status: "Confirmed",
    },
    {
      id: 2,
      hotel: "Ocean View Resort",
      roomType: "Sea Facing Suite",
      checkIn: "2025-03-20",
      checkOut: "2025-03-22",
      status: "Completed",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto p-6 mt-10 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Booking History</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2">Hotel</th>
                <th className="px-4 py-2">Room Type</th>
                <th className="px-4 py-2">Check-In</th>
                <th className="px-4 py-2">Check-Out</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{booking.hotel}</td>
                  <td className="px-4 py-2">{booking.roomType}</td>
                  <td className="px-4 py-2">{booking.checkIn}</td>
                  <td className="px-4 py-2">{booking.checkOut}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        booking.status === "Confirmed"
                          ? "bg-blue-500"
                          : booking.status === "Completed"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default BookingHistory;
