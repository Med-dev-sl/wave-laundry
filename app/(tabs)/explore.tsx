import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
  Animated,
} from 'react-native';
import { StyleSheet } from 'react-native';

const API_BASE_URL = 'http://localhost:3000/api';

interface FormErrors {
  phone?: string;
  password?: string;
}

interface LoginData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const phoneUnderline = useRef(new Animated.Value(0)).current;
  const passwordUnderline = useRef(new Animated.Value(0)).current;

  const animateUnderline = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 8) {
        newErrors.phone = 'Sierra Leone phone number must be 8 digits';
      } else if (!/^[0-9]{8}$/.test(cleanPhone)) {
        newErrors.phone = 'Phone number must contain only digits';
      }
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages
        if (response.status === 400) {
          Alert.alert('Validation Error', data.message || 'Please check your input');
        } else if (response.status === 401) {
          setErrors({ phone: data.message || 'Invalid phone number or password' });
        } else {
          Alert.alert('Login Failed', data.message || 'Something went wrong');
        }
        return;
      }

      // Show success modal
      setLoginData({
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
      });
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        error instanceof Error
          ? error.message
          : 'Failed to connect to server. Please ensure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Clear form
    setPhone('');
    setPassword('');
    setErrors({});
    setLoginData(null);
  };

  const handleInputChange = (field: 'phone' | 'password', value: string) => {
    // Update state
    if (field === 'phone') setPhone(value);
    if (field === 'password') setPassword(value);

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🌊</Text>
            <Text style={styles.title}>Wave Laundry</Text>
            <Text style={styles.subtitle}>Sign In to Your Account</Text>
          </View>

          {/* Form Container (transparent for underline inputs) */}
          <View style={styles.formContainer}>
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputRow}>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.phonePrefix}>🇸🇱 +232</Text>
                  <TextInput
                    style={styles.inputUnderline}
                    placeholder="xx xxx xxxx"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                    editable={!loading}
                    maxLength={20}
                    onFocus={() => animateUnderline(phoneUnderline, 1)}
                    onBlur={() => animateUnderline(phoneUnderline, 0)}
                  />
                </View>
              </View>
              <Animated.View
                style={[
                  styles.underline,
                  {
                    transform: [{ scaleX: phoneUnderline }],
                  },
                ]}
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              <Text style={styles.helperText}>8 digits only</Text>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputUnderline}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  onFocus={() => animateUnderline(passwordUnderline, 1)}
                  onBlur={() => animateUnderline(passwordUnderline, 0)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              <Animated.View
                style={[
                  styles.underline,
                  {
                    transform: [{ scaleX: passwordUnderline }],
                  },
                ]}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.infoText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)')}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Extra padding */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Login Successful!</Text>
            <Text style={styles.successMessage}>
              Welcome back to Wave Laundry
            </Text>

            {/* User Details */}
            {loginData && (
              <View style={styles.userDetailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{loginData.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{loginData.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>+232 {loginData.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>User ID:</Text>
                  <Text style={styles.detailValue}>#{loginData.id}</Text>
                </View>
              </View>
            )}

            {/* Close Button */}
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.modalButtonPressed,
              ]}
              onPress={handleSuccessClose}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Trebuchet MS',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Trebuchet MS',
  },
  formContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 8,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  inputWrapper: {
    // kept for compatibility but not used for underline inputs
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'System',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'System',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  inputUnderline: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  underline: {
    height: 2,
    backgroundColor: '#87CEEB',
    transform: [{ scaleX: 0 }],
    marginTop: 4,
    alignSelf: 'stretch',
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: 'Trebuchet MS',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: 'Trebuchet MS',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d4f5d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  userDetailsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalButtonPressed: {
    opacity: 0.8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
