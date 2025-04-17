// Check authentication
const token = localStorage.getItem('adminToken');
if (!token) {
    window.location.href = '/login.html';
}

// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const jobForm = document.getElementById('jobForm');
const addJobBtn = document.getElementById('addJobBtn');
const jobList = document.getElementById('jobList');
const logoutBtn = document.getElementById('logoutBtn');
const sourceSelect = document.getElementById('source');
const applyLinkGroup = document.getElementById('applyLinkGroup');
const applyLinkInput = document.getElementById('applyLink');

// Add a variable to track the current job being edited
let currentJobId = null;

// Event Listeners
addJobBtn.addEventListener('click', () => {
    currentJobId = null; // Reset the current job ID when adding a new job
    jobForm.reset();
    jobForm.style.display = 'block';
    jobForm.scrollIntoView({ behavior: 'smooth' });
});

// Handle job source change
sourceSelect.addEventListener('change', () => {
    if (sourceSelect.value === 'External') {
        applyLinkGroup.style.display = 'block';
        applyLinkInput.required = true;
    } else {
        applyLinkGroup.style.display = 'none';
        applyLinkInput.required = false;
        applyLinkInput.value = '';
    }
});

// Update the form submission handler
jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert('Session expired. Please login again.');
        window.location.href = '/login.html';
        return;
    }
    
    const jobData = {
        title: document.getElementById('title').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        type: document.getElementById('type').value,
        experience: document.getElementById('experience').value,
        education: document.getElementById('education').value,
        source: document.getElementById('source').value,
        description: document.getElementById('description').value,
        requirements: document.getElementById('requirements').value.split(',').map(skill => skill.trim()),
        applyLink: document.getElementById('applyLink').value,
        status: document.getElementById('status').value
    };

    try {
        const url = currentJobId 
            ? `${API_BASE_URL}/jobs/${currentJobId}`
            : `${API_BASE_URL}/jobs`;
            
        const method = currentJobId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save job');
        }

        jobForm.reset();
        jobForm.style.display = 'none';
        currentJobId = null; // Reset the current job ID
        loadJobs();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred while saving the job');
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login.html';
});

// Load jobs
async function loadJobs() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/jobs?isAdmin=true`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load jobs');
        }

        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobList.innerHTML = '<div class="no-jobs">Error loading jobs. Please try again later.</div>';
    }
}

// Display jobs
function displayJobs(jobs) {
    if (!jobs || jobs.length === 0) {
        jobList.innerHTML = '<div class="no-jobs">No jobs found.</div>';
        return;
    }

    jobList.innerHTML = jobs.map(job => `
        <div class="job-item">
            <div class="job-info">
                <h3>${job.title}</h3>
                <p class="job-company">${job.company}</p>
                <div class="job-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                    <span><i class="fas fa-briefcase"></i> ${job.type}</span>
                    <span><i class="fas fa-money-bill-wave"></i> ${job.salary}</span>
                    <span><i class="fas fa-user-graduate"></i> ${job.experience}</span>
                    <span class="status-chip ${job.status.toLowerCase().replace(' ', '-')}">${job.status}</span>
                </div>
            </div>
            <div class="job-actions">
                <button onclick="editJob('${job._id}')" class="edit-btn">Edit</button>
                <button onclick="deleteJob('${job._id}')" class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

// Edit job
async function editJob(jobId) {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load job details');
        }

        const job = await response.json();
        
        // Store the current job ID
        currentJobId = jobId;
        
        // Populate form with job data
        document.getElementById('title').value = job.title;
        document.getElementById('company').value = job.company;
        document.getElementById('location').value = job.location;
        document.getElementById('salary').value = job.salary;
        document.getElementById('type').value = job.type;
        document.getElementById('experience').value = job.experience;
        document.getElementById('education').value = job.education;
        document.getElementById('source').value = job.source;
        document.getElementById('description').value = job.description;
        document.getElementById('requirements').value = job.requirements.join(', ');
        document.getElementById('status').value = job.status;

        // Handle apply link
        if (job.source === 'External') {
            applyLinkGroup.style.display = 'block';
            applyLinkInput.required = true;
            applyLinkInput.value = job.applyLink || '';
        } else {
            applyLinkGroup.style.display = 'none';
            applyLinkInput.required = false;
            applyLinkInput.value = '';
        }

        jobForm.style.display = 'block';
        jobForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading job:', error);
        alert('Failed to load job details');
    }
}

// Delete job
async function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete job');
            }

            loadJobs();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete job');
        }
    }
}

// Add status change event listener
document.getElementById('status').addEventListener('change', function() {
    this.className = `status-select ${this.value.toLowerCase().replace(' ', '-')}`;
});

// Initialize
loadJobs(); 