import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface HomeTabProps {
  userData?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
  };
}

export function HomeTab({ userData }: HomeTabProps) {
  const userName = userData?.userName || 'Guest';

  const services = [
    { key: 'wash', label: 'Wash', icon: '🧺' },
    { key: 'dry', label: 'Dry', icon: '💨' },
    { key: 'fold', label: 'Fold', icon: '👕' },
    { key: 'ironing', label: 'Ironing', icon: '♨' },
    { key: 'pack', label: 'Packaging', icon: '📦' },
  ];

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

  // Animated slide-in for the services header
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Card animations
  const cardAnims = useRef(
    packages.map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();

    // Staggered animation for cards
    cardAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, [slideAnim, cardAnims]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome,</Text>
        <Text style={styles.userName}>{userName} 👋</Text>
      </View>

      <Animated.View style={[styles.servicesBanner, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.servicesText}>Services we offer at Wave Laundry</Text>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesRow}
      >
        {services.map((s) => (
          <TouchableOpacity key={s.key} style={styles.serviceCard} activeOpacity={0.8}>
            <Text style={styles.serviceIcon}>{s.icon}</Text>
            <Text style={styles.serviceLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.packagesSection}>
        <Text style={styles.packagesSectionTitle}>Service Packages</Text>
        <View style={styles.packagesGrid}>
          {packages.map((pkg, index) => (
            <Animated.View
              key={pkg.key}
              style={[
                styles.packageCard,
                {
                  transform: [{ scale: cardAnims[index].scale }],
                  opacity: cardAnims[index].opacity,
                },
              ]}
            >
              <TouchableOpacity activeOpacity={0.8} style={styles.cardContent}>
                <Text style={styles.packageIcon}>{pkg.icon}</Text>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packageWeight}>{pkg.weight}</Text>
                <Text style={styles.packagePrice}>{pkg.price}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Trebuchet MS',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
  },

  servicesBanner: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
  },
  servicesText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '700',
    fontFamily: 'Trebuchet MS',
  },

  servicesRow: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  serviceCard: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
  },

  packagesSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  packagesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
    marginBottom: 16,
  },
  packagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
  },
  packageIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Trebuchet MS',
    marginBottom: 4,
    textAlign: 'center',
  },
  packageWeight: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Trebuchet MS',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    fontFamily: 'Trebuchet MS',
  },
});
