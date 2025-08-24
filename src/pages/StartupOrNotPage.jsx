

"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { RocketLaunchIcon, BuildingOfficeIcon, CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

// This background component remains the same
const FloatingElement = ({ delay = 0, size = "medium", initialX = 0, initialY = 0 }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [direction, setDirection] = useState({ x: 1, y: 1 })

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-32 h-32",
  }

  useEffect(() => {
    const moveElement = () => {
      setPosition((prev) => {
        let newX = prev.x + direction.x * (Math.random() * 0.5 + 0.2)
        let newY = prev.y + direction.y * (Math.random() * 0.5 + 0.2)

        if (newX <= 0 || newX >= window.innerWidth - 128) {
          setDirection((prevDir) => ({ ...prevDir, x: -prevDir.x }))
        }
        if (newY <= 0 || newY >= window.innerHeight - 128) {
          setDirection((prevDir) => ({ ...prevDir, y: -prevDir.y }))
        }
        return { x: newX, y: newY }
      })
    }
    const interval = setInterval(moveElement, 50)
    return () => clearInterval(interval)
  }, [direction])

  return (
    <div
      className={`absolute ${sizeClasses[size]} bg-blue-400/20 rounded-full blur-sm animate-pulse`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        animationDelay: `${delay}ms`,
        transition: "all 0.1s linear",
      }}
    />
  )
}

const startupQuestions = [
  { id: 1, name: "startupName", text: "What is your startup's name?", type: "text", placeholder: "e.g., Innovate Inc." },
  { id: 2, name: "productIdea", text: "Briefly describe your product idea.", type: "textarea", placeholder: "Describe the core concept and value..." },
  { id: 3, name: "teamSize", text: "What is the current size of your team?", type: "number", placeholder: "e.g., 5" },
  { id: 4, name: "primaryGoal", text: "What is your primary goal for the next 6 months?", type: "textarea", placeholder: "e.g., Launch MVP, acquire first 100 users..." },
]

const establishedQuestions = [
  { id: 1, name: "companyName", text: "What is your company's name?", type: "text", placeholder: "e.g., Global Corp" },
  { id: 2, name: "yourRole", text: "What is your role in the company?", type: "text", placeholder: "e.g., Product Manager" },
  { id: 3, name: "employeeCount", text: "How many employees will be using this account?", type: "number", placeholder: "e.g., 25" },
  { id: 4, name: "mainChallenge", text: "What is the main challenge you are trying to solve?", type: "textarea", placeholder: "e.g., Streamlining our workflow..." },
]

// The main page component now uses React Router navigation
const StartupOrNotPage = () => {
  const [selectedCard, setSelectedCard] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const navigate = useNavigate()
  
  const questions = selectedCard === "startup" ? startupQuestions : establishedQuestions

  const handleCardSelect = (type) => {
    setSelectedCard(type)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAnswers(prev => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      console.log("Final Answers:", { ...answers, userType: selectedCard })
      // Navigate to dashboard after completing questions
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      setSelectedCard(null)
      setAnswers({})
    }
  }

  const currentQuestion = questions[currentStep]
  const isNextDisabled = !answers[currentQuestion?.name]?.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      <FloatingElement delay={0} size="large" initialX={100} initialY={200} />
      <FloatingElement delay={500} size="medium" initialX={typeof window !== 'undefined' ? window.innerWidth - 200 : 800} initialY={100} />
      <FloatingElement delay={1000} size="small" initialX={500} initialY={typeof window !== 'undefined' ? window.innerHeight - 150 : 600} />
      <FloatingElement delay={1500} size="medium" initialX={typeof window !== 'undefined' ? window.innerWidth - 400 : 600} initialY={typeof window !== 'undefined' ? window.innerHeight - 250 : 500} />

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative z-10 transition-all duration-500 hover:bg-white/15">
        
        {!selectedCard ? (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Select User Type</h1>
              <p className="text-gray-700">You can change your account at any time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="relative cursor-pointer transition-all duration-300 transform hover:scale-105"
                onClick={() => handleCardSelect("startup")}
              >
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center h-full shadow-xl hover:shadow-2xl hover:border-blue-200/40 hover:bg-white/25 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100/60 text-blue-600 border border-blue-200/50">
                    <RocketLaunchIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Startup</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">Develop your business or startup idea</p>
                </div>
              </div>
              <div
                className="relative cursor-pointer transition-all duration-300 transform hover:scale-105"
                onClick={() => handleCardSelect("established")}
              >
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center h-full shadow-xl hover:shadow-2xl hover:border-blue-200/40 hover:bg-white/25 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100/60 text-blue-600 border border-blue-200/50">
                    <BuildingOfficeIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Established Company</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">Manage your account with colleagues</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="mb-6">
                <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-3 mb-4 overflow-hidden border border-white/20">
                    <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-lg" 
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
                <label className="text-xl font-semibold text-gray-800" htmlFor={currentQuestion.name}>
                    {currentQuestion.text}
                </label>
            </div>
            
            <div className="mb-8">
                {currentQuestion.type === 'textarea' ? (
                    <textarea
                        id={currentQuestion.name}
                        name={currentQuestion.name}
                        value={answers[currentQuestion.name] || ''}
                        onChange={handleInputChange}
                        placeholder={currentQuestion.placeholder}
                        rows="4"
                        className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 focus:outline-none transition-all duration-300 placeholder-gray-500/70"
                    />
                ) : (
                    <input
                        id={currentQuestion.name}
                        name={currentQuestion.name}
                        type={currentQuestion.type}
                        value={answers[currentQuestion.name] || ''}
                        onChange={handleInputChange}
                        placeholder={currentQuestion.placeholder}
                        className="w-full p-4 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300/50 focus:outline-none transition-all duration-300 placeholder-gray-500/70"
                    />
                )}
            </div>
            
            <div className="flex justify-between items-center">
                <button
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border bg-white/30 text-gray-700 hover:bg-white/50 hover:scale-105 border-white/40 flex items-center space-x-2 hover:shadow-lg"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border ${
                        !isNextDisabled
                        ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white hover:from-blue-600/90 hover:to-blue-700/90 hover:scale-105 shadow-xl border-blue-400/50 hover:shadow-2xl"
                        : "bg-gray-300/30 text-gray-500 cursor-not-allowed border-gray-300/30"
                    }`}
                >
                    {currentStep === questions.length - 1 ? "Finish" : "Next"}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



export default StartupOrNotPage;
