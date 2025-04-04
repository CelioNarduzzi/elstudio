import { useEffect, useState } from "react"

function DateTimeFooter({ language = "fr", date_format = "DD/MM/YYYY", hour_format = "24h" }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getFormattedDate = () => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" }

    const date = new Intl.DateTimeFormat(language, options).format(currentTime)

    if (date_format === "YYYY-MM-DD") {
      const year = currentTime.getFullYear()
      const month = String(currentTime.getMonth() + 1).padStart(2, "0")
      const day = String(currentTime.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    return date // DD/MM/YYYY par défaut
  }


  return (
    <div className="fixed bottom-2 right-4 text-sm text-gray-600 bg-white bg-opacity-80 p-2 rounded shadow">
      <div>{getFormattedDate()}</div>
    </div>
  )
}

export default DateTimeFooter
