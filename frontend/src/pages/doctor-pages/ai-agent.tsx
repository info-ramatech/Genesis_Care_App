import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Loader2, 
  Search,
  MessageSquare,
  Sparkles,
  Clock,
  RefreshCw
} from "lucide-react"
import { 
  chatWithPatientHistory, 
  summarizePatientHistory, 
  getPatients,
  type Patient,
  type ChatMessage,
  type PatientSummaryResponse
} from "../../lib/api"

export default function AIChatInterface() {
  // State management
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<PatientSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  
  // Search dropdown state
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get auth data
  const getAuthData = () => {
    try {
      const token = localStorage.getItem("access_token") || ""
      const role = (localStorage.getItem("role") || "").toLowerCase()
      return { token, role }
    } catch (error) {
      return { token: "", role: "" }
    }
  }

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(patient => {
        const searchString = `P${patient.id.toString().padStart(3, '0')} ${patient.first_name} ${patient.last_name}`.toLowerCase()
        return searchString.includes(searchTerm.toLowerCase())
      })
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      const { token, role } = getAuthData()
      
      if (!token || role !== "doctor") {
        setError("Unauthorized. Only doctors can access AI chat.")
        setPatientsLoading(false)
        return
      }

      try {
        const fetchedPatients = await getPatients({ accessToken: token })
        setPatients(fetchedPatients)
        setFilteredPatients(fetchedPatients) // Initialize filtered list
      } catch (err: any) {
        setError(err?.message || "Failed to fetch patients")
      } finally {
        setPatientsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchTerm(`P${patient.id.toString().padStart(3, '0')} ${patient.first_name} ${patient.last_name}`)
    setIsDropdownOpen(false)
    setMessages([]) // Clear previous chat
    setSummary(null) // Clear previous summary
    setError(null)
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value.trim() === "") {
      setSelectedPatient(null)
    }
    setIsDropdownOpen(true)
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsDropdownOpen(true)
  }

  // Handle clicking outside dropdown
  const handleInputBlur = () => {
    // Delay closing to allow for selection
    setTimeout(() => setIsDropdownOpen(false), 200)
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPatient || loading) return

    const { token, role } = getAuthData()
    if (!token || role !== "doctor") {
      setError("Unauthorized access")
      return
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)
    setError(null)

    try {
      const response = await chatWithPatientHistory(
        {
          patient_id: selectedPatient.id,
          message: userMessage.content
        },
        { accessToken: token, role }
      )

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err: any) {
      setError(err?.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  // Handle getting patient summary
  const handleGetSummary = async () => {
    if (!selectedPatient || summaryLoading) return

    const { token, role } = getAuthData()
    if (!token || role !== "doctor") {
      setError("Unauthorized access")
      return
    }

    setSummaryLoading(true)
    setError(null)

    try {
      const summaryData = await summarizePatientHistory(
        selectedPatient.id,
        { accessToken: token, role }
      )
      setSummary(summaryData)
    } catch (err: any) {
      setError(err?.message || "Failed to get patient summary")
    } finally {
      setSummaryLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (patientsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading AI Chat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-500" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            AI assistant for doctors - chat about patient history and get intelligent insights
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection and Summary */}
        <div className="space-y-4">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardDescription>
                Choose a patient to chat about their history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="patient-search" className="mb-2">Search Patient</Label>
                  <div className="relative">
                    <Input
                      id="patient-search"
                      type="text"
                      placeholder="Search by ID, first name, or last name..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="pr-8"
                    />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    
                    {/* Custom Dropdown */}
                    {isDropdownOpen && filteredPatients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filteredPatients.slice(0, 50).map(patient => (
                          <div
                            key={patient.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="font-medium">
                              P{patient.id.toString().padStart(3, '0')} {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.email}
                            </div>
                          </div>
                        ))}
                        
                        {filteredPatients.length > 50 && (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center border-t">
                            Showing first 50 results. Continue typing to narrow search.
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {isDropdownOpen && searchTerm && filteredPatients.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50">
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No patients found matching "{searchTerm}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPatient && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h4>
                    <p className="text-sm text-blue-700">
                      ID: P{selectedPatient.id.toString().padStart(3, '0')}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedPatient.email}
                    </p>
                    {selectedPatient.contact_no && (
                      <p className="text-sm text-blue-700">
                        {selectedPatient.contact_no}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient Summary */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI Summary
                </CardTitle>
                <CardDescription>
                  Get an AI-generated summary of patient history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGetSummary}
                  disabled={summaryLoading}
                  className="w-full mb-4"
                >
                  {summaryLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generate Summary
                </Button>

                {summary && (
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Summary</h5>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {summary.summary}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat
                {selectedPatient && (
                  <Badge variant="secondary">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Ask questions about the patient's medical history, symptoms, or treatment options
              </CardDescription>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
                {!selectedPatient ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Select a patient to start chatting with AI</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Start a conversation about {selectedPatient.first_name}'s medical history</p>
                      <p className="text-sm mt-2">
                        Try asking: "What are the main concerns for this patient?" or "Summarize recent visits"
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : ''}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    selectedPatient 
                      ? "Ask about patient history, symptoms, or treatment recommendations..."
                      : "Select a patient first..."
                  }
                  disabled={!selectedPatient || loading}
                  className="resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedPatient || !inputMessage.trim() || loading}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}