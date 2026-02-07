import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function OrdersTab() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>👕</Text>
        <Text style={styles.headerTitle}>New Order</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Type</Text>

        <TouchableOpacity style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>👔</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Regular Wash</Text>
            <Text style={styles.servicePrice}>$5.00</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🧥</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Dry Cleaning</Text>
            <Text style={styles.servicePrice}>$10.00</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🧵</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Ironing</Text>
            <Text style={styles.servicePrice}>$3.00</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>🎽</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Premium Wash</Text>
            <Text style={styles.servicePrice}>$8.00</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Proceed to Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    padding: 20,
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
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
});
