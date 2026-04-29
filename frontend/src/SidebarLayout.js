import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './SidebarLayout.css';

const SidebarLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      permission: 'dashboard'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: '👥',
      permission: 'clients'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📋',
      permission: 'orders'
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      permission: 'products'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.permission)
  );

  return (
    <div className="sidebar-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏭</span>
            {!sidebarCollapsed && (
              <span className="logo-text">Factory ERP</span>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredMenuItems.map(item => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          {!sidebarCollapsed && (
            <div className="user-details">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">
                {user?.role}
              </div>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {filteredMenuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <div className="user-info-header">
              <span className="user-name-header">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="user-role-header">
                {user?.role} • {user?.department}
              </span>
            </div>
            <button className="logout-header-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
