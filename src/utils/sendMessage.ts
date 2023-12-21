export const sendMessage = async (messages: string, apiKey: string) => {
  try {
    const response = await fetch('/api/createMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages, apiKey })
    })

    return await response.json()
  } catch (error) {
    console.log(error)
  }
}
