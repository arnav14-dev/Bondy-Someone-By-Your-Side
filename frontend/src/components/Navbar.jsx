// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Heart, 
//   User, 
//   Calendar, 
//   Home, 
//   Menu, 
//   X, 
//   Bell, 
//   Settings,
//   LogOut,
//   ChevronDown
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { BASE_API_URL } from '../config/api.js';
// import '../styles/Navbar.css';
// import { 
//   isRequestInProgress, 
//   markRequestInProgress, 
//   markRequestComplete, 
//   getCachedResponse, 
//   setCachedResponse 
// } from '../utils/requestTracker.js';

// const Navbar = () => {
//   const [user, setUser] = useState(null);
//   const [profileImageUrl, setProfileImageUrl] = useState(null);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(false);
//   const requestInProgress = useRef(false);
//   const hasAttemptedFetch = useRef(false);

//   useEffect(() => {
//     const currentUser = localStorage.getItem('currentUser');
//     if (currentUser) {
//       const parsedUser = JSON.parse(currentUser);
//       setUser(parsedUser);
      
//       if (parsedUser.profilePicture && !isLoadingProfileImage) {
//         fetchProfileImageWithUser(parsedUser, parsedUser.profilePicture);
//       }
//     }
//   }, [isLoadingProfileImage]);

//   const fetchProfileImageWithUser = async (userData, s3FileName) => {
//     const userId = userData?._id || userData?.id;
//     const globalKey = `profile-image-${userId}-${s3FileName}`;
    
//     // AGGRESSIVE: If we've already attempted to fetch this image, don't try again
//     if (hasAttemptedFetch.current) {
//       return;
//     }

//     // Check global tracker first - if request is already in progress, abort immediately
//     if (isRequestInProgress(globalKey)) {
//       return;
//     }

//     // Check if we already have this image or request is in progress locally
//     if (requestInProgress.current || profileImageUrl) {
//       return;
//     }

//     // Check cache first
//     const cacheKey = `${userId}-${s3FileName}`;
//     const cachedUrl = getCachedResponse(cacheKey);
//     if (cachedUrl) {
//       setProfileImageUrl(cachedUrl);
//       return;
//     }

//     // Mark as attempted and in progress globally and locally
//     hasAttemptedFetch.current = true;
//     markRequestInProgress(globalKey);
//     requestInProgress.current = true;
//     setIsLoadingProfileImage(true);
    
//     try {
//       const response = await fetch(`${BASE_API_URL}/s3/get-image-from-s3`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'user-id': userId || ''
//         },
//         body: JSON.stringify({ s3FileName }),
//       });

//       if (response.ok) {
//         const data = await response.json();
        
//         if (data.success && data.data?.imageUrl) {
//           // Cache the successful result
//           setCachedResponse(cacheKey, data.data.imageUrl);
//           setProfileImageUrl(data.data.imageUrl);
//         }
//       }
//     } catch (err) {
//       // Silently handle errors to prevent security breaches
//       // No console logging of sensitive data
//     } finally {
//       markRequestComplete(globalKey);
//       requestInProgress.current = false;
//       setIsLoadingProfileImage(false);
//     }
//   };


//   const handleLogout = () => {
//     localStorage.removeItem('currentUser');
//     window.location.href = '/';
//   };

//   const navigation = [
//     { name: 'Home', href: '/home', icon: Home },
//     { name: 'Bookings', href: '/bookings', icon: Calendar },
//     { name: 'Profile', href: '/profile', icon: User },
//   ];

//   return (
//     <nav className="navbar">
//       <div className="navbar-container">
//         {/* Logo */}
//         <div className="navbar-brand">
//           <a href="/home" className="brand-link">
//             <img src="/assets/logo.png" alt="Bondy Logo" className="brand-logo" />
//           </a>
//         </div>

//         {/* Desktop Navigation */}
//         <div className="navbar-menu desktop-menu">
//           {navigation.map((item) => {
//             return (
//               <a
//                 key={item.name}
//                 href={item.href}
//                 className="nav-link"
//               >
//                 <span className="nav-text">{item.name}</span>
//               </a>
//             );
//           })}
//         </div>

//         {/* Right Side Actions */}
//         <div className="navbar-actions">
          

//           {/* Profile Dropdown */}
//           <div className="profile-dropdown">
//             <button
//               className="profile-trigger"
//               onClick={() => setIsProfileOpen(!isProfileOpen)}
//             >
//               <div className="profile-avatar">
//                 {profileImageUrl ? (
//                   <img
//                     src={profileImageUrl}
//                     alt="Profile"
//                     className="avatar-image"
//                   />
//                 ) : (
//                   <div className="avatar-placeholder">
//                     <User size={20} />
//                   </div>
//                 )}
//               </div>
//               <ChevronDown size={16} className={`chevron ${isProfileOpen ? 'open' : ''}`} />
//             </button>

