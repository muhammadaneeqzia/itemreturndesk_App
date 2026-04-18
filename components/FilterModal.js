import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppIcon from './AppIcon';

const { width } = Dimensions.get('window');

const categories = ['All', 'Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other'];
const timeFilters = ['All Time', 'Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];
const sortOptions = ['Newest First', 'Oldest First', 'Most Recent'];

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedTime, setSelectedTime] = useState(initialFilters.time || 'All Time');
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort || 'Newest First');

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      time: selectedTime,
      sort: selectedSort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedTime('All Time');
    setSelectedSort('Newest First');
    onApply({
      category: 'All',
      time: 'All Time',
      sort: 'Newest First',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <AppIcon name="close" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && { backgroundColor: colors.primary },
                      selectedCategory !== category && {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            selectedCategory === category
                              ? colors.textInverse
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Time Period</Text>
              <View style={styles.filterOptions}>
                {timeFilters.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.filterChip,
                      selectedTime === time && { backgroundColor: colors.primary },
                      selectedTime !== time && {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            selectedTime === time ? colors.textInverse : colors.textSecondary,
                        },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              <View style={styles.filterOptions}>
                {sortOptions.map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.filterChip,
                      selectedSort === sort && { backgroundColor: colors.primary },
                      selectedSort !== sort && {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSort(sort)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            selectedSort === sort ? colors.textInverse : colors.textSecondary,
                        },
                      ]}
                    >
                      {sort}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={[styles.applyButtonText, { color: colors.textInverse }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilterModal;

