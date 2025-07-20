'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z  from "zod"
import Link from "next/link"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import axios, {AxiosError} from 'axios'
import {Loader2 } from 'lucide-react'

import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { signInSchema } from "@/schemas/signInSchema"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function page() {
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedUsername = useDebounceCallback(setUsername,300)
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues:{
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect( ()=>{
    const checkUsernameUnique = async () =>{
        setIsCheckingUsername(true)
        setUsernameMessage('')
      try {
        const response = await axios.get(`/api/check-username-unique?username=${username}`)
        console.log(response.data.message)
        setUsernameMessage(response.data.message)
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError.response?.data.message ?? "Error checking username"
        )
      } finally{
        setIsCheckingUsername(false)
      }
    }
  },[username] ) 

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      console.log(data)
      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast("Success")
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)
    } catch (error) {
      console.error("error in sighnup of user", error)
      setIsSubmitting(false)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
        </div>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                  <Input placeholder="username" {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    debouncedUsername(e.target.value)
                  }}
                   />
                  </FormControl>
                  {isCheckingUsername && <Loader2 
                   className="animate-spin" /> }
                   <p className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                    test {usernameMessage}
                   </p>
                  <FormMessage />
                </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                  <Input placeholder="email" {...field}
                   />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                  <Input type="password" placeholder="password" {...field}
                   />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} >
                {
                  isSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> please wait
                    </>
                  ) : ('Signup')
                }
              </Button>
            </form>
         </Form>
         <div>
          <p>
            Already a member?{''}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800" >
            Sign in
            </Link>
          </p>
         </div>
      </div>
    </div>
  )
}

export default page