//             <AnimatePresence>
//               {isProfileOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className="profile-menu"
//                 >
//                   <a href="/profile" className="profile-menu-item">
//                     <User size={16} />
//                     <span>Profile</span>
//                   </a>
//                   <a href="/settings" className="profile-menu-item">
//                     <Settings size={16} />
//                     <span>Settings</span>
//                   </a>
//                   <hr className="profile-menu-divider" />
//                   <button
//                     onClick={handleLogout}
//                     className="profile-menu-item logout"
//                   >
//                     <LogOut size={16} />
//                     <span>Logout</span>
//                   </button>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="mobile-menu-btn"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           >
//             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.3 }}
//             className="mobile-menu"
//           >
//             <div className="mobile-menu-content">
//               {navigation.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <a
//                     key={item.name}
//                     href={item.href}
//                     className="mobile-nav-link"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     <Icon className="mobile-nav-icon" size={20} />
//                     <span>{item.name}</span>
//                   </a>
//                 );
//               })}
              
//               <hr className="mobile-menu-divider" />
              
//               <div className="mobile-profile-section">
//                 <div className="mobile-profile-info">
//                   <div className="mobile-profile-avatar">
//                     {profileImageUrl ? (
//                       <img
//                         src={profileImageUrl}
//                         alt="Profile"
//                         className="mobile-avatar-image"
//                       />
//                     ) : (
//                       <div className="mobile-avatar-placeholder">
//                         <User size={20} />
//                       </div>
//                     )}
//                   </div>
//                   <div className="mobile-profile-details">
//                     <p className="mobile-profile-name">{user?.username ? user.username.split(' ')[0].substring(0, 10) : 'User'}</p>
//                     <p className="mobile-profile-email">{user?.contactNumber || ''}</p>
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={handleLogout}
//                   className="mobile-logout-btn"
//                 >
//                   <LogOut size={16} />
//                   <span>Logout</span>
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect, useRef } from "react";
import { BASE_API_URL } from '../config/api.js';
import '../styles/Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
// Global cache for profile images
const profileImageCache = new Map();
const pendingRequests = new Map();
const retryQueue = new Map(); // For rate-limited requests

