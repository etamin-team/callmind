interface ReviewStepProps {
  config: {
    name: string
    businessName: string
    primaryGoal: string
    collectFields: Array<string>
  }
}

export function ReviewStep({ config }: ReviewStepProps) {
  return (
    <div className="space-y-4 text-sm">
      <div className="border-t border-b border-border py-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span>{config.name || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Business</span>
          <span>{config.businessName || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Goal</span>
          <span>{config.primaryGoal || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Collect</span>
          <span>{config.collectFields?.join(', ') || '—'}</span>
        </div>
      </div>
    </div>
  )
}
