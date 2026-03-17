import { createFileRoute } from '@tanstack/react-router'
import { Phone, Mail, Search, UserPlus, MoreVertical } from 'lucide-react'
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
import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@clerk/clerk-react'
import {
  getContacts,
  createContact,
  deleteContact,
} from '@/features/contacts/api'
import type { Contact, CreateContactRequest } from '@/features/contacts/types'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

function ContactsPage() {
  const { getToken } = useAuth()
  const { agentId } = Route.useParams()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [isAddMode, setIsAddMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newContact, setNewContact] = useState<Partial<CreateContactRequest>>({
    name: '',
    phone: '',
    email: '',
    status: 'potential',
    tags: [],
    notes: '',
  })

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = await getToken()
      if (!token) return

      const data = await getContacts(token, {
        agentId,
        search: searchQuery || undefined,
        tag: selectedTag !== 'all' ? selectedTag : undefined,
      })
      setContacts(data)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError('Failed to load contacts')
    } finally {
      setIsLoading(false)
    }
  }, [getToken, agentId, searchQuery, selectedTag])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setError('Name and phone are required')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const token = await getToken()
      if (!token) return

      await createContact(
        {
          agentId,
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email,
          status: newContact.status || 'potential',
          tags: newContact.tags || [],
          notes: newContact.notes,
        } as CreateContactRequest,
        token,
      )

      setSuccessMessage('Contact created successfully')
      setIsAddMode(false)
      setNewContact({
        name: '',
        phone: '',
        email: '',
        status: 'potential',
        tags: [],
        notes: '',
      })
      fetchContacts()
    } catch (err) {
      console.error('Error creating contact:', err)
      setError('Failed to create contact')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      setError(null)
      const token = await getToken()
      if (!token) return

      await deleteContact(id, token)
      setSuccessMessage('Contact deleted successfully')
      fetchContacts()
    } catch (err) {
      console.error('Error deleting contact:', err)
      setError('Failed to delete contact')
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      !searchQuery ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      (contact.email &&
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTag =
      selectedTag === 'all' || contact.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  // Get all unique tags from contacts
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)))

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
      case 'inactive':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
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
      case 'inactive':
        return '⏸️ Inactive'
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

        {!isAddMode ? (
          <Button className="gap-2" onClick={() => setIsAddMode(true)}>
            <UserPlus className="w-4 h-4" />
            Add Contact
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContact} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Contact'}
            </Button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Add Contact Form */}
      {isAddMode && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter contact name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+998 90 123 4567"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={newContact.email || ''}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newContact.status}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="hot-lead">🔥 Hot Lead</option>
                  <option value="potential">⭐ Potential</option>
                  <option value="customer">✓ Customer</option>
                  <option value="cold">❄️ Cold</option>
                  <option value="inactive">⏸️ Inactive</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                  placeholder="Add notes about this contact..."
                  value={newContact.notes || ''}
                  onChange={(e) =>
                    setNewContact({ ...newContact, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          All ({contacts.length})
        </Button>
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')} (
            {contacts.filter((c) => c.tags.includes(tag)).length})
          </Button>
        ))}
      </div>

      {/* Contacts Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading contacts...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No contacts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {contacts.length === 0
                  ? 'Add your first contact to get started'
                  : 'Try adjusting your search'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="hover:shadow-md transition-shadow"
            >
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
                        <Badge
                          variant="outline"
                          className={getStatusColor(contact.status)}
                        >
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Contact
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {contact.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  contact.id && handleDeleteContact(contact.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {contact.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-xs ${getTagColor(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {contact.notes && (
                    <div className="bg-muted/50 rounded p-2 text-sm">
                      <p className="text-muted-foreground line-clamp-2">
                        {contact.notes}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>{contact.totalCalls} calls total</span>
                    <span>
                      {contact.lastCallAt
                        ? `Last: ${formatDistanceToNow(contact.lastCallAt, { addSuffix: true })}`
                        : 'No calls yet'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                    {contact.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </Button>
                    )}
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

export const Route = createFileRoute(
  '/_app/$workspaceId/agents/$agentId/contacts',
)({
  component: ContactsPage,
})
