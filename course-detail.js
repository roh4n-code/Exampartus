// Helper function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Create lecture tile HTML
function createLectureTile(lecture) {
    return `
        <div class="lecture-tile" data-id="${lecture.id}" data-link="${lecture.onedriveLink || ''}">
            <div class="lecture-number">Lecture ${lecture.id}</div>
            <div class="lecture-title">${lecture.title}</div>
            <div class="lecture-meta">
                <div class="lecture-date">${lecture.date}</div>
                <div class="lecture-instructor">${lecture.instructor}</div>
                ${lecture.section ? `<div class="lecture-section">Section ${lecture.section}</div>` : ''}
            </div>
        </div>
    `;
}

// Sort lectures based on the selected option
function sortLectures(lectures, sortOption) {
    // Create a copy of the lectures array to avoid modifying the original
    const sortedLectures = [...lectures];
    
    switch(sortOption) {
        case 'asc':
            // Sort by lecture number ascending
            sortedLectures.sort((a, b) => a.id - b.id);
            break;
        case 'desc':
            // Sort by lecture number descending
            sortedLectures.sort((a, b) => b.id - a.id);
            break;
        case 'date-new':
            // Sort by date, newest first
            sortedLectures.sort((a, b) => new Date(b.dateObj) - new Date(a.dateObj));
            break;
        case 'date-old':
            // Sort by date, oldest first
            sortedLectures.sort((a, b) => new Date(a.dateObj) - new Date(b.dateObj));
            break;
        default:
            // Default to lecture number ascending
            sortedLectures.sort((a, b) => a.id - b.id);
    }
    
    return sortedLectures;
}

// Fetch course data from JSON
async function fetchCourseData() {
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) {
            throw new Error('Failed to fetch course data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching course data:', error);
        return [];
    }
}

// Fetch lecture data from JSON
async function fetchLectureData() {
    try {
        const response = await fetch('data/lectures.json');
        if (!response.ok) {
            throw new Error('Failed to fetch lecture data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lecture data:', error);
        return {};
    }
}

// Add this function to populate the section filter
function populateSectionFilter(lectures) {
    const sectionFilter = document.getElementById('sectionFilter');
    
    // If there's no section filter, don't proceed
    if (!sectionFilter) return;
    
    // Get unique sections from lectures
    const sections = [...new Set(lectures.map(lecture => lecture.section).filter(Boolean))];
    
    // If there's only one or no sections, hide the filter
    if (sections.length <= 1) {
        sectionFilter.parentElement.style.display = 'none';
        return;
    }
    
    // Clear existing options except "All Sections"
    while (sectionFilter.options.length > 1) {
        sectionFilter.remove(1);
    }
    
    // Add section options
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionFilter.appendChild(option);
    });
    
    // Show the filter
    sectionFilter.parentElement.style.display = 'block';
    
    // Add event listener
    sectionFilter.addEventListener('change', function() {
        const selectedSection = this.value;
        const sortOption = document.getElementById('sortOption')?.value || 'asc';
        
        if (selectedSection === 'all') {
            renderLectures(lectures, sortOption);
        } else {
            const filteredLectures = lectures.filter(lecture => lecture.section === selectedSection);
            renderLectures(filteredLectures, sortOption);
        }
    });
}

// Initialize course detail page
async function initializeCourseDetailPage() {
    // Get course ID from URL parameter
    const courseId = getUrlParameter('courseId');
    
    try {
        // Fetch data from JSON files
        const coursesData = await fetchCourseData();
        const lecturesData = await fetchLectureData();
        
        // Find course details
        const course = coursesData.find(c => c.id === courseId);
        
        if (course) {
            // Update page title and header
            document.title = `ExamPartus | ${course.id} - ${course.title}`;
            document.getElementById('courseId').textContent = course.id;
            document.getElementById('courseTitle').textContent = course.title;
            
            // Get lectures for this course
            const lectures = lecturesData[courseId] || [];
            
            if (lectures.length > 0) {
                // Populate section filter
                populateSectionFilter(lectures);
                
                // // Initial sort (default to ascending)
                // renderLectures(lectures, 'asc');
                
                // // Set up sorting functionality
                // const sortOption = document.getElementById('sortOption');
                // if (sortOption) {
                //     sortOption.addEventListener('change', function() {
                //         const selectedSection = document.getElementById('sectionFilter')?.value || 'all';
                        
                //         if (selectedSection === 'all') {
                //             renderLectures(lectures, this.value);
                //         } else {
                //             const filteredLectures = lectures.filter(lecture => lecture.section === selectedSection);
                //             renderLectures(filteredLectures, this.value);
                //         }
                //     });
                // }
                // Initial sort (default to ascending)
                renderLectures(lectures, 'asc');

                // Set up sorting functionality
                const sortOption = document.getElementById('sortOption');
                if (sortOption) {
                    // Explicitly set the dropdown to show "Lecture Number (1 → 9)"
                    sortOption.value = 'asc';
                    
                    sortOption.addEventListener('change', function() {
                        const selectedSection = document.getElementById('sectionFilter')?.value || 'all';
                        
                        if (selectedSection === 'all') {
                            renderLectures(lectures, this.value);
                        } else {
                            const filteredLectures = lectures.filter(lecture => lecture.section === selectedSection);
                            renderLectures(filteredLectures, this.value);
                        }
                    });
                }
            } else {
                const lecturesGrid = document.getElementById('lecturesGrid');
                lecturesGrid.innerHTML = '<div class="no-lectures">No lectures available for this course yet.</div>';
            }
        } else {
            // Handle case where course doesn't exist
            document.getElementById('courseId').textContent = "Course not found";
            document.getElementById('courseTitle').textContent = "Invalid course ID";
            document.getElementById('lecturesGrid').innerHTML = '<div class="no-lectures">Course information could not be loaded.</div>';
        }
    } catch (error) {
        console.error('Error loading page data:', error);
        document.getElementById('courseId').textContent = "Error";
        document.getElementById('courseTitle').textContent = "Failed to load course data";
        document.getElementById('lecturesGrid').innerHTML = '<div class="no-lectures">Failed to load course data. Please try again later.</div>';
    }
}

