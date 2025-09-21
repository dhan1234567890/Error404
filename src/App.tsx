import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { ProblemInput } from './components/ProblemInput'
import { ActionPlan } from './components/ActionPlan'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Sprout, Users, Calendar, TrendingUp } from 'lucide-react'
import type { FarmingProblem } from './types/farming'
import { auth } from './lib/firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'input' | 'plan'>('landing')
  const [currentProblem, setCurrentProblem] = useState<FarmingProblem | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      setUser(firebaseUser)
    })
    return unsubscribe
  }, [])

  const handleProblemSubmitted = (problem: FarmingProblem) => {
    setCurrentProblem(problem)
    setCurrentView('plan')
  }

  const handleBackToInput = () => {
    setCurrentProblem(null)
    setCurrentView('input')
  }

  const handleGetStarted = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider()
      try {
        await signInWithPopup(auth, provider)
      } catch (error) {
        // Optionally show error toast
      }
    } else {
      setCurrentView('input')
    }
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">AgriAssist AI</span>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome back!</span>
                <Button onClick={handleGetStarted}>Dashboard</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={handleGetStarted}>
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Farming Problems into
            <span className="text-primary block mt-2">Actionable Plans</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Get AI-powered, personalized action calendars for your farming challenges. 
            From problem identification to step-by-step solutions with cost estimates, 
            photo verification, and community wisdom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              onClick={handleGetStarted}
            >
              <Sprout className="mr-2 h-5 w-5" />
              Get Your Action Plan
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Users className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-green-200">
              <CardContent className="pt-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
                <p className="text-muted-foreground">
                  AI creates time-based action plans that adapt to weather and optimize for best results
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur-sm border-green-200">
              <CardContent className="pt-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cost & Yield Insights</h3>
                <p className="text-muted-foreground">
                  Get upfront cost estimates and expected yield improvements before you invest
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur-sm border-green-200">
              <CardContent className="pt-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Wisdom</h3>
                <p className="text-muted-foreground">
                  Learn from other farmers' experiences and share your successful solutions
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Describe Problem</h3>
                <p className="text-muted-foreground">
                  Tell us about your crop issue with photos and details
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Action Plan</h3>
                <p className="text-muted-foreground">
                  AI generates a timed, personalized solution with costs
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Execute & Track</h3>
                <p className="text-muted-foreground">
                  Follow tasks, verify with photos, track your success
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of farmers using AI-powered action plans to improve their yields
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2024 AgriAssist AI. Empowering farmers with intelligent action plans.</p>
          </div>
        </footer>
      </div>
    )
  }

  if (currentView === 'input') {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" />
        
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">AgriAssist AI</span>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                )}
                <Button variant="outline" onClick={() => setCurrentView('landing')}>
                  ← Back to Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ProblemInput onProblemSubmitted={handleProblemSubmitted} />
        </main>
      </div>
    )
  }

  if (currentView === 'plan' && currentProblem) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" />
        
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">AgriAssist AI</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ActionPlan problem={currentProblem} onBack={handleBackToInput} />
        </main>
      </div>
    )
  }

  return null
}

export default App 