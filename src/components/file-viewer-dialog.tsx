"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

// Load PDF.js from CDN
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface FileViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  file: { url: string; mimeType: string } | null
}

export function FileViewerDialog({ isOpen, onClose, file }: FileViewerDialogProps) {
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    // Load PDF.js script
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    script.onload = () => {
      // Set worker source after script loads
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (isOpen && file?.mimeType === "application/pdf" && window.pdfjsLib) {
      loadPdf(file.url)
    }
  }, [isOpen, file])

  const loadPdf = async (url: string) => {
    try {
      const loadingTask = window.pdfjsLib.getDocument(url)
      const pdf = await loadingTask.promise
      setTotalPages(pdf.numPages)

      const pages: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })

        // Create a canvas element
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }

          await page.render(renderContext).promise
          pages.push(canvas.toDataURL())
        }
      }
      setPdfPages(pages)
    } catch (error) {
      console.error("Error loading PDF:", error)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {file?.mimeType.startsWith("image/") ? (
              <img
                src={file.url}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            ) : file?.mimeType === "application/pdf" ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {pdfPages[currentPage - 1] ? (
                    <img
                      src={pdfPages[currentPage - 1]}
                      alt={`Page ${currentPage}`}
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 