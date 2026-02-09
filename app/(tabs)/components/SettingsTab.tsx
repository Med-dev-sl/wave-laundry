import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://10.140.218.56:3000/api';
const SOCKET_URL = 'http://10.140.218.56:3000';

interface UserData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface SettingsTabProps {
  userData?: UserData;
}

export function SettingsTab({ userData }: SettingsTabProps) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Profile State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Password Change State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [editAddressId, setEditAddressId] = useState<number | null>(null);

  // Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    initializeSocket();
  }, []);

  const initializeSocket = async () => {
    if (!userData?.userId) return;

    try {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket');
        newSocket.emit('join-user', userData.userId);
      });

      newSocket.on('notification', (notification) => {
        console.log('📬 Real-time notification received:', notification);
        Alert.alert(notification.title, notification.body, [
          { text: 'OK', onPress: () => {} },
        ]);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket');
      });

      newSocket.on('error', (error) => {
        console.error('Socket.io error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  };

  const fetchProfile = async () => {
    if (!userData?.userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData.userId}/profile`);
      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
        setEditName(result.data.name);
        setEditEmail(result.data.email);
        setEditPhone(result.data.phone);
        setDarkMode(result.data.dark_mode);
        setNotificationsEnabled(result.data.notifications_enabled);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAddresses = async () => {
    if (!userData?.userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData.userId}/addresses`);
      if (response.ok) {
        const result = await response.json();
        setAddresses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Validation', 'Name and email are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData?.userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        setProfileModalVisible(false);
        fetchProfile();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData?.userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully');
        setPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleAddAddress = async () => {
    if (!editAddress.trim()) {
      Alert.alert('Validation', 'Address is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData?.userId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: editAddress,
          is_default: addresses.length === 0,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Address added successfully');
        setAddressModalVisible(false);
        setEditAddress('');
        fetchAddresses();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const handleUpdateAddress = async () => {
    if (!editAddress.trim() || !editAddressId) {
      Alert.alert('Validation', 'Address is required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userData?.userId}/addresses/${editAddressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: editAddress,
          is_default: false,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Address updated successfully');
        setAddressModalVisible(false);
        setEditAddress('');
        setEditAddressId(null);
        fetchAddresses();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update address');
    }
  };

  const handleDeleteAddress = (addressId: number) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/users/${userData?.userId}/addresses/${addressId}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              Alert.alert('Success', 'Address deleted successfully');
              fetchAddresses();
            } else {
              Alert.alert('Error', 'Failed to delete address');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleDarkModeToggle = async (value: boolean) => {
    // Dark mode coming soon: UI shows coming soon, do not persist change
    Alert.alert('Coming soon', 'Dark Mode will be available in a future update.');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await fetch(`${API_BASE_URL}/users/${userData?.userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications_enabled: value }),
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      setNotificationsEnabled(!value);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (!userData?.userId) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    try {
      if (!Device.isDevice) {
        Alert.alert('Push Notifications', 'Push notifications require a physical device');
        return;
      }

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert('Permission required', 'Enable push notifications permissions in your device settings');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const pushToken = tokenData.data;

        // Send token to backend
        await fetch(`${API_BASE_URL}/users/${userData.userId}/push-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ push_token: pushToken }),
        });

        Alert.alert('Success', 'Device registered for push notifications');
      } catch (notificationError: any) {
        if (notificationError.message?.includes('expo-notifications') || notificationError.message?.includes('SDK 53')) {
          Alert.alert(
            'Development Build Required',
            'Push notifications require a development build. Please use `eas build --platform ios --profile preview` or `eas build --platform android --profile preview` to create a development build.'
          );
        } else {
          throw notificationError;
        }
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      Alert.alert('Error', 'Failed to register for push notifications');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: () => {
          router.push('/');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.tabContent}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>⚙️</Text>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setProfileModalVisible(true)}
            >
              <Text style={styles.settingIcon}>👤</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Edit Profile</Text>
                <Text style={styles.settingSubtitle}>{profile?.email}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setPasswordModalVisible(true)}
            >
              <Text style={styles.settingIcon}>🔐</Text>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setAddressModalVisible(true)}
            >
              <Text style={styles.settingIcon}>📍</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Delivery Addresses</Text>
                <Text style={styles.settingSubtitle}>{addresses.length} address(es)</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>{notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f0f0f0'}
              />
            </View>

            <View style={[styles.settingItem, { justifyContent: 'space-between' }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Register Device</Text>
                <Text style={styles.settingSubtitle}>Register this device for push notifications</Text>
              </View>
              <TouchableOpacity onPress={registerForPushNotificationsAsync}>
                <Text style={[styles.primaryButtonText, { backgroundColor: 'transparent', color: '#007AFF' }]}>Register</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Coming soon</Text>
              </View>
              <Switch
                value={darkMode}
                disabled
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={darkMode ? '#fff' : '#f0f0f0'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.settingItem, styles.logoutButton, styles.logoutMargin]}
        onPress={handleLogout}
      >
        <Text style={styles.settingIcon}>🚪</Text>
        <Text style={[styles.settingLabel, styles.logoutText]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter your phone"
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile}>
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Password</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                secureTextEntry
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleChangePassword}>
                <Text style={styles.primaryButtonText}>Change Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Address Management Modal */}
      <Modal visible={addressModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Delivery Addresses</Text>
              <TouchableOpacity onPress={() => {
                setEditAddress('');
                setEditAddressId(null);
              }}>
                <Text style={styles.addButton}>+</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {editAddressId === null ? (
                <>
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <View key={addr.id} style={styles.addressCard}>
                        <View style={styles.addressHeader}>
                          <Text style={styles.addressText}>{addr.address}</Text>
                          {addr.is_default && <Text style={styles.defaultBadge}>Default</Text>}
                        </View>
                        <View style={styles.addressActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setEditAddress(addr.address);
                              setEditAddressId(addr.id);
                            }}
                          >
                            <Text style={styles.actionButton}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                            <Text style={[styles.actionButton, styles.deleteButton]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>No addresses added yet</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      setEditAddress('');
                      setEditAddressId(-1);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>+ Add New Address</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>{editAddressId === -1 ? 'New Address' : 'Edit Address'}</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    value={editAddress}
                    onChangeText={setEditAddress}
                    placeholder="Enter complete address"
                    multiline
                    numberOfLines={4}
                  />

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => {
                        setEditAddress('');
                        setEditAddressId(null);
                      }}
                    >
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={editAddressId === -1 ? handleAddAddress : handleUpdateAddress}
                    >
                      <Text style={styles.primaryButtonText}>
                        {editAddressId === -1 ? 'Add Address' : 'Update Address'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FFE8E8',
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  logoutMargin: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    width: 24,
    textAlign: 'center',
  },
  addButton: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
  },
  defaultBadge: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteButton: {
    color: '#FF6B6B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Trebuchet MS',
  },
});

export default SettingsTab;
