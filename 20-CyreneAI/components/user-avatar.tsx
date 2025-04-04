'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export const UserAvatar = () => {
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress") || "default"
    setAvatarUrl(`robohash.org/${walletAddress}?set=set4`)
  }, [])

  if (!avatarUrl) return null

  return (
    <div className="relative w-14 h-14 ml-2 mr-4">
      <div className="absolute inset-0 bg-white rounded-full" />
      <Image
        src={`https://${avatarUrl}`}
        alt='user_avatar'
        className='rounded-full object-contain p-1'
        fill
        sizes="56px"
        priority
        unoptimized
      />
    </div>
  )
} 