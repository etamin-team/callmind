import { createFileRoute } from '@tanstack/react-router'
import { Bot, MessageSquare, Mic, Phone, RefreshCw, Send, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentStore } from '@/features/agents/store'
import { Badge } from '@/components/ui/badge'

function PlaygroundPage() {
  const { agents } = useAgentStore()
  
  return (
    <div className="flex h-full">
      {/* Playground Config Panel */}
      <div className="w-80 border-r bg-card/50 p-6 flex flex-col gap-6 overflow-y-auto">
         <div>
            <h2 className="text-lg font-semibold mb-1">Playground</h2>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
               <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
               Trained
            </div>
         </div>
         
         <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Model</Label>
              <Badge variant="outline" className="text-xs">GPT-4o</Badge>
            </div>
            
            <div className="space-y-4 pt-2">
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <Label className="text-xs">Temperature</Label>
                     <span className="text-xs text-muted-foreground">0.7</span>
                  </div>
                  <Slider defaultValue={[0.7]} max={1} step={0.1} />
                  <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                     <span>Precise</span>
                     <span>Creative</span>
                  </div>
               </div>
            </div>
         </div>
         
         <Separator />

         <div className="space-y-4">
            <Label>Agent Configuration</Label>
            
            <div className="space-y-2">
               <Label className="text-xs">Voice</Label>
               <Select defaultValue="sarah">
                  <SelectTrigger>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="sarah">Sarah (Friendly)</SelectItem>
                     <SelectItem value="mike">Mike (Professional)</SelectItem>
                  </SelectContent>
               </Select>
            </div>
            
            <div className="space-y-2">
               <Label className="text-xs">First Sentence</Label>
               <div className="relative">
                  <Input defaultValue="Hi, how can I help you today?" className="pr-8" />
                  <RefreshCw className="w-4 h-4 absolute right-2 top-2.5 text-muted-foreground cursor-pointer hover:text-foreground" />
               </div>
            </div>
         </div>
         
         <div className="mt-auto">
             <Button className="w-full" variant="outline">
                <Settings2 className="w-4 h-4 mr-2" />
                Advanced Settings
             </Button>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50">
         <div className="flex-1 p-8 flex flex-col items-center justify-center">
            {/* Empty State / Initial */}
            <div className="max-w-md w-full space-y-8">
               <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">Test your agent</h3>
                  <p className="text-muted-foreground text-sm">Use the playground to verify specific flows and behaviors before deploying.</p>
               </div>
               
               <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium">Agent</p>
                        <p className="text-sm text-muted-foreground">Hi! What can I help you with today?</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         
         {/* Input Area */}
         <div className="p-4 border-t bg-background">
            <div className="max-w-3xl mx-auto flex gap-2">
               <Button size="icon" variant="ghost">
                  <Mic className="w-4 h-4" />
               </Button>
               <Input placeholder="Type a message to test..." className="flex-1" />
               <Button size="icon">
                  <Send className="w-4 h-4" />
               </Button>
               <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                  <Phone className="w-4 h-4" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/agents/$agentId/')({
  component: PlaygroundPage,
})
