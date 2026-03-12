import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export default function PrivacyPolicyScreen({
  onBack,
}: PrivacyPolicyScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-card sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="privacy.back_button"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Privacy Policy</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 py-6 space-y-6 text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          <div>
            <p className="text-xs text-muted-foreground mb-4">
              Last updated: March 2026
            </p>
            <p className="text-foreground font-semibold text-base mb-2">
              Phonex Privacy Policy
            </p>
            <p>
              Phonex ("we", "our", or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use the Phonex
              application.
            </p>
          </div>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              1. Information We Collect
            </h2>
            <p className="mb-2">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Full name, phone number, and email address during registration
              </li>
              <li>
                Bank account details for wallet/payment features (IBAN, bank
                name)
              </li>
              <li>Profile picture or avatar selection</li>
              <li>Messages, emails, and Feels you create within the app</li>
              <li>
                Financial transaction history (payments, transfers, top-ups)
              </li>
              <li>Contact list information you choose to add</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and manage your Phonex account</li>
              <li>
                To facilitate secure peer-to-peer and bank payments in PKR
              </li>
              <li>To deliver messages, emails, and status updates (Feels)</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To improve app functionality and user experience</li>
              <li>To comply with legal and regulatory obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              3. Data Storage & Security
            </h2>
            <p className="mb-2">
              Your data is stored using a hybrid architecture:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground">Local storage</strong> on
                your device for offline access and fast performance
              </li>
              <li>
                <strong className="text-foreground">ICP Blockchain</strong> for
                decentralized, tamper-resistant persistent storage
              </li>
              <li>
                All chats and financial transactions are{" "}
                <strong className="text-foreground">
                  end-to-end encrypted
                </strong>
              </li>
              <li>
                The Pocket (wallet) tab is protected by PIN or biometric
                authentication
              </li>
              <li>
                Every financial transaction requires a Secret Pocket Key you set
                yourself
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              4. Information Sharing
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share information only in the following
              circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>With your consent</li>
              <li>
                To comply with legal obligations or law enforcement requests
              </li>
              <li>To protect the rights and safety of Phonex users</li>
              <li>
                With banking partners to facilitate external bank transfers
                (only the minimum necessary data)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              5. Financial Data
            </h2>
            <p>
              Phonex handles sensitive financial information including bank
              account details and transaction history. This data is:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Encrypted at rest and in transit</li>
              <li>
                Protected by multi-factor authentication (PIN + biometrics)
              </li>
              <li>Never shared with advertisers or data brokers</li>
              <li>
                Retained for the minimum period required by Pakistani financial
                regulations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>
                Delete your account and associated data via Profile &gt; Account
                Settings &gt; Delete Account
              </li>
              <li>Withdraw consent for non-essential data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              7. Children's Privacy
            </h2>
            <p>
              Phonex is not intended for children under the age of 13. We do not
              knowingly collect personal information from children under 13. If
              you believe a child has provided us with personal information,
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any significant changes by updating the date at the
              top of this page. Continued use of Phonex after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold mb-2">
              9. Contact Us
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our
              data practices, please contact us through the Phonex app support
              channel.
            </p>
          </section>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              &copy; 2026 Phonex. All rights reserved.
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
