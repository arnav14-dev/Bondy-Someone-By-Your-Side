import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    totalCompanions: 0,
    activeCompanions: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (!adminToken || !adminData) {
      navigate('/admin/login');
      return;
    }

    setAdminData(JSON.parse(adminData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load companion stats
      const companionStatsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/companions/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (companionStatsResponse.ok) {
        const companionStats = await companionStatsResponse.json();
        setStats(prev => ({
          ...prev,
          totalCompanions: companionStats.data.totalCompanions,
          activeCompanions: companionStats.data.activeCompanions
        }));
      }

      // Load booking stats
      const bookingStatsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/bookings/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (bookingStatsResponse.ok) {
        const bookingStats = await bookingStatsResponse.json();
        setStats(prev => ({
          ...prev,
          totalBookings: bookingStats.data.totalBookings,
          pendingBookings: bookingStats.data.bookingsByStatus.find(s => s._id === 'pending')?.count || 0
        }));
      }

      // Load recent bookings
      const recentBookingsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/bookings?limit=5&sortBy=createdAt&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (recentBookingsResponse.ok) {
        const recentBookingsData = await recentBookingsResponse.json();
        setRecentBookings(recentBookingsData.data.bookings);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin/dashboard', active: true },
    { id: 'companions', label: 'Companions', icon: Users, path: '/admin/companions' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/admin/chat' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">
          {loading ? (
            <div className="loading-skeleton"></div>
          ) : (
            value.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Bondy Admin</h2>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1>Dashboard</h1>
          </div>
          
          <div className="header-right">
            <div className="search-container">
              <Search size={20} />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">
                {adminData?.name?.charAt(0) || 'A'}
              </div>
              <div className="admin-info">
                <p className="admin-name">{adminData?.name || 'Admin'}</p>
                <p className="admin-role">{adminData?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Companions"
              value={stats.totalCompanions}
              icon={Users}
              color="#3b82f6"
              loading={isLoading}
            />
            <StatCard
              title="Active Companions"
              value={stats.activeCompanions}
              icon={Users}
              color="#10b981"
              loading={isLoading}
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={Calendar}
              color="#f59e0b"
              loading={isLoading}
            />
            <StatCard
              title="Pending Bookings"
              value={stats.pendingBookings}
              icon={Bell}
              color="#ef4444"
              loading={isLoading}
            />
          </div>

          {/* Recent Bookings */}
          <div className="recent-bookings">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/admin/bookings')}
              >
                View All
              </button>
            </div>
            
            <div className="bookings-list">
              {recentBookings.length > 0 ? (
                recentBookings.map(booking => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-info">
                      <h3>{booking.taskDescription}</h3>
                      <p>{booking.userId?.name || 'Unknown User'}</p>
                      <span className="booking-date">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </span>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No recent bookings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
