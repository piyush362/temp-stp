// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { ScreenWrapper } from '../../../components/wrapper';
// import HeaderNavigation from '../../../components/header/HeaderNavigation1';
// import { PRIVACY_POLICY_LINK, REFUND_POLICY_LINK } from '../../../../app.env';

// const LINK = REFUND_POLICY_LINK;

// function RefundPolicyScreen() {
//   return (
//     <ScreenWrapper headerComponent={<HeaderNavigation label="Refund Policy" />}>
//       <View style={styles.container}>
//         <WebView 
//           source={{ uri: LINK }} 
//           style={styles.webview}
//           startInLoadingState={true}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//         />
//       </View>
//     </ScreenWrapper>
//   );
// }

// export default RefundPolicyScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webview: {
//     flex: 1,
//   },
// });



import React from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import { ScreenWrapper } from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import { COLORS } from '../../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../../theme/styles.global';

function RefundPolicyScreen() {
  return (
    <ScreenWrapper headerComponent={<HeaderNavigation label="Refund Policy" />}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <Text style={BOLD_TEXT(20, COLORS.black)}>Refund Policy</Text>
        <Text style={REGULAR_TEXT(14, COLORS.gray)}>
          At Stapples, we strive to ensure every customer has a seamless and satisfactory 
          experience when using our self-service printing kiosks. While we aim to deliver 
          services flawlessly, refunds may be issued only under certain conditions.
        </Text>

        <Section title="1. Eligibility for Refunds">
          <Text style={styles.listItem}>• Document Unavailable Before 24 Hours: If the uploaded document is deleted due to technical fault before printing.</Text>
          <Text style={styles.listItem}>• Payment Charged but Printing Not Initiated: If payment is processed but the job does not start due to kiosk error.</Text>
          <Text style={styles.listItem}>• Incorrect Printing Due to System Error: Caused by software/hardware malfunction (e.g., cut-offs, blank pages).</Text>
          <Text style={styles.listItem}>• Duplicate Payment: If charged twice for the same document.</Text>
          <Text style={styles.listItem}>• Failed Transaction: Amount deducted but not received in our system.</Text>
        </Section>

        <Section title="2. Scenarios Where No Refund Will Be Provided">
          <Text style={styles.listItem}>• Customer uploads wrong file, format, or page selection.</Text>
          <Text style={styles.listItem}>• Incorrect print settings chosen by the customer.</Text>
          <Text style={styles.listItem}>• File not printed within 24 hours (auto-deleted as per Privacy Policy).</Text>
          <Text style={styles.listItem}>• Partial printing if stopped/cancelled mid-process by customer.</Text>
          <Text style={styles.listItem}>• External issues beyond our control (network outages, electricity failures, or payment gateway downtime).</Text>
        </Section>

        <Section title="3. Refund Process">
          <Text style={styles.listItem}>
            • All refund requests must be raised within 7 days of the transaction, with transaction ID, kiosk location, date & time, and issue details. 
            Approved refunds will be processed within 7–10 working days via the original payment method.
          </Text>
        </Section>

        <Section title="4. Contact for Refund Requests">
          <TouchableOpacity onPress={() => Linking.openURL('mailto:info@stapples.in')}>
            <Text style={[styles.listItem, { color: 'blue' }]}>
              • Email: info@stapples.in
            </Text>
          </TouchableOpacity>
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

export default RefundPolicyScreen;

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
