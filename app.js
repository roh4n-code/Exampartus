// Declare coursesData as a global variable
let coursesData = [];

// DOM Manipulation Functions
function createCourseTile(course) {
    return `
        <div class="course-tile" data-id="${course.id}">
            <div class="course-id">${course.id}</div>
            <div class="course-title">${course.title}</div>
        </div>
    `;
}

// Fetch course data from JSON
async function fetchCourseData() {
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) {
            throw new Error('Failed to fetch course data');
        }
        coursesData = await response.json();
        return coursesData;
    } catch (error) {
        console.error('Error fetching course data:', error);
        return [];
    }
}

// Initialize Page
async function initializeHomePage() {
    const coursesGrid = document.querySelector('.courses-grid');
    
    if (coursesGrid) {
        // Show loading state
        coursesGrid.innerHTML = '<div class="loading">Loading courses...</div>';
        
        // Fetch course data
        try {
            await fetchCourseData();
            
            if (coursesData.length > 0) {
                coursesGrid.innerHTML = coursesData.map(createCourseTile).join('');
                
                // Add event listeners to course tiles
                attachCourseClickListeners();
            } else {
                coursesGrid.innerHTML = '<div class="no-results">No courses available.</div>';
            }
        } catch (error) {
            coursesGrid.innerHTML = '<div class="error">Failed to load courses. Please try again later.</div>';
            console.error('Error in initializing home page:', error);
        }
    }
}

// Expandable Search Functionality
function setupExpandableSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');
    const searchInput = searchBar?.querySelector('input');
    const searchButton = searchBar?.querySelector('button:last-child');
    
    if (searchToggle && searchBar) {
        // Open search bar
        searchToggle.addEventListener('click', function() {
            searchBar.classList.add('active');
            // Focus the input after the animation completes
            setTimeout(() => {
                searchInput?.focus();
            }, 300);
        });
        
        // Close search bar when clicking the close button
        searchClose?.addEventListener('click', function() {
            searchBar.classList.remove('active');
            searchInput.value = ''; // Clear the input
            resetSearchResults();
        });
        
        // Close search bar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = searchBar.contains(event.target) || searchToggle.contains(event.target);
            
            if (!isClickInside && searchBar.classList.contains('active')) {
                searchBar.classList.remove('active');
                if (searchInput.value === '') {
                    resetSearchResults();
                }
            }
        });
        
        // Handle search input
        searchInput?.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            const coursesGrid = document.querySelector('.courses-grid');
            
            if (searchTerm === '') {
                resetSearchResults();
            } else {
                const filteredCourses = coursesData.filter(course => 
                    course.id.toLowerCase().includes(searchTerm) || 
                    course.title.toLowerCase().includes(searchTerm)
                );
                
                coursesGrid.innerHTML = filteredCourses.length > 0 
                    ? filteredCourses.map(createCourseTile).join('') 
                    : '<div class="no-results">No courses found</div>';
                
                // Reattach event listeners
                attachCourseClickListeners();
            }
        });
        
        // Handle search button click
        searchButton?.addEventListener('click', function() {
            performSearch();
        });
        
        // Handle Enter key in search input
        searchInput?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput?.value.trim().toLowerCase();
    const coursesGrid = document.querySelector('.courses-grid');
    
    if (!searchTerm) {
        resetSearchResults();
        return;
    }
    
    const filteredCourses = coursesData.filter(course => 
        course.id.toLowerCase().includes(searchTerm) || 
        course.title.toLowerCase().includes(searchTerm)
    );
    
    coursesGrid.innerHTML = filteredCourses.length > 0 
        ? filteredCourses.map(createCourseTile).join('') 
        : '<div class="no-results">No courses found</div>';
    
    // Reattach event listeners
    attachCourseClickListeners();
    
    // Add visual feedback to show search was performed
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.add('searched');
    setTimeout(() => {
        searchBar.classList.remove('searched');
    }, 300);
}

function resetSearchResults() {
    const coursesGrid = document.querySelector('.courses-grid');
    coursesGrid.innerHTML = coursesData.map(createCourseTile).join('');
    attachCourseClickListeners();
}

function attachCourseClickListeners() {
    document.querySelectorAll('.course-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            const courseId = this.getAttribute('data-id');
            // Navigate to course detail page with course ID as parameter
            window.location.href = `course-detail.html?courseId=${courseId}`;
        });
    });
}

// Profile Menu Functionality
function setupProfileMenu() {
    const profileButton = document.getElementById('profileButton');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileButton && profileMenu) {
        // Toggle menu on button click
        profileButton.addEventListener('click', function(event) {
            event.stopPropagation();
            profileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
                profileMenu.classList.remove('active');
            }
        });
        
        // Handle menu item clicks
        profileMenu.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                console.log(`Clicked: ${this.textContent.trim()}`);
                profileMenu.classList.remove('active');
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
    setupExpandableSearch();
    setupProfileMenu();
});