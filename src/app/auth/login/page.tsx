"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'

export default function Login() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUser(data.user)
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const login = async () => {
    try {
      // we need to add repo and workflow scopes for
      // - forking
      // - monitoring github actions
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: "repo workflow",
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
        console.error('Login error:', error)
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Sign in with GitHub</h1>
      <button onClick={login}>Login</button>
    </div>
  )
}