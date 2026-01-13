// frontend/src/pages/HomePage.jsx (Updated)

import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import SearchForm from '../components/SearchForm';
import HotelList from '../components/HotelList'; 

const ALL_HOTELS_URL = '/api/hotels/'; 
const SEARCH_URL = '/api/hotels/search/'; 

function HomePage() {
    // searchResults will now hold either available rooms (after search) or all hotels (on load)
    const [results, setResults] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false); // New state to track if a search happened

    // --- EFFECT: Fetch all hotels on initial component mount ---
    useEffect(() => {
        const fetchAllHotels = async () => {
            setLoading(true);
            try {
                // Fetch the list of ALL hotels from /api/hotels/
                const response = await axios.get(ALL_HOTELS_URL);
                setResults(response.data);
            } catch (error) {
                console.error("Failed to fetch initial hotels:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!searchPerformed) {
            fetchAllHotels();
        }
    }, [searchPerformed]); // Runs only on mount or when searchPerformed changes

    const handleSearch = async (formData) => {
        setLoading(true);
        setSearchPerformed(true); // Mark that a search has been initiated
        try {
            // Note: The search endpoint currently returns AVAILABLE ROOMS
            const response = await axios.get(SEARCH_URL, {
                params: formData 
            });
            // We set the results to the list of available ROOMS returned by the search endpoint
            setResults(response.data); 
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const title = searchPerformed 
        ? 'Search Results' 
        : 'Explore All Available Hotels';


    return (
        <div style={styles.pageContainer}>
            {/* The SearchForm is now separate from the title */}
            <SearchForm onSearch={handleSearch} />
            
            <h1 style={styles.mainHeader}>{title}</h1>

            {loading && <p style={styles.message}>Loading data...</p>}
            
            {!loading && results.length === 0 && (
                <p style={styles.message}>
                    {searchPerformed 
                        ? "No rooms found matching your dates and criteria."
                        : "No hotels found in the database."}
                </p>
            )}

            <HotelList 
                hotels={results} 
                isSearchResult={searchPerformed} // Pass a prop to HotelList to change rendering style
            />
        </div>
    );
}

export default HomePage;

// ... (Add the new styles object)
const styles = {
    pageContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 0',
    },
    mainHeader: {
        textAlign: 'center',
        color: '#003366',
        margin: '40px 0 20px 0',
        borderBottom: '2px solid #ff6600',
        paddingBottom: '10px'
    },
    message: {
        textAlign: 'center',
        color: '#555',
        fontSize: '1.1em',
        padding: '20px',
    }
};