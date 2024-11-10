'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Settings, Plus, Image, Video, AppWindow, Trash2 } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type HiddenItem = {
  id: string;
  type: 'app' | 'photo' | 'video';
  name: string;
}

export default function Component() {
  const [display, setDisplay] = useState('0')
  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('1234')
  const [showSecret, setShowSecret] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showInitialScreen, setShowInitialScreen] = useState(true)
  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([])
  const [showInstructions, setShowInstructions] = useState(false)
  const equalPressCount = useRef(0)
  const lastEqualPressTime = useRef(0)

  useEffect(() => {
    const storedPassword = localStorage.getItem('hiddenCalculatorPassword')
    if (storedPassword) {
      setCurrentPassword(storedPassword)
      setShowInitialScreen(false)
    }

    const storedItems = localStorage.getItem('hiddenCalculatorItems')
    if (storedItems) {
      setHiddenItems(JSON.parse(storedItems))
    }
  }, [])

  const saveToStorage = (items: HiddenItem[]) => {
    localStorage.setItem('hiddenCalculatorItems', JSON.stringify(items))
  }

  const handleButtonClick = (value: string) => {
    if (display === '0') {
      setDisplay(value)
    } else {
      setDisplay(display + value)
    }

    const newPasswordAttempt = (password + value).slice(-4)
    setPassword(newPasswordAttempt)
  }

  const handleClear = () => {
    setDisplay('0')
    setPassword('')
  }

  const handleEqual = () => {
    const currentTime = new Date().getTime()
    if (currentTime - lastEqualPressTime.current < 500) {
      equalPressCount.current += 1
    } else {
      equalPressCount.current = 1
    }
    lastEqualPressTime.current = currentTime

    if (equalPressCount.current === 3) {
      setShowInstructions(true)
      equalPressCount.current = 0
      return
    }

    if (password === currentPassword) {
      setShowSecret(true)
    } else {
      try {
        setDisplay(eval(display).toString())
      } catch (error) {
        setDisplay('Error')
      }
    }
    setPassword('')
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }
    if (newPassword.length !== 4) {
      setPasswordError("Password must be 4 digits")
      return
    }
    setCurrentPassword(newPassword)
    localStorage.setItem('hiddenCalculatorPassword', newPassword)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('Password changed successfully')
    toast.success('Password changed successfully')
  }

  const handleAddItem = (type: 'app' | 'photo' | 'video') => {
    const newItem: HiddenItem = {
      id: Date.now().toString(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${hiddenItems.filter(item => item.type === type).length + 1}`
    }
    const updatedItems = [...hiddenItems, newItem]
    setHiddenItems(updatedItems)
    saveToStorage(updatedItems)
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = hiddenItems.filter(item => item.id !== id)
    setHiddenItems(updatedItems)
    saveToStorage(updatedItems)
    toast.success('Item deleted successfully')
  }

  const Watermark = () => (
    <div className="fixed bottom-2 right-2 text-black-400 opacity-100 text-sm pointer-events-none">
      Savan
    </div>
  )

  if (showInitialScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome to Hidden Calculator</CardTitle>
            <CardDescription>Your initial password is set to:</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-center mb-4">1234</p>
            <p className="text-sm text-gray-500 mb-4">You can change this password in the settings once you access the secret area.</p>
            <Button className="w-full" onClick={() => setShowInitialScreen(false)}>
              Start Using Calculator
            </Button>
          </CardContent>
        </Card>
        <Watermark />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {!showSecret ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              className="text-right text-2xl mb-4"
              value={display}
              readOnly
            />
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/'].map((btn) => (
                <Button key={btn} onClick={() => handleButtonClick(btn)}>{btn}</Button>
              ))}
              {['4', '5', '6', '*'].map((btn) => (
                <Button key={btn} onClick={() => handleButtonClick(btn)}>{btn}</Button>
              ))}
              {['1', '2', '3', '-'].map((btn) => (
                <Button key={btn} onClick={() => handleButtonClick(btn)}>{btn}</Button>
              ))}
              {['0', '.', '=', '+'].map((btn) => (
                <Button key={btn} onClick={btn === '=' ? handleEqual : () => handleButtonClick(btn)}>{btn}</Button>
              ))}
              <Button className="col-span-2" onClick={handleClear}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Secret Area</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Change password</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-password" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="col-span-3"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirm-password" className="text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="col-span-3"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword}>Change Password</Button>
                {passwordError && <p className="text-sm text-red-500 mt-2">{passwordError}</p>}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="apps">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="apps">Hidden Apps</TabsTrigger>
                <TabsTrigger value="photos">Hidden Photos</TabsTrigger>
                <TabsTrigger value="videos">Hidden Videos</TabsTrigger>
              </TabsList>
              {['apps', 'photos', 'videos'].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hiddenItems
                      .filter((item) => item.type === tabValue.slice(0, -1) as 'app' | 'photo' | 'video')
                      .map((item) => (
                        <div key={item.id} className="relative aspect-square bg-gray-200 rounded-lg flex flex-col items-center justify-center p-2">
                          {item.type === 'app' && <AppWindow className="h-8 w-8 text-gray-500 mb-2" />}
                          {item.type === 'photo' && <Image className="h-8 w-8 text-gray-500 mb-2" />}
                          {item.type === 'video' && <Video className="h-8 w-8 text-gray-500 mb-2" />}
                          <span className="text-xs text-center break-words">{item.name}</span>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    <Button
                      variant="outline"
                      className="aspect-square flex flex-col items-center justify-center"
                      onClick={() => handleAddItem(tabValue.slice(0, -1) as 'app' | 'photo' | 'video')}
                    >
                      <Plus className="h-8 w-8 mb-2" />
                      <span className="text-sm">Add {tabValue.slice(0, -1)}</span>
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <Button className="mt-4" onClick={() => {
              setShowSecret(false)
              setDisplay('0')
            }}>Back to Calculator</Button>
          </CardContent>
        </Card>
      )}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hidden Calculator Instructions</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>This is a special calculator with a hidden feature:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>this application in created by SAVANKESARI</li>
              <li>Use it as a normal calculator for basic arithmetic operations.</li>
              <li>To access the secret area, enter the 4-digit password and press '='.</li>
              <li>The default password is 1234, which you can change in the secret area settings.</li>
              <li>In the secret area, you can store hidden apps, photos, and videos.</li>
              <li>Press '=' three times quickly to see these instructions again.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
      <Watermark />
    </div>
  )
}