// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const elements = {
    jobForm: document.getElementById('jobForm'),
    addJobBtn: document.getElementById('addJobBtn'),
    jobList: document.getElementById('jobList'),
    logoutBtn: document.getElementById('logoutBtn'),
    sourceSelect: document.getElementById('source'),
    applyLinkGroup: document.getElementById('applyLinkGroup'),
    applyLinkInput: document.getElementById('applyLink'),
    jobFormModal: document.getElementById('jobFormModal'),
    closeModal: document.querySelector('.close-modal'),
    modalTitle: document.getElementById('modalTitle'),
    searchInput: document.getElementById('searchInput'),
    filterSelect: document.getElementById('filterSelect')
};

// Add a variable to track the current job being edited
let currentJobId = null;
let jobs = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupEventListeners();
});

function setupEventListeners() {
    // Add Job button
    if (elements.addJobBtn) {
        elements.addJobBtn.addEventListener('click', () => {
            currentJobId = null;
            if (elements.jobForm) elements.jobForm.reset();
            if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Job';
            if (elements.jobFormModal) {
                elements.jobFormModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Close modal button
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', () => {
            if (elements.jobFormModal) {
                elements.jobFormModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Form submission
    if (elements.jobForm) {
        elements.jobForm.addEventListener('submit', handleFormSubmit);
    }

    // Search and filter
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', filterJobs);
    }
    if (elements.filterSelect) {
        elements.filterSelect.addEventListener('change', filterJobs);
    }

    // Handle job source change
    if (elements.sourceSelect && elements.applyLinkGroup) {
        elements.sourceSelect.addEventListener('change', () => {
            if (elements.sourceSelect.value === 'External') {
                elements.applyLinkGroup.style.display = 'block';
                if (elements.applyLinkInput) elements.applyLinkInput.required = true;
            } else {
                elements.applyLinkGroup.style.display = 'none';
                if (elements.applyLinkInput) {
                    elements.applyLinkInput.required = false;
                    elements.applyLinkInput.value = '';
                }
            }
        });
    }

    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/';
        });
    }
}

// Load jobs
async function loadJobs() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
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

        jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        if (elements.jobList) {
            elements.jobList.innerHTML = '<div class="no-jobs">Error loading jobs. Please try again later.</div>';
        }
    }
}

// Display jobs
function displayJobs(jobsToDisplay) {
    if (!elements.jobList) return;
    
    elements.jobList.innerHTML = '';
    
    if (!jobsToDisplay || jobsToDisplay.length === 0) {
        elements.jobList.innerHTML = '<div class="no-jobs">No jobs found.</div>';
        return;
    }

    jobsToDisplay.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-header">
                <h3>${job.title}</h3>
                <p class="company">${job.company}</p>
            </div>
            <div class="job-details">
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> ${job.salary}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Experience:</strong> ${job.experience}</p>
                <p><strong>Status:</strong> ${job.status}</p>
            </div>
            <div class="job-actions">
                <button onclick="editJob('${job._id}')" class="btn btn-primary">Edit</button>
                <button onclick="deleteJob('${job._id}')" class="btn btn-danger">Delete</button>
            </div>
        `;
        elements.jobList.appendChild(jobCard);
    });
}

// Edit job
async function editJob(jobId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
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
        if (elements.jobForm) {
            elements.jobForm.reset();
            elements.jobForm.elements.title.value = job.title;
            elements.jobForm.elements.company.value = job.company;
            elements.jobForm.elements.location.value = job.location;
            elements.jobForm.elements.salary.value = job.salary;
            elements.jobForm.elements.type.value = job.type;
            elements.jobForm.elements.experience.value = job.experience;
            elements.jobForm.elements.education.value = job.education;
            elements.jobForm.elements.source.value = job.source;
            elements.jobForm.elements.status.value = job.status;
            elements.jobForm.elements.description.value = job.description;
            elements.jobForm.elements.requirements.value = job.requirements.join(', ');

            // Handle apply link
            if (job.source === 'External') {
                if (elements.applyLinkGroup) elements.applyLinkGroup.style.display = 'block';
                if (elements.applyLinkInput) {
                    elements.applyLinkInput.required = true;
                    elements.applyLinkInput.value = job.applyLink || '';
                }
            } else {
                if (elements.applyLinkGroup) elements.applyLinkGroup.style.display = 'none';
                if (elements.applyLinkInput) {
                    elements.applyLinkInput.required = false;
                    elements.applyLinkInput.value = '';
                }
            }
        }

        // Set modal title
        if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Job';
        if (elements.jobFormModal) {
            elements.jobFormModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error loading job:', error);
        alert('Failed to load job details');
    }
}

// Delete job
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
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

        // Remove job from local array and update display
        jobs = jobs.filter(job => job._id !== jobId);
        displayJobs(jobs);
        alert('Job deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete job');
    }
}

// Add status change event listener
document.getElementById('status').addEventListener('change', function() {
    this.className = `status-select ${this.value.toLowerCase().replace(' ', '-')}`;
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!elements.jobForm) return;

    const formData = new FormData(elements.jobForm);
    const requirements = formData.get('requirements');
    const description = document.getElementById('description').value;
    
    const jobData = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        salary: formData.get('salary'),
        type: formData.get('type'),
        experience: formData.get('experience'),
        education: formData.get('education'),
        source: formData.get('source'),
        status: formData.get('status'),
        description: description,
        requirements: requirements ? requirements.split(',').map(req => req.trim()).filter(req => req) : []
    };

    // Validate required fields
    if (!jobData.description) {
        alert('Please enter a job description');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const url = currentJobId ? `${API_BASE_URL}/jobs/${currentJobId}` : `${API_BASE_URL}/jobs`;
        const method = currentJobId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
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

        // Close modal and refresh job list
        elements.jobForm.reset();
        if (elements.jobFormModal) {
            elements.jobFormModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        await loadJobs();
        alert(`Job ${currentJobId ? 'updated' : 'added'} successfully`);
    } catch (error) {
        console.error('Error saving job:', error);
        alert(error.message || 'Failed to save job. Please try again.');
    }
}

// Filter jobs based on search and filter criteria
function filterJobs() {
    if (!elements.searchInput || !elements.filterSelect) return;

    const searchTerm = elements.searchInput.value.toLowerCase();
    const filterValue = elements.filterSelect.value;

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                            job.company.toLowerCase().includes(searchTerm) ||
                            job.location.toLowerCase().includes(searchTerm);
        
        const matchesFilter = filterValue === 'all' || job.status === filterValue;
        
        return matchesSearch && matchesFilter;
    });

    displayJobs(filteredJobs);
} 