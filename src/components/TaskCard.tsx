// ...existing code...
import { useState } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Package,
  FileText,
  // Upload // Unused import removed
} from 'lucide-react'
import type { Task } from '../types/farming'
import { updateTask } from '../lib/api'
import { uploadFile } from '../lib/firebaseStorage'
import toast from 'react-hot-toast'
// If you see an error for date-fns, ensure it is installed: npm install date-fns
import { format } from 'date-fns/format'

interface TaskCardProps {
  task: Task
  index: number
  onUpdate: (task: Task) => void
}

export function TaskCard({ task, index, onUpdate }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [verificationImage, setVerificationImage] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    skipped: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (newStatus === 'completed') {
      setIsCompleting(true)
      return
    }

    try {
      const updatedTask = { ...task, status: newStatus }
  await updateTask(task.id, updatedTask)
      onUpdate(updatedTask)
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task status')
    }
  }

  const handleComplete = async () => {
    try {
      let imageUrl = ''
      
      if (verificationImage) {
        imageUrl = await uploadFile(verificationImage, `verifications/${Date.now()}-${verificationImage.name}`)
      }

      const updatedTask = {
        ...task,
        status: 'completed' as const,
        verificationImage: imageUrl || undefined,
        completedAt: new Date().toISOString()
      }

  await updateTask(task.id, updatedTask)
      onUpdate(updatedTask)
      
      setIsCompleting(false)
      setVerificationImage(null)
      setNotes('')
      
      toast.success('Task completed successfully!')
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVerificationImage(file)
    }
  }

  const scheduledDate = new Date(task.scheduledDate)
  const isToday = format(scheduledDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  // Overdue if scheduledDate is in the past and not completed
  const isOverdue = scheduledDate < new Date() && (task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') !== 'completed';

  return (
    <Card className={`transition-all duration-200 ${
  (task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') === 'completed' ? 'opacity-75 bg-green-50 border-green-200' : 
  isOverdue && (task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') !== 'completed' ? 'border-red-200 bg-red-50' :
      isToday ? 'border-primary bg-primary/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center pt-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {index + 1}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight">{task.title}</h3>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[task.priority]} variant="outline">
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]} variant="outline">
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? 'text-red-600 font-medium' : isToday ? 'text-primary font-medium' : ''}>
                  {format(scheduledDate, 'MMM d, yyyy')}
                  {isToday && ' (Today)'}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{task.estimatedDuration} min</span>
              </div>
              
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>${task.cost}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') !== 'completed' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={(task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') === 'in_progress'}
                >
                  {task.status === 'in_progress' ? 'In Progress' : 'Start Task'}
                </Button>
                
                <Dialog open={isCompleting} onOpenChange={setIsCompleting}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      disabled={(task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') === 'completed'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Upload verification photo (optional)</Label>
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="verification-upload"
                          />
                          <label htmlFor="verification-upload">
                            <Button variant="outline" type="button" className="cursor-pointer">
                              <Camera className="h-4 w-4 mr-2" />
                              {verificationImage ? 'Change Photo' : 'Add Photo'}
                            </Button>
                          </label>
                          {verificationImage && (
                            <div className="mt-2">
                              <img
                                src={URL.createObjectURL(verificationImage)}
                                alt="Verification"
                                className="h-32 w-32 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about completing this task..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                         <Button variant="outline" onClick={() => setIsCompleting(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Task
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{task.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.instructions}</p>
                </div>
                
                {task.supplies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Required Supplies
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {task.supplies.map((supply, idx) => (
                        <li key={idx}>{supply}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {task.verificationImage && (
                  <div>
                    <h4 className="font-medium mb-2">Verification Photo</h4>
                    <img
                      src={task.verificationImage}
                      alt="Task verification"
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
  {isOverdue && (task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') !== 'completed' && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">This task is overdue</span>
          </div>
        )}
        
  {(task.status as 'pending' | 'in_progress' | 'skipped' | 'completed') === 'completed' && task.completedAt && (
          <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Completed on {format(new Date(task.completedAt), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}