// import React from 'react';
// import { StyleSheet, View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { ScreenWrapper } from '../../../components/wrapper';
// import HeaderNavigation from '../../../components/header/HeaderNavigation1';
// import { PRIVACY_POLICY_LINK } from '../../../../app.env';

// const LINK = PRIVACY_POLICY_LINK;

// function PrivacyPolicyScreen() {
//   return (
//     <ScreenWrapper headerComponent={<HeaderNavigation label="Privacy Policy" />}>
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

// export default PrivacyPolicyScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webview: {
//     flex: 1,
//   },
// });

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {COLORS} from '../../../theme/colors';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';

function PrivacyPolicyScreen() {
  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Privacy Policy" />}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {/* Privacy Policy */}
        <Text style={BOLD_TEXT(20, COLORS.black)}>Privacy Policy</Text>
        <Text style={REGULAR_TEXT(14, COLORS.gray)}>
          PRINTORA LABS PVT. LTD. ("we," "our," "us," or "Stapples") is
          committed to protecting your privacy. This Privacy Policy describes
          how we collect, use, disclose, and safeguard your information when you
          use our mobile application, kiosks, and website (together, the
          "Services").
        </Text>

        <Section title="1. Information We Collect">
          <Text style={styles.listItem}>
            • Personal Information: Name, email address, phone number, and
            location data (to recommend nearest kiosks).
          </Text>
          <Text style={styles.listItem}>
            • Document Data: Uploaded files (e.g., PDFs, Word, images).
            Auto-deleted after 10 minutes post-print or 24 hours if unused.
          </Text>
          <Text style={styles.listItem}>
            • Payment Data: Processed via third-party gateways. We do not store
            card numbers or bank details.
          </Text>
          <Text style={styles.listItem}>
            • Device & Usage Info: Device type, IP address, OS, app behavior,
            and logs.
          </Text>
        </Section>

        <Section title="2. How We Use Your Information">
          <Text style={styles.listItem}>
            • To manage print requests and payments.
          </Text>
          <Text style={styles.listItem}>• To enhance our services and UX.</Text>
          <Text style={styles.listItem}>
            • To send notifications (if opted-in).
          </Text>
        </Section>

        <Section title="3. Sharing of Information">
          <Text style={styles.listItem}>
            • We do not sell or rent your data.
          </Text>
          <Text style={styles.listItem}>
            • Shared only with payment gateways, legal authorities (if
            required), and franchise owners (aggregated analytics only).
          </Text>
        </Section>

        <Section title="4. Data Retention">
          <Text style={styles.listItem}>
            • Documents are auto-deleted. Other data is kept as long as needed
            by services or law.
          </Text>
        </Section>

        <Section title="5. Your Rights">
          <Text style={styles.listItem}>• Access and correction of data.</Text>
          <Text style={styles.listItem}>• Withdraw consent.</Text>
          <Text style={styles.listItem}>• Request account deletion.</Text>
        </Section>

        <Section title="6. Security">
          <Text style={styles.listItem}>
            • We use end-to-end encryption, secure servers hosted in India, and
            regular security audits.
          </Text>
        </Section>

        <Section title="7. Changes to This Policy">
          <Text style={styles.listItem}>
            • Updates will be posted on our app or website.
          </Text>
        </Section>

        <Section title="8. Contact Us">
          <Text style={styles.listItem}>Printora Labs Pvt. Ltd.</Text>
          <Text style={styles.listItem}>Email: info@stapples.in</Text>
          <Text style={styles.listItem}>Phone: +91-8595568445</Text>
          <Text style={styles.listItem}>
            Address: 12/27 FF West Patel Nagar, New Delhi - 110008
          </Text>
        </Section>

        {/* Refund Policy */}
        <Text style={[BOLD_TEXT(20, COLORS.black), {marginTop: 20}]}>
          Refund Policy
        </Text>
        <Text style={REGULAR_TEXT(14, COLORS.gray)}>
          At Stapples, we strive to ensure every customer has a seamless and
          satisfactory experience when using our self-service printing kiosks.
          While we aim to deliver services flawlessly, refunds may be issued
          only under certain conditions.
        </Text>

        <Section title="1. Eligibility for Refunds">
          <Text style={styles.listItem}>
            • Document Unavailable Before 24 Hours: If the uploaded document is
            deleted due to technical fault before printing.
          </Text>
          <Text style={styles.listItem}>
            • Payment Charged but Printing Not Initiated: If payment is
            processed but the job does not start due to kiosk error.
          </Text>
          <Text style={styles.listItem}>
            • Incorrect Printing Due to System Error: Caused by
            software/hardware malfunction (e.g., cut-offs, blank pages).
          </Text>
          <Text style={styles.listItem}>
            • Duplicate Payment: If charged twice for the same document.
          </Text>
          <Text style={styles.listItem}>
            • Failed Transaction: Amount deducted but not received in our
            system.
          </Text>
        </Section>

        <Section title="2. Scenarios Where No Refund Will Be Provided">
          <Text style={styles.listItem}>
            • Customer uploads wrong file, format, or page selection.
          </Text>
          <Text style={styles.listItem}>
            • Incorrect print settings chosen by the customer.
          </Text>
          <Text style={styles.listItem}>
            • File not printed within 24 hours (auto-deleted as per Privacy
            Policy).
          </Text>
          <Text style={styles.listItem}>
            • Partial printing if stopped/cancelled mid-process by customer.
          </Text>
          <Text style={styles.listItem}>
            • External issues beyond our control (network outages, electricity
            failures, or payment gateway downtime).
          </Text>
        </Section>

        <Section title="3. Refund Process">
          <Text style={styles.listItem}>
            • All refund requests must be raised within 7 days of the
            transaction, with transaction ID, kiosk location, date & time, and
            issue details. Approved refunds will be processed within 7–10
            working days via the original payment method.
          </Text>
        </Section>

        <Section title="4. Contact for Refund Requests">
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:info@stapples.in')}>
            <Text style={[styles.listItem, {color: 'blue'}]}>
              • Email: info@stapples.in
            </Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{marginTop: 15}}>
      <Text style={BOLD_TEXT(16, COLORS.black)}>{title}</Text>
      <View style={{marginTop: 5}}>{children}</View>
    </View>
  );
}

export default PrivacyPolicyScreen;

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
