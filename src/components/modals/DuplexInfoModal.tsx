import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function DuplexInfoModal({isVisible, onClose}: Props) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#4F46E5"
              />
              <Text style={styles.title}>About Duplex Printing</Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={{paddingBottom: 10}}
            showsVerticalScrollIndicator={false}>
            {/* Single Side */}
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={18}
                color="#555"
              />
              <View style={styles.textContainer}>
                <Text style={styles.sectionTitle}>Single Sided</Text>
                <Text style={styles.description}>
                  Each page is printed on a separate sheet of paper. Example: A
                  10-page document will use 10 sheets.
                </Text>
              </View>
            </View>

            {/* Double Side */}
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="file-document-multiple-outline"
                size={18}
                color="#555"
              />
              <View style={styles.textContainer}>
                <Text style={styles.sectionTitle}>Double Sided</Text>
                <Text style={styles.description}>
                  Pages are printed on both sides of a sheet. Example: A 10-page
                  document will use only 5 sheets.
                </Text>
              </View>
            </View>

            {/* Page Count Note */}
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                📄 <Text style={styles.bold}>Page Count Note:</Text>
                {'\n'}
                If your document has only 1 page, double sided printing works
                like single sided since there is no second page to print on the
                back.
                {'\n\n'}
                If your document has an odd number of pages, the last page
                prints on the front and the back side remains blank.
              </Text>
            </View>

            {/* Multiple Docs Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Since you can upload multiple documents, the selected duplex
                type will apply to all uploaded documents.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  description: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    lineHeight: 18,
  },
  noteBox: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 14,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
