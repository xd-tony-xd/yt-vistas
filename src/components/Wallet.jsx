import { useWallet } from '../hooks/useWallet'

export default function Wallet({ user }) {
  const balance = useWallet(user?.id)

  return (
    <div className="bg-yellow-100 p-4 rounded-lg flex justify-between items-center mb-6">
      <span className="font-bold text-yellow-800">Tu Saldo:</span>
      <span className="text-2xl font-black text-yellow-600">🪙 {balance}</span>
    </div>
  )
}