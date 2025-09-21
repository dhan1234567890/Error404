import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { TaskCard } from './TaskCard'
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { ActionPlan, Task, FarmingProblem } from '../types/farming'
import { auth } from '../lib/firebase'
import { createActionPlan, createTask } from '../lib/api'
import { generateText } from '../lib/openai'
import toast from 'react-hot-toast'

interface ActionPlanProps {
  problem: FarmingProblem
  onBack: () => void
}

export function ActionPlan({ problem, onBack }: ActionPlanProps) {
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    generateActionPlan()
  }, [problem])

  const generateActionPlan = async () => {
    setIsGenerating(true)
    setProgress(10)

    try {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
      setProgress(30)

      // Generate action plan using OpenAI
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      const prompt = `As an expert agricultural advisor, create a detailed action plan for this farming problem:

Problem: ${problem.description}
Crop: ${problem.cropType}
Location: ${problem.location}
Urgency: ${problem.urgency}

Generate a JSON response with:
1. A title for the action plan
2. A brief description of the problem and solution approach
3. Estimated total cost in USD
4. Expected yield improvement percentage
5. A list of 3-5 specific tasks with:
   - Title and detailed description
   - Scheduled date (starting tomorrow, spaced appropriately)
   - Priority level (low/medium/high)
   - Estimated duration in minutes
   - Individual cost
   - Required supplies list
   - Step-by-step instructions

Consider the urgency level and provide tasks that are practical and achievable. Make the dates realistic based on agricultural timing.

Respond with valid JSON only, no other text.`;
      const text = await generateText(prompt, apiKey);

      setProgress(60);

      let planData;
      try {
        planData = JSON.parse(text);
      } catch {
        throw new Error('Failed to parse AI response');
      }

      // Create action plan
      const plan: ActionPlan = {
        id: `plan_${Date.now()}`,
        problemId: problem.id,
        userId: user.id,
        title: planData.title || `Action Plan for ${problem.cropType}`,
        description: planData.description || 'AI-generated farming solution',
        estimatedCost: planData.estimatedCost || 50,
        expectedYield: planData.expectedYield || 15,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        tasks: []
      }

  await createActionPlan(plan)
      setProgress(80)

      // Create tasks
      const taskPromises = (planData.tasks || []).map(async (taskData: any, index: number) => {
        const scheduledDate = new Date()
        scheduledDate.setDate(scheduledDate.getDate() + index + 1)
        
        const task: Task = {
          id: `task_${Date.now()}_${index}`,
          planId: plan.id,
          userId: user.id,
          title: taskData.title || `Task ${index + 1}`,
          description: taskData.description || '',
          scheduledDate: scheduledDate.toISOString(),
          status: 'pending',
          priority: taskData.priority || 'medium',
          estimatedDuration: taskData.estimatedDuration || 60,
          cost: taskData.cost || 10,
          supplies: taskData.supplies || [],
          instructions: taskData.instructions || taskData.description || '',
          createdAt: new Date().toISOString()
        }

  await createTask(task)
        return task
      })

      const createdTasks = await Promise.all(taskPromises)
      setProgress(100)

      setActionPlan(plan)
      setTasks(createdTasks)
      toast.success('Action plan generated successfully!')
    } catch (error) {
      console.error('Error generating action plan:', error)
      toast.error('Failed to generate action plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (isGenerating) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Generating Your Action Plan</h3>
                <p className="text-muted-foreground">
                  Our AI is analyzing your farming problem and creating a personalized solution...
                </p>
                <Progress value={progress} className="w-full max-w-sm mx-auto" />
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!actionPlan) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Generate Plan</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't create an action plan for your problem. Please try again.
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Problems
        </Button>
        <Badge 
          variant="outline" 
          className="bg-primary/10 text-primary border-primary/20"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Plan Ready
        </Badge>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{actionPlan.title}</CardTitle>
          <p className="text-muted-foreground">{actionPlan.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Estimated Cost</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${actionPlan.estimatedCost}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Expected Yield</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                +{actionPlan.expectedYield}%
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{totalTasks}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Progress</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}% complete
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Action Tasks</h2>
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onUpdate={handleTaskUpdate}
          />
        ))}
      </div>
    </div>
  )
}