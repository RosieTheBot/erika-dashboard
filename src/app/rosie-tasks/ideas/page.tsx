'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader, Trash2, Check, Plus } from 'lucide-react'

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
  const [filter, setFilter] = useState<'new' | 'completed' | 'all'>('new')
  const [showForm, setShowForm] = useState(false)
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'general' })

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas')
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIdea = async () => {
    if (!newIdea.title.trim()) return

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      })
      const data = await response.json()
      setIdeas([data.idea, ...ideas])
      setNewIdea({ title: '', description: '', category: 'general' })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding idea:', error)
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

  return (
    <div>
      {/* Add Idea Form */}
      <div className="mb-6">
        {showForm ? (
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Idea title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              className="w-full bg-primary-700 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 focus:outline-none focus:border-primary-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              className="w-full bg-primary-700 border border-primary-600 rounded px-3 py-2 text-white placeholder-primary-400 focus:outline-none focus:border-primary-500 resize-none"
              rows={2}
            />
            <select
              value={newIdea.category}
              onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
              className="w-full bg-primary-700 border border-primary-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              <option value="general">General</option>
              <option value="automation">Automation</option>
              <option value="notifications">Notifications</option>
              <option value="features">Features</option>
              <option value="performance">Performance</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddIdea}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition"
              >
                Add Idea
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition"
          >
            <Plus size={16} />
            New Idea
          </button>
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
        <div className="flex items-center gap-2 text-primary-300">
          <Loader size={20} className="animate-spin" />
          Loading ideas...
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="bg-primary-800 border border-primary-700 rounded-lg p-8 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-primary-400" />
          <p className="text-primary-300">No ideas found</p>
        </div>
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
