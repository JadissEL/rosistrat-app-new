import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsOfUse() {
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
                <FileText className="w-6 h-6 text-blue-400" />
                Terms of Use
              </CardTitle>
              <p className="text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    1. Acceptance of Terms
                  </h3>
                  <p>
                    By accessing and using RoSiStrat ("the Platform," "we,"
                    "us," or "our"), you accept and agree to be bound by the
                    terms and provision of this agreement. If you do not agree
                    to abide by the above, please do not use this service.
                  </p>
                  <p>
                    RoSiStrat is created and maintained by Jadiss EL ANTAKI, as
                    a private, non-commercial educational project.
                  </p>
                  <div className="bg-red-950/50 p-4 rounded-lg mt-4">
                    <p className="text-red-300">
                      <strong>Age Requirement:</strong> You must be 18 years or
                      older to use this platform. By using RoSiStrat, you
                      represent and warrant that you meet this age requirement.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    2. Educational Purpose and Disclaimers
                  </h3>

                  <h4 className="text-lg font-medium text-amber-400 mt-4 mb-2">
                    Educational Platform Only
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      RoSiStrat is designed exclusively for educational and
                      research purposes
                    </li>
                    <li>
                      All simulations use virtual currency with no real monetary
                      value
                    </li>
                    <li>
                      No real money gambling, betting, or wagering occurs on
                      this platform
                    </li>
                    <li>
                      The platform teaches probability, statistics, and risk
                      management concepts
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-amber-400 mt-4 mb-2">
                    Important Disclaimers
                  </h4>
                  <div className="bg-yellow-950/50 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>No Gambling Advice:</strong> RoSiStrat does not
                        provide gambling advice or encourage real money betting
                      </li>
                      <li>
                        <strong>Educational Results:</strong> Simulation results
                        are for learning purposes and do not guarantee
                        real-world outcomes
                      </li>
                      <li>
                        <strong>Risk Awareness:</strong> Real gambling involves
                        significant financial risk and can be addictive
                      </li>
                      <li>
                        <strong>No Guarantees:</strong> Past simulation
                        performance does not predict future real-world results
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    3. User Accounts and Responsibilities
                  </h3>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    Account Creation
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      You may create an account to save simulation data
                      permanently
                    </li>
                    <li>You must provide accurate and complete information</li>
                    <li>
                      You are responsible for maintaining the security of your
                      account
                    </li>
                    <li>
                      You must notify us immediately of any unauthorized use
                    </li>
                  </ul>

                  <h4 className="text-lg font-medium text-green-400 mt-4 mb-2">
                    User Conduct
                  </h4>
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>
                      Use the platform for any illegal or unauthorized purpose
                    </li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>
                      Interfere with or disrupt the platform's functionality
                    </li>
                    <li>
                      Use automated tools to access or scrape the platform
                    </li>
                    <li>Share your account credentials with others</li>
                    <li>Create multiple accounts to circumvent limitations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    4. Intellectual Property Rights
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      The platform, including all content, features, and
                      functionality, is owned by RoSiStrat
                    </li>
                    <li>
                      All algorithms, simulation logic, and code are proprietary
                    </li>
                    <li>
                      You may not copy, modify, distribute, or reverse engineer
                      our platform
                    </li>
                    <li>
                      User-generated data (simulation results) remains your
                      property but may be aggregated anonymously for platform
                      improvement
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    5. Privacy and Data Protection
                  </h3>
                  <p>
                    Your privacy is important to us. Our collection and use of
                    personal information is governed by our Privacy Policy,
                    which is incorporated into these Terms by reference. By
                    using RoSiStrat, you consent to the collection and use of
                    your information as outlined in our Privacy Policy.
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/privacy")}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                    >
                      Read Privacy Policy
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    6. Platform Availability and Modifications
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      We strive to maintain platform availability but cannot
                      guarantee uninterrupted service
                    </li>
                    <li>
                      We may modify, suspend, or discontinue features at any
                      time
                    </li>
                    <li>
                      We may update these Terms of Use and will notify users of
                      significant changes
                    </li>
                    <li>
                      Continued use of the platform after changes constitutes
                      acceptance of new terms
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    7. Limitation of Liability
                  </h3>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="mb-3">
                      <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        RoSiStrat provides the platform "as is" without
                        warranties of any kind
                      </li>
                      <li>
                        We disclaim all warranties, express or implied,
                        including merchantability and fitness for a particular
                        purpose
                      </li>
                      <li>
                        We shall not be liable for any direct, indirect,
                        incidental, or consequential damages
                      </li>
                      <li>
                        Our total liability shall not exceed the amount paid by
                        you for using the platform (if any)
                      </li>
                      <li>
                        We are not responsible for decisions made based on
                        simulation results
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    8. Indemnification
                  </h3>
                  <p>
                    You agree to indemnify and hold harmless RoSiStrat and its
                    affiliates from any claims, damages, losses, or expenses
                    arising from your use of the platform, violation of these
                    terms, or infringement of any rights of another.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    9. Termination
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      You may terminate your account at any time by contacting
                      us
                    </li>
                    <li>
                      We may terminate or suspend accounts for violations of
                      these terms
                    </li>
                    <li>
                      Upon termination, your right to use the platform ceases
                      immediately
                    </li>
                    <li>
                      We will retain your data according to our Privacy Policy
                      and legal requirements
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    10. Governing Law and Dispute Resolution
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      These terms are governed by the laws of [Your
                      Jurisdiction]
                    </li>
                    <li>
                      Any disputes will be resolved through binding arbitration
                    </li>
                    <li>
                      You waive any right to participate in class action
                      lawsuits
                    </li>
                    <li>
                      If arbitration is unavailable, disputes will be heard in
                      courts of [Your Jurisdiction]
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    11. Responsible Gaming Resources
                  </h3>
                  <div className="bg-blue-950/50 p-4 rounded-lg">
                    <p className="mb-3">
                      While RoSiStrat is educational only, we promote
                      responsible gaming awareness:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>GamCare:</strong>{" "}
                        <a
                          href="https://www.gamcare.org.uk/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          gamcare.org.uk
                        </a>
                      </li>
                      <li>
                        <strong>Gambling Therapy:</strong>{" "}
                        <a
                          href="https://www.gamblingtherapy.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          gamblingtherapy.org
                        </a>
                      </li>
                      <li>
                        <strong>National Problem Gambling Helpline:</strong>{" "}
                        <a
                          href="https://www.ncpgambling.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          ncpgambling.org
                        </a>
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">
                    12. Contact Information
                  </h3>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p>Questions about these Terms of Use? Contact us:</p>
                    <ul className="mt-3 space-y-2">
                      <li>
                        <strong>Email:</strong>{" "}
                        <a
                          href="mailto:legal@rosistrat.com"
                          className="text-blue-400 hover:underline"
                        >
                          legal@rosistrat.com
                        </a>
                      </li>
                      <li>
                        <strong>General Support:</strong>{" "}
                        <a
                          href="mailto:support@rosistrat.com"
                          className="text-blue-400 hover:underline"
                        >
                          support@rosistrat.com
                        </a>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="border-t border-slate-600 pt-6 mt-8">
                  <div className="bg-gradient-to-r from-red-950/50 to-amber-950/50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Final Important Notice
                    </h4>
                    <div className="space-y-3 text-sm">
                      <p>
                        <strong className="text-amber-400">
                          Educational Platform:
                        </strong>
                        RoSiStrat is strictly for educational purposes. No real
                        money is involved in any simulations.
                      </p>
                      <p>
                        <strong className="text-amber-400">
                          Real Gambling Risks:
                        </strong>
                        Real gambling involves substantial risk of financial
                        loss and can be addictive.
                      </p>
                      <p>
                        <strong className="text-amber-400">
                          Seek Help if Needed:
                        </strong>
                        If you have a gambling problem, please seek professional
                        help immediately.
                      </p>
                    </div>
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
