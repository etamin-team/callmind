import { create } from 'zustand'

interface UserStore {
  credits: number
  plan: string
  isLoading: boolean

  setCredits: (credits: number) => void
  setPlan: (plan: string) => void
  decrementCredits: (amount: number) => boolean
  fetchUserCredits: (userId: string, token: string) => Promise<void>
  decrementCreditsOnServer: (
    userId: string,
    amount: number,
    token: string,
  ) => Promise<boolean>
  checkAndDecrementCredits: (
    userId: string,
    amount: number,
    token: string,
  ) => Promise<{ success: boolean; error?: string }>
  refundCredits: (
    userId: string,
    amount: number,
    token: string,
    reason: string,
  ) => Promise<boolean>
}

export const useUserStore = create<UserStore>((set, get) => ({
  credits: 2,
  plan: 'free',
  isLoading: false,

  setCredits: (credits: number) => set({ credits }),

  setPlan: (plan: string) => set({ plan }),

  decrementCredits: (amount: number) => {
    const { credits } = get()
    if (credits < amount) {
      return false
    }
    set({ credits: credits - amount })
    return true
  },

  fetchUserCredits: async (userId: string, token: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const user = await response.json()
        set({
          credits: user.credits ?? 2,
          plan: user.plan ?? 'free',
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error)
      set({ isLoading: false })
    }
  },

  decrementCreditsOnServer: async (
    userId: string,
    amount: number,
    token: string,
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/decrement-credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        },
      )

      if (response.ok) {
        const user = await response.json()
        set({
          credits: user.credits,
          plan: user.plan,
        })
        return true
      } else {
        const error = await response.json()
        console.error('Failed to decrement credits:', error.error)
        return false
      }
    } catch (error) {
      console.error('Failed to decrement credits:', error)
      return false
    }
  },

  checkAndDecrementCredits: async (
    userId: string,
    amount: number,
    token: string,
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/check-and-decrement-credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        set({
          credits: data.credits,
        })
        return { success: true }
      } else {
        const error = await response.json()
        console.error('Failed to check and decrement credits:', error.error)
        return { success: false, error: error.error }
      }
    } catch (error) {
      console.error('Failed to check and decrement credits:', error)
      return { success: false, error: 'Network error' }
    }
  },

  refundCredits: async (
    userId: string,
    amount: number,
    token: string,
    reason: string,
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/refund-credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount, reason }),
        },
      )

      if (response.ok) {
        const data = await response.json()
        set({
          credits: data.credits,
        })
        return true
      } else {
        const error = await response.json()
        console.error('Failed to refund credits:', error.error)
        return false
      }
    } catch (error) {
      console.error('Failed to refund credits:', error)
      return false
    }
  },
}))
