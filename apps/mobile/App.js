import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import storage from './src/services/storage';
import apiClient from './src/services/apiClient';
import socketService from './src/services/socketService';
import { CONFIG } from './src/config';

import LandingScreen from './src/screens/LandingScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import DriveModeScreen from './src/screens/DriveModeScreen';
import ReportDashboardScreen from './src/screens/ReportDashboardScreen';
import ReportModal from './src/screens/ReportModal';
import DrawerMenu from './src/screens/DrawerMenu';
import AboutScreen from './src/screens/AboutScreen';

function AppContent() {
  const { colors, isDark } = useTheme();
  const [currentView, setCurrentView] = useState('LANDING');
  const [selectedRole, setSelectedRole] = useState('driver');
  const [currentUser, setCurrentUser] = useState(null);

  // Map & Route state
  const [roadFeatures, setRoadFeatures] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [alternateRoute, setAlternateRoute] = useState(null);
  const [rerouteAlert, setRerouteAlert] = useState(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initial Data & Auth Restore
  useEffect(() => {
    async function initApp() {
      // Check stored user
      const user = await storage.getUser();
      if (user) {
        setCurrentUser(user);
        setCurrentView('DASHBOARD');
      }

      // Load roads and reports
      await refreshMapData();

      // Connect Socket.IO
      socketService.connect(user?.id);

      // Register Real-Time Listeners
      const unsubscribeReroute = socketService.onRerouteAlert((alertData) => {
        console.log('[APP] EMERGENCY REROUTE ALERT DETECTED:', alertData);
        setRerouteAlert(alertData);
        if (alertData.alternateRoute) {
          setAlternateRoute(alertData.alternateRoute);
        }
      });

      const unsubscribeRoadUpdate = socketService.onRoadStatusUpdate((segment) => {
        refreshMapData();
      });

      const unsubscribeNewReport = socketService.onNewReport((rep) => {
        setReports(prev => [rep, ...prev]);
      });

      // Background offline sync worker
      const syncInterval = setInterval(() => {
        apiClient.syncQueuedReports().then(count => {
          if (count > 0) {
            console.log(`[APP BACKGROUND SYNC] Successfully synced ${count} offline reports`);
            refreshMapData();
          }
        });
      }, CONFIG.OFFLINE_SYNC_INTERVAL_MS);

      return () => {
        unsubscribeReroute();
        unsubscribeRoadUpdate();
        unsubscribeNewReport();
        clearInterval(syncInterval);
        socketService.disconnect();
      };
    }

    initApp();
  }, []);

  const refreshMapData = async () => {
    try {
      const roads = await apiClient.fetchRoadStatus();
      if (roads?.features) {
        setRoadFeatures(roads.features);
      }
      const reps = await apiClient.fetchReports();
      setReports(reps || []);
    } catch (e) {
      console.log('[APP] Running in offline cache mode:', e.message);
    }
  };

  const planInitialCorridorRoute = async () => {
    try {
      const plan = await apiClient.planRoute(
        { lat: 26.1150, lng: 91.8210, name: 'Guwahati Khanapara' },
        { lat: 25.5720, lng: 91.8830, name: 'Shillong Police Bazar' },
        currentUser?.id
      );
      setActiveRoute(plan);
      if (plan.isAlternate) {
        setAlternateRoute(plan);
      }
      return plan;
    } catch (e) {
      console.log('Route planning error:', e);
    }
  };

  // Auth flow callbacks
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCurrentView('AUTH');
  };

  const handleLoginPress = () => {
    setSelectedRole('driver');
    setCurrentView('AUTH');
  };

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
    await planInitialCorridorRoute();
    socketService.connect(user.id);
  };

  const handleLogout = async () => {
    await storage.clearAuth();
    setCurrentUser(null);
    setIsDrawerOpen(false);
    setCurrentView('LANDING');
  };

  // Navigation handlers
  const handleStartDrive = async () => {
    if (!activeRoute) {
      await planInitialCorridorRoute();
    }
    setCurrentView('DRIVE_MODE');
  };

  const handleStopDrive = () => {
    setCurrentView('DASHBOARD');
  };

  const handleAcceptAlternate = () => {
    if (rerouteAlert?.alternateRoute) {
      setActiveRoute(rerouteAlert.alternateRoute);
      setAlternateRoute(rerouteAlert.alternateRoute);
    }
    setRerouteAlert(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {currentView === 'LANDING' && (
        <LandingScreen
          onSelectRole={handleSelectRole}
          onLogin={handleLoginPress}
        />
      )}

      {currentView === 'AUTH' && (
        <AuthScreen
          initialRole={selectedRole}
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setCurrentView('LANDING')}
        />
      )}

      {currentView === 'DASHBOARD' && (
        <DashboardScreen
          currentUser={currentUser}
          roadFeatures={roadFeatures}
          reports={reports}
          activeRoute={activeRoute}
          alternateRoute={alternateRoute}
          onStartDrive={handleStartDrive}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenReportDashboard={() => setCurrentView('REPORTS')}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onPlanRoute={planInitialCorridorRoute}
        />
      )}

      {currentView === 'DRIVE_MODE' && (
        <DriveModeScreen
          activeRoute={activeRoute}
          alternateRoute={alternateRoute}
          roadFeatures={roadFeatures}
          reports={reports}
          rerouteAlert={rerouteAlert}
          onAcceptAlternate={handleAcceptAlternate}
          onDismissAlert={() => setRerouteAlert(null)}
          onStopDrive={handleStopDrive}
          onOpenReport={() => setIsReportModalOpen(true)}
        />
      )}

      {currentView === 'REPORTS' && (
        <ReportDashboardScreen
          currentUser={currentUser}
          onBack={() => setCurrentView('DASHBOARD')}
        />
      )}

      {currentView === 'ABOUT' && (
        <AboutScreen onBack={() => setCurrentView('DASHBOARD')} />
      )}

      {/* Global Persistent Modals */}
      <ReportModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        onReportCreated={() => refreshMapData()}
      />

      <DrawerMenu
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenReports={() => {
          setIsDrawerOpen(false);
          setCurrentView('REPORTS');
        }}
        onOpenAbout={() => {
          setIsDrawerOpen(false);
          setCurrentView('ABOUT');
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
