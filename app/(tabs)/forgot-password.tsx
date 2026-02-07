import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_BASE_URL = 'http://10.140.218.56:3000/api';

interface FormErrors {
  email?: string;
}

interface ResetData {
  message: string;
  email: string;
}

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resetData, setResetData] = useState<ResetData | null>(null);
  
  const emailUnderline = useRef(new Animated.Value(0)).current;

  const animateUnderline = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setErrors({ email: 'Email not found in our records' });
        } else if (response.status === 400) {
          Alert.alert('Error', data.message || 'Please check your email');
        } else {
          Alert.alert('Request Failed', data.message || 'Something went wrong');
        }
        return;
      }

      setResetData({
        message: data.message,
        email: email.trim(),
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
    setEmail('');
    setErrors({});
    setResetData(null);
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors({});
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
            <Text style={styles.subtitle}>Reset Your Password</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Instructions */}
            <Text style={styles.instructionText}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputUnderline}
                  placeholder="john@example.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleInputChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  maxLength={255}
                  onFocus={() => animateUnderline(emailUnderline, 1)}
                  onBlur={() => animateUnderline(emailUnderline, 0)}
                />
              </View>
              <Animated.View
                style={[
                  styles.underline,
                  { transform: [{ scaleX: emailUnderline }] },
                ]}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleForgotPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.infoText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.linkText}>Sign In</Text>
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
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMessage}>
              Check your email for password reset instructions.
            </Text>

            {/* Email Display */}
            {resetData && (
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxText}>
                  A reset link has been sent to {resetData.email}
                </Text>
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
              <Text style={styles.modalButtonText}>Back to Login</Text>
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
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  inputUnderline: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'System',
  },
  underline: {
    height: 2,
    backgroundColor: '#87CEEB',
    transform: [{ scaleX: 0 }],
    marginTop: 4,
    alignSelf: 'stretch',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    fontWeight: '500',
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
  infoBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
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
