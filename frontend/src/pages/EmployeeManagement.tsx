import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { employeeApi } from '@/lib/api'
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Target,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Camera
} from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  status: 'active' | 'inactive' | 'on-leave' | 'terminated'
  profileImage?: string
  address: string
  city: string
  country: string
  postalCode: string
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  salary: {
    base: number
    hourlyRate: number
    paymentType: 'hourly' | 'salary'
    currency: string
  }
  skills: string[]
  education: Array<{
    degree: string
    institution: string
    year: string
    field: string
  }>
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
  }>
  performance: {
    rating: number
    lastReview: string
    nextReview: string
    goals: string[]
    achievements: string[]
  }
  attendance: {
    totalDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    leaveDays: number
  }
  documents: Array<{
    type: string
    name: string
    uploadDate: string
    expiryDate?: string
  }>
}

interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave'
  overtime: number
  notes: string
}

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approvedDate?: string
  notes?: string
}

interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewDate: string
  reviewerId: string
  reviewerName: string
  overallRating: number
  categories: {
    quality: number
    productivity: number
    teamwork: number
    communication: number
    initiative: number
  }
  strengths: string[]
  areasForImprovement: string[]
  goals: string[]
  comments: string
  nextReviewDate: string
}

interface Training {
  id: string
  title: string
  description: string
  type: 'internal' | 'external' | 'online' | 'workshop'
  startDate: string
  endDate: string
  duration: number
  cost: number
  instructor: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  participants: Array<{
    employeeId: string
    employeeName: string
    enrollmentDate: string
    status: 'enrolled' | 'completed' | 'dropped'
    completionDate?: string
    grade?: string
  }>
}

