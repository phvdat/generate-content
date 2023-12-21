import { Button } from '@apideck/components'
import React, { ChangeEvent, useState } from 'react'
import { sendMessage } from 'utils/sendMessage'
import * as XLSX from 'xlsx'

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const UploadForm = () => {
  const [processedData, setProcessedData] = useState<any[]>([])
  const [apiKey, setApiKey] = useState('')
  const processing = (file: any) => {
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
        console.log(data)
        const processedData = await Promise.all(
          data.map(async (row: any) => {
            await sleep(30000)
            const question: string = row['Prompt 1']
            const { data } = await sendMessage(question, apiKey)
            console.log(data)
            const reply = data.message
            return { ...row, ChatGPTcontent: reply }
          })
        )
        setProcessedData(processedData)
        resolve(processedData)
      }
      fileReader.onerror = (error) => {
        reject(error)
      }
    })
    promise.then((d) => {
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

  return (
    <div>
      <form className="flex flex-col w-96 m-auto gap-2 pt-4">
        <input type="text" placeholder="API key" onChange={(e: any) => setApiKey(e.target.value)} />
        <input
          type="file"
          placeholder="Upload"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            processing(file)
          }}
        />
      </form>
      {processedData.length > 0 && (
        <Button onClick={handleDownload}>Download Processed File</Button>
      )}
    </div>
  )
}

export default UploadForm
