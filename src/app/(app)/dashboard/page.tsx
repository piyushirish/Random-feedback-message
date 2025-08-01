'use client';
import MessageCard from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Message } from '@/models/user'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator'
import { User } from 'next-auth';


function Page() {

  const {data: session} = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message)=> message.id !==messageId))
  }

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register, watch, setValue} = form;
  const acceptMessages = watch('acceptMessage')
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      const isAccepting = Boolean(response.data.isAcceptingMessage);
      setValue('acceptMessage', isAccepting);
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      console.log(AxiosError);
      toast("failed to fetch message settings")
    } finally {
      setIsSwitchLoading(false)
    }
  },[setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if(refresh){
        toast("showing latest messages")
      }
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      console.log(AxiosError);
      toast("failed to fetch message settings")
    } finally {
      setIsSwitchLoading(false)
      setIsLoading(false)
    }  
  },[setIsLoading, setMessages])
 
  useEffect(()=>{
    if(!session || !session.user) return 
    fetchMessages()
    fetchAcceptMessage()

  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  // handle switch change 
  const handleSwitchChange = async () =>{
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages',{
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessage', !acceptMessages)
      toast(response.data.message)
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse>;
      console.log(AxiosError);
      toast("failed to fetch message settings")
    }
  }

  if(!session || !session.user) {
    return <div>Please Login</div>
  }
  const {username} = session?.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () =>{
    navigator.clipboard.writeText(profileUrl)
    toast("Url copied")
  }

  return (
    <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'>
      <h1 className='text-4xl font-bold mb-4' >User Dashboard</h1>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold mb-2'>
          Unique Link
        </h2> { ' '}
        <div className='flex items-center'>
          <input type="text"
          value={profileUrl}
          disabled
          className='input input-bordered w-full p-2 mr-2'
           />
           <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className='mb-4'>
      <Switch
      {...register('acceptMessage')}
      checked = {acceptMessages}
      onCheckedChange={handleSwitchChange} 
      disabled = {isSwitchLoading}
      />
      <span className=' ml-2'>
        Accept Messages: {acceptMessages? 'On' : 'Off'}
      </span>
      <Separator />
      <Button className='mt-4'
      variant='outline'
      onClick={(e) => {
        e.preventDefault();
        fetchMessages(true);
      }}
      >
        { isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin'/>
        ):(
          <RefreshCcw className='h-4 w-4'/>
        )}
      </Button>
      <div>
        {
          messages.length>0 ? (
            messages.map((message) => (
              <MessageCard 
              key={message.id}
              message={message}
              onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )
        }
      </div>
      </div>
    </div>
  )
}

export default Page