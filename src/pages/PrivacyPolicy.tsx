import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Cookie, Database, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to RoSiStrat
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="w-6 h-6 text-blue-400" />
                Privacy Policy
              </CardTitle>
              <p className="text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    1. Introduction
                  </h3>
                  <p>
                    Welcome to RoSiStrat ("we," "our," or "us"). This Privacy
                    Policy explains how we collect, use, disclose, and safeguard
                    your information when you use our European Roulette Strategy
                    Simulator platform.
                  </p>
                  <p>
                    RoSiStrat is created and maintained by Jadiss EL ANTAKI, as
                    a private, non-commercial educational project. This platform
                    is designed to simulate betting strategies for learning
                    purposes only. No real money gambling occurs on our
                    platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    2. Information We Collect
                  </h3>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Personal Information
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Account Information:</strong> Email address,
                      display name, and encrypted password when you create an
                      account
                    </li>
                    <li>
                      <strong>Profile Data:</strong> Starting investment
                      preferences and simulation settings
                    </li>
                    <li>
                      <strong>Authentication Data:</strong> Login timestamps and
                      session information
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Usage Information
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Simulation Data:</strong> Strategy selections,
                      simulation results, and performance metrics
                    </li>
                    <li>
                      <strong>Platform Usage:</strong> Pages visited, features
                      used, and time spent on platform
                    </li>
                    <li>
                      <strong>Technical Data:</strong> IP address, browser type,
                      device information, and operating system
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Automatically Collected Information
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      Log files and error reports for platform improvement
                    </li>
                    <li>Analytics data for understanding user behavior</li>
                    <li>Performance metrics for optimization</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    3. How We Use Your Information
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Service Provision:</strong> To provide and
                      maintain the simulation platform functionality
                    </li>
                    <li>
                      <strong>Account Management:</strong> To create and manage
                      your user account and preferences
                    </li>
                    <li>
                      <strong>Data Persistence:</strong> To save your simulation
                      results and settings across sessions
                    </li>
                    <li>
                      <strong>Platform Improvement:</strong> To analyze usage
                      patterns and improve our services
                    </li>
                    <li>
                      <strong>Communication:</strong> To send important updates
                      about our service (with your consent)
                    </li>
                    <li>
                      <strong>Security:</strong> To protect our platform and
                      users from fraud and abuse
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Cookie className="w-5 h-5" />
                    4. Cookies and Tracking Technologies
                  </h3>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Essential Cookies
                  </h4>
                  <p>
                    These cookies are necessary for the platform to function and
                    cannot be disabled:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Authentication and session management</li>
                    <li>User preferences and settings</li>
                    <li>Security and fraud prevention</li>
                    <li>Age verification compliance</li>
                  </ul>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Analytics Cookies (Optional)
                  </h4>
                  <p>With your consent, we use analytics cookies to:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Understand how users interact with our platform</li>
                    <li>Identify popular features and usage patterns</li>
                    <li>Improve platform performance and user experience</li>
                    <li>Generate anonymized usage statistics</li>
                  </ul>

                  <p className="mt-3 text-sm bg-blue-950/50 p-3 rounded">
                    <strong>Your Choice:</strong> You can accept or decline
                    analytics cookies through our cookie consent banner. You can
                    change your preference at any time through your browser
                    settings.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    5. Data Sharing and Disclosure
                  </h3>
                  <p>
                    We do not sell, trade, or rent your personal information to
                    third parties. We may share your information only in the
                    following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li>
                      <strong>Service Providers:</strong> With trusted
                      third-party services (Firebase, Google Analytics) that
                      help us operate our platform
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our rights and safety
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In connection with a
                      merger, acquisition, or sale of assets (with notice to
                      users)
                    </li>
                    <li>
                      <strong>Consent:</strong> When you explicitly consent to
                      sharing your information
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    6. Data Security
                  </h3>
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li>End-to-end encryption for data transmission</li>
                    <li>Secure authentication systems</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal data</li>
                    <li>Secure cloud infrastructure (Firebase/Google Cloud)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    7. Your Privacy Rights
                  </h3>
                  <p>Depending on your location, you may have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 mt-3">
                    <li>
                      <strong>Access:</strong> Request copies of your personal
                      data
                    </li>
                    <li>
                      <strong>Rectification:</strong> Correct inaccurate or
                      incomplete data
                    </li>
                    <li>
                      <strong>Erasure:</strong> Request deletion of your
                      personal data
                    </li>
                    <li>
                      <strong>Portability:</strong> Receive your data in a
                      portable format
                    </li>
                    <li>
                      <strong>Objection:</strong> Object to certain processing
                      of your data
                    </li>
                    <li>
                      <strong>Withdrawal:</strong> Withdraw consent at any time
                    </li>
                  </ul>
                  <p className="mt-3 text-sm bg-green-950/50 p-3 rounded">
                    To exercise these rights, please contact us at the email
                    address provided below.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    8. Children's Privacy
                  </h3>
                  <p>
                    RoSiStrat is not intended for children under 18 years of
                    age. We require age verification before platform access and
                    do not knowingly collect personal information from minors.
                    If we become aware that we have collected personal
                    information from a child under 18, we will take steps to
                    delete such information promptly.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    9. International Data Transfers
                  </h3>
                  <p>
                    Your information may be transferred to and processed in
                    countries other than your own. We ensure appropriate
                    safeguards are in place to protect your data in accordance
                    with this Privacy Policy and applicable laws.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    10. Changes to This Privacy Policy
                  </h3>
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the "Last updated" date. For
                    significant changes, we may provide additional notice.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    11. Contact Information
                  </h3>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p>
                      If you have any questions about this Privacy Policy or our
                      data practices, please contact us:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:privacy@rosistrat.com"
                          className="text-blue-400 hover:underline"
                        >
                          privacy@rosistrat.com
                        </a>
                      </li>
                      <li>
                        <strong>Data Protection Officer:</strong>{" "}
                        <a
                          href="mailto:dpo@rosistrat.com"
                          className="text-blue-400 hover:underline"
                        >
                          dpo@rosistrat.com
                        </a>
                      </li>
                      <li>
                        <strong>Response Time:</strong> We aim to respond to all
                        privacy inquiries within 30 days
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="border-t border-slate-600 pt-6 mt-8">
                  <div className="bg-amber-950/50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-amber-400 mb-2">
                      Important Reminder
                    </h4>
                    <p>
                      RoSiStrat is an educational simulation platform only. No
                      real money gambling occurs. All simulations use virtual
                      currency for learning and research purposes.
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
