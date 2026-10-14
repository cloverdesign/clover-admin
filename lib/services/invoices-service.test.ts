import { afterEach, describe, expect, it } from "vitest"
import { apiClient } from "@/lib/api/client"
import { setToken, clearToken } from "@/lib/api/auth-storage"
import { InvoicesService } from "./invoices-service"

const originalAdapter = apiClient.defaults.adapter
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter
  clearToken()
})

describe("invoice PDF transport", () => {
  it.each(["preview", "download"] as const)(
    "fetches %s as an authenticated binary response",
    async (mode) => {
      setToken("test-admin-token")
      const pdf = new Blob(["pdf"], { type: "application/pdf" })
      apiClient.defaults.adapter = async (config) => {
        expect(config.url).toBe(`/api/invoices/inv1/pdf/${mode}`)
        expect(config.headers.Authorization).toBe("Bearer test-admin-token")
        expect(config.headers.Accept).toBe("application/pdf")
        expect(config.responseType).toBe("blob")
        return { data: pdf, status: 200, statusText: "OK", headers: {}, config }
      }
      expect(await InvoicesService.pdf("inv1", mode)).toBe(pdf)
    }
  )

  it("rejects non-PDF responses rather than displaying them as a document", async () => {
    apiClient.defaults.adapter = async (config) => ({
      data: new Blob(["{}"], { type: "application/json" }),
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })
    await expect(InvoicesService.pdf("inv1", "preview")).rejects.toThrow(
      "did not return a PDF"
    )
  })
})
