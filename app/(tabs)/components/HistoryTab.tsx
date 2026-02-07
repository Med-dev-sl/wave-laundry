import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function HistoryTab() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.orderNumber}>Order #12345</Text>
            <Text style={styles.orderStatus}>Completed</Text>
          </View>
          <Text style={styles.orderDate}>Feb 5, 2026</Text>
          <View style={styles.orderItems}>
            <Text style={styles.itemText}>• 5 Shirts</Text>
            <Text style={styles.itemText}>• 2 Trousers</Text>
          </View>
          <View style={styles.orderFooter}>
            <Text style={styles.totalAmount}>Total: $15.00</Text>
            <TouchableOpacity>
              <Text style={styles.reorderLink}>Reorder</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.orderNumber}>Order #12344</Text>
            <Text style={[styles.orderStatus, { color: '#FF9800' }]}>
              Processing
            </Text>
          </View>
          <Text style={styles.orderDate}>Feb 3, 2026</Text>
          <View style={styles.orderItems}>
            <Text style={styles.itemText}>• 3 Jackets</Text>
          </View>
          <View style={styles.orderFooter}>
            <Text style={styles.totalAmount}>Total: $25.00</Text>
            <TouchableOpacity>
              <Text style={styles.trackLink}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No more orders to show</Text>
        </View>
      </View>
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
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  orderItems: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  reorderLink: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  trackLink: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});
