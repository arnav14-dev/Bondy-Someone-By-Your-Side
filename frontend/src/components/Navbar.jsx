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

  useEffect(() => {
    console.log('Navbar user effect triggered:', user);
    console.log('User profilePicture:', user?.profilePicture);
    console.log('User _id:', user?._id);
    console.log('User id:', user?.id);
    
    if (user?.profilePicture) {
      console.log('User has profile picture:', user.profilePicture);
      console.log('User ID:', user._id || user.id);
      // Fetch fresh data directly
      fetchProfileImageOptimized(user.profilePicture, user._id || user.id);
    } else {
      console.log('No profile picture found in user object');
      setProfileImageUrl(null);
      setIsLoadingImage(false);
    }
  }, [user]);

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
    console.log('fetchProfileImageOptimized called:', { s3FileName, userId });
    if (!s3FileName || !userId) {
      console.log('Early return - missing data:', { s3FileName, userId });
      return;
    }

    const cacheKey = `${userId}-${s3FileName}`;
    console.log('Cache key:', cacheKey);
    
    // Check cache first
    if (profileImageCache.has(cacheKey)) {
      const cachedUrl = profileImageCache.get(cacheKey);
      console.log('Found in memory cache:', cachedUrl);
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

  const fetchProfileImage = async (s3FileName, userId, cacheKey) => {
    console.log('fetchProfileImage called:', { s3FileName, userId, cacheKey });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const url = `${BASE_API_URL}/s3/get-image-from-s3`;
      console.log('Fetching from URL:', url);
      console.log('Request body:', JSON.stringify({ s3FileName }));
      console.log('User ID header:', userId);

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
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        if (data.success && data.data?.imageUrl) {
          const imageUrl = data.data.imageUrl;
          console.log('Got image URL:', imageUrl);
          
          // Cache the result in memory only
          profileImageCache.set(cacheKey, imageUrl);
          
          // Preload the image to ensure it's ready
          const img = new Image();
          img.onload = () => {
            console.log('Image preloaded successfully');
          };
          img.onerror = () => {
            console.error('Failed to preload image:', imageUrl);
          };
          img.src = imageUrl;
          
          return imageUrl;
        } else {
          console.log('No image URL in response:', data);
        }
      } else {
        const errorText = await response.text();
        console.log('Response not ok:', response.status, response.statusText, errorText);
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

        {/* Right side: Navigation Links */}
        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <button onClick={handleHomeClick} className="nav-link-btn">Home</button>
          <button onClick={handleServicesClick} className="nav-link-btn">Services</button>
          <button onClick={() => navigate('/booking')} className="nav-link-btn">Book Bondy</button>
          <button onClick={() => navigate('/bookings')} className="nav-link-btn">Bookings</button>
          <button onClick={() => navigate('/about')} className="nav-link-btn">About</button>
          <button onClick={() => navigate('/contact')} className="nav-link-btn">Contact</button>

          {/* Conditional rendering based on login */}
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
                    console.log('Profile image loaded successfully');
                  }}
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {isLoadingImage ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <span>👤</span>
                  )}
                </div>
              )}

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => navigate('/profile')} className="dropdown-btn">My Profile</button>
                  <button onClick={() => navigate('/bookings')} className="dropdown-btn">My Bookings</button>
                  <button onClick={() => navigate('/settings')} className="dropdown-btn">Settings</button>
                  <button onClick={onLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/')} className="book-btn">Login / Sign Up</button>
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
