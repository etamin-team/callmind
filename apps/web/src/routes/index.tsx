import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '@/features/marketing/pages/LandingPage'



export const Route = createFileRoute('/')({ component: App })

function App() {
 

  return (
    <LandingPage />
   
  )
}
