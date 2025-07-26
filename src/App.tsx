import React, { useState, useEffect } from "react"
import {
  Heart,
  ArrowLeft,
  MessageCircle,
  Users,
  Star,
  Check,
  ArrowRight,
  Moon,
  Sun,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Gift,
  Phone,
  ChevronRight,
  Send,
  User,
  Bot,
} from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  price: string
  features: string[]
  popular?: boolean
  emoji: string
}

interface Testimonial {
  id: string
  name: string
  age: number
  story: string
  rating: number
  relationshipType: string
  avatar: string
  beforeAfter: {
    before: string
    after: string
  }
}

interface Message {
  sender: "user" | "coach"
  content: string
  timestamp: Date
}

interface ChatSession {
  conversationId: string | null
  messages: Message[]
  isLoading: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

const services: Service[] = [
  {
    id: "subscription",
    title: "Monthly Support",
    description: "Ongoing relationship coaching with unlimited chat support",
    price: "$29/month",
    features: [
      "Unlimited chat with certified coaches",
      "Weekly relationship check-ins",
      "Personalized action plans",
      "Access to all workshops",
      "Priority support",
      "Cancel anytime",
    ],
    popular: true,
    emoji: "💝",
  },
  {
    id: "one-time",
    title: "Quick Fix Session",
    description: "Intensive 1-on-1 session to tackle your specific issue",
    price: "$89 one-time",
    features: [
      "90-minute video session",
      "Personalized relationship roadmap",
      "Follow-up resources",
      "2 weeks of text support",
      "Workbook & exercises",
    ],
    emoji: "⚡",
  },
]

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Maya",
    age: 23,
    story:
      "My boyfriend and I were fighting constantly. Coach Khyatish helped us understand each other better and now we're stronger than ever! 💕",
    rating: 5,
    relationshipType: "Romantic",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    beforeAfter: {
      before: "Fighting daily, considering breakup",
      after: "Communicating openly, planning future together",
    },
  },
  {
    id: "2",
    name: "Alex",
    age: 26,
    story:
      "Haven't talked to my sister in 2 years. Coach Khyatish helped me reach out and we're rebuilding our relationship step by step.",
    rating: 5,
    relationshipType: "Family",
    avatar:
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    beforeAfter: {
      before: "No contact for 2 years",
      after: "Weekly calls and healing together",
    },
  },
  {
    id: "3",
    name: "Jordan",
    age: 21,
    story:
      "My best friend group was falling apart. Coach Khyatish gave me the tools to address the drama and save our friendships! 🙌",
    rating: 5,
    relationshipType: "Friendship",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
    beforeAfter: {
      before: "Friend group drama and tension",
      after: "Stronger bonds and better communication",
    },
  },
]

