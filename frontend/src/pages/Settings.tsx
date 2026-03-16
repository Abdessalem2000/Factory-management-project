import { useState } from 'react'
import { ERPCard, ERPCardHeader, ERPCardTitle, ERPCardContent } from '@/components/ui/ERPCard'
import Button from '@/components/ui/Button'
import { Settings, Save, Database, Bell, Shield, Palette } from 'lucide-react'

export function Settings() {
  const [settings, setSettings] = useState({
    factoryName: 'Factory Manager ERP',
    timezone: 'UTC',
    currency: 'USD',
    language: 'English',
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoBackup: true,
  })

  const handleSave = () => {
    console.log('Settings saved:', settings)
    // Add save functionality here
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your factory management system</p>
        </div>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* General Settings */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            General Settings
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Factory Name</label>
              <input
                type="text"
                value={settings.factoryName}
                onChange={(e) => setSettings({...settings, factoryName: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
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
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Notification Settings */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
            </label>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Appearance Settings */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Appearance
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Dark Mode</span>
            </label>
          </div>
        </ERPCardContent>
      </ERPCard>

      {/* Data Management */}
      <ERPCard>
        <ERPCardHeader>
          <ERPCardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </ERPCardTitle>
        </ERPCardHeader>
        <ERPCardContent>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Automatic Backup</span>
            </label>
            <div className="pt-4">
              <Button variant="outline" className="mr-2">
                Export Data
              </Button>
              <Button variant="outline">
                Import Data
              </Button>
            </div>
          </div>
        </ERPCardContent>
      </ERPCard>
    </div>
  )
}
