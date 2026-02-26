import { createFileRoute } from '@tanstack/react-router'
import { useUser, useOrganization } from '@clerk/clerk-react'
import { useState } from 'react'
import { Camera, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useClerk } from '@clerk/clerk-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

function GeneralSettingsPage() {
  const { workspaceId } = Route.useParams()
  const isOrg = workspaceId.startsWith('org_')
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const clerk = useClerk()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')

  const displayName = isOrg ? organization?.name : user?.fullName
  const imageUrl = isOrg ? organization?.imageUrl : user?.imageUrl
  const email = user?.primaryEmailAddress?.emailAddress
  const username = user?.username

  if (!userLoaded || (isOrg && !orgLoaded)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isOrg && organization) {
        await organization.update({ name })
      } else if (user) {
        await user.update({
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
        })
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setName(displayName || '')
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {isOrg ? 'Organization Profile' : 'Profile'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your {isOrg ? 'organization' : 'account'} information
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={imageUrl} alt={displayName} />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => {
                  if (isOrg) {
                    clerk.openOrganizationProfile({
                      appearance: { elements: { navbar: 'hidden' } },
                    })
                  } else {
                    clerk.openUserProfile({
                      appearance: { elements: { navbar: 'hidden' } },
                    })
                  }
                }}
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9"
                      placeholder="Enter name"
                    />
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving || !name.trim()}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {displayName || 'No name set'}
                      </h3>
                      {!isOrg && username && (
                        <p className="text-sm text-muted-foreground">
                          @{username}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleEdit}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              {email && (
                <p className="text-sm text-muted-foreground">{email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isOrg && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
            <CardDescription className="text-sm">
              View your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User ID
              </Label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                {user?.id}
              </p>
            </div>
            {user?.createdAt && (
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Member Since
                </Label>
                <p className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isOrg && organization && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Organization Information
            </CardTitle>
            <CardDescription className="text-sm">
              View your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organization ID
              </Label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
                {organization.id}
              </p>
            </div>
            {organization.slug && (
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Slug
                </Label>
                <p className="text-sm">{organization.slug}</p>
              </div>
            )}
            {organization.createdAt && (
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </Label>
                <p className="text-sm">
                  {new Date(organization.createdAt).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings/general')({
  component: GeneralSettingsPage,
})
