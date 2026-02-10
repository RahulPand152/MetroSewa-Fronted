"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"

const OTP_LENGTH = 6

export default function OTPVerification() {
  const [state, setState] = useState<"idle" | "error" | "success">("idle")
  const [countdown, setCountdown] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!isResendDisabled) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isResendDisabled])

  const getCode = () => {
    let code = ""
    for (let i = 0; i < OTP_LENGTH; i++) {
      const input = document.getElementById(`input-${i}`) as HTMLInputElement
      if (input) code += input.value
    }
    return code
  }

  const verifyOTP = () => {
    const code = getCode()
    if (code.length < OTP_LENGTH) {
      setState("error")
      return
    }
    code === "123456" ? setState("success") : setState("error")
  }

  const handleInput = (e: any, index: number) => {
    if (!/^[0-9]$/.test(e.target.value)) {
      e.target.value = ""
      return
    }
    if (index < OTP_LENGTH - 1) {
      document.getElementById(`input-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e: any) => {
    e.preventDefault()
    const data = e.clipboardData.getData("text").slice(0, OTP_LENGTH)
    data.split("").forEach((char: string, i: number) => {
      const input = document.getElementById(`input-${i}`) as HTMLInputElement
      if (input && /^[0-9]$/.test(char)) input.value = char
    })
  }

  const handleResend = async () => {
    setIsResending(true)
    setCountdown(60)
    setIsResendDisabled(true)
    setState("idle")
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">

        {/* Brand */}
        <h1 className="text-center text-2xl font-bold tracking-wide mb-6">
          Metro <span className="text-blue-600">Sewa</span>
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-4">
          {state === "success" ? "Verification Successful" : "OTP Verification"}
        </h2>

        {state !== "success" && (
          <>
            <p className="text-center text-gray-500 text-sm mb-6">
              Enter the 6-digit code sent to your email
            </p>

            {/* OTP Inputs with dash after 3 digits */}
            <div className="flex justify-center items-center mb-6">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`input-${index}`}
                    type="text"
                    maxLength={1}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`w-10 h-12 sm:w-12 sm:h-14 mx-1 sm:mx-1.5
          text-center text-xl font-semibold rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${state === "error" ? "border-red-500" : "border-gray-300"}
        `}
                  />

                  {/* Dash separator after 3rd digit */}
                  {index === 2 && (
                    <span className="mx-3 sm:mx-4 text-xl font-semibold text-gray-500">
                      -
                    </span>
                  )}
                </div>
              ))}
            </div>


            {state === "error" && (
              <p className="text-center text-red-500 text-sm mb-3">
                Invalid OTP. Please try again.
              </p>
            )}

            {/* Bottom buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <Button
                onClick={verifyOTP}
                className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
              >
                Verify OTP
              </Button>

              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full sm:w-auto text-blue-600  flex items-center justify-center gap-2"
              >
                {isResending && <Spinner className="h-4 w-4 text-blue-600" />}
                Resend OTP
              </button>
            </div>
          </>
        )}

        {state === "success" && (
          <p className="text-center text-green-600 font-medium mt-6">
            OTP Verified Successfully
          </p>
        )}
      </div>
    </div>
  )
}