// Render lectures based on sort option
function renderLectures(lectures, sortOption) {
    const sortedLectures = sortLectures(lectures, sortOption);
    const lecturesGrid = document.getElementById('lecturesGrid');
    
    lecturesGrid.innerHTML = sortedLectures.map(createLectureTile).join('');
    
    // Add event listeners to lecture tiles
    attachLectureClickListeners();
}

// Setup back button functionality
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'homepage.html';
        });
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
        searchInput?.addEventListener('input', async function() {
            const searchTerm = this.value.trim().toLowerCase();
            if (searchTerm === '') {
                resetSearchResults();
                return;
            }
            
            performSearch();
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

// Perform search
async function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput?.value.trim().toLowerCase();
    
    if (!searchTerm) {
        resetSearchResults();
        return;
    }
    
    try {
        const courseId = getUrlParameter('courseId');
        const lecturesData = await fetchLectureData();
        const lectures = lecturesData[courseId] || [];
        const lecturesGrid = document.getElementById('lecturesGrid');
        const sortOption = document.getElementById('sortOption')?.value || 'asc';
        const selectedSection = document.getElementById('sectionFilter')?.value || 'all';
        
        let filteredLectures = lectures.filter(lecture => 
            lecture.title.toLowerCase().includes(searchTerm) || 
            lecture.instructor.toLowerCase().includes(searchTerm)
        );
        
        // Apply section filter if a specific section is selected
        if (selectedSection !== 'all') {
            filteredLectures = filteredLectures.filter(lecture => lecture.section === selectedSection);
        }
        
        const sortedFilteredLectures = sortLectures(filteredLectures, sortOption);
        
        lecturesGrid.innerHTML = filteredLectures.length > 0 
            ? sortedFilteredLectures.map(createLectureTile).join('') 
            : '<div class="no-lectures">No lectures found matching your search.</div>';
        
        attachLectureClickListeners();
        
        // Add visual feedback to show search was performed
        const searchBar = document.getElementById('searchBar');
        searchBar.classList.add('searched');
        setTimeout(() => {
            searchBar.classList.remove('searched');
        }, 300);
    } catch (error) {
        console.error('Error during search:', error);
    }
}

// Reset search results
async function resetSearchResults() {
    try {
        const courseId = getUrlParameter('courseId');
        const lecturesData = await fetchLectureData();
        const lectures = lecturesData[courseId] || [];
        const sortOption = document.getElementById('sortOption')?.value || 'asc';
        const selectedSection = document.getElementById('sectionFilter')?.value || 'all';
        
        if (selectedSection === 'all') {
            renderLectures(lectures, sortOption);
        } else {
            const filteredLectures = lectures.filter(lecture => lecture.section === selectedSection);
            renderLectures(filteredLectures, sortOption);
        }
    } catch (error) {
        console.error('Error resetting search results:', error);
    }
}

// Attach event listeners to lecture tiles
function attachLectureClickListeners() {
    document.querySelectorAll('.lecture-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            const lectureId = this.getAttribute('data-id');
            const onedriveLink = this.getAttribute('data-link');
            
            console.log(`Tile clicked for lecture ${lectureId} with link: ${onedriveLink}`);
            
            if (onedriveLink && onedriveLink !== '') {
                // Navigate to the OneDrive link in the same tab
                window.location.href = onedriveLink;
                console.log(`Navigating to OneDrive link: ${onedriveLink}`);
            } else {
                // Fallback if no link is provided
                const courseId = getUrlParameter('courseId');
                console.log(`No OneDrive link available for lecture: ${courseId}-${lectureId}`);
                alert(`No recording available for lecture ${lectureId} of course ${courseId}`);
            }
        });
    });
}

// Profile Menu Functionality
function setupProfileMenu() {
    const profileButton = document.getElementById('profileButton');
    const profileMenu = document.getElementById('profileMenu');
    const logoutButton = document.getElementById('logoutButton');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    // Load user data from localStorage
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            // Update profile information
            if (profileName) profileName.textContent = userData.name || 'User Name';
            if (profileEmail) profileEmail.textContent = userData.email || 'user@example.com';
            
            // Update avatar if available
            if (userData.picture && profileAvatar) {
                profileAvatar.src = userData.picture;
            }
        }
    }
    
    if (profileButton && profileMenu) {
        // Load user data when page loads
        loadUserData();
        
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
        
        // Handle logout
        if (logoutButton) {
            logoutButton.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Set logout flag
                localStorage.setItem('logging_out', 'true');
                
                // Clear localStorage
                localStorage.removeItem('user');
                
                // If using Firebase Auth, sign out
                if (window.firebase && firebase.auth) {
                    firebase.auth().signOut()
                        .then(() => {
                            console.log('User signed out');
                            window.location.href = 'index.html';
                        })
                        .catch((error) => {
                            console.error('Error signing out:', error);
                            // Clear logout flag in case of error
                            localStorage.removeItem('logging_out');
                        });
                } else {
                    // Redirect to login page
                    window.location.href = 'index.html';
                }
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCourseDetailPage();
    setupBackButton();
    setupExpandableSearch();
    setupProfileMenu();
});