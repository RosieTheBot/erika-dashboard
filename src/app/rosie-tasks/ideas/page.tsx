'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Trash2, Check, Plus, RefreshCw } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Idea {
  id: string
  title: string
  description: string
  category: string
  created_at: string
  status: 'new' | 'completed' | 'dismissed'
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filter, setFilter] = useState<'new' | 'completed' | 'all'>('new')
  const [showForm, setShowForm] = useState(false)
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'general' })

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setError(null)
      const response = await fetch('/api/ideas')
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ideas'
      console.error('Error fetching ideas:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleAddIdea = async () => {
    if (!newIdea.title.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      })
      if (!response.ok) throw new Error('Failed to add idea')
      const data = await response.json()
      setIdeas([data.idea, ...ideas])
      setNewIdea({ title: '', description: '', category: 'general' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding idea:', error)
      setError(error instanceof Error ? error.message : 'Failed to add idea')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteIdea = async (id: string) => {
    setIdeas(ideas.map(idea =>
      idea.id === id ? { ...idea, status: 'completed' as const } : idea
    ))
  }

  const handleDismissIdea = async (id: string) => {
    setIdeas(ideas.map(idea =>
      idea.id === id ? { ...idea, status: 'dismissed' as const } : idea
    ))
  }

  const handleConvertToProject = async (idea: Idea) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: `idea_${idea.id}`,
          project_name: idea.title,
          project_type: 'manual',
          status: 'running'
        })
      })
      
      if (response.ok) {
        handleCompleteIdea(idea.id)
      }
    } catch (error) {
      console.error('Error converting idea to project:', error)
    }
  }

  const categoryColors: Record<string, string> = {
    automation: 'bg-purple-500/20 text-purple-300',
    notifications: 'bg-blue-500/20 text-blue-300',
    features: 'bg-green-500/20 text-green-300',
    general: 'bg-gray-500/20 text-gray-300',
    performance: 'bg-orange-500/20 text-orange-300'
  }

  const filteredIdeas = filter === 'all' 
    ? ideas 
    : ideas.filter(i => i.status === filter)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchIdeas()
  }

  return (
    <div className="container-page space-section">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Ideas & Suggestions</h1>
          <p className="text-primary-300 mt-2">Brainstorm, track, and convert ideas into projects</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          isLoading={isRefreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Add Idea Form */}
      <div>
        {showForm ? (
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 space-y-3">
            <Input
              label="Idea Title"
              placeholder="What's your idea?"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
              <textarea
                placeholder="Add more details..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="w-full bg-primary-900 border border-primary-700 rounded-lg px-4 py-2 text-white placeholder-primary-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none transition"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                className="w-full bg-primary-900 border border-primary-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
              >
                <option value="general">General</option>
                <option value="automation">Automation</option>
                <option value="notifications">Notifications</option>
                <option value="features">Features</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddIdea}
                isLoading={isSaving}
                variant="primary"
              >
                Add Idea
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            icon={<Plus size={16} />}
          >
            New Idea
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['new', 'completed', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-primary-800/50 text-primary-300 hover:bg-primary-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title={error ? "Unable to Load Ideas" : filter === 'new' ? "No New Ideas" : "No Ideas Found"}
          description={error
            ? "There was an error loading your ideas. Check your connection and try again."
            : filter === 'new' 
            ? "You haven't created any ideas yet. Click 'New Idea' to get started."
            : "No ideas match your current filter."}
          variant={error ? "warning" : "info"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              draggable
              onDragStart={(e) => e.dataTransfer?.setData('idea', JSON.stringify(idea))}
              className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 hover:shadow-lg transition cursor-grab hover:cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold flex-1">{idea.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${categoryColors[idea.category] || categoryColors.general}`}>
                  {idea.category}
                </span>
              </div>

              {idea.description && (
                <p className="text-primary-300 text-sm mb-3">{idea.description}</p>
              )}

              <p className="text-primary-400 text-xs mb-4">
                {new Date(idea.created_at).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                {idea.status === 'new' && (
                  <>
                    <button
                      onClick={() => handleConvertToProject(idea)}
                      className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      Convert
                    </button>
                    <button
                      onClick={() => handleDismissIdea(idea.id)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                {idea.status === 'completed' && (
                  <div className="flex-1 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-1">
                    <Check size={14} />
                    Completed
                  </div>
                )}
                {idea.status === 'dismissed' && (
                  <div className="flex-1 px-3 py-2 bg-gray-500/20 text-gray-300 rounded-lg text-sm font-medium text-center">
                    Dismissed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
