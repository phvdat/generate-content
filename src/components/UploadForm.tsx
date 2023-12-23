import { useForm } from 'react-hook-form'
import { Button } from '@apideck/components'
import React, { useState } from 'react'
import { sendMessage } from 'utils/sendMessage'
import * as XLSX from 'xlsx'
import { useLocalStorage } from 'usehooks-ts'

interface FormValue {
  apiKey: string
  file: FileList
}

const UploadForm = () => {
  const [processedData, setProcessedData] = useState<any[]>([])
  const [apiKeyLocal, setApiKeyLocal] = useLocalStorage('api-key', '')
  const { register, handleSubmit } = useForm<FormValue>({
    defaultValues: {
      apiKey: apiKeyLocal
    }
  })

  const processing = (file: any, apiKey: string) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = async (e) => {
        const bufferArray = e.target?.result
        const wb = XLSX.read(bufferArray, {
          type: 'buffer'
        })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        const processedData: any = []
        for (const row of data) {
          const rowData = row as any
          const question: string = rowData['Prompt 1']
          const { data } = await sendMessage(question, apiKey)
          const content = data?.choices?.[0]?.message?.content
          processedData.push({ ...rowData, ChatGPTcontent: content })
        }
        setProcessedData(processedData)
        resolve(processedData)
      }
      fileReader.onerror = (error) => {
        reject(error)
      }
    })
    promise.then(() => {
      // Handle further actions if needed
    })
  }

  const handleDownload = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(processedData)
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'processed_file.xlsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  const onSubmit = (data: any) => {
    const file = data.file[0]
    const apiKey = data.apiKey
    setApiKeyLocal(apiKey)
    if (file) {
      processing(file, apiKey)
    }
  }

  return (
    <div>
      <form className="flex flex-col w-96 m-auto gap-2 pt-4" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="API key" {...register('apiKey')} />
        <input type="file" {...register('file')} />
        {processedData.length > 0 && (
          <Button type="button" onClick={handleDownload}>
            Download
          </Button>
        )}
        <Button type="submit">Processing</Button>
      </form>
    </div>
  )
}

export default UploadForm
