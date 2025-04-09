import React, { useState } from "react";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    firstName: "John",
    surname: "Doe",
    email: "johndoe@example.com",
    phone: "+91 9876543210",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // You can add API logic here to save the user data
    setIsEditing(false);
    console.log("User data saved:", user);
  };

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">User Profile</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-2 border rounded-md ${
              isEditing ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"
            } dark:text-white`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Surname</label>
          <input
            type="text"
            name="surname"
            value={user.surname}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-2 border rounded-md ${
              isEditing ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"
            } dark:text-white`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-2 border rounded-md ${
              isEditing ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"
            } dark:text-white`}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-2 border rounded-md ${
              isEditing ? "bg-white dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-700"
            } dark:text-white`}
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            💾 Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            ✏️ Edit Details
          </button>
        )}
        <button
          onClick={() => window.location.href = "/booking-history"}
          className="text-blue-600 hover:underline"
        >
          📋 View Booking History
        </button>
      </div>
    </section>
  );
};

export default UserProfile;
