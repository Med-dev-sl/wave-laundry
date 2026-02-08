import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const API_BASE_URL = 'http://10.140.218.56:3000/api';

interface UserData {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface HistoryTabProps {
  userData?: UserData;
}

export function HistoryTab({ userData }: HistoryTabProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    if (!userData?.userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/user/${userData.userId}`);
      if (response.ok) {
        const result = await response.json();
        setOrders(result.orders || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#FFE8E8', text: '#FF6B6B' },
      accepted: { bg: '#E8F5E9', text: '#4CAF50' },
      processing: { bg: '#E3F2FD', text: '#1976D2' },
      washing: { bg: '#E3F2FD', text: '#1976D2' },
      drying: { bg: '#E3F2FD', text: '#1976D2' },
      folding: { bg: '#E3F2FD', text: '#1976D2' },
      ironing: { bg: '#E3F2FD', text: '#1976D2' },
      packaging: { bg: '#E3F2FD', text: '#1976D2' },
      ready: { bg: '#F3E5F5', text: '#7B1FA2' },
      completed: { bg: '#C8E6C9', text: '#2E7D32' },
      cancelled: { bg: '#F0F0F0', text: '#666' },
    };
    return colors[status] || { bg: '#F0F0F0', text: '#666' };
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>Place an order to see it in your history</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            {orders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              return (
                <View key={order.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderNumber}>Order #{order.id}</Text>
                      <Text style={styles.orderDate}>{orderDate}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderItems}>
                    <Text style={styles.itemText}>Service: {order.service_title}</Text>
                    <Text style={styles.itemText}>Delivery: {order.delivery_option}</Text>
                    {order.address && <Text style={styles.itemText}>Address: {order.address}</Text>}
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.totalAmount}>Fee: SLe {order.delivery_fee}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Trebuchet MS',
  },
  section: {
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },
  orderItems: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  orderFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
    fontFamily: 'Trebuchet MS',
  },
});
