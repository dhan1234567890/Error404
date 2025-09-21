import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Camera, Upload, MapPin, Sprout } from 'lucide-react'
import { auth } from '../lib/firebase'
import { createActionPlan } from '../lib/api'
import { uploadFile } from '../lib/firebaseStorage'
import type { FarmingProblem } from '../types/farming'
import toast from 'react-hot-toast'

interface ProblemInputProps {
  onProblemSubmitted: (problem: FarmingProblem) => void
}

export function ProblemInput({ onProblemSubmitted }: ProblemInputProps) {
  const [description, setDescription] = useState('')
  const [cropType, setCropType] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImages([...images, ...Array.from(files)])
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() || !cropType.trim()) {
      toast.error('Please fill in the problem description and crop type')
      return
    }

    setIsSubmitting(true)
    try {
      const user = auth.currentUser
      if (!user) {
        toast.error('User not authenticated')
        setIsSubmitting(false)
        return
      }
      
      // Upload images if any
      const imageUrls: string[] = []
      for (const image of images) {
        const url = await uploadFile(image, `problems/${Date.now()}-${image.name}`)
        imageUrls.push(url)
      }

      const problem: FarmingProblem = {
        id: `problem_${Date.now()}`,
        userId: user.id,
        description,
        cropType,
        location,
        urgency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        images: imageUrls.length > 0 ? imageUrls : undefined
      }

  await createActionPlan(problem)
      onProblemSubmitted(problem)
      
      // Reset form
      setDescription('')
      setCropType('')
      setLocation('')
      setUrgency('medium')
      setImages([])
      
      toast.success('Problem submitted successfully!')
    } catch (error) {
      console.error('Error submitting problem:', error)
      toast.error('Failed to submit problem. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const urgencyColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Sprout className="h-6 w-6" />
          Describe Your Farming Problem
        </CardTitle>
        <p className="text-muted-foreground">
          Tell us what's happening with your crops, and we'll create a personalized action plan
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Problem Description</Label>
          <Textarea
            id="description"
            placeholder="e.g., My wheat leaves are turning yellow and some have brown spots..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cropType">Crop Type</Label>
            <Input
              id="cropType"
              placeholder="e.g., Wheat, Rice, Tomato"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="e.g., Punjab, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Urgency Level</Label>
          <Select value={urgency} onValueChange={(value: 'low' | 'medium' | 'high') => setUrgency(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={urgencyColors.low}>Low</Badge>
                  <span>Can wait a few days</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={urgencyColors.medium}>Medium</Badge>
                  <span>Needs attention this week</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={urgencyColors.high}>High</Badge>
                  <span>Urgent - immediate action needed</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Photos (Optional)</Label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" type="button" className="cursor-pointer">
                <Camera className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
            </label>
            {images.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10">
                {images.length} photo{images.length > 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="h-16 w-16 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !description.trim() || !cropType.trim()}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Problem...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Get AI Action Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}