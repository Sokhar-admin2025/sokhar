'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { DASHBOARD_TEXTS } from '../../lib/content'
import { messageService } from '../../services/messageService'
import { Conversation, Message } from '../../types'
import Button from '../../components/atoms/Button'

// Skapa Supabase-klient
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function InboxPage() {
  const router = useRouter()
  const t = DASHBOARD_TEXTS.messages
  
  // State
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  // Ref för att scrolla ner automatiskt i chatten
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Hämta användare och inkorg vid start
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      try {
        const data = await messageService.getMyConversations(user.id)
        setConversations(data)
      } catch (error) {
        console.error('Kunde inte hämta inkorg:', error)
      } finally {
        setLoadingInbox(false)
      }
    }
    init()
  }, [router])

  // 2. När man klickar på en konversation -> Hämta meddelanden
  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      setLoadingMessages(true)
      try {
        const data = await messageService.getMessages(selectedConversation.id)
        setMessages(data)
      } catch (error) {
        console.error('Kunde inte hämta meddelanden:', error)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  // Scrolla till botten när nya meddelanden kommer
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 3. Skicka meddelande
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !userId) return

    setSending(true)
    try {
      await messageService.sendMessage(selectedConversation.id, userId, newMessage)
      
      // Lägg till meddelandet lokalt direkt (för snabbare känsla)
      const tempMsg: Message = {
        id: 'temp-' + Date.now(),
        conversation_id: selectedConversation.id,
        sender_id: userId,
        content: newMessage,
        is_read: false,
        created_at: new Date().toISOString()
      }
      setMessages([...messages, tempMsg])
      setNewMessage('')
    } catch (error) {
      alert('Kunde inte skicka meddelande')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">{t.pageTitle}</h1>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black">
          ← Tillbaka till Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-grow p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
        
        {/* --- VÄNSTER: LISTA (Inkorg) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 font-medium text-gray-600">
            {t.navLabel}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loadingInbox ? (
              <div className="p-4 text-center text-gray-400">{t.inbox.loading}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>{t.inbox.empty}</p>
              </div>
            ) : (
              <ul>
                {conversations.map((conv) => (
                  <li 
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Liten bild på varan */}
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {conv.listing?.images?.[0] && (
                          <img src={conv.listing.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {conv.listing?.title || 'Okänd annons'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- HÖGER: CHATT-FÖNSTER --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2 flex flex-col h-full overflow-hidden">
          
          {!selectedConversation ? (
            // Om ingen chatt är vald
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="text-6xl mb-4">💬</div>
              <p>{t.chat.noSelection}</p>
            </div>
          ) : (
            // Om chatt ÄR vald
            <>
              {/* Chatt-header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Angående:</span>
                  <h3 className="font-bold text-gray-800">
                    <Link href={`/annons/${selectedConversation.listing_id}`} className="hover:underline">
                      {selectedConversation.listing?.title}
                    </Link>
                  </h3>
                </div>
              </div>

              {/* Meddelande-logg */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loadingMessages ? (
                  <div className="text-center text-gray-400 text-sm">Laddar meddelanden...</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === userId
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Skrivfält */}
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.chat.placeholder}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? t.chat.sending : t.chat.send}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}