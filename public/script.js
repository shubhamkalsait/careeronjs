// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const jobsContainer = document.getElementById('jobs-container');
const searchInput = document.querySelector('.search-container input');
const searchButton = document.querySelector('.search-btn');
const categoryCards = document.querySelectorAll('.category-card');

// Fetch and display jobs
async function fetchJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

// Display jobs in the grid
function displayJobs(jobs) {
    jobsContainer.innerHTML = '';
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <h3>${job.title}</h3>
            <p class="company">${job.company}</p>
            <p class="location">${job.location}</p>
            <p class="description">${job.description.substring(0, 150)}...</p>
            <div class="job-details">
                <span class="salary">${job.salary}</span>
                <span class="type">${job.type}</span>
            </div>
            <button class="apply-btn">Apply Now</button>
        `;
        jobsContainer.appendChild(jobCard);
    });
}

// Search functionality
async function searchJobs(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/search?query=${encodeURIComponent(query)}`);
        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error searching jobs:', error);
    }
}

// Category filter
async function filterByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/category/${encodeURIComponent(category)}`);
        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error filtering jobs:', error);
    }
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchJobs(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchJobs(query);
        }
    }
});

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.querySelector('h3').textContent;
        filterByCategory(category);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchJobs();
}); 