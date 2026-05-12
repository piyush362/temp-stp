import React from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import { ScreenWrapper } from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import { COLORS } from '../../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../../theme/styles.global';

function TermsAndConditionScreen() {
  return (
    <ScreenWrapper headerComponent={<HeaderNavigation label="Terms and Conditions" />}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <Text style={BOLD_TEXT(20, COLORS.black)}>Terms and Conditions</Text>
        <Text style={REGULAR_TEXT(14, COLORS.gray)}>
          These Terms and Conditions ("Terms") govern your use of Stapples' mobile application, kiosks, and website (collectively, the "Services"). 
          By accessing or using our Services, you agree to be bound by these Terms.
        </Text>

        <Section title="1. User Responsibilities">
          <Text style={styles.listItem}>• You must use the Services for lawful purposes only.</Text>
          <Text style={styles.listItem}>• You must not upload, print, or distribute illegal, offensive, or copyrighted material without proper authorization.</Text>
        </Section>

        <Section title="2. Account & App Usage">
          <Text style={styles.listItem}>• You are responsible for maintaining the confidentiality of your account credentials.</Text>
          <Text style={styles.listItem}>• You agree to provide accurate and up-to-date information.</Text>
        </Section>

        <Section title="3. Payment Terms">
          <Text style={styles.listItem}>• All payments are processed via third-party platforms. Once a print request is processed, payments are non-refundable except in cases of kiosk malfunction or explicit error on our part.</Text>
        </Section>

        <Section title="4. Use of Kiosks">
          <Text style={styles.listItem}>• Kiosks are provided for self-service printing only. Misuse, vandalism, or unauthorized access will be reported to authorities.</Text>
        </Section>

        <Section title="5. Intellectual Property">
          <Text style={styles.listItem}>• All software, branding, and content associated with Stapples are the property of Printora Labs Pvt. Ltd. You may not copy, reverse-engineer, reproduce, or redistribute our Services without prior written permission.</Text>
        </Section>

        <Section title="6. Limitation of Liability">
          <Text style={styles.listItem}>• Stapples is not liable for the quality of uploaded documents, delays caused by network issues, or third-party gateway errors. Our maximum liability is limited to the amount paid for a failed print transaction.</Text>
        </Section>

        <Section title="7. Termination">
          <Text style={styles.listItem}>• We reserve the right to suspend or terminate your access to the Services for violation of these Terms, at our sole discretion.</Text>
        </Section>

        <Section title="8. Governing Law">
          <Text style={styles.listItem}>• These Terms are governed by the laws of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts in Delhi.</Text>
        </Section>

        <Section title="9. Contact Us">
          <Text style={styles.listItem}>Printora Labs Pvt. Ltd.</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:info@stapples.in')}>
            <Text style={[styles.listItem, { color:'blue'}]}>Email: info@stapples.in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('tel:+918595568445')}>
            <Text style={[styles.listItem, { color: 'blue' }]}>Phone: +91-8595568445</Text>
          </TouchableOpacity>
          <Text style={styles.listItem}>Address: 12/27 FF West Patel Nagar, New Delhi - 110008</Text>
        </Section>

      </ScrollView>
    </ScreenWrapper>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 15 }}>
      <Text style={BOLD_TEXT(16, COLORS.black)}>{title}</Text>
      <View style={{ marginTop: 5 }}>{children}</View>
    </View>
  );
}

export default TermsAndConditionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  listItem: {
    ...REGULAR_TEXT(14, COLORS.gray),
    marginBottom: 5,
  },
});
