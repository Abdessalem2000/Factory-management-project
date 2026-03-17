import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, Save, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Settings() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const queryClient = useQueryClient()
  const { theme, toggleTheme } = useTheme()
  
  const [settings, setSettings] = useState({
    factoryName: 'Factory Manager ERP',
    timezone: 'UTC',
    currency: 'USD',
    emailNotifications: true,
    pushNotifications: false,
    darkMode: theme === 'dark',
    autoBackup: true,
  })

  // Mutation pour sauvegarder les settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simuler API call
      return new Promise(resolve => {
        setTimeout(() => resolve(data), 1000)
      })
    },
    onSuccess: () => {
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 2000)
      console.log('Settings saved successfully:', settings)
    },
    onError: (error) => {
      console.error('Error saving settings:', error)
    }
  })

  const handleSave = () => {
    console.log('Saving settings:', settings)
    saveSettingsMutation.mutate(settings)
  }

  const updateField = (field: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [field]: value }
      console.log('Settings updated:', newSettings)
      return newSettings
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="text-green-800 font-medium">Success!</h4>
            <p className="text-green-600 text-sm">Settings saved successfully</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your factory management system</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saveSettingsMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          {saveSettingsMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Factory Name</label>
            <input
              type="text"
              value={settings.factoryName}
              onChange={(e) => updateField('factoryName', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="CET">CET</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => updateField('emailNotifications', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => updateField('pushNotifications', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
          </label>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Dark Mode</span>
              <p className="text-xs text-gray-500">Toggle between light and dark theme</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-600"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {theme === 'dark' ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark mode is active</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Light mode is active</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Data Management</h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => updateField('autoBackup', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Automatic Backup</span>
          </label>
          <div className="pt-4">
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2">
              Export Data
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md">
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
