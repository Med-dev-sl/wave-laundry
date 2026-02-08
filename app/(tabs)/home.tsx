import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { HistoryTab } from './components/HistoryTab';
import { HomeTab } from './components/HomeTab';
import { OrdersTab } from './components/OrdersTab';
import { SettingsTab } from './components/SettingsTab';

type TabName = 'home' | 'orders' | 'history' | 'settings';

interface UserData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export default function Home() {
  const params = useLocalSearchParams();
  const userData: UserData = {
    userId: typeof params.userId === 'string' ? params.userId : undefined,
    userName: typeof params.userName === 'string' ? params.userName : undefined,
    userEmail: typeof params.userEmail === 'string' ? params.userEmail : undefined,
    userPhone: typeof params.userPhone === 'string' ? params.userPhone : undefined,
  };
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userData={userData} />;
      case 'orders':
        return <OrdersTab userData={userData} />;
      case 'history':
        return <HistoryTab userData={userData} />;
      case 'settings':
        return <SettingsTab userData={userData} />;
      default:
        return <HomeTab userData={userData} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TabButton
            icon="🏠"
            label="Home"
            active={activeTab === 'home'}
            onPress={() => setActiveTab('home')}
          />
          <TabButton
            icon="👕"
            label="Orders"
            active={activeTab === 'orders'}
            onPress={() => setActiveTab('orders')}
          />
          <TabButton
            icon="📋"
            label="History"
            active={activeTab === 'history'}
            onPress={() => setActiveTab('history')}
          />
          <TabButton
            icon="⚙️"
            label="Settings"
            active={activeTab === 'settings'}
            onPress={() => setActiveTab('settings')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Tab Button Component
function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabButtonActive: {},
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
});
