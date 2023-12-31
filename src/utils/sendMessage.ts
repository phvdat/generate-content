function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const sendMessage = async (messages: string, apiKey: string) => {
  try {
    console.log('hello', new Date())
    const start = Date.now()
    const response = await fetch('/api/createMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages, apiKey })
    })
    const finish = Date.now()
    const time = finish - start
    await sleep(20000 - time)
    return await response.json()
  } catch (error) {
    console.log(error)
  }
}
