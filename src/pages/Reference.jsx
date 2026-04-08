import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { REF_DATA } from '../data/refData'
import ConsultantCTA from '../components/ConsultantCTA'
import { useAuth } from '../App'

export default function Reference() {
  const { user } = useAuth()
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [search, setSearch] = useState('')
  useEffect(() => { document.title = 'Federal Benefits Reference Guide | FedBenefitsAid' }, [])