const Navbar = ({ user, onLogout, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.nav-links') && !event.target.closest('.hamburger')) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    
    if (user?.profilePicture) {
      // Fetch fresh data directly
      fetchProfileImageOptimized(user.profilePicture, user._id || user.id);
    } else {
      setProfileImageUrl(null);
      setIsLoadingImage(false);
    }
  }, [user]);

  // Cleanup retry timeouts on unmount
  useEffect(() => {
    return () => {
      retryQueue.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      retryQueue.clear();
    };
  }, []);

  const scrollToTop = () => {
    // Try multiple scroll methods to ensure it works
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also try scrolling the main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    if (location.pathname === '/home') {
      // If already on homepage, scroll to top immediately
      scrollToTop();
    } else {
      // If not on homepage, navigate to homepage first
      navigate('/home');
      // Wait for navigation to complete, then scroll to top
      setTimeout(() => {
        scrollToTop();
      }, 100);
    }
  };

  const handleServicesClick = () => {
    if (location.pathname === '/home') {
      // If already on homepage, scroll to services section
      const servicesSection = document.querySelector('.services-overview');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on homepage, navigate to homepage first
      navigate('/home');
      // Wait for navigation to complete, then scroll to services
      setTimeout(() => {
        const servicesSection = document.querySelector('.services-overview');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const fetchProfileImageOptimized = async (s3FileName, userId) => {
    if (!s3FileName || !userId) {
      return;
    }

    const cacheKey = `${userId}-${s3FileName}`;
    
    // Check cache first
    if (profileImageCache.has(cacheKey)) {
      const cachedUrl = profileImageCache.get(cacheKey);
      setProfileImageUrl(cachedUrl);
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      try {
        const result = await pendingRequests.get(cacheKey);
        if (result) {
          setProfileImageUrl(result);
        }
      } catch (error) {
        console.error('Error from pending request:', error);
      }
      return;
    }

    // Set loading state
    setIsLoadingImage(true);

    // Set a timeout to stop loading after 15 seconds
    const loadingTimeout = setTimeout(() => {
      setIsLoadingImage(false);
    }, 15000);

    // Create new request
    const requestPromise = fetchProfileImage(s3FileName, userId, cacheKey);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      setProfileImageUrl(result);
      setIsLoadingImage(false);
      clearTimeout(loadingTimeout);
    } catch (error) {
      console.error('Error fetching profile image:', error);
      setIsLoadingImage(false);
      clearTimeout(loadingTimeout);
    } finally {
      pendingRequests.delete(cacheKey);
    }
  };

  const scheduleRetry = (s3FileName, userId, cacheKey) => {
    const retryKey = `${userId}-${s3FileName}`;
    
    // Don't schedule multiple retries for the same image
    if (retryQueue.has(retryKey)) {
      return;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const retry = async () => {
      retryCount++;
      console.log(`Retrying profile image fetch (attempt ${retryCount}/${maxRetries})`);
      
      try {
        const result = await fetchProfileImage(s3FileName, userId, cacheKey);
        if (result) {
          setProfileImageUrl(result);
          retryQueue.delete(retryKey);
        } else if (retryCount < maxRetries) {
          // Schedule next retry with exponential backoff
          const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          setTimeout(retry, delay);
        } else {
          console.warn('Max retries reached for profile image');
          retryQueue.delete(retryKey);
        }
      } catch (error) {
        console.error('Retry failed:', error);
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(retry, delay);
        } else {
          retryQueue.delete(retryKey);
        }
      }
    };
    
    // Initial retry after 5 seconds
    retryQueue.set(retryKey, setTimeout(retry, 5000));
  };

  const fetchProfileImage = async (s3FileName, userId, cacheKey) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const url = `${BASE_API_URL}/api/s3/get-image-from-s3`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify({ s3FileName }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.imageUrl) {
          const imageUrl = data.data.imageUrl;
          
          // Cache the result in memory only
          profileImageCache.set(cacheKey, imageUrl);
          
          // Preload the image to ensure it's ready
          const img = new Image();
          img.onload = () => {
            console.log('Profile image loaded successfully');
          };
          img.onerror = () => {
            console.error('Failed to preload image:', imageUrl);
            // Remove from cache if image fails to load
            profileImageCache.delete(cacheKey);
          };
          img.src = imageUrl;
          
          return imageUrl;
        } else {
          console.warn('No image URL in response:', data);
        }
      } else if (response.status === 429) {
        console.warn('Rate limited - too many image requests. Will retry later.');
        // Schedule retry with exponential backoff
        scheduleRetry(s3FileName, userId, cacheKey);
        return null;
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile image:', response.status, errorText);
      }
      
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Profile image request timed out');
      } else {
        console.error('Error fetching profile image:', error);
      }
      return null;
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Left side: Logo + Brand */}
        <div className="logo-section" onClick={handleHomeClick}>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-nav">
          <button onClick={handleHomeClick} className="nav-link-btn">Home</button>
          <button onClick={handleServicesClick} className="nav-link-btn">Services</button>
          <button onClick={() => navigate('/booking')} className="nav-link-btn">Book Bondy</button>
          <button onClick={() => navigate('/bookings')} className="nav-link-btn">Bookings</button>
          <button onClick={() => navigate('/about')} className="nav-link-btn">About</button>
          <button onClick={() => navigate('/contact')} className="nav-link-btn">Contact</button>

          {/* Desktop Profile Section */}
          {user ? (
            <div
              className="profile-section"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.username || 'Profile'}
                  className="profile-avatar"
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    setProfileImageUrl(null);
                  }}
                  onLoad={() => {
                  }}
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {isLoadingImage ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
              )}

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setDropdownOpen(false);
                    }} 
                    className="dropdown-btn"
                  >
                    My Profile
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/bookings');
                      setDropdownOpen(false);
                    }} 
                    className="dropdown-btn"
                  >
                    My Bookings
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/manage-locations');
                      setDropdownOpen(false);
                    }} 
                    className="dropdown-btn"
                  >
                    Manage Locations
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setDropdownOpen(false);
                    }} 
                    className="dropdown-btn"
                  >
                    Settings
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }} 
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/')} className="book-btn">Login / Sign Up</button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <button 
            onClick={() => {
              handleHomeClick();
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            Home
          </button>
          <button 
            onClick={() => {
              handleServicesClick();
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            Services
          </button>
          <button 
            onClick={() => {
              navigate('/booking');
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            Book Bondy
          </button>
          <button 
            onClick={() => {
              navigate('/bookings');
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            Bookings
          </button>
          <button 
            onClick={() => {
              navigate('/about');
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            About
          </button>
          <button 
            onClick={() => {
              navigate('/contact');
              setMenuOpen(false);
            }} 
            className="mobile-nav-btn"
          >
            Contact
          </button>

          {/* Mobile Profile Section */}
          {user ? (
            <div className="mobile-profile-section">
              <div className="mobile-profile-info">
                <div className="mobile-profile-avatar">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={user.username || 'Profile'}
                      className="mobile-avatar-image"
                    />
                  ) : (
                    <div className="mobile-avatar-placeholder">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mobile-profile-details">
                  <p className="mobile-profile-name">{user?.username || 'User'}</p>
                  <p className="mobile-profile-email">{user?.contactNumber || ''}</p>
                </div>
              </div>
              
              <div className="mobile-profile-actions">
                <button 
                  onClick={() => {
                    navigate('/profile');
                    setMenuOpen(false);
                  }} 
                  className="mobile-profile-btn"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    navigate('/bookings');
                    setMenuOpen(false);
                  }} 
                  className="mobile-profile-btn"
                >
                  My Bookings
                </button>
                <button 
                  onClick={() => {
                    navigate('/manage-locations');
                    setMenuOpen(false);
                  }} 
                  className="mobile-profile-btn"
                >
                  Manage Locations
                </button>
                <button 
                  onClick={() => {
                    navigate('/settings');
                    setMenuOpen(false);
                  }} 
                  className="mobile-profile-btn"
                >
                  Settings
                </button>
                <button 
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }} 
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                navigate('/');
                setMenuOpen(false);
              }} 
              className="mobile-login-btn"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Hamburger for mobile */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
