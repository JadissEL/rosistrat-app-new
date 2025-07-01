import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Target,
  Shield,
  Brain,
  Heart,
  FolderOpen,
  BookOpen,
  Rocket,
  Mail,
  Calendar,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
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
          {/* Main About Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Target className="w-8 h-8 text-green-400" />
                About RoSiStrat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg leading-relaxed space-y-4">
                <p>
                  <strong className="text-green-400">RoSiStrat</strong> is a
                  personal project created by{" "}
                  <strong className="text-blue-400">Jadiss EL ANTAKI</strong>.
                </p>
                <p>
                  This platform is designed to simulate and analyze various
                  roulette strategies strictly for educational and theoretical
                  purposes.
                </p>
                <p>
                  It does not promote gambling and is not affiliated with any
                  online or offline betting platform. The aim is to encourage
                  mathematical thinking and risk analysis through simulation.
                </p>
                <p>
                  All simulations and results are hypothetical. Please play
                  responsibly and be aware of the laws in your country.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-green-950/30 p-4 rounded-lg text-center">
                  <GraduationCap className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-400">Educational</h4>
                  <p className="text-sm text-green-200">
                    Learn probability theory and risk management
                  </p>
                </div>
                <div className="bg-blue-950/30 p-4 rounded-lg text-center">
                  <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-400">Analytical</h4>
                  <p className="text-sm text-blue-200">
                    Mathematical analysis of betting systems
                  </p>
                </div>
                <div className="bg-purple-950/30 p-4 rounded-lg text-center">
                  <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-400">Safe</h4>
                  <p className="text-sm text-purple-200">
                    No real money, purely virtual simulations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Profile */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-green-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                About the Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-slate-800/50 p-6 rounded-lg text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-slate-900">
                        JA
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-400">
                      Jadiss EL ANTAKI
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Creator & Developer
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-400"
                      >
                        Developer
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400"
                      >
                        Educator
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Passion & Mission
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Passionate about probability theory and strategy
                      simulation, Jadiss built RoSiStrat to help users
                      understand the logic behind betting systems – without
                      risking real money. The goal is to demystify gambling
                      mathematics and promote educated decision-making.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">
                      Technical Expertise
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-300">• React & TypeScript</div>
                      <div className="text-slate-300">
                        • Statistical Analysis
                      </div>
                      <div className="text-slate-300">• Probability Theory</div>
                      <div className="text-slate-300">• Algorithm Design</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">
                      Educational Philosophy
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      "Understanding the mathematics behind betting systems is
                      crucial for making informed decisions. RoSiStrat provides
                      a safe environment to explore these concepts without
                      financial risk."
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Support the Project
                    </h4>
                    <p className="text-yellow-200 text-sm leading-relaxed mb-3">
                      RoSiStrat is a free, open educational project. If you find
                      it valuable and would like to support continued
                      development and hosting costs, any contribution is greatly
                      appreciated.
                    </p>
                    <Button
                      onClick={() =>
                        window.open(
                          "https://paypal.me/JadissEL?country.x=GR&locale.x=en_US",
                          "_blank",
                        )
                      }
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Donate via PayPal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Goals */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Project Goals & Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-green-400 mb-3">
                    🎯 Primary Objectives
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Educate users about probability and risk</li>
                    <li>
                      • Demonstrate mathematical realities of betting systems
                    </li>
                    <li>• Provide safe environment for strategy testing</li>
                    <li>• Promote responsible gaming awareness</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-3">
                    🛡️ Core Values
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Transparency in all algorithms</li>
                    <li>• No promotion of real money gambling</li>
                    <li>• Educational content over entertainment</li>
                    <li>• Open source development approach</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Projects */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-blue-400" />
                My Existing Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    RoSiStrat
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Advanced European Roulette Strategy Simulator with 6
                    sophisticated betting strategies, realistic variance
                    simulation, and comprehensive analytics.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-400 text-xs"
                    >
                      Live
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-400 border-blue-400 text-xs"
                    >
                      React + TypeScript
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border-2 border-dashed border-slate-600">
                  <h4 className="font-semibold text-slate-400 mb-2">
                    More Projects Coming
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Stay tuned for more innovative educational and analytical
                    tools. Each project focuses on making complex concepts
                    accessible through interactive simulation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog Section */}
          <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-400" />
                Check My Blog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-3">
                  Insights & Tutorials
                </h3>
                <p className="text-slate-300 mb-4 max-w-2xl mx-auto">
                  Explore my blog where I share insights about probability
                  theory, software development, mathematical modeling, and the
                  intersection of technology and education. Deep dives into
                  algorithm design, statistical analysis, and project
                  development.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.open("#", "_blank")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read My Blog
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("#", "_blank")}
                    className="border-green-400 text-green-400 hover:bg-green-400/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Subscribe to Updates
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Topics: Probability Theory • Algorithm Design • Educational
                  Technology • Statistical Analysis
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Coming Projects */}
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-purple-400" />
                Coming Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Trading Simulator
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Educational platform for understanding algorithmic trading
                    strategies, market analysis, and risk management using
                    artificial intelligence.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-purple-400 border-purple-400 text-xs"
                    >
                      In Development
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-orange-400 border-orange-400 text-xs"
                    >
                      AI/ML
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Statistics Learning Platform
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Interactive learning environment for statistics and
                    probability theory with visual simulations and real-time
                    experiments.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-blue-400 border-blue-400 text-xs"
                    >
                      Planning
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-400 text-xs"
                    >
                      Educational
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-teal-400 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Portfolio Optimizer
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Advanced portfolio optimization tool using modern portfolio
                    theory, Monte Carlo simulations, and risk analysis
                    algorithms.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-teal-400 border-teal-400 text-xs"
                    >
                      Research Phase
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-purple-400 border-purple-400 text-xs"
                    >
                      Finance
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-400 mb-2 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Probability Playground
                  </h4>
                  <p className="text-slate-300 text-sm mb-3">
                    Interactive probability experiments and visualizations for
                    students and educators. Making complex concepts intuitive
                    and engaging.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-pink-400 border-pink-400 text-xs"
                    >
                      Conceptual
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-yellow-400 border-yellow-400 text-xs"
                    >
                      Gamification
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm mb-3">
                  Interested in early access or collaboration on these projects?
                </p>
                <Button
                  onClick={() =>
                    window.open(
                      "mailto:elantaki.dijadiss@gmail.com?subject=Interest in Upcoming Projects&body=Hi Jadiss,%0D%0A%0D%0AI am interested in learning more about your upcoming projects and potential collaboration opportunities.%0D%0A%0D%0ABest regards,",
                      "_blank",
                    )
                  }
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Section */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-400" />
                Collaboration & Consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-orange-400 mb-3">
                  Let's Work Together
                </h3>
                <p className="text-slate-300 max-w-2xl mx-auto">
                  I'm available for consultations, collaborations, and custom
                  project development. Whether you need help with probability
                  analysis, algorithm design, educational platform development,
                  or statistical modeling, I'd love to discuss how we can work
                  together.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-800/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book an Appointment
                  </h4>
                  <p className="text-slate-300 text-sm mb-4">
                    Schedule a consultation to discuss your project needs,
                    collaboration opportunities, or get expert advice on
                    probability theory and algorithm design.
                  </p>
                  <Button
                    onClick={() =>
                      window.open(
                        "mailto:elantaki.dijadiss@gmail.com?subject=Appointment Request&body=Hi Jadiss,%0D%0A%0D%0AI would like to schedule an appointment to discuss:%0D%0A%0D%0A- Project Type: [Please specify]%0D%0A- Timeline: [When do you need this]%0D%0A- Budget Range: [If applicable]%0D%0A- Preferred Meeting Time: [Your timezone]%0D%0A%0D%0AAdditional Details:%0D%0A[Please provide more context about your project or consultation needs]%0D%0A%0D%0ABest regards,%0D%0A[Your Name]",
                        "_blank",
                      )
                    }
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Request Appointment
                  </Button>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Send Direct Email
                  </h4>
                  <p className="text-slate-300 text-sm mb-4">
                    Have a quick question or want to start a conversation? Send
                    me an email directly and I'll get back to you within 24-48
                    hours.
                  </p>
                  <Button
                    onClick={() =>
                      window.open(
                        "mailto:elantaki.dijadiss@gmail.com?subject=Collaboration Inquiry&body=Hi Jadiss,%0D%0A%0D%0AI came across your work on RoSiStrat and would like to discuss:%0D%0A%0D%0A[Please describe your inquiry or project]%0D%0A%0D%0ABest regards,%0D%0A[Your Name]",
                        "_blank",
                      )
                    }
                    variant="outline"
                    className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>

              <div className="mt-6 bg-slate-800/30 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-300 mb-3">
                  Services I Offer:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="text-slate-300">• Algorithm Design</div>
                  <div className="text-slate-300">• Statistical Analysis</div>
                  <div className="text-slate-300">• Educational Platforms</div>
                  <div className="text-slate-300">• Probability Modeling</div>
                  <div className="text-slate-300">• Web Development</div>
                  <div className="text-slate-300">• Data Visualization</div>
                  <div className="text-slate-300">• Risk Assessment</div>
                  <div className="text-slate-300">• Custom Simulations</div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-slate-400 text-xs">📧 Email: </span>
                  <a
                    href="mailto:elantaki.dijadiss@gmail.com"
                    className="text-orange-400 hover:text-orange-300 text-xs"
                  >
                    elantaki.dijadiss@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Legal */}
          <Card className="bg-amber-950/30 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400">
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-amber-200">
                  <strong>Non-Commercial Project:</strong> RoSiStrat is a
                  personal, educational project with no commercial intent.
                </p>
                <p className="text-amber-200">
                  <strong>No Gambling Promotion:</strong> This platform does not
                  encourage, promote, or facilitate real money gambling.
                </p>
                <p className="text-amber-200">
                  <strong>Educational Purpose Only:</strong> All simulations are
                  theoretical and should not be used as gambling advice.
                </p>
                <p className="text-amber-200">
                  <strong>Legal Compliance:</strong> Users are responsible for
                  ensuring compliance with local laws regarding gambling and
                  gaming simulation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
