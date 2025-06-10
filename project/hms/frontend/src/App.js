"use client"

import { useState } from "react"
import { Dashboard } from "./components/Dashboard"
import { Appointments } from "./components/Appointments"
import { Blockchain } from "./components/Blockchain"
import { Doctors } from "./components/Doctors"
import { MedicalRecords } from "./components/MedicalRecords"
import { Patients } from "./components/Patients"
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Shield,
  X,
  Stethoscope,
  Scissors,
  Save,
  Receipt,
  Pill,
  Wrench,
  AlertTriangle,
  Boxes,
  BedDouble,
  Menu,
  UserCircle,
  Search,
  Bell,
  Settings,
} from "lucide-react"
import { Technicians } from "./components/Technicians"
import { LabTests } from "./components/LabTests"
import { Surgeries } from "./components/Surgeries"
import { Admissions } from "./components/Admissions"
import { Bills } from "./components/Bills"
import { Medicines } from "./components/Medicines"
import { Equipment } from "./components/Equipment"
import { Emergencies } from "./components/Emergencies"
import { Inventory } from "./components/Inventory"
import { Rooms } from "./components/Rooms"

const HMSApp = () => {
  const [currentView, setCurrentView] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Activity, color: "from-black to-purple-600" },
    { id: "patients", label: "Patients", icon: Users, color: "from-black to-blue-600" },
    { id: "doctors", label: "Doctors", icon: Stethoscope, color: "from-black to-emerald-500" },
    { id: "technicians", label: "Technicians", icon: Wrench, color: "from-black to-purple-600 " },
    { id: "admission", label: "Admissions", icon: Save, color: "from-black to-purple-600" },
    { id: "appointments", label: "Appointments", icon: Calendar, color: "from-black to-blue-600" },
    { id: "rooms", label: "Rooms", icon: BedDouble, color: "from-black to-purple-600" },
    { id: "emergencies", label: "Emergencies", icon: AlertTriangle, color: "from-black to-pink-600" },
    { id: "records", label: "Medical Records", icon: FileText, color: "from-black to-purple-600" },
    { id: "labtest", label: "Lab Tests", icon: Pill, color: "from-black to-purple-600" },
    { id: "surgery", label: "Surgeries", icon: Scissors, color: "from-black to-rose-600" },
    { id: "medicines", label: "Medicines", icon: Pill, color: "from-black to-teal-600" },
    { id: "equipment", label: "Equipment", icon: Wrench, color: "from-black to-gray-600" },
    { id: "Inventory", label: "Inventory", icon: Boxes, color: "from-black to-yellow-600" },
    { id: "bill", label: "Bills", icon: Receipt, color: "from-black to-green-600" },
    { id: "blockchain", label: "Blockchain", icon: Shield, color: "from-black to-purple-600" },
  ]

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />
      case "patients":
        return <Patients />
      case "doctors":
        return <Doctors />
      case "technicians":
        return <Technicians />
      case "appointments":
        return <Appointments />
      case "records":
        return <MedicalRecords />
      case "rooms":
        return <Rooms />
      case "labtest":
        return <LabTests />
      case "surgery":
        return <Surgeries />
      case "admission":
        return <Admissions />
      case "emergencies":
        return <Emergencies />
      case "medicines":
        return <Medicines />
      case "blockchain":
        return <Blockchain />
      case "bill":
        return <Bills />
      case "equipment":
        return <Equipment />
      case "Inventory":
        return <Inventory />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-black to-black text-white font-sans overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Sidebar */}
      <div
       className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-black to-black backdrop-blur-xl border-r border-purple-700/50 
  shadow-[0_0_20px_4px_rgba(147,51,234,0.5)] transform 
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
  transition-all duration-500 ease-out 
  lg:translate-x-0 lg:static lg:shadow-none`}

      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-purple-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-black to-purple-800 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-800 bg-clip-text text-transparent">
                MediCore
              </h1>
              <p className="text-xs text-gray-400">Hospital System</p>
            </div>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white transition-colors focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {navigation.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 group
                  ${
                    currentView === item.id
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/25`
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="transition-all duration-300">{item.label}</span>
                {currentView === item.id && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700/50">
          
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top nav */}
                <header className="bg-black backdrop-blur-xl border-b border-purple-700/50 shadow-lg relative z-10">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-400 hover:text-white transition-colors focus:outline-none p-2 rounded-lg hover:bg-gray-800/50"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="hidden sm:block">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-800 to-purple-900 bg-clip-text text-transparent">
                  {navigation.find((item) => item.id === currentView)?.label || "Dashboard"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Manage your hospital operations efficiently</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-black rounded-xl px-4 py-2 border border-gray-700/50">
                <Search className="h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-purple-400 placeholder-purple-300 focus:outline-none w-40"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-purple-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Date */}
              <div className="hidden lg:block text-sm text-purple-300 bg-black px-4 py-2 rounded-xl border border-gray-700/50">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {/* Profile */}
              <div className="relative group cursor-pointer">
                <div className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-800/50 transition-colors">
                  <UserCircle className="h-8 w-8 text-purple-400" />
                  <div className="hidden sm:block">
                          <p className="text-sm font-medium text-purple-300">Dr. Admin</p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto relative">
          <div className="p-6">{renderCurrentView()}</div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default HMSApp
