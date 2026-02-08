import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://10.140.218.56:3000/api';

type OrderStep = 'serviceSelection' | 'deliveryOption' | 'addressInput' | 'confirmation';

interface UserData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface OrdersTabProps {
  userData?: UserData;
}

export function OrdersTab({ userData }: OrdersTabProps) {
  const [currentStep, setCurrentStep] = useState<OrderStep>('serviceSelection');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [deliveryOption, setDeliveryOption] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const packages = [
    {
      key: 'half-kg',
      title: 'Wash, Dry & Fold',
      weight: '1/2 kg',
      price: 'SLe 25.00',
      icon: '🧺',
    },
    {
      key: 'one-kg',
      title: 'Wash, Dry & Fold',
      weight: '1 kg',
      price: 'SLe 30.00',
      icon: '👔',
    },
    {
      key: 'half-kg-iron',
      title: 'Wash, Dry, Iron & Fold',
      weight: '1/2 kg',
      price: 'SLe 45.00',
      icon: '♨',
    },
    {
      key: 'one-kg-iron',
      title: 'Wash, Dry, Iron & Fold',
      weight: '1 kg',
      price: 'SLe 50.00',
      icon: '👗',
    },
    {
      key: 'half-kg-premium',
      title: 'Wash, Dry, Iron & Package',
      weight: '1/2 kg',
      price: 'SLe 50.00',
      icon: '📦',
    },
    {
      key: 'one-kg-premium',
      title: 'Wash, Dry, Iron & Package',
      weight: '1 kg',
      price: 'SLe 55.00',
      icon: '🎁',
    },
    {
      key: 'stain-removal',
      title: 'Stain Removal',
      weight: 'Per Clothe',
      price: 'SLe 20.00',
      icon: '✨',
    },
    {
      key: 'whites',
      title: 'Whites',
      weight: 'Per Clothe',
      price: 'SLe 10.00',
      icon: '⚪',
    },
    {
      key: 'emergency',
      title: 'Emergency Service',
      weight: 'Any Package',
      price: '2x Package Price',
      icon: '🚨',
    },
  ];

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setCurrentStep('deliveryOption');
  };

  const handleDeliverySelect = (option: string) => {
    setDeliveryOption(option);
    if (option === 'none') {
      setCurrentStep('confirmation');
    } else {
      setCurrentStep('addressInput');
    }
  };

  const handleAddressSubmit = () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your delivery address');
      return;
    }
    setCurrentStep('confirmation');
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      if (!userData?.userId) {
        Alert.alert('Error', 'User information not found');
        setLoading(false);
        return;
      }

      const orderData = {
        userId: parseInt(userData.userId),
        servicePackageKey: selectedService.key,
        serviceTitle: selectedService.title,
        deliveryOption,
        address: deliveryOption === 'none' ? null : address,
        deliveryFee: deliveryOption === 'none' ? 0 : calculateDeliveryFee(),
        status: 'accepted',
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetOrder();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to place order'
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryFee = (): number => {
    // This would be determined by actual location logic from backend
    // For now, default to 10 (closer location)
    return 10;
  };

  const resetOrder = () => {
    setCurrentStep('serviceSelection');
    setSelectedService(null);
    setDeliveryOption(null);
    setAddress('');
  };

  // Step 1: Service Selection
  if (currentStep === 'serviceSelection') {
    return (
      <View style={styles.tabContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>👕</Text>
          <Text style={styles.headerTitle}>Select Service</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.servicesList}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.key}
              style={styles.serviceCard}
              onPress={() => handleServiceSelect(pkg)}
            >
              <Text style={styles.serviceIcon}>{pkg.icon}</Text>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{pkg.title}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Step 2: Delivery Option
  if (currentStep === 'deliveryOption') {
    return (
      <View style={styles.tabContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🚚</Text>
          <Text style={styles.headerTitle}>Delivery Option</Text>
        </View>

        <View style={styles.selectedService}>
          <Text style={styles.selectedServiceText}>
            Selected: <Text style={styles.bold}>{selectedService?.title}</Text>
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📍 Location-Based Delivery Fee</Text>
          <Text style={styles.infoText}>
            Closer to our location: SLe 10{'\n'}
            Not closer: SLe 20
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleDeliverySelect('pickup')}
          >
            <Text style={styles.optionIcon}>🚗</Text>
            <Text style={styles.optionTitle}>Pickup & Delivery</Text>
            <Text style={styles.optionDescription}>We pick up and deliver</Text>
            <Text style={styles.optionPrice}>SLe 10-20 (Fee applies)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleDeliverySelect('express')}
          >
            <Text style={styles.optionIcon}>⚡</Text>
            <Text style={styles.optionTitle}>Express</Text>
            <Text style={styles.optionDescription}>Fast pickup & delivery</Text>
            <Text style={styles.optionPrice}>SLe 10-20 (Fee applies)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleDeliverySelect('none')}
          >
            <Text style={styles.optionIcon}>👤</Text>
            <Text style={styles.optionTitle}>Self Delivery</Text>
            <Text style={styles.optionDescription}>You deliver & pickup</Text>
            <Text style={styles.optionPrice}>Free (No fee)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('serviceSelection')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 3: Address Input (if Pickup or Express)
  if (currentStep === 'addressInput') {
    return (
      <View style={styles.tabContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📍</Text>
          <Text style={styles.headerTitle}>Delivery Address</Text>
        </View>

        <View style={styles.selectedService}>
          <Text style={styles.selectedServiceText}>
            <Text style={styles.bold}>{selectedService?.title}</Text> • {deliveryOption === 'pickup' ? 'Pickup & Delivery' : 'Express'}
          </Text>
        </View>

        <Text style={styles.label}>Enter Your Address</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter full address with street, area, and landmark"
          placeholderTextColor="#999"
          multiline={true}
          numberOfLines={4}
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep('deliveryOption')}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAddressSubmit}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 4: Confirmation
  if (currentStep === 'confirmation') {
    return (
      <View style={styles.tabContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✓</Text>
          <Text style={styles.headerTitle}>Confirm Order</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Service:</Text>
              <Text style={styles.summaryValue}>{selectedService?.title}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Delivery:</Text>
              <Text style={styles.summaryValue}>
                {deliveryOption === 'pickup'
                  ? 'Pickup & Delivery'
                  : deliveryOption === 'express'
                  ? 'Express'
                  : 'Self Delivery'}
              </Text>
            </View>

            {deliveryOption !== 'none' && (
              <>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                  <Text style={styles.summaryValue}>SLe {calculateDeliveryFee()}</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Address:</Text>
                  <Text style={styles.summaryValue}>{address}</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentStep('deliveryOption')}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmitOrder}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Processing...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  servicesList: {
    flex: 1,
    marginBottom: 16,
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
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  serviceIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  serviceDetail: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '700',
  },
  servicePrice: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '700',
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  selectedService: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  selectedServiceText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Trebuchet MS',
  },
  bold: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  infoBox: {
    backgroundColor: '#fff9e6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    lineHeight: 18,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  addressInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  summaryBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  backButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
