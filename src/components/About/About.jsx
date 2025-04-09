import React from "react";
function About() {
    return(
        <section className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-screen-md mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">About Our Hotel Booking App</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
            This project is a modern and responsive hotel booking platform built with React and Tailwind CSS. It allows users to easily sign up, log in, and check room availability in real-time.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
            With a strong focus on user privacy and seamless experience, the app includes secure authentication, a transparent privacy policy, and clear terms & conditions. Users can explore available rooms, make bookings, and manage their reservations effortlessly.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
            Whether you're a frequent traveler or planning your first trip, our platform is designed to make hotel booking simple, fast, and secure.
            </p>
        </div>
        </section>

    )
}
export default About