function App() {
  const [currentScreen, setCurrentScreen] = useState("home")
  const [darkMode, setDarkMode] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [chatSession, setChatSession] = useState<ChatSession>({
    conversationId: null,
    messages: [],
    isLoading: false,
  })
  const [messageInput, setMessageInput] = useState("")
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    relationshipType: "romantic" as
      | "romantic"
      | "family"
      | "friendship"
      | "workplace"
      | "other",
    urgencyLevel: "medium" as "low" | "medium" | "high" | "emergency",
  })
  const [showUserInfoForm, setShowUserInfoForm] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen)
  }

  const goBack = () => {
    if (currentScreen === "chat" && chatSession.messages.length === 0) {
      setCurrentScreen("home")
    } else if (currentScreen === "service-detail" && selectedService) {
      setCurrentScreen("services")
      setSelectedService(null)
    } else {
      setCurrentScreen("home")
    }
  }

  const startChat = () => {
    if (!userInfo.name || !userInfo.email) {
      setShowUserInfoForm(true)
      return
    }
    setCurrentScreen("chat")
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    setChatSession((prev) => ({
      ...prev,
      isLoading: true,
      messages: [
        ...prev.messages,
        {
          sender: "user",
          content: content.trim(),
          timestamp: new Date(),
        },
      ],
    }))

    try {
      if (!chatSession.conversationId) {
        // Start new conversation
        const response = await fetch(`${API_BASE_URL}/conversations/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userInfo.name,
            userEmail: userInfo.email,
            phone: userInfo.phone,
            relationshipType: userInfo.relationshipType,
            initialMessage: content.trim(),
            urgencyLevel: userInfo.urgencyLevel,
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Fetch the full conversation to get coach response
          const conversationResponse = await fetch(
            `${API_BASE_URL}/conversations/${data.conversationId}`
          )
          const conversationData = await conversationResponse.json()

          if (conversationData.success) {
            setChatSession((prev) => ({
              ...prev,
              conversationId: data.conversationId,
              messages: conversationData.conversation.messages.map(
                (msg: any) => ({
                  sender: msg.sender,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                })
              ),
              isLoading: false,
            }))
          }
        }
      } else {
        // Send message to existing conversation
        const response = await fetch(
          `${API_BASE_URL}/conversations/${chatSession.conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim() }),
          }
        )

        const data = await response.json()

        if (data.success) {
          setChatSession((prev) => ({
            ...prev,
            messages: [
              ...prev.messages.slice(0, -1), // Remove the user message we added optimistically
              ...data.messages.map((msg: any) => ({
                sender: msg.sender,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
              })),
            ],
            isLoading: false,
          }))
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setChatSession((prev) => ({
        ...prev,
        isLoading: false,
      }))
    }

    setMessageInput("")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ))
  }

  const callNow = () => {
    window.location.href = "tel:+1-555-FIX-LOVE"
  }

  // Home Screen
  if (currentScreen === "home") {
    return (
      <div
        className={`min-h-screen dark-transition gradient-bg ${
          darkMode ? "dark" : ""
        }`}
      >
        {/* Header */}
        <header className="nav-header">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="nav-brand-text">Fix Us</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full glass hover:bg-white/30 transition-colors focus-ring"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </header>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="max-w-md mx-auto">
            <h1 className="hero-title">Let's Fix This Together</h1>
            <div className="emoji-large mb-6">💔➡️❤️</div>
            <p className="hero-subtitle">
              Professional relationship coaching that actually works. Whether
              it's love, family, or friendships - we've got you covered.
            </p>

            {/* CTA Buttons */}
            <div className="cta-buttons">
              <button
                onClick={startChat}
                className="cta-primary flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Talk to Coach Khyatish Now ✨</span>
              </button>

              <button
                onClick={() => navigateTo("services")}
                className="cta-secondary"
              >
                View Services
              </button>

              <button
                onClick={callNow}
                className="w-full bg-green-500 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors focus-ring"
              >
                <Phone className="w-5 h-5" />
                <span>Emergency Call Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="container-responsive section-responsive">
          <div className="max-w-md mx-auto stats-grid">
            <div className="stat-card">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Relationships Fixed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">94%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mobile-nav">
          <div className="flex justify-around py-3">
            <button
              onClick={() => navigateTo("testimonials")}
              className="flex flex-col items-center space-y-1 p-2 focus-ring"
            >
              <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Stories
              </span>
            </button>
            <button
              onClick={() => navigateTo("services")}
              className="flex flex-col items-center space-y-1 p-2 focus-ring"
            >
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Services
              </span>
            </button>
            <button
              onClick={startChat}
              className="flex flex-col items-center space-y-1 p-2 focus-ring"
            >
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Chat
              </span>
            </button>
          </div>
        </div>

        {/* User Info Form Modal */}
        {showUserInfoForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                Tell us a bit about yourself
              </h3>
              <div className="form-container">
                <div>
                  <label className="form-label">Your name ✨</label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    className="form-input"
                    placeholder="What should we call you?"
                  />
                </div>
                <div>
                  <label className="form-label">Email 📧</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    className="form-input"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="form-label">
                    What type of relationship? 💭
                  </label>
                  <select
                    value={userInfo.relationshipType}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        relationshipType: e.target.value as any,
                      })
                    }
                    className="form-select"
                  >
                    <option value="romantic">Romantic Partner 💕</option>
                    <option value="family">Family Member 👨‍👩‍👧‍👦</option>
                    <option value="friendship">Friend 👯‍♀️</option>
                    <option value="workplace">Coworker 💼</option>
                    <option value="other">Other 🤝</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">
                    How urgent does this feel? ⏰
                  </label>
                  <select
                    value={userInfo.urgencyLevel}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        urgencyLevel: e.target.value as any,
                      })
                    }
                    className="form-select"
                  >
                    <option value="low">I can take my time 🌱</option>
                    <option value="medium">Important but not urgent 🤔</option>
                    <option value="high">Pretty urgent 😰</option>
                    <option value="emergency">Crisis mode 🚨</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUserInfoForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-400 text-gray-800 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUserInfoForm(false)
                    setCurrentScreen("chat")
                  }}
                  disabled={!userInfo.name || !userInfo.email}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Chat Screen
  if (currentScreen === "chat") {
    return (
      <div
        className={`chat-container dark-transition gradient-bg ${
          darkMode ? "dark" : ""
        }`}
      >
        {/* Header */}
        <header className="p-4 flex items-center space-x-4 glass border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={goBack}
            className="p-2 rounded-full glass hover:bg-white/30 transition-colors focus-ring"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold dark:text-white">
                Coach Khyatish
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Here to help ✨
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages">
          {chatSession.messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                Start the conversation with Coach Khyatish
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tell me what's going on with your relationship. I'm here to
                listen and help.
              </p>
              <div className="bg-white/90 dark:bg-gray-800/60 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-300">
                💡 <strong>Tip:</strong> Be as detailed as you'd like. The more
                you share, the better I can help you.
              </div>
            </div>
          )}

          {chatSession.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user"
                      ? "bg-pink-500"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`message-bubble ${
                    message.sender === "user" ? "message-user" : "message-coach"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-pink-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {chatSession.isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="message-bubble message-coach">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="chat-input-container">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage(messageInput)}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={chatSession.isLoading}
            />
            <button
              onClick={() => sendMessage(messageInput)}
              disabled={!messageInput.trim() || chatSession.isLoading}
              className="px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-ring"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Services Screen (keeping existing code)
  if (currentScreen === "services") {
    return (
      <div
        className={`min-h-screen dark-transition gradient-bg ${
          darkMode ? "dark" : ""
        }`}
      >
        <header className="nav-header">
          <button
            onClick={goBack}
            className="p-2 rounded-full glass hover:bg-white/30 transition-colors focus-ring"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">
            Choose Your Plan
          </h1>
        </header>

        <div className="container-responsive section-responsive space-responsive">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card ${service.popular ? "popular" : ""}`}
              onClick={() => {
                setSelectedService(service)
                setCurrentScreen("service-detail")
              }}
            >
              {service.popular && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular ⭐
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="emoji-medium">{service.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {service.price}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {service.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
                {service.features.length > 3 && (
                  <div className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                    +{service.features.length - 3} more features
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>100% Money-Back Guarantee</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-6 rounded-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-300">
                  100% Money-Back if You're Still Broken 💸
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Not satisfied? Get your money back, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Service Detail Screen (keeping existing code)
  if (currentScreen === "service-detail" && selectedService) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "dark bg-gray-900"
            : "bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50"
        }`}
      >
        <header className="p-4 flex items-center space-x-4">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">
            {selectedService.title}
          </h1>
        </header>

        <div className="px-4 py-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 dark:bg-gray-800/80">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl">{selectedService.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold dark:text-white">
                  {selectedService.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedService.description}
                </p>
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-2">
                  {selectedService.price}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-lg dark:text-white">
                What's Included:
              </h3>
              {selectedService.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <button
                onClick={startChat}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started with Coach Khyatish ✨
              </button>

              <button
                onClick={callNow}
                className="w-full bg-green-500 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Talk to Someone First</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-6 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold text-green-800 dark:text-green-300">
                  100% Money-Back Guarantee
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  If you're not completely satisfied, we'll refund every penny.
                  No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Testimonials Screen (keeping existing code)
  if (currentScreen === "testimonials") {
    return (
      <div
        className={`min-h-screen dark-transition gradient-bg ${
          darkMode ? "dark" : ""
        }`}
      >
        <header className="nav-header">
          <button
            onClick={goBack}
            className="p-2 rounded-full glass hover:bg-white/30 transition-colors focus-ring"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">Success Stories</h1>
        </header>

        <div className="container-responsive section-responsive space-responsive">
          <div className="text-center mb-8">
            <h2 className="text-responsive-lg font-bold mb-2 dark:text-white">
              Real People, Real Results ✨
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              See how Coach Khyatish has helped thousands rebuild their
              relationships
            </p>
          </div>

          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="testimonial-avatar"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold dark:text-white">
                      {testimonial.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      • {testimonial.age}
                    </span>
                    <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full">
                      {testimonial.relationshipType}
                    </span>
                  </div>
                  <div className="flex mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "{testimonial.story}"
              </p>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">
                  Before & After:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">😔</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {testimonial.beforeAfter.before}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">😊</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {testimonial.beforeAfter.after}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center py-8">
            <button onClick={startChat} className="cta-primary focus-ring">
              Start Your Success Story with Coach Khyatish ✨
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
