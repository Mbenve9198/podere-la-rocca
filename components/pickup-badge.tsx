"use client"

import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface PickupBadgeProps {
  language: string
}

export default function PickupBadge({ language }: PickupBadgeProps) {
  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
      <Package className="w-3 h-3 mr-1" />
      {language === 'it' ? 'Ritiro in loco' : 'Pickup required'}
    </Badge>
  )
} 