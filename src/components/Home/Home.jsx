import React from "react";
import { Link } from "react-router-dom";
export default function Home() {
    return (
        <div className="grid grid-cols-2 mx-auto w-full max-w-7xl">
            <aside className="overflow-hidden flex flex-col text-black rounded-lg sm:mx-16 mx-2 sm:py-16 w-full">
                <div className="relative inset-0 w-full mb-7 sm:pt-1 h-full  object-contain">
                    <img className="w-96" src="https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?cs=srgb&dl=dug-out-pool-hotel-pool-1134176.jpg&fm=jpg" alt="image1" />
                    <Link className="absolute bottom-0 right-1/2" to={"room-availability"}>
                        <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Room Availability
                        <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                        </button>
                    </Link>
                </div>
                <div className="inset-0 sm:my-auto sm:pt-1 h-full w-full">
                        <img className="w-96" src="https://www.travelandleisure.com/thmb/dCdmLM8F-F6b_pIdOY65aPcyjTw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/mulia-resort-pool-bali-indonesia-POOLVIEW0318-8c15c2eeeb86422aae18c7ddaa82640c.jpg" alt="image1" />
                </div>
            </aside>
            <main>

            </main>
        </div>
    );
}