export function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leave' | 'performance' | 'training'>('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)

  const queryClient = useQueryClient()

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', searchTerm, selectedDepartment, selectedStatus],
    queryFn: async () => {
      const response = await employeeApi.getEmployees({
        search: searchTerm,
        department: selectedDepartment,
        status: selectedStatus
      })
      return response?.data || []
    }
  })

  const { data: attendanceRecords } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await employeeApi.getAttendanceRecords()
      return response?.data || []
    }
  })

  const { data: leaveRequests } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const response = await employeeApi.getLeaveRequests()
      return response?.data || []
    }
  })

  const { data: performanceReviews } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: async () => {
      const response = await employeeApi.getPerformanceReviews()
      return response?.data || []
    }
  })

  const { data: trainingPrograms } = useQuery({
    queryKey: ['training-programs'],
    queryFn: async () => {
      const response = await employeeApi.getTrainingPrograms()
      return response?.data || []
    }
  })

  const { data: employeeMetrics } = useQuery({
    queryKey: ['employee-metrics'],
    queryFn: async () => {
      const response = await employeeApi.getEmployeeMetrics()
      return response?.data || {}
    }
  })

  const createEmployeeMutation = useMutation({
    mutationFn: async (employee: Employee) => {
      return await employeeApi.createEmployee(employee)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setShowCreateModal(false)
    }
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: async (employee: Employee) => {
      return await employeeApi.updateEmployee(employee.id, employee)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setEditingEmployee(null)
      setShowEmployeeDetails(false)
    }
  })

  const approveLeaveMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await employeeApi.approveLeaveRequest(leaveId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    }
  })

  const rejectLeaveMutation = useMutation({
    mutationFn: async (leaveId: string) => {
      return await employeeApi.rejectLeaveRequest(leaveId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'present': return 'text-green-400 bg-green-400/20'
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'approved': return 'text-green-400 bg-green-400/20'
      case 'inactive': return 'text-gray-400 bg-gray-400/20'
      case 'absent': return 'text-red-400 bg-red-400/20'
      case 'late': return 'text-yellow-400 bg-yellow-400/20'
      case 'on-leave': return 'text-blue-400 bg-blue-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'rejected': return 'text-red-400 bg-red-400/20'
      case 'terminated': return 'text-red-400 bg-red-400/20'
      case 'cancelled': return 'text-gray-400 bg-gray-400/20'
      case 'half-day': return 'text-orange-400 bg-orange-400/20'
      case 'ongoing': return 'text-blue-400 bg-blue-400/20'
      case 'planned': return 'text-purple-400 bg-purple-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400'
    if (rating >= 3.5) return 'text-blue-400'
    if (rating >= 2.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAttendanceRate = (attendance: any) => {
    return attendance.totalDays > 0 ? (attendance.presentDays / attendance.totalDays) * 100 : 0
  }

  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus
    return matchesSearch && matchesDepartment && matchesStatus
  }) || []

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading employee management...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="fixed inset-0 opacity-20">
        <div className="w-full h-full bg-pattern"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Employee Management
          </h1>
          <p className="text-gray-300 text-lg">Manage your workforce efficiently</p>
        </div>

        {/* Employee Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employeeMetrics.totalEmployees || 0}</div>
              <p className="text-xs text-gray-300">{employeeMetrics.activeEmployees || 0} active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employeeMetrics.averageAttendanceRate || 0}%</div>
              <p className="text-xs text-gray-300">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pending Leave</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employeeMetrics.pendingLeaveRequests || 0}</div>
              <p className="text-xs text-gray-300">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Avg Performance</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{employeeMetrics.averagePerformanceRating || 0}</div>
              <p className="text-xs text-gray-300">Out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-white/20">
          <nav className="flex space-x-8">
            {[
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'leave', label: 'Leave Requests', icon: Clock },
              { id: 'performance', label: 'Performance', icon: Award },
              { id: 'training', label: 'Training', icon: GraduationCap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Employees</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white w-64"
                  />
                </div>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all">All Departments</option>
                  <option value="production">Production</option>
                  <option value="management">Management</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="maintenance">Maintenance</option>
                </Select>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </Select>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmployees.map((employee: Employee) => (
                  <div key={employee.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {employee.profileImage ? (
                            <img src={employee.profileImage} alt={employee.firstName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            `${employee.firstName[0]}${employee.lastName[0]}`
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{employee.firstName} {employee.lastName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                              {employee.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                            <div>
                              <span className="block text-gray-400">Position:</span>
                              <span className="font-medium text-white">{employee.position}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Department:</span>
                              <span className="font-medium text-white">{employee.department}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Email:</span>
                              <span className="font-medium text-white">{employee.email}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Phone:</span>
                              <span className="font-medium text-white">{employee.phone}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300 mt-2">
                            <div>
                              <span className="block text-gray-400">Salary:</span>
                              <span className="font-medium text-white">{formatCurrency(employee.salary.base, 'DZD')}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Hire Date:</span>
                              <span className="font-medium text-white">{formatDate(employee.hireDate)}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Performance:</span>
                              <span className={`font-medium ${getPerformanceColor(employee.performance.rating)}`}>
                                {employee.performance.rating.toFixed(1)}/5.0
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setShowEmployeeDetails(true)
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => setEditingEmployee(employee)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Attendance Records</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Record Attendance
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords?.slice(0, 20).map((record: Attendance) => (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{record.employeeName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="block text-gray-400">Date:</span>
                          <span className="font-medium text-white">{formatDate(record.date)}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Check In:</span>
                          <span className="font-medium text-white">{record.checkIn}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Check Out:</span>
                          <span className="font-medium text-white">{record.checkOut}</span>
                        </div>
                        <div>
                          <span className="block text-gray-400">Overtime:</span>
                          <span className="font-medium text-white">{record.overtime} hours</span>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-300">
                          <span className="text-gray-400">Notes: </span>
                          {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leave Requests Tab */}
        {activeTab === 'leave' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Leave Requests</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Leave Request
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests?.map((request: LeaveRequest) => (
                  <div key={request.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{request.employeeName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Type:</span>
                            <span className="font-medium text-white">{request.type}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Duration:</span>
                            <span className="font-medium text-white">{request.days} days</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Start:</span>
                            <span className="font-medium text-white">{formatDate(request.startDate)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">End:</span>
                            <span className="font-medium text-white">{formatDate(request.endDate)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300">
                          <span className="text-gray-400">Reason: </span>
                          {request.reason}
                        </div>
                        {request.status === 'approved' && request.approvedBy && (
                          <div className="mt-2 text-sm text-gray-300">
                            <span className="text-gray-400">Approved by: </span>
                            {request.approvedBy} on {formatDate(request.approvedDate!)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => approveLeaveMutation.mutate(request.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => rejectLeaveMutation.mutate(request.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Performance Reviews</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Review
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceReviews?.map((review: PerformanceReview) => (
                  <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{review.employeeName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(review.overallRating)}`}>
                            {review.overallRating.toFixed(1)}/5.0
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Review Date:</span>
                            <span className="font-medium text-white">{formatDate(review.reviewDate)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Reviewer:</span>
                            <span className="font-medium text-white">{review.reviewerName}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Next Review:</span>
                            <span className="font-medium text-white">{formatDate(review.nextReviewDate)}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Quality:</span>
                            <span className={`font-medium ${getPerformanceColor(review.categories.quality)}`}>
                              {review.categories.quality.toFixed(1)}/5.0
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Productivity:</span>
                        <span className={`block font-medium ${getPerformanceColor(review.categories.productivity)}`}>
                          {review.categories.productivity.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Teamwork:</span>
                        <span className={`block font-medium ${getPerformanceColor(review.categories.teamwork)}`}>
                          {review.categories.teamwork.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Communication:</span>
                        <span className={`block font-medium ${getPerformanceColor(review.categories.communication)}`}>
                          {review.categories.communication.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Initiative:</span>
                        <span className={`block font-medium ${getPerformanceColor(review.categories.initiative)}`}>
                          {review.categories.initiative.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Goals:</span>
                        <span className="block font-medium text-white">
                          {review.goals.length} set
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-white">Training Programs</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Program
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPrograms?.map((program: Training) => (
                  <div key={program.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                            {program.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="block text-gray-400">Type:</span>
                            <span className="font-medium text-white">{program.type}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Duration:</span>
                            <span className="font-medium text-white">{program.duration} hours</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Cost:</span>
                            <span className="font-medium text-white">{formatCurrency(program.cost, 'DZD')}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400">Participants:</span>
                            <span className="font-medium text-white">{program.currentParticipants}/{program.maxParticipants}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300">
                          <span className="text-gray-400">Instructor: </span>
                          {program.instructor} | <span className="text-gray-400">Location: </span>{program.location}
                        </div>
                        <div className="mt-1 text-sm text-gray-300">
                          <span className="text-gray-400">Period: </span>
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-300 mb-2">Participants:</div>
                      <div className="flex flex-wrap gap-2">
                        {program.participants.slice(0, 5).map((participant, index) => (
                          <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                            {participant.employeeName}
                          </span>
                        ))}
                        {program.participants.length > 5 && (
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                            +{program.participants.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employee Details Modal */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Employee Details</h2>
              <Button
                onClick={() => setShowEmployeeDetails(false)}
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedEmployee.profileImage ? (
                      <img src={selectedEmployee.profileImage} alt={selectedEmployee.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      `${selectedEmployee.firstName[0]}${selectedEmployee.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p className="text-gray-300">{selectedEmployee.position}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="w-4 h-4" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEmployee.address}, {selectedEmployee.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Briefcase className="w-4 h-4" />
                    <span>{selectedEmployee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>Hired: {formatDate(selectedEmployee.hireDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Performance & Attendance */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Overall Rating:</span>
                      <span className={`font-medium ${getPerformanceColor(selectedEmployee.performance.rating)}`}>
                        {selectedEmployee.performance.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Review:</span>
                      <span className="text-white">{formatDate(selectedEmployee.performance.lastReview)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Next Review:</span>
                      <span className="text-white">{formatDate(selectedEmployee.performance.nextReview)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Attendance Rate:</span>
                      <span className="text-white">{getAttendanceRate(selectedEmployee.attendance).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Present Days:</span>
                      <span className="text-white">{selectedEmployee.attendance.presentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Absent Days:</span>
                      <span className="text-white">{selectedEmployee.attendance.absentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Late Days:</span>
                      <span className="text-white">{selectedEmployee.attendance.lateDays}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                onClick={() => {
                  setEditingEmployee(selectedEmployee)
                  setShowEmployeeDetails(false)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Edit Employee
              </Button>
              <Button
                onClick={() => setShowEmployeeDetails(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
