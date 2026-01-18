import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useWallet(userId) {
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!userId) return

    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (data) setBalance(data.balance)
      if (error) console.error("Error wallet:", error.message)
    }

    fetchBalance()

    const channel = supabase
      .channel(`wallet_user_${userId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          console.log("Nuevo saldo recibido:", payload.new.balance)
          setBalance(payload.new.balance)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return balance
}