import { createFileRoute } from '@tanstack/react-router'
import { Phone, Mail, Plus, Search, UserPlus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

// Mock contacts data
const mockContacts = [
  {
    id: '1',
    name: 'Aziz Karimov',
    phone: '+998 90 123 4567',
    email: 'aziz.karimov@example.com',
    lastCall: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    totalCalls: 12,
    tags: ['vip', 'returning'],
    notes: 'Interested in premium plan',
    status: 'hot-lead',
  },
  {
    id: '2',
    name: 'Nilufar Rahimova',
    phone: '+998 91 234 5678',
    email: 'nilufar.r@example.com',
    lastCall: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    totalCalls: 5,
    tags: ['new'],
    notes: 'Asked about pricing',
    status: 'potential',
  },
  {
    id: '3',
    name: 'Bekzod Toshmatov',
    phone: '+998 93 345 6789',
    email: 'bekzod.t@example.com',
    lastCall: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    totalCalls: 3,
    tags: ['cold-lead'],
    notes: 'Follow up next week',
    status: 'cold',
  },
  {
    id: '4',
    name: 'Shakhnoza Ismailova',
    phone: '+998 94 456 7890',
    email: 'shakhnoza.i@example.com',
    lastCall: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    totalCalls: 8,
    tags: ['customer'],
    notes: 'Existing customer - support issue resolved',
    status: 'customer',
  },
]

function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')

  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === 'all' || contact.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot-lead':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'potential':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'customer':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'cold':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'vip':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'returning':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'new':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'cold-lead':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      case 'customer':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot-lead':
        return '🔥 Hot Lead'
      case 'potential':
        return '⭐ Potential'
      case 'customer':
        return '✓ Customer'
      case 'cold':
        return '❄️ Cold'
      default:
        return status
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your agent's contacts and customer relationships
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedTag === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedTag('all')}
        >
          All ({mockContacts.length})
        </Button>
        {['vip', 'new', 'customer', 'cold-lead'].map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')} ({mockContacts.filter((c) => c.tags.includes(tag)).length})
          </Button>
        ))}
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No contacts found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <Badge variant="outline" className={getStatusColor(contact.status)}>
                          {getStatusLabel(contact.status)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                        <DropdownMenuItem>View Call History</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Notes */}
                  {contact.notes && (
                    <div className="bg-muted/50 rounded p-2 text-sm">
                      <p className="text-muted-foreground line-clamp-2">{contact.notes}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>{contact.totalCalls} calls total</span>
                    <span>Last: {formatDistanceToNow(contact.lastCall, { addSuffix: true })}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Mail className="w-3 h-3" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/contacts')({
  component: ContactsPage,
})
