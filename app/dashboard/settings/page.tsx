'use client'
import React, { useState } from 'react'
import { Sidebar } from '../../components/Sidebar'
import { Header } from '../../components/Header'
import { CheckCircle, User, Shield, Bookmark, Bell, Globe, Lock } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('english')
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    walletAddress: localStorage.getItem('walletAddress') || '',
    bio: 'Land owner and blockchain enthusiast'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to a database or API
    console.log('Saving settings:', {
      ...formData,
      notificationsEnabled,
      emailNotifications,
      darkMode,
      language
    })
    
    // Show success message
    setSavedMessage('Settings saved successfully')
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSavedMessage(null)
    }, 3000)
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-5 w-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Bookmark className="h-5 w-5" /> }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>
            
            {/* Success message */}
            {savedMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{savedMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings tabs */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="flex border-b">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex items-center px-6 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-b-2 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="p-6">
                {/* Account settings */}
                {activeTab === 'account' && (
                  <form onSubmit={handleSaveSettings}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          name="walletAddress"
                          id="walletAddress"
                          value={formData.walletAddress}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          This is your connected wallet address and cannot be changed
                        </p>
                      </div>

                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* Notifications settings */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleSaveSettings}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Enable Notifications</h3>
                          <p className="text-xs text-gray-500">Receive notifications about your land records</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="notificationsEnabled"
                            checked={notificationsEnabled}
                            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-900">
                            {notificationsEnabled ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                          <p className="text-xs text-gray-500">Receive email notifications about land transfers</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                            {emailNotifications ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                
                {/* Security settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Connected Wallet</h3>
                      <div className="mt-2 flex items-center justify-between py-3 px-4 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 text-indigo-500 mr-2" />
                          <span className="text-sm text-gray-700 truncate max-w-[300px]">
                            {formData.walletAddress || 'No wallet connected'}
                          </span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Add additional security to your account using two-factor authentication.
                      </p>
                      <button
                        className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Set up 2FA
                      </button>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Session History</h3>
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Device
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IP Address
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Active
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Current Browser
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                127.0.0.1
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Just now
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Preferences settings */}
                {activeTab === 'preferences' && (
                  <form onSubmit={handleSaveSettings}>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700">Dark Mode</h3>
                          <p className="text-xs text-gray-500">Enable dark mode for the application</p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="darkMode"
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-900">
                            {darkMode ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                          Language
                        </label>
                        <div className="mt-1 flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-2" />
                          <select
                            id="language"
                            name="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="chinese">Chinese</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 