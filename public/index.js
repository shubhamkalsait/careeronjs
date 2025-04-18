// Function to filter jobs based on search and filter criteria
function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const experienceFilter = document.getElementById('experience').value;
    const typeFilter = document.getElementById('type').value;
    const ageFilter = document.getElementById('age').value;
    const currentDate = new Date();

    const filteredJobs = jobs.filter(job => {
        // Check if job matches search term
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                            job.company.toLowerCase().includes(searchTerm) ||
                            job.description.toLowerCase().includes(searchTerm);

        // Check if job matches experience filter
        const matchesExperience = !experienceFilter || job.experience === experienceFilter;

        // Check if job matches type filter
        const matchesType = !typeFilter || job.type === typeFilter;

        // Check if job matches age filter
        let matchesAge = true;
        if (ageFilter) {
            const jobDate = new Date(job.createdAt);
            const daysDifference = Math.floor((currentDate - jobDate) / (1000 * 60 * 60 * 24));
            matchesAge = daysDifference <= parseInt(ageFilter);
        }

        return matchesSearch && matchesExperience && matchesType && matchesAge;
    });

    displayJobs(filteredJobs);
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Function to display jobs
function displayJobs(jobsToDisplay) {
    jobList.innerHTML = '';
    
    if (jobsToDisplay.length === 0) {
        jobList.innerHTML = '<div class="no-jobs">No jobs found matching your criteria.</div>';
        return;
    }

    jobsToDisplay.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-header">
                <h3>${job.title}</h3>
                <p class="company">${job.company}</p>
                <p class="posted-date">Posted ${formatDate(job.createdAt)}</p>
            </div>
            <div class="job-details">
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> ${job.salary}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Experience:</strong> ${job.experience}</p>
            </div>
            <div class="job-actions">
                <button class="btn btn-primary" onclick="viewJobDetails('${job._id}')">View Details</button>
                ${job.source === 'External' ? `<a href="${job.applyLink}" target="_blank" class="btn btn-success">Apply Now</a>` : ''}
            </div>
        `;
        jobList.appendChild(jobCard);
    });
} 