import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'

interface FileImportProps {
  onFileSelect: (file: File) => void
  accept?: string
  buttonText?: string
  className?: string
}

export function FileImport({ 
  onFileSelect, 
  accept = '.csv,.xlsx,.json', 
  buttonText = 'Import File',
  className = ''
}: FileImportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setIsSuccess(true)
    onFileSelect(file)
    
    // Reset success state after 2 seconds
    setTimeout(() => setIsSuccess(false), 2000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = handleFileInputChange
    input.click()
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all
          ${isDragging 
            ? 'border-blue-400 bg-blue-50 text-blue-700' 
            : isSuccess
            ? 'border-green-400 bg-green-50 text-green-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        {isSuccess ? (
          <>
            <Check className="h-4 w-4" />
            File Selected!
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {buttonText}
          </>
        )}
      </button>
      
      {selectedFile && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600 whitespace-nowrap z-10">
          {selectedFile.name}
        </div>
      )}
    </div>
  )
}
